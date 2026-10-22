# Swift Junk Removal V5 "Rollout"

A product-launch take on junk removal. The hero is a 3D clay room that clears itself as you scroll.

## Look
- Studio light: `#eef1f4` ground, white sheets, ink `#0a0e13`, one signal orange `#ff5a1f` used only for energy (the clear sweep, pins, progress).
- Funnel Display (headlines, tight tracking) + Funnel Sans (text).
- Everything illustrated is the same clay language: rounded boxes, soft shadows, one key light.

## Moments
1. Hero: room builds in, then scroll scrubs a sweep that dissolves every item into sparks. A live counter ticks 18 -> 0.
2. Promise sheet slides over the pinned hero.
3. "Whatever's in the way": five rendered dioramas in a swipe lineup.
4. How it works: three phones that play once (camera -> price -> cleared room).
5. Coverage: real OSM roads, ZIP check drives the map.
6. Quote: a 3D pickup that fills as you move the slider.
7. Finale: the empty room, lit.

## Build
No build step for the page itself: `index.html` is assembled from `_dev/tpl.html` + fragments (`python -I _dev/assemble.py`).
3D lives in `_dev/src/*` and is bundled by `node _dev/build.cjs` to `js/scene.js` (three.js, classic script, works from file://).
Stills (`img/scene-*.webp`, `img/room-*.webp`) come from `node _dev/stills.cjs` + `_dev/finalize.py`.
Map paths come from OSM via `_dev/mapgen.py`.
