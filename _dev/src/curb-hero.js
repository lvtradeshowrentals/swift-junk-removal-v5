// The hero: a Las Vegas curb. The set materialises in a sweep of light, a Swift truck pulls up, the pile
// dematerialises the same way it appeared, every particle streams into the truck at once, the door rolls down,
// the truck leaves, and the driveway is clean.
import { THREE, SH, SHW, rb, mergeColored as mergeItem } from './kit.js';
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
};
const F0 = -7.9, F1 = 7.9, FEND = 8.8;
const LANE = SET.laneZ, X_REST = -.3, X_FAR = 24;
const GATHER_QS = 5.2;                       // how far behind the front a particle is still on its way to the truck

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
  const bbx = new THREE.Box3(), cen = new THREE.Vector3();
  const items = buildPile().map((root, i) => {
    mergeItem(root); pileGroup.add(root);
    bbx.setFromObject(root); bbx.getCenter(cen);
    return { i, name: root.userData.name, root, s: cen.x * SH.uDir.value.x + cen.z * SH.uDir.value.y };
  });
  world.updateMatrixWorld(true);

  const truck = buildBoxTruck(font); truck.root.position.set(X_FAR, 0, LANE); truck.root.visible = false; truck.door(0); world.add(truck.root);

  /* what is inside the truck once it is packed: a tight heap that fills the box */
  const cargo = new THREE.Group(); {
    const cav = truck.cavity, cols = ['#c9a278', '#bfa07a', '#587a8c', '#6d93a7', '#cf9a5f', '#efede8', '#2b3138', '#8d969e', '#e8793a', '#dcc19b', '#3f8b82', '#d3b283'];
    let seed = 11; const R = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let x = cav.x0 + .1; x < cav.x1 - .05;) {
      const w = Math.min(.7 + R() * .7, cav.x1 - x); let y = cav.y0;
      while (y < cav.y1 - .3) {
        const h = Math.min(.5 + R() * .9, cav.y1 - y), d = .9 + R() * .7, c = cols[(R() * cols.length) | 0];
        const mat = new THREE.MeshStandardMaterial({ color: c, roughness: .85 });
        const m = new THREE.Mesh(rb(w, h, d, mat, .08, 2).geometry, mat);
        m.position.set(x + w / 2, y - cav.y0 + h / 2, (R() - .5) * (2 * cav.z - d)); m.rotation.y = (R() - .5) * .5;
        cargo.add(m); y += h * .96;
      }
      x += w * .9;
    }
    mergeItem(cargo); cargo.scale.set(1, .001, 1); cargo.position.y = cav.y0;
    truck.body.add(cargo);
  }

  /* ---- the sweep's light sheet, and a pale band for the final sweep ---- */
  const sheetCv = document.createElement('canvas'); sheetCv.width = 8; sheetCv.height = 256;
  { const g = sheetCv.getContext('2d'), gr = g.createLinearGradient(0, 256, 0, 0); gr.addColorStop(0, 'rgba(255,255,255,.95)'); gr.addColorStop(.35, 'rgba(255,255,255,.25)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 8, 256); }
  const sheetTex = new THREE.CanvasTexture(sheetCv);
  const sheet = new THREE.Mesh(new THREE.PlaneGeometry(1, 4.6), new THREE.MeshBasicMaterial({ map: sheetTex, color: '#ff5a1f', transparent: true, opacity: .34, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }));
  sheet.renderOrder = 5; sheet.visible = false; world.add(sheet);
  const clean = new THREE.Mesh(new THREE.PlaneGeometry(14, 1.1), new THREE.MeshBasicMaterial({ map: sheetTex, color: '#ffffff', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }));
  clean.rotation.x = -Math.PI / 2; clean.position.y = .03; clean.renderOrder = 4; clean.visible = false; world.add(clean);

  /* ---- sparks ---- */
  const target = new THREE.Vector3(0, 2.0, LANE);
  const pu = (U, qs) => ({ uFront: U.uFront, uDir: U.uDir, uAccent: U.uAccent, uSign: U.uSign, uTime: { value: 0 }, uScale: { value: 600 }, uGather: { value: 0 }, uQS: { value: qs }, uTarget: { value: target } });
  const PU = [pu(SH, 2.4), pu(SHW, 2.4)];
  const sparkItems = surfaceSparks(pileGroup, PU[0], low ? 6000 : 13000, low), sparkSet = surfaceSparks(set, PU[1], low ? 3200 : 6500, low);
  world.add(sparkItems, sparkSet);
  const burst = makeBurst(low ? 520 : 900); world.add(burst.points);

  /* ---- state + a tiny tween scheduler ---- */
  const S = { w: 1, h: 1, px: 0, py: 0, fx: 0, fy: 0, zoom: 1, yaw: 0, pitch: 0, t: 0, last: 0, alive: true, rise: 0, focus: 0, focusTarget: 0, sweep: 0, sweepKind: 0, gen: 0, ty: 0, vy: 0, pitchT: 0, lastTX: X_FAR, tv: 0, ta: 0, pack: 0, left: items.length };
  const tasks = [];
  const tween = (dur, fn, ez = E.lin, delay = 0) => new Promise((res) => { tasks.push({ t: -delay, dur: Math.max(.001, dur), fn, ez, res }); });
  const sleep = (s) => tween(s, () => {});
  const emit = (e) => { if (opt.onEvent) opt.onEvent(e); };
  const total = items.length;
  let wheelAngle = 0, counting = false;

  const setStatic = (U, present) => { U.uSign.value = present ? -1 : 1; U.uFront.value = FEND; };
  const hideAll = () => { SH.uSign.value = -1; SH.uFront.value = F0 - .01; SHW.uSign.value = -1; SHW.uFront.value = F0 - .01; };

  async function sweep(U, kind, dur, delay = 0, sign = -1, from = F0, to = F1) {
    await sleep(delay);
    U.uSign.value = sign; U.uFront.value = from - .01; S.sweep = 1; S.sweepKind = kind;
    await tween(dur, (k) => { U.uFront.value = lerp(from, to, k); }, E.inOut);
    S.sweep = 0;
  }

  /* ---- the truck's movement ---- */
  function placeTruck(x) {
    const dx = truck.root.position.x - x; truck.root.position.x = x;
    wheelAngle += dx / .55; truck.wheels.forEach((w) => { w.rotation.z = wheelAngle; });
  }
  async function truckArrive() {
    truck.root.visible = true; truck.brake(false); truck.door(0); truck.root.position.x = X_FAR; wheelAngle = 0;
    emit({ type: 'phase', name: 'arrive' });
    const brake = tween(.8, () => {}, E.lin, 1.9).then(() => truck.brake(true));
    await tween(2.7, (k) => placeTruck(lerp(X_FAR, X_REST, E.outQuart(k))), E.lin);
    await brake;
  }
  async function truckLeave() {
    emit({ type: 'phase', name: 'leave' });
    truck.brake(false);
    await tween(2.5, (k) => placeTruck(lerp(X_REST, -X_FAR - 4, E.inCubic(k))), E.lin);
    truck.root.visible = false;
  }

  /* ---- the pickup: dematerialise, and everything streams into the truck at once ---- */
  async function pickup() {
    emit({ type: 'phase', name: 'load' });
    target.set(X_REST + truck.rearX - .25, 2.05, LANE);
    PU[0].uGather.value = 1; PU[0].uQS.value = GATHER_QS;
    S.focusTarget = 1; counting = true; sparkItems.visible = true;
    const from = Math.min(...items.map((it) => it.s)) - 1.9, to = F1 + GATHER_QS + .2;
    const erase = sweep(SH, 0, (to - from) / 3.6, 0, 1, from, to);
    // the heap in the truck builds as the stream arrives; each surge nudges the suspension
    const pack = tween(2.4, (k) => { S.pack = E.smooth(k); cargo.scale.y = Math.max(.001, S.pack); }, E.lin, .9);
    const flare = tween(2.6, () => { if (Math.random() < .5) burst.emit(target.x + .1, 1.7 + Math.random() * .9, LANE + (Math.random() - .5) * 1.3, 1, { speed: 1.0, up: .3, spread: .7, size: .16, life: .6, jit: .15, vx: .7 }); }, E.lin, .8);
    const kicks = tween(2.6, () => { if (Math.random() < .08) S.vy -= .35; }, E.lin, 1.0);
    await Promise.all([erase, pack, flare, kicks]);
    counting = false; sparkItems.visible = false; S.focusTarget = 0; S.left = 0; emit({ type: 'count', left: 0, total });
    PU[0].uGather.value = 0; PU[0].uQS.value = 2.4;
    items.forEach((it) => { it.root.visible = false; });
  }

  /* ---- sequences ---- */
  async function build() {
    emit({ type: 'phase', name: 'build' });
    S.rise = 0; truck.root.visible = false; sparkItems.visible = sparkSet.visible = true; cargo.scale.y = .001; S.pack = 0;
    hideAll(); items.forEach((it) => { it.root.visible = true; });
    const rise = tween(1.1, (k) => { S.rise = k; }, E.outCubic);
    const w = sweep(SHW, 1, 1.45, .25);
    const p = sweep(SH, 0, 2.3, 1.05);
    await Promise.all([rise, w, p]);
    setStatic(SH, true); setStatic(SHW, true);
    sparkItems.visible = sparkSet.visible = false;
  }
  async function run(g, skipBuild) {
    if (!skipBuild) await build(); if (g !== S.gen) return;
    S.left = total; emit({ type: 'count', left: total, total });
    await truckArrive(); if (g !== S.gen) return;
    await sleep(.45); if (g !== S.gen) return;
    await pickup(); if (g !== S.gen) return;
    await sleep(.5); if (g !== S.gen) return;
    emit({ type: 'phase', name: 'close' });
    await tween(.8, (k) => truck.door(E.outCubic(k))); if (g !== S.gen) return;
    S.vy -= .5; await sleep(.5); if (g !== S.gen) return;
    await truckLeave(); if (g !== S.gen) return;
    emit({ type: 'phase', name: 'clean' });
    clean.visible = true;
    await tween(1.5, (k) => { clean.position.x = 0; clean.position.z = lerp(-5.6, 5.6, k); clean.material.opacity = .55 * Math.sin(k * Math.PI); if (k > .1 && k < .9) burst.emit((Math.random() - .5) * 9, .1, clean.position.z + (Math.random() - .5) * .6, 1, { speed: .4, up: .6, spread: .4, size: .06, life: .8, grav: -.1, white: .6 }); }, E.inOut);
    clean.visible = false;
    emit({ type: 'phase', name: 'done' });
  }
  function resetAll() {
    S.vy = 0; S.ty = 0; S.pack = 0; S.left = total; truck.door(0); cargo.scale.y = .001;
    truck.root.visible = false; truck.root.position.x = X_FAR; PU[0].uGather.value = 0; PU[0].uQS.value = 2.4; counting = false;
    items.forEach((it) => { it.root.visible = true; });
  }
  function start() { const g = ++S.gen; tasks.length = 0; resetAll(); run(g, false); }
  function replay() {
    const g = ++S.gen; tasks.length = 0; resetAll(); S.rise = 1; S.sweep = 0; S.focus = 0; S.focusTarget = 0;
    // the pile comes back the way it first appeared
    sparkItems.visible = true; SH.uSign.value = -1; SH.uFront.value = F0 - .01;
    (async () => { emit({ type: 'phase', name: 'build' }); await sweep(SH, 0, 2.3, .2); setStatic(SH, true); sparkItems.visible = false; if (g !== S.gen) return; run(g, true); })();
  }
  function jumpNow(final) {
    S.gen++; tasks.length = 0; resetAll(); S.rise = 1; S.sweep = 0; S.focus = 0;
    setStatic(SH, true); setStatic(SHW, true); sparkItems.visible = sparkSet.visible = false;
    items.forEach((it) => { it.root.visible = !final; });
    if (!final) { truck.root.visible = true; placeTruck(X_REST); truck.brake(true); truck.door(0); }
    S.left = final ? 0 : total; emit({ type: 'count', left: S.left, total }); emit({ type: 'phase', name: final ? 'done' : 'hold' });
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
  const FLOOR_HALF = 5.2;
  function tick(dt) {
    S.t += dt;
    stepTasks(dt);
    PU.forEach((u) => { u.uTime.value = S.t; });
    world.position.y = (1 - S.rise) * -1.4; world.scale.setScalar(.94 + .06 * S.rise);
    S.focus += ((S.focusTarget || 0) - S.focus) * (1 - Math.exp(-dt * 2.2));
    // the count follows the sweep: a piece is "gone" once the front has passed it
    if (counting) { const f = SH.uFront.value; let left = 0; for (const it of items) if (it.s > f) left++; if (left !== S.left) { S.left = left; emit({ type: 'count', left, total }); } }
    // suspension: a spring that settles under the load, kicked by each surge
    const target0 = -.034 * S.pack * 1.1;
    const a = -110 * (S.ty - target0) - 11 * S.vy; S.vy += a * dt; S.ty += S.vy * dt;
    const tx = truck.root.position.x, vx = (tx - S.lastTX) / Math.max(dt, 1e-3); S.lastTX = tx;
    S.ta += ((vx - S.tv) / Math.max(dt, 1e-3) - S.ta) * (1 - Math.exp(-dt * 8)); S.tv = vx;
    const targetPitch = clamp(S.ta * .0012, -.03, .03);
    S.pitchT += (targetPitch - S.pitchT) * (1 - Math.exp(-dt * 7));
    truck.body.position.y = S.ty; truck.body.rotation.z = S.pitchT - S.pack * .01;
    const parked = truck.root.visible && Math.abs(tx - X_REST) < .05;
    truck.beaconM.emissiveIntensity = parked ? (Math.sin(S.t * 9) > .2 ? 1.6 : .1) : .15;
    // dust kicked up by the rear tyres while the truck is moving
    if (truck.root.visible && Math.abs(S.tv) > 1.5 && !opt.static) {
      const k = clamp(Math.abs(S.tv) / 14), dir = Math.sign(S.tv);
      [-1, 1].forEach((s) => { if (Math.random() < .5 * k) burst.emit(tx + .7 - dir * .1, .12, LANE + s * .85, 1, { speed: .5, up: .5, spread: .6, size: .34, life: .85, grav: -.05, col: '#d8cfbd', jit: .25, vx: -dir * .6 }); });
    }
    burst.update(dt);
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
    count() { return { n: S.left, total }; },
    destroy() { S.alive = false; renderer.dispose(); },
  };
  layout(); hideAll(); S.rise = 0;
  { sheet.visible = true; truck.root.visible = true; renderer.compile(scene, camera); truck.root.visible = false; sheet.visible = false; }
  return api;
}
