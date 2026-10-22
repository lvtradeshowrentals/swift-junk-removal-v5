// Living-room clutter, in more detail: books, frames, curtains, a rug with a pattern, a treadmill, a suitcase...
import { THREE, clay, rb, cyl, sph, at, tube, part, rng, canvasTex, decal, withWalls, dissolvable, SHW } from './kit.js';

const BOOK = ['#c0463b', '#e0a43a', '#3f7f9c', '#5d8a5a', '#2f3a4d', '#d8d3c6', '#8b5e83', '#e8793a', '#4a6a8a', '#a35a3c', '#7d9a6b'];

export function bookshelf(w = 2.2, h = 3.1, d = .55, seed = 5) {
  const g = new THREE.Group(), wood = clay('#6f4e37', { r: .7 }), back = clay('#4a3524', { r: .9 }), R = rng(seed), cream = clay('#efe6cf', { r: .8 });
  const t = .07;
  g.add(at(rb(t, h, d, wood, .015), -w / 2 + t / 2, h / 2, 0)); g.add(at(rb(t, h, d, wood, .015), w / 2 - t / 2, h / 2, 0));
  g.add(at(rb(w, .07, d, wood, .015), 0, h - .035, 0)); g.add(at(rb(w - .1, h - .06, .035, back, .008, 1), 0, h / 2, -d / 2 + .03));
  g.add(at(rb(w + .04, .09, d + .03, wood, .015), 0, .05, .0));
  const rows = 5, step = (h - .22) / rows;
  for (let i = 0; i < rows; i++) {
    const y = .13 + i * step; if (i) g.add(at(rb(w - .12, .045, d - .04, wood, .01, 1), 0, y, 0));
    const top = y + (i ? .0225 : .02); let x = -w / 2 + .12;
    const full = i !== 3;
    while (x < w / 2 - .3) {
      if (!full && x > -w / 2 + w * .52) break;
      const bw = .05 + R() * .08, bh = .3 + R() * Math.min(.22, step - .36), bd = d * .7;
      if (R() < .1) { x += .16; continue; }
      const col = BOOK[(R() * BOOK.length) | 0], lean = R() < .08 ? (R() - .5) * .3 : 0;
      g.add(at(rb(bw, bh, bd, clay(col, { r: .85 }), .008, 1), x + bw / 2, top + bh / 2, 0, 0, 0, lean));
      if (R() < .55) g.add(at(rb(bw + .002, .018, .01, cream, .003, 1), x + bw / 2, top + bh * (.25 + R() * .5), bd / 2 + .004, 0, 0, lean));
      x += bw + .004;
    }
    if (!full) { // a lying stack + a vase + a framed photo
      const sx = -w / 2 + w * .72;
      for (let k = 0; k < 4; k++) g.add(at(rb(.42 - k * .02, .07, .3, clay(BOOK[(R() * BOOK.length) | 0], { r: .85 }), .01, 1), sx, top + .035 + k * .072, 0, (R() - .5) * .3));
      g.add(at(cyl(.09, .06, .22, clay('#d8d3c6', { r: .4, cc: .5 }), 20), sx + .45, top + .11, .02));
      g.add(at(rb(.3, .24, .03, clay('#2f3a4d', { r: .6 }), .01, 1), sx - .05, top + .31, 0, .25));
    }
  }
  // a trailing plant on top
  g.add(at(cyl(.15, .11, .2, clay('#b9694a', { r: .9 }), 20), -w * .28, h + .1, 0));
  for (let k = 0; k < 7; k++) { const lf = sph(.08, clay('#5f8f52', { r: .8 }), .5, 1.6, .3, 10); lf.position.set(-w * .28 + Math.sin(k * 2.1) * .12, h + .28 + (k % 3) * .06, Math.cos(k * 2.1) * .1); lf.rotation.set(.3, k, .4); g.add(lf); }
  return g;
}

