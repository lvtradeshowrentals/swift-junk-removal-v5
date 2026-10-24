// node labt.cjs <w> <h> <name> "<query>"   screenshots labt.html (the truck on its own)
const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core');
const path = require('path');
const [w, h, name, qs = ''] = process.argv.slice(2);
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe', headless: 'new', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage(); await p.setViewport({ width: +w, height: +h, deviceScaleFactor: +(process.env.DPR || 1) });
  p.on('pageerror', (e) => console.log('PAGEERROR', String(e.stack).split('\n').slice(0, 4).join(' | ')));
  p.on('console', (m) => { const t = m.text(); if (/error|warn/i.test(t)) console.log('CON', t.slice(0, 300)); });
  await p.goto('file:///' + path.join(__dirname, 'labt.html').split(path.sep).join('/') + '?' + qs, { waitUntil: 'load' });
  await p.waitForFunction('window.__done', { timeout: 40000 });
  await new Promise((r) => setTimeout(r, 400));
  await p.screenshot({ path: path.join(__dirname, 'shots', name + '.png') });
  console.log('shot', name);
  await b.close();
})();
