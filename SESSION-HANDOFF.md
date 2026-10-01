# Codle Hub Landing — 현재 작업 안내

- 갱신일: 2026-10-01
- 최신 요구사항 요약: `docs/CURRENT-REQUIREMENTS.md`
- 기획·요구사항·조사·메시지·인수인계 원문은 GitHub 저장소에 포함한다. 이전 디자인 보관함과 설치 스킬은 로컬에 유지한다.
- **현재 메인 작업물: `prototypes/codle-hub-studio/`**
- 진입 파일: `prototypes/codle-hub-studio/index.html`
- 미리보기: http://127.0.0.1:4186/prototypes/codle-hub-studio/
- 다섯 상품군, 교과서 통합, Emil 인터랙션 개선까지 반영한 버전이다.
- 실행에 필요한 이미지·폰트·CSS·JavaScript는 메인 폴더에 모두 포함되어 있다.
- 이전 시안 6개, sketches, exports, 영상 전달 패키지와 ZIP은 `archive/design-history-2026-09-30/`에 원래 상대 구조를 유지해 보관했다.
- 아래 과거 기록의 `prototypes/codle-education-hub/`, 다른 옛 프로토타입, `sketches/`, `exports/`, `video-agent-handoff-2026-08-26/` 경로에는 `archive/design-history-2026-09-30/`를 앞에 붙여 찾는다.
- 결정·조사 근거인 `discovery-pack/`, `messaging/`, `.agents/`는 기존 위치에 유지했다.
- 이동 내역과 무결성 기록: `archive/design-history-2026-09-30/manifest.json`

아래는 이전 세션의 역사 기록이다. 아래에 쓰인 ‘현재’, ‘활성’, ‘다음 단계’는 당시 상태를 뜻하며 위 메인 작업물 안내가 우선한다.

---

# Codle Hub Landing — Session Handoff

