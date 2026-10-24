// Two kinds of sparks: surface sparks (a sweep turns an object into rising dots, driven by the sweep front),
// and a small CPU "burst" system for trails and impacts while items fly into the truck.
import { THREE } from './kit.js';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';

const GLSL_NOISE = /* glsl */ `
float dh(vec3 p){ p = fract(p * 0.3183099 + .1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float dn(vec3 x){ vec3 i = floor(x), f = fract(x); f = f * f * (3. - 2. * f);
  return mix(mix(mix(dh(i), dh(i + vec3(1,0,0)), f.x), mix(dh(i + vec3(0,1,0)), dh(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(dh(i + vec3(0,0,1)), dh(i + vec3(1,0,1)), f.x), mix(dh(i + vec3(0,1,1)), dh(i + vec3(1,1,1)), f.x), f.y), f.z); }
float dsweep(vec3 w){ return dot(w.xz, uDir) + (dn(w * 1.5) * .7 + dn(w * 4.3) * .3) * 1.25 - .62; }`;

const SURF_VERT = /* glsl */ `
uniform float uFront, uTime, uScale, uSign; uniform vec2 uDir; uniform vec3 uAccent;
attribute vec4 aR; attribute vec3 aCol;
varying vec3 vC; varying float vA;
${GLSL_NOISE}
void main(){
  float q = (uFront - dsweep(position)) * uSign / 2.4;
  if (q < 0.0 || q > 1.0) { gl_Position = vec4(2., 2., 2., 1.); gl_PointSize = 0.; vA = 0.; vC = vec3(0.); return; }
  vec3 p = position;
  p.y += q * (0.6 + aR.x * 2.8);
  p.x += (aR.y - .5) * 1.8 * q + sin(uTime * .9 + aR.w * 6.283) * .1 * q;
  p.z += (aR.z - .5) * 1.8 * q + cos(uTime * .8 + aR.x * 6.283) * .1 * q;
  vec4 mv = modelViewMatrix * vec4(p, 1.);
  gl_Position = projectionMatrix * mv;
  float sz = (.045 + aR.w * .1) * (1. - q * .4);
  gl_PointSize = sz * uScale / -mv.z;
  vA = smoothstep(0., .05, q) * (1. - smoothstep(.4, 1., q));
  vC = mix(uAccent, aCol, smoothstep(0., .45, q));
}`;
const SURF_FRAG = /* glsl */ `
varying vec3 vC; varying float vA;
void main(){
  float d = length(gl_PointCoord - .5); if (d > .5) discard;
  gl_FragColor = vec4(vC, vA * smoothstep(.5, .3, d));
  #include <colorspace_fragment>
}`;

const bb = new THREE.Box3(), sz = new THREE.Vector3(), tmp = new THREE.Vector3();

