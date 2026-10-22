// The junk. Every prop is a small clay model with its feet at y = 0, built from rounded boxes and cylinders.
import { THREE, clay, rb, cyl, sph, at, tube, group, part, rng, dissolvable } from './kit.js';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export const C = {
  cardboard: '#c9a278', cardboardLt: '#dcc19b', tape: '#e4d3b4', label: '#f1ede4',
  sofa: '#587a8c', sofaLt: '#6d93a7', pillow: '#d9a441',
  ochre: '#cf9a5f', mattress: '#efede8', mattressBand: '#b9cddc',
  steel: '#dde2e6', dark: '#1d2024', darker: '#14161a', bag: '#262b31',
  tote: '#7fb0dc', toteLid: '#3e6e9f', wood: '#d3b283', woodDk: '#b99669',
  teal: '#3f8b82', rug: '#a9b8c1', terracotta: '#b9694a', leaf: '#6f9460', lamp: '#e8c36a',
};

/* ---------- boxes ---------- */
export function cardboard(w = 1, h = .8, d = .8, o = {}) {
  const g = new THREE.Group();
  const body = rb(w, h, d, clay(o.c || C.cardboard, { r: .95 }), .035);
  body.position.y = h / 2; g.add(body);
  // packing tape across the lid, and the seam it covers
  const tp = rb(w * .22, .016, d * 1.002, clay(C.tape, { r: .5 }), .006, 1); tp.position.y = h + .003; g.add(tp);
  const tp2 = rb(.016, h * .5, d * .22, clay(C.tape, { r: .5 }), .006, 1); tp2.position.set(w / 2 + .001, h * .78, 0); g.add(tp2);
  if (o.label !== false) { const lb = rb(.012, h * .26, d * .3, clay(C.label, { r: .8 }), .004, 1); lb.position.set(w / 2 + .004, h * .42, d * .16); g.add(lb); }
  return g;
}

/* ---------- soft furniture ---------- */
export function sofa(L = 3.1) {
  const g = new THREE.Group();
  const body = clay(C.sofa, { r: .92, sheen: .5 }), soft = clay(C.sofaLt, { r: .95, sheen: .6 }), leg = clay(C.dark, { r: .5 });
  g.add(at(rb(L, .5, 1.25, body, .12), 0, .42, 0));
  g.add(at(rb(L, .95, .42, body, .14), 0, .92, -.42));
  [-1, 1].forEach((s) => g.add(at(rb(.36, .74, 1.25, body, .14), s * (L / 2 - .18), .72, 0)));
  const cw = (L - .72 - .06) / 3;
  for (let i = 0; i < 3; i++) {
    const x = (i - 1) * (cw + .015);
    g.add(at(rb(cw, .26, .86, soft, .1), x, .79, .15));
    g.add(at(rb(cw - .02, .56, .26, soft, .11), x, 1.18, -.12, 0, -.2));
  }
  g.add(at(rb(.5, .46, .16, clay(C.pillow, { r: .95, sheen: .6 }), .08), -L / 2 + .75, 1.08, .28, .35, -.28));
  [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([a, b]) => g.add(at(cyl(.07, .05, .2, leg), a * (L / 2 - .2), .1, b * .46)));
  return g;
}
export function armchair() {
  const g = new THREE.Group();
  const body = clay(C.ochre, { r: .92, sheen: .5 }), soft = clay('#dcab72', { r: .95, sheen: .6 }), leg = clay(C.dark, { r: .5 });
  g.add(at(rb(1.15, .42, 1.1, body, .12), 0, .4, 0));
  g.add(at(rb(1.15, .9, .34, body, .13), 0, .85, -.4));
  [-1, 1].forEach((s) => g.add(at(rb(.26, .62, 1.1, body, .12), s * .45, .68, 0)));
  g.add(at(rb(.72, .2, .78, soft, .09), 0, .71, .1));
  g.add(at(rb(.7, .48, .2, soft, .1), 0, 1.0, -.2, 0, -.18));
  [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([a, b]) => g.add(at(cyl(.06, .045, .22, leg), a * .46, .11, b * .42)));
  return g;
}
export function mattress(w = 1.9, t = .42, l = 2.9) {
  const g = new THREE.Group();
  g.add(at(rb(w, t, l, clay('#e3eaf1', { r: .95, sheen: .5 }), .13, 4), 0, t / 2, 0));
  g.add(at(rb(w + .012, t * .22, l + .012, clay('#8db0cf', { r: .9 }), .05), 0, t * .5, 0));
  // quilted top: a diamond pattern on a thin transparent plane
  const c = document.createElement('canvas'); c.width = 256; c.height = 384;
  const x = c.getContext('2d'); x.strokeStyle = 'rgba(95,130,165,.38)'; x.lineWidth = 2.2;
  for (let i = -6; i <= 12; i++) { x.beginPath(); x.moveTo(i * 32, 0); x.lineTo(i * 32 + 384, 384); x.stroke(); x.beginPath(); x.moveTo(i * 32 + 384, 0); x.lineTo(i * 32, 384); x.stroke(); }
  x.strokeStyle = 'rgba(95,130,165,.55)'; x.lineWidth = 5; x.strokeRect(10, 10, 236, 364);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const q = part(new THREE.PlaneGeometry(w - .26, l - .26), dissolvable(new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 1, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 })), { cast: false });
  q.rotation.x = -Math.PI / 2; q.position.y = t + .004; g.add(q);
  return g;
}
export function rug(w = .62, l = 2.2) {
  const g = new THREE.Group();
  g.add(at(cyl(w / 2, w / 2, l, clay(C.rug, { r: 1 }), 40), 0, w / 2, 0, 0, 0, Math.PI / 2));
  [-1, 1].forEach((s) => {
    g.add(at(cyl(w * .36, w * .36, .02, clay('#8e9da6', { r: 1 }), 32), s * (l / 2 + .003), w / 2, 0, 0, 0, Math.PI / 2));
    g.add(at(cyl(w * .17, w * .17, .024, clay('#7d8c96', { r: 1 }), 24), s * (l / 2 + .004), w / 2, 0, 0, 0, Math.PI / 2));
  });
  return g;
}

