// Real-GPU frame rate in headed Chrome:  node perf.cjs [desktop|phone]
const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core');
const path = require('path');
const size = process.argv[2] || 'desktop';
const SIZES = { desktop: { width: 1512, height: 900 }, phone: { width: 390, height: 780, deviceScaleFactor: 3, isMobile: true, hasTouch: true } };
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe', headless: false, args: ['--window-size=1600,1000'] });
  const p = await b.newPage();
  await p.setViewport(SIZES[size]);
  p.on('pageerror', (e) => console.log('PAGEERROR', e.message));
  await p.goto('file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/') + '?nosmooth&nosplash', { waitUntil: 'load' });
  await new Promise((r) => setTimeout(r, 4500));
  const run = (label, fn) => p.evaluate(({ label, fn }) => new Promise((res) => {
    const f = new Function('t', fn);
    let n = 0, t0 = performance.now(), worst = 0, last = t0;
    (function tick(t) { const d = t - last; last = t; if (d > worst) worst = d; f((t - t0) / 3000); if (++n < 400 && t - t0 < 3000) requestAnimationFrame(tick); else res({ label, fps: Math.round(n / ((t - t0) / 1000)), worstMs: Math.round(worst) }); })(t0);
  }), { label, fn });
  for (let i = 0; i < 6; i++) console.log(await run('hero ' + (i * 3 + 2) + 's', ''));
  console.log(await run('past hero', 'scrollTo(0,6000)'));
  await p.evaluate(() => { const q = document.getElementById('gauge'); scrollTo(0, q.getBoundingClientRect().top + scrollY - 100); });
  await new Promise((r) => setTimeout(r, 1500));
  console.log(await run('quote gauge', ''));
  console.log(await p.evaluate(() => { const g = document.createElement('canvas').getContext('webgl2'); const e = g.getExtension('WEBGL_debug_renderer_info'); return e ? g.getParameter(e.UNMASKED_RENDERER_WEBGL) : 'n/a'; }));
  await b.close();
})();
