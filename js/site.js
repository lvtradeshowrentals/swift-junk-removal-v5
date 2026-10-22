/* ============================================================================
   Swift Junk Removal V5 "Rollout".
   The hero is a 3D room that clears itself as you scroll (js/scene.js). Everything
   else on the page is plain HTML and CSS that this file wakes up.
   ========================================================================== */
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const qs = (s, r) => (r || document).querySelector(s);
  const qsa = (s, r) => Array.from((r || document).querySelectorAll(s));
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const params = new URLSearchParams(location.search);
  const root = document.documentElement;
  const phoneMq = matchMedia('(max-width: 959px)');

  /* ---------- smooth scroll (wheel only; touch stays native) ---------- */
  let lenis = null;
  if (!reduce && !params.has('nosmooth') && window.Lenis) {
    lenis = new Lenis({ lerp: .12, wheelMultiplier: .95, smoothWheel: true });
    const tick = (t) => { lenis.raf(t); requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }
  const scrollTo = (target, off) => {
    const el = typeof target === 'string' ? qs(target) : target;
    if (el == null) return;
    if (lenis) lenis.scrollTo(el, { offset: off || 0, duration: 1.4, easing: (x) => 1 - Math.pow(1 - x, 4) });
    else window.scrollTo({ top: (typeof el === 'number' ? el : el.getBoundingClientRect().top + scrollY) + (off || 0), behavior: reduce ? 'auto' : 'smooth' });
  };
  const secOffset = (el) => (el.tagName === 'SECTION' ? (parseFloat(getComputedStyle(el).paddingTop) || 0) - (phoneMq.matches ? 78 : 96) : 0);
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    const el = qs(id);
    if (!el) return;
    e.preventDefault();
    closeMenu();
    if (id === '#top') scrollTo(0); else scrollTo(el, secOffset(el));
    history.replaceState(null, '', id);
  });

  /* ---------- menu (phones) ---------- */
  const nav = $('nav'), burger = $('burger'), sheet = $('sheet');
  function closeMenu() {
    if (!burger || burger.getAttribute('aria-expanded') !== 'true') return;
    burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Open menu');
    sheet.classList.remove('open'); setTimeout(() => { sheet.hidden = true; }, 300);
    if (lenis) lenis.start();
    navTone();
  }
  if (burger) burger.addEventListener('click', () => {
    if (burger.getAttribute('aria-expanded') === 'true') { closeMenu(); return; }
    sheet.hidden = false; void sheet.offsetWidth; sheet.classList.add('open');
    burger.setAttribute('aria-expanded', 'true'); burger.setAttribute('aria-label', 'Close menu');
    nav.classList.add('dark');
    if (lenis) lenis.stop();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

  /* ---------- ZIP lookup (hero + form) ---------- */
  const HENDERSON = ['89002', '89011', '89012', '89014', '89015', '89044', '89052', '89053', '89074'];
  const NORTH_LV = ['89030', '89031', '89032', '89081', '89084', '89085', '89086', '89087'];
  function zone(raw) {
    const zip = String(raw || '').trim().slice(0, 5);
    if (!/^\d{5}$/.test(zip)) return null;
    if (HENDERSON.indexOf(zip) > -1) return { zip, city: 'Henderson', level: 'ok' };
    if (NORTH_LV.indexOf(zip) > -1) return { zip, city: 'North Las Vegas', level: 'near' };
    const n = +zip;
    if (n >= 89101 && n <= 89199) return { zip, city: 'Las Vegas', level: 'ok' };
    return { zip, city: '', level: 'out' };
  }
  function zoneText(z) {
    if (!z) return ['', ''];
    if (z.level === 'ok') return ['Yes, we cover ' + z.city + '.', 'ok'];
    if (z.level === 'near') return [z.city + ' is just outside our usual area. Send it and we will confirm.', 'no'];
    return ["That's outside our usual area. Send it anyway and we'll tell you.", 'no'];
  }

  /* ---------- load-in once the display font is ready ---------- */
  let started = false;
  const go = () => { if (started) return; started = true; root.classList.add('go'); };
  if (document.fonts && document.fonts.load) {
    Promise.race([
      Promise.all([document.fonts.load('600 100px "Funnel Display"'), document.fonts.load('400 16px "Funnel Sans"')]),
      new Promise((r) => setTimeout(r, 1800)),
    ]).then(go);
  } else go();
  setTimeout(go, 2200);

  /* ---------- hero: ZIP bar ---------- */
  const heroZip = $('heroZip'), heroNote = $('heroNote'), zipbar = $('zipbar');
  const noteDefault = heroNote ? heroNote.innerHTML : '';
  if (heroZip) {
    heroZip.addEventListener('input', () => {
      heroZip.value = heroZip.value.replace(/\D/g, '');
      const z = zone(heroZip.value), t = zoneText(z);
      if (!z) { heroNote.className = 'zipnote'; heroNote.innerHTML = noteDefault; return; }
      heroNote.className = 'zipnote ' + t[1]; heroNote.textContent = t[0];
    });
    zipbar.addEventListener('submit', (e) => {
      e.preventDefault();
      const fz = $('f-zip');
      if (fz && heroZip.value) { fz.value = heroZip.value; fz.dispatchEvent(new Event('input')); }
      const q = $('quote'); if (q) scrollTo(q, secOffset(q));
    });
  }

  /* ==========================================================================
     HERO SCENE
     ========================================================================== */
  const heroEl = $('top'), stage = $('stage'), cv = $('stageCv');
  const meter = $('meter'), meterN = $('meterN'), meterBar = $('meterBar'), meterHint = $('meterHint');
  const hintTx = meterHint ? qs('span', meterHint) : null;
  const coarse = matchMedia('(pointer: coarse)').matches;
  let scene = null, heroVisible = true, lastP = -1;
  const posterB = qs('.poster--b'), posterA = qs('.poster--a');

  function frameFn(w, h, portrait) {
    if (portrait) {
      const z = clamp(1.125 * w / h, .4, 1.2);
      return { zoom: z, x: 0, y: h < 700 ? -.012 : .04 };
    }
    const z = Math.min(clamp(h / 780, .8, 1.4), .65 * w / h);
    return { zoom: z, x: w > 1500 ? .2 : .215, y: .035 };
  }

  function heroP() {
    const r = heroEl.getBoundingClientRect(), travel = heroEl.offsetHeight - innerHeight;
    const start = innerHeight * .05, end = travel * .9;
    return clamp((-r.top - start) / Math.max(1, end - start));
  }

  function updateHero() {
    const p = heroP();
    if (p === lastP) return; lastP = p;
    if (scene) scene.set(p);
    if (!scene) { if (posterB) posterB.style.opacity = String(p); if (posterA) posterA.style.opacity = String(1 - p); }
    if (meterBar) meterBar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    if (hintTx) {
      const t = p < .03 ? 'Clear the room' : p > .965 ? 'Cleared. Keep going' : 'Clearing';
      if (hintTx.textContent !== t) hintTx.textContent = t;
    }
    meter.classList.toggle('done', p > .965);
  }

  /* the hint is a button: one tap plays the whole clear-out (the same thing scrolling does) */
  const heroEndY = () => { const r = heroEl.getBoundingClientRect(), tr = heroEl.offsetHeight - innerHeight; return r.top + scrollY + innerHeight * .05 + (tr * .9 - innerHeight * .05) + 2; };
  if (meterHint) meterHint.addEventListener('click', () => {
    if (lastP > .965) { const s = $('services'); if (s) scrollTo(s, secOffset(s)); return; }
    if (lenis) lenis.scrollTo(heroEndY(), { duration: 2.6, easing: (x) => 1 - Math.pow(1 - x, 3) });
    else window.scrollTo({ top: heroEndY(), behavior: reduce ? 'auto' : 'smooth' });
  });

  function startScene() {
    if (!window.SwiftScene || params.has('noscene')) { stage.classList.add('static'); return; }
    try {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) { stage.classList.add('static'); return; }
      scene = SwiftScene.createHero(cv, { low: coarse || (navigator.hardwareConcurrency || 8) <= 4, frame: frameFn, static: reduce });
      scene.items.length && (meterN.textContent = String(scene.items.length));
      if (params.has('introt')) scene.introAt(+params.get('introt')); else if (reduce || params.has('still')) scene.introNow(); else scene.play();
      stage.classList.add('live');
      scene.resize();
      let raf = 0;
      const loop = (t) => { raf = requestAnimationFrame(loop); if (heroVisible) { scene.frame(t); const left = scene.left(); if (meterN.textContent !== String(left)) meterN.textContent = String(left); } };
      raf = requestAnimationFrame(loop);
      addEventListener('resize', () => scene.resize());
      if (!coarse && !reduce) addEventListener('pointermove', (e) => scene.pointer((e.clientX / innerWidth - .5) * 2, (e.clientY / innerHeight - .5) * 2), { passive: true });
      if ('IntersectionObserver' in window) new IntersectionObserver((es) => { heroVisible = es[0].isIntersecting; }, { rootMargin: '10% 0px' }).observe(heroEl);
      lastP = -1; updateHero();
      window.__scene = scene;
    } catch (err) { scene = null; stage.classList.remove('live'); stage.classList.add('static'); if (window.console) console.warn('scene off', err); }
  }
  startScene();

  /* ==========================================================================
     SECTIONS
     ========================================================================== */

  /* ---------- what we take: the lineup scroller ---------- */
  const track = $('svcTrack'), prev = $('svcPrev'), next = $('svcNext'), prog = $('svcProg');
  if (track) {
    const cards = qsa('.card', track);
    const step = () => { const c = cards[0], gap = parseFloat(getComputedStyle(track).columnGap) || 20; return c.getBoundingClientRect().width + gap; };
    let ptick = false;
    const upd = () => {
      ptick = false;
      const max = track.scrollWidth - track.clientWidth, x = track.scrollLeft;
      if (prev) prev.disabled = x < 4;
      if (next) next.disabled = x > max - 4;
      if (prog) {
        const vis = track.clientWidth / track.scrollWidth;
        prog.style.width = (vis * 100).toFixed(1) + '%';
        prog.style.transform = 'translateX(' + ((max > 0 ? x / max : 0) * (1 / vis - 1) * 100).toFixed(2) + '%)';
      }
    };
    track.addEventListener('scroll', () => { if (!ptick) { ptick = true; requestAnimationFrame(upd); } }, { passive: true });
    addEventListener('resize', upd);
    const by = (dir) => track.scrollBy({ left: dir * step(), behavior: reduce ? 'auto' : 'smooth' });
    if (prev) prev.addEventListener('click', () => by(-1));
    if (next) next.addEventListener('click', () => by(1));
    track.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') { e.preventDefault(); by(1); } else if (e.key === 'ArrowLeft') { e.preventDefault(); by(-1); } });
    // a mouse can drag the lineup like a trackpad swipe
    let down = false, sx = 0, sl = 0, moved = false;
    track.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = track.scrollLeft; });
    addEventListener('pointermove', (e) => { if (!down) return; const dx = e.clientX - sx; if (Math.abs(dx) > 5) { moved = true; track.style.scrollSnapType = 'none'; track.style.cursor = 'grabbing'; } if (moved) track.scrollLeft = sl - dx; });
    addEventListener('pointerup', () => { if (!down) return; down = false; track.style.cursor = ''; if (moved) { const i = Math.round(track.scrollLeft / step()); track.scrollTo({ left: i * step(), behavior: 'smooth' }); setTimeout(() => { track.style.scrollSnapType = ''; }, 450); } });
    track.addEventListener('click', (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    upd();
  }

  /* ---------- how: each phone plays once when it arrives ---------- */
  const steps = qsa('.step');
  function playStep(s) {
    if (s.classList.contains('play')) return;
    s.classList.add('play');
    const n = s.dataset.s;
    if (n === '2') setTimeout(() => qs('.pc-ok', s).classList.add('press'), 2700);
    if (n === '3') qsa('.trk li', s).forEach((li, i) => setTimeout(() => li.classList.add('on'), [500, 1300, 2000, 4100][i]));
  }
  window.__playStep = playStep;
  if ('IntersectionObserver' in window && !reduce) {
    const io2 = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { playStep(en.target); io2.unobserve(en.target); } }), { threshold: .55 });
    steps.forEach((s) => io2.observe(s));
  } else steps.forEach((s) => { playStep(s); if (reduce) { s.classList.add('play'); } });

  /* ---------- coverage: the ZIP check drives the map ---------- */
  const covZip = $('covZip'), covOut = $('covOut'), map = $('map');
  if (covZip) {
    const dflt = covOut.innerHTML;
    covZip.addEventListener('input', () => {
      covZip.value = covZip.value.replace(/\D/g, '');
      const z = zone(covZip.value);
      if (!z) { covOut.className = 'zc-out'; covOut.innerHTML = dflt; map.removeAttribute('data-z'); return; }
      const t = zoneText(z);
      covOut.className = 'zc-out ' + z.level; covOut.textContent = t[0];
      map.dataset.z = z.level === 'ok' ? (z.city === 'Henderson' ? 'he' : 'lv') : z.level === 'near' ? 'nl' : 'out';
    });
    $('zipcheck').addEventListener('submit', (e) => e.preventDefault());
  }

  /* ---------- FAQ ---------- */
  qsa('.qa button').forEach((b) => b.addEventListener('click', () => {
    const li = b.closest('.qa'), open = li.classList.contains('on');
    qsa('.qa.on').forEach((o) => { if (o !== li) { o.classList.remove('on'); qs('button', o).setAttribute('aria-expanded', 'false'); } });
    li.classList.toggle('on', !open); b.setAttribute('aria-expanded', String(!open));
  }));

  /* ---------- finale headline rises when it arrives ---------- */
  const fin = $('finale');
  if (fin && 'IntersectionObserver' in window && !reduce) {
    const io3 = new IntersectionObserver((es) => { if (es[0].isIntersecting) { fin.classList.add('in'); io3.disconnect(); } }, { threshold: .3 });
    io3.observe(fin);
  } else if (fin) fin.classList.add('in');

  /* ---------- nav tone + dock + hide-on-scroll (phones) ---------- */
  const darks = qsa('.how, .fin, .foot');
  const dockEl = $('dock'), quoteEl = $('quote');
  let lastY = scrollY, quietT = 0;
  function onScroll() {
    navTick = false;
    const y = scrollY;
    nav.classList.toggle('solid', y > 24);
    const dk = darks.some((s) => { const r = s.getBoundingClientRect(); return r.top <= 38 && r.bottom >= 38; });
    nav.classList.toggle('dark', dk || (burger && burger.getAttribute('aria-expanded') === 'true'));
    updateHero();
    // phones: nav and dock slide away while you scroll down, return when you scroll up or pause
    const dy = y - lastY;
    if (Math.abs(dy) >= 6) {
      lastY = y;
      if (!phoneMq.matches) nav.classList.remove('hide');
      else {
        const hero = heroEl.getBoundingClientRect(), inHero = hero.top > -(heroEl.offsetHeight - innerHeight - 40);
        const down = dy > 0 && y > 140, menuOpen = burger && burger.getAttribute('aria-expanded') === 'true';
        nav.classList.toggle('hide', down && !menuOpen && !inHero);
        if (dockEl) dockEl.classList.toggle('quiet', down);
        clearTimeout(quietT);
        if (down && dockEl) quietT = setTimeout(() => dockEl.classList.remove('quiet'), 700);
      }
    }
    if (dockEl) {
      const h = heroEl.getBoundingClientRect(), q = quoteEl.getBoundingClientRect(), f = fin.getBoundingClientRect();
      const pastHero = h.bottom < innerHeight * .9, inQuote = q.top < innerHeight * .8 && q.bottom > innerHeight * .2, inEnd = f.top < innerHeight * .7;
      dockEl.classList.toggle('show', pastHero && !inQuote && !inEnd);
      dockEl.classList.toggle('dark', darks.some((s) => { const r = s.getBoundingClientRect(); return r.top <= innerHeight - 40 && r.bottom >= innerHeight - 40; }));
    }
  }
  let navTick = false;
  function navTone() { onScroll(); }
  addEventListener('scroll', () => { if (!navTick) { navTick = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', () => { lastP = -1; onScroll(); });
  onScroll();

  /* ==========================================================================
     QUOTE: the load gauge and the three-step form
     ========================================================================== */
  const STOPS = [
    { n: 'A few items', sub: 'A couch, a chair or a few boxes. Quick and light.' },
    { n: 'A quarter load', sub: 'A small room clear-out, or a handful of big pieces.' },
    { n: 'About half a load', sub: 'A garage of boxes and a couple of mattresses.' },
    { n: 'Three-quarters of a load', sub: 'Most of a room, a patio set and the extras.' },
    { n: 'A full load', sub: 'A big garage, or a small home cleared out.' },
    { n: 'More than one load', sub: "Bigger than a truck bed. We'll plan the trips or a larger truck." },
  ];
  const SERVICES = { garage: 'Home, garage or estate', furniture: 'Furniture and appliances', construction: 'Construction debris', commercial: 'Office or property', yard: 'Yard or outdoor', general: 'Not sure yet' };
  const NEXT = ['Next: where and when', 'Next: your details', 'Send my request'];
  const FINE = ['Takes about a minute. Nothing is sent until the last step.', 'We use the ZIP to pick the nearest crew.', "We'll only use your number to text or call about this job."];

  const form = $('quoteForm'), card = $('formCard');
  if (!form) { window.SWIFT5 = { scrollTo, go, navTone }; return; }
  const St = { step: 1, sel: new Set(), files: [], no: '', loadSet: false };
  let gauge = null;                       // the 3D truck, once it has loaded

  function setLoad(idx, touched) {
    const s = STOPS[idx];
    if (gauge) gauge.setLoad(idx);
    const range = $('f-load'), p = (idx / 5) * 100;
    range.style.setProperty('--p', p + '%');
    if (touched) { St.loadSet = true; range.classList.remove('untouched'); }
    $('sizeOut').textContent = St.loadSet ? s.n : 'Not set';
    $('gVal').textContent = St.loadSet ? s.n : 'Slide to size your load';
    $('gSub').textContent = St.loadSet ? s.sub : 'A rough guess is fine. We confirm the price before we lift.';
    range.setAttribute('aria-valuetext', s.n);
  }
  function orderNo() {
    const d = new Date(), p = (n) => String(n).padStart(2, '0');
    return 'SW-' + p(d.getMonth() + 1) + p(d.getDate()) + '-' + String(Math.floor(1000 + Math.random() * 9000));
  }
  const panes = qsa('.pane', form), stepLis = qsa('#fSteps li');
  const nextBtn = $('fNext'), backBtn = $('fBack'), fine = $('fFine');

  function setStep(n, dir) {
    dir = dir || (n > St.step ? 1 : -1);
    const from = panes[St.step - 1], to = panes[n - 1];
    if (from !== to) {
      to.style.transition = 'none'; to.classList.toggle('back', dir < 0); void to.offsetWidth; to.style.transition = '';
      from.classList.toggle('back', dir > 0);
      from.classList.remove('on'); from.inert = true;
      to.classList.add('on'); to.inert = false;
    }
    St.step = n;
    stepLis.forEach((li, i) => {
      li.classList.toggle('on', i === n - 1); li.classList.toggle('done', i < n - 1);
      const b = qs('button', li); b.disabled = i >= n;
      if (i === n - 1) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
    });
    backBtn.hidden = n === 1;
    $('fNextTx').textContent = NEXT[n - 1];
    fine.textContent = FINE[n - 1];
    const h = qs('h3', to); if (h && from !== to) h.focus({ preventScroll: true });
    if (from !== to && card.getBoundingClientRect().top < 80) scrollTo(card, -96);
  }
  const err = (field, errId, msg) => {
    const f = typeof field === 'string' ? $(field) : field, e = $(errId);
    if (f) { if (msg) f.setAttribute('aria-invalid', 'true'); else f.removeAttribute('aria-invalid'); }
    e.textContent = msg || '';
    return !msg;
  };
  function validate(n) {
    if (n === 1) return err(null, 'e-service', St.sel.size ? '' : 'Pick at least one, or choose Not sure yet.');
    if (n === 2) {
      const v = $('f-zip').value.trim();
      return err('f-zip', 'e-zip', !v ? 'Enter your ZIP so we know where to send the crew.' : /^\d{5}(-\d{4})?$/.test(v) ? '' : 'Use a 5-digit ZIP code, like 89101.');
    }
    const name = $('f-name').value.trim(), phone = $('f-phone').value.replace(/\D/g, '');
    const a = err('f-name', 'e-name', name ? '' : 'Enter your name so we know who to ask for.');
    const b = err('f-phone', 'e-phone', phone.length >= 10 ? '' : 'Enter a number with area code so we can text you.');
    return a && b;
  }
  function advance() {
    if (!validate(St.step)) { const bad = qs('[aria-invalid="true"]', panes[St.step - 1]); if (bad) bad.focus(); else qs('.tile input', panes[0]).focus(); return; }
    if (St.step < 3) setStep(St.step + 1, 1); else send();
  }

  /* photos */
  function renderThumbs() {
    const ul = $('thumbs'); ul.innerHTML = '';
    St.files.forEach((f, i) => {
      const li = document.createElement('li'), img = document.createElement('img'), b = document.createElement('button');
      img.alt = ''; img.src = f._url; b.type = 'button'; b.textContent = '×'; b.setAttribute('aria-label', 'Remove photo ' + (i + 1));
      b.addEventListener('click', () => { URL.revokeObjectURL(f._url); St.files.splice(i, 1); syncFiles(); renderThumbs(); });
      li.appendChild(img); li.appendChild(b); ul.appendChild(li);
    });
    $('dropLabel').innerHTML = St.files.length ? '<b>' + St.files.length + (St.files.length === 1 ? ' photo' : ' photos') + ' added</b>. Add more' : '<b>Add photos</b> or drop them here';
  }
  function syncFiles() { try { const dt = new DataTransfer(); St.files.forEach((f) => dt.items.add(f)); $('f-photos').files = dt.files; } catch (e) { /* older browsers keep the picker's own list */ } }
  function addFiles(list) {
    Array.from(list || []).forEach((f) => {
      if (!/^image\//.test(f.type) || f.size > 15 * 1024 * 1024 || St.files.length >= 6) return;
      f._url = URL.createObjectURL(f); St.files.push(f);
    });
    syncFiles(); renderThumbs();
  }

  /* send: counts as sent only when the inbox service says so */
  function send() {
    const endpoint = form.getAttribute('data-endpoint'), fail = $('sendFail'), btn = nextBtn;
    const done = () => {
      fail.hidden = true; $('doneNo').textContent = St.no;
      card.classList.add('sent');
      $('success').focus({ preventScroll: true });
      if (card.getBoundingClientRect().top < 80) scrollTo(card, -96);
    };
    const failed = () => { btn.disabled = false; fail.hidden = false; fail.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); };
    const fd = new FormData(form);
    fd.delete('service');
    fd.append('reference', St.no);
    fd.append('_subject', 'New quote request ' + St.no + ' (Swift Junk Removal)');
    fd.append('_template', 'table'); fd.append('_captcha', 'false');
    fd.append('services', Array.from(St.sel).map((k) => SERVICES[k]).join(', '));
    fd.append('load_size', St.loadSet ? STOPS[+$('f-load').value].n : 'Not set');
    btn.disabled = true;
    fetch(endpoint, { method: 'POST', body: fd, headers: { Accept: 'application/json' } })
      .then((r) => r.json().catch(() => ({})).then((j) => { if (r.ok && j.success !== 'false' && j.success !== false) { btn.disabled = false; done(); } else failed(); }))
      .catch(failed);
  }
  function reset() {
    form.reset(); St.sel.clear(); St.files.forEach((f) => URL.revokeObjectURL(f._url)); St.files = []; renderThumbs();
    qsa('[aria-invalid]', form).forEach((e) => e.removeAttribute('aria-invalid'));
    qsa('.err', form).forEach((e) => { e.textContent = ''; });
    $('zipNote').textContent = ''; $('zipNote').className = 'zip-note';
    St.no = orderNo(); St.loadSet = false; $('f-load').classList.add('untouched'); $('f-load').value = 2; setLoad(2, false);
    $('sendFail').hidden = true;
    card.classList.remove('sent');
    panes.forEach((p, i) => { p.classList.toggle('on', i === 0); p.classList.remove('back'); p.inert = i !== 0; });
    St.step = 1; setStep(1, -1);
  }

  /* wiring */
  setLoad(2, false);
  const gaugeEl = $('gauge'), qGrid = qs('.q-grid'), sizeBlock = qs('.size', form);
  /* on a phone the gauge moves next to the slider, so you watch it react to your thumb */
  const placeGauge = () => { if (phoneMq.matches) sizeBlock.insertBefore(gaugeEl, $('f-load')); else qGrid.insertBefore(gaugeEl, qGrid.firstChild); if (gauge) gauge.resize(); };
  placeGauge();
  (phoneMq.addEventListener ? phoneMq.addEventListener('change', placeGauge) : phoneMq.addListener(placeGauge));
  St.no = orderNo();
  const rng = $('f-load');
  rng.addEventListener('input', () => setLoad(+rng.value, true));
  qsa('.range-ticks span').forEach((s, i) => s.addEventListener('click', () => { rng.value = i; setLoad(i, true); }));

  qsa('input[name="service"]', form).forEach((inp) => inp.addEventListener('change', () => {
    if (inp.checked && inp.value === 'general') { St.sel.clear(); qsa('input[name="service"]', form).forEach((o) => { if (o !== inp) o.checked = false; }); }
    else if (inp.checked) { St.sel.delete('general'); const g = qs('input[value="general"]', form); if (g) g.checked = false; }
    if (inp.checked) St.sel.add(inp.value); else St.sel.delete(inp.value);
    err(null, 'e-service', '');
  }));
  const fz = $('f-zip');
  fz.addEventListener('input', () => {
    const z = zone(fz.value), t = zoneText(z), n = $('zipNote');
    n.className = 'zip-note' + (t[1] ? ' ' + t[1] : ''); n.textContent = t[0];
    if (fz.getAttribute('aria-invalid')) validate(2);
  });
  ['f-name', 'f-phone'].forEach((id) => $(id).addEventListener('input', () => { if ($(id).getAttribute('aria-invalid')) validate(3); }));
  nextBtn.addEventListener('click', advance);
  backBtn.addEventListener('click', () => setStep(St.step - 1, -1));
  stepLis.forEach((li, i) => qs('button', li).addEventListener('click', () => { if (i + 1 < St.step) setStep(i + 1, -1); }));
  form.addEventListener('submit', (e) => { e.preventDefault(); advance(); });
  form.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && e.target.type !== 'checkbox' && e.target.type !== 'radio' && e.target.tagName !== 'BUTTON') { e.preventDefault(); advance(); } });
  const drop = $('drop');
  $('f-photos').addEventListener('change', (e) => { const picked = Array.from(e.target.files); St.files.forEach((f) => URL.revokeObjectURL(f._url)); St.files = []; addFiles(picked); });
  ['dragenter', 'dragover'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('over'); }));
  ['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
  drop.addEventListener('drop', (e) => addFiles(e.dataTransfer && e.dataTransfer.files));
  $('fAgain').addEventListener('click', reset);

  /* "Get a price" links elsewhere choose their service first */
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[data-service]');
    if (!a) return;
    const k = a.getAttribute('data-service');
    if (card.classList.contains('sent')) reset();
    if (k && k !== 'general') {
      const inp = qs('input[name="service"][value="' + k + '"]', form);
      if (inp && !inp.checked) { inp.checked = true; inp.dispatchEvent(new Event('change')); }
    }
    if (St.step !== 1) setStep(1, -1);
  });

  /* the 3D truck: built the first time the quote section is near, and only drawn while it is on screen */
  let gaugeOn = false;
  function startGauge() {
    if (gauge || !window.SwiftScene || params.has('noscene')) return;
    try {
      if (!document.createElement('canvas').getContext('webgl2')) return;
      const cvG = $('gaugeCv');
      const g = SwiftScene.createHero(cvG, {
        scene: 'truck', az: 30, el: 33, low: coarse || (navigator.hardwareConcurrency || 8) <= 4, static: reduce,
        frame: (w, h) => ({ zoom: clamp(1.36 * w / h, .8, 1.95), x: 0, y: .03 }),
      });
      g.introNow(); g.resize();
      let raf = 0;
      const loop = (t) => { raf = requestAnimationFrame(loop); if (gaugeOn) g.frame(t); };
      raf = requestAnimationFrame(loop);
      addEventListener('resize', () => g.resize());
      if ('IntersectionObserver' in window) new IntersectionObserver((es) => { gaugeOn = es[0].isIntersecting; }, { rootMargin: '80px' }).observe($('gaugeArt'));
      else gaugeOn = true;
      gauge = g;
      gauge.setLoad(+$('f-load').value);
      $('gaugeArt').classList.add('live');
      /* one short demo the first time it is on screen, so it reads as interactive */
      if (!reduce && 'IntersectionObserver' in window) {
        const iog = new IntersectionObserver((es) => {
          if (!es[0].isIntersecting) return;
          iog.disconnect();
          [0, 1, 3, 4, 2].forEach((idx, n) => setTimeout(() => { if (!St.loadSet) gauge.setLoad(idx); }, 600 + n * 760));
        }, { threshold: .6 });
        iog.observe($('gaugeArt'));
      }
    } catch (err) { gauge = null; if (window.console) console.warn('gauge off', err); }
  }
  if ('IntersectionObserver' in window) { const ioq = new IntersectionObserver((es) => { if (es[0].isIntersecting) { startGauge(); ioq.disconnect(); } }, { rootMargin: '700px 0px' }); ioq.observe($('quote')); } else startGauge();
  window.SWIFT5 = { scrollTo, go, navTone, setLoad };
})();
