// The Swift box truck. Forward is -x, the rear (and its roll-up door) faces +x, the camera sees the +z side.
// Plain (non-dissolving) materials: the truck drives, it never "builds".
import { THREE, rb, part, canvasTex, mergeColored as mergeItem } from './kit.js';

const M = (color, o = {}) => new THREE.MeshPhysicalMaterial({ color, roughness: o.r ?? .5, metalness: o.m ?? 0, clearcoat: o.cc ?? 0, clearcoatRoughness: o.ccr ?? .3, envMapIntensity: o.env ?? .7, emissive: o.e ? new THREE.Color(o.e) : 0x000000, emissiveIntensity: o.ei ?? 0, side: o.side ?? THREE.FrontSide, transparent: !!o.t, opacity: o.op ?? 1 });
const box = (w, h, d, mat, r = .05, seg = 3) => { const m = new THREE.Mesh(rb(w, h, d, mat, r, seg).geometry, mat); m.castShadow = m.receiveShadow = true; return m; };
const put = (o, x, y, z) => { o.position.set(x, y, z); return o; };

const SW_ORANGE = '#ff5a1f', INK = '#0a0e13';

/* the side livery: lock-up, tagline and a stripe with a speed-cut end */
function sideTexture(font) {
  return canvasTex(2048, 1050, (c, W, H) => {
    c.clearRect(0, 0, W, H);
    // stripe along the bottom with a diagonal leading edge
    const sy = H * .8;
    const g = c.createLinearGradient(0, 0, W, 0); g.addColorStop(0, '#ff4a0f'); g.addColorStop(1, '#ff6e32');
    c.fillStyle = g; c.beginPath(); c.moveTo(0, sy); c.lineTo(W * .93, sy); c.lineTo(W, sy + 40); c.lineTo(W, H); c.lineTo(0, H); c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,255,255,.22)'; c.fillRect(0, sy, W, 6);
    c.fillStyle = '#0a0e13'; c.beginPath(); c.moveTo(W * .6, sy - 22); c.lineTo(W * .93 + 12, sy - 22); c.lineTo(W + 4, sy + 18); c.lineTo(W * .66, sy + 18); c.closePath(); c.globalAlpha = .9; c.fill(); c.globalAlpha = 1;
    // the mark
    const mk = (x, y, s) => {
      const P = [['M0 0H28L62 54L28 108H0L34 54Z', '#ffc9ad'], ['M40 0H68L102 54L68 108H40L74 54Z', SW_ORANGE], ['M80 0H108L142 54L108 108H80L114 54Z', INK]];
      c.save(); c.translate(x, y); c.scale(s, s);
      P.forEach(([d, col]) => { c.fillStyle = col; c.fill(new Path2D(d)); });
      c.restore();
    };
    mk(120, 150, 3.5);
    c.fillStyle = INK; c.textBaseline = 'alphabetic';
    c.font = `800 250px ${font}`; c.fillText('SWIFT', 700, 360);
    c.fillStyle = SW_ORANGE; c.font = `700 74px ${font}`;
    const t = 'JUNK REMOVAL'; let x = 706; for (const ch of t) { c.fillText(ch, x, 470); x += c.measureText(ch).width + 22; }
    c.fillStyle = INK; c.font = `600 120px ${font}`; c.fillText('Junk, gone.', 120, 700);
    c.fillStyle = '#fff'; c.font = `700 84px ${font}`; c.fillText('(702) 929-6544', 120, H - 56);
    c.textAlign = 'right'; c.font = `600 64px ${font}`; c.fillText('Las Vegas + Henderson', W - 70, H - 62);
  });
}
function doorTexture(font) {
  return canvasTex(512, 640, (c, W, H) => {
    c.clearRect(0, 0, W, H);
    c.strokeStyle = 'rgba(10,14,19,.55)'; c.lineWidth = 6; c.lineJoin = 'round';
    c.beginPath(); c.moveTo(40, 40); c.lineTo(40, H - 40); c.stroke();
    c.beginPath(); c.moveTo(40, 40); c.lineTo(W - 20, 40); c.stroke();
    c.fillStyle = 'rgba(10,14,19,.8)'; c.beginPath(); c.roundRect(70, 250, 90, 22, 11); c.fill();
    const P = [['M0 0H28L62 54L28 108H0L34 54Z', '#ffc9ad'], ['M40 0H68L102 54L68 108H40L74 54Z', SW_ORANGE], ['M80 0H108L142 54L108 108H80L114 54Z', INK]];
    c.save(); c.translate(260, 420); c.scale(1.6, 1.6); P.forEach(([d, col]) => { c.fillStyle = col; c.fill(new Path2D(d)); }); c.restore();
  });
}
function plateTexture(font) {
  return canvasTex(256, 128, (c, W, H) => {
    c.fillStyle = '#f4f1e6'; c.fillRect(0, 0, W, H); c.strokeStyle = '#1a3a6e'; c.lineWidth = 6; c.strokeRect(4, 4, W - 8, H - 8);
    c.fillStyle = '#1a3a6e'; c.font = `700 24px ${font}`; c.textAlign = 'center'; c.fillText('NEVADA', W / 2, 34);
    c.fillStyle = '#10151c'; c.font = `800 62px ${font}`; c.fillText('SWFT 24', W / 2, 96);
  });
}

