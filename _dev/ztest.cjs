const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core');
const path = require('path');
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe', headless: 'new' });
  const p = await b.newPage(); await p.setViewport({ width: 1200, height: 800 });
  p.on('pageerror', (e) => console.log('PAGEERROR', e.message));
  await p.goto('file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/') + '?noscene=1&nosplash', { waitUntil: 'load' });
  await new Promise((r) => setTimeout(r, 1500));
  for (const z of ['89101', '89052', '89030', '89005', '89134', '89123', '89148', '89019', '89048', '89027', '90210', '12345']) {
    await p.$eval('#heroZip', (e, v) => { e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); }, z);
    console.log(z, '->', await p.$eval('#heroNote', (e) => e.className + ' | ' + e.textContent));
  }
  await b.close();
})();
