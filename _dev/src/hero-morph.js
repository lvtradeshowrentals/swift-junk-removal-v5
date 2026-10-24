// The hero: one plinth, three scenes. Each scene builds out of sparks, holds, clears in a sweep of light,
// then the floor re-paints in a ring, the walls change, and the next scene materialises.
import { THREE, SH, SHW, mergeItem } from './kit.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';
import { makeStage, SLAB } from './stage.js';
import { buildHome } from './scene-home.js';
import { buildYard } from './scene-yard.js';
import { buildSite } from './scene-site.js';

const ease = {
  outCubic: (t) => 1 - Math.pow(1 - t, 3),
  inOut: (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  inOutS: (t) => t * t * (3 - 2 * t),
  lin: (t) => t,
};
const lerp = (a, b, t) => a + (b - a) * t;
const F0 = -7.7, F1 = 7.7, FEND = 8.6;

const P_VERT = /* glsl */ `
uniform float uFront, uTime, uScale, uSign; uniform vec2 uDir; uniform vec3 uAccent;
attribute vec4 aR; attribute vec3 aCol;
varying vec3 vC; varying float vA;
float dh(vec3 p){ p = fract(p * 0.3183099 + .1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float dn(vec3 x){ vec3 i = floor(x), f = fract(x); f = f * f * (3. - 2. * f);
  return mix(mix(mix(dh(i), dh(i + vec3(1,0,0)), f.x), mix(dh(i + vec3(0,1,0)), dh(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(dh(i + vec3(0,0,1)), dh(i + vec3(1,0,1)), f.x), mix(dh(i + vec3(0,1,1)), dh(i + vec3(1,1,1)), f.x), f.y), f.z); }
float dsweep(vec3 w){ return dot(w.xz, uDir) + (dn(w * 1.5) * .7 + dn(w * 4.3) * .3) * 1.25 - .62; }
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
const P_FRAG = /* glsl */ `
varying vec3 vC; varying float vA;
void main(){
  float d = length(gl_PointCoord - .5);
  if (d > .5) discard;
  gl_FragColor = vec4(vC, vA * smoothstep(.5, .3, d));
  #include <colorspace_fragment>
}`;

export function createHero(canvas, opt = {}) {
  const low = !!opt.low;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance', preserveDrawingBuffer: !!opt.preserve });
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = opt.exposure ?? .92;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.03).texture; scene.environmentIntensity = opt.env ?? .4; pm.dispose();
  const camera = new THREE.PerspectiveCamera(opt.fov ?? 21, 1, 1, 140);

  const key = new THREE.DirectionalLight('#fff3e6', opt.key ?? 3.1);
  key.position.set(8, 12.5, 8); key.castShadow = true; key.shadow.mapSize.set(low ? 1024 : 2048, low ? 1024 : 2048);
  const sc = key.shadow.camera; sc.left = -8; sc.right = 8; sc.top = 8; sc.bottom = -8; sc.near = 2; sc.far = 40;
  key.shadow.bias = -0.0003; key.shadow.normalBias = .035; key.shadow.radius = 5;
  scene.add(key);
  scene.add(new THREE.HemisphereLight('#f2f6ff', '#d8cbb8', .55));
  const fill = new THREE.DirectionalLight('#dfe9ff', .55); fill.position.set(-8, 5, 9); scene.add(fill);

  const world = new THREE.Group(); scene.add(world);
  const stage = makeStage(); world.add(stage.group);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.ShadowMaterial({ opacity: .16 }));
  ground.rotation.x = -Math.PI / 2; ground.position.y = -SLAB.thick - .9; ground.receiveShadow = true; world.add(ground);

  /* the light sheet that rides the front */
  const sheetTex = (() => { const c = document.createElement('canvas'); c.width = 8; c.height = 256; const g = c.getContext('2d'); const gr = g.createLinearGradient(0, 256, 0, 0); gr.addColorStop(0, 'rgba(255,255,255,.95)'); gr.addColorStop(.35, 'rgba(255,255,255,.25)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 8, 256); return new THREE.CanvasTexture(c); })();
  const sheet = new THREE.Mesh(new THREE.PlaneGeometry(1, 4.2), new THREE.MeshBasicMaterial({ map: sheetTex, color: '#ff5a1f', transparent: true, opacity: .34, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }));
  sheet.renderOrder = 5; sheet.visible = false; world.add(sheet);

  const BUILDERS = [buildHome, buildYard, buildSite];
  const scenes = [];
  const pu = (U) => ({ uFront: U.uFront, uDir: U.uDir, uAccent: U.uAccent, uSign: U.uSign, uTime: { value: 0 }, uScale: { value: 600 } });
  const PU = [pu(SH), pu(SHW)];
  const bb = new THREE.Box3(), sz = new THREE.Vector3(), tmp = new THREE.Vector3(), cen = new THREE.Vector3();

  function particles(root, U, cap) {
    const metas = []; let total = 0;
    root.traverse((o) => {
      if (!o.isMesh || !o.material || o.material.transparent || o.material.isMeshBasicMaterial || o.geometry.type === 'PlaneGeometry') return;
      bb.setFromObject(o); bb.getSize(sz);
      const n = Math.max(6, (sz.x * sz.y + sz.y * sz.z + sz.x * sz.z) * 2 * (low ? 16 : 28));
      metas.push([o, n]); total += n;
    });
    const f = Math.min(1, cap / Math.max(1, total)), pos = [], col = [], rnd = [];
    metas.forEach(([o, n]) => {
      if (!o.geometry.attributes.position.count) return;
      const cnt = Math.max(4, Math.round(n * f)), sampler = new MeshSurfaceSampler(o).build(), c = o.material.color || new THREE.Color('#888');
      for (let i = 0; i < cnt; i++) { sampler.sample(tmp); tmp.applyMatrix4(o.matrixWorld); pos.push(tmp.x, tmp.y, tmp.z); col.push(c.r, c.g, c.b); rnd.push(Math.random(), Math.random(), Math.random(), Math.random()); }
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('aCol', new THREE.Float32BufferAttribute(col, 3)); g.setAttribute('aR', new THREE.Float32BufferAttribute(rnd, 4));
    const p = new THREE.Points(g, new THREE.ShaderMaterial({ uniforms: U, vertexShader: P_VERT, fragmentShader: P_FRAG, transparent: true, depthWrite: false }));
    p.frustumCulled = false; return p;
  }

  /* a scene is made in three steps (build, merge, particles + floor). ensure() does them at once;
     prepare() spreads them over frames so a phone never freezes in the middle of an animation. */
  const parts = [];
  const step1 = (i) => { const s = BUILDERS[i](); s.group = new THREE.Group(); s.group.visible = false; world.add(s.group); s.itemsGroup = new THREE.Group(); s.group.add(s.walls, s.itemsGroup); return s; };
  const step2 = (s) => { s.items.forEach((it) => { mergeItem(it); s.itemsGroup.add(it); }); };
  const step3 = (s, i) => {
    world.updateMatrixWorld(true);
    s.items.forEach((it) => { bb.setFromObject(it); bb.getCenter(cen); it.userData.s = cen.x * SH.uDir.value.x + cen.z * SH.uDir.value.y; });
    s.group.add(particles(s.itemsGroup, PU[0], low ? 5200 : 11000), particles(s.walls, PU[1], low ? 2600 : 5200));
    s.floorTex = s.floor(); renderer.initTexture(s.floorTex);
    scenes[i] = s;
  };
  function ensure(i) {
    if (scenes[i]) return scenes[i];
    const s = parts[i] || step1(i); parts[i] = s;
    if (!s.merged) { step2(s); s.merged = true; }
    step3(s, i); return s;
  }
  const nextFrame = () => new Promise((r) => requestAnimationFrame(() => setTimeout(r, 0)));
  const preparing = [];
  function prepare(i) {
    if (scenes[i]) return Promise.resolve(scenes[i]);
    if (preparing[i]) return preparing[i];
    preparing[i] = (async () => {
      await nextFrame(); if (scenes[i]) return scenes[i];
      parts[i] = parts[i] || step1(i); await nextFrame(); if (scenes[i]) return scenes[i];
      if (!parts[i].merged) {
        const st = parts[i], its = st.items;
        for (let k = 0; k < its.length; k += 5) { its.slice(k, k + 5).forEach((it) => { mergeItem(it); st.itemsGroup.add(it); }); await nextFrame(); if (scenes[i]) return scenes[i]; }
        st.merged = true;
      }
      step3(parts[i], i); return scenes[i];
    })();
    return preparing[i];
  }

  /* ---- state + a tiny tween scheduler ---- */
  const S = { w: 1, h: 1, px: 0, py: 0, fx: 0, fy: 0, zoom: 1, yaw: 0, pitch: 0, t: 0, last: 0, alive: true, whoosh: 0, rise: 0, sweep: 0, sweepKind: 0 };
  let cur = 0, gen = 0, itemsState = 'absent';
  const tasks = [];
  const tween = (dur, fn, ez = ease.lin) => new Promise((res) => { tasks.push({ t: 0, dur: Math.max(.001, dur), fn, ez, res }); });
  const sleep = (s) => tween(s, () => {});
  const emit = (e) => { if (opt.onEvent) opt.onEvent(e); };

  const setStatic = (U, present) => { U.uSign.value = present ? -1 : 1; U.uFront.value = FEND; };
  async function sweepItems(sign, dur) {
    SH.uSign.value = sign; SH.uFront.value = F0 - .01; S.sweep = 1; S.sweepKind = 0; itemsState = 'mid';
    await tween(dur, (k) => { SH.uFront.value = lerp(F0, F1, k); }, ease.inOut);
    S.sweep = 0; SH.uFront.value = FEND; itemsState = sign < 0 ? 'present' : 'absent';
  }
  async function sweepWalls(sign, dur) {
    SHW.uSign.value = sign; SHW.uFront.value = F0 - .01; S.sweep = 1; S.sweepKind = 1;
    await tween(dur, (k) => { SHW.uFront.value = lerp(F0, F1, k); }, ease.inOut);
    S.sweep = 0; SHW.uFront.value = FEND;
  }
  function showScene(i) { scenes.forEach((s, k) => { if (s) s.group.visible = k === i; }); cur = i; }
  const announce = (i) => { const s = scenes[i]; emit({ type: 'scene', index: i, label: s.label, noun: s.noun, total: s.items.length }); };

  async function morph(from, to, g) {
    await prepare(to); if (g !== gen) return;
    const A = scenes[from], B = scenes[to];
    stage.next(B.floorTex);
    emit({ type: 'phase', name: 'morph', index: to });
    const ring = tween(2.0, (k) => { stage.ring(lerp(0, 7.0, k)); }, ease.inOutS);
    const whoosh = tween(2.6, (k) => { S.whoosh = Math.sin(k * Math.PI); });
    await sweepWalls(1, .95); if (g !== gen) return;
    A.group.visible = false; showScene(to); setStatic(SH, false); SHW.uSign.value = -1; SHW.uFront.value = F0 - .01;
    announce(to);
    await sweepWalls(-1, .95); if (g !== gen) return;
    await ring; if (g !== gen) return; stage.commit();
    await whoosh;
  }
  async function runFrom(i, g) {
    for (let k = i; k < BUILDERS.length; k++) {
      await prepare(k); if (g !== gen) return;
      announce(k); emit({ type: 'phase', name: 'build', index: k });
      await sweepItems(-1, 2.3); if (g !== gen) return;
      emit({ type: 'phase', name: 'hold', index: k });
      if (k + 1 < BUILDERS.length) prepare(k + 1);
      await sleep(2.8); if (g !== gen) return;
      emit({ type: 'phase', name: 'clear', index: k });
      await sweepItems(1, 2.9); if (g !== gen) return;
      await sleep(.25); if (g !== gen) return;
      if (k < BUILDERS.length - 1) { await morph(k, k + 1, g); if (g !== gen) return; }
      else { await morph(k, 0, g); if (g !== gen) return; emit({ type: 'phase', name: 'done', index: 0 }); }
    }
  }
  async function start() {
    const g = ++gen, s = ensure(0);
    stage.setFloor(s.floorTex); showScene(0); setStatic(SH, false); SHW.uSign.value = -1; SHW.uFront.value = F0 - .01;
    announce(0); S.rise = 0;
    await tween(1.1, (k) => { S.rise = k; }, ease.outCubic); if (g !== gen) return;
    await sweepWalls(-1, 1.2); if (g !== gen) return;
    await runFrom(0, g);
  }
  function jumpNow(i, empty) {
    gen++; tasks.length = 0; S.whoosh = 0; S.rise = 1; S.sweep = 0;
    const s = ensure(i); stage.setFloor(s.floorTex); stage.ring(0); showScene(i);
    setStatic(SH, !empty); setStatic(SHW, true); itemsState = empty ? 'absent' : 'present';
    announce(i); emit({ type: 'phase', name: 'hold', index: i });
  }
  function jump(i) {
    if (opt.static) return jumpNow(i);
    const g = ++gen; tasks.length = 0; S.whoosh = 0; S.sweep = 0; stage.ring(0); S.rise = 1;
    (async () => {
      const from = cur;
      if (itemsState !== 'absent') { emit({ type: 'phase', name: 'clear', index: from }); await sweepItems(1, 1.2); if (g !== gen) return; }
      if (i !== from) { await morph(from, i, g); if (g !== gen) return; }
      await runFrom(i, g);
    })();
  }

  /* ---- sizing, framing, camera ---- */
  function layout() {
    const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1; S.w = w; S.h = h;
    const dpr = Math.min(window.devicePixelRatio || 1, opt.maxDpr ?? (low ? 1.6 : 2));
    renderer.setPixelRatio(dpr); renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const scale = (h * dpr) / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2));
    PU.forEach((u) => { u.uScale.value = scale; });
    const f = opt.frame ? opt.frame(w, h, h > w * 1.02) : { zoom: 1, x: 0, y: 0 };
    S.zoom = f.zoom; S.fx = f.x; S.fy = f.y;
    camera.zoom = S.zoom; camera.setViewOffset(w, h, -S.fx * w, -S.fy * h, w, h); camera.updateProjectionMatrix();
  }
  function placeCamera() {
    const c = (scenes[cur] && scenes[cur].cam) || { az: 41, el: 31, dist: 40, ty: 1.15 };
    const az = THREE.MathUtils.degToRad(c.az + S.yaw * 5 + S.whoosh * 16), el = THREE.MathUtils.degToRad(c.el + S.pitch * 2.5 - S.whoosh * 4), d = c.dist + S.whoosh * 4.5;
    camera.position.set(Math.cos(el) * Math.sin(az) * d, Math.sin(el) * d + c.ty, Math.cos(el) * Math.cos(az) * d);
    camera.lookAt(0, c.ty, 0);
  }
  function stepTasks(dt) {
    for (let i = tasks.length - 1; i >= 0; i--) {
      const k = tasks[i]; k.t += dt; const u = Math.min(1, k.t / k.dur); k.fn(k.ez(u));
      if (u >= 1) { tasks.splice(i, 1); k.res(); }
    }
  }
  function frame(now) {
    if (!S.alive) return;
    const dt = Math.min(.05, (now - (S.last || now)) / 1000); S.last = now; S.t += dt;
    stepTasks(dt);
    PU.forEach((u) => { u.uTime.value = S.t; });
    stage.group.position.y = (1 - S.rise) * -1.4; stage.group.scale.setScalar(.94 + .06 * S.rise);
    const U = S.sweepKind ? SHW : SH, f = U.uFront.value, on = S.sweep && f > F0 + .02 && f < F1 - .02;
    sheet.visible = !!on;
    if (on) {
      sheet.position.set(f * SH.uDir.value.x, 2.1, f * SH.uDir.value.y);
      sheet.rotation.set(0, Math.atan2(SH.uDir.value.x, SH.uDir.value.y) + Math.PI / 2, 0);
      sheet.scale.set(Math.max(.01, 2 * (SLAB.half * 1.4142 - Math.abs(f)) * .97), 1, 1);
      sheet.material.opacity = .34 * Math.min(1, (f - F0) / 1.2, (F1 - f) / 1.2);
    }
    S.yaw += ((opt.static ? 0 : (S.px + Math.sin(S.t * .22) * .35)) - S.yaw) * (1 - Math.exp(-dt * 2));
    S.pitch += ((opt.static ? 0 : (S.py + Math.sin(S.t * .17) * .2)) - S.pitch) * (1 - Math.exp(-dt * 2));
    placeCamera(); renderer.render(scene, camera);
  }

  const api = {
    renderer, scene, camera, state: S,
    resize: layout, frame, pointer(x, y) { S.px = x; S.py = y; },
    start, jump, jumpNow, ensure, prepare,
    async advance(sec) { for (let t = 0; t < sec; t += .033) { stepTasks(.033); S.t += .033; for (let k = 0; k < 4; k++) await Promise.resolve(); } },
    count() {
      const s = scenes[cur]; if (!s) return { n: 0, total: 0 };
      const f = SH.uFront.value, sg = SH.uSign.value;
      return { n: s.items.reduce((n, it) => n + ((sg > 0 ? it.userData.s >= f : it.userData.s <= f) ? 1 : 0), 0), total: s.items.length };
    },
    get current() { return cur; },
    destroy() { S.alive = false; renderer.dispose(); },
  };
  layout();
  // build the first scene now, and the other two while the first one plays
  const first = ensure(0); stage.setFloor(first.floorTex); showScene(0); setStatic(SH, false); SHW.uSign.value = -1; SHW.uFront.value = F0 - .01;
  { sheet.visible = true; renderer.compile(scene, camera); sheet.visible = false; }
  return api;
}
