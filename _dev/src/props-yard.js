// A Las Vegas backyard that has been left alone: palms, trimmings, a dead hot tub, a rusted trampoline...
import { THREE, clay, rb, cyl, sph, at, tube, part, rng, canvasTex, decal, withWalls } from './kit.js';

const DS = THREE.DoubleSide;

/* a palm frond: a curved spine with leaflets that droop to both sides */
function frondGeometry(L = 2.2, droop = .7, leaf = .55, N = 18) {
  const pos = [], P = (t) => [t * L, -droop * t * t];
  for (let j = 1; j <= N; j++) {
    const t = j / N, p = P(t), p0 = P((j - 1) / N);
    const ll = leaf * (Math.sin(Math.PI * Math.min(1, t * 1.05)) * .8 + .2) * (1 - .25 * t);
    for (const s of [-1, 1]) {
      const mx = (p0[0] + p[0]) / 2 + .1, my = (p0[1] + p[1]) / 2 - ll * .5;
      pos.push(p0[0], p0[1], 0, p[0], p[1], 0, mx, my, s * ll);
    }
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.computeVertexNormals();
  g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(pos.length / 3 * 2), 2));
  return g;
}
export function frond(col = '#5f8f45', L = 2.2, droop = .7, leaf = .55) {
  const g = new THREE.Group();
  g.add(part(frondGeometry(L, droop, leaf), clay(col, { r: .8, side: DS, sheen: .3 })));
  let prev = [0, 0];
  for (let j = 1; j <= 6; j++) { const t = j / 6, cur = [t * L, -droop * t * t]; g.add(tube([prev[0], prev[1], 0], [cur[0], cur[1], 0], .028 * (1 - t * .6), clay('#8a7a4a', { r: .8 }), 6)); prev = cur; }
  return g;
}

export function palmTree(h = 3.5, seed = 4) {
  const g = new THREE.Group(), R = rng(seed), bark = clay('#8b7355', { r: .95 }), ring = clay('#6c5840', { r: .95 });
  const n = 15; let prevX = 0;
  for (let i = 0; i < n; i++) {
    const t = i / n, r = .27 - .1 * t, x = .35 * t * t, y = t * h;
    const seg = cyl(r - .01, r + .02, h / n * 1.04, bark, 14); seg.position.set(x, y + h / n / 2, 0); seg.rotation.z = -.35 * 2 * t * .5; g.add(seg);
    g.add(at(cyl(r + .035, r + .035, .05, ring, 14), x, y + h / n * .95, 0));
    prevX = x;
  }
  const tx = prevX, ty = h;
  g.add(at(sph(.28, clay('#7a6446', { r: .95 }), 1, .8, 1, 14), tx, ty + .05, 0));
  for (let k = 0; k < 7; k++) g.add(at(sph(.09, clay('#c9a45a', { r: .8 }), 1, 1, 1, 8), tx + Math.cos(k) * .18, ty - .15, Math.sin(k) * .18)); // date clusters
  const cols = ['#5f8f45', '#6fa04e', '#527f3d'];
  for (let i = 0; i < 15; i++) {
    const dead = i % 7 === 3;
    const f = frond(dead ? '#a58a52' : cols[i % 3], 1.6 + R() * .6, .5 + R() * .7, .45 + R() * .15);
    f.rotation.z = dead ? -.5 : .55 - (i % 5) * .22;
    const pivot = new THREE.Group(); pivot.add(f); pivot.position.set(tx, ty + .1, 0); pivot.rotation.y = i / 15 * Math.PI * 2 + R() * .3;
    g.add(pivot);
  }
  return g;
}

export function deadFronds(n = 10, seed = 6) {
  const g = new THREE.Group(), R = rng(seed);
  for (let i = 0; i < n; i++) {
    const f = frond(i % 3 ? '#b59a62' : '#9c8450', 2.2 + R() * .8, .3 + R() * .3, .5);
    f.rotation.set((R() - .5) * .3, R() * 6.28, -.05 - R() * .2); f.position.set((R() - .5) * .6, .08 + (i % 4) * .1, (R() - .5) * .6);
    g.add(f);
  }
  return g;
}

