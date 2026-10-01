# Claude Code 작업 프롬프트 — Codle Hub Slack·Notion 내부 증거 조사

아래 프로젝트에서 작업해라.

`/Users/jonghyunjun/AIworkspace/codle hub landing 2608 new`

## 0. 작업 목적

사람을 새로 인터뷰할 시간은 없다. 대신 현재 Claude Code에 연결된 Slack과 Notion MCP/커넥터를 실제로 사용해, Codle 상품 허브 설계에 필요한 구매그룹·구매 계기·예산·승인 증거·상품 표현·판매 경로 정보를 기존 내부 기록에서 찾아라.

이 작업의 목적은 예쁜 요약문을 만드는 것이 아니라 다음 판단을 근거와 함께 가능하게 만드는 것이다.

1. 기존 고객이 코들을 실제로 어떤 범위의 공급자로 인식했는가?
2. 어떤 상황에서 라이선스 외 상품을 추가로 찾거나 구매했는가?
3. 상품별 구매 제안자·영향자·승인자·계약/행정 담당·운영자는 누구였는가?
4. 어떤 예산·사업·시기에 구매가 시작되거나 보류됐는가?
5. 내부 승인에 어떤 자료·견적·사례·운영 정보가 필요했는가?
6. 각 상품을 고객과 내부 구성원이 실제로 어떤 이름과 표현으로 불렀는가?
7. Pro 필수 콘텐츠와 AIDT 출판사 판매 구조를 화면에서 어떻게 설명·분기해야 하는가?
8. “코들이 이런 것도 하네”, “남은 예산으로 도입할 수 있겠다”에 해당하는 실제 증거가 있는가?

## 1. 먼저 읽을 프로젝트 정본

반드시 다음 순서로 읽어라.

1. `SESSION-HANDOFF.md`
2. `discovery-pack/00-charter/gate-0-status.md`
3. `discovery-pack/01-evidence/product-inventory.csv`
4. `discovery-pack/01-evidence/commercial-relationships.csv`
5. `discovery-pack/01-evidence/claim-ledger.json`
6. `discovery-pack/02-research/offering-discovery-matrix.csv`
7. `discovery-pack/02-research/buying-group-research-plan.md`
8. `discovery-pack/03-strategy/perception-shift-framework.md`

기존 `/Users/jonghyunjun/AIworkspace/codle-landing-plan/design-source-pack/`은 `reference only`다. 그 안의 구조·카피·가격·데이터를 사실로 승계하지 마라.

R-013의 `콘텐츠 이용권 단독 구매 가능` 해석은 폐기됐다. C-016/C-017은 `prohibited`다. 이 관계를 어떤 경우에도 복원하지 마라.

현재 승인된 핵심 상업 관계:

- 오리지널·씨마스 콘텐츠 이용권은 단독 구매 불가
- 콘텐츠 이용권 구매에는 Pro 라이선스 필수
- AI 집중캠프와 바이브코딩 해커톤은 서로 다른 최상위 상품
- 짓다 플랫폼은 바이브코딩 해커톤의 하위 구성
- 코들 라이선스·오리지널 콘텐츠·씨마스·AI 집중캠프·바이브코딩 해커톤은 Team Monolith/Codle 직접 판매
- AIDT 교육자료는 각 출판사가 판매·수납하고 이후 Team Monolith/Codle에 정산
- Team Monolith/Codle은 AIDT 고객에게 직접 견적·판매하지 않음

## 2. 도구 확인

1. 먼저 현재 Claude Code에서 사용 가능한 MCP 서버와 도구를 확인해라.
2. Slack과 Notion 커넥터가 있으면 실제 검색을 수행해라.
3. 이름이 예상과 달라도 `slack`, `notion`, `search`, `messages`, `pages`, `databases`와 관련된 MCP 도구를 찾아 사용해라.
4. 커넥터가 보이지 않거나 권한 오류가 나면 추측으로 결과를 만들지 말고, 정확히 어떤 서버/권한이 빠졌는지 기록한 뒤 가능한 쪽만 계속 진행해라.
5. `--bare` 모드는 MCP와 프로젝트 문맥을 건너뛸 수 있으므로 사용하지 마라.

## 3. 조사 범위

### 상품·별칭 검색어

검색어를 한 번만 쓰지 말고 한글·영문·약어·과거 표현을 조합해 반복 검색해라.

