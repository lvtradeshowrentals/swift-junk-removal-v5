// A house mid-remodel: stud walls, drywall, lumber, old fixtures, tools, scaffolding, work lights.
import { THREE, clay, rb, cyl, sph, at, tube, part, rng, canvasTex, decal, withWalls, dissolvable, SHW } from './kit.js';
import * as P from './props.js';

const LUM = ['#ead0a4', '#dfc08e', '#f0d9b0', '#d8b886'];
const OSB = '#a8773f', PINK = '#f2a7b5', ORANGE = '#f26b1d', YEL = '#f4c430';

export function siteWalls(H = 4, T = .36, WH = 3.1) {
  return withWalls(() => {
    const g = new THREE.Group(), R = rng(8);
    const lum = (i) => clay(LUM[i % LUM.length], { r: .85 });
    const box = (x0, x1, y0, y1, z0, z1, m) => { const b = rb(x1 - x0, y1 - y0, z1 - z0, m, .008, 1); b.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); g.add(b); return b; };
    const osb = clay(OSB, { r: .9 }), osb2 = clay('#b98a50', { r: .9 }), dry = clay('#ecebe6', { r: .95 }), tape = clay('#d9d6cc', { r: .95 }), pink = clay(PINK, { r: 1, sheen: .6 }), blueBox = clay('#3a7bd5', { r: .5 }), romex = clay('#f0c13a', { r: .5 });
    /* left wall (x = -H): studs every 0.62, OSB behind, a window rough opening, batts in some bays */
    const xo = -H - .12, xi = -H, wz0 = -.45, wz1 = 1.55, sill = 1.15, head = 2.45;
    box(xo - .02, xo + .04, 0, WH, -H - T, H + T / 2, osb); for (let i = 0; i < 6; i++) box(xo - .025, xo + .05, 0, WH, -H - T + i * 1.45, -H - T + i * 1.45 + .012, osb2);
    box(xo, xi, 0, .1, -H - T, H + T / 2, lum(0)); box(xo, xi, WH - .1, WH, -H - T, H + T / 2, lum(1)); box(xo, xi, WH, WH + .1, -H - T, H + T / 2, lum(2));
    let n = 0;
    for (let z = -H - T + .08; z < H + T / 2 - .05; z += .62, n++) {
      const inWin = z > wz0 - .05 && z < wz1 + .05;
      const sy0 = inWin ? (z < wz0 + .1 || z > wz1 - .1 ? .1 : null) : .1;
      if (inWin && sy0 == null) { box(xo, xi, .1, sill, z - .045, z + .045, lum(n)); box(xo, xi, head, WH - .1, z - .045, z + .045, lum(n)); continue; }
      box(xo, xi, .1, WH - .1, z - .045, z + .045, lum(n));
      if (!inWin && n % 3 === 1) box(xo + .02, xi - .03, .15, 2.2 + (n % 2) * .5, z + .06, z + .54, pink);
    }
    box(xo, xi, head - .3, head, wz0 - .12, wz1 + .12, lum(1)); box(xo, xi, sill - .08, sill, wz0, wz1, lum(3));
    [wz0 - .06, wz1 + .06].forEach((z) => box(xo, xi, .1, head - .3, z - .045, z + .045, lum(2)));
    // electrical: boxes + yellow cable, a rough-in outlet
    box(xi - .02, xi + .04, .55, .78, -2.55, -2.4, blueBox); box(xi - .02, xi + .04, 1.5, 1.73, 2.72, 2.87, blueBox);
    g.add(tube([xi + .0, .78, -2.5], [xi + .0, 2.7, -2.5], .012, romex, 5)); g.add(tube([xi + .0, 2.7, -2.5], [xi + .0, 2.7, 2.8], .012, romex, 5)); g.add(tube([xi + .0, 2.7, 2.8], [xi + .0, 1.73, 2.8], .012, romex, 5));
    // plastic sheeting over the window opening (soft, translucent)
    const wrap = new THREE.Mesh(new THREE.PlaneGeometry(wz1 - wz0 + .1, head - sill), new THREE.MeshPhysicalMaterial({ color: '#dfeaf2', transparent: true, opacity: .42, roughness: .15, side: THREE.DoubleSide, depthWrite: false }));
    dissolvable(wrap.material, false, SHW); wrap.rotation.y = Math.PI / 2; wrap.position.set(xi - .02, (head + sill) / 2, (wz0 + wz1) / 2); wrap.userData.nomerge = true; g.add(wrap);
    /* back wall (z = -H): studs, a rough door opening, and drywall hung on the left half with taped seams */
    const zo = -H - .12, zi = -H, dx0 = 1.2, dx1 = 2.3;
    box(-H, H + T / 2, 0, WH, zo - .02, zo + .04, osb);
    box(-H, H + T / 2, 0, .1, zo, zi, lum(1)); box(-H, H + T / 2, WH - .1, WH, zo, zi, lum(2)); box(-H, H + T / 2, WH, WH + .1, zo, zi, lum(0));
    n = 0;
    for (let x = -H + .08; x < H + T / 2 - .05; x += .62, n++) {
      const inDoor = x > dx0 - .05 && x < dx1 + .05; if (inDoor && x > dx0 + .08 && x < dx1 - .08) continue;
      box(x - .045, x + .045, .1, inDoor ? 2.5 : WH - .1, zo, zi, lum(n + 1));
    }
    box(dx0 - .1, dx1 + .1, 2.5, 2.8, zo, zi, lum(2)); [dx0 - .02, dx1 + .02].forEach((x) => box(x - .045, x + .045, .1, 2.5, zo, zi, lum(3)));
    // drywall over the first bays (inside face), with seams, screws, a corner bead
    for (let i = 0; i < 3; i++) { const x0 = -H + .12 + i * 1.25; box(x0, x0 + 1.22, .1, WH - .1, zi + .0, zi + .06, dry); box(x0 + 1.2, x0 + 1.25, .1, WH - .1, zi + .055, zi + .075, tape); }
    box(-H + .12, -H + 3.75, 1.5, 1.55, zi + .06, zi + .07, tape); box(-H + .12, -H + 3.75, 2.55, 2.6, zi + .06, zi + .07, tape);
    for (let i = 0; i < 40; i++) box(-H + .3 + (i % 10) * .36, -H + .33 + (i % 10) * .36, .3 + Math.floor(i / 10) * .8, .33 + Math.floor(i / 10) * .8, zi + .06, zi + .072, clay('#8b949c', { r: .4, m: .6 }));
    // a joint-compound smear and mud pan marks on the drywall
    box(-H + 1.0, -H + 2.2, 1.0, 1.35, zi + .06, zi + .066, clay('#f6f5f1', { r: .95 }));
    // corner posts + diagonal bracing with stakes
    box(-H - .14, -H + .02, 0, WH + .1, -H - .14, -H + .02, lum(0)); box(-H - .14, -H + .02, 0, WH + .1, -H - .02, -H + .12, lum(2));
    g.add(tube([-H + .1, 2.9, -H + .06], [-H + 2.1, .1, -H + .06], .03, lum(1), 6)); g.add(tube([-H + .06, 2.9, -H + .1], [-H + .06, .1, -H + 2.1], .03, lum(3), 6));
    g.add(at(rb(.3, .05, .05, clay('#8b949c', { m: .6, r: .4 }), .01, 1), -H + 1.0, 1.5, -H + .07, 0, 0, -.9));
    return g;
  });
}

