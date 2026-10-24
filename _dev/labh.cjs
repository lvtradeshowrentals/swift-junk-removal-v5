// node labh.cjs <w> <h> <name> "<query>" [more times via env T="1,2,3"]
//   Renders labh.html (the real hero controller) at one or several moments of its timeline.
const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core');
const path = require('path');
const [w, h, name, qs = ''] = process.argv.slice(2);
const times = (process.env.T || '').split(',').filter(Boolean).map(Number);
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe', headless: 'new', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage(); await p.setViewport({ width: +w, height: +h, deviceScaleFactor: +(process.env.DPR || 1) });
  p.on('pageerror', (e) => console.log('PAGEERROR', String(e.stack).split('\n').slice(0, 4).join(' | ')));
  p.on('console', (m) => { const t = m.text(); if (/error|warn/i.test(t)) console.log('CON', t.slice(0, 300)); });
  const url = 'file:///' + path.join(__dirname, 'labh.html').split(path.sep).join('/') + '?' + qs;
  if (!times.length) {
    await p.goto(url, { waitUntil: 'load' }); await p.waitForFunction('window.__done', { timeout: 120000 });
    await p.screenshot({ path: path.join(__dirname, 'shots', name + '.png'), omitBackground: qs.includes('bg=none') }); console.log('shot', name);
  } else {
    // one page, stepping forward through the timeline: advance() is cumulative
    await p.goto(url + '&adv=0', { waitUntil: 'load' }); await p.waitForFunction('window.__done', { timeout: 120000 });
    let at = 0;
    for (const t of times) {
      await p.evaluate(async (d) => { await window.hero.advance(d); window.hero.state.last = 0; window.hero.frame(performance.now()); window.hero.frame(performance.now() + 16); }, t - at); at = t;
      await p.screenshot({ path: path.join(__dirname, 'shots', `${name}_${String(t).replace('.', '_')}.png`) }); console.log('shot', t);
    }
  }
  await b.close();
})();