export function coffeeTable() {
  const g = new THREE.Group(), wood = clay('#8a6240', { r: .6 }), glass = clay('#bcd3dc', { r: .08, cc: 1, env: 1.2 });
  g.add(at(rb(1.5, .07, .85, wood, .02), 0, .5, 0)); g.add(at(rb(1.34, .03, .7, glass, .01), 0, .55, 0));
  [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([a, b]) => g.add(at(rb(.07, .5, .07, wood, .02), a * .66, .25, b * .34)));
  g.add(at(rb(1.3, .04, .6, wood, .012), 0, .15, 0));
  const R = rng(3);
  for (let k = 0; k < 3; k++) g.add(at(rb(.42, .012, .3, clay(['#e8793a', '#3f7f9c', '#efe6cf'][k], { r: .6 }), .004, 1), -.35, .58 + k * .013, .05, .2 + k * .12));
  [[.2, .0], [.45, .17]].forEach(([x, z], i) => { g.add(at(cyl(.06, .05, .1, clay(i ? '#e0a43a' : '#efe6cf', { r: .4, cc: .5 }), 18), x, .62, z)); g.add(at(cyl(.047, .047, .01, clay('#3b2a20', { r: .3 }), 14), x, .675, z)); });
  g.add(at(rb(.16, .02, .05, clay('#1d2024', { r: .4 }), .008, 1), .1, .58, -.22, .5));
  g.add(at(cyl(.06, .06, .08, clay('#d9d3c6', { r: .5 }), 18), .5, .6, -.2)); g.add(at(sph(.012, clay('#ffb14a', { e: 1.2, r: .4 }), 1, 1.6, 1, 8), .5, .66, -.2));
  return g;
}

/* wall art: a frame with a printed abstract */
export function picture(w = 1, h = .7, kind = 0) {
  const g = new THREE.Group(), frame = clay(kind % 2 ? '#2b2f36' : '#d9c7a4', { r: .5 });
  g.add(at(rb(w, h, .05, frame, .012), 0, 0, 0));
  const tex = canvasTex(256, Math.round(256 * h / w), (c, W, H) => {
    const pal = [['#f1e7d3', '#e8793a', '#3f7f9c', '#2f3a4d'], ['#dfe8ea', '#5d8a5a', '#e0a43a', '#c0463b'], ['#f4efe6', '#8b5e83', '#3f7f9c', '#e8793a']][kind % 3];
    c.fillStyle = pal[0]; c.fillRect(0, 0, W, H);
    if (kind % 3 === 0) { c.fillStyle = pal[1]; c.beginPath(); c.arc(W * .62, H * .42, H * .26, 0, 7); c.fill(); c.fillStyle = pal[2]; c.fillRect(0, H * .66, W, H * .34); c.fillStyle = pal[3]; c.beginPath(); c.moveTo(0, H * .66); c.lineTo(W * .3, H * .3); c.lineTo(W * .55, H * .66); c.fill(); }
    else if (kind % 3 === 1) { for (let i = 0; i < 6; i++) { c.fillStyle = pal[1 + i % 3]; c.fillRect(W * (.08 + i * .15), H * (.15 + (i % 2) * .15), W * .1, H * (.7 - (i % 2) * .15)); } }
    else { for (let i = 0; i < 5; i++) { c.strokeStyle = pal[1 + i % 3]; c.lineWidth = 9; c.beginPath(); c.arc(W * .5, H * .5, H * (.12 + i * .09), 0, 7); c.stroke(); } }
  });
  const art = decal(w - .12, h - .12, tex); art.position.z = .03; g.add(art);
  g.add(at(rb(w - .08, h - .08, .01, clay('#f6f1e6', { r: .8 }), .004, 1), 0, 0, .027));
  return g;
}
export function wallClock() {
  const g = new THREE.Group();
  const r = part(new THREE.CylinderGeometry(.34, .34, .06, 40), clay('#1d2024', { r: .4 })); r.rotation.x = Math.PI / 2; g.add(r);
  const f = part(new THREE.CylinderGeometry(.29, .29, .02, 40), clay('#f6f1e6', { r: .6 })); f.rotation.x = Math.PI / 2; f.position.z = .035; g.add(f);
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; g.add(at(rb(.012, i % 3 ? .04 : .07, .01, clay('#1d2024'), .003, 1), Math.sin(a) * .24, Math.cos(a) * .24, .05, 0, 0, -a)); }
  g.add(at(rb(.016, .17, .01, clay('#1d2024'), .004, 1), 0, .07, .055, 0, 0, -.6)); g.add(at(rb(.012, .24, .01, clay('#ff5a1f'), .004, 1), .06, .08, .06, 0, 0, -2.4));
  return g;
}