export function buildBoxTruck(font = '"Funnel Display", system-ui, sans-serif') {
  const root = new THREE.Group();            // moved along the road
  const body = new THREE.Group();            // everything that rides on the springs
  root.add(body);

  const white = M('#f6f7f8', { r: .3, cc: .7, ccr: .25 }), white2 = M('#eceff1', { r: .35, cc: .5 });
  const dark = M('#1f252c', { r: .55 }), dark2 = M('#2c343d', { r: .5, m: .2 }), steel = M('#b9c1c8', { r: .3, m: .7, env: 1 });
  const glass = M('#16202b', { r: .06, cc: 1, ccr: .05, env: 1.5 }), orange = M(SW_ORANGE, { r: .4, cc: .5 });
  const tireM = M('#15181c', { r: .85 }), interior = M('#cfd4d8', { r: .8 }), floorM = M('#a98558', { r: .75 });

  /* ---- chassis ---- */
  [-.62, .62].forEach((z) => body.add(put(box(6.1, .22, .16, dark, .03, 1), -1.2, .72, z)));
  body.add(put(box(5.9, .1, 1.7, dark2, .03, 1), -1.2, .6, 0));
  const tank = new THREE.Mesh(new THREE.CylinderGeometry(.27, .27, 1.3, 24), M('#aeb6bd', { r: .35, m: .8, env: 1 })); tank.rotation.x = Math.PI / 2; tank.rotation.z = Math.PI / 2; tank.position.set(-1.3, .74, .92); tank.castShadow = true; body.add(tank);
  body.add(put(box(.7, .08, .26, steel, .02, 1), -2.5, .56, 1.16)); body.add(put(box(.7, .08, .26, steel, .02, 1), -2.5, .44, 1.16));

  /* ---- cab (a profile, extruded) ---- */
  const sh = new THREE.Shape();
  sh.moveTo(-4.35, .72); sh.lineTo(-4.35, 1.85); sh.quadraticCurveTo(-4.35, 2.0, -4.22, 2.12); sh.lineTo(-3.55, 2.82);
  sh.quadraticCurveTo(-3.5, 2.88, -3.38, 2.88); sh.lineTo(-2.62, 2.88); sh.quadraticCurveTo(-2.5, 2.88, -2.5, 2.76); sh.lineTo(-2.5, .72); sh.closePath();
  const cabGeo = new THREE.ExtrudeGeometry(sh, { depth: 2.06, bevelEnabled: true, bevelSize: .1, bevelThickness: .1, bevelSegments: 5, curveSegments: 18 });
  cabGeo.translate(0, 0, -1.03);
  const cab = new THREE.Mesh(cabGeo, white); cab.castShadow = cab.receiveShadow = true; body.add(cab);
  // lower cab skirt in dark plastic
  [1, -1].forEach((s) => body.add(put(box(1.86, .3, .05, dark2, .02, 1), -3.42, .86, s * 1.16)));
  // windshield + side windows
  const ws = box(.98, .04, 1.86, glass, .015, 1); ws.position.set(-3.985, 2.5, 0); ws.rotation.z = Math.atan2(.7, .67); body.add(ws);
  const winShape = new THREE.Shape(); winShape.moveTo(-4.04, 1.96); winShape.lineTo(-2.66, 1.96); winShape.lineTo(-2.66, 2.7); winShape.lineTo(-3.52, 2.7); winShape.closePath();
  [1, -1].forEach((s) => { const g = new THREE.Mesh(new THREE.ExtrudeGeometry(winShape, { depth: .03, bevelEnabled: false }), glass); g.position.z = s > 0 ? 1.16 : -1.19; body.add(g); });
  // door decal on the camera side
  const doorD = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.9), new THREE.MeshStandardMaterial({ map: doorTexture(font), transparent: true, roughness: .5, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
  doorD.position.set(-3.18, 1.55, 1.2); body.add(doorD);
  // front: grille, plate, lamps, bumper
  const front = (s) => s * 1;
  body.add(put(box(.08, .5, 1.5, dark, .03, 2), -4.47, 1.12, 0));
  for (let i = 0; i < 5; i++) body.add(put(box(.05, .04, 1.34, M('#3a434d', { r: .4, m: .4 }), .01, 1), -4.53, .95 + i * .09, 0));
  body.add(put(box(.07, .3, .5, orange, .05, 2), -4.52, 1.52, 0));
  const mk = new THREE.Mesh(new THREE.PlaneGeometry(.36, .27), new THREE.MeshBasicMaterial({ map: canvasTex(144, 108, (c, W, H) => { const P = [['M0 0H28L62 54L28 108H0L34 54Z', '#ffd9c4'], ['M40 0H68L102 54L68 108H40L74 54Z', '#fff'], ['M80 0H108L142 54L108 108H80L114 54Z', INK]]; c.scale(W / 142, H / 108); P.forEach(([d, col]) => { c.fillStyle = col; c.fill(new Path2D(d)); }); }), transparent: true, toneMapped: false }));
  mk.rotation.y = -Math.PI / 2; mk.position.set(-4.565, 1.52, 0); body.add(mk);
  const headM = M('#fff4d6', { r: .15, cc: 1, e: '#ffe9b0', ei: .5 });
  const heads = [1, -1].map((s) => { const m = box(.1, .3, .46, headM, .08, 2); m.position.set(-4.46, 1.32, s * .98); body.add(m); return m; });
  [1, -1].forEach((s) => { body.add(put(box(.1, .1, .22, M('#ffc27a', { r: .3, e: '#ff9a3a', ei: .25 }), .04, 2), -4.48, .98, s * 1.02)); });
  body.add(put(box(.34, .3, 2.34, dark, .08, 3), -4.45, .78, 0));
  body.add(put(box(.1, .14, 1.4, steel, .03, 1), -4.62, .76, 0));
  // mirrors
  [1, -1].forEach((s) => {
    const arm = box(.1, .5, .08, dark, .02, 1); arm.position.set(-4.0, 2.05, s * 1.34); arm.rotation.z = .15; body.add(arm);
    body.add(put(box(.16, .62, .12, dark2, .04, 2), -4.05, 2.12, s * 1.42));
    const arm2 = box(.5, .06, .06, dark, .01, 1); arm2.position.set(-3.84, 1.9, s * 1.24); body.add(arm2);
    body.add(put(box(.14, .4, .12, dark2, .04, 2), -3.78, 1.78, s * 1.45));
  });
  // roof: air deflector + amber beacon
  const defl = box(.9, .5, 2.0, white2, .12, 3); defl.position.set(-2.95, 3.12, 0); defl.rotation.z = .2; body.add(defl);
  body.add(put(box(.7, .06, 1.9, orange, .02, 1), -2.9, 3.0, 0));
  const beaconM = M('#ff9d1a', { r: .2, cc: 1, e: '#ff8a00', ei: .2 });
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(.17, 24, 14, 0, Math.PI * 2, 0, Math.PI / 2), beaconM); beacon.position.set(-3.5, 2.92, .45); body.add(beacon);
  body.add(put(box(.34, .06, .34, dark, .02, 1), -3.5, 2.9, .45));
  [-.5, 0, .5].forEach((z) => body.add(put(box(.07, .08, .2, M('#ff9d1a', { r: .3, e: '#ff7a00', ei: .5 }), .02, 1), -4.23, 2.14, z)));

  /* ---- the box (a real shell: you can see into the back) ---- */
  const X0 = -2.4, X1 = 1.9, Y0 = .96, Y1 = 3.4, ZW = 1.2, T = .09;
  const Lx = X1 - X0, Cx = (X0 + X1) / 2;
  const side = box(Lx, Y1 - Y0, T, white, .05, 3);   // camera side
  side.position.set(Cx, (Y0 + Y1) / 2, ZW - T / 2); body.add(side);
  body.add(put(box(Lx, Y1 - Y0, T, white2, .05, 3), Cx, (Y0 + Y1) / 2, -ZW + T / 2));
  body.add(put(box(Lx, .14, ZW * 2, white, .06, 3), Cx, Y1 - .07, 0));                               // roof
  body.add(put(box(Lx, .16, ZW * 2 - .1, floorM, .03, 2), Cx, Y0 + .02, 0));                          // floor
  body.add(put(box(T, Y1 - Y0, ZW * 2 - .1, interior, .02, 1), X0 + T / 2, (Y0 + Y1) / 2, 0));         // front wall (dark inside)
  body.add(put(box(.02, Y1 - Y0 - .3, ZW * 2 - .5, M('#97a0a8', { r: .8 }), .01, 1), X0 + T + .02, (Y0 + Y1) / 2 - .05, 0));
  // inside faces of the side walls (so the cavity reads as a room)
  body.add(put(box(Lx - .2, Y1 - Y0 - .3, .02, interior, .01, 1), Cx - .1, (Y0 + Y1) / 2 - .05, ZW - T - .01));
  body.add(put(box(Lx - .2, Y1 - Y0 - .3, .02, interior, .01, 1), Cx - .1, (Y0 + Y1) / 2 - .05, -ZW + T + .01));
  // ceiling lamp
  body.add(put(box(1.4, .05, .18, M('#fff6e0', { r: .3, e: '#fff0c8', ei: 1.2 }), .02, 1), 1.2, Y1 - .17, 0));
  // wooden floor ribs
  for (let i = 0; i < 9; i++) body.add(put(box(.025, .01, ZW * 2 - .3, M('#7d5e3a', { r: .8 }), .004, 1), X1 - .3 - i * .46, Y0 + .105, 0));
  // panel seams + the orange tie-down rail on the camera side
  [-1.15, -.05, 1.05].forEach((x) => body.add(put(box(.025, Y1 - Y0 - .2, .018, M('#cfd5da', { r: .5 }), .005, 1), x, (Y0 + Y1) / 2, ZW + .005)));
  // the livery
  const livery = new THREE.Mesh(new THREE.PlaneGeometry(Lx - .22, (Lx - .22) * 1050 / 2048), new THREE.MeshStandardMaterial({ map: sideTexture(font), transparent: true, roughness: .4, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
  livery.position.set(Cx - .05, Y0 + (Lx - .22) * 1050 / 2048 / 2 + .02, ZW + .012);
  body.add(livery);
  const livery2 = livery.clone(); livery2.material = livery.material; livery2.rotation.y = Math.PI; livery2.position.z = -ZW - .012; livery2.position.x = Cx + .05; body.add(livery2);

  /* ---- rear: frame, drum housing, the roll-up door, bumper, lamps, plate ---- */
  [1, -1].forEach((s) => body.add(put(box(.16, Y1 - Y0 + .06, .22, white, .05, 2), X1 + .02, (Y0 + Y1) / 2, s * (ZW - .12))));
  body.add(put(box(.34, .34, ZW * 2, white, .08, 3), X1 + .05, Y1 - .14, 0));                          // header with the roll-up drum
  body.add(put(box(.22, .1, ZW * 2 - .4, dark, .03, 1), X1 + .19, Y1 - .3, 0));
  const lampOff = M('#7a1810', { r: .3, cc: .8, e: '#ff1a0a', ei: 0 });
  const lamps = [1, -1].map((s) => { const m = box(.1, .62, .12, lampOff, .04, 2); m.position.set(X1 + .12, Y0 + .42, s * (ZW - .06)); body.add(m); return m; });
  // door slats
  const slatM = M('#e7eaed', { r: .35, cc: .5 }), slats = [];
  const NS = 14, doorTop = Y1 - .34, doorBot = Y0 + .12, sh2 = (doorTop - doorBot) / NS;
  for (let i = 0; i < NS; i++) {
    const s = box(.07, sh2 - .008, ZW * 2 - .44, slatM, .02, 1); s.position.set(X1 + .02, doorTop - sh2 * (i + .5), 0); s.userData.y = s.position.y; s.userData.i = i;
    s.castShadow = false; body.add(s); slats.push(s);
  }
  const handle = box(.12, .1, .7, orange, .04, 2); handle.position.set(X1 + .09, doorBot + .06, 0); body.add(handle);
  // rear bumper, step, plate, mud flaps
  body.add(put(box(.32, .24, ZW * 2 + .1, dark, .06, 3), X1 + .2, .78, 0));
  for (let i = 0; i < 9; i++) body.add(put(box(.02, .22, .18, i % 2 ? M('#e8341c', { r: .4 }) : M('#f4f4f4', { r: .4 }), .005, 1), X1 + .365, .78, -.96 + i * .24));
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(.62, .31), new THREE.MeshStandardMaterial({ map: plateTexture(font), roughness: .5 }));
  plate.rotation.y = Math.PI / 2; plate.position.set(X1 + .375, .98 + .0, 0); plate.position.y = 1.15; body.add(plate);
  [1, -1].forEach((s) => body.add(put(box(.05, .5, .46, dark, .02, 1), X1 + .08, .52, s * .98)));
  // work light on the rear + a grab handle
  body.add(put(box(.08, .08, .34, M('#fff6e0', { r: .3, e: '#fff0c8', ei: .3 }), .02, 1), X1 + .13, Y1 + .02, 0));

  /* ---- wheels (they stay on the ground; the body rides above them) ---- */
  const wheels = [];
  const tireProfile = []; { const R = .55, w = .2; for (let i = 0; i <= 10; i++) { const a = -Math.PI / 2 + i / 10 * Math.PI; tireProfile.push(new THREE.Vector2(R - .16 + Math.cos(a) * .16, Math.sin(a) * w)); } tireProfile.unshift(new THREE.Vector2(.3, -w)); tireProfile.push(new THREE.Vector2(.3, w)); }
  const tireGeo = new THREE.LatheGeometry(tireProfile, 36); tireGeo.rotateX(Math.PI / 2);
  const wheelAt = (x, z, dual = false) => {
    const g = new THREE.Group(); g.position.set(x, .55, z);
    const t = new THREE.Mesh(tireGeo, tireM); t.castShadow = true; g.add(t);
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(.33, .33, .3, 28), steel); rim.rotation.x = Math.PI / 2; g.add(rim);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(.14, .14, .34, 20), M('#8d969e', { r: .35, m: .8, env: 1 })); hub.rotation.x = Math.PI / 2; g.add(hub);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(.08, .08, .36, 16), orange); cap.rotation.x = Math.PI / 2; g.add(cap);
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; const lug = new THREE.Mesh(new THREE.CylinderGeometry(.025, .025, .33, 8), dark); lug.rotation.x = Math.PI / 2; lug.position.set(Math.cos(a) * .22, Math.sin(a) * .22, 0); g.add(lug); }
    for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; const sp = box(.1, .24, .04, M('#d8dee3', { r: .3, m: .6 }), .01, 1); sp.position.set(Math.cos(a) * .2, Math.sin(a) * .2, .17 * (dual ? 1 : 1)); sp.rotation.z = a - Math.PI / 2; g.add(sp); }
    mergeItem(g);
    return g;
  };
  [1, -1].forEach((s) => {
    const f = wheelAt(-3.55, s * 1.0); root.add(f); wheels.push(f);
    const r1 = wheelAt(.7, s * 1.02), r2 = wheelAt(.7, s * .62); root.add(r1, r2); wheels.push(r1, r2);
    // wheel arches (dark pockets) on the body
    [-3.55, .7].forEach((x) => { const a = new THREE.Mesh(new THREE.CylinderGeometry(.66, .66, .06, 30, 1, false, 0, Math.PI), dark); a.rotation.z = Math.PI / 2; a.rotation.y = Math.PI / 2; a.position.set(x, .55, s * (x < 0 ? 1.1 : 1.16)); a.rotation.set(Math.PI / 2, 0, 0); body.add(a); });
  });

  // everything static on the body becomes a handful of meshes; the parts that animate keep their own
  [...lamps, ...heads, beacon, handle, ...slats].forEach((m) => { m.userData.nomerge = true; });
  body.traverse((o) => { if (o.isMesh && o.material && o.material.transparent) o.userData.nomerge = true; });
  mergeItem(body);
  return {
    root, body, wheels, slats, lamps, heads, beacon, beaconM, handle,
    rearX: X1 + .4, cavity: { x0: X0 + .2, x1: X1 - .15, y0: Y0 + .12, y1: Y1 - .38, z: ZW - .2 },
    brake(on) { lampOff.emissiveIntensity = on ? 1.6 : 0; lampOff.color.set(on ? '#ff3b2a' : '#7a1810'); },
    // door: 0 = fully rolled up (open), 1 = closed
    door(k) {
      const n = Math.round(k * NS * 100) / 100;
      slats.forEach((s, i) => { const show = i < n; s.visible = show || (i < Math.ceil(n) && n % 1 > 0); s.position.y = s.userData.y; });
      handle.position.y = doorTop - sh2 * Math.min(NS, Math.max(n, .001)) + .02; handle.visible = n > .2;
    },
  };
}
