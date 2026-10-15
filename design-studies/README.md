# 랜딩 허브 디자인 작업 기록

2026-10-15 브랜치 정리 시점까지의 실험을 보존합니다. 모두 검토용 기록이며 최종 채택 디자인이 아닙니다. 현재 유지하는 랜딩은 저장소 루트 README에 안내된 두 버전입니다.

| 폴더 | 내용 |
| --- | --- |
| `asset-scene/` | 기존 에셋과 Poly Haven 자료로 만든 3D 모니터·배경 시안. 출처는 내부 `ASSET-SOURCES.txt`. |
| `cinematic-scroll/` | 포털 이미지·접근 영상·프레임 시퀀스와 스크롤 시안. 사용자 피드백으로 실패작으로 분류했습니다. |
| `hub-grid/` | 공통 비주얼과 랜딩 링크 카드 그리드 시안. 채택되지 않았습니다. |
| `hero-concepts/` | 스토리보드 및 히어로 이미지 9종. 아래 목록 참조. |
| `references/` | 공식 UI 자료, 실제 브랜드 심볼, GLOBAL TRAVELER 참고 프레임, 3D 에셋 조회 자료. |
| `previous-session/` | 이전 랜딩 작업에서 남긴 미리보기 이미지와 비교 자료. |

## 이미지 실험 순서

1. `01-school-storyboard.png`: 교실에서 학교·창작 공간으로 확장.
2. `02-return-path-storyboard.png`: 코들·짓다를 곡선 경로로 연결.
3. `03-scene-loop-storyboard.png`: 코들 접근 → 짓다 장면 → 코들 복귀.
4. `04-open-book-hero.png`: 책 위에 열린 배움의 공간.
5. `05-product-ui-hero.png`: 코들·짓다 UI를 큰 화면으로 표현.
6. `06-landmark-buildings.png`: 러닝 타워와 메이커 파빌리온.
7. `07-brand-symbols.png`: 실제 브랜드 심볼의 입체화.
8. `08-clay-classroom-stage.png`: 클레이 교실과 해커톤 무대.
9. `09-clay-bench-arena.png`: 클레이 실습 테이블과 원형 발표 무대.

이 이미지들은 내장 이미지 생성으로 제작한 구도 시안입니다. 화면 안 UI는 참고 자료를 바탕으로 생성되었으므로 실제 서비스의 정확한 캡처로 취급하지 않습니다. 사용자가 원한 완성도에 도달하지 않았으며 자동으로 활성 랜딩에 적용하지 않습니다.

## 참고 자료

- GLOBAL TRAVELER: https://herolanding.kr/portfolio 의 공개 시연 영상 `portfolio-02-0304.webm`에서 추출한 프레임. 제작 도구나 실제 웹 구현 방식은 확인되지 않았습니다.
- 코들 공식 UI: https://ai.codle.io/kr/help/guide/new-material 의 공개 사용 가이드.
- 코들·짓다 브랜드 심볼: 기존 프로젝트의 SVG 에셋을 참고용 PNG로 렌더링했습니다.
- 짓다 기능 및 공개 UI 예시: https://landing.jitda.io/ . 별도 인증이 필요한 실제 서비스 세션을 캡처한 것은 아닙니다.
- 클레이 비교 참고: Irma Gruenholz, https://www.behance.net/gallery/43380149/Clay-Illustrations-2016 . 작가의 작품 이미지는 이 저장소에 복사하지 않았습니다.

## 영상 실험 기록

`cinematic-scroll/`의 포털 접근 영상은 기존에 실행했던 Replicate 영상 생성 1회의 결과와 관련 스크립트·설정을 보관한 것입니다. 이번 브랜치 정리에서는 이미지나 영상 생성 API를 실행하지 않았습니다. API 키와 환경 파일은 포함하지 않았습니다.

영상과 프레임 시퀀스는 실패 시안의 재현·검토 기록이며, 기본 랜딩에서 사용하지 않습니다. 새 유료 생성은 사용자가 명시적으로 제작을 요청하고 비용을 확인한 경우에 진행해야 합니다.
