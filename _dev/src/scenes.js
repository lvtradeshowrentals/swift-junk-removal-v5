// Five small dioramas (one per "what we take" card). Same clay language as the hero room, on a plinth.
import { THREE, clay, rb, at, blob, rng } from './kit.js';
import * as P from './props.js';
import * as Q from './props2.js';
import { buildTruck, buildCargo } from './truck.js';

function plinth(size, top, side = '#f1f3f5') {
  const slabSide = new THREE.MeshStandardMaterial({ color: side, roughness: .9, envMapIntensity: .4 });
  const slabTop = new THREE.MeshStandardMaterial({ color: top, roughness: .85, envMapIntensity: .4 });
  const geo = rb(size, .5, size, slabSide, .09, 4).geometry;
  const slab = new THREE.Mesh(geo, [slabSide, slabSide, slabTop, slabSide, slabSide, slabSide]);
  slab.position.y = -.25; slab.receiveShadow = true; slab.castShadow = true;
  const shell = new THREE.Group(); shell.add(slab);
  return { shell, slab };
}
function wall(shell, x0, x1, z0, z1, h, col = '#f1f3f5') {
  const m = new THREE.Mesh(rb(x1 - x0, h, z1 - z0, new THREE.MeshStandardMaterial({ color: col, roughness: .95 }), .02, 1).geometry, new THREE.MeshStandardMaterial({ color: col, roughness: .95, envMapIntensity: .4 }));
  m.position.set((x0 + x1) / 2, h / 2, (z0 + z1) / 2); m.castShadow = true; m.receiveShadow = true; shell.add(m);
}
function maker() {
  const items = [];
  const put = (prop, x, z, ry = 0, o = {}) => {
    const w = new THREE.Group(); w.add(prop); w.position.set(x, o.y || 0, z); w.rotation.y = ry;
    const root = new THREE.Group(); root.add(w);
    if (o.fp) { const b = blob(o.fp[0], o.fp[1], o.op ?? 1); b.position.set(x, .012, z); b.rotation.z = -ry; root.add(b); }
    items.push(root); return root;
  };
  const lay = (o) => { o.updateMatrixWorld(true); const b = new THREE.Box3().setFromObject(o); o.position.y -= b.min.y; return o; };
  return { items, put, lay };
}
const tilt = (obj, rx = 0, ry = 0, rz = 0) => { const g = new THREE.Group(); g.add(obj); g.rotation.set(rx, ry, rz); return g; };

