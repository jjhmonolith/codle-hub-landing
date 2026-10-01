#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""내부 증거 조사 산출물 검증.

검사 항목
1. evidence-extracts.csv / budget-trigger-evidence.csv / approval-evidence-inventory.csv 의
   모든 source_id 가 source-register.csv 에 존재하는가
2. source-register.csv 에 등록됐지만 어디에서도 인용되지 않은 source 가 있는가 (경고)
3. P-001~P-006 이 coverage-and-gaps.md 의 matrix 에 모두 존재하는가
4. 같은 event 가 중복 집계되지 않았는가 (event_id + source_id + 인용문 중복)
5. exact_quote 가 비어 있는 항목을 A/B 등급 직접 증거로 쓰지 않았는가
6. AIDT 를 코들 직접 판매/직접 견적으로 적은 곳이 없는가
7. 콘텐츠 이용권 단독 구매 가능 문구가 생성되지 않았는가
8. 공개 승인되지 않은 가격·성과가 랜딩 권고 문장에 쓰이지 않았는가
9. budget-trigger-evidence.csv 의 amount_publicly_approved 가 모두 no 인가

실행:
    python3 discovery-pack/02-research/internal-evidence-scan/validate_internal_scan.py
"""
from __future__ import annotations

import csv
import re
import sys
from pathlib import Path

BASE = Path(__file__).resolve().parent

SOURCE_REGISTER = BASE / "source-register.csv"
EXTRACTS = BASE / "evidence-extracts.csv"
BUDGET = BASE / "budget-trigger-evidence.csv"
APPROVAL = BASE / "approval-evidence-inventory.csv"
COVERAGE = BASE / "coverage-and-gaps.md"

MARKDOWN_FILES = [
    "00-search-log.md",
    "buying-group-jtbd.md",
    "offering-vocabulary-findings.md",
    "commercial-routing-findings.md",
    "coverage-and-gaps.md",
    "research-synthesis.md",
]

OFFERINGS = ["P-001", "P-002", "P-003", "P-004", "P-005", "P-006"]

errors: list[str] = []
warnings: list[str] = []


def read_rows(path: Path) -> list[dict[str, str]]:
    if not path.exists():
        errors.append(f"파일 없음: {path.name}")
        return []
    with path.open(encoding="utf-8", newline="") as fh:
        return list(csv.DictReader(fh))


def split_ids(raw: str) -> list[str]:
    return [part.strip() for part in re.split(r"[;,]", raw or "") if part.strip()]


sources = read_rows(SOURCE_REGISTER)
extracts = read_rows(EXTRACTS)
budget = read_rows(BUDGET)
approval = read_rows(APPROVAL)

source_ids = {row["source_id"] for row in sources}
cited_ids: set[str] = set()

# --- 1. source_id 연결 -------------------------------------------------------
for row in extracts:
    for sid in split_ids(row["source_id"]):
        cited_ids.add(sid)
        if sid not in source_ids:
            errors.append(f"[1] {row['extract_id']} 의 source_id {sid} 가 source-register 에 없음")

for row in budget:
    for sid in split_ids(row["source_ids"]):
        cited_ids.add(sid)
        if sid not in source_ids:
            errors.append(f"[1] budget {row['event_id']} 의 source_id {sid} 가 source-register 에 없음")

for row in approval:
    for sid in split_ids(row["source_ids"]):
        cited_ids.add(sid)
        if sid not in source_ids:
            errors.append(
                f"[1] approval {row['offering_id']}/{row['buying_role']} 의 source_id {sid} 가 source-register 에 없음"
            )

# --- 2. 미인용 source --------------------------------------------------------
for sid in sorted(source_ids - cited_ids):
    warnings.append(f"[2] {sid} 는 등록됐으나 어느 산출물에서도 인용되지 않음")

# --- 3. coverage matrix 에 P-001~P-006 -------------------------------------
coverage_text = COVERAGE.read_text(encoding="utf-8") if COVERAGE.exists() else ""
if not coverage_text:
    errors.append("[3] coverage-and-gaps.md 를 읽지 못함")
else:
    matrix_block = coverage_text.split("## 2. 상품 × 질문 coverage matrix", 1)
    matrix_block = matrix_block[1].split("## 3.", 1)[0] if len(matrix_block) > 1 else ""
    for pid in OFFERINGS:
        if pid not in matrix_block:
            errors.append(f"[3] coverage matrix 에 {pid} 없음")

# --- 4. event 중복 집계 ------------------------------------------------------
seen_pairs: dict[tuple[str, str, str], str] = {}
for row in extracts:
    key = (row["event_id"], row["source_id"], row["exact_quote"].strip()[:80])
    if key in seen_pairs:
        errors.append(
            f"[4] {row['extract_id']} 가 {seen_pairs[key]} 와 같은 event/source/인용문을 중복 집계"
        )
    seen_pairs[key] = row["extract_id"]

# 같은 event 가 서로 다른 institution_type 을 갖는지 (묶기 오류 탐지)
by_event: dict[str, set[str]] = {}
for row in extracts:
    by_event.setdefault(row["event_id"], set()).add(row["institution_type"])
for event_id, kinds in by_event.items():
    if len(kinds) > 1:
        warnings.append(f"[4] {event_id} 에 institution_type 이 {len(kinds)}종: {sorted(kinds)}")

# --- 5. exact_quote 없는 직접 증거 -------------------------------------------
for row in extracts:
    if not row["exact_quote"].strip() and row["evidence_grade"].startswith(("A-", "B-")):
        errors.append(f"[5] {row['extract_id']} 는 인용문이 없는데 {row['evidence_grade']} 등급")
    if row["evidence_grade"].startswith("D-"):
        errors.append(f"[5] {row['extract_id']} 는 D-hypothesis 인데 extract 로 채택됨")

# --- 6. AIDT 를 코들 직접 판매로 적었는가 ------------------------------------
AIDT_FORBIDDEN = [
    re.compile(r"AIDT[^\n。]{0,40}(코들|Codle|Team Monolith)[^\n]{0,30}직접\s*(판매|견적)"),
    re.compile(r"(코들|Codle|Team Monolith)[^\n]{0,30}(가|이|은|는)?\s*AIDT[^\n]{0,30}직접\s*(판매|견적)"),
    re.compile(r"AIDT[^\n]{0,40}코들\s*(견적|구매)\s*(CTA|버튼)\s*(을|를)?\s*(붙인다|연결한다|사용한다)"),
]

# --- 7. 콘텐츠 단독 구매 가능 문구 -------------------------------------------
STANDALONE_FORBIDDEN = [
    re.compile(r"(콘텐츠\s*이용권|오리지널\s*콘텐츠|씨마스[^\n]{0,10}(기초|플랜|이용권))[^\n]{0,40}단독\s*구매\s*(가능|할\s*수\s*있)"),
    re.compile(r"Pro\s*(라이선스)?\s*없이[^\n]{0,30}(구매|구입)\s*(가능|할\s*수\s*있)"),
    re.compile(r"콘텐츠[^\n]{0,20}만\s*(따로|별도로)?\s*(구매|구입)\s*(가능|할\s*수\s*있)"),
]

# --- 8. 미승인 가격·성과의 권고 사용 -----------------------------------------
RECOMMEND_HINT = re.compile(r"(권고|원칙|반영 가능|해야 한다|배치한다|노출한다|표기한다|사용한다)")
PRICE_HINT = re.compile(r"(\d{1,3}(,\d{3})+\s*원|\d+\s*만원|\d{1,3}\s*%)")

# 금지 표현을 부정하거나 금지하는 문장은 위반이 아니다.
NEGATION = re.compile(
    r"(하지\s*않|않았|않는다|없다|없음|아니다|아님|금지|말아야|말라|마라|안\s*된다|"
    r"어긋|오해|위험|잘못|복원하지|붙이면\s*안|기술한\s*곳이\s*없)"
)


def flagged(line: str, pattern: re.Pattern[str]) -> bool:
    """패턴에 걸리되 같은 줄에서 부정되지 않은 경우에만 True."""
    return bool(pattern.search(line)) and not NEGATION.search(line)


for name in MARKDOWN_FILES:
    path = BASE / name
    if not path.exists():
        errors.append(f"[6-8] 산출물 없음: {name}")
        continue
    text = path.read_text(encoding="utf-8")
    for lineno, line in enumerate(text.splitlines(), start=1):
        stripped = line.strip()
        if not stripped or stripped.startswith(("|---", ">")):
            continue
        for pat in AIDT_FORBIDDEN:
            if flagged(line, pat):
                errors.append(f"[6] {name}:{lineno} AIDT 를 코들 직접 판매로 기술한 것으로 보임: {stripped[:80]}")
        for pat in STANDALONE_FORBIDDEN:
            if flagged(line, pat):
                errors.append(f"[7] {name}:{lineno} 콘텐츠 단독 구매 가능 문구: {stripped[:80]}")

    # 8: 랜딩 권고 절 안에서 미승인 수치가 근거 없이 쓰였는지
    for header in ("## 9. 랜딩 구조에 반영 가능한 근거 있는 원칙",):
        if header in text:
            block = text.split(header, 1)[1].split("\n## ", 1)[0]
            for lineno, line in enumerate(block.splitlines(), start=1):
                if PRICE_HINT.search(line) and RECOMMEND_HINT.search(line):
                    if "괴리" not in line and "승인" not in line and "노출하지" not in line:
                        errors.append(
                            f"[8] {name} 랜딩 권고 절에서 미승인 수치를 권고에 사용한 것으로 보임: {line.strip()[:90]}"
                        )

# --- 9. amount_publicly_approved -------------------------------------------
for row in budget:
    if row["amount_publicly_approved"].strip().lower() != "no":
        errors.append(
            f"[9] budget {row['event_id']} 의 amount_publicly_approved 가 no 가 아님: {row['amount_publicly_approved']}"
        )

# --- 통계 --------------------------------------------------------------------
grades: dict[str, int] = {}
for row in extracts:
    grades[row["evidence_grade"]] = grades.get(row["evidence_grade"], 0) + 1

offering_hits: dict[str, int] = {pid: 0 for pid in OFFERINGS}
offering_events: dict[str, set[str]] = {pid: set() for pid in OFFERINGS}
for row in extracts:
    for pid in split_ids(row["offering_id"]):
        if pid in offering_hits:
            offering_hits[pid] += 1
            offering_events[pid].add(row["event_id"])
        else:
            errors.append(f"[통계] {row['extract_id']} 의 offering_id {pid} 는 P-001~P-006 밖")

platforms: dict[str, int] = {}
for row in sources:
    platforms[row["platform"]] = platforms.get(row["platform"], 0) + 1

print("=" * 68)
print("internal evidence scan validation")
print("=" * 68)
print(f"sources={len(sources)} extracts={len(extracts)} "
      f"events={len({r['event_id'] for r in extracts})} "
      f"budget_events={len(budget)} approval_rows={len(approval)}")
print("platform: " + " ".join(f"{k}={v}" for k, v in sorted(platforms.items())))
print("grades:   " + " ".join(f"{k}={v}" for k, v in sorted(grades.items())))
print("offering: " + " ".join(
    f"{pid}(extract={offering_hits[pid]},event={len(offering_events[pid])})" for pid in OFFERINGS))
print("-" * 68)

for warning in warnings:
    print("WARN " + warning)

if errors:
    print("-" * 68)
    for err in errors:
        print("FAIL " + err)
    print("-" * 68)
    print(f"FAIL internal evidence scan ({len(errors)} error, {len(warnings)} warning)")
    sys.exit(1)

print(f"PASS internal evidence scan (0 error, {len(warnings)} warning)")
sys.exit(0)