/* curtains with real folds: a displaced grid of cloth hanging from a rod */
export function curtains(w = 3.2, h = 1.9, col = '#7d9a8f') {
  const g = new THREE.Group();
  const cloth = clay(col, { r: .95, sheen: .6 });
  const mk = (x0, ww) => {
    const geo = new THREE.PlaneGeometry(ww, h, 44, 10), p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i); p.setZ(i, Math.sin(x * 16 + y * .6) * .06 + (y < 0 ? Math.sin(x * 9) * .02 * (-y) : 0)); }
    geo.computeVertexNormals();
    const m = part(geo, new THREE.MeshPhysicalMaterial({ color: col, roughness: .95, side: THREE.DoubleSide, sheen: .6, sheenColor: new THREE.Color('#ffffff') }), {});
    m.material = clay(col, { r: .95, sheen: .6 }); m.material.side = THREE.DoubleSide;
    m.position.set(x0, 0, 0); return m;
  };
  g.add(mk(-w * .3, w * .4)); g.add(mk(w * .3, w * .4));
  g.add(at(cyl(.025, .025, w + .5, clay('#2b2f36', { m: .5, r: .4 }), 10), 0, h / 2 + .04, .12, 0, 0, Math.PI / 2));
  [-1, 1].forEach((s) => g.add(at(sph(.05, clay('#2b2f36', { m: .5, r: .4 }), 1, 1, 1, 10), s * (w / 2 + .25), h / 2 + .04, .12)));
  for (let i = 0; i < 12; i++) { const rr = part(new THREE.TorusGeometry(.04, .008, 6, 14), clay('#2b2f36', { m: .5, r: .4 })); rr.position.set(-w * .5 + .1 + i * (w - .2) / 11, h / 2 + .04, .12); rr.rotation.y = Math.PI / 2; g.add(rr); }
  return g;
}

