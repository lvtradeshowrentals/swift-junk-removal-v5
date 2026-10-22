// real mouse/touch on the blueprint gauge. node gwire.cjs [desktop|phone]
const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core');
const path = require('path');
const mobile = process.argv[2] === 'phone';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe', headless: 'new' });
  const p = await b.newPage();
  await p.setViewport(mobile ? { width: 390, height: 780, deviceScaleFactor: 1, isMobile: true, hasTouch: true } : { width: 1512, height: 900 });
  p.on('pageerror', (e) => console.log('PAGEERROR', e.message));
  await p.goto('file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/') + '?noscene=1&nosmooth', { waitUntil: 'load' });
  await wait(2000);
  await p.evaluate(() => { const g = document.getElementById('gaugeArt'); window.scrollTo(0, g.getBoundingClientRect().top + scrollY - 200); });
  await wait(2500);
  const pos = (ft) => p.evaluate((ft) => { const s = document.getElementById('gaugeSvg'), r = s.getBoundingClientRect(), k = r.width / 680; return [r.x + (180 + ft * 25) * k, r.y + 200 * k]; }, ft);
  const val = () => p.evaluate(() => [document.getElementById('f-load').value, document.getElementById('gVal').textContent, document.getElementById('gaugeSvg').dataset.idx, document.getElementById('gaugeSvg').classList.contains('hint')]);
  console.log('start', await val());
  let [x, y] = await pos(12);
  await p.mouse.click(x, y); await wait(600); console.log('click 12ft ->', await val());
  [x, y] = await pos(4); await p.mouse.click(x, y); await wait(600); console.log('click 4ft ->', await val());
  const a = await pos(2), z = await pos(17);
  await p.mouse.move(a[0], a[1]); await p.mouse.down(); await p.mouse.move(z[0], z[1], { steps: 12 }); await p.mouse.up(); await wait(600); console.log('drag 2->17ft ->', await val());
  await p.$eval('#f-load', (e) => { e.value = 1; e.dispatchEvent(new Event('input', { bubbles: true })); }); await wait(400); console.log('slider 1 ->', await val());
  await b.close();
})();
