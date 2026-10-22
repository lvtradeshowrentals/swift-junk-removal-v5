// The room: a cut-away diorama (floor slab + two walls + window) and the layout of the junk in it.
import { THREE, clay, rb, cyl, at, group, part, blob, rng } from './kit.js';
import * as P from './props.js';

export const ROOM = { half: 4, wallH: 3.7, slab: .5, wallT: .36 };

function plankTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 1024;
  const g = c.getContext('2d'), r = rng(11);
  g.fillStyle = '#c9b89a'; g.fillRect(0, 0, 1024, 1024);
  const n = 12, h = 1024 / n;
  for (let i = 0; i < n; i++) {
    let x = -r() * 300;
    while (x < 1024) {
      const w = 340 + r() * 380, tone = (r() - .5) * 16;
      g.fillStyle = `rgb(${201 + tone | 0},${183 + tone | 0},${152 + tone | 0})`;
      g.fillRect(x, i * h, w, h);
      g.fillStyle = 'rgba(70,52,30,.16)'; g.fillRect(x, i * h, 2, h);
      for (let k = 0; k < 5; k++) { g.fillStyle = `rgba(120,95,60,${.03 + r() * .03})`; g.fillRect(x, i * h + r() * h, w, 1 + r() * 2); }
      x += w;
    }
    g.fillStyle = 'rgba(70,52,30,.2)'; g.fillRect(0, i * h, 1024, 2);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}
function glassTexture() {
  const c = document.createElement('canvas'); c.width = 4; c.height = 256;
  const g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 256);
  gr.addColorStop(0, '#fbfdff'); gr.addColorStop(1, '#d6e6f6');
  g.fillStyle = gr; g.fillRect(0, 0, 4, 256);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

/* a wall piece that grows from its base (origin at the bottom centre) */
function wallPiece(x0, x1, y0, y1, z0, z1, mat) {
  const w = x1 - x0, h = y1 - y0, d = z1 - z0;
  const m = rb(w, h, d, mat, .012, 1);
  m.castShadow = true; m.receiveShadow = true; m.customDepthMaterial = undefined;
  m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
  return m;
}

/* a parallelogram of sunlight on the floor, with the window's mullions in it */
function sunPatch(wallX, z0, z1) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256;
  const g = c.getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, 256, 256);
  g.filter = 'blur(5px)'; g.fillStyle = '#fff';
  g.fillRect(16, 16, 108, 108); g.fillRect(132, 16, 108, 108); g.fillRect(16, 132, 108, 108); g.fillRect(132, 132, 108, 108);
  const t = new THREE.CanvasTexture(c);
  const run = 4.6, sh = 1.5;
  const v = new Float32Array([wallX, 0, z0, wallX, 0, z1, wallX + run, 0, z1 + sh, wallX + run, 0, z0 + sh]);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(v, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([0, 1, 1, 1, 1, 0, 0, 0]), 2));
  geo.setIndex([0, 1, 2, 0, 2, 3]);
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: '#fff0cf', map: t, transparent: true, opacity: .2, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
  m.position.y = .014; m.renderOrder = 2;
  return m;
}

