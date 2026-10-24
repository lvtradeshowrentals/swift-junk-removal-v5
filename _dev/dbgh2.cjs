const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core');
const path = require('path');
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe', headless: 'new', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage(); await p.setViewport({ width: 900, height: 600 });
  p.on('pageerror', (e) => console.log('PAGEERROR', String(e.stack).split('\n').slice(0, 4).join(' | ')));
  p.on('console', (m) => console.log('CON', m.text().slice(0, 500)));
  await p.goto('file:///' + path.join(__dirname, 'labh.html').split(path.sep).join('/') + '?still=0&fz=1.6', { waitUntil: 'load' });
  await p.waitForFunction('window.__done', { timeout: 120000 });
  await p.evaluate(() => { const h = window.hero; h.burst.emit(2.5, 2, 0, 200, { speed: 0, up: 0, spread: 0, size: .5, life: 5, jit: 3, grav: 0 }); h.burst.update(.01); h.state.last = 0; h.frame(performance.now()); h.frame(performance.now() + 16); });
  await p.screenshot({ path: path.join(__dirname, 'shots', 'dbgb.png') });
  await b.close();
})();
