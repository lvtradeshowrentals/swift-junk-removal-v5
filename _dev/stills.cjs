// Renders the clay stills with a transparent background:  node stills.cjs [names...]
//   scene-home, scene-furniture, scene-construction, scene-commercial, scene-yard, room-full, room-empty
const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core');
const path = require('path');
const fs = require('fs');
const OUT = path.join(__dirname, 'shots', 'stills'); fs.mkdirSync(OUT, { recursive: true });
const JOBS = {
  'scene-home': { w: 1200, h: 900, q: 'static=1&bg=none&scene=home&fz=1.5&fy=.03' },
  'scene-furniture': { w: 1200, h: 900, q: 'static=1&bg=none&scene=furniture&fz=1.5&fy=.03' },
  'scene-construction': { w: 1200, h: 900, q: 'static=1&bg=none&scene=construction&fz=1.5&fy=.03' },
  'scene-commercial': { w: 1200, h: 900, q: 'static=1&bg=none&scene=commercial&fz=1.5&fy=.03' },
  'scene-yard': { w: 1200, h: 900, q: 'static=1&bg=none&scene=yard&fz=1.5&fy=.03' },
  'room-full': { w: 1600, h: 1100, q: 'static=1&bg=none&scene=0&fz=1.25&fy=.02', lab: 'lab2.html' },
  'room-empty': { w: 1600, h: 1100, q: 'static=1&bg=none&scene=0&empty=1&fz=1.25&fy=.02', lab: 'lab2.html' },
  'scene-home': { w: 1200, h: 900, q: 'static=1&bg=none&scene=0&fz=1.35&fy=.03', lab: 'lab2.html' },
  'scene-yard': { w: 1200, h: 900, q: 'static=1&bg=none&scene=1&fz=1.35&fy=.03', lab: 'lab2.html' },
  'scene-construction': { w: 1200, h: 900, q: 'static=1&bg=none&scene=2&fz=1.35&fy=.03', lab: 'lab2.html' },
};
(async () => {
  const names = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(JOBS);
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe', headless: 'new',
    args: ['--hide-scrollbars', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
  });
  for (const n of names) {
    const j = JOBS[n];
    const page = await browser.newPage();
    await page.setViewport({ width: j.w, height: j.h, deviceScaleFactor: 1 });
    page.on('pageerror', (e) => console.log('PAGEERROR:', String(e.stack).split('\n').slice(0, 3).join(' | ')));
    await page.goto('file:///' + path.join(__dirname, j.lab || 'lab.html').split(path.sep).join('/') + '?' + j.q, { waitUntil: 'load' });
    await page.waitForFunction('window.__ready', { timeout: 30000 });
    await new Promise((r) => setTimeout(r, 2500));
    await page.screenshot({ path: path.join(OUT, n + '.png'), omitBackground: true });
    console.log('ok', n);
    await page.close();
  }
  await browser.close();
})();
