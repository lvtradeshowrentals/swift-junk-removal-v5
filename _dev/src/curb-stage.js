// The plinth: a thick slab with the driveway painted on top, plus the road the truck uses, running off both edges.
import { THREE, rb } from './kit.js';
import { curbFloor, roadTexture, FLOOR } from './curb-floor.js';
import { SET } from './curb-walls.js';

export function makeCurbStage() {
  const H = FLOOR.half, T = SET.T, size = H * 2 + T, thick = .52;
  const side = new THREE.MeshStandardMaterial({ color: '#efeeea', roughness: .9, envMapIntensity: .4 });
  const top = new THREE.MeshStandardMaterial({ color: '#ffffff', map: curbFloor(), roughness: .86, envMapIntensity: .35 });
  const geo = rb(size, thick, size, side, .07, 4).geometry;
  const slab = new THREE.Mesh(geo, [side, side, top, side, side, side]);
  slab.position.set(T / 2 - .0, -thick / 2, T / 2 - 0); slab.position.set(-T / 2 + T / 2, -thick / 2, 0);
  // the slab is centred so the interior (-H..H) sits on it, with the wall thickness hanging off the back/left
  slab.position.set(-T / 2, -thick / 2, -T / 2);
  slab.receiveShadow = slab.castShadow = true;
  const group = new THREE.Group(); group.add(slab);
  // road strips (same height as the slab top), running off both edges
  const rt = roadTexture(); rt.repeat.set(10, 1.3);
  const roadM = new THREE.MeshStandardMaterial({ color: '#ffffff', map: rt, roughness: .88, envMapIntensity: .35 });
  const rz0 = SET.gateZ0 - .1, rz1 = SET.gateZ1 + .1, rw = rz1 - rz0, rc = (rz0 + rz1) / 2;
  // the road dissolves into the page the further it runs from the plinth
  const fadeM = roadM.clone();
  fadeM.transparent = true;
  fadeM.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying float vRX;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvRX = (modelMatrix * vec4(transformed, 1.0)).x;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vRX;').replace('#include <opaque_fragment>', '#include <opaque_fragment>\ngl_FragColor.a *= 1.0 - smoothstep(9.0, 19.0, abs(vRX));');
  };
  const mk = (x0, x1) => { const m = new THREE.Mesh(rb(x1 - x0, .3, rw, roadM, .03, 1).geometry, [fadeM, fadeM, fadeM, fadeM, fadeM, fadeM]); m.position.set((x0 + x1) / 2, -.15, rc); m.receiveShadow = true; m.renderOrder = -1; group.add(m); return m; };
  mk(H + .1, 26); mk(-26, -H - T - .1);
  return { group, slab, size, thick };
}