export function suitcase(col = '#3f7f9c') {
  const g = new THREE.Group(), body = clay(col, { r: .5, cc: .4 }), dark = clay('#1d2024', { r: .5 });
  g.add(at(rb(.85, 1.15, .42, body, .09, 4), 0, .72, 0));
  for (let i = -3; i <= 3; i++) g.add(at(rb(.03, 1.02, .02, clay(col, { r: .3, cc: .6 }), .006, 1), i * .11, .72, .215));
  g.add(at(rb(.5, .06, .1, dark, .02), 0, 1.33, 0)); [-1, 1].forEach((s) => { g.add(at(cyl(.025, .025, .22, clay('#8b949c', { m: .6, r: .3 }), 8), s * .18, 1.4, 0)); });
  [-1, 1].forEach((s) => g.add(at(cyl(.06, .06, .05, dark, 14), s * .3, .08, .14, 0, Math.PI / 2)));
  g.add(at(rb(.2, .14, .01, clay('#f6f1e6', { r: .8 }), .004, 1), -.15, .95, .22)); g.add(at(rb(.1, .1, .01, clay('#e8793a', { r: .8 }), .004, 1), .2, .5, .22, 0, 0, .3));
  return g;
}
export function vacuum() {
  const g = new THREE.Group(), red = clay('#c0463b', { r: .4, cc: .5 }), dark = clay('#2b2f36', { r: .5 }), gr = clay('#aab2b9', { r: .5 });
  g.add(at(rb(.62, .14, .36, dark, .05), 0, .1, .1)); g.add(at(rb(.5, .2, .3, red, .08), 0, .27, .05));
  g.add(at(rb(.34, .7, .22, red, .08), 0, .65, -.02, 0, -.1)); g.add(at(cyl(.09, .09, .3, gr, 16), 0, .88, -.0));
  g.add(tube([0, .98, -.05], [0, 1.45, -.2], .025, dark)); g.add(tube([-.12, 1.5, -.2], [.12, 1.5, -.2], .025, dark));
  [-1, 1].forEach((s) => g.add(at(cyl(.07, .07, .05, dark, 16), s * .27, .08, -.0, 0, 0, Math.PI / 2)));
  g.add(part(new THREE.TorusGeometry(.2, .018, 8, 40, 4.5), clay('#3a4048', { r: .5 }))); g.children[g.children.length - 1].position.set(.3, .2, .2);
  return g;
}
export function basket() {
  const g = new THREE.Group(), pl = clay('#e8e3d4', { r: .6 });
  const geo = new THREE.CylinderGeometry(.42, .34, .55, 28, 1, true); const b = part(geo, new THREE.MeshStandardMaterial({ color: '#e8e3d4', roughness: .6, side: THREE.DoubleSide })); b.material = clay('#e8e3d4', { r: .6 }); b.material.side = THREE.DoubleSide; b.position.y = .28; g.add(b);
  g.add(at(cyl(.34, .34, .03, pl, 24), 0, .02, 0));
  const R = rng(9), cols = ['#e8793a', '#3f7f9c', '#d8d3c6', '#8b5e83', '#e0a43a', '#5d8a5a'];
  for (let i = 0; i < 16; i++) { const a = R() * 6.28, r = R() * .26; const c = sph(.15 + R() * .08, clay(cols[i % 6], { r: .95, sheen: .5 }), 1.2, .6, 1, 10); c.position.set(Math.cos(a) * r, .5 + R() * .18, Math.sin(a) * r); c.rotation.set(R(), R() * 6, R()); g.add(c); }
  g.add(part(new THREE.TorusGeometry(.4, .02, 6, 30), pl)); g.children[g.children.length - 1].position.y = .55; g.children[g.children.length - 1].rotation.x = Math.PI / 2;
  return g;
}
export function mirror() {
  const g = new THREE.Group(), fr = clay('#c9a56a', { r: .4, m: .4 });
  g.add(at(rb(.9, 1.9, .08, fr, .03), 0, .98, 0)); g.add(at(rb(.76, 1.76, .02, clay('#cfe0e8', { r: .05, m: .7, cc: 1, env: 1.6 }), .01, 1), 0, .98, .04));
  g.add(tube([.1, 1.6, -.04], [.25, .0, -.6], .035, fr)); g.add(tube([-.1, 1.6, -.04], [-.25, .0, -.6], .035, fr));
  return g;
}
export function treadmill() {
  const g = new THREE.Group(), dark = clay('#23272c', { r: .5 }), gr = clay('#7b848c', { r: .4, m: .4 }), belt = clay('#15171a', { r: .8 });
  g.add(at(rb(.8, .16, 2.0, dark, .05), 0, .3, 0)); g.add(at(rb(.62, .02, 1.8, belt, .01, 1), 0, .395, 0));
  [-1, 1].forEach((s) => { g.add(at(rb(.08, .06, 1.7, clay('#a9b1b8', { r: .5 }), .02), s * .4, .38, 0)); g.add(tube([s * .38, .35, .86], [s * .34, 1.35, .72], .035, gr)); g.add(at(cyl(.07, .07, .05, dark, 14), s * .35, .06, .8, 0, 0, Math.PI / 2)); g.add(at(cyl(.07, .07, .05, dark, 14), s * .35, .06, -.8, 0, 0, Math.PI / 2)); });
  g.add(at(rb(.74, .3, .12, dark, .05), 0, 1.36, .72, 0, -.3)); g.add(at(rb(.5, .14, .02, clay('#0e3a4a', { r: .15, cc: 1 }), .01, 1), 0, 1.38, .66, 0, -.3));
  [-.18, 0, .18].forEach((x) => g.add(at(sph(.025, clay('#ff5a1f', { e: .8 }), 1, 1, 1, 8), x, 1.5, .67)));
  g.add(at(rb(.66, .04, .1, gr, .02), 0, 1.5, .78, 0, -.3)); // handlebar
  return g;
}
/* a floor rug with a printed pattern */
export function rugPattern(w = 3.4, l = 2.4) {
  const g = new THREE.Group();
  g.add(at(rb(w, .035, l, clay('#c9b89a', { r: 1 }), .015, 1), 0, .0175, 0));
  const tex = canvasTex(512, Math.round(512 * l / w), (c, W, H) => {
    c.fillStyle = '#b7634a'; c.fillRect(0, 0, W, H);
    c.fillStyle = '#efe3c8'; c.fillRect(W * .04, H * .06, W * .92, H * .88);
    c.fillStyle = '#35506a'; c.fillRect(W * .08, H * .12, W * .84, H * .76);
    const n = 5; for (let i = 0; i < n; i++) for (let j = 0; j < 3; j++) { const cx = W * (.16 + i * .17), cy = H * (.28 + j * .22); c.fillStyle = '#efe3c8'; c.beginPath(); c.moveTo(cx, cy - 26); c.lineTo(cx + 26, cy); c.lineTo(cx, cy + 26); c.lineTo(cx - 26, cy); c.closePath(); c.fill(); c.fillStyle = '#e0a43a'; c.beginPath(); c.arc(cx, cy, 8, 0, 7); c.fill(); }
    c.strokeStyle = 'rgba(0,0,0,.12)'; c.lineWidth = 1; for (let i = 0; i < 90; i++) { c.beginPath(); c.moveTo(0, i * H / 90); c.lineTo(W, i * H / 90); c.stroke(); }
  });
  const d = decal(w - .04, l - .04, tex); d.rotation.x = -Math.PI / 2; d.position.y = .04; g.add(d);
  for (let i = 0; i < 26; i++) { g.add(at(rb(.012, .02, .12, clay('#efe3c8', { r: 1 }), .004, 1), -w / 2 - .0, .02, -l / 2 + .08 + i * (l - .16) / 25)); g.add(at(rb(.012, .02, .12, clay('#efe3c8', { r: 1 }), .004, 1), w / 2 + .0, .02, -l / 2 + .08 + i * (l - .16) / 25)); }
  return g;
}
/* a cardboard box with a marker label */
export function labeledBox(w, h, d, text, o = {}) {
  const g = new THREE.Group(), body = clay(o.c || '#c9a278', { r: .95 });
  g.add(at(rb(w, h, d, body, .03), 0, h / 2, 0));
  g.add(at(rb(w * .24, .018, d * 1.003, clay('#e4d3b4', { r: .5 }), .006, 1), 0, h + .002, 0));
  g.add(at(rb(w * .96, .012, .012, clay('#a98558', { r: .9 }), .004, 1), 0, h * .98, d / 2 - .01));
  const tex = canvasTex(256, 128, (c, W, H) => { c.fillStyle = 'rgba(0,0,0,0)'; c.clearRect(0, 0, W, H); c.fillStyle = '#f6f1e6'; c.fillRect(8, 14, W - 16, H - 28); c.fillStyle = '#1d2024'; c.font = 'bold 40px sans-serif'; c.textAlign = 'center'; c.fillText(text, W / 2, H / 2 + 12); c.strokeStyle = '#c0463b'; c.lineWidth = 4; c.beginPath(); c.moveTo(24, H - 24); c.lineTo(W - 24, H - 24); c.stroke(); });
  const dl = decal(Math.min(w, d) * .7, Math.min(w, d) * .35, tex); dl.position.set(0, h * .55, d / 2 + .003); g.add(dl);
  return g;
}
export function lampTable() {
  const g = new THREE.Group();
  g.add(at(cyl(.5, .5, .06, clay('#a98558', { r: .6 }), 32), 0, .78, 0)); g.add(at(cyl(.05, .05, .75, clay('#6f4e37', { r: .6 }), 12), 0, .4, 0)); g.add(at(cyl(.32, .36, .05, clay('#6f4e37', { r: .6 }), 24), 0, .03, 0));
  return g;
}

