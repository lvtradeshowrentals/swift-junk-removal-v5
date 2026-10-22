const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core');
const path = require('path');
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe', headless: 'new' });
  const p = await b.newPage(); await p.setViewport({ width: 1200, height: 630 });
  await p.goto('file:///' + path.join(__dirname, 'og.html').split(path.sep).join('/'), { waitUntil: 'networkidle0', timeout: 60000 });
  await p.evaluate(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 800));
  await p.screenshot({ path: path.join(__dirname, '..', 'img', 'og.jpg'), type: 'jpeg', quality: 90 });
  await b.close();
  console.log('og ok');
})();
