# 현재 랜딩 유지보수

활성 페이지는 `publisher-kakao-font-preview.html`, 작업 브랜치는 `codex/six-card-hover-hub`다. HTML의 `body.six-card-hub`가 새 카드 버전을 구분한다. 이전 비교 시안과 실험용 파일은 현재 페이지에서 로드하지 않으며, 이 페이지를 수정하기 위해 삭제할 필요가 없다.

## 수정 위치와 스타일 우선순위

| 대상 | 소유 파일 |
| --- | --- |
| 콘텐츠, 접근성 마크업, 리소스 순서 | `publisher-kakao-font-preview.html` |
| 레거시 공통 기반 | `landing-foundation.css`, `landing-shell.css`, `landing-hub.css` |
| 현재 카드 배치, 액션, 말풍선, 헤더 | `six-card-hub.css` |
| 현재 문의 드로어 크기, 배경, 내부 배치 | `inquiry-drawer.css` |
| 현재 휴대폰·태블릿 카드, 헤더, 말풍선, 문의폼 | `six-card-mobile.css` |
| 공유 폼 필드 스타일 | `inquiry-refined-preview.css`, `hub-readability-finish.css` |
| 문의 상태, 서비스 선택, 검증, 포커스 | `card-inquiry-refined.js` |
| 도입 타임라인 / 도입 표현 | `mondrian-entry.js` / `mondrian-entry.css` |
| 카드 캐릭터 영상 | `mascot-card-video.js` |
| 카드 그래픽 초기화 / 표시 | `card-art-motion.js` / `card-art-motion.css` |
| 코들 그래픽 / 짓다·교과서 그래픽 | `codle-surface-motion.js` / `publisher-surface-motion.js` |
| 코들 상세 장면 | `codle-demo-refined.js`, `codle-demo.css` |
| 모바일 상세 구성 | `mobile-layout-refined.js`, `mobile-layout.css` |
| 짓다 / 캠프 상세 | `jitda-overview-held.js`, `jitda-overview.css`, `camp-overview.css` |
| 상세 마무리 / 스크롤 구간 | `section-finish.js/css`, `service-scroll-hold.js/css` |

기반 스타일 → 섹션 스타일 → 현재 카드 → 문의 드로어 → 도입 → 현재 모바일 순으로 로드한다. `landing-foundation.css`는 기존 28개 CSS를 통합한 파일이며 이전 원본 파일을 수정해도 현재 페이지에는 반영되지 않는다. 현재 버전 변경은 위 소유 파일에서 한다. 동일 선택자를 파일 끝에 계속 추가하지 말고 기존 선언을 수정한다. `!important`는 레거시 규칙을 덮는 용도이므로 계산된 스타일을 비교하지 않고 일괄 제거하지 않는다.

스크립트의 `defer`와 로드 순서를 유지한다. 코들 상세 장면을 생성한 뒤 모바일 버전을 복제하고, 상세 영역을 구성한 뒤 스크롤 래퍼를 만든다. `mondrian-entry.js`는 DOM 생성 전에 도입 대기 클래스를 설정하므로 일반 `defer` 스크립트로 바꾸지 않는다. 수정 리소스의 `?v=`도 갱신한다.

## 화면 규칙

- 데스크톱은 코들 > 짓다 > 캠프 > 교과서의 비대칭 배치를 유지한다. 코들·짓다는 정사각형이다.
- 1099px 이하는 터치용 레이아웃, 600px 이하는 1열이다. 터치 화면에서는 액션이 항상 보인다. 데스크톱에서는 호버·키보드 포커스로 보인다.
- 모바일·태블릿 말풍선 위치는 `six-card-mobile.css` 마지막의 대화 배치 규칙이 소유한다. 질문과 답변은 독립적으로 위치시키며 캐릭터·노트북과 겹치지 않는지 확인한다.
- 새 버전 문의는 오른쪽에서 들어오는 네이티브 `dialog`다. 휴대폰에서는 전체 화면이며, 폼 본문만 스크롤되고 제출 영역은 유지된다.
- 기존 비교 버전은 1100px 이상에서 고정 문의 패널이다. `card-inquiry-refined.js`는 두 버전을 함께 지원하므로 `isDocked()` 분기를 유지한다.
- 문의 제출은 검토 화면으로 이동할 뿐 실제 전송하지 않는다. 닫으면 배경의 `inert`를 해제하고 원래 버튼으로 포커스를 돌린다.

## 그래픽과 도입

카드 모션은 Three.js 기반이다. `assets/unified-cards/*-motion-rest.png`는 현재 모션의 정지 상태를 캡처한 초기 이미지다. 모션 캔버스가 준비된 뒤 교체하므로 새로고침 때 다른 이미지가 보이지 않는다. 그래픽 또는 마스크를 바꾸면 정지 이미지도 함께 갱신한다. 이전 시안 에셋과 혼동하지 않는다.

- `mondrian-entry.js`의 `timing` 객체가 전체 속도, 영상 속도, 타이핑 지연, 카드 진입·인계 시점을 관리한다. 타임라인 값은 전체 속도로 나누기 전의 밀리초다.
- 영상은 `codle-mascot-user-selected-60.mp4`, 정지 화면은 `codle-mascot-user-selected-end.png`다. 사용자 원본 `codle-mascot-user-selected.mp4`도 보존한다.
- 새로고침은 해시가 있어도 도입부터 시작한다. 일반 섹션 링크 진입은 도입을 생략하고, `?intro=replay`는 재생을 요청한다. 1000px 이하와 동작 줄이기 설정에서는 도입을 생략한다.
- 영상 종료 뒤 짧은 정지를 두고 이동한다. 실제 카드가 그려진 다음 도입 복제본을 숨긴다. 질문을 글자 단위로 쪼개면 인계 순간 자간이 달라지므로 문장 전체로 유지한다.
- 건너뛰기·Escape·화면 크기 변경·시간 초과는 같은 `finish()` 정리 경로를 사용한다.

## 검증

Playwright가 설치된 환경에서 정적 서버를 띄운 뒤 실행한다:

```sh
node prototypes/codle-hub-studio/toy-hub/tests/landing.smoke.cjs
```

기본 URL은 `http://127.0.0.1:8766/prototypes/codle-hub-studio/toy-hub/publisher-kakao-font-preview.html`이다. 다른 서버는 `LANDING_URL` 환경 변수로 지정한다. Playwright를 별도 경로에 설치했다면 해당 `node_modules`를 `NODE_PATH`로 지정할 수 있다.

테스트는 320·390·768·1024·1440·1920px의 가로 넘침, 카드 개수, 서비스별 문의, 필수값 검증, 검토·수정, Escape·포커스 복귀, 도입 새로고침·건너뛰기를 확인한다. 그래픽이 준비될 때까지 기다리며 폼을 외부로 전송하지 않는다. 추가로 실제 화면에서 카드·말풍선·영상 인계, 스크롤 상세와 짓다·캠프를 확인한다.

리팩토링 시 레거시 기반 전체를 한 번에 재작성하지 않는다. 활성 파일부터 정리하고 대표 폭의 계산된 위치·크기·스타일을 변경 전후 비교한다.
