// Floor textures for the shared slab: oak boards, a desert backyard, a remodel's concrete.
import { THREE, rng } from './kit.js';

function mk(size, draw) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  draw(c.getContext('2d'), size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}
const rgb = (r, g, b) => `rgb(${r | 0},${g | 0},${b | 0})`;

/* worn oak boards, with grain, knots, nail heads, scuffs and a darker edge where the rug was */
export function woodFloor(S = 1536) {
  return mk(S, (g, s) => {
    const R = rng(11); g.fillStyle = '#c4a981'; g.fillRect(0, 0, s, s);
    const rows = 16, h = s / rows;
    for (let i = 0; i < rows; i++) {
      let x = -R() * s * .4;
      while (x < s) {
        const w = s * (.28 + R() * .3), tone = (R() - .5) * 22, wr = R() * .16;
        g.fillStyle = rgb(204 + tone, 176 + tone * .9, 134 + tone * .7); g.fillRect(x, i * h, w, h);
        for (let k = 0; k < 26; k++) { // grain
          const y = i * h + R() * h; g.strokeStyle = `rgba(${95 + R() * 40 | 0},${64 + R() * 24 | 0},${34},${.05 + R() * .09})`; g.lineWidth = .6 + R() * 1.3;
          g.beginPath(); g.moveTo(x, y); g.bezierCurveTo(x + w * .3, y + (R() - .5) * 6, x + w * .6, y + (R() - .5) * 6, x + w, y + (R() - .5) * 3); g.stroke();
        }
        if (R() < .32) { const kx = x + w * (.15 + R() * .7), ky = i * h + h * (.3 + R() * .4); g.fillStyle = 'rgba(96,62,30,.35)'; g.beginPath(); g.ellipse(kx, ky, 7 + R() * 5, 3 + R() * 2, 0, 0, 7); g.fill(); g.strokeStyle = 'rgba(96,62,30,.2)'; g.lineWidth = 1; g.beginPath(); g.ellipse(kx, ky, 15, 7, 0, 0, 7); g.stroke(); }
        g.fillStyle = 'rgba(60,40,20,.5)'; g.fillRect(x + 1, i * h, 2.4, h); // end seam
        g.fillStyle = 'rgba(255,255,255,.07)'; g.fillRect(x + 3, i * h, 1.5, h);
        [x + 14, x + w - 14].forEach((nx) => { g.fillStyle = 'rgba(70,50,30,.55)'; g.beginPath(); g.arc(nx, i * h + h * .5, 1.6, 0, 7); g.fill(); });
        x += w;
      }
      g.fillStyle = 'rgba(55,38,20,.45)'; g.fillRect(0, i * h, s, 2.4); g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(0, i * h + 2.4, s, 1.4);
    }
    for (let k = 0; k < 110; k++) { g.strokeStyle = `rgba(255,255,255,${.04 + R() * .08})`; g.lineWidth = 1; const x = R() * s, y = R() * s; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 10 + R() * 40, y + (R() - .5) * 8); g.stroke(); } // scuffs
    const v = g.createRadialGradient(s / 2, s / 2, s * .25, s / 2, s / 2, s * .75); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(60,40,20,.28)'); g.fillStyle = v; g.fillRect(0, 0, s, s);
  });
}

