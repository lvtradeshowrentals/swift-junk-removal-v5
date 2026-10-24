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

  /* three loose rows fanned toward the camera, with air between the pieces so each one reads on its own */
  /* back: the tall, flat-faced things */
  add(piece('Fridge', P.fridge(), 1.6, 0, .35, { ry: .12 }));
  add(piece('Washer', P.washer(), 3.2, 0, .35, { ry: -.1 }));
  add(piece('Mattress', (() => { const m = P.mattress(1.9, .42, 2.9); m.rotation.x = -Math.PI / 2; m.position.set(0, 1.45, 0); const g = new THREE.Group(); g.add(m); return g; })(), 4.7, .0, .95, { rx: -.3, ry: -.25 }));
  /* middle: the big furniture, side by side */
  add(piece('Couch', P.sofa(3.1), 2.6, 0, 2.3, { ry: -.2 }));
  add(piece('TV', P.tv(2.0, 1.15), 4.35, .0, 2.1, { rx: -.1, ry: 1.0 }));
  add(piece('Toilet', S.toilet(), 4.6, 0, 3.6, { ry: .9 }));
  /* front: the small stuff you can name at a glance */
  add(piece('Bike', P.bike(), 1.5, 0, 3.4, { ry: .75, rz: .22 }));
  add(piece('Box', box('KITCHEN', 1.25, .95, 1.0), 2.85, 0, 3.55, { ry: .15 }));
  add(piece('Box', box('BOOKS', 1.0, .8, .85, '#bfa07a'), 2.9, .86, 3.6, { ry: -.3 }));
  add(piece('Bag', P.bag(.52, 1), 3.75, 0, 4.2, { ry: .4 }));
  add(piece('Bag', P.bag(.46, 2), 4.3, 0, 4.4, { ry: 1.2 }));
  add(piece('Tires', Y.tireStack(3), .75, 0, 2.3, { ry: .2 }));
  add(piece('Pallets', Y.pallets(3), 2.4, 0, 4.3, { ry: .1, s: .8 }));
  return items;
}