export function branchPile(seed = 3) {
  const g = new THREE.Group(), R = rng(seed), bark = clay('#7a5a3d', { r: .95 }), bark2 = clay('#8d6b49', { r: .95 }), wood = clay('#d9b98a', { r: .8 }), leaf = [clay('#8d9a52', { r: .85 }), clay('#a3935a', { r: .85 }), clay('#7f8f4c', { r: .85 })];
  for (let i = 0; i < 20; i++) {
    const a = R() * Math.PI * 2, len = 1.4 + R() * 1.5, lift = .08 + (i % 5) * .13, r = .035 + R() * .04;
    const x0 = Math.cos(a) * .15, z0 = Math.sin(a) * .15, x1 = Math.cos(a) * len, z1 = Math.sin(a) * len, y1 = lift + R() * .5;
    g.add(tube([x0, lift, z0], [x1, y1, z1], r, i % 2 ? bark : bark2, 8));
    g.add(at(cyl(r * 1.05, r * 1.05, .02, wood, 8), x1, y1, z1)); g.children[g.children.length - 1].lookAt(x1 + (x1 - x0), y1 + (y1 - lift), z1 + (z1 - z0));
    for (let k = 0; k < 2; k++) { const t = .35 + R() * .45, fx = x0 + (x1 - x0) * t, fy = lift + (y1 - lift) * t, fz = z0 + (z1 - z0) * t, fa = a + (k ? 1 : -1) * (.5 + R() * .5);
      const ex = fx + Math.cos(fa) * (.4 + R() * .5), ey = fy + .1 + R() * .35, ez = fz + Math.sin(fa) * (.4 + R() * .5);
      g.add(tube([fx, fy, fz], [ex, ey, ez], r * .55, bark, 6));
      for (let l = 0; l < 1; l++) { const lf = sph(.1 + R() * .06, leaf[(R() * 3) | 0], 1.5, .32, .8, 8); lf.position.set(ex + (R() - .5) * .22, ey + (R() - .3) * .1, ez + (R() - .5) * .22); lf.rotation.set(R(), R() * 6, R()); g.add(lf); } }
  }
  for (let i = 0; i < 3; i++) { const lg = cyl(.13 + i * .02, .13 + i * .02, .8 + R() * .4, bark, 14); lg.rotation.z = Math.PI / 2; lg.position.set((R() - .5) * .5, .14 + i * .22, (R() - .5) * .4); lg.rotation.y = R() * 3; g.add(lg); const ce = cyl(.11, .11, .01, wood, 14); g.add(ce); ce.rotation.copy(lg.rotation); ce.position.copy(lg.position); ce.translateY(.41); }
  return g;
}

export function stump() {
  const g = new THREE.Group(), bark = clay('#6e5237', { r: .95 });
  g.add(at(cyl(.38, .46, .5, bark, 24), 0, .25, 0));
  const tex = canvasTex(256, 256, (c, W, H) => { c.fillStyle = '#d9b98a'; c.fillRect(0, 0, W, H); for (let i = 1; i < 12; i++) { c.strokeStyle = `rgba(120,80,40,${.35 + i % 2 * .2})`; c.lineWidth = 2; c.beginPath(); c.ellipse(W / 2 + i % 3, H / 2, i * 10, i * 9.4, 0, 0, 7); c.stroke(); } });
  const d = decal(.74, .74, tex); d.rotation.x = -Math.PI / 2; d.position.y = .505; g.add(d);
  [[.4, .1], [-.35, .3], [.1, -.42]].forEach(([x, z], i) => g.add(at(rb(.22, .16, .36, bark, .05), x, .06, z, i * 1.5)));
  return g;
}