- 기록일: 2026-09-11
- 프로젝트 루트: `/Users/jonghyunjun/AIworkspace/codle hub landing 2608 new`
- 현재 단계: 고객이 여섯 상품 중 하나라도 발견·선택하는 것이 목표. 담기·복수 선택을 제거하고 상품별 직접 문의와 미정 고객용 일반 상담으로 개선했다. 백엔드 연결은 범위 밖이다.
- 색상·고충실도: 전면 재작업 지시에 따라 새 시안에 구현. 최종 공개 승인은 별도.
- 현재 작업안: `Codle Education Hub / Cover Flow` — 중앙 표지와 양옆 3D 표지를 클릭·드래그로 탐색하는 구조 시안. 사용자가 해당 방향으로 진행 중이며 그리드 비교안은 보존했다. 공개 출시 승인과 세부 디자인은 별도.
- 설치 skill: `product-marketing`, `positioning`, `brand-messaging`, `copywriting`, `copy-editing` — 모두 enabled 확인
- Skill 조사: `discovery-pack/02-public-sources/copy-narrative-skill-research-2026-08-26.md`
- Product marketing context: `.agents/product-marketing.md`
- Brand context: `.agents/brand-context.md`
- 메시지·서사 3안 및 권고 카피: `messaging/codle-hub-messaging-v1.md`
- 활성 Owner 검토용 프로토타입: `prototypes/codle-education-hub/coverflow.html` (http://127.0.0.1:4175/coverflow.html)
- 비교용 그리드안: `prototypes/codle-education-hub/index.html` (http://127.0.0.1:4175/index.html)
- Cover Flow 구현·검증: `prototypes/codle-education-hub/COVERFLOW.md`
- 새 시안 원문·자산 근거: `prototypes/codle-education-hub/SOURCES.md`
- 과거 시안: `prototypes/concept-a-messaging-v1/` — 현재안으로 열지 않음
- 이전 중립색 vertical slice: `prototypes/concept-a-portfolio-reveal/`
- 모션그래픽: 아이디어 보관, 현재 실행 범위 아님(R-024 / D-017)
- 새 시안 검증: 360~1920px 반응형, 이미지·링크·선택·상담 문안·AIDT 경로 확인. 상세 기록은 새 폴더 README.
- 최신 시각 피드백 반영: 자동 움직임 없이 직접 조작하는 Cover Flow를 유지한다. 메인은 ‘수업부터 해커톤, 캠프까지, 우리 학교에 필요한 AI 교육을 살펴보세요.’로 교체했고, 기존 소제목과 ‘AI 교육의 모든것, 코들’은 사용자 요청으로 삭제했다. 푸터는 codle.io 공식 구조, 여섯 번째 상품은 ‘AI 해커톤’과 짓다 원본 로고를 사용한다. 활성 코드·카피 기록은 `COVERFLOW.md`를 따른다.

## 최신 작업 — 2026-09-10 전면 재제작

사용자의 명시적 지시에 따라 과거 프로토타입을 참조하지 않고 새 코드·카피·시각 구성으로 재작성했다. 아래의 과거 단계와 승인 기록은 사실·상품 관계의 이력이며 현재 화면 방향이 아니다.

현재 시안은 각 상품의 ‘이 상품 문의하기’에서 공통 모달 폼을 바로 연다. 폼에는 해당 상품 하나만 표시하며 추가 상품 선택을 요구하지 않는다. 상단 ‘도입 상담’과 하단 ‘우리 학교에 맞는 교육 상담’은 상품 미정 고객용 일반 상담이다. 담기·하단 선택 바·복수 선택 체크박스는 없다. 2026-09-11 사용자 지시로 기존 React 폼은 형태만 참고했고, `inquiry.css`, `hub-inquiry.js`에 실제 저장·전송·백엔드 연결은 없다. 과거 문안 복사 방식은 그리드 비교안에만 보존한다.

지정된 `/Users/jonghyunjun/AIworkspace/jce-codle-react-clone/코들 랜딩/jce-landing-react`는 GitHub `origin/main`의 `d1cb5a0`으로 최신화했다. 문의폼 연결용 임시 소스 변경은 원복하여 clean 상태다. 임시 4176 서버는 중지했고, 활성 미리보기는 기존 4175의 `coverflow.html`이다. 단일 상품 문의 검증을 포함한 Node 테스트는 12개 통과했다.

## 1. 확정 목표

기존 고객의 인식을 `코들 = 단순 수업 소프트웨어`에서 `코들 = AI 교육의 폭넓은 상품·프로그램을 제공하는 파트너`로 확장한다. 대외 화면에서 `전 범위` 같은 절대 claim으로 주장하지 않고 여섯 상품을 증거로 보여준다.

2026-09-11 Owner 목표 정정: 여러 상품을 모두 고르게 유도하는 것이 아니라, 한 고객이 자신에게 맞는 상품을 하나라도 발견하고 선택하게 하는 것이 목표다. 여섯 상품은 선택의 폭을 보여주고, 관심 상품의 상세 확인 또는 개별 문의로 이어진다. 과거 다중 선택·교차판매 기록은 현행 전환 목표가 아니다.

## 2. Source 원칙

- 기존 `/Users/jonghyunjun/AIworkspace/codle-landing-plan/design-source-pack/`은 `reference only`다.
- 새 정본은 현재 프로젝트의 `discovery-pack/`이다.
- 공개 화면과 AI 카피는 Claim Ledger의 `approved` claim만 사용한다.
- 가격·할인율·기관명·로고·사진·성과 수치는 권리와 owner 승인 전 사용하지 않는다.

## 3. 최상위 상품

1. 코들 라이선스 — Basic 무료 / Pro
2. 코들 오리지널 콘텐츠
3. 씨마스 인공지능 기초
4. AIDT 교육자료
5. AI 집중캠프
6. AI 해커톤 — 2026-09-10 사용자 명칭 변경. 과거 기록의 ‘바이브코딩 해커톤’과 동일 상품.

관계:

- 오리지널·씨마스 콘텐츠 이용권은 단독 구매 불가, Pro 필수
- 캠프와 해커톤은 별도 최상위 상품
- 짓다는 해커톤 하위 구성
- 직접 판매 5개는 각각 해당 상품 하나의 문의폼으로 바로 진입. 상품 미정 고객은 일반 상담으로 안내
- AIDT 교육자료는 출판사가 판매·수납하고 코들에 사후 정산; 코들 견적 CTA 금지

## 4. 과거 Owner 승인 — R-016

Owner 원문:

> 전부 승인. 진행시켜

승인 대상:

1. 여섯 정본 상품명 최상위 label
2. 가격·할인율 미공개
3. 콘텐츠 독립 발견 + 구매 단계 Pro 필수
4. AIDT 출판사 판매 분기
5. 캠프/해커톤 활동·산출물 구분
6. 직접 판매 5개 통합 다중 선택 문의 — 2026-09-11 Owner 지시로 상품별 직접 문의로 대체됨
7. 권리 승인 전 기관명·로고·사진·성과 수치 미사용

Receipt:

- `discovery-pack/01-evidence/receipts/owner-internal-evidence-recommendations-approved-2026-08-24.md`

Decision:

- `discovery-pack/00-charter/decision-log.md` D-011

## 5. 공개 원문·짓다 소스·명칭 검증 — R-017~R-020

- 결과 보고서: `discovery-pack/02-research/public-source-canonicalization-2026-08-26.md`
- 서비스 랜딩 원문: `discovery-pack/01-evidence/receipts/live-service-landings-2026-08-26.md`
- 짓다 소스: `discovery-pack/01-evidence/receipts/jitda-source-messaging-2026-08-26.md`
- 명칭 규칙: `discovery-pack/01-evidence/receipts/ai-digital-learning-material-naming-2026-08-26.md`
- P-004 정식명칭: `AIDT 교육자료`
- 풀어쓴 표기: `AI 디지털 교육자료`
- `AI∙디지털 교육자료`는 웹전시 관찰 표기로만 보존
- Decision: `discovery-pack/00-charter/decision-log.md` D-013가 D-012의 명칭 추론을 폐기

## 5.1 저충실도 승인 및 시각 방향 탐색 — R-021

- Owner가 저충실도 검토 완료 후 다음 단계 진행을 승인함
- Decision: `discovery-pack/00-charter/decision-log.md` D-014
- 비교 허브: `sketches/visual-directions-2026-08-26/index.html`
- 비교 문서: `sketches/visual-directions-2026-08-26/README.md`
- 방향 01: Bold Editorial — 브랜드 인식 전환 우선
- 방향 02: System Map — 통합 운영 시스템 인상 우선
- 방향 03: Decision Catalog — 비교·내부 검토 행동 우선
- 현재 권고: 방향 01의 첫인상과 방향 03의 비교·구매 지원 구조를 결합
- 상태: 방향 선택 전, 최종 디자인·카피 비승인

## 5.2 모션그래픽 아이디어 보관 — R-022~R-024

- 모션그래픽 브리프와 영상 생성 에이전트 전달 패키지는 아이디어 자료로 보존
- Owner 지시 R-024에 따라 현재 실행 범위에서 영상 제작 제외
- Decision: `discovery-pack/00-charter/decision-log.md` D-017
- 보관 폴더: `video-agent-handoff-2026-08-26/`
- 재활성 조건: Owner의 별도 승인
- 현재 활성 경로: 시각 방향 3안 비교 → 방향 선택 → 고충실도 vertical slice

## 6. 내부 증거 조사

- Slack 70 sources
- Notion 13 sources
- 92 extracts
- 53 independent events
- 24 budget events
- 18 approval evidence rows
- validator PASS, 0 error, 2 contextual warning

산출 위치:

- `discovery-pack/02-research/internal-evidence-scan/`

## 7. 정본 반영

- Claim Ledger: C-025~C-034 추가
- Offering Matrix: 여섯 행 모두 R-016·구매역할·trigger·budget·routing 반영
- `discovery-pack/03-strategy/buying-group-jtbd.md`
- `discovery-pack/03-strategy/message-principles.md`
- `discovery-pack/03-strategy/page-contract.md`
- `discovery-pack/04-design-contract/low-fidelity-hub-structure.md`

## 8. 실행 가능한 저충실도 프로토타입

- HTML: `prototypes/low-fi-hub/index.html`
- 사용법: `prototypes/low-fi-hub/README.md`
- 데스크톱 캡처: `prototypes/low-fi-hub/screenshots/desktop.png`
- 모바일 캡처: `prototypes/low-fi-hub/screenshots/mobile.png`

구현된 상호작용:

- 여섯 상품 최상위 노출
- 상황 필터가 상품을 숨기지 않고 강조
- 직접 판매 5개 복수 선택
- 콘텐츠 Pro 필수 관계
- 캠프/해커톤 비교
- AIDT 출판사 안내 패널·코들 견적 분리
- 실제 전송 없는 폼 validation

## 9. 과거 저충실도 시안 검증 기록

```text
PASS low-fi hub contract and prototype
claims=34 contract_claim_refs=22 matrix_rows=6
prototype_cards=6 inquiry_offerings=5

PASS Gate 0 evidence integrity
receipts=21 inventory_rows=12 claims=34
approved=25 pending=7 prohibited=2

PASS offering matrix validation
top_level_offerings=6 commercial_relations=11 additional_candidates=5 receipts=21

PASS internal evidence scan (0 error, 2 contextual warning)
sources=83 extracts=92 events=53 budget_events=24 approval_rows=18

PASS browser smoke
desktop+mobile, filter, multi-select, AIDT routing, form validation
```

검증 명령:

```bash
cd '/Users/jonghyunjun/AIworkspace/codle hub landing 2608 new'
python3 discovery-pack/05-validation/validate_lowfi_hub.py
python3 discovery-pack/05-validation/validate_lowfi_browser.py
python3 discovery-pack/scripts/validate_gate0.py
python3 discovery-pack/scripts/validate_offering_matrix.py
python3 discovery-pack/02-research/internal-evidence-scan/validate_internal_scan.py
```

## 10. 공개 전 blocker

1. 실제 공개 문의 폼 URL 또는 내장 endpoint
2. AIDT 교육자료 출판사별 최신 공식명·안내 URL
3. 코들 라이선스·오리지널 콘텐츠·씨마스의 포함 범위·갱신·파트너 권리 승인
4. 캠프·해커톤의 구체 견적 변수와 선택 포함 범위
5. 개인정보 처리 문구·동의 링크
6. 기관명·로고·사진·성과 수치 사용권

## 11. 다음 실행 순서

1. `prototypes/codle-education-hub/` 새 시안을 검토한다. 과거 시안 기반 부분 수정으로 돌아가지 않는다.
2. 새 카피·이미지 사용 범위와 도입 안내를 확인한다. 사용한 원문은 같은 폴더 `SOURCES.md`에 있다.
3. 공개 배포 요청 시 production 환경과 최종 상담·출판사 경로를 확정한다.

R-013/C-016/C-017의 폐기된 콘텐츠 단독 구매 관계는 복원하지 않는다.
