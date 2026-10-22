const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core');
const path = require('path');
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe', headless: 'new' });
  const p = await b.newPage(); await p.setViewport({ width: 1300, height: 1000 });
  await p.goto('file:///' + path.join(__dirname, 'fonts.html').split(path.sep).join('/'), { waitUntil: 'networkidle0', timeout: 60000 });
  await new Promise(r => setTimeout(r, 1500));
  await p.screenshot({ path: path.join(__dirname, 'shots', 'fonts.png'), fullPage: true });
  await b.close();
})();
