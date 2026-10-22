// The hero scene: renderer, lights, camera rig, the build-in, the clear-the-room sweep and its particles.
import { THREE, SH } from './kit.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';
import { buildRoom, ROOM } from './room.js';
import { SCENES } from './scenes.js';

const ease = {
  outCubic: (t) => 1 - Math.pow(1 - t, 3),
  outBack: (t) => { const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  inOut: (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
};
const clamp01 = (x) => Math.min(1, Math.max(0, x));

const P_VERT = /* glsl */ `
uniform float uFront, uTime, uScale; uniform vec2 uDir; uniform vec3 uAccent;
attribute vec4 aR; attribute vec3 aCol;
varying vec3 vC; varying float vA;
float dh(vec3 p){ p = fract(p * 0.3183099 + .1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float dn(vec3 x){ vec3 i = floor(x), f = fract(x); f = f * f * (3. - 2. * f);
  return mix(mix(mix(dh(i), dh(i + vec3(1,0,0)), f.x), mix(dh(i + vec3(0,1,0)), dh(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(dh(i + vec3(0,0,1)), dh(i + vec3(1,0,1)), f.x), mix(dh(i + vec3(0,1,1)), dh(i + vec3(1,1,1)), f.x), f.y), f.z); }
float dsweep(vec3 w){ return dot(w.xz, uDir) + (dn(w * 1.5) * .7 + dn(w * 4.3) * .3) * 1.25 - .62; }
void main(){
  float q = (uFront - dsweep(position)) / 2.4;
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
  const lowPower = !!opt.low;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance', preserveDrawingBuffer: !!opt.preserve });
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = opt.exposure ?? .92;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.03).texture;
  scene.environmentIntensity = opt.env ?? .4;
  pm.dispose();

  const camera = new THREE.PerspectiveCamera(opt.fov ?? 21, 1, 1, 120);

  /* light */
  const key = new THREE.DirectionalLight('#fff3e6', opt.key ?? 3.1);
  key.position.set(8, 12.5, 8);
  key.castShadow = true;
  key.shadow.mapSize.set(lowPower ? 1024 : 2048, lowPower ? 1024 : 2048);
  const sc = key.shadow.camera; sc.left = -8; sc.right = 8; sc.top = 8; sc.bottom = -8; sc.near = 2; sc.far = 40;
  key.shadow.bias = -0.0003; key.shadow.normalBias = .035; key.shadow.radius = 5;
  scene.add(key);
  const hemi = new THREE.HemisphereLight('#f2f6ff', '#d8cbb8', .55); scene.add(hemi);
  const fill = new THREE.DirectionalLight('#dfe9ff', .55); fill.position.set(-8, 5, 9); scene.add(fill);

  /* the world */
  const world = new THREE.Group(); scene.add(world);
  const built = opt.scene && SCENES[opt.scene] ? SCENES[opt.scene]() : buildRoom();
  const { shell, items } = built, loadMode = !!built.loadMode;
  items.forEach((it, i) => { if (it.userData.delay == null) it.userData.delay = i * .05; });
  if (opt.scene) opt.frame = opt.frame || (() => ({ zoom: opt.zoom ?? 1.7, x: 0, y: opt.fy ?? .035 }));
  world.add(shell);
  items.forEach((it) => world.add(it));
  // a faint shadow the whole diorama throws on the page
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.ShadowMaterial({ opacity: .16 }));
  ground.rotation.x = -Math.PI / 2; ground.position.y = -ROOM.slab - .9; ground.receiveShadow = true; world.add(ground);

  /* particles sampled from the items' own surfaces */
  world.updateMatrixWorld(true);
  if (loadMode) items.forEach((it) => { it.userData.v = 0; it.visible = false; });
  const pos = [], col = [], rnd = [];
  const tmp = new THREE.Vector3(), bb = new THREE.Box3(), sz = new THREE.Vector3();
  if (!loadMode) items.forEach((it) => it.traverse((o) => {
    if (!o.isMesh || !o.material || o.material.isMeshBasicMaterial || o.geometry.type === 'PlaneGeometry') return;
    bb.setFromObject(o); bb.getSize(sz);
    const area = 2 * (sz.x * sz.y + sz.y * sz.z + sz.x * sz.z);
    const n = Math.min(420, Math.max(6, Math.round(area * (lowPower ? 22 : 40))));
    const sampler = new MeshSurfaceSampler(o).build();
    const c = o.material.color || new THREE.Color('#888');
    for (let i = 0; i < n; i++) {
      sampler.sample(tmp); tmp.applyMatrix4(o.matrixWorld);
      pos.push(tmp.x, tmp.y, tmp.z); col.push(c.r, c.g, c.b); rnd.push(Math.random(), Math.random(), Math.random(), Math.random());
    }
  }));
  const bbc = new THREE.Vector3();
  items.forEach((it) => { bb.setFromObject(it); bb.getCenter(bbc); it.userData.s = bbc.x * SH.uDir.value.x + bbc.z * SH.uDir.value.y; });
  const pg = new THREE.BufferGeometry();
  pg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  pg.setAttribute('aCol', new THREE.Float32BufferAttribute(col, 3));
  pg.setAttribute('aR', new THREE.Float32BufferAttribute(rnd, 4));
  const pu = { uFront: SH.uFront, uDir: SH.uDir, uAccent: SH.uAccent, uTime: { value: 0 }, uScale: { value: 600 } };
  const points = new THREE.Points(pg, new THREE.ShaderMaterial({ uniforms: pu, vertexShader: P_VERT, fragmentShader: P_FRAG, transparent: true, depthWrite: false }));
  points.frustumCulled = false; world.add(points);

  /* a faint sheet of light riding the front, so the sweep reads as one gesture */
  const sheetTex = (() => { const c = document.createElement('canvas'); c.width = 8; c.height = 256; const g = c.getContext('2d'); const gr = g.createLinearGradient(0, 256, 0, 0); gr.addColorStop(0, 'rgba(255,255,255,.95)'); gr.addColorStop(.35, 'rgba(255,255,255,.25)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 8, 256); const t = new THREE.CanvasTexture(c); return t; })();
  const sheet = new THREE.Mesh(new THREE.PlaneGeometry(1, 4.2), new THREE.MeshBasicMaterial({ map: sheetTex, color: '#ff5a1f', transparent: true, opacity: .34, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }));
  sheet.renderOrder = 5; sheet.visible = false; world.add(sheet);

  /* ---- state ---- */
  const S = { load: -1, p: 0, ps: 0, intro: 0, introOn: false, t: 0, w: 1, h: 1, px: 0, py: 0, fx: 0, fy: 0, zoom: 1, yaw: 0, pitch: 0, alive: true, last: 0 };
  const cam = { az: opt.az ?? 41, el: opt.el ?? 31, dist: opt.dist ?? 40, tx: 0, ty: 1.15, tz: 0 };
  const FRONT0 = -7.6, FRONT1 = 7.6;

  function applyIntro(t) {
    // slab + walls rise
    const a = ease.outCubic(clamp01(t / 1.1));
    shell.position.y = (1 - a) * -1.4; shell.scale.setScalar(.94 + .06 * a);
    if (loadMode) return;
    items.forEach((it) => {
      const k = clamp01((t - .55 - it.userData.delay * 1.25) / .7);
      const e = ease.outBack(k);
      it.visible = k > 0;
      it.scale.setScalar(Math.max(.0001, e));
      it.position.y = (1 - ease.outCubic(k)) * 2.2;
      it.children.forEach((c) => { if (c.material) c.material.opacity = (c.material.userData.base ??= c.material.opacity) * k; });
    });
  }
  applyIntro(0);
  if (!loadMode) items.forEach((it) => { it.visible = false; });

  function layout() {
    const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
    S.w = w; S.h = h;
    const dpr = Math.min(window.devicePixelRatio || 1, opt.maxDpr ?? (lowPower ? 1.6 : 2));
    renderer.setPixelRatio(dpr); renderer.setSize(w, h, false);
    camera.aspect = w / h;
    pu.uScale.value = (h * dpr) / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2));
    // wide: room sits right of the headline; tall: room sits below it
    const portrait = h > w * 1.02;
    const f = opt.frame ? opt.frame(w, h, portrait) : null;
    if (f) { S.zoom = f.zoom; S.fx = f.x; S.fy = f.y; }
    else if (portrait) { S.zoom = Math.min(1.9, (w / h) * 3.0); S.fx = 0; S.fy = .13; }
    else { S.zoom = Math.min(1.25, (h / w) * 2.0); S.fx = .2; S.fy = .02; }
    camera.zoom = S.zoom;
    camera.setViewOffset(w, h, -S.fx * w, -S.fy * h, w, h);
    camera.updateProjectionMatrix();
  }

  function placeCamera() {
    const az = THREE.MathUtils.degToRad(cam.az + S.yaw * 5 + S.ps * 7);
    const el = THREE.MathUtils.degToRad(cam.el + S.pitch * 2.5 - S.ps * 1.5);
    const d = cam.dist - S.ps * .8;
    camera.position.set(Math.cos(el) * Math.sin(az) * d, Math.sin(el) * d + cam.ty, Math.cos(el) * Math.cos(az) * d);
    camera.lookAt(cam.tx, cam.ty, cam.tz);
  }

  function frame(now) {
    if (!S.alive) return;
    const dt = Math.min(.05, (now - (S.last || now)) / 1000); S.last = now; S.t += dt;
    if (S.introOn && S.intro < 3) { S.intro += dt; applyIntro(S.intro); }
    if (loadMode) items.forEach((it) => {
      const d = it.userData, t = S.load >= d.stop ? 1 : 0;
      d.v += (t - d.v) * (1 - Math.exp(-dt * (t ? 7 : 10)));
      if (Math.abs(t - d.v) < .003) d.v = t;
      it.visible = d.v > .004;
      it.scale.setScalar(Math.max(.001, ease.outBack(clamp01(d.v))));
      it.position.y = (1 - clamp01(d.v)) * 1.4;
    });
    S.ps += (S.p - S.ps) * (1 - Math.exp(-dt * 9));
    if (Math.abs(S.p - S.ps) < .0002) S.ps = S.p;
    const sp = S.ps;
    SH.uFront.value = THREE.MathUtils.lerp(FRONT0, FRONT1, ease.inOut(clamp01(sp)));
    {
      const f = SH.uFront.value, on = sp > .003 && sp < .997;
      sheet.visible = on;
      if (on) {
        // the plane s = front, offset a little ahead of the noisy edge; fades in and out at both ends
        sheet.position.set(f * SH.uDir.value.x + .0, 2.1, f * SH.uDir.value.y);
        sheet.rotation.set(0, Math.atan2(SH.uDir.value.x, SH.uDir.value.y) + Math.PI / 2, 0);
        sheet.scale.x = Math.max(.01, 2 * (ROOM.half * 1.4142 - Math.abs(f)) * .97);
        sheet.material.opacity = .34 * Math.min(1, sp / .06, (1 - sp) / .06);
      }
    }
    pu.uTime.value = S.t;
    S.yaw += ((opt.static ? 0 : (S.px + Math.sin(S.t * .22) * .35)) - S.yaw) * (1 - Math.exp(-dt * 2));
    S.pitch += ((opt.static ? 0 : (S.py + Math.sin(S.t * .17) * .2)) - S.pitch) * (1 - Math.exp(-dt * 2));
    placeCamera();
    renderer.render(scene, camera);
  }

  /* public */
  const api = {
    renderer, scene, camera, state: S, items,
    resize: layout,
    set(p) { S.p = clamp01(p); },
    setLoad(i) { S.load = i; },
    setNow(p) { S.p = S.ps = clamp01(p); },
    play() { S.introOn = true; },
    introAt(t) { S.introOn = false; S.intro = t; applyIntro(t); },
    introNow() { S.introOn = true; S.intro = 3; applyIntro(3); },
    pointer(x, y) { S.px = x; S.py = y; },
    frame,
    left() { const f = SH.uFront.value; return items.reduce((n, it) => n + (it.userData.s > f ? 1 : 0), 0); },
    destroy() { S.alive = false; renderer.dispose(); },
  };
  layout();
  return api;
}
