const { createRequire } = require('module'); const req = createRequire('C:/Users/Cleo/Desktop/world2/'); const puppeteer = req('puppeteer-core'); const path = require('path');
(async () => { const b = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const p = await b.newPage(); await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await p.goto('file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/') + '?nosplash&still=1', { waitUntil: 'load' }); await new Promise(r => setTimeout(r, 2500));
await p.tap('#heroZip'); await p.keyboard.type('89101'); await new Promise(r => setTimeout(r, 600));
await p.screenshot({ path: path.join(__dirname, 'shots', 'zt.png') }); await b.close(); })();
