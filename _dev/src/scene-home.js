// Scene 1: a living room that has been lived in for too long.
import { THREE, clay, at, rng } from './kit.js';
import * as P from './props.js';
import * as H from './props-home.js';
import { maker } from './scene-util.js';
import { woodFloor } from './floors.js';

export function buildHome() {
  const { items, put, wall, lay, tilt, grp } = maker();
  const walls = H.homeWalls();

  /* left wall: sofa under the window, rug, coffee table, bike, lamp, a bookshelf nearest the camera */
  put(H.rugPattern(3.5, 2.6), -2.1, .75, 0, { name: 'Rug' });
  put(P.sofa(), -3.05, .6, Math.PI / 2, { fp: [1.3, 3.2], name: 'Couch' });
  put(H.coffeeTable(), -1.55, .75, .12, { fp: [1.8, 1.0], name: 'Coffee table' });
  { const b = P.bike(); const l = new THREE.Group(); l.add(b); l.rotation.x = -.3; put(l, -3.45, -2.5, Math.PI / 2, { fp: [.3, 1.8], op: .8, name: 'Bike' }); }
  put(P.lamp(), -3.55, -1.25, 0, { fp: [.7, .7], name: 'Lamp' });
  put(H.bookshelf(2.3, 3.1, .55), -3.7, 2.75, Math.PI / 2, { fp: [.7, 2.4], name: 'Bookshelf' });
  wall(H.curtains(3.3, 1.95), -3.88, 2.32, .6, Math.PI / 2, { name: 'Curtains' });

  /* back wall: boxes, mattress, totes, fridge, washer, with pictures above */
  const stack = new THREE.Group();
  stack.add(at(H.labeledBox(1.25, .95, 1.0, 'KITCHEN'), 0, 0, 0));
  stack.add(at(H.labeledBox(1.0, .8, .85, 'BOOKS'), -.05, .95, .02, .28));
  stack.add(at(H.labeledBox(.7, .6, .7, 'XMAS', { c: '#bfa07a' }), .05, 1.75, 0, -.2));
  put(stack, -3.1, -3.15, 0, { fp: [1.5, 1.3], name: 'Boxes' });
  put(H.labeledBox(.9, .7, .8, 'DVDS'), -1.85, -3.35, .15, { fp: [1.0, .9], name: 'Box' });
  { const m = P.mattress(); const st = new THREE.Group(); m.rotation.x = -Math.PI / 2; m.position.set(0, 1.45, 0); st.add(m); const piv = new THREE.Group(); piv.add(st); piv.rotation.x = -.2; put(piv, -.55, -3.2, 0, { fp: [2.0, .8], op: .7, name: 'Mattress' }); }
  const totes = new THREE.Group();
  totes.add(at(P.tote(1.15, .62, .8), 0, 0, 0)); totes.add(at(P.tote(1.05, .55, .72, true, '#9bbf9a'), .04, .7, 0, .12));
  put(totes, 1.05, -3.2, 0, { fp: [1.3, 1.0], name: 'Storage bins' });
  put(P.fridge(), 2.55, -3.35, 0, { fp: [1.3, 1.2], name: 'Fridge' });
  put(P.washer(), 3.5, -3.35, -.12, { fp: [1.2, 1.2], name: 'Washer' });
  wall(H.picture(1.05, .72, 0), 1.05, 2.65, -3.94, 0, { name: 'Picture' });
  wall(H.picture(.8, .8, 1), 2.7, 3.05, -3.94, 0, { name: 'Picture' });
  wall(H.picture(1.3, .6, 2), -1.5, 2.8, -3.94, 0, { name: 'Picture' });
  wall(H.wallClock(), 0.0, 2.95, -3.93, 0, { name: 'Clock' });

  /* floor: the stuff that spilled into the room */
  { const a = P.armchair(); const t = new THREE.Group(); t.add(a); t.rotation.set(0, 0, -Math.PI / 2 + .1); put(lay(t), 1.15, 1.0, -.7, { fp: [1.4, 1.3], name: 'Armchair' }); }
  { const bags = new THREE.Group();
    bags.add(at(P.bag(.52, 1), 0, 0, 0)); bags.add(at(P.bag(.46, 2), .78, .12, .05)); bags.add(at(P.bag(.44, 3), .3, 0, .78)); bags.add(at(P.bag(.4, 4), .32, .62, .3, .6));
    put(bags, 2.55, 1.35, .3, { fp: [1.9, 1.7], name: 'Bags' }); }
  put(P.rug(), 0.1, 2.9, .12, { fp: [2.4, .9], name: 'Rolled rug' });
  put(P.planks(), .2, -.9, .05, { fp: [3, .7], name: 'Lumber' });
  { const t = P.tv(); const l = new THREE.Group(); t.rotation.x = -.16; l.add(t); put(l, 3.1, .0, -Math.PI / 2 + .1, { fp: [2.0, .6], name: 'TV' }); }
  put(P.plant(), 3.35, 3.1, 0, { fp: [.9, .9], name: 'Plant' });
  put(H.treadmill(), .75, -1.65, Math.PI / 2 + .1, { fp: [1.2, 2.2], name: 'Treadmill' });
  put(H.suitcase('#3f7f9c'), -.3, 1.7, .5, { fp: [.9, .6], name: 'Suitcase' });
  put(H.suitcase('#c0463b'), 2.9, -1.45, -.3, { fp: [.9, .6], name: 'Suitcase' });
  put(H.vacuum(), -2.55, 2.1, .6, { fp: [.8, .8], name: 'Vacuum' });
  put(H.basket(), -1.55, 2.85, 0, { fp: [1, 1], name: 'Laundry' });
  put(P.cardboard(.8, .65, .7), -1.1, -1.55, -.4, { fp: [1.0, .9], name: 'Box' });
  put(P.cardboard(.6, .5, .55, { label: false }), -1.0, 3.3, .5, { fp: [.8, .7], name: 'Box' });
  put(H.lampTable(), 3.45, -1.55, 0, { fp: [1, 1], name: 'Side table' });

  return { id: 'home', label: 'Home', noun: 'room', walls, items, floor: () => woodFloor(1536), cam: { az: 41, el: 31, dist: 40, ty: 1.15 } };
}
