## 최신 보기 — 모자이크 원본과 현재 허브

사용자가 모자이크 버전을 다시 열어달라고 요청하여 `prototypes/codle-hub-studio/toy-hub/product-mosaic-before-labs.html`을 열었다. 원본은 수정하지 않았다. 현재 허브 `product-mosaic.html`과 함께 보존하며, 어느 버전으로 편집을 이어갈지는 다음 요청을 따른다. 루트에서 `python3 -m http.server 8878 --bind 127.0.0.1`로 실행하면 두 페이지를 모두 볼 수 있다. `output/`의 로컬 검증 캡처와 별도 `videos/` 실험은 실행에 필요하지 않으며 이번 허브 커밋에는 포함하지 않는다.

## 최신 — 2026-10-26 이전 상단으로 복원

사용자가 “이전꺼가 나은듯”이라고 하여 직전 상단 개편만 취소했다. 작업 직전 스냅샷에서 product-mosaic.html과 google-labs.js를 정확히 복원: 기존 6개 서비스의 전폭 배너, 배경 모션, 자동 전환을 다시 사용한다. 새 hub-hero.css / hub-hero-scenes.js 연결 및 파일은 제거. 직전 시도는 /tmp/codle-rejected-hub-hero에 보관했다. 기존 도입, 로그인 제거 상태, 실제 교안 카드, 코들 모자이크 카드, 모든 카드 반복 호버는 그대로 유지.

## 이전 시도 — 상단 대표 소개와 선택형 배너 (되돌림)

사용자가 상단 방향 제안에 “해봐”로 승인. 첫 화면은 코들 전체 소개로 고정하고 기존 6개 자동 전환 배너를 대표 소개 / 수업 아이디어 / AI 집중캠프 3장으로 정리했다. 자동으로 다음 배너로 넘어가지 않으며 하단 탭·화살표로 선택한다. 기존 로고 도입, 전폭 배너 높이, 헤더 로그인, 6개 서비스 카드와 호버 모션, 푸터는 유지했다.

- 대표: “우리 학교의 AI 교육, 코들에서.” + 실제 공식 수업 화면. 활동 목록·상단 도구·실습 영역이 순차 등장하고 이후 작은 움직임을 유지. “서비스 둘러보기”는 #service-guide로 이동.
- 수업 아이디어: 기존 실제 4-queen 교안 전체 미리보기, 기존 콘텐츠 랜딩으로 연결.
- AI 캠프: 기존 공식 교실 영상 무음 반복, 캠프 랜딩 연결. 영상은 해당 배너를 선택할 때 지연 로드.
- 새 파일: hub-hero.css (20261026-2), hub-hero-scenes.js (20261026-1). product-mosaic.html의 product-scenes.js 연결을 새 런타임으로 교체했으며 이전 파일 자체는 수정하지 않음. google-labs.js는 data-auto-rotate=false 지원, 배너 카운터, 일시정지 접근성 이름만 추가(20261026-hubhero1).
- 모션: 기존 codle:scene-state에 연결하여 도입 중/화면 밖/탭 숨김/일시정지 시 정지. reduced-motion에서는 완성된 정지 화면. 배너 전환은 기존 원형 확장 연출 유지.
- 재사용 출처: assets/landing-hover/platform-lesson.png는 공식 ai.codle.io/content-slide-1-2.png; assets/card-visuals/content-lesson-four-queens.png는 이전에 캡처한 실제 교안; 캠프 포스터·영상도 기존 공식 에셋.

검증: 데스크톱 1280px·모바일 519px 화면 확인, 가로 넘침 없음. 기본 배너가 자동으로 넘어가지 않는 것, 3개 배너 선택·영상 일시정지·다른 배너 선택 시 영상 정지·CTA 클릭 후 서비스 제목 6개 섹션 도착 확인. 캠프 문구 흰색 대비 수정. JS 구문/diff 검사 및 브라우저 오류 없음. 작업 전 파일과 비교하여 intro/header 및 hub-shell 이후 전체가 동일함을 확인. 화면: output/hub-hero/desktop.png, mobile.png.