/* a desert yard: crushed gravel, a paver patio, a patch of turf, stepping stones, dead weeds */
export function yardFloor(S = 1536) {
  return mk(S, (g, s) => {
    const R = rng(23); g.fillStyle = '#d9c4a0'; g.fillRect(0, 0, s, s);
    for (let i = 0; i < 16000; i++) { const x = R() * s, y = R() * s, r = 1 + R() * 3.4, t = R(); g.fillStyle = t < .25 ? rgb(176 + R() * 30, 146 + R() * 22, 106 + R() * 20) : t < .75 ? rgb(222 + R() * 26, 200 + R() * 24, 160 + R() * 24) : rgb(240, 226, 192); g.fillRect(x, y, r * 1.3, r); }
    // turf patch (back-right)
    const tx = s * .64, ty = s * .46, tw = s * .32, th = s * .34;
    g.fillStyle = '#6f9a4e'; g.beginPath(); g.roundRect(tx, ty, tw, th, 18); g.fill();
    for (let i = 0; i < 9000; i++) { g.strokeStyle = `rgba(${70 + R() * 50 | 0},${130 + R() * 60 | 0},${60 + R() * 30 | 0},.55)`; g.lineWidth = 1; const x = tx + R() * tw, y = ty + R() * th; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (R() - .5) * 4, y - 3 - R() * 5); g.stroke(); }
    g.strokeStyle = 'rgba(40,60,30,.5)'; g.lineWidth = 3; g.beginPath(); g.roundRect(tx, ty, tw, th, 18); g.stroke();
    // paver patio (front-left), running bond
    const px = s * .06, py = s * .42, pw = s * .56, ph = s * .5, bw = pw / 7, bh = ph / 11;
    g.fillStyle = '#7a6a5a'; g.fillRect(px - 6, py - 6, pw + 12, ph + 12);
    for (let r = 0; r < 11; r++) for (let c = -1; c < 8; c++) {
      const x = px + c * bw + (r % 2 ? bw / 2 : 0), tone = (R() - .5) * 26;
      const x0 = Math.max(px, x), x1 = Math.min(px + pw, x + bw - 3); if (x1 <= x0) continue;
      g.fillStyle = rgb(176 + tone, 150 + tone, 124 + tone); g.fillRect(x0, py + r * bh, x1 - x0, bh - 3);
      g.fillStyle = 'rgba(255,255,255,.1)'; g.fillRect(x0, py + r * bh, x1 - x0, 2);
      if (R() < .2) { g.fillStyle = 'rgba(70,50,30,.18)'; g.beginPath(); g.ellipse(x0 + R() * bw, py + r * bh + bh / 2, 10 + R() * 16, 5 + R() * 6, R() * 3, 0, 7); g.fill(); }
    }
    for (let i = 0; i < 5; i++) { g.fillStyle = 'rgba(120,90,50,.16)'; g.beginPath(); g.ellipse(px + R() * pw, py + R() * ph, 30 + R() * 50, 18 + R() * 26, R() * 3, 0, 7); g.fill(); } // stains
    // stepping stones along the back
    for (let i = 0; i < 6; i++) { const x = s * (.1 + i * .075), y = s * (.22 + Math.sin(i * 1.3) * .03); g.fillStyle = '#a89880'; g.beginPath(); g.ellipse(x, y, 34, 24, R() * 3, 0, 7); g.fill(); g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 2; g.stroke(); }
    for (let i = 0; i < 40; i++) { const x = R() * s, y = R() * s; g.strokeStyle = 'rgba(140,110,60,.6)'; g.lineWidth = 1.2; for (let k = 0; k < 7; k++) { g.beginPath(); g.moveTo(x, y); g.lineTo(x + (k - 3) * 3, y - 9 - R() * 8); g.stroke(); } } // dry weeds
    const v = g.createRadialGradient(s / 2, s / 2, s * .3, s / 2, s / 2, s * .78); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(70,50,20,.12)'); g.fillStyle = v; g.fillRect(0, 0, s, s);
  });
}

