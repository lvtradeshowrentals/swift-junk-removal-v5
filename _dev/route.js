  /* ---------- how: a road leads you down the three steps. The chevron drives it as you scroll, and each phone plays when the chevron arrives ---------- */
  const steps = qsa('.step');
  function playStep(s) {
    if (s.classList.contains('play')) return;
    s.classList.add('play');
    const n = s.dataset.s;
    if (n === '2') setTimeout(() => qs('.pc-ok', s).classList.add('press'), 3600);
  }
  window.__playStep = playStep;

  const route = $('route'), roadSvg = $('routeRoad'), routeEnd = $('routeEnd');
  const RD = { ready: false, len: 0, ys: [], lens: [], stopLen: [], stopY: [], endY: 0 };
  const r1 = (v) => Math.round(v * 10) / 10;
  const lerp = (a, b, t) => a + (b - a) * t;
  function catmull(pts) {
    let d = 'M' + r1(pts[0][0]) + ' ' + r1(pts[0][1]);
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      d += ' C' + r1(p1[0] + (p2[0] - p0[0]) / 6) + ' ' + r1(p1[1] + (p2[1] - p0[1]) / 6) + ' ' + r1(p2[0] - (p3[0] - p1[0]) / 6) + ' ' + r1(p2[1] - (p3[1] - p1[1]) / 6) + ' ' + r1(p2[0]) + ' ' + r1(p2[1]);
    }
    return d;
  }
  function lenAtY(y) {
    const ys = RD.ys; if (y <= ys[0]) return 0; if (y >= ys[ys.length - 1]) return RD.len;
    let lo = 0, hi = ys.length - 1;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (ys[m] <= y) lo = m; else hi = m; }
    return lerp(RD.lens[lo], RD.lens[hi], (y - ys[lo]) / Math.max(.001, ys[hi] - ys[lo]));
  }
  function buildRoad() {
    const rb = route.getBoundingClientRect(), W = rb.width, H = rb.height, wide = !phoneMq.matches;
    const stops = steps.map((s, i) => {
      if (wide) {
        const tx = qs('.step-tx', s).getBoundingClientRect(), vis = qs('.step-vis', s).getBoundingClientRect(), sr = s.getBoundingClientRect(), even = i % 2 === 1;
        return { x: (even ? (vis.right + tx.left) / 2 : (tx.right + vis.left) / 2) - rb.left, y: sr.top + sr.height / 2 - rb.top, gap: even ? tx.left - vis.right : vis.left - tx.right };
      }
      const h = qs('h3', s).getBoundingClientRect();
      return { x: 24, y: h.top + h.height / 2 - rb.top, gap: 56 };
    });
    const er = routeEnd.getBoundingClientRect();
    const end = wide ? [er.left + er.width / 2 - rb.left, er.top - rb.top - 6] : [er.left - rb.left - 8, er.top - rb.top + er.height / 2];
    const pts = [[stops[0].x, 0]];
    stops.forEach((p, i) => { pts.push([p.x, p.y]); const nx = stops[i + 1]; pts.push(nx ? [(p.x + nx.x) / 2, (p.y + nx.y) / 2] : [(p.x + end[0]) / 2, (p.y + end[1]) / 2]); });
    if (!wide) pts.push([24, end[1]]);
    pts.push(end);
    const d = catmull(pts);
    const gap = Math.min.apply(null, stops.map((p) => p.gap)), w = wide ? Math.max(24, Math.min(44, gap - 14)) : 30, sc = wide ? Math.min(1, Math.max(.5, (gap - 8) / 50)) : .66;

    roadSvg.setAttribute('viewBox', '0 0 ' + r1(W) + ' ' + r1(H)); roadSvg.setAttribute('width', r1(W)); roadSvg.setAttribute('height', r1(H));
    roadSvg.innerHTML = `
      <defs>
        <linearGradient id="rdFade" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${r1(H)}"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".05" stop-color="#fff"/><stop offset=".96" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
        <mask id="rdMask" maskUnits="userSpaceOnUse" x="-200" y="0" width="${r1(W + 400)}" height="${r1(H)}"><rect x="-200" width="${r1(W + 400)}" height="${r1(H)}" fill="url(#rdFade)"/></mask>
        <mask id="litMask" maskUnits="userSpaceOnUse" x="-200" y="0" width="${r1(W + 400)}" height="${r1(H)}"><path id="litLen" d="${d}" fill="none" stroke="#fff" stroke-width="80" stroke-linecap="round"/></mask>
        <radialGradient id="mkGlow"><stop offset="0" stop-color="#ff7a3d" stop-opacity=".55"/><stop offset="1" stop-color="#ff5a1f" stop-opacity="0"/></radialGradient>
        <linearGradient id="mkCone" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffd2a8" stop-opacity=".5"/><stop offset="1" stop-color="#ffd2a8" stop-opacity="0"/></linearGradient>
        <filter id="rdSoft" x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation="7"/></filter>
        <filter id="rdGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <g mask="url(#rdMask)">
        <path d="${d}" fill="none" stroke="rgba(255,255,255,.07)" stroke-width="${w + 6}" stroke-linecap="round"/>
        <path d="${d}" fill="none" stroke="#101923" stroke-width="${w}" stroke-linecap="round"/>
        <path d="${d}" fill="none" stroke="rgba(255,255,255,.22)" stroke-width="2.4" stroke-dasharray="10 12"/>
        <g mask="url(#litMask)"><path d="${d}" fill="none" stroke="#ff8a4f" stroke-width="3.2" stroke-dasharray="10 12" filter="url(#rdGlow)"/></g>
      </g>
      ${stops.map((p, i) => `<g class="stop" data-i="${i}" transform="translate(${r1(p.x)} ${r1(p.y)}) scale(${r1(sc)})"><circle class="st-halo" r="40"/><circle class="st-ring" r="25"/><circle class="st-core" r="17"/><text class="st-n" y="7.5" text-anchor="middle">${i + 1}</text></g>`).join('')}
      <g id="rdMk"><path d="M26 0 L130 -36 L130 36Z" fill="url(#mkCone)" filter="url(#rdSoft)"/><circle r="66" fill="url(#mkGlow)"/><use href="#mk" x="-26" y="-20" width="52" height="40" style="--m1:#ffd2bd;--m2:#ff5a1f;--m3:#ffffff"/></g>`;
    const lit = roadSvg.querySelector('#litLen'), L = lit.getTotalLength();
    RD.len = L; RD.lit = lit; RD.mk = roadSvg.querySelector('#rdMk'); RD.stops = Array.from(roadSvg.querySelectorAll('.stop'));
    lit.setAttribute('stroke-dasharray', L + ' ' + L); lit.setAttribute('stroke-dashoffset', L);
    RD.ys = []; RD.lens = [];
    for (let l = 0; l <= L; l += 3) { RD.ys.push(lit.getPointAtLength(l).y); RD.lens.push(l); }
    RD.ys.push(lit.getPointAtLength(L).y); RD.lens.push(L);
    RD.stopY = stops.map((p) => p.y); RD.stopLen = RD.stopY.map(lenAtY); RD.endY = end[1];
    RD.ready = true;
  }
  let lastLen = -1;
  function updateRoad(force) {
    if (!RD.ready) return;
    const rb = route.getBoundingClientRect();
    const y = innerHeight * .72 - rb.top;
    const len = reduce ? RD.len : lenAtY(clamp(y, 0, RD.endY));
    if (!force && Math.abs(len - lastLen) < .4) return;
    lastLen = len;
    RD.lit.setAttribute('stroke-dashoffset', RD.len - len);
    const p = RD.lit.getPointAtLength(len), a = RD.lit.getPointAtLength(Math.max(0, len - 6)), q = RD.lit.getPointAtLength(Math.min(RD.len, len + 6));
    RD.mk.setAttribute('transform', 'translate(' + r1(p.x) + ' ' + r1(p.y) + ') rotate(' + r1(Math.atan2(q.y - a.y, q.x - a.x) * 180 / Math.PI) + ')');
    RD.mk.style.opacity = y < 6 ? 0 : 1;
    steps.forEach((s, i) => {
      const on = len >= RD.stopLen[i] - 8;
      if (on !== RD.stops[i].classList.contains('on')) { RD.stops[i].classList.toggle('on', on); s.classList.toggle('on', on); }
      if (on) playStep(s);
    });
    routeEnd.classList.toggle('on', len >= RD.len - 8);
  }
  window.__roadUpdate = updateRoad;
  let roadOk = false;
  if (route && roadSvg && routeEnd) {
    try {
      buildRoad(); roadOk = true;
      if ('ResizeObserver' in window) new ResizeObserver(() => { try { buildRoad(); updateRoad(true); } catch (e) { /* keep the last road */ } }).observe(route);
      addEventListener('load', () => { try { buildRoad(); updateRoad(true); } catch (e) { /* keep the last road */ } });
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { try { buildRoad(); updateRoad(true); } catch (e) { /* keep the last road */ } });
      if (reduce) steps.forEach(playStep);
    } catch (err) { roadOk = false; if (window.console) console.warn('road off', err); }
  }
  if (!roadOk) {
    if ('IntersectionObserver' in window && !reduce) {
      const io2 = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { playStep(en.target); io2.unobserve(en.target); } }), { threshold: .55 });
      steps.forEach((s) => io2.observe(s));
    } else steps.forEach(playStep);
  }