## 현재 최우선 — 코들 카드에 예전 모자이크 랜딩의 모션 재사용

사용자가 코들 아이콘 카드를 가리키며 예전 모자이크 랜딩의 모션을 요청했다. `product-mosaic-before-labs.html`의 **수업 플랫폼 타일 호버**를 확인하고 재사용했다. 아이콘들이 왼쪽 활동 목록으로 모이면서 교안/편집기/실행 결과 영역이 펼쳐지는 동작이다. 페이지 전체 로고 도입은 변경하지 않았다.

현재 공식 아이콘 6종(Python, AI 소크룸, Entry, Quiz, Board, PDF)은 유지. `mosaic-service-art.js`의 원래 classroom SVG와 `product-mosaic.css`의 이동 좌표·축소율·gather/unfold 진행식을 가져왔다. 별도 iframe 없이 현재 카드에 SVG로 삽입하고 `card-previews.css`의 `--card-platform-progress`를 기존 반복 런타임으로 재생한다. 호버 유지 시 3.6초 주기, 이탈 시 원래 아이콘으로 복귀. CSS `20261026-2`, JS `20261026-3`.

검증: 브라우저에서 실제 수업 화면 펼침(clip-path 0%, 아이콘 scale .22), 반복 재생, 이탈 시 idle/clip-path 100%, 키보드 포커스 재생 확인. HTML은 코들 카드 이미지와 신규 CSS/JS 버전 외 변경 없음. 원래 모자이크 소스는 수정하지 않음.

## 이전 — 배너 아래 로그인 줄 제거

사용자 첨부 화면의 “오늘의 수업을 이어가세요 / 코들 로그인” 가로 줄(`hub-login-strip`)을 HTML에서 제거하고 전용 CSS도 정리했다. 배너 다음에 서비스 소개 섹션이 바로 이어진다. 헤더의 코들 로그인 링크는 유지. CSS 버전 `20261026-10`.

## 현재 최우선 — 2026-10-26 호버 유지 중 반복 재생

후속 요청에 따라 `card-previews.js`의 1회 재생을 무한 반복으로 변경했다. 카드 내부 레이어를 같은 주기(3.4–4.8초)로 맞추고, 등장 간격을 매 반복마다 유지한다. 마지막 상태를 잠깐 보여준 후 0.5초 동안 처음 상태로 복귀한다. 교안 도해가 반복 중에도 순서를 유지하며 씨마스 표지도 닫혔다 다시 열린다. 캠프 영상은 기존 loop 유지. 이탈/화면 밖/탭 숨김/모션 감소 시 취소 및 초기화 유지. JS 캐시 버전 `20261026-2`.

검증: 브라우저에서 오래 호버한 후에도 교안 말이 다시 순차 등장하는 것과 이탈 시 idle/overlay opacity 0 확인. 5종 애니메이션의 키프레임 순서·레이어 주기 일치·이탈/모션 감소 취소·터치 미재생을 임시 Node 검증으로 확인. JS 구문 및 diff 검사 통과.

## 이전 — 2026-10-26 카드 호버 미리보기

사용자 요청: 카드 레이아웃 재구성이 아니라 마우스를 올리면 미리보기가 재생되는 Google Labs 방식. 기존 도입/전폭 배너/로그인/3열 2행/문구/링크는 유지했다. `card-previews.css`와 `card-previews.js`를 추가하고 HTML에서 로드한다(`20261026-1`). 기본은 정지 이미지, 포인터 진입 또는 키보드 포커스 시 재생, 이탈 시 애니메이션 취소 및 원래 화면 복원. 화면 밖/탭 숨김/창 포커스 해제 시 정지, reduced-motion에서는 재생 안 함. 터치 진입은 무시한다.

