const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core');
const path = require('path');
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe', headless: 'new', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage(); await p.setViewport({ width: 900, height: 600 });
  p.on('pageerror', (e) => console.log('PAGEERROR', String(e.stack).split('\n').slice(0, 4).join(' | ')));
  await p.goto('file:///' + path.join(__dirname, 'labh.html').split(path.sep).join('/') + '?adv=0', { waitUntil: 'load' });
  await p.waitForFunction('window.__done', { timeout: 120000 });
  await p.evaluate(async () => { await window.hero.advance(6.9); const h = window.hero; h.scene.traverse((o) => { if (o.isPoints && o.geometry.attributes.aT) { window.__b = o; } }); const a = window.__b.geometry.attributes; const live = []; for (let i = 0; i < a.aT.count; i++) if (a.aT.array[i] < 1) live.push([a.position.array[i*3].toFixed(1), a.position.array[i*3+1].toFixed(1), a.position.array[i*3+2].toFixed(1), a.aS.array[i].toFixed(2), a.aT.array[i].toFixed(2)]); window.__live = live.slice(0, 6); });
  console.log(JSON.stringify(await p.evaluate(() => {
    const h = window.hero; const pts = []; h.scene.traverse((o) => { if (o.isPoints) pts.push([o.geometry.attributes.position.count, o.visible, o.material.transparent, o.geometry.attributes.aT ? Array.from(o.geometry.attributes.aT.array).filter((v) => v < 1).length : -1]); });
    return { live: window.__live, scale: window.hero.scene.children.length, pts, landed: h.state.landed, flying: h.items.filter((i) => i.flying).map((i) => i.name) };
  })));
  await b.close();
})();