- 코들, Codle, 라이선스, Basic, 베이직, Pro, 프로
- 코들 AI, Codle AI, AI 콘텐츠, 콘텐츠 이용권, 오리지널 콘텐츠, Pro 콘텐츠
- 씨마스, CMASS, 인공지능 기초, 인기초
- AIDT, AI 디지털교과서, AI 디지털 교육자료, 디지털 교육자료, YBM, 출판사
- AI 집중캠프, AI 캠프, 인공지능 캠프, 창의도전 캠프
- 바이브코딩, 바이브 코딩, 해커톤, 대회, 짓다, Jitda

### 구매·예산·승인 검색어

상품 검색어와 아래 단어를 조합해라.

- 견적, 견적서, 가격, 단가, 할인, 계약, 구매, 도입, 갱신, 추가 구매
- 예산, 남은 예산, 잔여 예산, 사업비, 학교 예산, 교육청 예산
- 품의, 결재, 승인, 행정실, 조달, 발주, 계약서, 세금계산서, 정산
- 교사, 정보부장, 교과부장, 부장, 교감, 교장, 관리자, 행정실
- 장학사, 교육청, 교육지원청, 담당자, 출판사, 영업, PM
- 보류, 반대, 취소, 실패, 미도입, 미계약, 예산 부족, 일정 부족
- 제안서, 소개서, 공문, 사례, 레퍼런스, 운영안, 일정표, 결과보고서

### 검색 기간

- 우선 최근 24개월을 조사해라.
- 상품 운영 사례·계약 구조의 기원을 확인해야 할 때만 더 과거로 확장해라.
- 모든 증거에 작성일 또는 메시지 시각을 기록해라.
- 오래된 정보는 `historical`로 표시하고 현재 정책처럼 쓰지 마라.

## 4. 상품별로 반드시 찾아야 할 것

각 상품마다 아래 필드를 채울 수 있는 증거를 찾아라. 없으면 `not found`가 아니라 `검색한 위치와 검색어에서는 확인되지 않음`으로 기록해라.

### 공통

- 실제 고객/기관 유형
- 실제 사용된 상품명·별칭
- 최초 구매/검토 계기
- 정확한 사업명·예산명·예산 상황
- 구매 검토·계약·운영 시기
- 제안자
- 영향자
- 승인자
- 계약·품의·지불 담당
- 실제 운영자
- 반대·보류·실패 이유
- 내부 승인에 요구된 자료
- 공급 범위와 고객 준비사항
- 가격/견적을 바꾸는 변수
- 실제 문의·판매 경로
- 고객의 직접 표현 또는 이를 기록한 원문

### 코들 라이선스

- Basic 시작과 Pro 전환 계기
- 갱신·인원 확대·학교 단위 계약 계기
- Pro 구매에 필요했던 기능·증거·행정 정보

### 코들 오리지널 콘텐츠

- 라이선스 고객이 콘텐츠를 추가 검토한 계기
- Pro 콘텐츠와 유료 콘텐츠 이용권을 실제로 어떻게 구분해 말했는지
- 콘텐츠 목록·갱신·수업 활용 정보 중 무엇을 요구했는지

### 씨마스 인공지능 기초

- 교재·학년·단원·수업 진도와 연결된 구매 계기
- 씨마스 이름/표지/교재/파트너 권리 관련 논의
- Pro 필수 관계와 실제 판매 설명

### AIDT 교육자료

- 출판사별 공식 상품명과 중·고등 구분
- 교사용/학생용 URL 또는 체험 경로
- 출판사가 고객에게 판매·수납하는 실제 흐름
- 코들에 정산하는 흐름과 담당 역할
- 고객 문의가 출판사로 가야 하는지, 코들이 1차 안내만 하는지
- 출판사별 상품 자산·로고·교재 이미지 사용 권리

AIDT를 코들 직접 견적 상품으로 정규화하지 마라.

### AI 집중캠프

- 해커톤과 구분되는 실제 목적·구성·산출물
- 학교형/교육청형 범위
- 대상·인원·기간·강사·장소·장비·사전교육 등 견적 변수
- 제안·승인·운영에 필요했던 문서

### 바이브코딩 해커톤

- 캠프와 구분되는 대회·심사·발표·결과물 공개 요소
- 짓다 플랫폼의 실제 역할
- 학교형/교육청형 범위
- 대상·인원·기간·심사·시상·식사/간식·현장 운영 등 견적 변수
- 제안·승인·운영에 필요했던 문서

