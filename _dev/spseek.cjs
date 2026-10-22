// node spseek.cjs <desktop|phone> name t1,t2,...   freezes the splash at each time (ms) and screenshots it
const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core');
const path = require('path');
const SIZES = { desktop: { width: 1512, height: 900, deviceScaleFactor: 1 }, phone: { width: 390, height: 780, deviceScaleFactor: 2, isMobile: true, hasTouch: true } };
const [size = 'desktop', name = 'sp', ts = '300,900,1500,2100,2500,3000'] = process.argv.slice(2);
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe', headless: 'new', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage(); await p.setViewport(SIZES[size]);
  p.on('pageerror', (e) => console.log('PAGEERROR', e.message));
  await p.goto('file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/') + '?nosmooth&splashhold&noscene=1', { waitUntil: 'load' });
  await new Promise((r) => setTimeout(r, 1500));
  for (const t of ts.split(',').map(Number)) {
    await p.evaluate((t) => window.__splashSeek(t), t);
    await new Promise((r) => setTimeout(r, 200));
    await p.screenshot({ path: path.join(__dirname, 'shots', `${name}_${t}.png`) });
    console.log('shot', t);
  }
  await b.close();
})();
