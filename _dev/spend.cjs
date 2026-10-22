// the splash really finishes on its own, unlocks scrolling, and does not replay in the same session
const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core');
const path = require('path');
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe', headless: 'new', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage(); await p.setViewport({ width: 390, height: 780, isMobile: true, hasTouch: true });
  p.on('pageerror', (e) => console.log('PAGEERROR', e.message));
  const url = 'file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/') + '?noscene=1';
  await p.goto(url, { waitUntil: 'load' });
  const st = () => p.evaluate(() => ({ cls: document.documentElement.className, vis: getComputedStyle(document.getElementById('splash')).display, ov: getComputedStyle(document.documentElement).overflow, go: document.documentElement.classList.contains('go') }));
  console.log('t0', await st());
  await new Promise((r) => setTimeout(r, 6500));
  console.log('t6.5', await st());
  await p.goto(url, { waitUntil: 'load' });
  console.log('reload', await st());
  await b.close();
})();