export function drywallLean(n = 5) {
  const g = new THREE.Group(), dry = clay('#ecebe6', { r: .95 }), back = clay('#a99b7e', { r: .95 });
  for (let i = 0; i < n; i++) { const s = new THREE.Group(); s.add(at(rb(1.25, 2.5, .06, i % 2 ? dry : clay('#e2e0da', { r: .95 }), .01, 1), 0, 0, 0)); s.add(at(rb(1.25, 2.5, .005, back, .002, 1), 0, 0, -.033)); s.position.set((i % 2) * .03, 1.2, i * .075); s.rotation.x = -.19; g.add(s); }
  g.add(at(rb(1.1, .02, .14, clay('#d9392c', { r: .8 }), .004, 1), 0, 1.95, .27, 0, -.19)); // a stripe of tape
  return g;
}
export function drywallPile() {
  const g = new THREE.Group(), R = rng(2);
  for (let i = 0; i < 7; i++) g.add(at(rb(2.5, .065, 1.25, clay(i % 2 ? '#ecebe6' : '#e2e0da', { r: .95 }), .01, 1), (R() - .5) * .06, .04 + i * .066, (R() - .5) * .05, (R() - .5) * .04));
  g.add(at(rb(2.3, .06, .6, clay('#ecebe6', { r: .95 }), .01, 1), .1, .045 + 7 * .066, .35, .08)); g.add(at(rb(.9, .06, .5, clay('#e8e6e0', { r: .95 }), .01, 1), -.6, .105 + 7 * .066, -.3, -.3));
  for (let i = 0; i < 8; i++) g.add(at(rb(.012, .012, .1, clay('#8b949c', { m: .6, r: .4 }), .004, 1), (R() - .5) * 2, .5 + 7 * .066, (R() - .5) * 1, R()));
  const bx = rb(.28, .22, .18, clay('#f0c13a', { r: .6 }), .02); bx.position.set(.7, .52, -.25); g.add(bx);
  return g;
}
export function lumberBundle(len = 2.9, rows = 4, cols = 6, seed = 1) {
  const g = new THREE.Group(), R = rng(seed), strap = clay('#2f3338', { r: .6 });
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const m = clay(LUM[(r + c) % 4], { r: .85 }); g.add(at(rb(.1, .15, len + (R() - .5) * .08, m, .008, 1), -cols * .052 + c * .105, .08 + r * .152, 0)); }
  [-.9, .9].forEach((z) => g.add(at(rb(cols * .105 + .02, rows * .152 + .02, .035, strap, .006, 1), 0, rows * .076 + .0, z)));
  const tex = canvasTex(128, 64, (c, W, H) => { c.fillStyle = '#f4f1e6'; c.fillRect(0, 0, W, H); c.fillStyle = '#1d2024'; c.font = 'bold 22px sans-serif'; c.fillText('2x4  SPF', 8, 28); c.fillStyle = '#c0463b'; c.fillText('#2 KD', 8, 54); });
  const d = decal(.3, .15, tex); d.position.set(0, rows * .152 * .6, -len / 2 - .002); d.rotation.y = Math.PI; g.add(d);
  return g;
}
export function scrapPile() {
  const g = new THREE.Group(), R = rng(7);
  for (let i = 0; i < 16; i++) { const l = .3 + R() * 1.1; const b = rb(.09, .14, l, clay(LUM[i % 4], { r: .85 }), .008, 1); b.position.set((R() - .5) * 1.0, .07 + (i % 4) * .13, (R() - .5) * .8); b.rotation.y = R() * 3; b.rotation.z = (R() - .5) * .2; g.add(b); }
  for (let i = 0; i < 18; i++) g.add(at(sph(.05, clay('#e8d3a8', { r: 1 }), 2, .3, 1.4, 6), (R() - .5) * 1.4, .02, (R() - .5) * 1.1)); // sawdust
  return g;
}
export function plywoodStack(n = 6) {
  const g = new THREE.Group();
  const tex = canvasTex(256, 128, (c, W, H) => { c.fillStyle = '#d4ad74'; c.fillRect(0, 0, W, H); for (let i = 0; i < 40; i++) { c.strokeStyle = `rgba(120,80,40,${.08 + Math.random() * .1})`; c.lineWidth = 1 + Math.random(); c.beginPath(); c.moveTo(0, Math.random() * H); c.bezierCurveTo(W * .3, Math.random() * H, W * .7, Math.random() * H, W, Math.random() * H); c.stroke(); } c.fillStyle = 'rgba(60,40,20,.5)'; c.font = 'bold 20px sans-serif'; c.fillText('CDX 3/4"', 20, 70); });
  for (let i = 0; i < n; i++) g.add(at(rb(2.45, .06, 1.22, clay(i % 2 ? '#d4ad74' : '#cfa56c', { r: .85 }), .006, 1), (i % 3) * .02, .035 + i * .063, (i % 2) * .02, (i % 4 - 1.5) * .008));
  const d = decal(2.3, 1.1, tex); d.rotation.x = -Math.PI / 2; d.position.y = .068 + n * .063; g.add(d);
  return g;
}
export function cabinetRun() {
  const g = new THREE.Group(), body = clay('#b99a72', { r: .8 }), door = clay('#c9ad84', { r: .75 }), top = clay('#d9d3c4', { r: .5 }), knob = clay('#6b747b', { r: .35, m: .6 }), ch = clay('#c9d1d6', { r: .2, m: .9, env: 1.2 });
  for (let i = 0; i < 3; i++) {
    const x = (i - 1) * .92; g.add(at(rb(.9, .86, .62, body, .02), x, .53, 0));
    if (i === 1) { g.add(at(rb(.74, .22, .04, door, .012), x, .8, .33)); g.add(at(rb(.74, .5, .04, door, .012), x, .45, .33)); }
    else { const dr = rb(.4, .72, .04, door, .012); dr.position.set(x - .24, .5, .33); g.add(dr); const d2 = rb(.4, .72, .04, door, .012); d2.position.set(x + .66 * (i === 0 ? .48 : .48), .5, .66 + (i === 0 ? .3 : 0)); d2.rotation.y = i === 0 ? 1.0 : -.2; g.add(d2); }
    g.add(at(sph(.03, knob, 1, 1, 1, 8), x - .1, .62, .36));
  }
  g.add(at(rb(2.84, .06, .68, top, .015), 0, .99, 0)); g.add(at(rb(.62, .02, .36, clay('#8b949c', { r: .3, m: .8 }), .03, 2), 0, 1.025, 0));
  g.add(tube([0, 1.02, -.2], [0, 1.4, -.2], .018, ch)); g.add(tube([0, 1.4, -.2], [0, 1.43, -.02], .018, ch));
  g.add(at(rb(2.84, .1, .04, clay('#8a7a64', { r: .9 }), .01, 1), 0, 1.07, -.32));
  return g;
}
export function uppers() {
  const g = new THREE.Group(), body = clay('#b99a72', { r: .8 }), door = clay('#c9ad84', { r: .75 });
  for (let i = 0; i < 3; i++) { const c = new THREE.Group(); c.add(at(rb(.8, .7, .36, body, .02), 0, .35, 0)); c.add(at(rb(.74, .64, .03, door, .01), 0, .35, .195)); c.add(at(sph(.025, clay('#6b747b', { r: .35, m: .6 }), 1, 1, 1, 8), .3, .15, .22)); c.position.set((i % 2) * .05, i * .72, 0); c.rotation.y = i * .08; g.add(c); }
  return g;
}
export function bathtub() {
  const g = new THREE.Group(), wh = clay('#f2f4f5', { r: .22, cc: .8, env: 1 }), inner = clay('#e6e9eb', { r: .2, cc: .8 });
  g.add(at(rb(1.85, .06, .86, wh, .03), 0, .06, 0));
  g.add(at(rb(1.85, .56, .1, wh, .06), 0, .31, .38)); g.add(at(rb(1.85, .56, .1, wh, .06), 0, .31, -.38));
  g.add(at(rb(.1, .56, .86, wh, .06), .875, .31, 0)); g.add(at(rb(.1, .56, .86, wh, .06), -.875, .31, 0));
  g.add(at(rb(1.62, .03, .66, inner, .02, 2), 0, .1, 0));
  g.add(at(cyl(.045, .045, .02, clay('#c9d1d6', { r: .2, m: .9 }), 14), -.6, .13, 0));
  g.add(at(rb(1.86, .07, .88, clay('#ffffff', { r: .25, cc: .8 }), .035), 0, .6, 0));
  const ch = clay('#c9d1d6', { r: .2, m: .9, env: 1.2 });
  g.add(tube([-.85, .6, -.2], [-.85, .95, -.2], .025, ch)); g.add(tube([-.85, .95, -.2], [-.65, 1.02, -.2], .025, ch)); g.add(at(cyl(.05, .05, .08, ch, 10), -.85, .66, -.2)); g.add(at(cyl(.05, .05, .08, ch, 10), -.85, .66, .1));
  [[-.8, -.34], [.8, -.34], [-.8, .34], [.8, .34]].forEach(([x, z]) => g.add(at(rb(.1, .06, .1, clay('#8b949c', { r: .4, m: .5 }), .02), x, .0, z)));
  return g;
}
export function toilet() {
  const g = new THREE.Group(), wh = clay('#f2f4f5', { r: .22, cc: .8, env: 1 });
  g.add(at(rb(.5, .16, .64, wh, .07), 0, .11, 0)); g.add(at(sph(.3, wh, 1, .55, 1.25, 24), 0, .38, .08));
  const seat = part(new THREE.TorusGeometry(.27, .04, 10, 30), clay('#ffffff', { r: .3, cc: .5 })); seat.rotation.x = Math.PI / 2; seat.scale.set(1, 1.2, 1); seat.position.set(0, .5, .1); g.add(seat);
  g.add(at(rb(.5, .46, .2, wh, .06), 0, .52, -.32)); g.add(at(rb(.52, .05, .22, wh, .03), 0, .78, -.32)); g.add(at(cyl(.02, .02, .08, clay('#c9d1d6', { r: .2, m: .9 }), 8), .2, .76, -.22, 0, 0, Math.PI / 2));
  const lid = rb(.46, .04, .5, wh, .02); lid.position.set(0, .95, -.5); lid.rotation.x = -1.35; g.add(lid);
  return g;
}
export function vanity() {
  const g = new THREE.Group(), body = clay('#8a6c4a', { r: .75 }), top = clay('#e9e7e1', { r: .3, cc: .6 }), wh = clay('#f2f4f5', { r: .22, cc: .8 }), ch = clay('#c9d1d6', { r: .2, m: .9, env: 1.2 });
  g.add(at(rb(1.1, .8, .52, body, .02), 0, .45, 0)); g.add(at(rb(.5, .66, .04, clay('#9a7b57', { r: .7 }), .01), -.26, .45, .27)); g.add(at(rb(.5, .66, .04, clay('#9a7b57', { r: .7 }), .01), .26, .45, .27));
  g.add(at(rb(1.14, .06, .56, top, .02), 0, .88, 0)); g.add(at(sph(.2, wh, 1.2, .4, 1, 18), 0, .9, 0)); g.add(tube([0, .92, -.2], [0, 1.15, -.2], .016, ch)); g.add(tube([0, 1.15, -.2], [0, 1.15, -.08], .016, ch));
  const mr = new THREE.Group(); mr.add(at(rb(.9, 1.1, .05, clay('#8b949c', { r: .4, m: .6 }), .02), 0, 0, 0)); mr.add(at(rb(.8, 1.0, .01, clay('#cfe0e8', { r: .05, m: .7, cc: 1, env: 1.6 }), .01, 1), 0, 0, .03)); mr.position.set(.1, 1.25, .75); mr.rotation.x = -.16; g.add(mr);
  return g;
}
export function tileBoxes() {
  const g = new THREE.Group(), R = rng(4);
  const tex = canvasTex(128, 64, (c, W, H) => { c.fillStyle = '#e9e6dc'; c.fillRect(0, 0, W, H); c.fillStyle = '#2f6f9f'; c.fillRect(0, 0, W, 18); c.fillStyle = '#1d2024'; c.font = 'bold 18px sans-serif'; c.fillText('PORCELAIN', 10, 40); c.font = '14px sans-serif'; c.fillText('12 x 24 - 8 PCS', 10, 58); });
  for (let k = 0; k < 6; k++) { const b = rb(.62, .22, .32, clay('#d8cfbc', { r: .9 }), .02, 1); b.position.set((k % 3) * .66 - .66, .11 + Math.floor(k / 3) * .23, 0); b.rotation.y = (R() - .5) * .1; g.add(b); const d = decal(.52, .2, tex); d.position.set(b.position.x, b.position.y, .163); g.add(d); }
  for (let i = 0; i < 9; i++) g.add(at(rb(.6, .014, .3, clay(i % 3 ? '#9aa4aa' : '#8b959b', { r: .35, cc: .5 }), .004, 1), .15, .007 + i * .016, .7 + (i % 2) * .02, i * .03));
  const th = rb(.34, .5, .2, clay('#e0d8c8', { r: .95 }), .08); th.position.set(-.75, .25, .78); th.rotation.y = .5; g.add(th);
  return g;
}
export function bucket5(col = '#ffffff', mud = '#d9d6cc') {
  const g = new THREE.Group(), m = clay(col, { r: .5, cc: .3 });
  g.add(at(cyl(.27, .22, .6, m, 28), 0, .3, 0)); g.add(at(cyl(.285, .285, .05, clay(col, { r: .5 }), 28), 0, .6, 0));
  const h = part(new THREE.TorusGeometry(.26, .012, 6, 30, Math.PI), clay('#8b949c', { r: .4, m: .6 })); h.position.y = .62; h.rotation.y = .3; g.add(h);
  g.add(at(cyl(.275, .275, .1, clay(ORANGE, { r: .5 }), 28), 0, .35, 0)); g.add(at(cyl(.268, .268, .02, clay(mud, { r: .95 }), 24), 0, .62, 0));
  for (let i = 0; i < 5; i++) g.add(at(sph(.04, clay(mud, { r: .95 }), 1, .5, 1, 6), Math.cos(i * 1.3) * .24, .5 - i * .08, Math.sin(i * 1.3) * .24));
  return g;
}
export function cementBags(n = 8) {
  const g = new THREE.Group();
  const tex = canvasTex(128, 192, (c, W, H) => { c.fillStyle = '#cdbb99'; c.fillRect(0, 0, W, H); c.fillStyle = '#c0463b'; c.fillRect(0, 30, W, 30); c.fillStyle = '#f6f1e6'; c.font = 'bold 20px sans-serif'; c.textAlign = 'center'; c.fillText('PORTLAND', W / 2, 52); c.fillStyle = '#1d2024'; c.font = 'bold 26px sans-serif'; c.fillText('CEMENT', W / 2, 100); c.font = '16px sans-serif'; c.fillText('94 LB', W / 2, 130); });
  g.add(at(rb(1.1, .14, 1.0, clay('#c4a075', { r: .9 }), .01, 1), 0, .07, 0));
  for (let i = 0; i < n; i++) { const r = Math.floor(i / 4), c = i % 4, x = (c % 2) * .5 - .25, z = Math.floor(c / 2) * .42 - .21; const b = rb(.5, .16, .4, clay('#cdbb99', { r: .95 }), .07, 3); b.position.set(x + (r % 2) * .03, .22 + r * .17, z); b.rotation.y = (r % 2) * .06; g.add(b); const d = decal(.34, .3, tex); d.rotation.x = -Math.PI / 2; d.position.set(b.position.x, .3 + r * .17, b.position.z); d.rotation.z = Math.PI / 2; g.add(d); }
  return g;
}
export function rebarBundle() {
  const g = new THREE.Group(), steel = clay('#6b5a4a', { r: .55, m: .5 }), tie = clay('#9aa0a5', { r: .4, m: .7 });
  for (let i = 0; i < 14; i++) { const a = i * 2.4, r = .02 + (i % 3) * .002, rad = .06 * Math.sqrt(i); const c = cyl(.018, .018, 2.7, steel, 8); c.rotation.z = Math.PI / 2; c.position.set(0, .1 + Math.sin(a) * rad, Math.cos(a) * rad); g.add(c); g.add(at(cyl(.019, .019, .12, clay(ORANGE, { r: .6 }), 8), 1.3, .1 + Math.sin(a) * rad, Math.cos(a) * rad, 0, 0, Math.PI / 2)); }
  [-.7, .6].forEach((x) => { const t = part(new THREE.TorusGeometry(.14, .008, 6, 18), tie); t.rotation.y = Math.PI / 2; t.position.set(x, .12, 0); g.add(t); });
  return g;
}
export function pvcBundle() {
  const g = new THREE.Group(), pv = clay('#f1f1ee', { r: .4, cc: .4 }), bl = clay('#2f6fb5', { r: .5 });
  for (let i = 0; i < 7; i++) { const a = i * 2.1, rad = i ? .085 : 0; const c = cyl(.05, .05, 2.5, pv, 14); c.rotation.z = Math.PI / 2; c.position.set(0, .16 + Math.sin(a) * rad, Math.cos(a) * rad); g.add(c); const st = cyl(.0505, .0505, 2.5, bl, 14, 1); st.scale.set(1, 1, 1); }
  [-1.0, .8].forEach((x) => { const t = part(new THREE.TorusGeometry(.17, .01, 6, 18), clay('#2b2f36', { r: .6 })); t.rotation.y = Math.PI / 2; t.position.set(x, .16, 0); g.add(t); });
  g.add(at(cyl(.058, .058, .14, pv, 14), 1.1, .16, 0, 0, 0, Math.PI / 2));
  return g;
}
export function insulationRolls(n = 3) {
  const g = new THREE.Group();
  for (let i = 0; i < n; i++) { const c = cyl(.32, .32, 1.2, clay(PINK, { r: 1, sheen: .8 }), 24); c.position.set((i % 2) * .62 - .31 + (i === 2 ? .3 : 0), .32 + (i === 2 ? .55 : 0), i === 2 ? 0 : 0); c.rotation.x = 0; g.add(c); g.add(at(cyl(.325, .325, .06, clay('#f6f1e6', { r: .7 }), 24), c.position.x, c.position.y, c.position.z)); g.add(at(cyl(.1, .1, 1.22, clay('#c9a56a', { r: .9 }), 14), c.position.x, c.position.y, c.position.z)); }
  return g;
}
export function sawhorses() {
  const g = new THREE.Group(), w = clay('#e0bf90', { r: .85 }), y = clay(YEL, { r: .5 }), dark = clay('#23272c', { r: .5 });
  [-.8, .8].forEach((x) => { g.add(at(rb(.12, .1, .7, w, .01, 1), x, .85, 0)); [-1, 1].forEach((s) => { g.add(tube([x, .85, s * .3], [x, 0, s * .45], .035, w, 6)); }); g.add(at(rb(.07, .07, .62, y, .01, 1), x, .4, 0)); });
  g.add(at(rb(2.2, .05, 1.1, clay('#d4ad74', { r: .85 }), .006, 1), 0, .91, 0));
  g.add(at(rb(.08, .018, .95, dark, .004, 1), -.3, .945, 0));
  const saw = new THREE.Group(); saw.add(at(rb(.26, .22, .34, clay('#2f6fb5', { r: .45, cc: .4 }), .05), 0, .15, 0)); saw.add(at(rb(.3, .02, .36, clay('#8b949c', { m: .6, r: .4 }), .008, 1), 0, .03, 0)); saw.add(at(cyl(.15, .15, .01, clay('#c9d1d6', { m: .8, r: .3 }), 28), 0, .14, .22, 0, Math.PI / 2)); saw.add(at(rb(.08, .12, .22, dark, .03), -.06, .3, -.05)); saw.position.set(.5, .94, .1); saw.rotation.y = -.6; g.add(saw);
  const R = rng(3); for (let i = 0; i < 10; i++) g.add(at(sph(.05, clay('#e8d3a8', { r: 1 }), 2, .25, 1.4, 6), -.3 + (R() - .5) * .6, .94, (R() - .5) * 1.0));
  g.add(at(rb(.5, .05, .12, clay('#e0bf90', { r: .85 }), .008, 1), .2, .06, .7, .3)); g.add(at(rb(.4, .05, .1, clay('#e0bf90', { r: .85 }), .008, 1), -.6, .03, .8, -.5)); // offcuts
  return g;
}
export function ladderA(h = 2.4) {
  const g = new THREE.Group(), o = clay(ORANGE, { r: .4, cc: .3 }), al = clay('#aab2b9', { r: .35, m: .7 });
  [-1, 1].forEach((s) => { [-1, 1].forEach((t) => g.add(tube([t * .28, .02, s * .1 + s * .55], [t * .28, h, s * .1], .03, o, 8))); for (let i = 1; i < 8; i++) { const y = i * h / 8.4; g.add(at(rb(.58, .035, .09, al, .01, 1), 0, y, s * (.1 + .55 * (1 - y / h)))); } });
  g.add(at(rb(.7, .05, .34, clay('#2b2f36', { r: .5 }), .02), 0, h + .0, 0)); g.add(at(rb(.5, .05, .2, o, .02), 0, h * .58, 0));
  return g;
}
export function workLight() {
  const g = new THREE.Group(), leg = clay('#2b2f36', { r: .5, m: .3 }), yl = clay(YEL, { r: .45, cc: .3 }), lamp = clay('#fff6d6', { e: 1.4, r: .2 });
  for (let i = 0; i < 3; i++) { const a = i * 2.094 + .5; g.add(tube([Math.cos(a) * .55, 0, Math.sin(a) * .55], [0, 1.9, 0], .025, leg, 8)); }
  g.add(at(cyl(.04, .04, .9, clay('#8b949c', { m: .6, r: .4 }), 8), 0, 2.3, 0));
  const head = new THREE.Group(); head.add(at(rb(.7, .34, .1, yl, .04), 0, 0, 0)); [-.17, .17].forEach((x) => head.add(at(rb(.28, .24, .02, lamp, .02, 1), x, 0, .06))); head.add(at(rb(.74, .04, .16, leg, .015), 0, .2, 0)); head.position.set(0, 2.85, 0); head.rotation.set(.3, .5, 0); g.add(head);
  g.add(at(cyl(.1, .1, .08, leg, 12), 0, 1.9, 0));
  return g;
}
export function cone() {
  const g = new THREE.Group(), o = clay('#ff6a1a', { r: .45, cc: .4 });
  g.add(at(rb(.42, .04, .42, clay('#2b2f36', { r: .6 }), .015), 0, .02, 0)); g.add(at(cyl(.045, .17, .64, o, 20), 0, .36, 0));
  g.add(at(cyl(.1, .12, .08, clay('#f6f6f2', { r: .4, e: .1 }), 20), 0, .42, 0)); g.add(at(cyl(.07, .08, .06, clay('#f6f6f2', { r: .4, e: .1 }), 20), 0, .56, 0));
  return g;
}
export function hardHat(col = YEL) {
  const g = new THREE.Group(), m = clay(col, { r: .35, cc: .6 });
  g.add(at(sph(.2, m, 1, .75, 1.1, 24), 0, .13, 0)); g.add(at(rb(.1, .04, .44, m, .015), 0, .27, 0)); g.add(at(rb(.46, .03, .5, m, .015), 0, .03, .05)); g.add(at(rb(.04, .08, .3, clay('#2b2f36', { r: .6 }), .01, 1), 0, .2, .0));
  return g;
}
export function toolbox() {
  const g = new THREE.Group(), red = clay('#c0392b', { r: .35, cc: .5 }), gr = clay('#8b949c', { r: .4, m: .6 });
  g.add(at(rb(.7, .3, .3, red, .04), 0, .17, 0)); g.add(at(rb(.7, .1, .3, clay('#a52e22', { r: .4, cc: .4 }), .04), 0, .38, 0)); g.add(at(rb(.74, .02, .02, gr, .006, 1), 0, .31, .16));
  const h = part(new THREE.TorusGeometry(.14, .016, 6, 16, Math.PI), gr); h.position.set(0, .43, 0); h.rotation.y = 0; g.add(h);
  [-.25, .25].forEach((x) => g.add(at(rb(.07, .06, .02, gr, .01, 1), x, .34, .16)));
  g.add(at(rb(.2, .08, .1, clay(YEL, { r: .5 }), .02), .12, .5, 0)); // a tape measure on top
  return g;
}
export function cordCoil() {
  const g = new THREE.Group(), o = clay('#f4a21a', { r: .5 });
  for (let i = 0; i < 8; i++) { const t = part(new THREE.TorusGeometry(.2 + (i % 2) * .02, .025, 8, 28), o); t.rotation.x = Math.PI / 2; t.position.y = .03 + i * .04; g.add(t); }
  g.add(tube([.2, .03, 0], [.7, .03, .4], .022, o, 6)); g.add(at(rb(.12, .06, .05, clay('#2b2f36', { r: .5 }), .015), .72, .04, .42, .6));
  return g;
}
export function scaffold() {
  const g = new THREE.Group(), steel = clay('#a9b1b8', { r: .35, m: .7 }), plank = clay('#d9b585', { r: .85 }), orange = clay(ORANGE, { r: .5 });
  const W = 1.8, D = .9, Hh = 1.9;
  [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([a, b]) => { g.add(tube([a * W / 2, 0, b * D / 2], [a * W / 2, Hh * 2, b * D / 2], .035, steel, 10)); g.add(at(cyl(.07, .07, .03, steel, 12), a * W / 2, .015, b * D / 2)); });
  [0, Hh, Hh * 2 - .08].forEach((y) => { [-1, 1].forEach((b) => g.add(tube([-W / 2, y + .05, b * D / 2], [W / 2, y + .05, b * D / 2], .028, steel, 8))); [-1, 1].forEach((a) => g.add(tube([a * W / 2, y + .05, -D / 2], [a * W / 2, y + .05, D / 2], .028, steel, 8))); });
  [-1, 1].forEach((b) => { g.add(tube([-W / 2, .1, b * D / 2], [W / 2, Hh, b * D / 2], .02, steel, 6)); g.add(tube([W / 2, Hh, b * D / 2], [-W / 2, Hh * 2 - .1, b * D / 2], .02, steel, 6)); });
  for (let i = 0; i < 4; i++) g.add(at(rb(W - .02, .04, .22, plank, .006, 1), 0, Hh + .08, -.33 + i * .22));
  g.add(at(rb(W - .1, .06, .06, orange, .01, 1), 0, Hh + .55, D / 2 - .01)); g.add(at(rb(W - .1, .06, .06, orange, .01, 1), 0, Hh + .95, D / 2 - .01));
  return g;
}
export function rubbleBarrow() {
  const g = new THREE.Group(), R = rng(5);
  const wb = (function () { const a = new THREE.Group(); const tray = clay('#2f6fb5', { r: .5, cc: .3 }), dark = clay('#23272c', { r: .5 }), steel = clay('#8b949c', { r: .4, m: .6 }); const t = rb(1.3, .5, .85, tray, .14, 4); const p = t.geometry.attributes.position; for (let i = 0; i < p.count; i++) { const k = (p.getY(i) / .5) + .5; p.setX(i, p.getX(i) * (.78 + .22 * k)); p.setZ(i, p.getZ(i) * (.7 + .3 * k)); } t.geometry.computeVertexNormals(); t.position.set(.1, .72, 0); t.rotation.z = .12; a.add(t); const w = part(new THREE.TorusGeometry(.26, .09, 14, 28), dark); w.position.set(.78, .27, 0); a.add(w); [-1, 1].forEach((s) => { a.add(tube([.62, .55, s * .26], [-1.0, .72, s * .3], .03, steel)); a.add(tube([-.4, .66, s * .3], [-.5, 0, s * .34], .03, steel)); a.add(at(rb(.3, .05, .07, dark, .02), -1.15, .74, s * .3)); }); return a; })();
  g.add(wb);
  const cols = ['#9aa0a6', '#b4b9be', '#8a9097', '#c2c6ca', '#a89f8f'];
  for (let i = 0; i < 11; i++) { const w = .2 + R() * .3, h = .14 + R() * .2, d = .18 + R() * .25; const m = rb(w, h, d, clay(cols[i % 5], { r: .95 }), .05, 2); m.position.set(-.1 + (R() - .5) * .75, .93 + R() * .18, (R() - .5) * .45); m.rotation.set(R(), R() * 3, R()); g.add(m); }
  return g;
}
export function shopVac() {
  const g = new THREE.Group(), yl = clay(YEL, { r: .45, cc: .3 }), bk = clay('#23272c', { r: .5 });
  g.add(at(cyl(.3, .27, .55, yl, 24), 0, .42, 0)); g.add(at(cyl(.3, .3, .1, bk, 24), 0, .72, 0)); g.add(at(cyl(.16, .16, .14, bk, 18), 0, .84, 0));
  [[-.2, .2], [.2, .2], [-.2, -.2], [.2, -.2]].forEach(([x, z]) => { g.add(at(cyl(.05, .05, .04, bk, 10), x, .05, z)); g.add(tube([0, .15, 0], [x, .05, z], .02, bk, 6)); });
  g.add(part(new THREE.TorusGeometry(.35, .04, 8, 36, 5), clay('#3a3f46', { r: .5 }))); g.children[g.children.length - 1].position.set(.1, .3, .38); g.children[g.children.length - 1].rotation.x = Math.PI / 2;
  return g;
}
export function mortarTub() {
  const g = new THREE.Group(), bk = clay('#23272c', { r: .6 });
  const t = rb(1.0, .28, .65, bk, .1, 3); t.position.y = .14; g.add(t); g.add(at(rb(.86, .04, .5, clay('#a8a79f', { r: .95 }), .05, 2), 0, .27, 0));
  g.add(tube([.1, .27, .1], [-.55, 1.1, .6], .02, clay('#b98a58', { r: .8 }), 6)); g.add(at(rb(.26, .2, .02, clay('#8b949c', { m: .6, r: .4 }), .01, 1), .12, .28, .1, .3));
  return g;
}
export function jackhammer() {
  const g = new THREE.Group(), yl = clay(YEL, { r: .4, cc: .4 }), gr = clay('#8b949c', { r: .35, m: .7 }), bk = clay('#23272c', { r: .5 });
  g.add(at(rb(.22, .5, .22, yl, .05), 0, 1.1, 0)); g.add(at(rb(.5, .06, .08, bk, .02), 0, 1.45, 0)); g.add(at(cyl(.06, .06, .5, gr, 12), 0, .6, 0)); g.add(at(cyl(.025, .025, .5, gr, 8), 0, .15, 0)); g.add(tube([.12, 1.0, 0], [.7, .1, .3], .03, bk, 6));
  return g;
}
export function cooler() {
  const g = new THREE.Group(), o = clay('#f08a1b', { r: .45, cc: .3 }), wh = clay('#f6f6f2', { r: .5 });
  g.add(at(rb(.5, .4, .42, o, .04), 0, .2, 0)); g.add(at(rb(.52, .08, .44, wh, .03), 0, .44, 0)); g.add(at(rb(.1, .04, .1, clay('#2b2f36'), .01, 1), 0, .5, 0)); g.add(at(cyl(.025, .025, .06, clay('#2b2f36'), 8), .27, .1, 0, 0, 0, Math.PI / 2));
  return g;
}
export function tarp() {
  const g = new THREE.Group(), b = clay('#2f6fb5', { r: .6, cc: .2 });
  g.add(at(rb(1.3, .12, .8, b, .05, 3), 0, .08, 0)); g.add(at(rb(1.1, .1, .7, clay('#3a7bd5', { r: .6 }), .05, 3), .1, .17, .02, .15)); g.add(at(rb(.9, .08, .6, b, .05, 3), -.1, .25, -.05, -.1));
  for (let i = 0; i < 6; i++) g.add(at(cyl(.018, .018, .01, clay('#c9d1d6', { m: .8, r: .3 }), 8), -.6 + i * .24, .1, .39));
  return g;
}
export function oldDoor() {
  const g = new THREE.Group(), w = clay('#e9e6df', { r: .6 }), edge = clay('#d8d4cb', { r: .6 });
  g.add(at(rb(.9, 2.05, .08, w, .01, 1), 0, 1.02, 0));
  [[.5, .8], [.5, -.6], [-0, 0]].forEach(([_, y], i) => { });
  [[-.2, .55, .72, .6], [.2, .55, .72, .6]].forEach(([x, y, w2, h2]) => { g.add(at(rb(.34, .75, .02, edge, .01, 1), x * 1.0 - .0, 1.45, .05)); g.add(at(rb(.34, .75, .02, edge, .01, 1), x * 1.0, .55, .05)); });
  g.add(at(sph(.04, clay('#c9a56a', { r: .3, m: .8 }), 1, 1, 1, 10), .34, 1.0, .08)); g.add(at(rb(.1, .02, .2, clay('#2b2f36', { m: .4, r: .4 }), .01, 1), .34, 1.3, .045));
  return g;
}