- 코들: 원본 활동 아이콘 6개가 순서대로 움직임.
- 오리지널 콘텐츠: 실제 교안 전체를 유지하면서 설명에 밑줄이 지나가고 목표 도해의 말 4개가 순서대로 등장. 원본 `cmass-course-maker/public/cmass/cmass-sa/rook.svg`를 그대로 복사한 `assets/card-visuals/lesson-piece.svg` 사용. 게임 임베드 아님.
- 씨마스: 표지가 열리고 기존 실제 교과서 33쪽 표시.
- 금성·YBM: 원본 도형의 가벼운 이동/회전.
- 캠프: 기존 `assets/films/camp.mp4`를 첫 호버 때만 로드하여 무음 재생. 이탈 시 일시정지 및 0초로 복원.
- 짓다: 원본 캐릭터 동작과 실제 데모 화면 순차 노출.

검증: 데스크톱에서 6개 카드 호버와 이탈, 교안 단계별 표시, 캠프 영상 재생 시간 증가 및 이탈 후 paused=true/currentTime=0, 키보드 포커스 재생 확인. 519px 모바일 레이아웃 넘침 없음, 최초 카드 모두 idle/영상 src 미할당. 브라우저 오류 없음. JS 구문/diff 검사 통과. HTML은 이미지 블록 3곳과 신규 CSS/JS 연결 외 변경 없음. 화면: `output/card-previews/hover-preview.png`. 모션 감소는 런타임 환경을 변경하지 않고 코드 경로로 확인함.

## 현재 최우선 — 오리지널 콘텐츠는 교안 한 페이지 전체

사용자 정정: 게임판만 보여주면 게임 상품처럼 보이므로 실제 교안을 직접 보여줄 것. 오리지널 콘텐츠 카드 이미지는 이제 `cmass-course-maker/app/cmass-ai-basics/u1/c2/s1/01-03/page.tsx`의 실제 교안 전체이다. 단원 제목, 4-queen 설명, 초기 상태/목표 상태 도해를 함께 표시한다. 게임판을 분리한 2패널 구성은 제거. 현재 파일 `assets/card-visuals/content-lesson-four-queens.png`, 실제 페이지 범위만 SVG로 크롭(내용 재구성 없음). 원본 교안 코드는 수정하지 않았다. CSS `20261026-9`. 상단·코들 아이콘·다른 카드·카피·링크 유지.

## 최신 — 실제 물통 게임·4 Queens 미리보기 적용

사용자가 제공한 `/Users/eomgyuhwan/Desktop/tm/cmass-course-maker` (HEAD `0430d9a`)에서 `app/test/test-sa/u1/c2/s1/water-jug/page.tsx`, `n-queen/page.tsx`를 실행해 실제 플레이 화면을 캡처했다. 게임 소스는 변경하지 않았다. 물통은 2L/3L 상태, 4x4 보드는 말 3개를 유효하게 배치한 진행 중 상태. 전체 캡처 원본은 `assets/card-visuals/content-water-jug.png`, `content-four-queens.png`, 출처/상태는 sources.json. 오리지널 콘텐츠 카드에 독립된 2개 패널로 배치하고 SVG clipPath로 게임 영역만 확대 표시. 기존 표지 썸네일 대체. 상단·코들 아이콘·나머지 서비스 카드·카피·링크 유지. CSS 버전 `20261026-8`. 카드 자체는 정적 미리보기이며 기존 콘텐츠 랜딩으로 이동한다. 1280px/519px 시각 검토 완료, 가로 넘침 없음, 허브 콘솔 오류 없음. 배너 높이 약538px 유지 확인.

## 최신 — 코들 활동 아이콘 및 콘텐츠 표지 분리

사용자 요청으로 코들 카드의 3D PC/학사모를 기존 원본 코들 활동 아이콘 6개(파이썬, AI 소크룸, 엔트리, 퀴즈, 보드, PDF)로 교체. 원본 `codle-tools-ui.png`를 SVG 뷰포트로 크롭하며 파일 자체는 변경하지 않았다. 오리지널 콘텐츠 표지 2장은 회전을 없애고 위아래 엇갈린 배치로 겹침 없이 전체가 보이도록 조정. CSS 버전 `20261026-7`. 데스크톱 1280px 및 모바일 519px에서 시각 검토, 표지 겹침/프레임 밖 잘림 없음 확인. 상단·다른 카드·카피·링크 변경 없음.

