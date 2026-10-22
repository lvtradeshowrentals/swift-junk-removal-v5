// Shared kit for the clay scenes: materials, the dissolve shader patch, small modelling helpers.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

export { THREE };

/* ---- the "clear" front: everything behind it is erased, with a glowing edge ---- */
export const SH = {
  uFront: { value: -99 },
  uDir: { value: new THREE.Vector2(0.7071, 0.7071) },
  uBand: { value: 0.4 },
  uAccent: { value: new THREE.Color('#ff5a1f') },
};

const GLSL_HEAD = /* glsl */ `
uniform float uFront; uniform vec2 uDir; uniform float uBand; uniform vec3 uAccent;
varying vec3 vDW;
float dh(vec3 p){ p = fract(p * 0.3183099 + .1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float dn(vec3 x){ vec3 i = floor(x), f = fract(x); f = f * f * (3. - 2. * f);
  return mix(mix(mix(dh(i), dh(i + vec3(1,0,0)), f.x), mix(dh(i + vec3(0,1,0)), dh(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(dh(i + vec3(0,0,1)), dh(i + vec3(1,0,1)), f.x), mix(dh(i + vec3(0,1,1)), dh(i + vec3(1,1,1)), f.x), f.y), f.z); }
float dsweep(vec3 w){ return dot(w.xz, uDir) + (dn(w * 1.5) * .7 + dn(w * 4.3) * .3) * 1.25 - .62; }
`;
const GLSL_DISCARD = /* glsl */ `
float dS0 = dsweep(vDW);
float dD = dS0 - uFront;
if (dD < 0.0) discard;
float dFw = max(fwidth(dS0), 1e-4);
float dEdge = 1.0 - smoothstep(0.0, dFw * 2.6, dD);
float dGlow = 1.0 - smoothstep(0.0, dFw * 12.0, dD);
`;

export function dissolvable(mat, glow = true) {
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uFront = SH.uFront; sh.uniforms.uDir = SH.uDir; sh.uniforms.uBand = SH.uBand; sh.uniforms.uAccent = SH.uAccent;
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vDW;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvDW = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\n' + GLSL_HEAD)
      .replace('#include <clipping_planes_fragment>', '#include <clipping_planes_fragment>\n' + GLSL_DISCARD);
    if (glow) {
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <color_fragment>', '#include <color_fragment>\ndiffuseColor.rgb = mix(diffuseColor.rgb, uAccent, dEdge);')
        .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\ntotalEmissiveRadiance += uAccent * (dEdge * 1.2 + dGlow * .35);');
    }
  };
  mat.customProgramCacheKey = () => 'dis' + (glow ? 1 : 0);
  return mat;
}

const DEPTH = dissolvable(new THREE.MeshDepthMaterial(), false);

/* ---- materials ---- */
const cache = new Map();
export function clay(color, o = {}) {
  const key = color + '|' + (o.r ?? .86) + '|' + (o.m ?? 0) + '|' + (o.cc ?? 0) + '|' + (o.e ?? 0);
  if (cache.has(key)) return cache.get(key);
  const m = new THREE.MeshPhysicalMaterial({
    color, roughness: o.r ?? .86, metalness: o.m ?? 0, clearcoat: o.cc ?? 0, clearcoatRoughness: .5,
    emissive: o.e ? new THREE.Color(color) : 0x000000, emissiveIntensity: o.e || 0,
    envMapIntensity: o.env ?? .55, sheen: o.sheen ?? 0, sheenRoughness: .8, sheenColor: new THREE.Color(color).lerp(new THREE.Color('#ffffff'), .35),
  });
  dissolvable(m);
  cache.set(key, m);
  return m;
}

/* ---- modelling helpers ---- */
export function part(geo, mat, o = {}) {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = o.cast !== false; m.receiveShadow = o.rec !== false;
  m.customDepthMaterial = DEPTH;
  return m;
}
export function rb(w, h, d, mat, r = .05, seg = 3) {
  const rr = Math.max(.002, Math.min(r, w / 2 - 1e-3, h / 2 - 1e-3, d / 2 - 1e-3));
  return part(new RoundedBoxGeometry(w, h, d, seg, rr), mat);
}
export function cyl(rt, rb_, h, mat, seg = 28) { return part(new THREE.CylinderGeometry(rt, rb_, h, seg, 1), mat); }
export function sph(r, mat, sx = 1, sy = 1, sz = 1, seg = 28) { const m = part(new THREE.SphereGeometry(r, seg, seg * .6 | 0), mat); m.scale.set(sx, sy, sz); return m; }
export function at(m, x = 0, y = 0, z = 0, ry = 0, rx = 0, rz = 0) { m.position.set(x, y, z); m.rotation.set(rx, ry, rz); return m; }
/* a cylinder between two points */
export function tube(a, b, r, mat, seg = 12) {
  const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b);
  const len = va.distanceTo(vb);
  const m = part(new THREE.CylinderGeometry(r, r, len, seg, 1), mat);
  m.position.copy(va).add(vb).multiplyScalar(.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), vb.clone().sub(va).normalize());
  return m;
}
export function group(...kids) { const g = new THREE.Group(); kids.flat().forEach((k) => k && g.add(k)); return g; }

/* seeded random so every load builds the same room */
export function rng(seed = 7) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/* soft contact shadow: a blurred rounded rectangle on the floor */
let blobTex;
function blobTexture() {
  if (blobTex) return blobTex;
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d');
  g.filter = 'blur(9px)'; g.fillStyle = '#fff';
  g.beginPath(); g.roundRect(28, 28, 72, 72, 18); g.fill();
  blobTex = new THREE.CanvasTexture(c);
  return blobTex;
}
const BLOB = dissolvable(new THREE.MeshBasicMaterial({ color: 0x1a1612, alphaMap: null, transparent: true, opacity: .34, depthWrite: false }), false);
export function blob(w, d, op = 1) {
  const mat = BLOB.clone(); mat.alphaMap = blobTexture(); mat.opacity = .34 * op; dissolvable(mat, false);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w * 1.5, d * 1.5), mat);
  m.rotation.x = -Math.PI / 2; m.position.y = .01; m.renderOrder = 1;
  return m;
}
