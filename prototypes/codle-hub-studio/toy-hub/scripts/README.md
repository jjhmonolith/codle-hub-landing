# Build the toy models

The landing loads `assets/toy-models-v1.bin.gz`. It does not run the expensive
silhouette solver on a visitor's first load. Materials, lighting, and motion
remain in `toys.js`; shape construction lives in `toy-geometry.js` and
`soft-volume.js`.

After changing the shapes or source SVGs, run with Node.js 22.15+ and `xml-js`
available to Node:

```sh
node scripts/build-toy-models.mjs
```

Alternatively set `XML_JS_MODULE` to an installed `xml-js` module directory.
Run the command from the `toy-hub` directory. The build verifies all five parts,
unchanged triangle indices, and attribute precision through the runtime decoder.
Positions are quantized to 16 bits per component (maximum error below 0.000009
model units for the current shapes); colors, normals, and masks use the same
bounded encoding. The geometry is not simplified.

When replacing a published model asset, bump its filename in `mesh-pack.js` and
the preload in `index.html` together to avoid stale caches. The site's normal
module version strings must be bumped when changing runtime code.

The build-time SVG adapter supports the path/circle elements and simple fill
classes in the current source logos; extend it before introducing other CSS
rules or referenced SVG elements.

# Check the scroll sequence

Run these from `toy-hub` after changing the scene timing or cover paths:

```sh
node scripts/check-feature-sequence.mjs
node scripts/check-content-flow.mjs
node scripts/check-motion.mjs
```

Each product has a feature showcase followed by a landing reveal. Chapter
buttons target the showcase (`phase .22`); keyboard skip targets the landing
(`phase .80`). The opening keeps its original physical scroll distance.
The content checks cover authentic asset uniqueness, finite depth positions,
invisible recycling, foreground speed and header/title clearance.
Review the actual page on desktop and mobile as well; these checks do not
replace visual review or the live landing open/close check.