/* ---------- appliances & electronics ---------- */
export function fridge() {
  const g = new THREE.Group();
  const body = clay(C.steel, { r: .38, m: .12, env: .9 }), edge = clay('#9aa2a9', { r: .5 }), handle = clay('#8c949b', { r: .35, m: .4 });
  g.add(at(rb(1.12, 2.55, 1.0, body, .09, 4), 0, 1.3, 0));
  g.add(at(rb(1.14, .025, 1.01, edge, .005, 1), 0, 1.72, 0));
  g.add(at(rb(.05, .8, .06, handle, .02), .4, 2.08, .53));
  g.add(at(rb(.05, 1.0, .06, handle, .02), .4, 1.12, .53));
  [-1, 1].forEach((s) => g.add(at(cyl(.06, .06, .05, clay(C.dark), 12), s * .45, .025, .38)));
  return g;
}
export function washer() {
  const g = new THREE.Group();
  const body = clay('#f1f3f4', { r: .4, m: .05, env: .8 });
  g.add(at(rb(1.1, 1.38, 1.05, body, .08, 4), 0, .72, 0));
  g.add(at(cyl(.4, .4, .08, clay('#cfd5d9', { r: .3, m: .3 }), 40), 0, .66, .54, 0, Math.PI / 2));
  g.add(at(cyl(.31, .31, .1, clay('#26303a', { r: .15, cc: 1, env: 1.2 }), 40), 0, .66, .56, 0, Math.PI / 2));
  g.add(at(rb(1.0, .16, .04, clay('#dfe4e7', { r: .4 }), .02), 0, 1.22, .53));
  [-.3, .1, .32].forEach((x) => g.add(at(cyl(.045, .045, .04, clay('#6b747b', { r: .4, m: .3 }), 16), x, 1.22, .56, 0, Math.PI / 2)));
  return g;
}
export function tv(w = 2.0, h = 1.15) {
  const g = new THREE.Group();
  g.add(at(rb(w, h, .09, clay(C.darker, { r: .4 }), .03), 0, h / 2, 0));
  g.add(at(rb(w - .1, h - .1, .012, clay('#0b0c0e', { r: .08, cc: 1, env: 1.4 }), .01, 2), 0, h / 2, .05));
  g.add(at(rb(.5, .05, .3, clay(C.dark, { r: .5 }), .02), 0, .025, -.12));
  return g;
}

