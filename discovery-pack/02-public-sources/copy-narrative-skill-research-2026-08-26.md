# Codle 상품 허브 카피·서사 Agent Skill 조사

- 조사일: 2026-08-26
- 목적: Concept A의 핵심 문구와 랜딩 서사를 더 직관적으로 만들 수 있는 설치형 Agent Skill 탐색
- 조사 경로: Hermes Skills Hub 검색·preview, skills.sh 상세 페이지, GitHub 저장소 메타데이터
- 주의: 아래 외부 skill은 모두 community 등급이다. 저장소 인기와 문서 품질은 보안 검증을 대신하지 않는다. 설치 전 전문과 부속 파일을 재검토한다.

## 결론

추가 후보를 Hermes Skills Hub에서 직접 검색·preview한 결과, 최종 권장 흐름은 다음과 같다.

1. `product-marketing-context`: 지금까지의 정본·Owner 결정·고객·상품 관계를 공용 context로 고정
2. `positioning-messaging`: 고객의 현재 오인과 바꾸려는 카테고리를 정의
3. `brand-messaging`: Core message → supporting messages → proof points의 계층 구축
4. `copywriting`: 확정된 메시지를 hero·subhead·CTA·section copy로 변환
5. `copy-editing`: 기존 카피를 clarity 중심의 focused sweep으로 검수
6. `page-cro`: 5초 이해도, 상품 발견, 복수 상품 검토 흐름을 최종 점검

`customer-research`는 실제 인터뷰·영업통화·문의·설문 원문이 확보될 때 추가한다. 현재는 이미 축적된 Owner 결정과 공개 원문을 고객 VOC처럼 오인하지 않는다.

이미 설치된 `humanizer`는 마지막 한국어 다듬기에만 사용한다. 이 skill은 전략적 메시지나 서사를 만들어 주는 도구가 아니다.

## 1순위 — positioning-messaging

- Identifier: `skills-sh/refoundai/lenny-skills/positioning-messaging`
- Detail: https://skills.sh/refoundai/lenny-skills/positioning-messaging
- Repo: https://github.com/RefoundAI/lenny-skills
- License: MIT
- GitHub 확인값: 1,276 stars / 165 forks / archived=false / pushed 2026-07-16
- 핵심 절차: 현재 인식 audit → status quo/대안 → 고유 value driver → 공유 가능한 hook
- Codle 적합성: 매우 높음. 현재 과제가 정확히 `Codle=수업 소프트웨어`라는 기존 인식을 넓히는 repositioning이기 때문.
- 제한: Lenny Podcast 인용 기반이라 일반론과 강한 훅에 기울 수 있다. 공개 원문과 Owner 승인 근거를 우선해야 한다.

## 2순위 — brand-messaging

- Identifier: `skills-sh/arnabbagxd/brand-building-skills/brand-messaging`
- Detail: https://skills.sh/arnabbagxd/brand-building-skills/brand-messaging
- Repo: https://github.com/arnabbagxd/Brand-building-skills
- License: MIT
- GitHub 확인값: 566 stars / 76 forks / archived=false / pushed 2026-06-13
- 핵심 절차: Core message 한 문장 → 3–4 supporting messages → audience별 변형 → proof points
- Codle 적합성: 매우 높음. `메시징은 카피가 아니라 카피의 전략적 기반`이라고 분리하는 점이 이번 Owner 피드백과 일치한다.
- 제한: 입력이 부실하면 문구를 그럴듯하게 만들 위험이 있다. 현재 Claim Ledger와 상품 정본을 입력으로 고정해야 한다.

## 3순위 — copywriting

- Identifier: `skills-sh/coreyhaines31/marketingskills/copywriting`
- Detail: https://skills.sh/coreyhaines31/marketingskills/copywriting
- Repo: https://github.com/coreyhaines31/marketingskills
- License: MIT
- GitHub 확인값: 45,690 stars / 7,148 forks / archived=false / pushed 2026-08-24
- 핵심 절차: 페이지 목적·audience·offer·traffic context → clarity over cleverness → hero/section/CTA copy
- Codle 적합성: 높음. 포지셔닝과 메시지 계층이 확정된 뒤 실제 랜딩 문구를 생성할 때 적합하다.
- 제한: conversion-oriented 표현과 수치성 주장 예시가 많다. 검증되지 않은 효과·성과·가격을 생성하지 않도록 기존 guardrail이 필수다.

## 보조 후보

### strategic-narrative

