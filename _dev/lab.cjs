// node lab.cjs <w> <h> <name> [query]   e.g. node lab.cjs 1200 800 a "p=0&static=1"
const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core');
const path = require('path');
const fs = require('fs');
const [w, h, name, qs = ''] = process.argv.slice(2);
const OUT = path.join(__dirname, 'shots'); fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe', headless: 'new',
    args: ['--hide-scrollbars', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: +w, height: +h, deviceScaleFactor: +(process.env.DPR || 1) });
  page.on('pageerror', (e) => console.log('PAGEERROR:', String(e.stack).split('\n').slice(0, 5).join(' | ')));
  page.on('console', (m) => console.log('CON:', m.text().slice(0, 400)));
  const url = 'file:///' + path.join(__dirname, 'lab.html').split(path.sep).join('/') + '?' + qs;
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForFunction('window.__ready', { timeout: 20000 });
  await new Promise((r) => setTimeout(r, +(process.env.WAIT || 2500)));
  const f = path.join(OUT, name + '.png');
  await page.screenshot({ path: f, omitBackground: qs.includes('bg=none') });
  console.log('shot', f);
  await browser.close();
})();
