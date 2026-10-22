// The shared plinth: one slab whose top surface can morph (a ring of light sweeps outward and reveals the next floor).
import { THREE, SH, rb } from './kit.js';

export const SLAB = { half: 4, wallT: .36, thick: .5 };

export function makeStage() {
  const size = SLAB.half * 2 + SLAB.wallT;
  const side = new THREE.MeshStandardMaterial({ color: '#f1f3f5', roughness: .9, envMapIntensity: .4 });
  const top = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: .78, envMapIntensity: .45 });
  const MU = { uMap2: { value: null }, uRad: { value: 0 } };
  top.onBeforeCompile = (sh) => {
    sh.uniforms.uMap2 = MU.uMap2; sh.uniforms.uRad = MU.uRad; sh.uniforms.uAccent = SH.uAccent;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vFW;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvFW = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform sampler2D uMap2; uniform float uRad; uniform vec3 uAccent; varying vec3 vFW;')
      .replace('#include <map_fragment>', `#include <map_fragment>
        float fd = length(vFW.xz);
        float fk = (1.0 - smoothstep(uRad - .5, uRad, fd)) * step(.001, uRad);
        diffuseColor = mix(diffuseColor, texture2D(uMap2, vMapUv), fk);`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        float fring = exp(-pow((fd - uRad + .12) / .16, 2.0)) * step(.001, uRad) * step(uRad, 7.6);
        totalEmissiveRadiance += uAccent * fring * 2.2;`);
  };
  const geo = rb(size, SLAB.thick, size, side, .07, 4).geometry;
  const slab = new THREE.Mesh(geo, [side, side, top, side, side, side]);
  slab.position.y = -SLAB.thick / 2; slab.receiveShadow = true; slab.castShadow = true;
  const group = new THREE.Group(); group.add(slab);
  return {
    group, slab, size,
    setFloor(tex) { top.map = tex; top.needsUpdate = true; MU.uRad.value = 0; },
    /* start revealing `tex`; drive ring() from 0 to ~6.6, then commit() */
    next(tex) { MU.uMap2.value = tex; },
    ring(r) { MU.uRad.value = r; },
    commit() { top.map = MU.uMap2.value; MU.uRad.value = 0; },
  };
}
