# 작업 이어가기 — 2026-10-22

- 저장소: jjhmonolith/codle-hub-landing
- 브랜치: codex/six-service-mosaic
- 실행: 저장소 루트에서 `python -m http.server 8877 --bind 127.0.0.1`
- 미리보기: http://127.0.0.1:8877/prototypes/codle-hub-studio/toy-hub/product-mosaic.html
- 주요 파일: 같은 폴더의 product-mosaic.css, product-mosaic.js, mosaic-service-art.js

## 현재 상태

데스크톱만 작업 중. 모바일은 추후 진행. 문의 폼은 실제 전송 없는 미리보기.
기본 일러스트는 채워진 면, 절제된 색, 단순한 2D 스타일을 유지한다.
수업 플랫폼: 기본 활동 아이콘이 왼쪽 목록으로 모이며 오른쪽 코들 수업 화면이 펼쳐지는 모션. 사용자가 일단 승인한 상태.
오리지널 콘텐츠: 가장 최근 시안은 교재 한 권에서 게임·데이터·AI 세 면이 수평으로 이어져 펼쳐지는 모션. 마우스를 빼면 현재 위치부터 역방향으로 포개진다. 아직 최종 디자인 승인 전.
씨마스는 자주색. 짓다는 안전모 호버 시 얼굴이 보이는 방식. 집중캠프는 세 학생이 노트북을 함께 보는 구도.
푸터 균형과 집중캠프 통일감은 향후 다듬을 항목.

## 디자인 맥락

IBM/BUCK처럼 단정한 면, 구조가 읽히는 모션을 선호한다. 가짜 텍스트와 복잡한 UI, 장식, 과한 캐릭터 연기를 피한다.
콘텐츠와 수업 플랫폼이 같은 카드 격자로 보이면 안 된다. 콘텐츠의 다양한 주제와 수업에서 만드는 결과물을 보여주는 방향.
참고: https://buck.co/work/ibm-design-language 및 https://buck.co/work/mailchimp-the-cube

## 참고 파일

platform-motion-storyboard.html은 이전 수업 플랫폼 구도 검토용이며 현재 완성 시안이 아니다.
assets/worlds/codle-character-*와 references/character-source/official-animation.json은 앞서 검토했던 공식 코들 캐릭터 자료다. 현재 콘텐츠 시안에서는 사용하지 않는다. 출처는 codle-character.sources.json에 기록되어 있다.

## 검증

mosaic-service-art.js 및 product-mosaic.js 구문 검사, git diff --check 통과.
로컬 브라우저에서 기본/활성/복귀 상태 확인. 키보드 포커스는 포인터와 같은 활성 상태를 사용한다.
