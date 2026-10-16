# 배움의 문 — 공간형 오프닝 시안

Local prototype. Product-independent architectural opening → hero copy → product catalog.

- The sculptural gateway, lights, landscape, and camera are real-time Three.js geometry.
- Product entries live in `catalog.js`; opening geometry and timing do not use the product count.
- Actual landing screenshots are reused from the previous prototype. Destination frames are preloaded and never reparented or assigned their URLs again during expansion and close. External server availability still affects first load.
- Skip link, keyboard navigation, close button, Escape, reduced motion, and a static WebGL fallback are included.
- Existing prototypes and synced `sources/` are unchanged. No publication or paid generation.

Assets reused from the project: Pretendard, Codle vector, actual landing screenshots.
Poly Haven CC0: Sandy Gravel textures (https://polyhaven.com/a/sandy_gravel), Quarry 01 Pure Sky HDR (https://polyhaven.com/a/quarry_01_puresky).
Moon Rock 01 photogrammetry: https://polyhaven.com/a/moon_rock_01 (CC0).
Three.js 0.180.0: MIT, license in `vendor/LICENSE`.

Verified in the in-app browser on 2026-10-16: opening → hero → five entries, desktop and 390×844 layout without horizontal overflow, live Codle and Jitda expansion, close/Escape and focus return. All five frames loaded once; opening a loaded frame did not increment its load count. Module syntax checks passed. External pages may run their own intro animations or load content after display.
