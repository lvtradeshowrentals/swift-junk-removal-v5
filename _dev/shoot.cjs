// Dev-only screenshots of the page.
//   node shoot.cjs <size> <name> [--p 0,.5,1] [--y 0,1200] [--sel "#quote|#faq@-80"] [--full] [--wait ms] [--reduce] [--eval "js"] [--q "still=1"]
// size: desktop | laptop | wide | tablet | phone | phones (390x664) | small (360x640)
const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core');
const path = require('path');
const fs = require('fs');

const SIZES = {
  desktop: { width: 1512, height: 900, deviceScaleFactor: 1 },
  laptop: { width: 1280, height: 720, deviceScaleFactor: 1 },
  wide: { width: 1920, height: 1080, deviceScaleFactor: 1 },
  tablet: { width: 820, height: 1100, deviceScaleFactor: 1 },
  phone: { width: 390, height: 780, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  phones: { width: 390, height: 664, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  small: { width: 360, height: 640, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
};
const a = process.argv.slice(2);
const size = a[0] || 'desktop', name = a[1] || 'shot';
const opt = (k, d) => { const i = a.indexOf('--' + k); return i > -1 ? a[i + 1] : d; };
const OUT = path.join(__dirname, 'shots');
fs.mkdirSync(OUT, { recursive: true });
const URL = 'file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/') + '?nosmooth&nosplash' + (opt('q') ? '&' + opt('q') : '');
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const settle = (page, n = 30) => page.evaluate((n) => new Promise((r) => { let i = 0; (function f() { if (++i > n) setTimeout(r, 300); else requestAnimationFrame(f); })(); }), n);

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe', headless: 'new',
    args: ['--hide-scrollbars', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
  });
  const page = await browser.newPage();
  await page.setViewport(SIZES[size]);
  page.on('pageerror', (e) => console.log('PAGEERROR:', String(e.stack).split('\n').slice(0, 4).join(' | ')));
  page.on('console', (m) => { const t = m.text(); if (/error|warn|fail|scene off/i.test(t)) console.log('CON:', t.slice(0, 300)); });
  if (a.includes('--reduce')) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.goto(URL, { waitUntil: 'load', timeout: 90000 }).catch((e) => console.log('goto:', e.message));
  await page.evaluate(() => Promise.race([Promise.all([document.fonts.load('600 100px "Funnel Display"'), document.fonts.load('400 16px "Funnel Sans"')]).then(() => document.fonts.ready), new Promise((r) => setTimeout(r, 12000))]));
  await wait(+(opt('wait', 4200)));
  if (opt('eval')) { await page.evaluate(opt('eval')); await settle(page); }
  const shots = [];
  const shoot = async (label, full) => { const f = path.join(OUT, `${name}_${label}.png`); await page.screenshot({ path: f, fullPage: !!full }); shots.push(f); };
  const heroY = (p) => page.evaluate((p) => { const h = document.getElementById('top'), vh = innerHeight, tr = h.offsetHeight - vh; return vh * .05 + p * (tr * .9 - vh * .05); }, p);
  if (opt('p')) {
    for (const p of opt('p').split(',')) {
      const y = await heroY(+p);
      await page.evaluate((y) => window.scrollTo(0, y), y);
      await settle(page, 50); await wait(+(opt('hold', 900)));
      await shoot('p' + String(p).replace('.', ''));
    }
  } else if (opt('sel')) {
    for (const s0 of opt('sel').split('|')) {
      const [s, off] = s0.split('@');
      await page.evaluate((s, off) => { const el = document.querySelector(s); window.scrollTo(0, el.getBoundingClientRect().top + scrollY + (+off || 0)); }, s, off);
      await settle(page); await wait(900);
      await shoot(s0.replace(/[^a-z0-9]/gi, ''));
    }
  } else if (opt('y')) {
    for (const y of opt('y').split(',')) {
      await page.evaluate((y) => window.scrollTo(0, +y), y);
      await settle(page); await wait(700);
      await shoot('y' + y);
    }
  } else await shoot('top', a.includes('--full'));
  shots.forEach((f) => console.log('shot', f));
  console.log(JSON.stringify(await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, h: document.documentElement.scrollHeight }))));
  await browser.close();
})();