/* a gutted house: raw concrete, saw-cut joints, stains, chalk layout, an OSB patch, spray marks */
export function siteFloor(S = 1536) {
  return mk(S, (g, s) => {
    const R = rng(37); g.fillStyle = '#b4b7b9'; g.fillRect(0, 0, s, s);
    for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(${R() < .5 ? '255,255,255' : '60,64,68'},${.03 + R() * .07})`; g.fillRect(R() * s, R() * s, 1 + R() * 3, 1 + R() * 3); }
    for (let i = 0; i < 26; i++) { const x = R() * s, y = R() * s, r = 40 + R() * 150; const gr = g.createRadialGradient(x, y, 4, x, y, r); gr.addColorStop(0, `rgba(70,74,78,${.16 + R() * .12})`); gr.addColorStop(1, 'rgba(70,74,78,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); }
    g.strokeStyle = 'rgba(40,44,48,.55)'; g.lineWidth = 3; for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(s * i / 4, 0); g.lineTo(s * i / 4, s); g.moveTo(0, s * i / 4); g.lineTo(s, s * i / 4); g.stroke(); }
    for (let i = 0; i < 6; i++) { g.strokeStyle = 'rgba(40,44,48,.5)'; g.lineWidth = 1.6; g.beginPath(); let x = R() * s, y = R() * s; g.moveTo(x, y); for (let k = 0; k < 14; k++) { x += (R() - .4) * 40; y += (R() - .5) * 40; g.lineTo(x, y); } g.stroke(); }
    // OSB subfloor patch
    const ox = s * .56, oy = s * .52, ow = s * .36, oh = s * .38;
    g.fillStyle = '#c59a5c'; g.fillRect(ox, oy, ow, oh);
    for (let i = 0; i < 1400; i++) { g.fillStyle = `rgba(${R() < .5 ? '120,80,36' : '230,190,120'},${.2 + R() * .25})`; g.save(); g.translate(ox + R() * ow, oy + R() * oh); g.rotate(R() * 3.14); g.fillRect(0, 0, 14 + R() * 26, 3 + R() * 3); g.restore(); }
    g.strokeStyle = 'rgba(60,40,20,.6)'; g.lineWidth = 3; g.strokeRect(ox, oy, ow, oh); g.beginPath(); g.moveTo(ox + ow / 2, oy); g.lineTo(ox + ow / 2, oy + oh); g.moveTo(ox, oy + oh / 2); g.lineTo(ox + ow, oy + oh / 2); g.stroke();
    for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(40,30,20,.6)'; g.beginPath(); g.arc(ox + 14 + (i % 8) * (ow - 28) / 7, oy + 10 + Math.floor(i / 8) * oh / 4.8, 2, 0, 7); g.fill(); }
    // chalk layout + dimension ticks
    g.lineCap = 'round';
    [['#f4f1e8', [[.1, .12, .1, .56], [.1, .12, .46, .12], [.46, .12, .46, .3]]], ['#7fb6e6', [[.12, .75, .5, .75], [.12, .75, .12, .9]]], ['#f3b35a', [[.52, .14, .52, .42]]]].forEach(([c, ls]) => { g.strokeStyle = c; g.lineWidth = 5; ls.forEach(([a, b, x, y]) => { g.beginPath(); g.moveTo(a * s, b * s); g.lineTo(x * s, y * s); g.stroke(); const L = Math.hypot((x - a) * s, (y - b) * s), n = Math.floor(L / 54); for (let k = 0; k <= n; k++) { const t = k / n, px = a * s + (x * s - a * s) * t, py = b * s + (y * s - b * s) * t; g.lineWidth = 3; g.beginPath(); const nx = -(y - b), ny = x - a, nl = Math.hypot(nx, ny); g.moveTo(px - nx / nl * 9, py - ny / nl * 9); g.lineTo(px + nx / nl * 9, py + ny / nl * 9); g.stroke(); } g.lineWidth = 5; }); });
    g.fillStyle = '#f4f1e8'; g.font = 'bold 30px sans-serif'; g.fillText("12'-6\"", s * .2, s * .1); g.fillText('KITCHEN', s * .15, s * .33); g.fillStyle = '#7fb6e6'; g.fillText("9'-0\"", s * .26, s * .73);
    // spray marks
    g.strokeStyle = '#ff7a2e'; g.lineWidth = 9; g.beginPath(); g.moveTo(s * .74, s * .1); g.lineTo(s * .8, s * .18); g.moveTo(s * .8, s * .1); g.lineTo(s * .74, s * .18); g.stroke();
    g.strokeStyle = '#ff4fa0'; g.lineWidth = 8; g.beginPath(); g.arc(s * .3, s * .5, 22, 0, 7); g.stroke();
    for (let i = 0; i < 9; i++) { g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.ellipse(R() * s, R() * s, 20 + R() * 40, 8 + R() * 16, R() * 3, 0, 7); g.fill(); } // dust
    const v = g.createRadialGradient(s / 2, s / 2, s * .3, s / 2, s / 2, s * .78); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(40,44,48,.28)'); g.fillStyle = v; g.fillRect(0, 0, s, s);
  });
}