export function hotTub() {
  const g = new THREE.Group(), cab = clay('#8f6d4c', { r: .85 }), cab2 = clay('#7a5b3e', { r: .85 }), shell = clay('#dfe3e6', { r: .35, cc: .5 }), water = clay('#6f8f7a', { r: .12, cc: 1, env: 1 });
  g.add(at(rb(2.3, .15, 2.3, clay('#4a4036', { r: .9 }), .04), 0, .08, 0));
  for (let s = 0; s < 4; s++) { const holder = new THREE.Group(); for (let i = 0; i < 16; i++) holder.add(at(rb(.13, .86, .035, i % 2 ? cab : cab2, .008, 1), -1.05 + i * .14, .56, 1.15)); holder.rotation.y = s * Math.PI / 2; g.add(holder); }
  g.add(at(rb(2.34, .06, 2.34, clay('#5d4630', { r: .8 }), .02), 0, .98, 0));
  // a rim (not a slab) so the murky water and the seats show
  g.add(at(rb(2.1, .14, .24, shell, .06), 0, 1.04, 0 - .93)); g.add(at(rb(2.1, .14, .24, shell, .06), 0, 1.04, .93)); g.add(at(rb(.24, .14, 1.62, shell, .06), -.93, 1.04, 0)); g.add(at(rb(.24, .14, 1.62, shell, .06), .93, 1.04, 0));
  g.add(at(rb(1.64, .1, 1.64, clay('#c9d1d6', { r: .4 }), .1, 3), 0, .9, 0));
  g.add(at(rb(1.62, .04, 1.62, water, .12, 4), 0, .98, 0));
  for (let i = 0; i < 6; i++) g.add(at(sph(.09, clay('#3f5a3a', { r: .9 }), 1.4, .4, 1, 8), -.6 + (i % 3) * .55, 1.0, -.4 + Math.floor(i / 3) * .7)); // leaves floating in it
  for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283; g.add(at(cyl(.05, .05, .03, clay('#aab2b9', { r: .3, m: .6 }), 12), Math.cos(a) * .8, .98, Math.sin(a) * .8)); }
  [[-.6, -.85], [.6, -.85]].forEach(([x, z]) => g.add(at(rb(.4, .22, .2, clay('#c9d1d6', { r: .5 }), .08), x, 1.1, z)));
  g.add(at(rb(.8, .3, .5, cab, .05), 1.55, .15, .35)); g.add(at(rb(.8, .05, .5, clay('#b49a76', { r: .8 }), .02), 1.55, .32, .35));
  // the cover, folded and propped
  const cv = clay('#3b4048', { r: .7, cc: .3 });
  const half = new THREE.Group(); half.add(at(rb(2.2, .12, 1.1, cv, .05), 0, 0, 0)); half.add(at(rb(2.0, .02, .9, clay('#4a5058', { r: .6 }), .01, 1), 0, .07, 0)); half.add(at(rb(2.2, .06, .08, clay('#2b2f36', { r: .6 }), .02, 1), 0, .0, .52));
  half.position.set(-.1, 1.5, 1.35); half.rotation.x = -1.2; g.add(half);
  return g;
}

export function trampoline() {
  const g = new THREE.Group(), rust = clay('#8a6c56', { r: .6, m: .4 }), pad = clay('#2f5f93', { r: .7 }), mat = clay('#1c1e21', { r: .9 }), spring = clay('#b9c0c6', { r: .3, m: .8 });
  const R0 = 1.3, H0 = .55;
  for (let i = 0; i < 6; i++) { const a = i / 6 * 6.283, x = Math.cos(a) * R0, z = Math.sin(a) * R0; g.add(tube([x, 0, z], [x * 1.0, H0, z * 1.0], .045, rust)); g.add(at(rb(.3, .04, .1, rust, .01, 1), x, .02, z, -a)); }
  const ring = part(new THREE.TorusGeometry(R0, .05, 10, 64), rust); ring.rotation.x = Math.PI / 2; ring.position.y = H0; g.add(ring);
  const ring2 = part(new THREE.TorusGeometry(R0 - .22, .035, 8, 64), rust); ring2.rotation.x = Math.PI / 2; ring2.position.y = H0; g.add(ring2);
  const pd = part(new THREE.TorusGeometry(R0 - .11, .12, 10, 64), pad); pd.rotation.x = Math.PI / 2; pd.position.y = H0 + .1; pd.scale.set(1, 1, .45); g.add(pd);
  const m = part(new THREE.CylinderGeometry(R0 - .5, R0 - .5, .03, 56), mat); m.position.y = H0 - .02; g.add(m);
  for (let i = 0; i < 44; i++) { const a = i / 44 * 6.283; g.add(tube([Math.cos(a) * (R0 - .5), H0 - .02, Math.sin(a) * (R0 - .5)], [Math.cos(a) * (R0 - .22), H0, Math.sin(a) * (R0 - .22)], .014, spring, 5)); }
  for (let i = 0; i < 4; i++) { const a = i / 4 * 6.283 + .4, x = Math.cos(a) * (R0 - .05), z = Math.sin(a) * (R0 - .05); g.add(tube([x, H0, z], [x, H0 + 1.5, z], .03, rust)); }
  for (let i = 0; i < 24; i++) { const a = (i / 24) * 6.283 * .6 + .4, x = Math.cos(a) * (R0 - .05), z = Math.sin(a) * (R0 - .05); g.add(tube([x, H0 + 1.5, z], [x, H0 + 1.5 - .6 - (i % 3) * .2, z], .006, clay('#2b2f36', { r: .9 }), 4)); } // torn net strands
  g.add(part(new THREE.TorusGeometry(.25, .012, 6, 20), clay('#2b2f36', { r: .9 })).translateY(.01)); g.children[g.children.length - 1].position.set(.4, H0 + .02, .2); g.children[g.children.length - 1].rotation.x = Math.PI / 2;
  return g;
}