- Identifier: `skills-sh/pmprompt/claude-plugin-product-management/strategic-narrative`
- Detail: https://skills.sh/pmprompt/claude-plugin-product-management/strategic-narrative
- Repo: https://github.com/pmprompt/claude-plugin-product-management
- License: MIT
- GitHub 확인값: 47 stars / 14 forks / archived=false / pushed 2026-03-07
- 장점: old game → new game → product as path 구조. B2B 복합 구매와 회사 차원의 이야기에는 적합.
- 이번 랜딩의 위험: `세상이 바뀌었다`는 과장된 거대 서사가 상품 발견을 늦출 수 있다. 메인 프레임보다 서사 점검용으로만 사용.

### storybrand-messaging

- Identifier: `skills-sh/wondelai/skills/storybrand-messaging`
- Detail: https://skills.sh/wondelai/skills/storybrand-messaging
- Repo: https://github.com/wondelai/skills
- License: MIT
- GitHub 확인값: 2,023 stars / 207 forks / archived=false / pushed 2026-08-10
- 장점: 고객을 hero, 브랜드를 guide로 두고 desire·plan·CTA를 빠르게 명료화한다.
- 이번 랜딩의 위험: 기관 의사결정자·교사·구매 담당이 섞인 다중 사용자 구조를 `한 명의 hero`로 과도하게 단순화할 수 있다. 보조 진단에만 사용.

### positioning-workshop

- Identifier: `skills-sh/deanpeters/product-manager-skills/positioning-workshop`
- Detail: https://skills.sh/deanpeters/product-manager-skills/positioning-workshop
- Repo: https://github.com/deanpeters/Product-Manager-Skills
- GitHub 확인값: 6,658 stars / 808 forks / archived=false / pushed 2026-08-13 / GitHub license metadata NOASSERTION
- 장점: JTBD, category, benefit, differentiation를 묻는 60–90분 워크숍.
- 이번 랜딩의 위험: 이미 Discovery와 Owner 결정이 축적돼 있어 처음부터 워크숍을 반복하면 오히려 결정을 흐릴 수 있다.

### gtm-positioning-strategy

- Identifier: `skills-sh/github/awesome-copilot/gtm-positioning-strategy`
- Detail: https://skills.sh/github/awesome-copilot/gtm-positioning-strategy
- Repo: https://github.com/github/awesome-copilot
- License: MIT
- GitHub 확인값: 38,264 stars / 4,843 forks / archived=false / pushed 2026-08-26
- 장점: generic message를 차별화하고 실제 positioning claim을 시험하는 절차가 상세하다.
- 이번 랜딩의 위험: GTM 경쟁 포지셔닝과 rollout까지 범위가 커서 현재 hero·페이지 서사 개선에는 과하다.

## 권장 적용 순서

1. Claim Ledger·상품 관계·Owner decisions를 `.agents/product-marketing.md` 형태의 읽기 전용 context로 정리
2. `positioning-messaging`으로 다음 네 문장을 확정
   - 지금 고객이 Codle을 무엇으로 알고 있는가
   - 무엇까지 제공한다는 인식으로 바꾸려는가
   - 그 변화가 기관·교사에게 왜 중요한가
   - 이 페이지를 본 뒤 무엇을 하게 할 것인가
3. `brand-messaging`으로 Core message 1개, supporting message 최대 3개, 근거를 연결
4. `copywriting`으로 hero와 섹션 문구 3세트를 만들고 5초 이해 테스트
5. `humanizer`로 한국어 AI 문체를 제거
6. 색상과 고충실도 작업은 최종 문구와 5초 이해 테스트 통과 후 재개

## 설치 명령 — 승인 후 실행

### 지금 적용할 core stack

```bash
hermes skills install skills-sh/coreyhaines31/marketingskills/product-marketing-context
hermes skills install skills-sh/refoundai/lenny-skills/positioning-messaging
hermes skills install skills-sh/arnabbagxd/brand-building-skills/brand-messaging
hermes skills install skills-sh/coreyhaines31/marketingskills/copywriting
hermes skills install skills-sh/coreyhaines31/marketingskills/copy-editing
```

### 카피 승인 뒤 구조·전환 검수 단계

```bash
hermes skills install skills-sh/coreyhaines31/marketingskills/page-cro
```

`customer-research`는 고객 인터뷰·영업통화·문의·설문 원문이 확보될 때 설치 여부를 다시 판단한다.

현재 조사 단계에서는 설치하지 않았다.