사용자 후속 아이디어: 오리지널 콘텐츠 카드에 표지 대신 실제 물통 게임 또는 4 Queens 플레이 화면을 넣는 방향을 제안함. 아직 게임 화면으로 교체하지 않음. 현재 프로젝트의 prototypes/codle-hub-studio, references, discovery-pack에서 해당 게임명/경로 검색 결과 없음.

## 최신 — 2026-10-26 카드 대표 비주얼 확대

사용자 요청에 따라 카드 이미지 영역만 조정. 상단 도입/전폭 배너/로그인, 카드 크기·3열 2행·문구·링크 유지. 플랫폼은 공식 파란 3D 오브젝트, 오리지널 콘텐츠는 실제 강좌 표지(실생활 AI·파이썬 데이터 분석가), 씨마스는 실제 교과서 표지 확대, 정보 교육자료는 해당 랜딩의 원본 3D 도형, 캠프는 실제 교실 사진, 짓다는 원본 캐릭터와 공식 제작 데모 화면을 배치했다. 원본 파일은 수정하지 않고 CSS로 크롭/배치. 새 원본 5개 및 출처는 `assets/card-visuals/`에 보관. 현재 CSS 버전 `20261026-6`.

검증: 기존 HTML과 비교해 카드 이미지 블록 및 CSS 버전 외 변경 없음. CSS도 이미지 규칙 외 변경 없음. 1280px에서 카드 3열, 배너 약538px, 이미지 11개 정상 로드. 519px에서 1열·가로 넘침 없음. 카드 밖 버튼/로그인 기능 변경 없음.

## 최신 — 실제 랜딩 히어로 썸네일

사용자 요청으로 하단 SVG 일러스트를 각 서비스 실제 랜딩 히어로 캡처로 교체. `assets/landing-heroes/`에 2026-10-26 브라우저 캡처 6종과 sources.json 저장. 데스크톱 1280×720 화면을 기준으로 동일 카드 프레임에서 CSS 크롭, 짓다는 학교 탭. 상단 배너/도입/간결한 로그인/3열 2행 유지. 6개 이미지 로딩 확인.

## 최신 — Labs 카드 확대 및 일러스트 통일

상단 배너/도입 유지. 하단 카드의 과도한 압축을 철회하고 1180px 본문, 3열 2행, 여유 있는 이미지와 설명 구성. `assets/service-art/`의 SVG 6종을 같은 파스텔 배경/화이트 오브젝트/부드러운 그림자 스타일로 제작해 카드 썸네일에 적용. 900px 이하 2열, 600px 이하 1열. 실제 상품 배너 이미지는 변경하지 않음. 이미지 6종 로딩 및 데스크톱 배너 높이 유지 확인.

## 최신 조정 — 서비스 카드 축소

서비스 6개를 함께 훑어볼 수 있도록 카드 높이를 데스크톱 약 251px로 줄이고 이미지·여백·제목을 축소. 소개 문구 간결화. 데스크톱 3열 2행 유지, 모바일 2열 3행으로 변경. 도입/전폭 배너 유지.

## 2026-10-26 — Google Labs 느낌의 하단 그리드 (최신 결정)

- 도입부와 높인 전폭 배너 유지(데스크톱 460–600px, 모바일 380px).
- 넥슨 추천/로그인 패널과 검색·필터 제거. 배너 아래 간결한 로그인 한 줄 영역.
- 서비스 6개를 큰 이미지·소개·바로가기 카드로 배치: 데스크톱 3열 2행, 600px 이하 1열.
- `hub-portal.css`에 현재 레이아웃 정의. `hub-portal.js` 검색 런타임은 더 이상 로드하지 않음.
- 브라우저 확인: 1280px에서 384px 카드 3열/2행, 배너 높이 약 538px 유지, 콘솔 오류 없음.

---

