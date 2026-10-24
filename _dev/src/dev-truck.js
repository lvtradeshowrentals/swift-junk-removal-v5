import { THREE } from './kit.js';
import { makeStudio } from './studio.js';
import { buildBoxTruck } from './boxtruck.js';
export function labTruck(canvas, o = {}) {
  const st = makeStudio(canvas, { preserve: true, shadowR: 7 });
  const truck = buildBoxTruck(); st.scene.add(truck.root);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshStandardMaterial({ color: '#e4e7ea', roughness: .9 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; st.scene.add(floor);
  truck.door(o.door ?? 0);
  const w = canvas.clientWidth, h = canvas.clientHeight; st.renderer.setSize(w, h, false); st.camera.aspect = w / h;
  const az = THREE.MathUtils.degToRad(o.az ?? 38), el = THREE.MathUtils.degToRad(o.el ?? 22), d = o.dist ?? 30;
  st.camera.position.set(Math.sin(az) * Math.cos(el) * d, Math.sin(el) * d + 1.4, Math.cos(az) * Math.cos(el) * d); st.camera.lookAt(-.8, 1.5, 0); st.camera.zoom = o.zoom ?? 1; st.camera.updateProjectionMatrix();
  st.renderer.render(st.scene, st.camera);
  window.__done = true;
  return { st, truck };
}
export { labWorld } from './dev-world.js';
