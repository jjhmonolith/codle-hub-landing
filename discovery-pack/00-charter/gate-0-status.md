# Gate 0 Status

- 평가일: 2026-08-24
- 증거 무결성 검사: PASS
- 상품 taxonomy: PASS
- 추가 상품 경계: PASS
- 상업 조건 확인: PASS
- 내부 증거 조사: PASS
- Owner 전략 권고안: APPROVED — R-016
- 전체 Gate 0: APPROVED
- 현재 실행 단계: 저충실도 허브 구조 검증 완료

## 프로젝트 목표

고객의 인식을 `코들 = 단순 소프트웨어`에서 `코들 = AI 교육의 전 범위를 서비스하는 파트너`로 확장한다. `전 범위`를 대외 절대 claim으로 사용하지 않고, 여섯 최상위 상품을 실제 증거로 보여준다.

## 승인된 최상위 상품

1. 코들 라이선스 — Basic 무료 / Pro
2. 코들 오리지널 콘텐츠
3. 씨마스 인공지능 기초
4. AIDT 교육자료
5. AI 집중캠프
6. 바이브코딩 해커톤

## 승인된 상품·판매 관계

- 오리지널 콘텐츠와 씨마스 콘텐츠 이용권은 단독 구매 불가, Pro 라이선스 필수다.
- AI 집중캠프와 바이브코딩 해커톤은 별도 최상위 상품이다.
- 짓다 플랫폼은 바이브코딩 해커톤의 하위 구성이다.
- 직접 판매 5개 상품은 Team Monolith/Codle이 판매하며 한 문의에서 복수 선택할 수 있다.
- AIDT는 각 출판사가 판매·수납하고 이후 Team Monolith/Codle에 정산한다.
- AIDT에는 코들 견적 CTA를 사용하지 않는다.

## R-016 전략 승인

- 여섯 정본 상품명을 최상위 label로 사용
- 공개 가격·할인율 미노출
- 콘텐츠 독립 발견 + 구매 단계 Pro 필수 안내
- AIDT 출판사 판매 경로 분기
- 캠프/해커톤을 활동·산출물로 구분
- 직접 판매 5개 통합 다중 선택 문의
- 권리 승인 전 기관명·로고·사진·성과 수치 미사용

## 충돌·폐기 기록

- R-013의 콘텐츠 단독 구매 해석은 R-014로 폐기했다.
- C-016과 C-017은 `prohibited` 상태를 유지한다.

## 계속 pending인 공개 전 blocker

1. 실제 공개 문의 폼 URL 또는 내장 폼 endpoint
2. AIDT 출판사별 최신 공식명·안내 URL·체험 경로
3. 코들 라이선스·오리지널 콘텐츠·씨마스의 공개 설명 카피
4. P-001~P-003의 포함 범위·갱신·파트너 권리
5. 캠프·해커톤의 구체 견적 변수와 선택 포함 범위
6. 개인정보 처리 문구·동의 링크
7. 기관명·로고·사진·성과 수치 사용권

미승인 항목은 공개 화면과 AI 카피에서 숨긴다.

## 최신 자동 검사 결과

```text
PASS low-fi hub contract and prototype
claims=34 contract_claim_refs=22 matrix_rows=6
prototype_cards=6 inquiry_offerings=5

PASS Gate 0 evidence integrity
receipts=16 inventory_rows=12 claims=34
approved=25 pending=7 prohibited=2

PASS offering matrix validation
top_level_offerings=6 commercial_relations=11 additional_candidates=5 receipts=16

PASS internal evidence scan (0 error, 2 contextual warning)
sources=83 extracts=92 events=53 budget_events=24 approval_rows=18

PASS browser smoke
desktop+mobile, filter, multi-select, AIDT routing, form validation
```

## 현재 산출물

- 전략: `discovery-pack/03-strategy/`
- 저충실도 계약: `discovery-pack/04-design-contract/low-fidelity-hub-structure.md`
- 실행 프로토타입: `prototypes/low-fi-hub/index.html`
- 검증: `discovery-pack/05-validation/validate_lowfi_hub.py`, `validate_lowfi_browser.py`

## 다음 단계

1. P-001~P-003 공개 설명 카피를 승인한다.
2. 실제 문의 endpoint와 AIDT 최신 안내 URL을 확정한다.
3. 개인정보 처리·폼 성공/오류 동작을 확정한다.
4. 그 후 시각 디자인 방향을 비교·선택한다.
