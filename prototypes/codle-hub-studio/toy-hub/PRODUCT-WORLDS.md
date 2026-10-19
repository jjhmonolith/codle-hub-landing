# Product scenes

The logo and hero opening is preserved. The five destinations share a reversible
camera approach, but have their own surrounding objects and atmosphere.

- Platform: original Codle Python, Entry, PDF, AI Socroom and quiz artwork;
  a matching HTML symbol; blue orbital paths.
- Contents: actual learning-content screenshots; violet gallery arcs.
- Textbook: a hinged open book with curved, lit leaves, a hardback with physical paper edges and bookmark, and a metal pencil; a blue paper grid.
- Camp: beveled practice and team devices with glass fronts, an AI token and a modeled connection sculpture; green paths.
- Jitda: a miniature hinged laptop with an instanced keyboard, an app preview device, an extruded cursor and assembling UI modules; a warm construction grid.

The decorative textbook/camp/Jitda panels are illustrations, not live app state.
All interactive destination links still open the original preloaded landing pages.
Decorative objects are hidden from assistive technology and do not intercept input.
Reduced motion or WebGL failure uses the static list of all five destinations.

## Original assets

Read from the official pages on 2026-10-18:

- `assets/worlds/codle-tools-ui.png`: https://alvm1224.dothome.co.kr/codle/video4-1.png
  (embedded at https://ai.codle.io/kr/create_lessons). White icon marks are extracted at runtime from this unchanged original image and applied to beveled 3D tool bodies.
- `assets/worlds/content-ai.png`: https://ai.codle.io/content-slide-1-1.png
- `assets/worlds/content-esg.png`: https://ai.codle.io/content-slide-1-3.png
- `assets/worlds/content-project.png`: https://ai.codle.io/content-slide-2-2.png

Scene objects are keyed by product ID in `volume-worlds.js`; the subtle backgrounds are in `product-worlds.js`. The independent
camera phase is in `surface-timeline.js`; the single 3D page surface lives in
`landing-surface.js`. Existing logo geometry/materials remain in `toys.js`.

## Volume pass — 2026-10-18

Props and the landing plane share one PerspectiveCamera and depth buffer. A local
PMREM studio light rig, physical materials, bevels, glass layers and back geometry
make rotation reveal real volume. Solid tool tokens and the Jitda cursor have
staggered complete rotations around an oblique axis, separated by readable holds.
Books and screen devices rotate gently; the open book has an independent leaf.
Scroll displacement is reversible. Near props accelerate toward the camera and
sweep past its sides; incoming props start farther away. Static DOM decorations
were removed. A 30 fps idle render is paused when hidden or a landing is open;
scroll-driven rendering follows animation frames. No external runtime assets or
new dependencies were added.

Verified: all five desktop stations; 390×844 mobile and 1600×900 desktop;
mobile book/Jitda placement; 44 px chapter targets; no horizontal overflow;
forward/reverse navigation; original logo and hero; opening/closing the preloaded
Jitda iframe without reload; all five iframe load counts remain one; WebGL-failure
static destination list; clean normal-page error logs; JS syntax checks.
Temporary QA fixtures are removed after use. Screenshots in this directory are
review evidence, not runtime assets. Do not publish or commit without a new request.

## Responsive and transition review — 2026-10-18

Short desktop review exposed a laptop/header collision and a cursor/title collision.
Prop size now uses both viewport dimensions, with a compact-height composition
and upper-right clearance for the chapter counter. Checked 1440×600 textbook and
Jitda, 1024×600 contents/camp, and 1600×900 textbook/Jitda.

The former transition zoom magnified the screenshot across the entire viewport.
The page now turns obliquely and recedes slightly; an incoming set of distant
objects begins arriving while the nearer outgoing objects sweep past the sides.
Forward and reverse samples retain context rather than filling the view with
cropped text. The resting landing scale and original destination links remain.
Mobile 390×844 transition and live Jitda expansion were checked again; all five
iframes still load once, closing restores focus, and the stage stays unscrolled.

No further concrete defects remain from this review. This completes the current
prototype refinement for user review; the heartbeat is paused, not left running
to consume the remaining budget. Evidence files are recorded in
`development-state.json`. No publishing or Git write action was performed.

## Motion revision after user feedback — 2026-10-18

The user found the rotation awkward. This revision supersedes the full-spin and
oblique page-flip descriptions above. Timed full-turn bursts, compounded Euler
wobble and the secondary logo orbit are removed. Props use one bounded, slow
rotation axis, with additional lean tied to their scroll displacement. Near props
still pass faster than distant props; alternating vertical swoops are removed.
Book-leaf, lid and stack motion is restrained rather than running separate loops.

The central landing remains flat and almost front-facing throughout the handoff.
A narrow reveal changes the screenshot without overlapping whole pages of text.
Idle rotation is bounded to 1.47 degrees/second; the landing's maximum yaw is
4.11 degrees. `node scripts/check-motion.mjs` verifies these design constraints.
Desktop and mobile preview checks complement these numerical tests; they do not
replace the user's judgment of the visual direction. Automation stays paused.
