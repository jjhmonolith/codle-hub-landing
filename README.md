# 코들 허브 랜딩

현재 메인 홈페이지는 [`prototypes/codle-hub-studio/`](prototypes/codle-hub-studio/)에 있습니다.

다섯 교육 상품군을 직접 넘겨 살펴보는 반응형 랜딩 페이지입니다. 상품별 상세 링크·도입 문의·구매 안내를 제공하며, 문의폼은 실제 전송 없는 디자인 미리보기입니다.

## 실행

설치나 빌드 없이 프로젝트 루트에서 실행합니다.

```sh
python3 -m http.server 4186 --bind 127.0.0.1
```

[로컬 홈페이지 열기](http://127.0.0.1:4186/prototypes/codle-hub-studio/)

## 주요 파일

| 경로 | 용도 |
| --- | --- |
| `prototypes/codle-hub-studio/index.html` | 페이지와 상품 구성 |
| `prototypes/codle-hub-studio/studio.css` | 반응형 디자인 |
| `prototypes/codle-hub-studio/emil.css` | 버튼·포커스·입력 방식별 인터랙션 |
| `prototypes/codle-hub-studio/showroom.js` | 갤러리·탭·드래그·키보드 탐색 |
| `prototypes/codle-hub-studio/inquiry.js` | 로컬 문의폼·검증·모달 |
| `prototypes/codle-hub-studio/assets/` | 이미지·로고·폰트 |

[구현과 검증 기록](prototypes/codle-hub-studio/README.md)

## 기획·요구사항 문서

먼저 [현재 요구사항](docs/CURRENT-REQUIREMENTS.md)을 읽어 주세요. 8~9월 기획 원문에는 이후 변경된 여섯 상품·다중 선택 문의 등의 기록이 있으므로, 현재 적용 사항과 과거 이력을 구분합니다.

| 문서 | 내용 |
| --- | --- |
| [현재 요구사항](docs/CURRENT-REQUIREMENTS.md) | 최신 상품 구성·구매 경로·화면·인터랙션·구현 범위 |
| [세션 인수인계](SESSION-HANDOFF.md) | 현재 작업 위치와 이전 작업 경과 |
| [Discovery Pack](discovery-pack/README.md) | 프로젝트 목표·상품 사실·조사·전략·디자인 계약·검증 자료 전체 |
| [결정 기록](discovery-pack/00-charter/decision-log.md) | 초기 기획 단계의 결정 이력 |
| [메시지·카피 기획](messaging/codle-hub-messaging-v1.md) | 메시지 방향과 문구 제안 원문 |
| [브랜드 맥락](.agents/brand-context.md) | 초기 브랜드 포지셔닝·표현 원칙 |
| [상품 마케팅 맥락](.agents/product-marketing.md) | 초기 상품 구조·고객·구매 관계 |
| [조사 작업 프롬프트](CLAUDE-SLACK-NOTION-RESEARCH-PROMPT.md) | Slack·Notion 근거 조사 범위와 산출물 지침 |

조사 원천 링크 중 Slack·Notion 링크는 해당 서비스 접근 권한이 필요할 수 있습니다. 문서의 과거 승인 상태는 당시 기록이며, 공개 화면에 쓸 최신 사실·가격·문구의 승인 여부와 구분합니다.

## 로컬 보관 자료

이전 디자인 시안과 대용량 원본 자산은 `archive/design-history-2026-09-30/`에 보관하며 Git에서 제외합니다. 설치한 에이전트 스킬·도구 설정과 비밀정보 파일도 제외합니다. 문서 안의 과거 절대 경로·보관함 경로는 로컬 이력 참고용입니다. 옛 저충실도 화면을 검사하는 `validate_lowfi_*`는 해당 로컬 보관함이 필요합니다.

## 범위

- 정적 HTML/CSS/JavaScript, 폰트와 이미지 포함
- 다섯 상품군: 수업 플랫폼, 오리지널 콘텐츠, 코들 × 교과서, AI 집중캠프, AI 해커톤
- 문의 내용은 페이지 메모리에서만 처리하며 서버에 저장하거나 전송하지 않음
- 공개 배포 설정과 실제 문의 백엔드는 포함하지 않음