/* sample points on every mesh under `root`, in world space, and drive them with the sweep uniforms in U */
export function surfaceSparks(root, U, cap, low) {
  const metas = []; let total = 0;
  root.updateWorldMatrix(true, true);
  root.traverse((o) => {
    if (!o.isMesh || !o.material || o.material.transparent || o.material.isMeshBasicMaterial || o.geometry.type === 'PlaneGeometry' || !o.geometry.attributes.position.count) return;
    bb.setFromObject(o); bb.getSize(sz);
    const n = Math.max(6, (sz.x * sz.y + sz.y * sz.z + sz.x * sz.z) * 2 * (low ? 14 : 24));
    metas.push([o, n]); total += n;
  });
  const f = Math.min(1, cap / Math.max(1, total)), pos = [], col = [], rnd = [];
  metas.forEach(([o, n]) => {
    const cnt = Math.max(3, Math.round(n * f)), sampler = new MeshSurfaceSampler(o).build(), c = o.material.color || new THREE.Color('#888'), vc = !!o.geometry.attributes.color, cc = new THREE.Color();
    for (let i = 0; i < cnt; i++) { if (vc) sampler.sample(tmp, undefined, cc); else cc.copy(c); tmp.applyMatrix4(o.matrixWorld); pos.push(tmp.x, tmp.y, tmp.z); col.push(cc.r, cc.g, cc.b); rnd.push(Math.random(), Math.random(), Math.random(), Math.random()); }
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('aCol', new THREE.Float32BufferAttribute(col, 3)); g.setAttribute('aR', new THREE.Float32BufferAttribute(rnd, 4));
  const p = new THREE.Points(g, new THREE.ShaderMaterial({ uniforms: U, vertexShader: SURF_VERT, fragmentShader: SURF_FRAG, transparent: true, depthWrite: false }));
  p.frustumCulled = false; return p;
}

/* ---------- a tiny CPU particle burst for trails and impacts ---------- */
const BURST_VERT = /* glsl */ `
uniform float uScale; attribute float aS; attribute float aT; attribute vec3 aCol;
varying vec3 vC; varying float vA;
void main(){
  vec4 mv = modelViewMatrix * vec4(position, 1.);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = aT >= 1.0 ? 0.0 : aS * uScale / -mv.z * (1.0 - .55 * aT);
  vA = pow(1.0 - aT, .7); vC = aCol;
}`;
const BURST_FRAG = /* glsl */ `
varying vec3 vC; varying float vA;
void main(){
  float d = length(gl_PointCoord - .5); if (d > .5) discard;
  float core = smoothstep(.5, .1, d);
  gl_FragColor = vec4(mix(vC, vec3(1.), core * .5), vA * smoothstep(.5, .28, d));
  #include <colorspace_fragment>
}`;

export function makeBurst(max = 900) {
  const pos = new Float32Array(max * 3), vel = new Float32Array(max * 3), life = new Float32Array(max).fill(1), age = new Float32Array(max).fill(1), size = new Float32Array(max), t = new Float32Array(max).fill(1), col = new Float32Array(max * 3), grav = new Float32Array(max);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aS', new THREE.BufferAttribute(size, 1)); g.setAttribute('aT', new THREE.BufferAttribute(t, 1)); g.setAttribute('aCol', new THREE.BufferAttribute(col, 3));
  const U = { uScale: { value: 600 } };
  const points = new THREE.Points(g, new THREE.ShaderMaterial({ uniforms: U, vertexShader: BURST_VERT, fragmentShader: BURST_FRAG, transparent: true, depthWrite: false }));
  points.frustumCulled = false; points.renderOrder = 6;
  let head = 0; const c = new THREE.Color();
  return {
    points, U,
    emit(x, y, z, n, o = {}) {
      for (let k = 0; k < n; k++) {
        const i = head; head = (head + 1) % max;
        const sp = (o.speed ?? 1.2) * (.4 + Math.random() * .8), a = Math.random() * Math.PI * 2, e = (o.up ?? .5) + Math.random() * (o.spread ?? 1);
        pos[i * 3] = x + (Math.random() - .5) * (o.jit ?? .1); pos[i * 3 + 1] = y + (Math.random() - .5) * (o.jit ?? .1); pos[i * 3 + 2] = z + (Math.random() - .5) * (o.jit ?? .1);
        vel[i * 3] = Math.cos(a) * sp * (o.flat ?? 1) + (o.vx ?? 0); vel[i * 3 + 1] = e * sp * .8 + (o.vy ?? 0); vel[i * 3 + 2] = Math.sin(a) * sp * (o.flat ?? 1) + (o.vz ?? 0);
        life[i] = (o.life ?? .7) * (.7 + Math.random() * .6); age[i] = 0; t[i] = 0; grav[i] = o.grav ?? 1.4;
        size[i] = (o.size ?? .09) * (.6 + Math.random() * .8);
        c.set(o.col ? o.col : Math.random() < (o.white ?? .25) ? '#ffffff' : Math.random() < .5 ? '#ff5a1f' : '#ff8a4f'); col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
      }
    },
    update(dt) {
      for (let i = 0; i < max; i++) {
        if (t[i] >= 1) continue;
        age[i] += dt; t[i] = Math.min(1, age[i] / life[i]);
        const d = Math.pow(.2, dt);
        vel[i * 3] *= d; vel[i * 3 + 1] = vel[i * 3 + 1] * d - grav[i] * dt; vel[i * 3 + 2] *= d;
        pos[i * 3] += vel[i * 3] * dt; pos[i * 3 + 1] += vel[i * 3 + 1] * dt; pos[i * 3 + 2] += vel[i * 3 + 2] * dt;
      }
      g.attributes.position.needsUpdate = g.attributes.aT.needsUpdate = g.attributes.aS.needsUpdate = g.attributes.aCol.needsUpdate = true;
    },
  };
}
