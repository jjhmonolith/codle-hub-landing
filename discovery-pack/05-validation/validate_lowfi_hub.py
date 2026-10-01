#!/usr/bin/env python3
"""Validate Codle low-fidelity hub contract and prototype."""
from __future__ import annotations

import csv
import json
import re
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CLAIMS = ROOT / "01-evidence" / "claim-ledger.json"
MATRIX = ROOT / "02-research" / "offering-discovery-matrix.csv"
CONTRACT = ROOT / "03-strategy" / "page-contract.md"
LOWFI = ROOT / "04-design-contract" / "low-fidelity-hub-structure.md"
REGISTER = ROOT / "01-evidence" / "receipts" / "receipt-register.csv"
HTML = ROOT.parent / "archive/design-history-2026-09-30" / "prototypes" / "low-fi-hub" / "index.html"

errors: list[str] = []
warnings: list[str] = []

def require(condition: bool, message: str) -> None:
    if not condition:
        errors.append(message)

claim_data = json.loads(CLAIMS.read_text(encoding="utf-8"))
claims = {c["claim_id"]: c for c in claim_data["claims"]}
contract = CONTRACT.read_text(encoding="utf-8")
lowfi = LOWFI.read_text(encoding="utf-8")
html = HTML.read_text(encoding="utf-8")
register = REGISTER.read_text(encoding="utf-8")

class VisibleTextParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.skip_depth = 0
        self.parts: list[str] = []
    def handle_starttag(self, tag: str, attrs) -> None:
        if tag in {"style", "script"}:
            self.skip_depth += 1
    def handle_endtag(self, tag: str) -> None:
        if tag in {"style", "script"} and self.skip_depth:
            self.skip_depth -= 1
    def handle_data(self, data: str) -> None:
        if not self.skip_depth:
            self.parts.append(data)

text_parser = VisibleTextParser()
text_parser.feed(html)
visible_text = " ".join(text_parser.parts)

# Receipt and strategy claims.
require("R-016" in register, "R-016 missing from receipt register")
for cid in [f"C-{n:03d}" for n in range(25, 35)]:
    require(cid in claims, f"missing claim {cid}")
    if cid in claims:
        require(claims[cid]["status"] == "approved", f"{cid} is not approved")

# Every claim referenced in page contract must exist and be approved.
refs = set(re.findall(r"C-\d{3}", contract))
for cid in sorted(refs):
    require(cid in claims, f"page contract references unknown {cid}")
    if cid in claims:
        require(claims[cid]["status"] == "approved", f"page contract references non-approved {cid}")

# Section contract completeness.
for i in range(1, 9):
    require(f"HUB-{i:02d}" in contract, f"page contract missing HUB-{i:02d}")
    require(f"HUB-{i:02d}" in lowfi, f"low-fi structure missing HUB-{i:02d}")

# Matrix must carry the owner approval.
with MATRIX.open(encoding="utf-8", newline="") as f:
    rows = list(csv.DictReader(f))
require(len(rows) == 6, f"expected 6 matrix rows, got {len(rows)}")
for row in rows:
    require("R-016" in row["receipt_ids"].split(";"), f"{row['offering_id']} missing R-016")
    require(row["evidence_status"] == "owner-approved-research-partial", f"{row['offering_id']} unexpected evidence_status")

# Prototype inventory and routing.
offerings = [
    "코들 라이선스",
    "코들 오리지널 콘텐츠",
    "씨마스 인공지능 기초",
    "AIDT 교육자료",
    "AI 집중캠프",
    "바이브코딩 해커톤",
]
for name in offerings:
    require(name in html, f"prototype missing offering: {name}")
for pid in [f"p00{i}" for i in range(1, 7)]:
    require(f'id="{pid}"' in html, f"prototype missing card {pid}")
require(len(re.findall(r'<article class="card"', html)) == 6, "prototype must contain exactly six offering cards")

# Direct-sale form contains exactly five offerings and no AIDT.
form_block = html.split('<form id="inquiry-form"', 1)[1].split('</form>', 1)[0]
form_values = re.findall(r'name="offering" value="([^"]+)"', form_block)
require(set(form_values) == {"license", "original", "cmass", "camp", "hackathon"}, f"unexpected inquiry offerings: {form_values}")
require("AIDT 교육자료" not in form_block, "AIDT must not be an inquiry checkbox")
aidt_card = html.split('id="p004"', 1)[1].split('</article>', 1)[0]
require("select-offering" not in aidt_card, "AIDT card must not have direct-sale selection")
require("코들이 만들고 각 출판사가 판매합니다." in html, "approved AIDT explanation missing")
require("내부 검토용 견적 문의" in html, "approved CTA copy missing")

# Guardrails: no public numeric price/discount/case claims in prototype.
for pattern, label in [
    (r"\d[\d,]*\s*원", "won price"),
    (r"\d+(?:\.\d+)?\s*%", "percentage"),
    (r"750\+|50%|72%|84%", "unapproved performance claim"),
]:
    if re.search(pattern, visible_text):
        errors.append(f"prototype contains {label}")
for prohibited in [
    "콘텐츠 이용권은 단독 구매할 수 있습니다",
    "AIDT 견적 문의",
    "AI∙디지털<br>교육자료",
    "학교형 패키지",
    "교육청형 패키지",
]:
    require(prohibited not in html, f"prototype contains prohibited phrase: {prohibited}")

# Minimum interactive hooks and form states.
for hook in ["data-filter", "select-offering", "aria-expanded", "inquiry-form", "form-status"]:
    require(hook in html, f"prototype missing interactive hook: {hook}")
require("event.preventDefault()" in html, "prototype form must not submit to a real endpoint")

print("=" * 68)
print("Codle low-fi hub validation")
print("=" * 68)
print(f"claims={len(claims)} contract_claim_refs={len(refs)} matrix_rows={len(rows)}")
print(f"prototype_cards=6 inquiry_offerings={len(form_values)}")
for w in warnings:
    print(f"WARN {w}")
if errors:
    for e in errors:
        print(f"ERROR {e}")
    raise SystemExit(1)
print("PASS low-fi hub contract and prototype")