export function buildRoom() {
  const H = ROOM.half, T = ROOM.wallT, WH = ROOM.wallH;
  const shell = new THREE.Group();     // slab + walls (animates in)
  const items = [];                    // junk wrappers (animate in, dissolve out)

  const plaster = new THREE.MeshStandardMaterial({ color: '#f1f3f5', roughness: .95, envMapIntensity: .4 });
  const plasterB = new THREE.MeshStandardMaterial({ color: '#f4f5f6', roughness: .95, envMapIntensity: .4 });
  const floorTop = new THREE.MeshStandardMaterial({ color: '#ffffff', map: plankTexture(), roughness: .72, envMapIntensity: .5 });
  floorTop.map.repeat.set(1.4, 1.4);
  const slabSide = new THREE.MeshStandardMaterial({ color: '#f1f3f5', roughness: .9, envMapIntensity: .4 });

  // slab: top face gets the planks, the cut sides are plain
  const slabGeo = rb(H * 2 + T, ROOM.slab, H * 2 + T, slabSide, .07, 4).geometry;
  const slab = new THREE.Mesh(slabGeo, [slabSide, slabSide, floorTop, slabSide, slabSide, slabSide]);
  slab.position.y = -ROOM.slab / 2; slab.receiveShadow = true; slab.castShadow = true;
  shell.add(slab);

  // left wall (x = -H), with a window
  const wa = new THREE.Group();
  const x0 = -H - T, x1 = -H, zA = -H - T, zB = H + T / 2;
  const wy0 = 1.45, wy1 = 3.05, wz0 = -.7, wz1 = 1.9;
  [[0, wy0, zA, zB], [wy1, WH, zA, zB]].forEach(([a, b, c, d]) => wa.add(wallPiece(x0, x1, a, b, c, d, plaster)));
  wa.add(wallPiece(x0, x1, wy0, wy1, zA, wz0, plaster));
  wa.add(wallPiece(x0, x1, wy0, wy1, wz1, zB, plaster));
  // window glass + frame
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(wz1 - wz0, wy1 - wy0), new THREE.MeshBasicMaterial({ map: glassTexture(), toneMapped: false }));
  glass.rotation.y = Math.PI / 2; glass.position.set(x0 + .09, (wy0 + wy1) / 2, (wz0 + wz1) / 2); wa.add(glass);
  const fr = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: .6, envMapIntensity: .5 });
  const fx = (x0 + x1) / 2 + .02;
  [[wy0 - .035, (wz0 + wz1) / 2, 'h'], [wy1 + .035, (wz0 + wz1) / 2, 'h']].forEach(([y, z]) => { const m = rb(.2, .09, wz1 - wz0 + .18, fr, .02); m.position.set(fx, y, z); wa.add(m); });
  [wz0 - .035, wz1 + .035].forEach((z) => { const m = rb(.2, wy1 - wy0 + .18, .09, fr, .02); m.position.set(fx, (wy0 + wy1) / 2, z); wa.add(m); });
  { const m = rb(.12, wy1 - wy0, .05, fr, .015); m.position.set(fx, (wy0 + wy1) / 2, (wz0 + wz1) / 2); wa.add(m); }
  { const m = rb(.12, .05, wz1 - wz0, fr, .015); m.position.set(fx, (wy0 + wy1) / 2 + .1, (wz0 + wz1) / 2); wa.add(m); }
  shell.add(wa);
  shell.add(sunPatch(x1, wz0, wz1));

  // back wall (z = -H)
  const wb = new THREE.Group();
  wb.add(wallPiece(-H, H + T / 2, 0, WH, -H - T, -H, plasterB));
  shell.add(wb);
  // skirting
  const sk = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: .7, envMapIntensity: .5 });
  { const m = rb(.05, .2, H * 2, sk, .012, 1); m.position.set(-H + .025, .1, 0); shell.add(m); }
  { const m = rb(H * 2, .2, .05, sk, .012, 1); m.position.set(0, .1, -H + .025); shell.add(m); }
  shell.traverse((o) => { if (o.isMesh) o.customDepthMaterial = undefined; });

  /* ---- placing junk ---- */
  const R = rng(5);
  const lay = (o) => { o.updateMatrixWorld(true); const b = new THREE.Box3().setFromObject(o); o.position.y -= b.min.y; return o; };
  function put(prop, x, z, ry, o = {}) {
    const w = new THREE.Group();
    prop.rotation.y = 0;
    w.add(prop);
    w.position.set(x, o.y || 0, z); w.rotation.y = ry || 0;
    const b = o.fp ? blob(o.fp[0], o.fp[1], o.op ?? 1) : null;
    const root = new THREE.Group(); root.add(w);
    if (b) { b.position.set(x, .012, z); b.rotation.z = -(ry || 0); root.add(b); }
    root.userData.delay = o.delay ?? items.length * .07; root.userData.name = o.name || '';
    items.push(root);
    return root;
  }

  // left wall: sofa under the window, bike behind it, lamp + chair in front
  put(P.sofa(), -3.05, .6, Math.PI / 2, { fp: [1.3, 3.2], name: 'Couch' });
  { const b = P.bike(); const lean = new THREE.Group(); lean.add(b); lean.rotation.x = -.3; put(lean, -3.45, -2.5, Math.PI / 2, { fp: [.3, 1.8], op: .8, name: 'Bike' }); }
  put(P.lamp(), -3.55, 3.0, 0, { fp: [.7, .7], name: 'Lamp' });
  
  // back wall, left to right: boxes, mattress, totes, fridge, washer
  const stack = new THREE.Group();
  stack.add(at(P.cardboard(1.25, .95, 1.0), 0, 0, 0));
  stack.add(at(P.cardboard(1.0, .8, .85), -.05, .95, .02, .28));
  stack.add(at(P.cardboard(.7, .6, .7, { label: false }), .05, 1.75, 0, -.2));
  put(stack, -3.1, -3.15, 0, { fp: [1.5, 1.3], name: 'Boxes' });
  put(P.cardboard(.9, .7, .8), -1.85, -3.35, .15, { fp: [1.0, .9], name: 'Box' });

  { const m = P.mattress(); const st = new THREE.Group(); m.rotation.x = -Math.PI / 2; m.position.set(0, 1.45, 0); st.add(m); const piv = new THREE.Group(); piv.add(st); piv.rotation.x = -.2; put(piv, -.55, -3.2, 0.0, { fp: [2.0, .8], op: .7, name: 'Mattress' }); }

  const totes = new THREE.Group();
  totes.add(at(P.tote(1.15, .62, .8), 0, 0, 0));
  totes.add(at(P.tote(1.05, .55, .72, true, '#9bbf9a'), .04, .7, 0, .12));
  put(totes, 1.05, -3.2, 0, { fp: [1.3, 1.0], name: 'Storage bins' });
  put(P.fridge(), 2.55, -3.35, 0, { fp: [1.3, 1.2], name: 'Fridge' });
  put(P.washer(), 3.5, -3.35, -.12, { fp: [1.2, 1.2], name: 'Washer' });

  // floor: the clutter that spilled into the room
  { const a = P.armchair(); const t = new THREE.Group(); t.add(a); t.rotation.set(0, 0, -Math.PI / 2 + .1); put(lay(t), 1.15, 1.0, -.7, { fp: [1.4, 1.3], name: 'Armchair' }); }
  { const bags = new THREE.Group();
    bags.add(at(P.bag(.52, 1), 0, 0, 0)); bags.add(at(P.bag(.46, 2), .78, .12, .05)); bags.add(at(P.bag(.44, 3), .3, 0, .78)); bags.add(at(P.bag(.4, 4), .32, .62, .3, .6));
    put(bags, 2.55, 1.35, .3, { fp: [1.9, 1.7], name: 'Bags' }); }
  put(P.rug(), .0, 2.85, .12, { fp: [2.4, .9], name: 'Rug' });
  put(P.planks(), -.55, -.55, .05, { fp: [3, .7], name: 'Lumber' });
  { const t = P.tv(); const l = new THREE.Group(); t.rotation.x = -.16; l.add(t); put(l, 3.1, .0, -Math.PI / 2 + .1, { fp: [2.0, .6], name: 'TV' }); }
  put(P.plant(), 3.35, 3.1, 0, { fp: [.9, .9], name: 'Plant' });
  put(P.cardboard(.8, .65, .7), -1.1, -1.55, -.4, { fp: [1.0, .9], name: 'Box' });
  put(P.cardboard(.6, .5, .55, { label: false }), -1.75, .95, .5, { fp: [.8, .7], name: 'Box' });
  put(P.tote(.9, .5, .62, true, '#c4c9ce'), 1.75, -1.35, .25, { fp: [1.1, .9], name: 'Bin' });

  items.forEach((it, i) => { it.userData.delay = i * .055 + R() * .06; });
  return { shell, items, slab };
}