export function mower() {
  const g = new THREE.Group(), red = clay('#c0463b', { r: .35, cc: .6 }), dark = clay('#23272c', { r: .55 }), gr = clay('#aab2b9', { r: .4, m: .5 });
  g.add(at(rb(.9, .22, .72, red, .09, 4), 0, .34, 0)); g.add(at(rb(.7, .06, .6, clay('#8a2f27', { r: .4 }), .03), 0, .46, 0));
  g.add(at(cyl(.16, .17, .22, dark, 18), .12, .6, 0)); g.add(at(cyl(.12, .12, .05, gr, 18), .12, .74, 0)); g.add(at(rb(.1, .05, .14, clay('#f4d03f', { r: .5 }), .02), .12, .78, 0));
  [[-.34, -.3], [-.34, .3], [.34, -.3], [.34, .3]].forEach(([x, z], i) => { const w = part(new THREE.CylinderGeometry(i < 2 ? .17 : .12, i < 2 ? .17 : .12, .08, 20), dark); w.rotation.x = Math.PI / 2; w.position.set(x, i < 2 ? .17 : .12, z * 1.15); g.add(w); const h = part(new THREE.CylinderGeometry(.06, .06, .1, 12), gr); h.rotation.x = Math.PI / 2; h.position.copy(w.position); g.add(h); });
  [-1, 1].forEach((s) => g.add(tube([-.45, .45, s * .28], [-1.0, 1.05, s * .27], .022, gr)));
  g.add(tube([-1.0, 1.05, -.27], [-1.0, 1.05, .27], .028, dark));
  g.add(at(rb(.5, .04, .1, clay('#f4d03f', { r: .5 }), .015), -.98, 1.0, 0));
  const bag = rb(.5, .42, .6, clay('#7a8088', { r: .9 }), .12, 4); bag.position.set(-.55, .62, 0); g.add(bag); g.add(at(rb(.5, .04, .6, dark, .015), -.55, .83, 0));
  return g;
}

export function kettleGrill() {
  const g = new THREE.Group(), rust = clay('#4d4039', { r: .55, m: .3, cc: .2 }), black = clay('#2a2623', { r: .5 }), gr = clay('#8b949c', { r: .4, m: .6 }), ruststain = clay('#8a5a3a', { r: .9 });
  const bowl = part(new THREE.SphereGeometry(.56, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), rust); bowl.position.y = 1.0; g.add(bowl);
  const lid = part(new THREE.SphereGeometry(.57, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), rust); lid.position.set(0, 1.03, 0); lid.rotation.set(-.12, 0, 0); g.add(lid);
  g.add(at(cyl(.025, .025, .14, black, 8), 0, 1.6, 0)); g.add(at(sph(.05, black, 1, 1, 1, 8), 0, 1.68, 0));
  g.add(at(cyl(.58, .58, .045, black, 36), 0, 1.0, 0)); g.add(at(cyl(.5, .5, .03, gr, 36), 0, .95, 0));
  for (let i = -3; i <= 3; i++) g.add(at(rb(.012, .012, .9, gr, .004, 1), i * .12, .96, 0));
  for (let i = 0; i < 3; i++) { const a = i * 2.094 + .4; g.add(tube([Math.cos(a) * .28, .9, Math.sin(a) * .28], [Math.cos(a) * .5, 0, Math.sin(a) * .5], .028, black)); g.add(at(cyl(.045, .045, .03, black, 10), Math.cos(a) * .5, .015, Math.sin(a) * .5)); }
  g.add(at(cyl(.42, .42, .03, gr, 24), 0, .4, 0)); g.add(at(cyl(.3, .22, .12, rust, 18), 0, .1 + .22, 0));
  g.add(at(rb(.35, .04, .05, black, .015), -.4, 1.12, .52, .4)); g.add(at(sph(.04, ruststain, 1, .4, 1, 8), .3, .93, .2));
  for (let i = 0; i < 5; i++) g.add(at(sph(.1, clay('#3a3430', { r: .95 }), 1, .6, 1, 8), (i - 2) * .14, .98, -.08 + (i % 2) * .1)); // old coals
  return g;
}