## 2026-10-26 — 넥슨 실측 레이아웃 재적용 (최우선)

사용자가 이전의 축소 카드형 허브를 거절하고 넥슨 실제 배치·비율을 요청함. 실제 nexon.com/Home/Game 화면을 확인하고 1280px 기준 헤더 63px, 전폭 배너 373px, 본문 954px, 추천 영역 483px / 로그인 470px, 추천 행 342px로 맞춤. 전체 서비스는 별도 3열 목록. 기존 도입부 유지. `hub-portal.css` 전면 교체, `hub-portal.js`에 검색·분류 필터 추가. 넥슨의 타사 로그인은 복제하지 않고 실제 코들 로그인과 소개 링크 사용. 이전 소개/상담 대형 섹션은 숨김. 데스크톱 치수, 필터(캠프/해커톤), 검색(씨마스), 좁은 화면 가로 넘침 없음, 브라우저 오류 없음 확인.

---

## 2026-10-26 — 넥슨형 허브 구조 적용 (최신)

- 사용자 요청: 기존 도입부를 유지하면서 로그인과 서비스 6개가 바로 보이는 허브로 변경.
- 현재 진입 파일은 동일: `prototypes/codle-hub-studio/toy-hub/product-mosaic.html`.
- 기존 로고 도입/상품 배경/원형 전환 유지. `hub-portal.css`에서 배너 크기와 포털 레이아웃을 지정.
- 데스크톱: 움직이는 배너 + 로그인 패널, 아래 서비스 6열. 좁은 화면: 배너 + 간결한 로그인 패널 + 서비스 3열 2행.
- 기존 카드 캐러셀 제어를 제거하고 6개 모두 접근 가능한 고정 디렉터리로 변경.
- AI 집중캠프 프로모션 배너 추가. 로그인은 기존 codle.io/sign_in 연결이며 인증 상태 연동이나 배너 업로드 기능은 구현하지 않음.
- 검증: 현재 519px 미리보기에서 6개 카드 모두 화면 안에 노출, 가로 넘침 없음. 배너 다음 버튼 작동, 브라우저 오류 없음, JS 구문 및 diff 검사 통과.

---

# 최신 인수인계 — 2026-10-23

## 최신 사용자 결정과 로컬 업데이트 — 아래 과거 기록보다 우선

- 최신 버전 `20261023-droplet-form1`. 사용자가 이전 물방울 흐름 모션도 더 잘 만들 수 없겠냐고 요청했다. 이번에는 이동 효과 대신 작은 파란 점이 코들 물방울 윤곽으로 만들어지고 검정 링과 글자가 이어져 로고가 완성되는 방식으로 변경했다. 낙하/충돌/눌림/반복 바운스 없음.
- 원본 물방울 경로를 128개 위치에서 읽어 동일한 닫힌 곡선 구조를 만들고, 작은 원 → 꼬리가 형성되는 중간 윤곽 → 물방울로 연속 변형한다. 0.08–1.23초. 변형 종료 후에는 backwards fill을 사용해 원본 SVG 경로가 다시 직접 렌더링된다. CSS d 미지원 시 원형 마스크 확장으로 대체한다.
- 링 0.68초부터, 좌우 글자 마스크 0.88/0.99초부터, 문구 1.70–2.40초. 공유 가로 이동으로 심벌 중앙 구도에서 전체 로고 중앙 구도로 이동하며 글자가 심벌을 가로지르지 않는다. 원본 파랑 #3e88ff 유지.
- 로고/문구 퇴장 2.75–3.28초, 중앙 창 확장 3.0–4.6초, 전체 4.66초. 실제 상품 소개 화면으로 연결하며 스크롤 점프 없음. 기존 상품 카드/문의폼 보존.
- 전체 모션은 공유 Web Animations 타임라인. 일시정지, 탭 숨김 정지, 건너뛰기, reduced-motion, 직접 앵커 링크 건너뛰기 지원. 상품 자동 전환은 도입 완료 이후 시작된다.
- 브라우저에서 점/윤곽 생성/심벌/완성 프레임과 390px 모바일 완성 로고를 확인했다. 원본 HTML 경로 보존, JS 문법 및 diff 공백 검증 통과. 사용자 평가는 대기 중.
- 큰 방향: Customer.io / Stian의 간결한 로고 등장과 R—K / Ravi Klaassens의 중앙 창 전환에서 시작했다. 이후 Better / Alex Gorbunov를 참고했으나 과한 찌그러짐과 범용 슬라이드 효과는 사용자가 거부했다. 추가 도구 아이콘은 제외한다.

