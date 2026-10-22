// The quote gauge: an open-bed clay truck that fills up as the slider moves.
import { THREE, clay, rb, part, blob } from './kit.js';
import * as P from './props.js';
import * as Q from './props2.js';

function plain(color, o = {}) { return new THREE.MeshPhysicalMaterial({ color, roughness: o.r ?? .5, metalness: o.m ?? 0, clearcoat: o.cc ?? 0, clearcoatRoughness: .35, envMapIntensity: o.env ?? .7 }); }
const box = (w, h, d, m, r = .05, seg = 3) => { const x = new THREE.Mesh(rb(w, h, d, m, r, seg).geometry, m); x.castShadow = x.receiveShadow = true; return x; };
const put = (o, x, y, z, ry = 0) => { o.position.set(x, y, z); o.rotation.y = ry; return o; };

export function buildTruck() {
  const shell = new THREE.Group();
  const white = plain('#f4f5f6', { r: .35, cc: .6 }), glass = plain('#1b2530', { r: .08, cc: 1, env: 1.3 }), dark = plain('#20262d', { r: .55 }), tire = plain('#16191d', { r: .8 });
  const rim = plain('#c6ccd2', { r: .3, m: .6, env: 1 }), hot = plain('#ff5a1f', { r: .45 }), grey = plain('#d5dadf', { r: .6 }), bolt = plain('#8b949c', { r: .3, m: .7 });
  const add = (m) => { shell.add(m); return m; };

  // pad the truck stands on
  const padTop = new THREE.MeshStandardMaterial({ color: '#d9dde1', roughness: .9, envMapIntensity: .4 }), padSide = new THREE.MeshStandardMaterial({ color: '#f3f5f6', roughness: .9, envMapIntensity: .4 });
  const pad = new THREE.Mesh(rb(9.4, .4, 4.8, padSide, .14, 4).geometry, [padSide, padSide, padTop, padSide, padSide, padSide]);
  pad.position.set(-.5, -.2, .35); pad.receiveShadow = true; pad.castShadow = true; shell.add(pad);

  // chassis + open bed
  add(put(box(7.5, .4, 1.7, dark, .05, 1), -1.7, .72, 0));
  add(put(box(3.8, .14, 2.16, grey, .05), .05, .93, 0));
  [-1, 1].forEach((s) => {
    add(put(box(3.8, .95, .1, white, .05), .05, 1.475, s * 1.03));
    add(put(box(3.84, .07, .16, hot, .03), .05, 1.96, s * 1.03));
  });
  add(put(box(.12, 1.6, 2.16, white, .05), -1.82, 1.75, 0));          // headboard behind the cab
  add(put(box(.1, .42, 2.16, white, .04), 1.97, 1.2, 0));            // low tailgate
  // cab: a side profile, extruded. x runs from the bumper (0) to the back of the cab (3.55)
  const sh = new THREE.Shape();
  sh.moveTo(0, 0); sh.lineTo(3.55, 0); sh.lineTo(3.55, 1.5); sh.quadraticCurveTo(3.55, 1.7, 3.35, 1.7); sh.lineTo(2.62, 1.7); sh.quadraticCurveTo(2.5, 1.7, 2.42, 1.6);
  sh.lineTo(1.9, .96); sh.quadraticCurveTo(1.8, .86, 1.62, .86); sh.lineTo(.3, .84); sh.quadraticCurveTo(0, .8, 0, .55); sh.lineTo(0, 0);
  const cabGeo = new THREE.ExtrudeGeometry(sh, { depth: 1.56, bevelEnabled: true, bevelSize: .1, bevelThickness: .1, bevelSegments: 5, curveSegments: 20 });
  cabGeo.translate(0, 0, -.78);
  const cab = new THREE.Mesh(cabGeo, white); cab.castShadow = cab.receiveShadow = true; cab.position.set(-5.5, .74, 0); shell.add(cab);
  // glass: side windows + windshield
  const win = new THREE.Shape(); win.moveTo(2.0, 1.0); win.lineTo(3.38, 1.0); win.lineTo(3.38, 1.58); win.lineTo(2.55, 1.58); win.closePath();
  [-1, 1].forEach((s) => {
    const g = new THREE.Mesh(new THREE.ExtrudeGeometry(win, { depth: .04, bevelEnabled: false }), glass);
    g.position.set(-5.5, .74, s > 0 ? .86 : -.9); shell.add(g);
  });
  const ws = new THREE.Mesh(new THREE.PlaneGeometry(1.5, .98), glass);
  ws.position.set(-5.5 + 2.03, .74 + 1.3, 0); ws.lookAt(ws.position.clone().add(new THREE.Vector3(-.78, .62, 0))); shell.add(ws);
  // lights, bumper, grille
  add(put(box(.24, .3, 1.9, dark, .06), -5.58, .98, 0));
  const lamp = plain('#fff1c4', { r: .2 }), red = plain('#e8341c', { r: .3 });
  [-1, 1].forEach((s) => { add(put(box(.08, .18, .38, lamp, .03), -5.58, 1.46, s * .55)); add(put(box(.1, .26, .12, red, .03), 2.04, 1.0, s * .98)); });
  add(put(box(.06, .22, 1.0, dark, .02, 1), -5.6, 1.22, 0));
  // the Swift mark on both sides of the bed
  const mk = [['M0 0H28L62 54L28 108H0L34 54Z', '#ffd2bd'], ['M40 0H68L102 54L68 108H40L74 54Z', '#ff5a1f'], ['M80 0H108L142 54L108 108H80L114 54Z', '#14181d']];
  [-1, 1].forEach((s) => {
    const g = new THREE.Group();
    mk.forEach(([d, col]) => {
      const sh2 = new THREE.Shape(); const n = d.match(/[MHLZ][^MHLZ]*/g); let x = 0, y = 0;
      n.forEach((c) => { const t = c[0], a = c.slice(1).trim().split(/\s+/).map(Number); const X = (v) => (s > 0 ? 142 - v : v); if (t === 'M') { x = a[0]; y = a[1]; sh2.moveTo(X(x), -y); } else if (t === 'H') { x = a[0]; sh2.lineTo(X(x), -y); } else if (t === 'L') { x = a[0]; y = a[1]; sh2.lineTo(X(x), -y); } });
      const m = new THREE.Mesh(new THREE.ExtrudeGeometry(sh2, { depth: 6, bevelEnabled: false }), plain(col, { r: .45 }));
      g.add(m);
    });
    g.scale.set(.0085, .0085, .0085); g.position.set(-.38 + (s > 0 ? -.6 : .6), 1.475 + .46 - .5, s * 1.085); if (s < 0) g.rotation.y = Math.PI;
    shell.add(g);
  });
  // wheels
  [[-4.4], [.95]].forEach(([x]) => [-1, 1].forEach((s) => {
    const t = part(new THREE.CylinderGeometry(.46, .46, .4, 40), tire); t.rotation.x = Math.PI / 2; t.position.set(x, .46, s * .88); shell.add(t);
    const r = part(new THREE.CylinderGeometry(.26, .26, .42, 32), rim); r.rotation.x = Math.PI / 2; r.position.set(x, .46, s * .88); shell.add(r);
    const c = part(new THREE.CylinderGeometry(.08, .08, .46, 14), bolt); c.rotation.x = Math.PI / 2; c.position.set(x, .46, s * .88); shell.add(c);
  }));
  shell.traverse((o) => { if (o.isMesh) o.customDepthMaterial = undefined; });
  return shell;
}

