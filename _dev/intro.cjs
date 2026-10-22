// node intro.cjs <size> <name> [t1,t2,...]   frames of the page load, ms after navigation
const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core');
const path = require('path');
const SIZES = {
  desktop: { width: 1512, height: 900, deviceScaleFactor: 1 },
  phone: { width: 390, height: 780, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
};
const [size = 'desktop', name = 'intro', ts = '300,700,1100,1500,2000,3000'] = process.argv.slice(2);
(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe', headless: 'new',
    args: ['--hide-scrollbars', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
  });
  const page = await browser.newPage();
  await page.setViewport(SIZES[size]);
  page.on('pageerror', (e) => console.log('PAGEERROR:', String(e.stack).split('\n').slice(0, 3).join(' | ')));
  const url = 'file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/') + '?nosmooth';
  const t0 = Date.now();
  page.goto(url, { waitUntil: 'load' });
  for (const t of ts.split(',').map(Number)) {
    const wait = t - (Date.now() - t0);
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    const f = path.join(__dirname, 'shots', `${name}_${t}.png`);
    await page.screenshot({ path: f });
    console.log('shot', t, 'actual', Date.now() - t0);
  }
  await browser.close();
})();
