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

## 로컬 작업 자료

기존 작업 폴더의 `archive/design-history-2026-09-30/`, `discovery-pack/`, `messaging/`, `SESSION-HANDOFF.md`와 에이전트 설정은 로컬에 보존하며 Git에서 제외합니다. 저장소에는 현재 홈페이지와 실행 안내만 포함합니다. 과거 디자인의 원본 자산 출처 기록도 로컬 보관함에 있습니다.

## 범위

- 정적 HTML/CSS/JavaScript, 폰트와 이미지 포함
- 다섯 상품군: 수업 플랫폼, 오리지널 콘텐츠, 코들 × 교과서, AI 집중캠프, AI 해커톤
- 문의 내용은 페이지 메모리에서만 처리하며 서버에 저장하거나 전송하지 않음
- 공개 배포 설정과 실제 문의 백엔드는 포함하지 않음
