// Scene 2: a Las Vegas backyard nobody has touched in years.
import { THREE, at } from './kit.js';
import * as P from './props.js';
import * as Q from './props2.js';
import * as Y from './props-yard.js';
import { maker } from './scene-util.js';
import { yardFloor } from './floors.js';

export function buildYard() {
  const { items, put, lay, tilt, grp } = maker();
  const walls = Y.yardWalls();

  const K = (o, k) => { const g = new THREE.Group(); g.add(o); g.scale.setScalar(k); return g; };
  /* back row: palm, hose, fence panels, planter, the hot tub by the gate, blocks */
  put(Y.palmTree(3.4, 4), -3.2, -3.1, 0, { fp: [1.2, 1.2], name: 'Palm' });
  put(Y.hoseReel(), -1.85, -3.5, 0, { fp: [1.2, 1.2], name: 'Hose reel' });
  { const f = new THREE.Group(); f.add(Q.fence(7)); const l = tilt(f, -.2); put(l, -.55, -3.78, 0, { fp: [1.8, .6], op: .5, name: 'Fence' }); }
  put(Y.planter(), .85, -3.45, 0, { fp: [1, 1], name: 'Planter' });
  put(K(Y.hotTub(), .9), 2.2, -2.5, .1, { fp: [2.6, 2.6], name: 'Hot tub' });
  put(Y.cinderStack(), 3.15, -3.55, 0, { fp: [2.2, .9], name: 'Blocks' });
  /* the left wall: trimmings, a stump, the dead palm fronds */
  put(K(Y.deadFronds(12, 6), .75), -1.9, -1.9, .3, { fp: [2.4, 1.8], op: .6, name: 'Palm fronds' });
  put(K(Y.branchPile(3), .85), -3.0, .6, 1.57, { fp: [2.4, 1.9], op: .6, name: 'Branches' });
  put(Y.stump(), -3.4, -1.25, 0, { fp: [1.2, 1.2], name: 'Stump' });
  put(Y.rake(), -3.85, 2.2, 0, { name: 'Rake' });
  /* middle: mower, wheelbarrow, pavers, grill */
  put(Y.mower(), -.7, -.5, .5, { fp: [1.6, 1.0], name: 'Mower' });
  put(Q.wheelbarrow(), 1.0, -.7, .3, { fp: [2.5, 1.0], name: 'Wheelbarrow' });
  put(Y.paverStack(), .1, .55, .2, { fp: [1.1, .8], name: 'Pavers' });
  put(Y.kettleGrill(), 3.3, -.8, 0, { fp: [1.4, 1.4], name: 'Grill' });
  put(Y.gnome(), -.7, 1.2, .5, { name: 'Gnome' });
  /* the patio, front-left */
  put(Y.patioTable(), -2.3, 1.5, 0, { fp: [1.4, 1.4], name: 'Table' });
  put(grp(Y.patioChair(), at(Y.patioChair(), 0, .52, 0, .35), at(Y.patioChair(), 0, 1.04, 0, -.2)), -1.3, 2.35, .5, { fp: [.9, .9], name: 'Chairs' });
  { const c = Y.patioChair('#e0ddd4'); const t = new THREE.Group(); t.add(c); t.rotation.set(0, 0, 1.45); put(lay(t), -3.15, 2.4, .8, { fp: [.9, .9], name: 'Chair' }); }
  put(Y.umbrellaFolded(), -3.3, 3.45, 1.2, { fp: [1.4, .8], name: 'Umbrella' });
  put(Y.poolFloat(), -1.9, 3.35, .3, { fp: [1.4, 1.4], name: 'Pool float' });
  /* front-right: the trampoline, the slide, bags and tires */
  put(K(Y.trampoline(), .85), 1.85, 1.75, 0, { fp: [2.8, 2.8], name: 'Trampoline' });
  put(K(Y.kidSlide(), .85), -.15, 3.0, -.4, { fp: [1.1, 2.0], name: 'Slide' });
  [[3.4, .7], [3.0, 3.1]].forEach(([x, z], i) => put(Q.leafBag(i + 2), x, z, 0, { fp: [1.1, 1.1], name: 'Leaf bags' }));
  put(Y.tireStack(4), 3.55, 2.0, 0, { fp: [1.1, 1.1], name: 'Tires' });
  put(Y.pallets(3), 1.0, 3.3, .2, { fp: [1.2, 1.2], name: 'Pallets' });
  put(Y.turfRoll(), 3.1, 3.6, 1.2, { fp: [2, .9], name: 'Turf' });
  put(Y.boulder(1, .5), -3.6, -.3, 0, { name: 'Rock' });

  return { id: 'yard', label: 'Yard', noun: 'yard', walls, items, floor: () => yardFloor(1536), cam: { az: 41, el: 31, dist: 40, ty: 1.2 } };
}
