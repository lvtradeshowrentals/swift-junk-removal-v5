// Real mouse/touch wiring test (no JS clicks). node wire.cjs [desktop|phone]
const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core');
const path = require('path');
const mobile = process.argv[2] === 'phone';
const smooth = process.argv.includes('--lenis');
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe', headless: 'new' });
  const p = await b.newPage();
  await p.setViewport(mobile ? { width: 390, height: 780, deviceScaleFactor: 1, isMobile: true, hasTouch: true } : { width: 1512, height: 900 });
  p.on('pageerror', (e) => console.log('PAGEERROR', e.message));
  await p.goto('file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/') + '?noscene=1&nosplash' + (smooth ? '' : '&nosmooth'), { waitUntil: 'load' });
  await wait(2500);
  const Y = () => p.evaluate(() => Math.round(scrollY));
  const center = (sel) => p.evaluate((s) => { const r = document.querySelector(s).getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }, sel);
  const top = (sel) => p.evaluate((s) => Math.round(document.querySelector(s).getBoundingClientRect().top), sel);
  const hit = (sel) => p.evaluate((s) => { const e = document.querySelector(s), r = e.getBoundingClientRect(), t = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return e === t || e.contains(t); }, sel);
  console.log('lenis on:', smooth);
  console.log('hit tests', { zip: await hit('#zipbar button'), navHow: mobile ? 'n/a' : await hit('.nav-links a[href="#how"]'), heroTel: await hit('.zipnote a') });
  if (!mobile) {
    await p.mouse.click(...(await center('.nav-links a[href="#how"]'))); await wait(2400);
    console.log('nav How -> how top', await top('#how'));
  }
  await p.evaluate(() => { const s = document.getElementById('services'); window.scrollTo(0, s.getBoundingClientRect().top + scrollY + 120); }); await wait(1500);
  const sl = () => p.evaluate(() => Math.round(document.getElementById('svcTrack').scrollLeft));
  if (!mobile) {
    console.log('arrow hit', await hit('#svcNext'));
    await p.mouse.click(...(await center('#svcNext'))); await wait(1200); console.log('after arrow', await sl());
    const [x, y] = await center('#svcTrack');
    await p.mouse.move(x, y); await p.mouse.wheel({ deltaX: 400, deltaY: 0 }); await wait(1000); console.log('after sideways wheel', await sl());
    await p.mouse.move(x + 300, y); await p.mouse.down(); await p.mouse.move(x - 200, y, { steps: 14 }); await p.mouse.up(); await wait(1200); console.log('after mouse drag', await sl());
    await p.mouse.click(...(await center('#svcPrev'))); await wait(1200); console.log('after prev', await sl());
  } else {
    const cdp = await p.target().createCDPSession();
    await p.evaluate(() => { const t = document.getElementById('svcTrack'); window.scrollTo(0, t.getBoundingClientRect().top + scrollY - 150); }); await wait(800);
    const [cx, cy] = await center('#svcTrack');
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: cx + 100, y: cy }] });
    for (let i = 1; i <= 12; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: cx + 100 - i * 20, y: cy }] }); await wait(16); }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await wait(1200);
    console.log('after swipe', await sl());
  }
  // card link -> quote with service picked
  await p.evaluate(() => { const l = document.querySelectorAll('.card a.link')[1]; window.scrollTo(0, l.getBoundingClientRect().top + scrollY - 400); }); await wait(900);
  console.log('card link hit', await hit('.card:nth-child(2) a.link'));
  await p.mouse.click(...(await center('.card:nth-child(2) a.link'))); await wait(2400);
  console.log('card link -> quote top', await top('#quote'), 'construction checked', await p.evaluate(() => document.querySelector('input[value=construction]').checked));
  // dock (phone) + FAQ + finale buttons
  await p.evaluate(() => { const f = document.getElementById('faq'); window.scrollTo(0, f.getBoundingClientRect().top + scrollY); }); await wait(900);
  await p.mouse.click(...(await center('#q-1'))); await wait(700);
  console.log('faq open', await p.evaluate(() => document.getElementById('q-1').getAttribute('aria-expanded')));
  await p.evaluate(() => { const f = document.getElementById('finale'); window.scrollTo(0, f.getBoundingClientRect().top + scrollY + 100); }); await wait(900);
  console.log('finale CTA hit', await hit('.fin-act .btn--white'));
  await p.mouse.click(...(await center('.fin-act .btn--white'))); await wait(2400);
  console.log('finale CTA -> quote top', await top('#quote'));
  if (mobile) {
    await p.evaluate(() => scrollTo(0, 0)); await wait(500);
    await p.mouse.click(...(await center('#burger'))); await wait(700);
    console.log('menu open', await p.evaluate(() => document.getElementById('burger').getAttribute('aria-expanded')), 'link hit', await hit('.sheet nav a[href="#how"]'));
    await p.mouse.click(...(await center('.sheet nav a[href="#how"]'))); await wait(2400);
    console.log('menu How -> how top', await top('#how'), 'sheet hidden', await p.evaluate(() => document.getElementById('sheet').hidden));
  }
  await b.close();
})();