export const SCENES = {
  /* the quote gauge */
  truck() { return { shell: buildTruck(), items: buildCargo(), loadMode: true }; },
  /* garage: a loaded shelf, boxes, totes, a bike */
  home() {
    const { shell } = plinth(7, '#cdd1d4'); const { items, put, lay } = maker();
    wall(shell, -3.5, 3.5, -3.7, -3.5, 2.7);
    const sh = Q.shelf(2.6, 2.6, .8, 4);
    const loaded = new THREE.Group(); loaded.add(sh);
    const bd = (i) => .145 + i * (2.4 / 3);
    loaded.add(at(P.tote(.9, .5, .6), -.7, bd(0), 0)); loaded.add(at(P.tote(.9, .5, .6, true, '#9bbf9a'), .55, bd(0), 0));
    loaded.add(at(P.cardboard(.7, .5, .55), -.75, bd(1), 0)); loaded.add(at(P.cardboard(.8, .6, .6), .2, bd(1), 0, .08)); loaded.add(at(P.cardboard(.5, .42, .5, { label: false }), .95, bd(1), 0));
    loaded.add(at(P.tote(1.0, .55, .62), -.45, bd(2), 0)); loaded.add(at(P.cardboard(.7, .55, .6), .7, bd(2), 0, -.1));
    loaded.add(at(P.cardboard(.9, .5, .6), -.5, bd(3), 0)); loaded.add(at(P.cardboard(.6, .45, .5), .5, bd(3), 0, .15));
    put(loaded, -.3, -3.0, 0, { fp: [2.8, 1.0] });
    const st = new THREE.Group(); st.add(at(P.cardboard(1.2, .9, .95), 0, 0, 0)); st.add(at(P.cardboard(1.0, .8, .85), 0, .9, 0, .2)); st.add(at(P.cardboard(.7, .55, .7, { label: false }), .05, 1.7, 0, -.15));
    put(st, 2.35, -2.5, -.15, { fp: [1.5, 1.3] });
    put(P.cardboard(.9, .7, .8), 1.25, -1.1, .3, { fp: [1, .9] });
    { const b = P.bike(); const l = new THREE.Group(); l.add(b); l.rotation.x = -.28; put(l, -2.75, -1.0, Math.PI / 2 - .1, { fp: [.4, 1.9], op: .8 }); }
    const tt = new THREE.Group(); tt.add(at(P.tote(1.15, .62, .8), 0, 0, 0)); tt.add(at(P.tote(1.05, .55, .72, true, '#c4c9ce'), .02, .72, 0, .1));
    put(tt, -1.5, 1.5, .3, { fp: [1.3, 1] });
    put(P.rug(), .7, 1.9, .5, { fp: [2.3, .9] });
    put(P.lamp(), 2.7, 1.4, 0, { fp: [.7, .7] });
    put(P.plant(), -2.8, 2.5, 0, { fp: [.9, .9] });
    return { shell, items };
  },
  /* furniture + appliances */
  furniture() {
    const { shell } = plinth(7, '#cdb592'); const { items, put, lay } = maker();
    put(P.sofa(3.0), -.4, -1.25, 0, { fp: [3.3, 1.5] });
    put(P.armchair(), 2.3, .2, -.7, { fp: [1.4, 1.4] });
    put(P.fridge(), 2.7, -2.7, -.25, { fp: [1.3, 1.2] });
    put(P.washer(), 1.4, -2.9, .1, { fp: [1.2, 1.2] });
    { const m = P.mattress(1.7, .4, 2.6); const st = new THREE.Group(); m.rotation.x = -Math.PI / 2; m.position.set(0, 1.3, 0); st.add(m); const piv = new THREE.Group(); piv.add(st); piv.rotation.x = -.22; put(piv, -2.8, -.3, Math.PI / 2, { fp: [2.4, .7], op: .6 }); }
    put(Q.dresser(), -.6, 1.6, .2, { fp: [1.7, .9] });
    { const t = P.tv(1.8, 1.05); t.rotation.x = -.14; const l = new THREE.Group(); l.add(t); put(l, 1.6, 1.9, -.4, { fp: [1.9, .6] }); }
    put(P.lamp(), -3.0, 2.5, 0, { fp: [.7, .7] });
    put(Q.sideTable(), .9, 0, 0, { fp: [.9, .9] });
    return { shell, items };
  },
  /* construction cleanup */
  construction() {
    const { shell } = plinth(7, '#c4c7c9'); const { items, put, lay } = maker();
    put(Q.drywall(6), -1.4, -1.4, .15, { fp: [2.7, 1.5] });
    put(P.planks(), 1.6, -1.2, -.25, { fp: [3, .8] });
    put(Q.cabinet(1.6, .95, .64), -2.2, 1.1, .5, { fp: [1.7, .8] });
    put(Q.cabinet(1.2, .95, .64, '#b9a98c'), -.5, 2.2, -.1, { fp: [1.3, .8] });
    put(Q.wheelbarrow(), 2.1, 1.3, -.4, { fp: [2.5, 1.0] });
    { const rub = new THREE.Group(), R = rng(9); const cols = ['#9aa0a6', '#b4b9be', '#8a9097', '#c2c6ca'];
      for (let i = 0; i < 11; i++) { const w = .35 + R() * .5, h = .22 + R() * .3, d = .3 + R() * .4; const m = rb(w, h, d, clay(cols[i % 4], { r: .95 }), .06, 2); m.position.set((R() - .5) * 1.3, h / 2 + (i > 6 ? .3 : 0), (R() - .5) * 1.1); m.rotation.y = R() * 3; rub.add(m); }
      put(rub, .6, .6, 0, { fp: [1.8, 1.6] }); }
    put(Q.bucket('#d5dade'), -3.0, -.2, 0, { fp: [.7, .7] }); put(Q.bucket('#e8b55d'), -2.55, -.6, 0, { fp: [.7, .7] });
    put(P.cardboard(.9, .45, .7, { label: false, c: '#e3dfd6' }), 2.9, -.1, .3, { fp: [1, .8] });
    put(P.cardboard(.8, .4, .6, { label: false, c: '#e3dfd6' }), 2.9, .75, -.2, { fp: [1, .8] });
    return { shell, items };
  },
  /* office / commercial */
  commercial() {
    const { shell } = plinth(7, '#b9c0c8'); const { items, put, lay } = maker();
    wall(shell, -3.5, 3.5, -3.7, -3.5, 2.5);
    const d1 = new THREE.Group(); d1.add(Q.desk()); d1.add(at(Q.monitor(), -.35, .81, -.1));
    put(d1, -1.2, -2.2, 0, { fp: [2.4, 1.2] });
    const d2 = new THREE.Group(); d2.add(Q.desk()); d2.add(at(Q.monitor(), .2, .81, -.1));
    put(d2, 1.6, -.6, -Math.PI / 2 + .15, { fp: [2.4, 1.2] });
    put(Q.officeChair(), -1.2, -.9, .6, { fp: [.9, .9] });
    { const c = Q.officeChair(); const t = new THREE.Group(); t.add(c); t.rotation.z = 1.2; put(lay(t), 0.9, 1.7, 2.4, { fp: [1.1, .9] }); }
    put(Q.filingCabinet(), 2.9, -2.6, -.2, { fp: [.9, 1] }); put(Q.filingCabinet(), 2.9, -1.6, -.1, { fp: [.9, 1] });
    put(Q.whiteboard(), -2.9, 0.2, Math.PI / 2 + .3, { fp: [.5, 2] });
    const st = new THREE.Group(); st.add(at(P.cardboard(1.0, .8, .8), 0, 0, 0)); st.add(at(P.cardboard(.8, .65, .7), 0, .8, 0, .25));
    put(st, -2.6, 2.3, .3, { fp: [1.2, 1] });
    put(P.cardboard(.7, .5, .6), -.9, 2.5, -.2, { fp: [.9, .8] });
    put(P.plant(), 2.9, 2.4, 0, { fp: [.9, .9] });
    return { shell, items };
  },
  /* yard + outdoor */
  yard() {
    const { shell } = plinth(7, '#a7c48d');
    const { items, put, lay } = maker();
    const fp = new THREE.Group(); fp.add(Q.fence(7)); const fl = new THREE.Group(); fl.add(fp); fl.rotation.x = -.18;
    put(fl, .2, -3.0, 0, { fp: [1.8, .6], op: .6 });
    const fp2 = new THREE.Group(); fp2.add(Q.fence(5)); const fl2 = new THREE.Group(); fl2.add(fp2); fl2.rotation.x = -.2; put(fl2, 2.5, -2.6, .15, { fp: [1.4, .6], op: .6 });
    const br = Q.branches(3); br.scale.setScalar(.7);
    put(br, -.9, .9, .4, { fp: [2.4, 2], op: .7 });
    const fr = Q.fronds(5); fr.scale.setScalar(.7);
    put(fr, 1.6, .2, .3, { fp: [2.4, 2.4], op: .6 });
    put(Q.leafBag(2), -2.7, 2.3, 0, { fp: [1.1, 1.1] }); put(Q.leafBag(4), -1.9, 2.7, 0, { fp: [1.1, 1.1] }); put(Q.leafBag(6), -2.8, 1.5, 0, { fp: [1.1, 1.1] });
    put(Q.grill(), 2.4, 2.3, 0, { fp: [1.3, 1.3] });
    put(Q.hotTub(), -2.3, -1.9, .2, { fp: [2.6, 2.4] });
    return { shell, items };
  },
};
