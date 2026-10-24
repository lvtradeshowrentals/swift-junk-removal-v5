const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core');
const path = require('path');
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe', headless: 'new', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage(); await p.setViewport({ width: 900, height: 600 });
  p.on('pageerror', (e) => console.log('PAGEERROR', String(e.stack).split('\n').slice(0, 4).join(' | ')));
  await p.goto('file:///' + path.join(__dirname, 'labh.html').split(path.sep).join('/') + '?still=0', { waitUntil: 'load' });
  await p.waitForFunction('window.__done', { timeout: 120000 });
  console.log(JSON.stringify(await p.evaluate(() => { const h = window.hero; h.renderer.info.autoReset = true; h.frame(performance.now() + 50); const i = h.renderer.info; const parts = {}; h.scene.traverse((o) => { if (o.isMesh || o.isPoints || o.isSprite) { let top = o; while (top.parent && top.parent !== h.scene && top.parent.parent !== h.scene) top = top.parent; const k = (top.parent && top.parent.parent === h.scene ? top.parent : top).type + ':' + (top.name || top.children.length); }}); let vis = 0, shadow = 0, kinds = {}; h.scene.traverse((o) => { if (o.isMesh && o.visible) { let v = true, p = o; while (p) { if (!p.visible) v = false; p = p.parent; } if (v) { vis++; if (o.castShadow) shadow++; const k = o.userData.merged ? 'merged' : (o.geometry.type); kinds[k] = (kinds[k] || 0) + 1; } } }); return { vis, shadow, kinds, calls: i.render.calls, tris: i.render.triangles, geoms: i.memory.geometries, tex: i.memory.textures, progs: i.programs.length }; })));
  await b.close();
})();
