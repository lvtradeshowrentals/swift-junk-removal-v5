// The pile at the curb: sixteen pieces that could come from any job, heaped the way people actually leave them.
// Every piece is its own root so it can be lifted into the truck on its own.
import { THREE, at } from './kit.js';
import * as P from './props.js';
import * as Q from './props2.js';
import * as H from './props-home.js';
import * as Y from './props-yard.js';
import * as S from './props-site.js';

export const PILE = { cx: 3.85, cz: 1.75, scale: .9 };

const group = (...k) => { const g = new THREE.Group(); k.flat().forEach((o) => o && g.add(o)); return g; };

/* place a prop: world x, y (of its feet), z, euler rotations, extra scale */
function piece(name, prop, x, y, z, o = {}) {
  const w = new THREE.Group(); w.add(prop);
  w.rotation.set(o.rx || 0, o.ry || 0, o.rz || 0, 'YXZ');
  w.scale.setScalar(PILE.scale * (o.s || 1));
  w.position.set(x, y, z);
  const root = new THREE.Group(); root.add(w); root.userData.name = name; root.userData.stow = o.stow || 1; root.userData.kind = o.kind || 'item';
  return root;
}
const box = (txt, w, h, d, c) => H.labeledBox(w, h, d, txt, c ? { c } : {});

export function buildPile() {
  const items = [];
  const add = (r) => { items.push(r); return r; };

  /* back row (nearest the truck): the tall things */
  add(piece('Fridge', P.fridge(), 2.95, 0, .35, { ry: .12 }));
  add(piece('Washer', P.washer(), 4.0, 0, .15, { ry: -.1 }));
  add(piece('Mattress', (() => { const m = P.mattress(1.9, .42, 2.9); m.rotation.x = -Math.PI / 2; m.position.set(0, 1.45, 0); const g = new THREE.Group(); g.add(m); return g; })(), 3.45, .0, 1.05, { rx: -.3, ry: -.12 }));
  add(piece('Drywall', S.drywallLean(5), 4.6, 0, 1.15, { ry: -1.2 }));
  /* middle: the big soft stuff */
  add(piece('Couch', P.sofa(3.1), 3.55, 0, 2.35, { ry: -.3 }));
  add(piece('Armchair', P.armchair(), 2.35, 0, 2.2, { ry: .6 }));
  add(piece('Box', box('KITCHEN', 1.25, .95, 1.0), 2.4, 0, 1.2, { ry: .15 }));
  add(piece('Box', box('BOOKS', 1.0, .8, .85, '#bfa07a'), 2.45, .86, 1.25, { ry: -.3 }));
  add(piece('Toilet', S.toilet(), 4.75, 0, 2.15, { ry: 1.0 }));
  /* the heap's crown */
  add(piece('TV', P.tv(2.0, 1.15), 3.6, 1.0, 2.05, { rx: -.55, ry: -.35 }));
  add(piece('Bike', P.bike(), 3.4, .95, 2.4, { ry: .9, rz: .25 }));
  add(piece('Lamp', P.lamp(), 4.2, .72, 2.1, { rz: 1.25, ry: .6 }));
  add(piece('Branches', Y.branchPile(3), 4.15, 0, 3.0, { ry: .4, s: .85 }));
  /* front row: the low stuff you can see over */
  add(piece('Bag', P.bag(.52, 1), 2.75, 0, 3.2, { ry: .4 }));
  add(piece('Bag', P.bag(.46, 2), 3.2, 0, 3.7, { ry: 1.2 }));
  add(piece('Bag', P.bag(.44, 3), 2.3, 0, 3.8, { ry: .3 }));
  add(piece('Palm fronds', Y.deadFronds(8, 6), 3.4, 0, 3.15, { ry: .2, s: .8 }));
  add(piece('Tires', Y.tireStack(3), 4.6, 0, 3.8, { ry: .2 }));
  add(piece('Pallets', Y.pallets(3), 4.55, 0, 4.4, { ry: .1, s: .8 }));
  add(piece('Chair', Q.officeChair(), 1.9, 0, 3.0, { ry: .9 }));
  add(piece('Filing cabinet', Q.filingCabinet(), 1.7, 0, 1.9, { ry: .25 }));
  return items;
}