/* ---------- bags, bins, lumber ---------- */
export function bag(r = .5, seed = 1) {
  const g = new THREE.Group();
  let geo = new THREE.IcosahedronGeometry(r, 5);
  geo.deleteAttribute('normal'); geo.deleteAttribute('uv'); geo = mergeVertices(geo, 1e-4);
  const p = geo.attributes.position, rand = rng(seed * 97);
  const ph = [rand() * 6, rand() * 6, rand() * 6];
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const n = 1 + .09 * Math.sin(x * 5 + ph[0]) * Math.cos(z * 4 + ph[1]) + .06 * Math.sin(y * 6 + ph[2]);
    const t = Math.min(1, Math.max(0, (y / r - .15) / .95));
    const neck = 1 - .52 * t * t * (3 - 2 * t);       // gathers toward the tie
    const sq = y < 0 ? 1.14 : 1;                       // slumps wider at the bottom
    p.setXYZ(i, x * n * sq * neck, y * n * .98 + r * .98 * .8, z * n * sq * neck);
  }
  geo.computeVertexNormals();
  const m = part(geo, clay(C.bag, { r: .32, cc: .6, env: 1 }));
  g.add(m);
  // the knotted neck
  const knot = cyl(r * .1, r * .16, r * .3, clay(C.bag, { r: .32, cc: .6 }), 12); knot.position.y = r * 1.62; g.add(knot);
  const ear = sph(r * .2, clay(C.bag, { r: .32, cc: .6 }), 1.7, .6, .9, 12); ear.position.set(r * .16, r * 1.84, 0); ear.rotation.z = .35; g.add(ear);
  const ear2 = sph(r * .17, clay(C.bag, { r: .32, cc: .6 }), 1.5, .6, .9, 12); ear2.position.set(-r * .14, r * 1.8, .02); ear2.rotation.z = -.5; g.add(ear2);
  return g;
}
export function tote(w = 1.1, h = .62, d = .75, lid = true, col) {
  const g = new THREE.Group();
  const bgeo = tapered(w, h, d, .88);
  g.add(at(part(bgeo, clay(col || C.tote, { r: .42, cc: .5, env: .9 })), 0, h / 2, 0));
  if (lid) {
    g.add(at(rb(w * 1.03, .09, d * 1.04, clay(C.toteLid, { r: .5, cc: .4 }), .035), 0, h + .045, 0));
    g.add(at(rb(w * .34, .05, .1, clay(C.toteLid, { r: .5 }), .02), 0, h + .115, d * .27));
    g.add(at(rb(w * .34, .05, .1, clay(C.toteLid, { r: .5 }), .02), 0, h + .115, -d * .27));
  }
  return g;
}
function tapered(w, h, d, k) {
  // a rounded box whose bottom is narrower than its top, like a storage tote
  const r = rb(w, h, d, clay('#fff'), .06, 4).geometry;
  const p = r.attributes.position;
  for (let i = 0; i < p.count; i++) { const t = (p.getY(i) / h) + .5; const s = k + (1 - k) * t; p.setX(i, p.getX(i) * s); p.setZ(i, p.getZ(i) * s); }
  r.computeVertexNormals();
  return r;
}
export function planks(rand) {
  const g = new THREE.Group();
  const specs = [[2.8, .42, .1, 0, 0, 0, C.wood], [2.5, .42, .1, .05, .1, .06, C.woodDk], [3.0, .42, .1, -.08, .2, 0, C.wood], [2.2, .42, .1, .1, .3, -.05, C.woodDk]];
  specs.forEach(([l, d, h, ox, y, rot, c], i) => g.add(at(rb(l, h, d, clay(c, { r: .9 }), .018, 2), ox, h / 2 + i * h * 1.02, i * .02, rot)));
  return g;
}

