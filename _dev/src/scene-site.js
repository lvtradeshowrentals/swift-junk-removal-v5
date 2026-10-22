// Scene 3: a remodel in progress, with everything that comes out of one.
import { THREE, at } from './kit.js';
import * as P from './props.js';
import * as Q from './props2.js';
import * as S from './props-site.js';
import { maker } from './scene-util.js';
import { siteFloor } from './floors.js';

export function buildSite() {
  const { items, put, lay, tilt, grp } = maker();
  const walls = S.siteWalls();
  const K = (o, k) => { const g = new THREE.Group(); g.add(o); g.scale.setScalar(k); return g; };

  /* back wall: the old kitchen, a leaning door, uppers, the scaffold in the corner */
  put(S.cabinetRun(), 2.55, -3.5, 0, { fp: [3, .9], name: 'Kitchen cabinets' });
  put(S.uppers(), .0, -3.6, .1, { fp: [1, .6], name: 'Upper cabinets' });
  { const d = S.oldDoor(); put(tilt(d, -.14), -1.45, -3.8, 0, { fp: [1, .4], op: .5, name: 'Door' }); }
  put(K(S.scaffold(), .8), -2.95, -2.7, 0, { fp: [1.8, 1.0], name: 'Scaffold' });
  /* left wall: drywall leaning, the old tub and toilet, a vanity */
  put(S.drywallLean(5), -3.72, -1.2, Math.PI / 2, { fp: [.7, 1.4], op: .6, name: 'Drywall' });
  put(S.bathtub(), -3.3, 2.5, Math.PI / 2, { fp: [1.1, 2.0], name: 'Bathtub' });
  put(S.toilet(), -2.15, 3.25, .5, { fp: [.8, .9], name: 'Toilet' });
  put(S.vanity(), -2.3, .25, .3, { fp: [1.3, .8], name: 'Vanity' });
  /* the middle of the floor: lumber, plywood, a pile of drywall, scraps */
  put(S.lumberBundle(2.9, 4, 6, 1), -.2, -1.5, .1, { fp: [1.3, 3], name: 'Lumber' });
  put(S.plywoodStack(7), 1.4, .55, .2, { fp: [2.5, 1.3], name: 'Plywood' });
  put(S.drywallPile(), 1.0, -1.75, -.25, { fp: [2.6, 1.4], name: 'Drywall pile' });
  put(S.scrapPile(), -1.3, .5, .3, { fp: [1.5, 1.2], op: .6, name: 'Scrap' });
  put(S.sawhorses(), -1.6, 1.9, .5, { fp: [2.2, 1.1], name: 'Sawhorses' });
  put(S.rubbleBarrow(), 1.45, 2.2, -.4, { fp: [2.5, 1.0], name: 'Wheelbarrow' });
  put(S.tileBoxes(), -1.7, -.45, 0, { fp: [2.1, 1.2], name: 'Tile' });
  /* right side: cement, rebar, pipe, insulation, the work light, a ladder */
  put(S.cementBags(8), 3.3, -.1, .2, { fp: [1.2, 1.1], name: 'Cement' });
  put(S.rebarBundle(), 2.2, 3.35, .08, { fp: [2.8, .5], name: 'Rebar' });
  put(S.pvcBundle(), -1.6, 3.7, -.06, { fp: [2.6, .5], name: 'PVC' });
  put(S.insulationRolls(3), -3.35, .85, 1.0, { fp: [1.2, 1.4], name: 'Insulation' });
  put(S.workLight(), 3.6, -1.0, 0, { fp: [1.2, 1.2], name: 'Work light' });
  put(S.ladderA(2.3), -.25, 3.0, -.2, { fp: [1.3, 1.5], name: 'Ladder' });
  put(S.jackhammer(), 3.75, .9, .5, { fp: [.8, .8], name: 'Jackhammer' });
  /* the little stuff */
  [[-1.3, 2.35], [-.7, 2.45], [.6, 1.0], [3.55, 3.3]].forEach(([x, z], i) => put(S.bucket5(['#ffffff', '#e9e6df', '#f08a1b', '#ffffff'][i]), x, z, i, { fp: [.7, .7], name: 'Buckets' }));
  [[3.45, 1.5], [3.0, 2.15], [3.6, 2.4]].forEach(([x, z], i) => put(P.bag(.5, 7 + i), x, z, 0, { fp: [1.1, 1.1], name: 'Debris bags' }));
  put(S.shopVac(), -2.5, 1.4, .8, { fp: [.8, .8], name: 'Shop vac' });
  put(S.mortarTub(), .55, -.6, .4, { fp: [1.1, .8], name: 'Mortar tub' });
  put(S.toolbox(), -.35, .5, -.3, { fp: [.8, .5], name: 'Toolbox' });
  put(S.cordCoil(), 1.0, 3.5, 0, { fp: [.8, .8], name: 'Cord' });
  put(S.cooler(), 2.0, -.2, .6, { fp: [.6, .5], name: 'Cooler' });
  put(S.tarp(), -2.85, 3.5, .2, { fp: [1.3, .8], name: 'Tarp' });
  [[-.9, 3.05, 0], [1.65, -.25, 1]].forEach(([x, z, i]) => put(S.hardHat(i ? '#ffffff' : '#f4c430'), x, z, i, { name: 'Hard hat' }));
  [[2.5, 3.75], [3.0, 3.35], [-3.7, 3.75]].forEach(([x, z]) => put(S.cone(), x, z, 0, { fp: [.6, .6], name: 'Cones' }));

  return { id: 'site', label: 'Construction', noun: 'site', walls, items, floor: () => siteFloor(1536), cam: { az: 41, el: 31, dist: 40, ty: 1.25 } };
}
