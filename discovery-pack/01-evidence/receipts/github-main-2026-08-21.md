# Receipt R-002~R-006 — 운영 후보 저장소 main

- 캡처 시각: 2026-08-21T11:16:04+09:00
- 저장소: `team-monolith-product/jce-landing-react`
- URL: `https://github.com/team-monolith-product/jce-landing-react`
- Visibility: private
- Default branch: `main`
- Commit: `b950f7ca9486026a7672475b6290e7709469955e`
- Commit date: `2026-08-11T12:23:10Z`
- Commit message: `feat: 요금제를 기본 플랜 + 콘텐츠 이용권 구조로 개편`

## 확인한 구현 원천

- `package.json`: Next.js 16.1.1, React 19.2.3, TypeScript, Tailwind CSS 4
- `src/messages/kr.json`: 현재 한국어 랜딩 문구와 내비게이션/푸터/성과/인증 문구
- `src/app/[locale]/(index)/page.tsx`: Hero → Card → Solution → Motion → Count → Global → CSAP → Join 구조
- `src/app/[locale]/pricing/plans.ts`: Basic/Pro 기본 플랜과 Codle AI/씨마스 인공지능 기초 콘텐츠 이용권 구현
- `src/apis/form-submissions.ts`: token query를 사용하는 `POST /api/v1/form_submissions` 클라이언트
- `src/lib/metadata.ts`: locale별 metadata와 SEO 설정

## 현재 구현에서 관찰된 제공 관계

- 기본 플랜: Basic, Pro
- 콘텐츠 이용권: Codle AI, 씨마스 인공지능 기초
- Pro 단독 구현 가격: 학생 1인·1학기 22,000원
- 콘텐츠 이용권과 함께 구독할 때 구현된 Pro 가격: 20,000원
- Codle AI 이용권 구현 가격: 학생 1인·1학기 20,000원
- 씨마스 인공지능 기초 이용권 구현 가격: 학생 1인·1학기 10,000원

위 값은 **코드 관찰값**이다. 실제 판매 가능 여부, 세금/계약 단위, 적용 기간, 할인 조건, 대외 공개 허용 여부는 확인되지 않았다.

## 현재 구현에서 관찰된 고위험 claim 범주

- 국내 운영 학교 수
- 인증된 교사 가입자
- 생성 교실 수
- 고등학교 정보 수업 도입 비율
- CSAP 표준등급 및 학교 환경 보안 요건 충족
- 해외/국내 수상·선정·인증
- AI 안전성·정답 비제공·부적절 발화 차단·정밀한 튜터/평가 가능성

이 범주는 새 Claim Ledger에서 모두 `pending`으로 시작하며, 측정 정의·기준일·증빙·권리·owner 확인 전에는 새 랜딩에 사용하지 않는다.

## 증거 한계

- 코드에 존재하는 사실은 사업/법무/마케팅 승인 사실이 아니다.
- main이 실제 배포 commit인지 배포 시스템과 대조하지 않았다.
- API 성공, CRM 생성, GTM 이벤트 payload는 아직 실행 검증하지 않았다.
