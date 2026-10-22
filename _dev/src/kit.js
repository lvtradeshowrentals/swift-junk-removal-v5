// Shared kit for the clay scenes: materials, the dissolve shader patch, small modelling helpers.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

export { THREE };

/* ---- the "clear" front: everything behind it is erased, with a glowing edge ---- */
const ACCENT = new THREE.Color('#ff5a1f'), DIR = new THREE.Vector2(0.7071, 0.7071);
/* uSign +1: things behind the front are erased (clear). uSign -1: things behind the front are built (reveal). */
export const SH = { uFront: { value: -99 }, uDir: { value: DIR }, uBand: { value: 0.4 }, uAccent: { value: ACCENT }, uSign: { value: 1 } };
/* the same front, but for the walls, so they can sweep on their own schedule */
export const SHW = { uFront: { value: -99 }, uDir: { value: DIR }, uBand: { value: 0.4 }, uAccent: { value: ACCENT }, uSign: { value: 1 } };
/* the gauge (a separate canvas) gets its own, frozen copy so the hero's sweep never touches it */
export const SHG = { uFront: { value: 8.6 }, uDir: { value: DIR }, uBand: { value: 0.4 }, uAccent: { value: ACCENT }, uSign: { value: -1 } };
export const mode = { walls: false, ns: '' };
const curU = () => (mode.walls ? SHW : mode.ns === 'G' ? SHG : SH);
export function withWalls(fn) { mode.walls = true; try { return fn(); } finally { mode.walls = false; } }

const GLSL_HEAD = /* glsl */ `
uniform float uFront; uniform vec2 uDir; uniform float uBand; uniform vec3 uAccent; uniform float uSign;
varying vec3 vDW;
float dh(vec3 p){ p = fract(p * 0.3183099 + .1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float dn(vec3 x){ vec3 i = floor(x), f = fract(x); f = f * f * (3. - 2. * f);
  return mix(mix(mix(dh(i), dh(i + vec3(1,0,0)), f.x), mix(dh(i + vec3(0,1,0)), dh(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(dh(i + vec3(0,0,1)), dh(i + vec3(1,0,1)), f.x), mix(dh(i + vec3(0,1,1)), dh(i + vec3(1,1,1)), f.x), f.y), f.z); }
float dsweep(vec3 w){ return dot(w.xz, uDir) + (dn(w * 1.5) * .7 + dn(w * 4.3) * .3) * 1.25 - .62; }
`;
const GLSL_DISCARD = /* glsl */ `
float dS0 = dsweep(vDW);
float dD = (dS0 - uFront) * uSign;
if (dD < 0.0) discard;
float dFw = max(fwidth(dS0), 1e-4);
float dEdge = 1.0 - smoothstep(0.0, dFw * 2.6, dD);
float dGlow = 1.0 - smoothstep(0.0, dFw * 12.0, dD);
`;

export function dissolvable(mat, glow = true, U = SH) {
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uFront = U.uFront; sh.uniforms.uDir = U.uDir; sh.uniforms.uBand = U.uBand; sh.uniforms.uAccent = U.uAccent; sh.uniforms.uSign = U.uSign;
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
const DEPTHW = dissolvable(new THREE.MeshDepthMaterial(), false, SHW);
const DEPTHG = dissolvable(new THREE.MeshDepthMaterial(), false, SHG);
const curDepth = () => (mode.walls ? DEPTHW : mode.ns === 'G' ? DEPTHG : DEPTH);

/* ---- materials ---- */
const cache = new Map();
export function clay(color, o = {}) {
  const key = (mode.walls ? 'W' : mode.ns || 'I') + (o.side || 0) + color + '|' + (o.r ?? .86) + '|' + (o.m ?? 0) + '|' + (o.cc ?? 0) + '|' + (o.e ?? 0);
  if (cache.has(key)) return cache.get(key);
  const m = new THREE.MeshPhysicalMaterial({
    color, roughness: o.r ?? .86, metalness: o.m ?? 0, clearcoat: o.cc ?? 0, clearcoatRoughness: .5,
    emissive: o.e ? new THREE.Color(color) : 0x000000, emissiveIntensity: o.e || 0,
    envMapIntensity: o.env ?? .55, side: o.side ?? THREE.FrontSide, sheen: o.sheen ?? 0, sheenRoughness: .8, sheenColor: new THREE.Color(color).lerp(new THREE.Color('#ffffff'), .35),
  });
  dissolvable(m, true, curU());
  cache.set(key, m);
  return m;
}

/* ---- modelling helpers ---- */
export function part(geo, mat, o = {}) {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = o.cast !== false; m.receiveShadow = o.rec !== false;
  m.customDepthMaterial = curDepth();
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

/* ---- merge an item's many little meshes into one mesh per material (fewer draw calls) ---- */
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
export function mergeItem(root) {
  root.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(root.matrixWorld).invert();
  const buckets = new Map(), gone = [];
  root.traverse((o) => {
    if (!o.isMesh || Array.isArray(o.material) || !o.material || o.material.transparent || o.material.isMeshBasicMaterial || o.userData.nomerge) return;
    let g = o.geometry.clone();
    g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld));
    if (!g.index) { const n = g.attributes.position.count, ix = new Uint32Array(n); for (let q = 0; q < n; q++) ix[q] = q; g.setIndex(new THREE.BufferAttribute(ix, 1)); }
    for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'normal' && k !== 'uv') g.deleteAttribute(k);
    if (!g.attributes.normal) g.computeVertexNormals();
    if (!g.attributes.uv) g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
    const id = o.material.uuid + (o.castShadow ? 'c' : 'n');
    if (!buckets.has(id)) buckets.set(id, { mat: o.material, depth: o.customDepthMaterial, cast: o.castShadow, geos: [] });
    buckets.get(id).geos.push(g); gone.push(o);
  });
  gone.forEach((o) => o.parent && o.parent.remove(o));
  buckets.forEach((b) => {
    const m = new THREE.Mesh(mergeGeometries(b.geos, false), b.mat);
    m.castShadow = b.cast; m.receiveShadow = true; m.customDepthMaterial = b.depth; m.userData.merged = true;
    root.add(m);
    b.geos.forEach((g) => g.dispose());
  });
  return root;
}

/* ---- small canvas decals (labels, stripes, prints) ---- */
export function canvasTex(w, h, draw, srgb = true) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}
export function decal(w, h, tex, o = {}) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: o.r ?? .9, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, side: o.side || THREE.FrontSide }));
  dissolvable(m.material, false, curU());
  m.userData.nomerge = true; m.castShadow = false; m.receiveShadow = true;
  return m;
}