## 현재 작업물과 실행

- 브랜치: `codex/mosaic-latest-20261022`
- 현재 편집 대상: `prototypes/codle-hub-studio/toy-hub/product-mosaic.html`
- 스타일 / 동작: 같은 폴더의 `google-labs.css`, `google-labs.js`
- 프로젝트 루트에서 `python3 -m http.server 8878 --bind 127.0.0.1` 실행.
- 열기: http://127.0.0.1:8878/prototypes/codle-hub-studio/toy-hub/product-mosaic.html#top
- 설치/빌드 없이 실행하는 정적 HTML/CSS/JS. 실행 이미지와 폰트는 저장소에 포함.

## 과거 사용자 결정 — 상품 소개 구성에 대한 기록

사용자는 Google Labs(https://labs.google/)를 가장 적절한 레퍼런스로 선정했고, 모자이크를 도입부에 넣는 여러 실험 후 **그 시안은 버리고 Google Labs를 그대로 따라오라**고 요청했다. 현재는 전체 화면 배경 + 큰 중앙 제목 + 둥근 CTA + 자동 슬라이드/진행 막대, 다음 섹션은 기울어진 가로 카드 갤러리 구조다. 브랜드·문구·이미지·서비스 연결은 코들이다.

현재 여섯 진입점: 수업 플랫폼, 오리지널 콘텐츠, 씨마스 인공지능 기초, 금성·YBM 정보 교육자료, AI 집중캠프, 짓다 AI 해커톤. 로그인은 코들 `https://codle.io/sign_in` 링크이며 허브 자체의 인증 세션 구현은 없다. 문의폼은 로컬 디자인 미리보기이며 입력이 실제 전송되지 않는다. 운영자 배너 업로드 관리 기능은 아직 없다.

## 과거 작업 요청 (현재 지시 아님)

마지막 디자인 요청: **“도입부 배경도 구글 랩처럼 움직이게 해봐 이미지 슬라이드만 바뀌는 거 말고”**.

현재 배경은 정적 이미지이며 7초마다 슬라이드가 바뀐다. 사용자는 한 슬라이드 안에서도 배경 자체가 움직이는 표현을 원한다. 실제 Google Labs의 배경 움직임을 확인한 후 구현해야 한다. 이전 로고 드로잉·모자이크 펼침을 다시 복구하지 말 것. 사용자 요청에 따라 이 작업 전에 현재 상태를 커밋/푸시하여 컴퓨터를 옮긴다.

## 보존 파일과 검증

- `product-mosaic-motion-archive.html`: 폐기된 모자이크 모션 조합 시안.
- `product-mosaic-before-labs.html`: 원래 제품 모자이크 시안.
- `product-mosaic.js`, `product-mosaic.css`, `mosaic-service-art.js`: 이전 모자이크용. 현재 HTML에서는 로드하지 않는다.
- 부모 폴더의 `index.html`, `index-mosaic.html`, `hub-*` 및 `hero-*`: 이전 방향 탐색 기록. 현재 편집 대상과 혼동하지 말 것.
- 최신 시안 브라우저 확인: 이미지 로딩 실패 없음, 좁은 뷰포트 가로 넘침 없음, 카드 이동과 자동 슬라이드 전환, 상담창 열기/닫기 확인. `node --check`, `git diff --check` 통과.
- 로컬 `output/`의 검수 캡처와 `videos/`의 별도 영상 작업은 이번 웹사이트 인수인계에 포함하지 않는다.

---

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
