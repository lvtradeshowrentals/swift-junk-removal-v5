// node dbg.cjs <desktop|phone> "<js expression returning JSON-able>"   (page loaded with noscene)
const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core');
const path = require('path');
const SIZES = { desktop: { width: 1512, height: 900 }, phone: { width: 390, height: 780, deviceScaleFactor: 2, isMobile: true, hasTouch: true } };
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe', headless: 'new' });
  const p = await b.newPage(); await p.setViewport(SIZES[process.argv[2] || 'desktop']);
  p.on('pageerror', (e) => console.log('PAGEERROR', e.message));
  await p.goto('file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/') + '?nosmooth' + (process.env.SCENE ? '' : '&noscene=1') + '', { waitUntil: 'load' });
  await new Promise((r) => setTimeout(r, +(process.env.W || 3000)));
  console.log(JSON.stringify(await p.evaluate(process.argv[3]), null, 1));
  await b.close();
})();
