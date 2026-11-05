# 현재 랜딩 수정 안내

현재 기준 페이지는 `publisher-kakao-font-preview.html`이다. `single-line-intro-preview.html`과 `publisher-coherent-3d-preview.html`은 이전 비교 시안이다.

## 수정 위치

| 대상 | 파일 |
| --- | --- |
| 페이지 내용·리소스 로드 순서 | `publisher-kakao-font-preview.html` |
| 공통 기반 스타일 | `landing-foundation.css` |
| 데스크탑 전체 폭·상세 섹션 기본 타이포 | `landing-shell.css` |
| 카드 배치·색·서체·최종 그래픽 | `landing-hub.css` |
| 모바일·태블릿 배치 | `landing-responsive-finish.css` |
| 문의 폼 모양·가독성 | `inquiry-refined-preview.css`, `hub-readability-finish.css` |
| 문의 폼 상태·검증·서비스별 제목 | `card-inquiry-refined.js` |
| 코들 상세 장면·텍스트 등장 | `codle-demo-refined.js`, `codle-demo.css` |
| 모바일 코들 상세 구성 | `mobile-layout-refined.js`, `mobile-layout.css` |
| 짓다 상세·영상 | `jitda-overview-held.js`, `jitda-overview.css` |
| 짓다·캠프 스크롤 길이 | `service-scroll-hold.css`, `service-scroll-hold.js` |

`landing-foundation.css`는 기존 공통 스타일 28개를 순서대로 통합한 실제 소스다. 원래 파일명은 구간 주석으로 남겼다. 이전 파일을 수정해도 현재 페이지에 반영되지 않는다. 카드 수정은 이 기반 파일 뒤에 로드되는 `landing-hub.css`에서 한다. 기존 비교 시안이 쓰는 파일과 에셋은 삭제하지 않았다.

소개 문구 크기·폭과 출판사 그래픽 위치는 `landing-hub.css`의 `--intro-title-size`, `--intro-title-width`, `--publisher-art-scale`, `--publisher-art-y`에서 조절한다. 모바일 문구 값은 `landing-responsive-finish.css`에 있다. HTML에 새 `<style>` 블록을 추가하거나 파일 끝에 동일 속성을 계속 덮어쓰지 말고 해당 규칙을 수정한다.

## 동작 연결

- 코들 장면은 코스메이커 → AI 셜록 → 강 건너기 → 학습 결과의 4개다. `scenes` 설정의 `frame` 값은 모바일 구성에서도 사용한다.
- 스크립트의 `defer`와 순서를 유지한다. 코들 장면을 만든 뒤 모바일 구성을 복제하고, 상세 영역을 정리한 뒤 캠프 스크롤 구간을 만든다.
- 데스크탑 문의 폼은 고정 패널, 1100px 미만에서는 모달이다. 폼 제출은 로컬 미리보기이며 실제 전송 기능이 아니다.
- CSS/JS를 바꾸면 해당 리소스의 `?v=`도 변경해 캐시된 이전 코드와 섞이지 않게 한다.

## 확인 기준

데스크탑 1920×1080·1366×768, 태블릿 768×1024, 모바일 390×844에서 카드와 폼을 확인한다. 코들 네 장면, 짓다·캠프 머무름, 모바일 문의 열기·서비스 선택·닫기, 가로 넘침과 콘솔 오류도 확인한다. 스크롤 전환 상태나 모달 상태에서만 쓰는 CSS는 첫 화면에 없다는 이유로 삭제하지 않는다.

## 카드 아트 모션

`card-art-motion.js`와 `card-art-motion.css`가 현재 페이지의 네 그래픽에 부분 모션을 연결한다. 원본 PNG를 SVG 마스크·클립으로 나눠 표시하며, 별도의 대용량 동영상은 로드하지 않는다. 짓다의 오른쪽 정렬과 기존 카드 크기는 유지한다. 씨마스의 수면은 배가 지나간 자리가 남지 않도록 연속된 벡터 수면으로 구성하고, 대기 위치는 강의 왼쪽이다.

- 코들: 구슬별 미세 회전과 알파 마스크 안의 반사광, 약 3.4초.
- 짓다: 설계도 캐릭터 고개, 양쪽 캐릭터와 망치, 약 3초.
- 씨마스: 왼쪽에서 오른쪽으로 이동, 약 4.2초. 포인터가 나가면 출발점으로 복귀.
- 금성·YBM: 아래부터 0.3초 간격으로 들렸다 맞물리는 블록.

마우스 진입에서만 한 번 재생하며, 실행 중 재진입해도 처음으로 튀지 않는다. 터치 환경과 동작 줄이기 설정에서는 재생하지 않는다. 이미지가 바뀌면 `scene()`의 좌표와 마스크도 함께 조정해야 한다.

## 6개 카드 비교 버전

- 기존 고정 문의 패널 버전: `codex/fix-card-motion-masks`, 커밋 `38973c0`.
- 새 카드 호버 버전: `codex/six-card-hover-hub`.
- 같은 `publisher-kakao-font-preview.html`을 사용하며, 새 버전은 `body.six-card-hub`와 `six-card-hub.css`로 구분한다.
- 데스크톱은 소개 카드와 서비스 카드 5개를 3열×2행으로 표시한다. 1000px 이하에서는 2열, 600px 이하에서는 1열로 표시한다.
- 카드 하단의 두 액션은 호버·키보드 포커스에 나타나며, 터치 환경과 1000px 이하에서는 항상 표시한다.
- 문의는 서비스가 선택된 모달로만 열리고, 닫으면 누른 버튼으로 포커스가 돌아간다. 기존 페이지의 고정 패널 동작은 유지한다.
- 폼 제출은 기존처럼 검토 화면만 표시하며 실제 전송하지 않는다.
