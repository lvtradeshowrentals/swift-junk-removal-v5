// The hero: a Las Vegas curb. The set builds in a sweep of light, a Swift truck pulls up, the pile lifts into it
// piece by piece along arcs of orange sparks, the door rolls down, the truck leaves, and the driveway is clean.
import { THREE, SH, SHW, mergeColored as mergeItem } from './kit.js';
import { makeStudio } from './studio.js';
import { makeCurbStage } from './curb-stage.js';
import { buildCurbSet, SET } from './curb-walls.js';
import { buildPile } from './curb-pile.js';
import { buildBoxTruck } from './boxtruck.js';
import { surfaceSparks, makeBurst } from './sparks.js';

const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const E = {
  lin: (t) => t,
  inOut: (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  smooth: (t) => t * t * (3 - 2 * t),
  outCubic: (t) => 1 - Math.pow(1 - t, 3),
  outQuart: (t) => 1 - Math.pow(1 - t, 4),
  inCubic: (t) => t * t * t,
  inQuad: (t) => t * t,
  outBack: (t) => { const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
};
const F0 = -7.9, F1 = 7.9, FEND = 8.8;
const LANE = SET.laneZ, X_REST = -.3, X_FAR = 24;

export function createHero(canvas, opt = {}) {
  const low = !!opt.low;
  const st = makeStudio(canvas, { low, preserve: opt.preserve, exposure: opt.exposure, shadowR: 11 });
  const { renderer, scene, camera } = st;
  const world = new THREE.Group(); scene.add(world);
  const font = opt.font || '"Funnel Display", system-ui, sans-serif';

  /* ---- the world ---- */
  const stage = makeCurbStage(); world.add(stage.group);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(90, 90), new THREE.ShadowMaterial({ opacity: .15 }));
  ground.rotation.x = -Math.PI / 2; ground.position.y = -stage.thick - .9; ground.receiveShadow = true; world.add(ground);
  const set = buildCurbSet(); mergeItem(set); world.add(set);

  const pileGroup = new THREE.Group(); world.add(pileGroup);
  /* a glowing outline hull: the same geometry pushed out along its normals, drawn behind the piece */
  const outlineMat = () => new THREE.ShaderMaterial({
    uniforms: { uW: { value: .05 }, uO: { value: 0 }, uC: { value: new THREE.Color('#ff5a1f') } },
    vertexShader: 'uniform float uW; void main(){ vec3 p = position + normalize(normal) * uW; gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }',
    fragmentShader: 'uniform float uO; uniform vec3 uC; void main(){ gl_FragColor = vec4(uC, uO); }',
    side: THREE.BackSide, transparent: true, depthWrite: false,
  });
  const items = buildPile().map((root, i) => {
    mergeItem(root);
    const bb = new THREE.Box3().setFromObject(root), c = bb.getCenter(new THREE.Vector3()), size = bb.getSize(new THREE.Vector3());
    const holder = new THREE.Group(); holder.position.copy(c); root.position.sub(c); holder.add(root); pileGroup.add(holder);
    const om = outlineMat(), hulls = [];
    root.children.slice().forEach((m) => { if (m.isMesh && m.userData.merged) { const h = new THREE.Mesh(m.geometry, om); h.renderOrder = 3; h.visible = false; root.add(h); hulls.push(h); } });
    return { i, name: root.userData.name, holder, root, c, size, maxDim: Math.max(size.x, size.y, size.z), landed: false, flying: false, om, hulls };
  });
  world.updateMatrixWorld(true);

  const truck = buildBoxTruck(font); truck.root.position.set(X_FAR, 0, LANE); truck.root.visible = false; truck.door(0); world.add(truck.root);

  /* ---- light sheet that rides each sweep ---- */
  const sheetTex = (() => { const c = document.createElement('canvas'); c.width = 8; c.height = 256; const g = c.getContext('2d'); const gr = g.createLinearGradient(0, 256, 0, 0); gr.addColorStop(0, 'rgba(255,255,255,.95)'); gr.addColorStop(.35, 'rgba(255,255,255,.25)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 8, 256); return new THREE.CanvasTexture(c); })();
  const sheet = new THREE.Mesh(new THREE.PlaneGeometry(1, 4.6), new THREE.MeshBasicMaterial({ map: sheetTex, color: '#ff5a1f', transparent: true, opacity: .34, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }));
  sheet.renderOrder = 5; sheet.visible = false; world.add(sheet);
  // the final "swept clean" pass: a pale band that crosses the driveway
  const clean = new THREE.Mesh(new THREE.PlaneGeometry(14, 1.1), new THREE.MeshBasicMaterial({ map: sheetTex, color: '#ffffff', transparent: true, opacity: .0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }));
  clean.rotation.x = -Math.PI / 2; clean.position.y = .03; clean.renderOrder = 4; clean.visible = false; world.add(clean);

  /* ---- energy halos that ride each piece, and a flare at the rear door ---- */
  const haloTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 2, 64, 64, 62); gr.addColorStop(0, 'rgba(255,200,150,.95)'); gr.addColorStop(.25, 'rgba(255,110,50,.55)'); gr.addColorStop(1, 'rgba(255,90,31,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); })();
  const haloM = () => new THREE.SpriteMaterial({ map: haloTex, color: '#ffffff', transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
  const halos = items.map(() => { const s = new THREE.Sprite(haloM()); s.renderOrder = 7; s.visible = false; world.add(s); return s; });
  const flareTex = (() => { const c = document.createElement('canvas'); c.width = 64; c.height = 256; const g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 64, 0); gr.addColorStop(0, 'rgba(255,120,50,0)'); gr.addColorStop(.55, 'rgba(255,150,80,.55)'); gr.addColorStop(1, 'rgba(255,230,200,.95)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 256); const v = g.createLinearGradient(0, 0, 0, 256); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(.2, 'rgba(0,0,0,1)'); v.addColorStop(.8, 'rgba(0,0,0,1)'); v.addColorStop(1, 'rgba(0,0,0,0)'); g.globalCompositeOperation = 'destination-in'; g.fillStyle = v; g.fillRect(0, 0, 64, 256); return new THREE.CanvasTexture(c); })();
  const flare = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.3), new THREE.MeshBasicMaterial({ map: flareTex, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }));
  flare.rotation.y = Math.PI / 2; flare.renderOrder = 7; flare.visible = false; world.add(flare);

  /* ---- sparks ---- */
  const pu = (U) => ({ uFront: U.uFront, uDir: U.uDir, uAccent: U.uAccent, uSign: U.uSign, uTime: { value: 0 }, uScale: { value: 600 } });
  const PU = [pu(SH), pu(SHW)];
  const sparkItems = surfaceSparks(pileGroup, PU[0], low ? 5200 : 11000, low), sparkSet = surfaceSparks(set, PU[1], low ? 3200 : 6500, low);
  world.add(sparkItems, sparkSet);
  const burst = makeBurst(low ? 520 : 900); world.add(burst.points);

  /* ---- state + a tiny tween scheduler ---- */
  const S = { w: 1, h: 1, px: 0, py: 0, fx: 0, fy: 0, zoom: 1, yaw: 0, pitch: 0, t: 0, last: 0, alive: true, rise: 0, focus: 0, sweep: 0, sweepKind: 0, gen: 0, landed: 0, ty: 0, vy: 0, pitchT: 0, lastTX: X_FAR, tv: 0, ta: 0, cleanOn: 0 };
  const tasks = [];
  const tween = (dur, fn, ez = E.lin, delay = 0) => new Promise((res) => { tasks.push({ t: -delay, dur: Math.max(.001, dur), fn, ez, res }); });
  const sleep = (s) => tween(s, () => {});
  const emit = (e) => { if (opt.onEvent) opt.onEvent(e); };
  const total = items.length;
  let flareK = 0;
  let wheelAngle = 0;

  const setStatic = (U, present) => { U.uSign.value = present ? -1 : 1; U.uFront.value = FEND; };
  const hideAll = () => { SH.uSign.value = -1; SH.uFront.value = F0 - .01; SHW.uSign.value = -1; SHW.uFront.value = F0 - .01; };

  async function sweep(U, kind, dur, delay = 0) {
    await sleep(delay);
    U.uSign.value = -1; U.uFront.value = F0 - .01; S.sweep = 1; S.sweepKind = kind;
    await tween(dur, (k) => { U.uFront.value = lerp(F0, F1, k); }, E.inOut);
    S.sweep = 0; U.uFront.value = FEND;
  }

  /* ---- the truck's movement ---- */
  function placeTruck(x) {
    const dx = truck.root.position.x - x; truck.root.position.x = x;
    wheelAngle += dx / .55; truck.wheels.forEach((w) => { w.rotation.z = wheelAngle; });
  }
  async function truckArrive(g) {
    truck.root.visible = true; truck.brake(false); truck.door(0); truck.root.position.x = X_FAR; wheelAngle = 0;
    emit({ type: 'phase', name: 'arrive' });
    const brake = tween(.8, () => {}, E.lin, 1.9).then(() => truck.brake(true));
    await tween(2.7, (k) => placeTruck(lerp(X_FAR, X_REST, E.outQuart(k))), E.lin);
    await brake;
  }
  async function truckLeave(g) {
    emit({ type: 'phase', name: 'leave' });
    truck.brake(false);
    await tween(2.5, (k) => placeTruck(lerp(X_REST, -X_FAR - 4, E.inCubic(k))), E.lin);
    truck.root.visible = false;
  }

  /* ---- an item's flight into the truck ---- */
  const sorted = ['Fridge', 'Washer', 'Mattress', 'Drywall', 'Couch', 'Armchair', 'Box', 'Toilet', 'TV', 'Bike', 'Lamp', 'Branches', 'Bag', 'Palm fronds', 'Tires', 'Pallets', 'Chair', 'Filing cabinet'];
  const loadOrder = () => {
    // the tall back-row pieces first (closest to the truck), then the heap's crown, then the low front row
    const rank = (n) => { const k = sorted.indexOf(n); return k < 0 ? 99 : k; };
    return items.slice().sort((a, b) => rank(a.name) - rank(b.name) || a.i - b.i);
  };
  const cav = truck.cavity;
  const doorPt = new THREE.Vector3(truck.rearX + .55, 2.05, LANE);
  const v1 = new THREE.Vector3(), v2 = new THREE.Vector3(), c1 = new THREE.Vector3(), c2 = new THREE.Vector3(), pS = new THREE.Vector3();
  const qa = new THREE.Quaternion(), qb = new THREE.Quaternion(), qw = new THREE.Quaternion(), eu = new THREE.Euler();
  const bez = (p0, p1, p2, p3, t, out) => { const u = 1 - t; return out.set(u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x, u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y, u * u * u * p0.z + 3 * u * u * t * p1.z + 3 * u * t * t * p2.z + t * t * t * p3.z); };

  function fly(it, k, nth, g, rank) {
    const dur = lerp(.9, .68, clamp(rank / total));
    const spin = ((it.i % 2) ? 1 : -1) * (.5 + (it.i % 3) * .25);
    const sScale = clamp(1.25 / it.maxDim, .3, .85) * (.92 + (it.i % 4) * .03);
    const zOff = ((it.i * 37) % 11 - 5) * .06;
    const entry = doorPt.clone(); entry.z += zOff; entry.y = lerp(1.6, 2.4, clamp(it.size.y / 2.6));
    // where it ends up inside the truck (world coords at the parked position)
    const frac = rank / Math.max(1, total - 1);
    const sx = truck.root.position.x + lerp(cav.x0 + .6, cav.x1 - .1, frac);
    const sy = 1.2 + it.size.y * sScale * .5 * (.55 + (it.i % 3) * .12);
    const sz = LANE + ((it.i * 53) % 9 - 4) * .12;
    const stow = new THREE.Vector3(sx, sy, sz);
    const p0 = it.c.clone(), top = Math.max(p0.y, entry.y) + .75 + it.size.y * .22;
    c1.set(p0.x + (entry.x - p0.x) * .1, top, p0.z + (entry.z - p0.z) * .1); c2.set(entry.x + 1.1, top - .4, entry.z + .5);
    let started = false, trailT = 0;
    const qStow = new THREE.Quaternion().setFromEuler(eu.set(0, (it.i % 2 ? .3 : -.3), 0));
    return tween(dur, (u) => {
      if (!started) { started = true; it.flying = true; halos[it.i].visible = true; it.hulls.forEach((h) => { h.visible = true; }); burst.emit(p0.x, it.holder.position.y - it.size.y * .45, p0.z, low ? 8 : 14, { speed: 1.2, up: .2, spread: .6, size: .1, life: .55, jit: Math.max(.2, it.size.x * .3) }); }
      const lift = E.outCubic(clamp(u / .16)) * .28;              // a small hop first
      let pos;
      if (u < .74) { const a = E.inOut(clamp((u - .08) / .66)); pos = bez(p0, c1, c2, entry, a, v1); pos.y += lift * (1 - a); }
      else { const b = E.smooth((u - .74) / .26); pos = v1.copy(entry).lerp(stow, b); }
      it.holder.position.copy(pos);
      const tu = E.smooth(u);
      qa.identity(); qb.copy(qStow); qw.setFromEuler(eu.set(Math.sin(u * Math.PI) * .45 * spin, 0, Math.sin(u * Math.PI) * -.35 * spin)); it.holder.quaternion.copy(qa.slerp(qb, tu)).multiply(qw);
      const s = lerp(1, sScale, E.smooth(clamp((u - .18) / .6)));
      const sq = 1 + .06 * Math.sin(clamp(u / .16) * Math.PI);    // squash-and-stretch as it leaves the ground
      it.holder.scale.set(s / sq, s * sq, s / sq);
      const hl = halos[it.i]; hl.position.copy(pos); const hs = Math.max(1.6, it.maxDim * 1.25) * s; hl.scale.set(hs, hs, 1); hl.material.opacity = .55 * Math.sin(clamp((u - .02) / .9) * Math.PI); it.om.uniforms.uO.value = .95 * Math.min(1, u / .1, (1 - u) / .14); it.om.uniforms.uW.value = .06 / Math.max(.4, s);
      trailT += 1;
      if (u > .06 && u < .9) burst.emit(pos.x, pos.y, pos.z, low ? 3 : 6, { speed: .5, up: .15, spread: .5, size: .32, life: .9, jit: Math.max(.2, it.size.x * .26), grav: .2, white: .15 });
    }, E.lin, 0).then(() => {
      it.flying = false; it.landed = true; S.landed++; halos[it.i].visible = false; flareK = 1; it.hulls.forEach((h) => { h.visible = false; });
      truck.body.attach(it.holder);
      S.vy -= .9;
      burst.emit(doorPt.x - .35, 1.7, entry.z, low ? 14 : 28, { speed: 2.0, up: .35, spread: .9, size: .28, life: .8, jit: .6, vx: 1.1 });
      emit({ type: 'count', left: total - S.landed, total });
    });
  }

  async function loadAll(g) {
    emit({ type: 'phase', name: 'load' });
    S.focusTarget = 1;
    const order = loadOrder();
    const gaps = order.map((_, i) => lerp(.34, .17, clamp(i / (total - 1)) ** .8));
    let t0 = 0; const ps = [];
    order.forEach((it, i) => { ps.push(sleep(t0).then(() => (g === S.gen ? fly(it, i, i, g, i) : null))); t0 += gaps[i]; });
    await Promise.all(ps);
    S.focusTarget = 0;
  }

  /* ---- sequences ---- */
  async function build(g) {
    emit({ type: 'phase', name: 'build' });
    S.rise = 0; truck.root.visible = false; sparkItems.visible = sparkSet.visible = true;
    hideAll(); items.forEach((it) => { it.landed = false; });
    const rise = tween(1.1, (k) => { S.rise = k; }, E.outCubic);
    const w = sweep(SHW, 1, 1.45, .25);
    const p = sweep(SH, 0, 2.3, 1.05);
    await Promise.all([rise, w, p]);
    sparkItems.visible = sparkSet.visible = false;
  }
  async function run(g, skipBuild) {
    if (!skipBuild) await build(g); if (g !== S.gen) return;
    emit({ type: 'count', left: total, total });
    const arrive = truckArrive(g);
    await arrive; if (g !== S.gen) return;
    await sleep(.15); if (g !== S.gen) return;
    await loadAll(g); if (g !== S.gen) return;
    await sleep(.45); if (g !== S.gen) return;
    emit({ type: 'phase', name: 'close' });
    await tween(.8, (k) => truck.door(E.outCubic(k)), E.lin); if (g !== S.gen) return;
    S.vy -= .5; await sleep(.5); if (g !== S.gen) return;
    await truckLeave(g); if (g !== S.gen) return;
    // swept clean: a pale band crosses the driveway and the dust lifts
    emit({ type: 'phase', name: 'clean' });
    clean.visible = true;
    await tween(1.5, (k) => { clean.position.x = 0; clean.position.z = lerp(-5.6, 5.6, k); clean.material.opacity = .55 * Math.sin(k * Math.PI); if (k > .1 && k < .9) burst.emit((Math.random() - .5) * 9, .1, clean.position.z + (Math.random() - .5) * .6, 1, { speed: .4, up: .6, spread: .4, size: .06, life: .8, grav: -.1, white: .6 }); }, E.inOut);
    clean.visible = false;
    emit({ type: 'phase', name: 'done' });
  }
  function resetPile() {
    items.forEach((it) => {
      pileGroup.attach(it.holder);
      it.holder.position.copy(it.c); it.holder.quaternion.identity(); it.holder.scale.set(1, 1, 1);
      it.landed = it.flying = false;
    });
    S.landed = 0; S.vy = 0; S.ty = 0; truck.door(0); halos.forEach((h) => { h.visible = false; }); items.forEach((it) => it.hulls.forEach((h) => { h.visible = false; }));
    truck.root.visible = false; truck.root.position.x = X_FAR;
  }
  function start() { const g = ++S.gen; tasks.length = 0; resetPile(); run(g, false); }
  function replay() {
    const g = ++S.gen; tasks.length = 0; resetPile(); S.rise = 1; S.sweep = 0; S.focus = 0; S.focusTarget = 0;
    setStatic(SH, true); setStatic(SHW, true); sparkItems.visible = sparkSet.visible = false;
    emit({ type: 'phase', name: 'arrive' }); run(g, true);
  }
  function jumpNow(final) {
    S.gen++; tasks.length = 0; resetPile(); S.rise = 1; S.sweep = 0; S.focus = 0;
    setStatic(SH, !final); setStatic(SHW, true); sparkItems.visible = sparkSet.visible = false;
    items.forEach((it) => { it.holder.visible = !final; });
    if (!final) { truck.root.visible = true; placeTruck(X_REST); truck.brake(true); truck.door(0); }
    emit({ type: 'count', left: final ? 0 : total, total }); emit({ type: 'phase', name: final ? 'done' : 'hold' });
  }

  /* ---- sizing and camera ---- */
  function layout() {
    const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1; S.w = w; S.h = h;
    const dpr = Math.min(window.devicePixelRatio || 1, opt.maxDpr ?? (low ? 1.6 : 2));
    renderer.setPixelRatio(dpr); renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const scale = (h * dpr) / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2));
    PU.forEach((u) => { u.uScale.value = scale; }); burst.U.uScale.value = scale;
    const f = opt.frame ? opt.frame(w, h, h > w * 1.02) : { zoom: 1, x: 0, y: 0 };
    S.zoom = f.zoom; S.fx = f.x; S.fy = f.y;
    camera.setViewOffset(w, h, -S.fx * w, -S.fy * h, w, h); camera.updateProjectionMatrix();
  }
  const CAM = { az: opt.az ?? 41, el: opt.el ?? 30, dist: opt.dist ?? 48, tx: opt.tx ?? .3, ty: opt.ty ?? 1.3, tz: opt.tz ?? .5 };
  function placeCamera() {
    const f = E.smooth(S.focus);
    const az = THREE.MathUtils.degToRad(CAM.az + S.yaw * 5 + f * 3), el = THREE.MathUtils.degToRad(CAM.el + S.pitch * 2.5 - f * 1.5), d = CAM.dist - f * 3;
    const tx = CAM.tx + f * 1.4, tz = CAM.tz + f * .6;
    camera.position.set(tx + Math.cos(el) * Math.sin(az) * d, Math.sin(el) * d + CAM.ty, tz + Math.cos(el) * Math.cos(az) * d);
    camera.lookAt(tx, CAM.ty, tz);
    camera.zoom = S.zoom * (1 + f * .09); camera.updateProjectionMatrix();
  }

  /* ---- per-frame ---- */
  function stepTasks(dt) {
    for (let i = tasks.length - 1; i >= 0; i--) {
      const k = tasks[i]; k.t += dt; if (k.t < 0) continue;
      const u = Math.min(1, k.t / k.dur); k.fn(k.ez(u));
      if (u >= 1) { tasks.splice(i, 1); k.res(); }
    }
  }
  function tick(dt) {
    S.t += dt;
    stepTasks(dt);
    PU.forEach((u) => { u.uTime.value = S.t; });
    world.position.y = (1 - S.rise) * -1.4; world.scale.setScalar(.94 + .06 * S.rise);
    // camera focus eases toward its target
    S.focus += ((S.focusTarget || 0) - S.focus) * (1 - Math.exp(-dt * 2.2));
    // suspension: a spring that settles under the load, with a kick from every landing
    const target = -.034 * S.landed / total * 2.2;
    const a = -110 * (S.ty - target) - 11 * S.vy; S.vy += a * dt; S.ty += S.vy * dt;
    // braking and pulling away tilt the truck
    const tx = truck.root.position.x, vx = (tx - S.lastTX) / Math.max(dt, 1e-3); S.lastTX = tx;
    S.ta += ((vx - S.tv) / Math.max(dt, 1e-3) - S.ta) * (1 - Math.exp(-dt * 8)); S.tv = vx;
    const targetPitch = clamp(S.ta * .0012, -.03, .03);
    S.pitchT += (targetPitch - S.pitchT) * (1 - Math.exp(-dt * 7));
    truck.body.position.y = S.ty; truck.body.rotation.z = S.pitchT - S.landed / total * .01;
    // the beacon blinks while parked
    const parked = truck.root.visible && Math.abs(tx - X_REST) < .05;
    truck.beaconM.emissiveIntensity = parked ? (Math.sin(S.t * 9) > .2 ? 1.6 : .1) : .15;
    // dust kicked up by the rear tyres while the truck is moving
    if (truck.root.visible && Math.abs(S.tv) > 1.5 && !opt.static) {
      const k = clamp(Math.abs(S.tv) / 14), dir = Math.sign(S.tv);
      [-1, 1].forEach((s) => { if (Math.random() < .5 * k) burst.emit(tx + .7 - dir * .1, .12, LANE + s * .85, 1, { speed: .5, up: .5, spread: .6, size: .34, life: .85, grav: -.05, col: '#d8cfbd', jit: .25, vx: -dir * .6 }); });
    }
    burst.update(dt);
    flareK = Math.max(0, flareK - dt * 3.2); flare.visible = flareK > .01 && truck.root.visible; flare.position.set(tx + truck.rearX - .38 + .3, 2.05, LANE); flare.material.opacity = flareK * .9;
    // light sheets
    const U = S.sweepKind ? SHW : SH, f = U.uFront.value, on = S.sweep && f > F0 + .02 && f < F1 - .02;
    sheet.visible = !!on;
    if (on) {
      sheet.position.set(f * SH.uDir.value.x, 2.2, f * SH.uDir.value.y);
      sheet.rotation.set(0, Math.atan2(SH.uDir.value.x, SH.uDir.value.y) + Math.PI / 2, 0);
      sheet.scale.set(Math.max(.01, 2 * (FLOOR_HALF * 1.4142 - Math.abs(f)) * .97), 1, 1);
      sheet.material.opacity = .34 * Math.min(1, (f - F0) / 1.2, (F1 - f) / 1.2);
    }
    S.yaw += ((opt.static ? 0 : (S.px + Math.sin(S.t * .22) * .35)) - S.yaw) * (1 - Math.exp(-dt * 2));
    S.pitch += ((opt.static ? 0 : (S.py + Math.sin(S.t * .17) * .2)) - S.pitch) * (1 - Math.exp(-dt * 2));
  }
  const FLOOR_HALF = 5.2;
  function frame(now) {
    if (!S.alive) return;
    const dt = Math.min(.05, (now - (S.last || now)) / 1000); S.last = now;
    tick(dt); placeCamera(); renderer.render(scene, camera);
  }

  const api = {
    renderer, scene, camera, state: S, items, truck, burst,
    resize: layout, frame, pointer(x, y) { S.px = x; S.py = y; },
    start, replay, jumpNow,
    async advance(sec, step = .033) { for (let t = 0; t < sec; t += step) { tick(step); for (let k = 0; k < 8; k++) await 0; } },
    count() { return { n: total - S.landed, total }; },
    destroy() { S.alive = false; renderer.dispose(); },
  };
  layout(); hideAll(); S.rise = 0;
  // compile everything once (sweep, sparks, truck) so the first sweep does not hitch
  { sheet.visible = true; truck.root.visible = true; renderer.compile(scene, camera); truck.root.visible = false; sheet.visible = false; }
  return api;
}