/* ---------- smaller things ---------- */
export function bike() {
  const g = new THREE.Group();
  const frame = clay(C.teal, { r: .45, cc: .5, env: .9 }), black = clay(C.darker, { r: .55 }), rim = clay('#c3c9ce', { r: .3, m: .6, env: 1 });
  const R = .56, base = .56, wb = 1.18;
  const rear = [-wb / 2, base, 0], front = [wb / 2, base, 0];
  [rear, front].forEach((c) => {
    const tire = part(new THREE.TorusGeometry(R, .05, 14, 48), black); tire.position.set(c[0], c[1], 0); g.add(tire);
    const rm = part(new THREE.TorusGeometry(R - .06, .016, 8, 48), rim); rm.position.set(c[0], c[1], 0); g.add(rm);
    const hub = cyl(.05, .05, .1, rim, 12); hub.rotation.x = Math.PI / 2; hub.position.set(c[0], c[1], 0); g.add(hub);
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI; g.add(tube([c[0] - Math.cos(a) * (R - .06), c[1] - Math.sin(a) * (R - .06), 0], [c[0] + Math.cos(a) * (R - .06), c[1] + Math.sin(a) * (R - .06), 0], .004, rim, 4)); }
  });
  const bb = [.02, .34, 0], seat = [-.2, 1.0, 0], head = [.4, .98, 0];
  g.add(tube(bb, seat, .027, frame)); g.add(tube(seat, head, .027, frame)); g.add(tube(bb, head, .032, frame));
  g.add(tube(bb, rear, .02, frame)); g.add(tube(seat, rear, .02, frame));
  g.add(tube(head, front, .024, frame));
  g.add(tube(head, [.37, 1.12, 0], .022, black)); g.add(tube([.37, 1.12, -.26], [.37, 1.12, .26], .02, black));
  g.add(at(rb(.3, .06, .11, black, .028), -.24, 1.1, 0)); g.add(tube(seat, [-.22, 1.08, 0], .02, black));
  g.add(tube([.02, .34, -.16], [.02, .34, .16], .018, black));
  return g;
}
export function lamp() {
  const g = new THREE.Group();
  g.add(at(cyl(.28, .3, .05, clay(C.dark, { r: .5 }), 28), 0, .025, 0));
  g.add(at(cyl(.022, .022, 2.0, clay(C.dark, { r: .4, m: .3 }), 10), 0, 1.0, 0));
  const shade = part(new THREE.CylinderGeometry(.26, .4, .5, 32, 1, true), dissolvable(new THREE.MeshStandardMaterial({ color: C.lamp, roughness: .9, side: THREE.DoubleSide, emissive: C.lamp, emissiveIntensity: .18 })));
  shade.position.y = 2.1; g.add(shade);
  return g;
}
export function plant() {
  const g = new THREE.Group();
  g.add(at(cyl(.36, .26, .55, clay(C.terracotta, { r: .9 }), 28), 0, .275, 0));
  g.add(at(cyl(.38, .38, .08, clay('#c27a5a', { r: .9 }), 28), 0, .57, 0));
  g.add(at(cyl(.3, .3, .02, clay('#4a3b30', { r: 1 }), 24), 0, .6, 0));
  const lf = clay(C.leaf, { r: .8, sheen: .4 });
  [[0, 0], [.35, 1.1], [-.4, 2.2], [.2, 3.3], [-.2, 4.4], [.45, 5.3], [-.3, 6.0]].forEach(([tilt, ry], i) => {
    const leaf = sph(.16, lf, .5, 1.9 + (i % 3) * .3, .2, 16);
    const holder = new THREE.Group(); leaf.position.y = .34 + (i % 3) * .06; holder.add(leaf);
    holder.position.y = .6; holder.rotation.set(.35 + tilt * .4, ry, 0, 'YXZ'); g.add(holder);
  });
  return g;
}
export function chair() {
  const g = new THREE.Group();
  const w = clay(C.woodDk, { r: .85 }), s = clay('#c9b08a', { r: .9 });
  g.add(at(rb(.62, .08, .6, s, .03), 0, .55, 0));
  [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([a, b]) => g.add(at(rb(.06, .55, .06, w, .02), a * .26, .275, b * .25)));
  g.add(at(rb(.6, .08, .05, w, .02), 0, 1.0, -.27)); g.add(at(rb(.6, .08, .05, w, .02), 0, .84, -.27));
  [-1, 1].forEach((a) => g.add(at(rb(.06, .5, .06, w, .02), a * .26, .85, -.27)));
  return g;
}
