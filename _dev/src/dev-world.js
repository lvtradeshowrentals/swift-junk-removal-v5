import { THREE, mergeItem } from './kit.js';
import { makeStudio } from './studio.js';
import { buildBoxTruck } from './boxtruck.js';
import { makeCurbStage } from './curb-stage.js';
import { buildCurbSet } from './curb-walls.js';
import { buildPile } from './curb-pile.js';
export function labWorld(canvas, o = {}) {
  const st = makeStudio(canvas, { preserve: true, shadowR: 9 });
  const stage = makeCurbStage(); st.scene.add(stage.group);
  const set = buildCurbSet(); mergeItem(set); st.scene.add(set);
  const pile = buildPile(); pile.forEach((r) => { mergeItem(r); st.scene.add(r); });
  const truck = buildBoxTruck(); truck.root.position.set(o.tx ?? 0, 0, -1.85); st.scene.add(truck.root); truck.door(o.door ?? 0);
  const w = canvas.clientWidth, h = canvas.clientHeight; st.renderer.setSize(w, h, false); st.camera.aspect = w / h;
  const az = THREE.MathUtils.degToRad(o.az ?? 41), el = THREE.MathUtils.degToRad(o.el ?? 31), d = o.dist ?? 46;
  st.camera.position.set((o.lx ?? 0) + Math.sin(az) * Math.cos(el) * d, Math.sin(el) * d + 1.2, (o.lz ?? 0) + Math.cos(az) * Math.cos(el) * d); st.camera.lookAt(o.lx ?? 0, 1.2, o.lz ?? 0);
  st.camera.zoom = o.zoom ?? 1.5; st.camera.setViewOffset(w, h, -(o.fx ?? 0) * w, -(o.fy ?? 0) * h, w, h); st.camera.updateProjectionMatrix();
  st.renderer.render(st.scene, st.camera); window.__done = true; return { st, stage, set, truck };
}