/* --- room shell pieces (built in wall mode so they sweep on the wall schedule) --- */
export function homeWalls(H = 4, T = .36, WH = 3.7) {
  return withWalls(() => {
    const g = new THREE.Group();
    const plaster = clay('#efeeea', { r: .95, env: .4 }), plasterB = clay('#f4f3ef', { r: .95, env: .4 }), white = clay('#ffffff', { r: .6 });
    const wallPiece = (x0, x1, y0, y1, z0, z1, m) => { const w = rb(x1 - x0, y1 - y0, z1 - z0, m, .012, 1); w.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); w.receiveShadow = w.castShadow = true; return w; };
    const x0 = -H - T, x1 = -H, zA = -H - T, zB = H + T / 2, wy0 = 1.45, wy1 = 3.05, wz0 = -.7, wz1 = 1.9;
    g.add(wallPiece(x0, x1, 0, wy0, zA, zB, plaster)); g.add(wallPiece(x0, x1, wy1, WH, zA, zB, plaster));
    g.add(wallPiece(x0, x1, wy0, wy1, zA, wz0, plaster)); g.add(wallPiece(x0, x1, wy0, wy1, wz1, zB, plaster));
    // window: glass, mullions, sill, trim
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(wz1 - wz0, wy1 - wy0), new THREE.MeshBasicMaterial({ color: '#dcecfb' }));
    glass.rotation.y = Math.PI / 2; glass.position.set(x0 + .09, (wy0 + wy1) / 2, (wz0 + wz1) / 2); glass.userData.nomerge = true;
    const gc = document.createElement('canvas'); gc.width = 4; gc.height = 256; const gx = gc.getContext('2d'), gr = gx.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#fbfdff'); gr.addColorStop(1, '#cfe3f6'); gx.fillStyle = gr; gx.fillRect(0, 0, 4, 256);
    const gt = new THREE.CanvasTexture(gc); gt.colorSpace = THREE.SRGBColorSpace; glass.material.map = gt; glass.material.toneMapped = false; dissolvable(glass.material, false, SHW); g.add(glass);
    const fx = (x0 + x1) / 2 + .02, cz = (wz0 + wz1) / 2;
    [wy0 - .035, wy1 + .035].forEach((y) => { const m = rb(.2, .09, wz1 - wz0 + .18, white, .02); m.position.set(fx, y, cz); g.add(m); });
    [wz0 - .035, wz1 + .035].forEach((z) => { const m = rb(.2, wy1 - wy0 + .18, .09, white, .02); m.position.set(fx, (wy0 + wy1) / 2, z); g.add(m); });
    { const m = rb(.12, wy1 - wy0, .05, white, .015); m.position.set(fx, (wy0 + wy1) / 2, cz); g.add(m); }
    { const m = rb(.12, .05, wz1 - wz0, white, .015); m.position.set(fx, (wy0 + wy1) / 2 + .1, cz); g.add(m); }
    { const m = rb(.32, .07, wz1 - wz0 + .4, white, .02); m.position.set(fx + .08, wy0 - .09, cz); g.add(m); }
    g.add(wallPiece(-H, H + T / 2, 0, WH, -H - T, -H, plasterB));
    // skirting, a chair rail, crown, an outlet and a light switch
    const sk = (a, b, c, d, e, f) => { const m = rb(d, e, f, white, .01, 1); m.position.set(a, b, c); g.add(m); };
    sk(-H + .025, .1, 0, .05, .2, H * 2); sk(0, .1, -H + .025, H * 2, .2, .05);
    sk(-H + .015, 3.62, 0, .03, .12, H * 2); sk(0, 3.62, -H + .015, H * 2, .12, .03);
    sk(-H + .02, 1.1, 0, .03, .05, H * 2); sk(0, 1.1, -H + .02, H * 2, .05, .03);
    const outlet = rb(.03, .17, .11, clay('#f2efe6', { r: .5 }), .01, 1); outlet.position.set(-H + .02, .55, -2.6); g.add(outlet);
    const sw = rb(.12, .17, .03, clay('#f2efe6', { r: .5 }), .01, 1); sw.position.set(-3.0, 1.3, -H + .02); g.add(sw);
    g.children.forEach((c) => { if (c.isMesh) c.customDepthMaterial = c.customDepthMaterial; });
    return g;
  });
}