export function patioChair(col = '#e9e6df') {
  const g = new THREE.Group(), m = clay(col, { r: .55 });
  g.add(at(rb(.62, .07, .6, m, .03), 0, .5, 0));
  for (let i = 0; i < 5; i++) g.add(at(rb(.56, .018, .06, clay('#d8d4cb', { r: .6 }), .006, 1), 0, .545, -.22 + i * .11));
  g.add(at(rb(.62, .62, .06, m, .03), 0, .9, -.3, 0, -.18));
  for (let i = 0; i < 5; i++) g.add(at(rb(.05, .5, .02, clay('#d8d4cb', { r: .6 }), .006, 1), -.22 + i * .11, .9, -.28, 0, -.18));
  [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([a, b]) => g.add(at(rb(.06, .5, .06, m, .02), a * .26, .25, b * .24)));
  [-1, 1].forEach((s) => { g.add(at(rb(.06, .05, .52, m, .02), s * .33, .72, -.0)); g.add(at(rb(.05, .22, .05, m, .015), s * .33, .62, .22)); });
  return g;
}
export function patioTable() {
  const g = new THREE.Group(), fr = clay('#2f3338', { r: .45, m: .3 });
  g.add(at(cyl(.62, .62, .04, clay('#bcd3dc', { r: .06, cc: 1, env: 1.2 }), 40), 0, .78, 0));
  const rm = part(new THREE.TorusGeometry(.62, .03, 8, 40), fr); rm.rotation.x = Math.PI / 2; rm.position.y = .78; g.add(rm);
  for (let i = 0; i < 4; i++) { const a = i * 1.5708 + .78; g.add(tube([Math.cos(a) * .1, .74, Math.sin(a) * .1], [Math.cos(a) * .5, 0, Math.sin(a) * .5], .028, fr)); }
  g.add(tube([0, .76, 0], [0, 0, 0], .03, fr)); g.add(at(cyl(.025, .025, .06, fr, 8), 0, .8, 0));
  return g;
}
export function umbrellaFolded() {
  const g = new THREE.Group(), cloth = clay('#a6422f', { r: .85, sheen: .3 }), pole = clay('#2f3338', { r: .4, m: .4 });
  g.add(tube([0, .1, 0], [1.0, 2.4, 0], .028, pole));
  const cone = part(new THREE.CylinderGeometry(.08, .17, 1.7, 16), cloth); cone.position.set(.7, 1.5, 0); cone.rotation.z = -.38; g.add(cone);
  for (let i = 0; i < 4; i++) g.add(tube([.3 + i * .08, .8 + i * .2, .1], [.4 + i * .08, 1.0 + i * .2, .15], .01, clay('#d9d3c6', { r: .6 }), 4));
  const base = part(new THREE.CylinderGeometry(.35, .38, .12, 24), clay('#9aa0a5', { r: .95 })); base.position.set(0, .06, 0); g.add(base);
  g.add(at(rb(.12, .06, .4, clay('#d9d3c6', { r: .6 }), .02), .75, 1.0, .0, .0, 0, -.38));
  return g;
}
export function kidSlide() {
  const g = new THREE.Group(), red = clay('#d64a3b', { r: .5 }), yel = clay('#f0c13a', { r: .5 }), blue = clay('#3a7bd5', { r: .5 }), grn = clay('#4caf50', { r: .5 });
  g.add(at(rb(.9, .05, .9, blue, .02), 0, .78, 0)); [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([a, b], i) => g.add(at(rb(.1, .78, .1, i % 2 ? red : yel, .03), a * .38, .39, b * .38)));
  g.add(at(rb(.95, .28, .06, grn, .02), 0, 1.06, -.42));
  [-1, 1].forEach((s) => { g.add(at(rb(.06, .05, .8, red, .02), s * .43, 1.0, -.0)); });
  const ramp = new THREE.Group(); ramp.add(at(rb(.7, .05, 1.9, yel, .02), 0, 0, 0)); [-1, 1].forEach((s) => ramp.add(at(rb(.06, .14, 1.9, yel, .02), s * .36, .08, 0))); ramp.position.set(0, .45, 1.2); ramp.rotation.x = .42; g.add(ramp);
  for (let i = 0; i < 4; i++) g.add(at(rb(.5, .05, .08, blue, .02), 0, .15 + i * .2, -.58 - i * .03));
  [-1, 1].forEach((s) => g.add(tube([s * .26, .06, -.55], [s * .26, .85, -.46], .03, red)));
  return g;
}
export function hoseReel() {
  const g = new THREE.Group(), fr = clay('#2f6f4f', { r: .5, cc: .3 }), hose = clay('#3f8f5a', { r: .5 }), metal = clay('#8b949c', { r: .4, m: .6 });
  [-.2, .2].forEach((z) => { const d = part(new THREE.CylinderGeometry(.5, .5, .04, 32), fr); d.rotation.x = Math.PI / 2; d.position.set(0, .62, z); g.add(d); });
  const coil = part(new THREE.CylinderGeometry(.4, .4, .36, 32), hose); coil.rotation.x = Math.PI / 2; coil.position.set(0, .62, 0); g.add(coil);
  for (let i = 0; i < 7; i++) { const t = part(new THREE.TorusGeometry(.4, .028, 8, 32), clay('#2f7a48', { r: .5 })); t.position.set(0, .62, -.16 + i * .053); g.add(t); }
  g.add(at(cyl(.08, .08, .5, metal, 12), 0, .62, 0, 0, Math.PI / 2));
  [-1, 1].forEach((s) => g.add(tube([0, .62, s * .28], [s * .1, 0, s * .4], .03, fr)));
  g.add(at(rb(.5, .05, .12, fr, .02), 0, .03, -.4)); g.add(tube([.4, .62, .1], [.95, .06, .55], .03, hose)); g.add(at(cyl(.045, .045, .2, clay('#e0a43a', { r: .4, m: .3 }), 10), 1.0, .08, .6, 0, 0, Math.PI / 2));
  return g;
}
export function poolFloat() {
  const g = new THREE.Group(), pk = clay('#f48fb1', { r: .45, cc: .5 }), wh = clay('#ffffff', { r: .45 });
  const t = part(new THREE.TorusGeometry(.55, .2, 16, 40), pk); t.rotation.x = Math.PI / 2; t.position.y = .2; g.add(t);
  for (let i = 0; i < 6; i++) { const a = i / 6 * 6.283; g.add(at(rb(.14, .06, .08, wh, .02), Math.cos(a) * .55, .38, Math.sin(a) * .55, -a)); }
  [['#4fc3f7', 0], ['#ffd54f', 1], ['#81c784', 2]].forEach(([c, i]) => { const n = cyl(.07, .07, 1.7, clay(c, { r: .5 }), 12); n.rotation.z = Math.PI / 2; n.position.set(1.3, .1 + i * .15, -.4 + i * .3); n.rotation.y = .3 * i; g.add(n); });
  return g;
}
export function cinderStack() {
  const g = new THREE.Group(), cmu = clay('#a8a8a4', { r: .95 }), hole = clay('#6e6e6a', { r: .95 });
  const rows = [[0, 0, 0], [1, 0, 0], [2, 0, 0], [0, 1, 1], [1, 1, 1], [0, 2, 0]];
  rows.forEach(([i, r, o]) => { const x = i * .82 + o * .41 - .4, y = r * .4 + .2; g.add(at(rb(.8, .39, .4, cmu, .02, 2), x, y, 0)); [-.2, .2].forEach((dx) => g.add(at(rb(.2, .2, .02, hole, .01, 1), x + dx, y, .21))); });
  return g;
}
export function paverStack() {
  const g = new THREE.Group(), cols = ['#b49a76', '#a88d69', '#c0a682'];
  for (let i = 0; i < 12; i++) g.add(at(rb(.8, .07, .55, clay(cols[i % 3], { r: .95 }), .01, 1), (i % 3 - 1) * .015, .04 + i * .074, (i % 2 - .5) * .02, (i % 5 - 2) * .012));
  g.add(at(rb(.84, .03, .06, clay('#2f6f9f', { r: .5 }), .008, 1), 0, .5, .12)); g.add(at(rb(.84, .03, .06, clay('#2f6f9f', { r: .5 }), .008, 1), 0, .5, -.12));
  return g;
}
export function planter(dead = true) {
  const g = new THREE.Group(), tc = clay('#b9694a', { r: .9 });
  g.add(at(cyl(.4, .28, .55, tc, 24), 0, .28, 0)); g.add(at(cyl(.43, .43, .08, clay('#c27a5a', { r: .9 }), 24), 0, .57, 0));
  g.add(at(rb(.16, .3, .08, clay('#6b3f2a', { r: 1 }), .02, 1), .35, .5, .05, .3)); // chipped notch
  g.add(at(cyl(.34, .34, .02, clay('#4a3b30', { r: 1 }), 20), 0, .6, 0));
  for (let i = 0; i < 6; i++) { const a = i * 1.1; g.add(tube([0, .6, 0], [Math.cos(a) * .25, .95 + (i % 3) * .1, Math.sin(a) * .25], .012, clay('#8a6c3a', { r: .9 }), 4)); g.add(at(sph(.05, clay('#a58a52', { r: .9 }), 1, .6, 1, 6), Math.cos(a) * .25, .97 + (i % 3) * .1, Math.sin(a) * .25)); }
  return g;
}
export function tireStack(n = 4) {
  const g = new THREE.Group(), t = clay('#1c1e21', { r: .85 });
  for (let i = 0; i < n; i++) { const tr = part(new THREE.TorusGeometry(.4, .17, 14, 32), t); tr.rotation.x = Math.PI / 2; tr.position.set((i % 2) * .03, .17 + i * .32, 0); tr.rotation.z = (i - 1) * .04; g.add(tr); g.add(at(cyl(.24, .24, .04, clay('#8b949c', { r: .4, m: .6 }), 20), 0, .17 + i * .32, 0)); }
  return g;
}
export function boulder(seed = 1, r = .5, col = '#a89f8f') {
  const R = rng(seed * 31), geo = new THREE.IcosahedronGeometry(r, 3), p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), n = 1 + .16 * Math.sin(x * 4 + seed) * Math.cos(z * 3.3 + seed * 2) + .1 * Math.sin(y * 5 + seed * 3); p.setXYZ(i, x * n * 1.1, y * n * .72, z * n); }
  geo.computeVertexNormals();
  const m = part(geo, clay(col, { r: .95 })); m.position.y = r * .5; const g = new THREE.Group(); g.add(m); return g;
}
export function gnome() {
  const g = new THREE.Group();
  g.add(at(cyl(.14, .18, .4, clay('#3a6ea5', { r: .6 }), 14), 0, .2, 0)); g.add(at(sph(.1, clay('#f1c9a5', { r: .6 }), 1, 1, 1, 12), 0, .5, .02));
  g.add(at(sph(.13, clay('#f6f6f2', { r: .8 }), 1, 1.2, .8, 12), 0, .4, .1)); g.add(at(cyl(.001, .13, .32, clay('#d9392c', { r: .5 }), 14), 0, .72, 0));
  g.add(at(sph(.02, clay('#d9392c', { r: .5 }), 1, 1, 1, 6), 0, .5, .1));
  return g;
}
export function rake() {
  const g = new THREE.Group(), wood = clay('#b98a58', { r: .8 }), gr = clay('#8b949c', { r: .4, m: .6 });
  g.add(tube([0, 0, 0], [0, 2.0, 0], .022, wood, 8)); g.add(at(rb(.5, .03, .04, gr, .01, 1), 0, .04, 0));
  for (let i = 0; i < 9; i++) g.add(tube([-.22 + i * .055, .04, 0], [-.22 + i * .055, -.02, .24], .008, gr, 4));
  return g;
}
export function shovel() {
  const g = new THREE.Group(), wood = clay('#b98a58', { r: .8 }), gr = clay('#7b848c', { r: .4, m: .6 });
  g.add(tube([0, .25, 0], [0, 2.0, 0], .024, wood, 8)); g.add(at(rb(.3, .5, .02, gr, .04, 2), 0, .02, 0)); g.add(at(rb(.1, .05, .1, gr, .02), 0, 1.98, 0));
  return g;
}
export function turfRoll() {
  const g = new THREE.Group(), grn = clay('#5f9a45', { r: .95, sheen: .5 });
  const c = part(new THREE.CylinderGeometry(.38, .38, 1.5, 28), grn); c.rotation.z = Math.PI / 2; c.position.y = .38; g.add(c);
  [-1, 1].forEach((s) => g.add(at(cyl(.28, .28, .02, clay('#4a4036', { r: .9 }), 24), s * .76, .38, 0, 0, 0, Math.PI / 2)));
  const flap = rb(.9, .02, .5, clay('#4f8a3a', { r: .95 }), .01, 1); flap.position.set(0, .01, .62); g.add(flap);
  return g;
}
export function pallets(n = 4) {
  const g = new THREE.Group(), w = clay('#c4a075', { r: .9 }), w2 = clay('#a98558', { r: .9 });
  for (let k = 0; k < n; k++) { const p = new THREE.Group(); for (let i = 0; i < 7; i++) p.add(at(rb(.12, .025, 1.0, i % 2 ? w : w2, .005, 1), -.45 + i * .15, .13, 0)); for (let i = 0; i < 3; i++) p.add(at(rb(.1, .09, 1.0, w2, .01, 1), -.45 + i * .45, .07, 0)); p.add(at(rb(1.0, .02, .12, w, .005, 1), 0, .01, -.44)); p.add(at(rb(1.0, .02, .12, w, .005, 1), 0, .01, .44)); p.position.y = k * .17; p.rotation.y = (k % 2) * .08; p.rotation.x = k * .012; g.add(p); }
  return g;
}