## 5. 증거 채택 규칙

### 반드시 보존할 출처 정보

Slack 항목마다:

- workspace/채널명
- thread 또는 message permalink
- 작성자 이름 또는 역할
- 작성 시각
- 원문 인용
- 앞뒤 문맥 요약
- 고객 직접 발언인지 내부 구성원의 요약인지

Notion 항목마다:

- 페이지 제목
- 페이지 URL 또는 page ID
- 작성/수정일
- 작성자 또는 담당 조직(확인 가능한 경우)
- 정확한 heading/block 위치
- 원문 인용
- 문서 성격: 회의록/운영안/견적 메모/회고/영업 기록/정책 문서 등

### 증거 등급

각 extract에 다음 중 하나를 부여해라.

- `A-direct`: 고객·파트너·owner의 직접 발언 또는 원문 계약/견적/회의 기록
- `B-near-direct`: 고객 미팅 직후 작성된 구체적 회의록·영업 기록
- `C-internal-summary`: 내부 구성원의 요약·회고
- `D-hypothesis`: 아이디어·계획·추정·미검증 주장

D-hypothesis는 결론 근거로 사용하지 마라.

### 중복 제거

- 같은 고객 사건이 Slack, Notion, 회의록에 반복되면 독립 증거 여러 건으로 세지 마라.
- 하나의 `event_id`로 묶고 원천만 여러 개 연결해라.
- 동일 문구의 복사본·자동 알림·링크 미리보기는 제거해라.

### 안전·정확성

- 고객/파트너의 전화번호, 개인 이메일, 학생 이름, 계약 계좌, 비밀키 등 불필요한 개인정보·비밀정보를 산출물에 복사하지 마라.
- 사람 이름이 분석에 필요하지 않으면 역할명으로 비식별화해라.
- Slack/Notion에서 발견됐다는 이유만으로 공개 사용 권리나 최신성을 승인하지 마라.
- 가격·성과·기관명·사진·로고·인증은 별도 owner/권리 승인 전까지 `pending`이다.
- 원문에서 확인되지 않은 빈칸을 상식으로 채우지 마라.
- Slack 검색 결과가 없다고 “그런 논의가 없었다”고 단정하지 마라.

## 6. 필요한 산출물

다음 폴더를 만들고 그 아래에만 새 조사 산출물을 작성해라.

`discovery-pack/02-research/internal-evidence-scan/`

### 1) `00-search-log.md`

- 사용한 Slack/Notion 도구
- 검색 범위와 기간
- 실제 검색어 조합
- 접근하지 못한 채널/페이지/권한
- 각 검색의 결과 수 또는 유효 결과 유무
- 재시도와 query 확장 기록

### 2) `source-register.csv`

컬럼:

```text
source_id,platform,source_type,title_or_channel,url_or_id,author_or_role,created_at,updated_at,accessed_at,evidence_grade,notes
```

### 3) `evidence-extracts.csv`

컬럼:

```text
extract_id,event_id,offering_id,platform,source_id,source_locator,occurred_at,actor_role,institution_type,exact_quote,context_summary,evidence_grade,fact_or_interpretation,topic,privacy_redactions,confidence,needs_owner_review
```

`offering_id`는 P-001~P-006을 사용하고 여러 상품이면 세미콜론으로 연결해라.

### 4) `buying-group-jtbd.md`

역할별로 다음 표를 작성해라.

```text
역할 | 실제 시작 상황 | 해야 할 일(JTBD) | 반대/보류 이유 | 필요한 증거 | 실제 source IDs | 확신도
```

제안자→영향자→승인자→계약/지불→운영 흐름을 실제 event 기준으로 재구성해라.

### 5) `budget-trigger-evidence.csv`

컬럼:

```text
event_id,offering_id,budget_or_project_name_exact,budget_situation,timing,procurement_or_contract_path,amount_observed,amount_publicly_approved,source_ids,evidence_grade,limitations
```

금액을 발견해도 `amount_publicly_approved`는 owner 승인 receipt가 없으면 `no`로 둬라.

### 6) `approval-evidence-inventory.csv`

컬럼:

```text
offering_id,buying_role,approval_question,artifact_or_evidence_needed,observed_or_inferred,source_ids,priority,landing_implication
```

