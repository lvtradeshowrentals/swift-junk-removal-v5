const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core');
const path = require('path');
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe', headless: 'new' });
  const p = await b.newPage(); await p.setViewport({ width: 1512, height: 900 });
  await p.goto('file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/') + '?noscene=1&nosmooth', { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 2000));
  console.log(await p.evaluate(() => { const t = document.getElementById('svcTrack'); t.style.scrollSnapType = 'none'; t.scrollLeft = 500; const cs = getComputedStyle(t); return [t.scrollLeft, cs.overflowX, cs.scrollSnapType, cs.display, t.scrollWidth, t.clientWidth]; }));
  console.log(await p.evaluate(() => { const t = document.getElementById('svcTrack'); t.style.scrollSnapType = ''; t.scrollLeft = 500; return t.scrollLeft; }));
  console.log(await p.evaluate(() => document.getElementById('svcTrack').scrollBy({ left: 400 }) || document.getElementById('svcTrack').scrollLeft));
  await b.close();
})();