/* ---- the block walls and the gate ---- */
export function yardWalls(H = 4, T = .36, WH = 2.9) {
  return withWalls(() => {
    const g = new THREE.Group();
    const sand = clay('#d9c3a0', { r: .96, env: .3 }), sandLo = clay('#cdb48f', { r: .96, env: .3 }), cap = clay('#e6d6b7', { r: .9, env: .3 }), line = clay('#bda57f', { r: 1 }), iron = clay('#262a30', { r: .5, m: .5 });
    const box = (x0, x1, y0, y1, z0, z1, m) => { const b = rb(x1 - x0, y1 - y0, z1 - z0, m, .01, 1); b.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); g.add(b); return b; };
    // left wall (x = -H), full length
    box(-H - T, -H, 0, WH - .12, -H - T, H + T / 2, sand); box(-H - T, -H, 0, .55, -H - T, H + T / 2, sandLo);
    box(-H - T - .06, -H + .06, WH - .12, WH, -H - T - .06, H + T / 2 + .06, cap);
    for (let i = 1; i < 5; i++) box(-H + .005, -H + .02, .55 + i * .42, .57 + i * .42, -H, H, line);
    for (let i = 0; i < 4; i++) box(-H - T - .05, -H + .05, 0, WH + .22, -H + i * 2.5 - .22, -H + i * 2.5 + .22, sand);
    // back wall (z = -H), with a gate opening between x 1.0 and 3.3
    const gx0 = 1.0, gx1 = 3.3;
    box(-H, gx0, 0, WH - .12, -H - T, -H, sand); box(gx1, H + T / 2, 0, WH - .12, -H - T, -H, sand); box(gx0, gx1, WH - .9, WH - .12, -H - T, -H, sand);
    box(-H, gx0, 0, .55, -H - T, -H, sandLo); box(gx1, H + T / 2, 0, .55, -H - T, -H, sandLo);
    box(-H - .06, H + T / 2 + .06, WH - .12, WH, -H - T - .06, -H + .06, cap);
    for (let i = 1; i < 5; i++) { box(-H, gx0, .55 + i * .42, .57 + i * .42, -H + .005, -H + .02, line); box(gx1, H, .55 + i * .42, .57 + i * .42, -H + .005, -H + .02, line); }
    [-H + .1, gx0, gx1, H].forEach((x) => box(x - .22, x + .22, 0, WH + .22, -H - T - .05, -H + .05, sand));
    // iron gate: frame, bars, a latch
    box(gx0, gx1, .12, .2, -H - .14, -H - .06, iron); box(gx0, gx1, WH - .96, WH - .88, -H - .14, -H - .06, iron); box(gx0, gx1, 1.3, 1.36, -H - .14, -H - .06, iron);
    for (let i = 0; i <= 14; i++) { const x = gx0 + .06 + i * (gx1 - gx0 - .12) / 14; box(x - .012, x + .012, .2, WH - .96, -H - .12, -H - .08, iron); }
    box(gx0, gx0 + .06, .12, WH - .88, -H - .14, -H - .06, iron); box(gx1 - .06, gx1, .12, WH - .88, -H - .14, -H - .06, iron);
    box(gx0 + 1.0, gx0 + 1.2, 1.1, 1.18, -H - .17, -H - .05, clay('#8b949c', { r: .4, m: .6 }));
    // a hose bib, a pipe, a wall light and its conduit
    const bib = part(new THREE.CylinderGeometry(.04, .04, .22, 10), clay('#c98a3a', { r: .35, m: .7 })); bib.rotation.x = Math.PI / 2; bib.position.set(-1.7, .75, -H + .12); g.add(bib);
    box(-1.76, -1.64, .74, .8, -H + .16, -H + .26, clay('#c98a3a', { r: .35, m: .7 }));
    const lt = part(new THREE.CylinderGeometry(.12, .15, .2, 14), clay('#2f3338', { r: .45, m: .4 })); lt.position.set(.2, 2.3, -H + .14); g.add(lt);
    const lg = part(new THREE.SphereGeometry(.1, 14, 10), clay('#fff1c4', { r: .3, e: .5 })); lg.position.set(.2, 2.16, -H + .14); g.add(lg);
    box(.19, .21, 2.3, 2.9, -H + .01, -H + .04, clay('#6d747b', { r: .5, m: .3 }));
    return g;
  });
}