### 7) `offering-vocabulary-findings.md`

상품별로:

- 실제 사용 명칭·별칭
- 고객 표현과 내부 표현의 차이
- 혼동되는 상품 관계
- 최상위 카드/탐색 label 후보
- 아직 공개 카피로 쓰면 안 되는 표현
- source IDs

### 8) `commercial-routing-findings.md`

반드시 다음을 분리해라.

- Team Monolith/Codle 직접 판매 5개 상품의 실제 문의 흐름
- AIDT의 출판사 판매·수납 흐름
- Pro 필수 콘텐츠 구매 흐름
- 확인된 이메일/폼/담당 채널
- 확인되지 않은 endpoint
- 허브 CTA routing에 주는 시사점

### 9) `coverage-and-gaps.md`

각 연구 질문을 다음 상태로 평가해라.

- `supported`: A/B 등급의 독립 event 2건 이상
- `single-source`: A/B 등급 event 1건
- `weak`: C 등급만 존재
- `not-covered`: 접근 가능한 검색 결과에서 확인하지 못함
- `conflicting`: 원천 간 충돌

상품×질문 coverage matrix를 만들고, 추가 인터뷰 없이도 owner에게 5분 안에 물어볼 수 있는 `최소 확인 질문`만 마지막에 최대 10개 제시해라.

### 10) `research-synthesis.md`

다음 순서로 작성해라.

1. 조사 범위와 한계
2. 기존 고객의 실제 코들 인식
3. 소프트웨어 외 상품 발견/교차판매 증거
4. 역할별 구매 흐름
5. 상품별 구매 trigger·예산·시기
6. 내부 승인에 필요한 증거
7. 상품 vocabulary와 오해
8. AIDT·Pro 콘텐츠 routing
9. 랜딩 구조에 반영 가능한 근거 있는 원칙
10. 아직 결정하면 안 되는 것

모든 주요 문장 끝에 `[source: S-### / E-###]` 형식으로 출처를 붙여라.

## 7. 기존 정본 수정 제한

이번 실행에서는 다음 기존 정본을 직접 수정하지 마라.

- `claim-ledger.json`
- `product-inventory.csv`
- `commercial-relationships.csv`
- `offering-discovery-matrix.csv`
- `gate-0-status.md`
- 기존 receipt 파일

Slack/Notion 조사 결과는 먼저 `internal-evidence-scan/`에 분리 보존한다. 기존 정본에 반영할 후보는 `coverage-and-gaps.md`의 `Owner 승인 후보` 섹션에만 제안해라.

## 8. 품질 검증

완료 전에 반드시 검증해라.

1. 모든 source_id와 extract source_id가 연결되는지 검사
2. 모든 P-001~P-006이 coverage matrix에 존재하는지 검사
3. 같은 event 중복 집계가 없는지 검사
4. exact_quote가 없는 항목을 직접 증거처럼 쓰지 않았는지 검사
5. AIDT를 코들 직접 판매로 잘못 적은 곳이 없는지 검색
6. 콘텐츠 단독 구매 가능 문구가 생성되지 않았는지 검색
7. 공개 승인되지 않은 가격·성과를 랜딩 권고로 사용하지 않았는지 검사
8. 가능하면 간단한 Python 검증 스크립트를 `internal-evidence-scan/validate_internal_scan.py`로 만들고 실행
9. 기존 Gate 0 검증도 다시 실행

```bash
python3 discovery-pack/scripts/validate_gate0.py
python3 discovery-pack/scripts/validate_offering_matrix.py
```

## 9. 작업 종료 보고 형식

작업을 멈추기 전에 실제로 Slack과 Notion을 검색했는지 확인하고, 다음만 간결하게 보고해라.

1. 사용한 커넥터와 접근 범위
2. 검색한 Slack 메시지/thread 수와 Notion 페이지 수
3. 중복 제거 후 유효 event 수
4. 상품별 evidence coverage 요약
5. 가장 중요한 구매그룹·예산·승인 증거 5개
6. AIDT/Pro routing 결론
7. 생성한 파일의 절대 경로
8. 검증 명령의 실제 출력
9. 접근 권한 때문에 남은 공백

실제 검색을 하지 못했다면 그럴듯한 결과를 만들지 마라. 어떤 MCP/권한이 필요한지 정확히 적고 종료해라.
