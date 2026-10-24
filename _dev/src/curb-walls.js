// The set: a stucco house with a garage door and an entry, a block wall with a gate the truck leaves through,
// and the desert landscaping. Everything here is built in "wall mode" so it sweeps in on the environment schedule.
import { THREE, clay, rb, cyl, sph, at, tube, part, rng, canvasTex, decal, withWalls } from './kit.js';
import * as Y from './props-yard.js';

export const SET = { H: 5, T: .36, laneZ: -1.85, gateZ0: -3.45, gateZ1: -.25 };

const lt = (hex, a) => { const c = new THREE.Color(hex); c.lerp(new THREE.Color('#fff'), a); return '#' + c.getHexString(); };

/* courses of stone veneer in warm greys and sands */
function stoneTex(w, h) {
  const pxu = 150, W = Math.round(w * pxu), H = Math.round(h * pxu), R = rng(w * 7 + h * 13);
  return canvasTex(W, H, (c) => {
    c.fillStyle = '#b9ae98'; c.fillRect(0, 0, W, H);
    const pal = ['#cdbfa5', '#bfb199', '#d8cdb5', '#a89e8a', '#c6b89c', '#b3a78f'];
    let y = 0;
    while (y < H) {
      const rh = (.17 + R() * .1) * pxu; let x = -R() * 60;
      while (x < W) {
        const bw = (.4 + R() * .55) * pxu, col = pal[(R() * pal.length) | 0];
        c.fillStyle = col; c.fillRect(x + 2, y + 2, bw - 4, rh - 4);
        const g = c.createLinearGradient(0, y, 0, y + rh); g.addColorStop(0, 'rgba(255,255,255,.22)'); g.addColorStop(.5, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(60,50,36,.25)'); c.fillStyle = g; c.fillRect(x + 2, y + 2, bw - 4, rh - 4);
        for (let k = 0; k < 6; k++) { c.fillStyle = `rgba(80,66,46,${.06 + R() * .1})`; c.fillRect(x + 2 + R() * bw, y + 2 + R() * rh, 3 + R() * 9, 2); }
        x += bw;
      }
      y += rh;
    }
  });
}
/* concrete block courses */
function blockTex(w, h) {
  const pxu = 150, W = Math.round(w * pxu), H = Math.round(h * pxu), R = rng(w * 5 + 3);
  return canvasTex(W, H, (c) => {
    c.fillStyle = '#c9b793'; c.fillRect(0, 0, W, H);
    const bh = .27 * pxu, bw = .54 * pxu;
    for (let r = 0, y = 0; y < H; r++, y += bh) {
      for (let x = (r % 2 ? -bw / 2 : 0); x < W; x += bw) {
        const t = (R() - .5) * 18; c.fillStyle = `rgb(${222 + t | 0},${204 + t | 0},${168 + t | 0})`; c.fillRect(x + 2.5, y + 2.5, bw - 5, bh - 5);
        c.fillStyle = 'rgba(255,255,255,.16)'; c.fillRect(x + 2.5, y + 2.5, bw - 5, 3); c.fillStyle = 'rgba(90,70,40,.18)'; c.fillRect(x + 2.5, y + bh - 6, bw - 5, 3);
      }
    }
    const gr = c.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(70,52,30,.2)'); c.fillStyle = gr; c.fillRect(0, 0, W, H);
  });
}
function garageTex() {
  const W = 1200, H = 700;
  return canvasTex(W, H, (c) => {
    c.fillStyle = '#ece5d8'; c.fillRect(0, 0, W, H);
    const cols = 8, rows = 4, pad = 18, top = 150, pw = (W - pad * (cols + 1)) / cols, ph = (H - top - pad * (rows + 1) - 14) / rows;
    // window row
    for (let i = 0; i < cols; i++) {
      const x = pad + i * (pw + pad), y = 28;
      c.fillStyle = '#d6cdbc'; c.fillRect(x - 6, y - 6, pw + 12, 100); const g = c.createLinearGradient(x, y, x + pw, y + 88); g.addColorStop(0, '#6c8fb0'); g.addColorStop(.55, '#33495f'); g.addColorStop(1, '#1f2e3f'); c.fillStyle = g; c.fillRect(x, y, pw, 88);
      c.fillStyle = 'rgba(255,255,255,.28)'; c.beginPath(); c.moveTo(x, y + 88); c.lineTo(x + pw * .55, y); c.lineTo(x + pw * .8, y); c.lineTo(x + pw * .25, y + 88); c.fill();
    }
    for (let r = 0; r < rows; r++) for (let i = 0; i < cols; i++) {
      const x = pad + i * (pw + pad), y = top + pad + r * (ph + pad);
      c.fillStyle = '#e1d9ca'; c.fillRect(x, y, pw, ph);
      c.fillStyle = 'rgba(255,255,255,.7)'; c.fillRect(x, y, pw, 5); c.fillRect(x, y, 5, ph);
      c.fillStyle = 'rgba(70,56,36,.28)'; c.fillRect(x, y + ph - 5, pw, 5); c.fillRect(x + pw - 5, y, 5, ph);
      c.fillStyle = '#f4efe5'; c.fillRect(x + 14, y + 14, pw - 28, ph - 28);
    }
    c.fillStyle = 'rgba(40,30,20,.5)'; c.fillRect(0, 0, W, 8); c.fillRect(0, H - 12, W, 12);
    for (let r = 1; r <= rows; r++) { c.fillStyle = 'rgba(60,48,32,.35)'; c.fillRect(0, top + r * (ph + pad) + pad / 2 - 3, W, 5); }
    c.fillStyle = '#2a2f36'; c.fillRect(W / 2 - 30, H - 120, 60, 12); // handle
  });
}
function numberTex() {
  return canvasTex(256, 128, (c, W, H) => { c.fillStyle = '#23282e'; c.beginPath(); c.roundRect(0, 0, W, H, 18); c.fill(); c.fillStyle = '#e9e3d4'; c.font = '700 84px "Funnel Display", system-ui, sans-serif'; c.textAlign = 'center'; c.fillText('2718', W / 2, 92); });
}

export function agave(n = 15, s = 1, col = '#6f8f6a', seed = 3) {
  const g = new THREE.Group(), R = rng(seed), m1 = clay(col, { r: .7, sheen: .3 }), m2 = clay(lt(col, .18), { r: .7 }), m3 = clay('#4f6a4f', { r: .8 });
  for (let i = 0; i < n; i++) {
    const a = i / n * Math.PI * 2 + R() * .4, ring = i % 3, len = (.7 + ring * .12 + R() * .2) * s, tilt = .35 + ring * .22 + R() * .12;
    const blade = part(new THREE.ConeGeometry(.085 * s, len, 5), [m1, m2, m3][ring]); blade.geometry.translate(0, len / 2, 0);
    const piv = new THREE.Group(); piv.add(blade); piv.rotation.set(0, a, 0); blade.rotation.z = -tilt; blade.position.set(.04 * s, .05 * s, 0); g.add(piv);
  }
  g.add(at(sph(.1 * s, m3, 1, .7, 1, 8), 0, .08 * s, 0));
  return g;
}
export function yuccaTall(s = 1, seed = 4) {
  const g = new THREE.Group(), trunk = clay('#7a6446', { r: .95 });
  g.add(at(cyl(.07 * s, .09 * s, 1.1 * s, trunk, 8), 0, .55 * s, 0, 0, 0, .06));
  const head = agave(18, .8 * s, '#7a9a6c', seed); head.position.set(.03 * s, 1.1 * s, 0); g.add(head);
  g.add(tube([.0, 1.0 * s, 0], [.5 * s, 1.5 * s, .1 * s], .05 * s, trunk, 6)); const h2 = agave(10, .5 * s, '#7a9a6c', seed + 1); h2.position.set(.5 * s, 1.52 * s, .1 * s); g.add(h2);
  return g;
}
export function barrel(s = 1) {
  const g = new THREE.Group(), m = clay('#7fa070', { r: .7 }), sp = clay('#e9d9a6', { r: .5 });
  g.add(at(sph(.3 * s, m, 1, 1.1, 1, 18), 0, .32 * s, 0));
  for (let i = 0; i < 10; i++) { const a = i / 10 * 6.28; g.add(at(cyl(.006, .01, .12 * s, sp, 4), Math.cos(a) * .27 * s, .34 * s, Math.sin(a) * .27 * s, 0, Math.sin(a) * .8, -Math.cos(a) * .8)); }
  g.add(at(sph(.07 * s, clay('#f2b84b', { r: .5 }), 1, .6, 1, 8), 0, .62 * s, 0));
  return g;
}
export function bin(col, lid) {
  const g = new THREE.Group(), body = clay(col, { r: .55, cc: .3 }), lidM = clay(lid, { r: .5, cc: .3 }), wheel = clay('#1c1f23', { r: .6 });
  const b = rb(.8, 1.3, .95, body, .08, 3); const p = b.geometry.attributes.position; for (let i = 0; i < p.count; i++) { const k = p.getY(i) / 1.3 + .5; p.setX(i, p.getX(i) * (.84 + .16 * k)); p.setZ(i, p.getZ(i) * (.88 + .12 * k)); } b.geometry.computeVertexNormals(); b.position.y = .75; g.add(b);
  g.add(at(rb(.9, .1, 1.05, lidM, .05, 2), 0, 1.45, 0)); g.add(at(rb(.5, .06, .1, lidM, .02, 1), 0, 1.53, .5));
  [-1, 1].forEach((s) => g.add(at(cyl(.1, .1, .08, wheel, 12), s * .3, .1, -.4, 0, 0, Math.PI / 2)));
  return g;
}
export function mailbox() {
  const g = new THREE.Group(), post = clay('#6f5640', { r: .85 }), box = clay('#2a3036', { r: .45, cc: .4 });
  g.add(at(rb(.12, 1.25, .12, post, .02, 1), 0, .62, 0)); g.add(at(rb(.62, .08, .12, post, .02, 1), .25, 1.22, 0));
  const m = part(new THREE.CylinderGeometry(.19, .19, .66, 18, 1, false, 0, Math.PI), box); m.rotation.set(0, 0, Math.PI / 2); m.rotation.y = 0; const mm = new THREE.Group(); mm.add(m); m.rotation.z = Math.PI / 2; mm.position.set(.36, 1.4, 0); mm.rotation.x = 0; g.add(mm);
  g.add(at(rb(.66, .1, .36, box, .04, 1), .36, 1.32, 0)); g.add(at(rb(.05, .3, .04, clay('#e23d28', { r: .5 }), .01, 1), .6, 1.55, .2));
  return g;
}

export function buildCurbSet() {
  return withWalls(() => {
    const H = SET.H, T = SET.T, g = new THREE.Group();
    const box = (x0, x1, y0, y1, z0, z1, m, r = .012) => { const b = rb(x1 - x0, y1 - y0, z1 - z0, m, r, 1); b.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); b.castShadow = b.receiveShadow = true; g.add(b); return b; };
    const stucco = clay('#dccfbc', { r: .96, env: .3 }), stuccoLt = clay('#e6dccb', { r: .96, env: .3 }), dk = clay('#2b3138', { r: .55, env: .4 }), cap = clay('#cfc4b1', { r: .9, env: .3 }), wood = clay('#5b3e2b', { r: .6, cc: .2 });
    const glassM = clay('#3d5f7f', { r: .08, cc: 1, env: 1.4 });

    /* ============ the house (z = -5, faces +z) ============ */
    const zi = -H;
    box(-H, H + .2, 0, 3.55, zi - T, zi, stucco);
    // stone base course and pilasters
    const stoneD = (x0, x1, y0, y1, z, rotY = 0) => { const d = decal(x1 - x0, y1 - y0, stoneTex(x1 - x0, y1 - y0)); d.position.set((x0 + x1) / 2, (y0 + y1) / 2, z); d.rotation.y = rotY; g.add(d); };
    box(-H, H + .2, 0, 1.0, zi, zi + .05, cap, .01); stoneD(-H, H + .2, 0, 1.0, zi + .056);
    [[-H, -4.55], [1.55, 2.05], [4.3, 4.78]].forEach(([a, b]) => { box(a, b, 0, 3.55, zi, zi + .12, cap, .01); stoneD(a, b, 1.0, 3.55, zi + .126); });
    // parapet and eave
    box(-H - .1, H + .3, 3.55, 3.95, zi - T, zi + .5, dk, .04);
    box(-H - .14, H + .34, 3.95, 4.05, zi - T - .04, zi + .56, cap, .03);
    box(-H, H + .2, 3.4, 3.55, zi, zi + .06, clay('#e9e2d4', { r: .9 }), .01);
    // garage door
    const gx0 = -3.3, gx1 = 1.3, gw = gx1 - gx0;
    box(gx0 - .14, gx1 + .14, 0, 2.86, zi, zi + .1, dk, .02);
    const gd = decal(gw, 2.72, garageTex()); gd.position.set((gx0 + gx1) / 2, 1.36, zi + .108); g.add(gd);
    box(gx0 - .1, gx1 + .1, 2.72, 2.86, zi + .08, zi + .14, dk, .01);
    [gx0 - .45, gx1 + .45].forEach((x) => { box(x - .08, x + .08, 2.1, 2.2, zi + .12, zi + .3, dk, .02); box(x - .1, x + .1, 1.9, 2.25, zi + .12, zi + .24, dk, .03); const gl = rb(.13, .2, .1, clay('#fff0c8', { r: .3, e: '#fff0c8', ei: 1 }), .03, 2); gl.position.set(x, 2.04, zi + .3); g.add(gl); });
    // left window
    box(-4.5, -3.6, 1.15, 2.55, zi, zi + .08, clay('#f1ebe0', { r: .8 }), .012);
    { const w = rb(.74, 1.2, .04, glassM, .01, 1); w.position.set(-4.05, 1.85, zi + .1); g.add(w); }
    box(-4.5, -3.6, 1.12, 1.2, zi + .04, zi + .24, cap, .02);
    box(-4.07, -4.03, 1.25, 2.45, zi + .1, zi + .13, clay('#f1ebe0'), .004); box(-4.4, -3.7, 1.82, 1.86, zi + .1, zi + .13, clay('#f1ebe0'), .004);
    // entry: canopy, door, sidelight, step
    box(2.15, 4.2, 2.72, 3.0, zi, zi + .85, dk, .04);
    box(2.15, 4.2, 3.0, 3.06, zi, zi + .85, cap, .02);
    [2.2, 4.12].forEach((x) => box(x - .06, x + .06, 0, 2.72, zi + .74, zi + .86, dk, .02));
    box(2.55, 3.55, 0, 2.5, zi, zi + .1, clay('#352218', { r: .5 }), .02);
    box(2.62, 3.48, .08, 2.42, zi + .1, zi + .14, wood, .015);
    { const gl = rb(.2, 1.6, .03, glassM, .01, 1); gl.position.set(3.25, 1.45, zi + .17); g.add(gl); }
    [.5, 1.1, 1.7].forEach((y) => box(2.8, 3.1, y, y + .03, zi + .14, zi + .16, clay('#cfc4b1', { r: .4, m: .3 }), .004));
    box(3.55, 3.95, .08, 2.42, zi + .08, zi + .12, glassM, .008); // sidelight
    { const hl = rb(.1, .6, .06, clay('#cfd5da', { r: .25, m: .8, env: 1 }), .02, 1); hl.position.set(2.7, 1.2, zi + .2); g.add(hl); }
    box(2.3, 4.0, 0, .12, zi + .1, zi + .85, clay('#c9c1b3', { r: .9 }), .02);
    { const np = decal(.5, .25, numberTex()); np.position.set(4.52, 1.8, zi + .133); g.add(np); }
    // right window (a narrow one) and a downspout
    box(4.85, 5.2, 1.4, 2.4, zi, zi + .06, cap, .01);
    box(-4.85, -4.78, 0, 3.55, zi + .06, zi + .12, clay('#b9b2a4', { r: .5, m: .3 }), .01);
    // wall lantern by the entry
    { const l = rb(.16, .34, .16, dk, .04, 2); l.position.set(2.0, 2.0, zi + .32); g.add(l); const lg = rb(.1, .22, .1, clay('#fff0c8', { e: '#fff0c8', ei: 1.1, r: .3 }), .03, 2); lg.position.set(2.0, 2.0, zi + .32); g.add(lg); }
    // AC condenser and conduit on the far right
    box(-4.95, -4.4, 0, .02, zi + .1, zi + .6, cap, .01);

    /* ============ the block wall with the gate (x = -5, faces +x) ============ */
    const wx = -H, WH = 2.85, gz0 = SET.gateZ0, gz1 = SET.gateZ1;
    const segs = [[-H - T, gz0 - .5], [gz1 + .5, H + .2]];
    segs.forEach(([a, b]) => {
      box(wx - T, wx, 0, WH - .14, a, b, clay('#d9c8a3', { r: .96, env: .3 }), .012);
      const d = decal(b - a, WH - .14, blockTex(b - a, WH - .14)); d.rotation.y = Math.PI / 2; d.position.set(wx + .006, (WH - .14) / 2, (a + b) / 2); g.add(d);
      box(wx - T - .06, wx + .1, WH - .14, WH, a - .06, b + .06, cap, .03);
    });
    // pillars and caps
    [gz0 - .5, gz1 + .5].forEach((z, i) => {
      const a = i ? z - .02 : z - .5, b = i ? z + .5 : z + .02;
      box(wx - T, wx + .22, 0, 3.2, a, b, clay('#d2c09a', { r: .96 }), .02);
      box(wx - T - .08, wx + .3, 3.2, 3.34, a - .08, b + .08, cap, .03);
      const cz = (a + b) / 2;
      box(wx - .02, wx + .26, 3.34, 3.44, cz - .17, cz + .17, dk, .02);
      const lm = rb(.2, .28, .2, clay('#fff0c8', { e: '#ffe9b0', ei: .7, r: .3 }), .05, 2); lm.position.set(wx + .12, 3.58, cz); g.add(lm);
      box(wx + .05, wx + .19, 3.72, 3.78, cz - .13, cz + .13, dk, .02);
    });
    // the gate, swung open flat against the wall on both sides
    const iron = clay('#252a30', { r: .5, m: .5, env: .6 });
    [[-4.95, -3.98 + .02, -1], [.34, 1.7, 1]].forEach(([a, b]) => {
      const w = b - a, cz = (a + b) / 2, x = wx + .34;
      box(x - .03, x + .03, .16, 2.3, a, a + .07, iron, .01); box(x - .03, x + .03, .16, 2.3, b - .07, b, iron, .01);
      box(x - .03, x + .03, .16, .24, a, b, iron, .01); box(x - .03, x + .03, 2.22, 2.3, a, b, iron, .01); box(x - .03, x + .03, 1.2, 1.26, a, b, iron, .01);
      for (let k = 1; k < 8; k++) { const z = a + k * w / 8; box(x - .02, x + .02, .24, 2.22, z - .015, z + .015, iron, .005); }
      box(x - .04, x + .04, 1.0, 1.4, b - .3, b - .22, clay('#8d969e', { r: .3, m: .8 }), .01);
    });
    // a hose bib and a little address plaque on the wall
    box(wx + .05, wx + .12, .6, .66, 2.6, 2.74, clay('#c98a3a', { r: .35, m: .7 }), .01);

    /* ============ the desert garden ============ */
    const palm = Y.palmTree(3.7, 6); palm.position.set(-4.15, 0, -4.25); palm.scale.setScalar(1.06); g.add(palm);
    [[-2.5, -4.55, 1.2, 14, '#6f8f6a'], [-.6, -4.62, 1.5, 17, '#78986c'], [1.0, -4.5, 1.1, 13, '#6a8a66'], [4.55, -3.6, 1.2, 15, '#6f8f6a'], [-3.6, 3.7, 1.3, 16, '#78986c'], [-4.2, 1.9, 1.0, 12, '#6a8a66']].forEach(([x, z, s, n, c], i) => { const a = agave(n, s, c, i + 2); a.position.set(x, 0, z); a.rotation.y = i; g.add(a); });
    [[-1.6, -4.55], [3.9, -3.5]].forEach(([x, z], i) => { const y = yuccaTall(1.0 + i * .15, i + 5); y.position.set(x, 0, z); g.add(y); });
    [[-3.9, 3.0, 1.0], [-2.1, 4.4, .8], [4.3, -3.9, .9]].forEach(([x, z, s], i) => { const b = barrel(s); b.position.set(x, 0, z); g.add(b); });
    [[-3.9, 1.1, 1, .9], [-3.0, 2.6, 2, .7], [-2.4, 4.4, 3, .5], [-.5, -4.35, 4, .5], [2.4, -4.4, 5, .6], [4.6, -3.0, 6, .45]].forEach(([x, z, sd, r], i) => { const b = Y.boulder(sd, r, ['#b3a08a', '#a89580', '#bfae98'][i % 3]); b.position.set(x, 0, z); b.rotation.y = i; g.add(b); });
    const b1 = bin('#4b5560', '#39424b'); b1.position.set(-4.4, 0, 3.4); b1.rotation.y = Math.PI / 2 - .05; g.add(b1);
    const b2 = bin('#2f6bb5', '#25558f'); b2.position.set(-4.4, 0, 4.4); b2.rotation.y = Math.PI / 2 + .05; g.add(b2);
    const mb = mailbox(); mb.position.set(-1.6, 0, 4.55); mb.rotation.y = -Math.PI / 2 + .1; g.add(mb);
    // entry planters
    [[2.3, -4.0], [3.95, -4.0]].forEach(([x, z], i) => { const pot = new THREE.Group(); pot.add(at(cyl(.34, .24, .55, clay('#a9593a', { r: .8 }), 20), 0, .28, 0)); pot.add(at(cyl(.36, .36, .07, clay('#b9694a', { r: .8 }), 20), 0, .58, 0)); const y = agave(11, .6, '#7a9a6c', 8 + i); y.position.y = .6; pot.add(y); pot.position.set(x, 0, z); g.add(pot); });
    return g;
  });
}
