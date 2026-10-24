// The ground: a brushed-concrete driveway with saw-cut joints, tyre marks along the truck's lane, an oil stain,
// gravel beds in the corners and a darker apron where the pile sits. Canvas x = world x, canvas y = world z.
import { THREE, rng } from './kit.js';

export const FLOOR = { half: 5, px: 2048 };   // 10 units over 2048 px

export function curbFloor() {
  const S = FLOOR.px, K = S / (FLOOR.half * 2);           // px per unit
  const X = (x) => (x + FLOOR.half) * K, Z = (z) => (z + FLOOR.half) * K;
  const c = document.createElement('canvas'); c.width = c.height = S;
  const g = c.getContext('2d'), R = rng(41);

  // base concrete with a soft mottle
  g.fillStyle = '#d4d1cb'; g.fillRect(0, 0, S, S);
  for (let i = 0; i < 90; i++) { const x = R() * S, y = R() * S, r = 80 + R() * 260, gr = g.createRadialGradient(x, y, 4, x, y, r); const t = R() < .5; gr.addColorStop(0, t ? 'rgba(255,255,255,.07)' : 'rgba(110,104,96,.045)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); }
  // brush finish: fine, short strokes in one direction
  for (let i = 0; i < 26000; i++) { const x = R() * S, y = R() * S; g.fillStyle = R() < .5 ? 'rgba(255,255,255,.13)' : 'rgba(80,74,68,.09)'; g.fillRect(x, y, 14 + R() * 30, 1.2); }
  for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(${R() < .5 ? '255,255,255' : '70,66,60'},${.04 + R() * .06})`; g.fillRect(R() * S, R() * S, 2 + R() * 3, 2 + R() * 3); }

  // landscaping beds: gravel in the back-left corner and along the house, and a front-left bed
  const bed = (x0, z0, x1, z1, rad = 26) => {
    g.save(); g.beginPath(); g.roundRect(X(x0), Z(z0), (x1 - x0) * K, (z1 - z0) * K, rad); g.clip();
    g.fillStyle = '#c4a67b'; g.fillRect(X(x0), Z(z0), (x1 - x0) * K, (z1 - z0) * K);
    for (let i = 0; i < 14000; i++) { const x = X(x0) + R() * (x1 - x0) * K, y = Z(z0) + R() * (z1 - z0) * K, r = 2 + R() * 5.5, t = R(); g.fillStyle = t < .3 ? `rgb(${130 + R() * 30 | 0},${108 + R() * 24 | 0},${84 + R() * 20 | 0})` : t < .75 ? `rgb(${205 + R() * 28 | 0},${180 + R() * 24 | 0},${140 + R() * 22 | 0})` : '#e9d9b6'; g.beginPath(); g.ellipse(x, y, r, r * (.6 + R() * .4), R() * 3, 0, 7); g.fill(); }
    g.restore();
    g.strokeStyle = 'rgba(70,52,34,.55)'; g.lineWidth = 7; g.beginPath(); g.roundRect(X(x0), Z(z0), (x1 - x0) * K, (z1 - z0) * K, rad); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 2.5; g.beginPath(); g.roundRect(X(x0) + 5, Z(z0) + 5, (x1 - x0) * K - 10, (z1 - z0) * K - 10, rad - 3); g.stroke();
  };
  bed(-5, -5, 5, -4.1, 10);                 // strip along the house
  bed(-5, -4.1, -3.5, -3.45, 10);           // corner by the gate pillar
  bed(-5, -.2, -3.3, 5, 14);                // left bed, in front of the gate
  bed(3.2, -4.1, 5, -3.2, 12);

  // saw-cut joints: 2.5-unit pads
  g.lineCap = 'butt';
  const joint = (x0, z0, x1, z1) => {
    g.strokeStyle = 'rgba(50,46,42,.62)'; g.lineWidth = 5; g.beginPath(); g.moveTo(x0, z0); g.lineTo(x1, z1); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,.45)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x0 + 3, z0 + 3); g.lineTo(x1 + 3, z1 + 3); g.stroke();
  };
  [-2.5, 0, 2.5].forEach((x) => joint(X(x), Z(-4.1), X(x), Z(5)));
  [-1.6, .9, 3.4].forEach((z) => joint(X(-3.3), Z(z), X(5), Z(z)));
  // hairline cracks
  g.strokeStyle = 'rgba(60,56,50,.5)'; g.lineWidth = 1.8;
  for (let i = 0; i < 7; i++) { let x = X(-3 + R() * 7.5), y = Z(-3 + R() * 8); g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 10; k++) { x += (R() - .35) * 24; y += (R() - .4) * 24; g.lineTo(x, y); } g.stroke(); }

  // the truck's lane: two worn tyre tracks and a faint oil patch where it parks
  const lane = -1.85;
  [-.78, .78].forEach((dz) => { const y = Z(lane + dz); const gr = g.createLinearGradient(0, y - 34, 0, y + 34); gr.addColorStop(0, 'rgba(60,56,52,0)'); gr.addColorStop(.5, 'rgba(60,56,52,.1)'); gr.addColorStop(1, 'rgba(60,56,52,0)'); g.fillStyle = gr; g.fillRect(0, y - 34, S, 68); });
  { const x = X(-1.4), y = Z(lane + .2), gr = g.createRadialGradient(x, y, 6, x, y, 120); gr.addColorStop(0, 'rgba(36,34,32,.22)'); gr.addColorStop(.6, 'rgba(36,34,32,.09)'); gr.addColorStop(1, 'rgba(36,34,32,0)'); g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, 130, 80, .3, 0, 7); g.fill(); }
  // the pile's apron: slightly darker and dirtier
  { const x = X(3.85), y = Z(1.8), gr = g.createRadialGradient(x, y, 30, x, y, 430); gr.addColorStop(0, 'rgba(70,64,56,.12)'); gr.addColorStop(1, 'rgba(70,64,56,0)'); g.fillStyle = gr; g.fillRect(x - 440, y - 440, 880, 880); }
  // a few dropped leaves and scuffs
  for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(${R() < .5 ? '120,98,62' : '90,110,60'},.5)`; g.beginPath(); g.ellipse(X(-3 + R() * 8), Z(-3.4 + R() * 8), 6 + R() * 6, 2 + R() * 2, R() * 3, 0, 7); g.fill(); }
  // vignette toward the edges
  const v = g.createRadialGradient(S / 2, S / 2, S * .35, S / 2, S / 2, S * .75); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(60,54,46,.16)'); g.fillStyle = v; g.fillRect(0, 0, S, S);

  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}

/* the same concrete, tiled, for the road strips that run off the plinth */
export function roadTexture() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 512; const g = c.getContext('2d'), R = rng(5);
  g.fillStyle = '#cfccc6'; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 5000; i++) { g.fillStyle = R() < .5 ? 'rgba(255,255,255,.12)' : 'rgba(80,74,68,.08)'; g.fillRect(R() * 512, R() * 512, 10 + R() * 20, 1.2); }
  g.strokeStyle = 'rgba(50,46,42,.6)'; g.lineWidth = 5; g.beginPath(); g.moveTo(0, 2); g.lineTo(512, 2); g.stroke();
  g.beginPath(); g.moveTo(2, 0); g.lineTo(2, 512); g.stroke();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8;
  return t;
}
