// More props, for the five "what we take" dioramas: shelving, construction debris, an office, a yard.
import { THREE, clay, rb, cyl, sph, at, tube, part, rng } from './kit.js';
import * as P from './props.js';

const G = { metal: '#8b959e', metalLt: '#c8cfd5', white: '#e9e7e1', wood: '#c9a77a', woodDk: '#a98558', green: '#6d9a58', greenDk: '#4f7a45', bark: '#7a5a3d', gray: '#aeb6bd', charcoal: '#2a2f35' };

export function shelf(w = 2.3, h = 2.7, d = .8, boards = 4) {
  const g = new THREE.Group(), post = clay(G.metal, { r: .45, m: .35, env: .9 }), board = clay(G.metalLt, { r: .5, m: .2 });
  [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([a, b]) => g.add(at(rb(.07, h, .07, post, .02), a * (w / 2 - .04), h / 2, b * (d / 2 - .04))));
  for (let i = 0; i < boards; i++) g.add(at(rb(w, .05, d, board, .015), 0, .12 + i * ((h - .2) / (boards - 1)), 0));
  return g;
}
export function drywall(n = 5) {
  const g = new THREE.Group();
  for (let i = 0; i < n; i++) g.add(at(rb(2.5, .07, 1.25, clay(i % 2 ? '#dedbd3' : G.white, { r: .95 }), .018, 2), (i % 3 - 1) * .05, .04 + i * .075, (i % 2 - .5) * .04, (i - n / 2) * .02));
  g.add(at(rb(2.5, .02, .3, clay('#b8b3a8', { r: .95 }), .008, 1), 0, .08 + n * .075, .3, .1));
  return g;
}
export function bucket(col = '#d5dade') {
  const g = new THREE.Group(), m = clay(col, { r: .5, cc: .3 });
  g.add(at(cyl(.3, .25, .55, m, 32), 0, .275, 0));
  g.add(at(cyl(.32, .32, .05, clay('#aab2b9', { r: .5 }), 32), 0, .56, 0));
  const h = part(new THREE.TorusGeometry(.3, .018, 8, 24, Math.PI), clay('#6b747b', { r: .4, m: .5 })); h.position.y = .56; g.add(h);
  return g;
}
export function wheelbarrow() {
  const g = new THREE.Group(), tray = clay('#d9a441', { r: .5, cc: .3 }), dark = clay(G.charcoal, { r: .5 }), steel = clay(G.metal, { r: .4, m: .5 });
  const t = rb(1.3, .5, .85, tray, .14, 4); const p = t.geometry.attributes.position;
  for (let i = 0; i < p.count; i++) { const k = (p.getY(i) / .5) + .5; p.setX(i, p.getX(i) * (.78 + .22 * k)); p.setZ(i, p.getZ(i) * (.7 + .3 * k)); } t.geometry.computeVertexNormals();
  t.position.set(.1, .72, 0); t.rotation.z = .12; g.add(t);
  const w = part(new THREE.TorusGeometry(.26, .09, 14, 28), dark); w.position.set(.78, .27, 0); g.add(w);
  g.add(at(cyl(.035, .035, .2, steel, 10), .78, .27, 0, 0, Math.PI / 2));
  [-1, 1].forEach((s) => { g.add(tube([.62, .55, s * .26], [-1.0, .72, s * .3], .03, steel)); g.add(tube([-.4, .66, s * .3], [-.5, 0, s * .34], .03, steel)); g.add(at(rb(.3, .05, .07, dark, .02), -1.15, .74, s * .3)); });
  return g;
}
export function cabinet(w = 1.5, h = .95, d = .62, col = '#c9b79a') {
  const g = new THREE.Group(), body = clay(col, { r: .8 }), door = clay('#d8c9ae', { r: .75 }), knob = clay('#6b747b', { r: .35, m: .6 });
  g.add(at(rb(w, h, d, body, .03), 0, h / 2 + .06, 0));
  [-1, 1].forEach((s) => { g.add(at(rb(w / 2 - .06, h - .12, .04, door, .015), s * (w / 4), h / 2 + .06, d / 2 + .01)); g.add(at(sph(.035, knob), s * .09, h / 2 + .06, d / 2 + .05)); });
  g.add(at(rb(w, .06, d * .9, clay(G.charcoal, { r: .6 }), .01), 0, .03, 0));
  return g;
}
export function desk() {
  const g = new THREE.Group(), top = clay('#d8c2a0', { r: .7 }), body = clay('#b9c1c8', { r: .6 }), dark = clay(G.charcoal, { r: .5 });
  g.add(at(rb(2.1, .07, .95, top, .02), 0, .78, 0));
  g.add(at(rb(.62, .72, .85, body, .02), .68, .38, 0));
  [0, 1, 2].forEach((i) => { g.add(at(rb(.54, .2, .02, clay('#cdd3d8', { r: .6 }), .01), .68, .6 - i * .22, .44)); g.add(at(rb(.2, .025, .03, dark, .01), .68, .62 - i * .22, .46)); });
  g.add(at(rb(.07, .76, .85, body, .02), -.98, .38, 0));
  return g;
}
export function officeChair() {
  const g = new THREE.Group(), pad = clay('#3b4652', { r: .85, sheen: .4 }), dark = clay(G.charcoal, { r: .5 });
  g.add(at(rb(.7, .12, .7, pad, .05), 0, .62, 0));
  g.add(at(rb(.66, .8, .12, pad, .06), 0, 1.1, -.3, 0, -.12));
  g.add(at(cyl(.04, .04, .32, dark, 12), 0, .4, 0));
  for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; g.add(tube([0, .24, 0], [Math.cos(a) * .36, .12, Math.sin(a) * .36], .03, dark)); g.add(at(sph(.055, dark), Math.cos(a) * .37, .07, Math.sin(a) * .37)); }
  return g;
}
export function filingCabinet() {
  const g = new THREE.Group(), body = clay('#9aa5ae', { r: .5, m: .25 }), front = clay('#aeb8c0', { r: .5, m: .2 }), dark = clay(G.charcoal, { r: .5 });
  g.add(at(rb(.72, 1.4, .82, body, .03), 0, .7, 0));
  [0, 1, 2].forEach((i) => { g.add(at(rb(.64, .4, .03, front, .012), 0, .24 + i * .44, .42)); g.add(at(rb(.26, .03, .035, dark, .012), 0, .36 + i * .44, .45)); });
  return g;
}
export function monitor() {
  const g = new THREE.Group(), dark = clay('#16191d', { r: .4 });
  g.add(at(rb(1.05, .62, .05, dark, .02), 0, .62, 0));
  g.add(at(rb(.96, .53, .012, clay('#243241', { r: .12, cc: 1, env: 1.3 }), .008, 2), 0, .62, .03));
  g.add(at(rb(.1, .3, .06, dark, .02), 0, .3, -.03)); g.add(at(rb(.42, .03, .26, dark, .012), 0, .015, 0));
  return g;
}
export function whiteboard() {
  const g = new THREE.Group(), frame = clay('#b9c1c8', { r: .4, m: .3 });
  g.add(at(rb(1.9, 1.2, .05, frame, .02), 0, 1.45, 0)); g.add(at(rb(1.8, 1.1, .02, clay('#fbfbfa', { r: .3, cc: .6 }), .01), 0, 1.45, .03));
  [-1, 1].forEach((s) => { g.add(tube([s * .8, .85, 0], [s * 1.05, 0, -.3], .03, frame)); g.add(tube([s * .8, .85, 0], [s * 1.05, 0, .3], .03, frame)); });
  return g;
}
export function branches(seed = 3) {
  const g = new THREE.Group(), r = rng(seed), bark = clay(G.bark, { r: .95 }), leaf = clay(G.green, { r: .8, sheen: .4 }), leaf2 = clay(G.greenDk, { r: .8 });
  for (let i = 0; i < 11; i++) {
    const a = r() * Math.PI * 2, len = 1.6 + r() * 1.6, lift = .1 + (i % 4) * .17, rad = .045 + r() * .04;
    g.add(tube([Math.cos(a) * .15, lift, Math.sin(a) * .15], [Math.cos(a) * len, lift + r() * .6, Math.sin(a) * len], rad, bark, 8));
  }
  for (let i = 0; i < 16; i++) { const a = r() * Math.PI * 2, d = .2 + r() * 1.5; g.add(at(sph(.22 + r() * .18, i % 3 ? leaf : leaf2, 1.2, .8, 1, 14), Math.cos(a) * d, .25 + r() * .55, Math.sin(a) * d)); }
  return g;
}
export function fronds(seed = 5) {
  const g = new THREE.Group(), r = rng(seed), leaf = clay('#7fa860', { r: .8, sheen: .4 }), stem = clay('#9b8b5e', { r: .9 });
  for (let i = 0; i < 9; i++) {
    const f = new THREE.Group();
    f.add(at(sph(1, leaf, 1.5, .04, .2, 14), 1.5, 0, 0));
    f.add(at(sph(1, leaf, 1.2, .03, .13, 12), 1.5, .0, 0, 0, 0, 0));
    f.add(tube([0, 0, 0], [2.9, 0, 0], .025, stem, 6));
    f.rotation.set(0, i / 9 * Math.PI * 2 + r() * .4, .12 + r() * .1); f.position.y = .15 + (i % 3) * .1;
    g.add(f);
  }
  return g;
}
export function fence(n = 7) {
  const g = new THREE.Group(), slat = clay('#c4a075', { r: .9 }), rail = clay('#a58260', { r: .9 });
  for (let i = 0; i < n; i++) g.add(at(rb(.2, 1.7, .04, i % 2 ? slat : clay('#cfae84', { r: .9 }), .01, 1), (i - (n - 1) / 2) * .22, .85, 0));
  [.35, 1.35].forEach((y) => g.add(at(rb(n * .22 + .04, .1, .05, rail, .012), 0, y, -.04)));
  return g;
}
export function hotTub() {
  const g = new THREE.Group(), shell = clay('#bfc6cc', { r: .5, cc: .4 }), wood = clay('#8f6d4c', { r: .85 });
  g.add(at(rb(2.2, .9, 2.2, wood, .18, 4), 0, .45, 0));
  g.add(at(rb(2.0, .12, 2.0, shell, .26, 4), 0, .93, 0));
  g.add(at(rb(1.62, .06, 1.62, clay('#7fc2e6', { r: .15, cc: 1, env: 1.2 }), .22, 4), 0, .96, 0));
  g.add(at(rb(.7, .3, .5, wood, .06), 1.35, .15, .3));
  return g;
}
export function grill() {
  const g = new THREE.Group(), body = clay('#23282e', { r: .4, cc: .5 }), metal = clay(G.metal, { r: .4, m: .5 });
  const bowl = sph(.55, body, 1, .75, 1, 28); bowl.position.y = 1.0; g.add(bowl);
  g.add(at(cyl(.58, .58, .06, metal, 32), 0, 1.0, 0));
  [0, 1, 2].forEach((i) => { const a = i * Math.PI * 2 / 3 + .4; g.add(tube([Math.cos(a) * .3, .85, Math.sin(a) * .3], [Math.cos(a) * .5, 0, Math.sin(a) * .5], .03, metal)); });
  g.add(at(cyl(.5, .5, .04, metal, 28), 0, .32, 0));
  return g;
}
export function leafBag(seed = 2) {
  const g = P.bag(.5, seed);
  g.traverse((o) => { if (o.isMesh) o.material = clay('#6d9a58', { r: .35, cc: .5, env: 1 }); });
  return g;
}
export function dresser() {
  const g = new THREE.Group(), body = clay('#c9a77a', { r: .7 }), front = clay('#d6b88c', { r: .7 }), knob = clay('#6b747b', { r: .35, m: .6 });
  g.add(at(rb(1.6, 1.15, .72, body, .04), 0, .65, 0));
  [0, 1, 2].forEach((i) => { g.add(at(rb(1.46, .3, .03, front, .012), 0, .3 + i * .36 + .12, .37)); g.add(at(sph(.035, knob), -.3, .3 + i * .36 + .12, .41)); g.add(at(sph(.035, knob), .3, .3 + i * .36 + .12, .41)); });
  [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([a, b]) => g.add(at(rb(.08, .12, .08, body, .02), a * .7, .06, b * .28)));
  return g;
}
export function sideTable() {
  const g = new THREE.Group(), w = clay('#a98558', { r: .8 });
  g.add(at(cyl(.4, .4, .05, clay('#d6bf9a', { r: .7 }), 32), 0, .62, 0));
  [0, 1, 2, 3].forEach((i) => { const a = i * Math.PI / 2 + Math.PI / 4; g.add(tube([Math.cos(a) * .24, .6, Math.sin(a) * .24], [Math.cos(a) * .34, 0, Math.sin(a) * .34], .03, w)); });
  return g;
}