/* the cargo, in the order it goes in. `s` is the slider stop (0-5) from which a piece is on board */
export function buildCargo() {
  const items = [];
  const Y = 1.0;                                           // bed floor
  const piece = (obj, x, y, z, ry, s, fp) => {
    const w = new THREE.Group(); w.add(obj); w.position.set(x, y, z); w.rotation.y = ry;
    const root = new THREE.Group(); root.add(w); root.userData.stop = s;
    items.push(root); return root;
  };
  const grp = (...k) => { const g = new THREE.Group(); k.forEach((o) => g.add(o)); return g; };
  const lay = (o) => { o.updateMatrixWorld(true); const b = new THREE.Box3().setFromObject(o); o.position.y -= b.min.y; return o; };

  /* stop 0: a few items */
  piece(P.armchair(), -1.2, Y, .45, .35, 0);
  piece(P.cardboard(1.0, .75, .8), -.2, Y, -.5, .12, 0);
  piece(P.cardboard(.8, .6, .7), -.15, Y, .55, -.2, 0);
  /* stop 1: a quarter */
  piece(grp(P.tote(1.1, .6, .78), (() => { const t = P.tote(1.0, .52, .7, true, '#9bbf9a'); t.position.y = .7; return t; })()), -1.2, Y, -.55, .05, 1);
  piece(P.bag(.42, 1), .95, Y, -.42, 0, 1);
  piece(P.bag(.4, 2), .95, Y, .42, 0, 1);
  piece(P.cardboard(.8, .62, .7, { label: false }), 1.45, Y, .0, .5, 1);
  /* stop 2: half */
  piece(P.cardboard(.9, .7, .8), -1.2, Y + 1.32, -.5, .2, 2);
  piece((() => { const g = new THREE.Group(); const m = P.mattress(1.55, .4, 2.5); m.rotation.x = -Math.PI / 2 + .0; m.rotation.x = 0; g.add(m); g.rotation.y = Math.PI / 2; return g; })(), -.2, Y + .78, .0, 0, 2);
  piece(P.bag(.4, 3), 1.4, Y, .4, 0, 2);
  piece(P.cardboard(.7, .55, .6), .45, Y + .75, -.55, .3, 2);
  /* stop 3: three-quarters */
  piece((() => { const s = P.sofa(2.3); return s; })(), -.1, Y + 1.2, .0, Math.PI / 2 + .02, 3);
  piece(P.bag(.42, 5), 1.3, Y + .5, -.2, 0, 3);
  piece(P.cardboard(.8, .6, .7), -1.3, Y + 1.18 + .72, .5, -.3, 3);
  piece(P.tv(1.6, .95), 1.0, Y + .0, .0, .2, 3);
  /* stop 4: full */
  piece(Q.dresser(), -.3, Y + 2.0, .0, Math.PI / 2, 4);
  piece(P.bag(.4, 6), .95, Y + 1.35, .4, 0, 4);
  piece(P.cardboard(.9, .7, .8), 1.0, Y + 1.5, -.55, .4, 4);
    /* stop 5: more than one load. The rest waits on the pad */
  piece(P.fridge(), 3.2, 0, 1.8, -.2, 5);
  piece((() => { const g = grp(P.cardboard(1.1, .9, .9), (() => { const b = P.cardboard(.9, .75, .8); b.position.y = .9; b.rotation.y = .25; return b; })()); return g; })(), 3.3, 0, .3, .3, 5);
  piece(P.mattress(1.6, .42, 2.6), 4.1, 0, -1.0, .0, 5);
  piece(P.bag(.5, 7), 3.0, 0, 2.7, 0, 5);
  return items;
}
