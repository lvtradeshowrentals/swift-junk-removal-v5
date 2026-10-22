/* ============================================================================
   Load gauge: a blueprint-style box truck (side view, cut away) with a ruler under it.
   The load fills the bed from the cab wall back toward the tailgate, in real feet.
   Drag the orange handle, tap anywhere on the truck, or use the slider: they all agree.
   ========================================================================== */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var U = 25, X0 = 180, X1 = 580, YT = 110, YB = 285, GY = 347;           // 25 units per foot; bed floor at YB
  var FT = [2, 4, 8, 12, 16, 18];                                          // fill (feet) at each slider stop
  var LABELS = ['2 ft', '4 ft', '8 ft', '12 ft', '16 ft', '16 ft +'];

  var h = function (tag, attrs, kids) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (kids) kids.forEach(function (c) { if (c) e.appendChild(c); });
    return e;
  };
  var P = function (d, extra) { var a = { d: d, pathLength: 1 }; for (var k in (extra || {})) a[k] = extra[k]; return h('path', a); };
  var R = function (x, y, w, hh, rx, extra) { var a = { x: x, y: y, width: w, height: hh, rx: rx || 0, pathLength: 1 }; for (var k in (extra || {})) a[k] = extra[k]; return h('rect', a); };
  var L = function (x1, y1, x2, y2, extra) { var a = { x1: x1, y1: y1, x2: x2, y2: y2 }; for (var k in (extra || {})) a[k] = extra[k]; return h('line', a); };
  var T = function (x, y, s, cls, extra) { var e = h('text', Object.assign({ x: x, y: y, class: cls || '' }, extra || {})); e.textContent = s; return e; };
  var G = function (attrs, kids) { return h('g', attrs, kids); };

  /* ---- junk, drawn as line art at a native size, then scaled to fit its slot exactly ---- */
  var ART = {
    box: [30, 26, function (v) { return [R(0, -26, 30, 26, 2), L(15, -26, 15, -17), v % 3 === 0 ? R(4, -15, 10, 6, 1) : v % 3 === 1 ? L(0, -13, 30, -13) : R(18, -14, 8, 5, 1)]; }],
    chair: [50, 72, function () { return [R(0, -72, 14, 68, 6), R(0, -20, 50, 14, 4), R(10, -46, 40, 18, 8), R(10, -30, 40, 12, 4), R(4, -6, 5, 6), R(40, -6, 5, 6)]; }],
    fridge: [58, 140, function () { return [R(0, -140, 58, 134, 6), L(0, -92, 58, -92), L(46, -128, 46, -104), L(46, -84, 46, -50), R(6, -6, 8, 6), R(44, -6, 8, 6)]; }],
    mattress: [20, 146, function () { return [R(0, -146, 20, 146, 5), L(0, -110, 20, -110), L(0, -74, 20, -74), L(0, -38, 20, -38)]; }],
    bag: [30, 33, function () { return [P('M0 0 C-2 -8 3 -26 15 -26 C27 -26 32 -8 30 0 Z'), P('M12 -26 L10 -33 M18 -26 L21 -32')]; }],
    sofa: [80, 62, function () { return [R(10, -62, 60, 30, 8), R(10, -34, 60, 16, 6), R(0, -42, 11, 32, 5), R(69, -42, 11, 32, 5), R(0, -20, 80, 12, 4), L(30, -60, 30, -36), L(50, -60, 50, -36), R(6, -8, 5, 8), R(69, -8, 5, 8)]; }],
    tv: [20, 90, function () { return [R(0, -90, 20, 84, 2), R(-3, -6, 26, 6, 2)]; }],
    dresser: [52, 78, function () { return [R(0, -78, 52, 72, 3), L(0, -54, 52, -54), L(0, -30, 52, -30), L(20, -66, 32, -66), L(20, -42, 32, -42), L(20, -18, 32, -18), R(3, -6, 6, 6), R(43, -6, 6, 6)]; }],
    roll: [80, 28, function () { return [R(0, -28, 80, 28, 14), h('circle', { cx: 14, cy: -14, r: 8 }), h('circle', { cx: 14, cy: -14, r: 3 }), L(30, -28, 30, 0), L(56, -28, 56, 0)]; }]
  };
  var vcount = 0;
  /* x, base: feet from the cab wall / floor. w, h: the slot in feet. */
  var seed = 7, rnd = function () { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  function item(stop, x, base, w, hh, kind, ghost) {
    var art = ART[kind], parts = art[2](vcount++), loose = kind === 'box' || kind === 'bag';
    // a real load is a little ragged: pieces are a touch narrower than their slot, sit slightly off-centre or tilted,
    // and the tops of the stacks don't all reach the same height
    var w2 = loose ? w * (.78 + rnd() * .17) : w, x2 = x + (w - w2) * rnd(), tilt = loose && !ghost ? (rnd() - .5) * 7 : 0;
    if (loose && !ghost) hh -= .06 + rnd() * .22;                                  // little gaps between the layers
    if (kind === 'box' && base + hh > 5.4 && !ghost) hh -= .3 + rnd() * 1.5;      // uneven tops
    var inner = G({ transform: 'scale(' + ((w2 * U - 2) / art[0]).toFixed(3) + ' ' + ((hh * U - 2) / art[1]).toFixed(3) + ')' }, parts);
    var g = G({ transform: 'translate(' + (X0 + x2 * U + 1).toFixed(1) + ' ' + (YB - base * U - 1).toFixed(1) + ') rotate(' + tilt.toFixed(2) + ' ' + (w2 * U / 2).toFixed(1) + ' 0)' }, [inner]);
    return { stop: stop, g: g, ghost: !!ghost, base: base, x: x };
  }
  /* The bed is packed floor to ceiling in vertical stacks, so every foot you add is a foot of real, full-height load. */
  function manifest() {
    var m = [], add = function () { m.push(item.apply(null, arguments)); };
    // 0-2 ft: a tower of boxes
    [[0, 1.45], [1.45, 1.3], [2.75, 1.4], [4.15, 1.45], [5.6, 1.35]].forEach(function (r) { add(0, 0.05, r[0], 1.9, r[1], 'box'); });
    // 2-4 ft: an armchair under a box stack
    add(1, 2.05, 0, 1.95, 2.9, 'chair'); [[2.9, 1.55], [4.45, 1.4], [5.85, 1.1]].forEach(function (r) { add(1, 2.05, r[0], 1.95, r[1], 'box'); });
    // 4-8 ft: fridge, a standing mattress, and a column of small boxes and bags
    add(2, 4.05, 0, 2.35, 5.8, 'fridge'); add(2, 4.05, 5.8, 2.35, 1.15, 'box'); add(2, 6.45, 0, .65, 6.9, 'mattress');
    add(2, 7.15, 0, .85, 1.2, 'bag'); add(2, 7.15, 1.2, .85, 1.1, 'box'); add(2, 7.15, 2.3, .85, 1.2, 'box'); add(2, 7.15, 3.5, .85, 1.1, 'bag'); add(2, 7.15, 4.6, .85, 1.2, 'box'); add(2, 7.15, 5.8, .85, 1.15, 'box');
    // 8-12 ft: a sofa with boxes, a rolled rug and a box row on top; a TV with boxes above it
    add(3, 8.05, 0, 3.15, 2.5, 'sofa'); add(3, 8.05, 2.5, 1.55, 1.5, 'box'); add(3, 9.65, 2.5, 1.55, 1.5, 'box'); add(3, 8.05, 4.0, 3.15, 1.1, 'roll');
    add(3, 8.05, 5.1, 1.03, 1.85, 'box'); add(3, 9.1, 5.1, 1.05, 1.85, 'box'); add(3, 10.17, 5.1, 1.03, 1.85, 'box');
    add(3, 11.25, 0, .75, 3.6, 'tv'); add(3, 11.25, 3.6, .75, 1.7, 'box'); add(3, 11.25, 5.3, .75, 1.65, 'box');
    // 12-16 ft: a dresser under boxes; two bags under a stack of boxes
    add(4, 12.05, 0, 2.05, 3.1, 'dresser'); [[3.1, 1.7], [4.8, 1.25], [6.05, .9]].forEach(function (r) { add(4, 12.05, r[0], 2.05, r[1], 'box'); });
    add(4, 14.15, 0, .9, 1.3, 'bag'); add(4, 15.1, 0, .9, 1.3, 'bag');
    [[1.3, 1.6], [2.9, 1.5], [4.4, 1.3], [5.7, 1.25]].forEach(function (r) { add(4, 14.15, r[0], 1.85, r[1], 'box'); });
    // beyond the tailgate: what would need another trip
    add(5, 16.25, 0, 1.4, 1.2, 'box', true); add(5, 17.75, 0, .9, 1.3, 'bag', true); add(5, 16.35, 1.2, 1.2, 1.0, 'box', true);
    return m;
  }

  function create(svg, onPick) {
    svg.setAttribute('viewBox', '0 0 680 452');
    svg.setAttribute('class', 'bp');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.innerHTML = '';

    var defs = h('defs', {}, [
      h('linearGradient', { id: 'bpScan', x1: 0, x2: 1, y1: 0, y2: 0 }, [h('stop', { offset: 0, 'stop-color': '#ff5a1f', 'stop-opacity': 0 }), h('stop', { offset: 1, 'stop-color': '#ff5a1f', 'stop-opacity': .55 })]),
      h('linearGradient', { id: 'bpFill', x1: 0, x2: 1, y1: 0, y2: 0 }, [h('stop', { offset: 0, 'stop-color': '#ff5a1f', 'stop-opacity': .2 }), h('stop', { offset: 1, 'stop-color': '#ff5a1f', 'stop-opacity': .05 })]),
      h('pattern', { id: 'bpGrid', width: 20, height: 20, patternUnits: 'userSpaceOnUse' }, [h('path', { d: 'M20 0H0V20', fill: 'none', stroke: 'rgba(160,200,235,.07)', 'stroke-width': 1 })]),
      h('clipPath', { id: 'bpBed' }, [h('rect', { x: X0, y: YT, width: X1 - X0, height: YB - YT })])
    ]);
    svg.appendChild(defs);
    svg.appendChild(h('rect', { x: 0, y: 0, width: 680, height: 452, fill: 'url(#bpGrid)' }));
    // corner crop marks
    [[14, 14, 1, 1], [666, 14, -1, 1], [14, 438, 1, -1], [666, 438, -1, -1]].forEach(function (c) { svg.appendChild(P('M' + c[0] + ' ' + (c[1] + 16 * c[3]) + ' V' + c[1] + ' H' + (c[0] + 16 * c[2]), { class: 'crop' })); });

    /* ---- the truck ---- */
    var body = G({ class: 'body' });
    var out = G({ class: 'ol' });
    out.appendChild(R(X0, YT, X1 - X0, YB - YT, 6));                                    // cargo box
    for (var i = 1; i < 8; i++) out.appendChild(L(X0 + i * 50, YT + 4, X0 + i * 50, YB - 4, { class: 'rib', pathLength: 1 }));
    out.appendChild(P('M66 285 V214 Q66 200 80 196 L122 188 L144 142 Q148 134 158 134 H180 V285 Z'));  // cab
    out.appendChild(P('M130 184 L148 146 H172 V184 Z'));                                // window
    out.appendChild(P('M130 190 V278')); out.appendChild(R(150, 224, 14, 4, 2)); out.appendChild(P('M122 172 H110 V196 H122'));
    out.appendChild(R(66, 222, 6, 14, 2)); out.appendChild(R(56, 270, 14, 15, 3));
    out.appendChild(R(70, 285, 520, 14, 3)); out.appendChild(R(578, 272, 20, 27, 3));   // chassis + bumper
    out.appendChild(P('M180 299 V318 H214'));                                           // fuel tank hint
    body.appendChild(out);
    // Swift chevrons on the cab door
    body.appendChild(P('M138 232 l9 12 l-9 12', { class: 'mk1' })); body.appendChild(P('M148 232 l9 12 l-9 12', { class: 'mk2' }));
    svg.appendChild(body);

    var wheels = G({ class: 'wheels' }), wl = [];
    [120, 495].forEach(function (cx) {
      var w = G({ class: 'wheel', style: 'transform-origin:' + cx + 'px 317px' }, [h('circle', { cx: cx, cy: 317, r: 30, pathLength: 1 }), h('circle', { cx: cx, cy: 317, r: 14, pathLength: 1 }), h('circle', { cx: cx, cy: 317, r: 4, pathLength: 1 })]);
      for (var k = 0; k < 5; k++) { var a = k / 5 * Math.PI * 2; w.appendChild(L(cx + Math.cos(a) * 14, 317 + Math.sin(a) * 14, cx + Math.cos(a) * 24, 317 + Math.sin(a) * 24, { class: 'spoke' })); }
      wheels.appendChild(w); wl.push(w);
    });
    svg.appendChild(wheels);
    svg.appendChild(L(30, GY, 650, GY, { class: 'ground' }));
    for (var gx = 40; gx < 650; gx += 26) svg.appendChild(L(gx, GY + 3, gx - 8, GY + 12, { class: 'hatch' }));

    /* ---- bed interior: foot lines, the load, the fill wash ---- */
    var inner = G({ 'clip-path': 'url(#bpBed)' });
    for (var f = 1; f < 16; f++) inner.appendChild(L(X0 + f * U, YT, X0 + f * U, YB, { class: 'ft' }));
    for (var y = 1; y < 7; y++) inner.appendChild(L(X0, YB - y * U, X1, YB - y * U, { class: 'ft' }));
    var wash = h('rect', { x: X0, y: YT, width: X1 - X0, height: YB - YT, fill: 'url(#bpFill)', class: 'wash' });
    inner.appendChild(wash); svg.appendChild(inner);
    var items = manifest().map(function (it, n) { var g = it.g; g.setAttribute('class', 'it' + (it.ghost ? ' ghost' : '')); svg.appendChild(g); return { stop: it.stop, el: g, n: n, base: it.base, x: it.x }; });
    var scan = h('rect', { x: X0, y: YT - 4, width: 70, height: YB - YT + 8, fill: 'url(#bpScan)', class: 'scan', opacity: 0 });
    svg.appendChild(scan);

    /* ---- height dimension (left) ---- */
    var dim = G({ class: 'dim' });
    dim.appendChild(L(34, YT, X0, YT, { class: 'ext' })); dim.appendChild(L(34, YB, 56, YB, { class: 'ext' }));
    dim.appendChild(L(40, YT + 2, 40, YB - 2)); dim.appendChild(P('M40 ' + (YT) + ' l-5 9 h10 z M40 ' + YB + ' l-5 -9 h10 z', { class: 'arw' }));
    var ht = T(0, 0, '7 ft', 'dt'); ht.setAttribute('transform', 'translate(26 ' + ((YT + YB) / 2 + 12) + ') rotate(-90)'); dim.appendChild(ht);
    /* ---- ruler (bottom): one tick a foot, label every 4 ---- */
    var RY = 372;
    dim.appendChild(L(X0, RY, X1, RY)); dim.appendChild(L(X0, YB + 22, X0, RY + 8, { class: 'ext' })); dim.appendChild(L(X1, YB + 22, X1, RY + 8, { class: 'ext' }));
    for (var t = 0; t <= 16; t++) { dim.appendChild(L(X0 + t * U, RY - (t % 4 ? 5 : 10), X0 + t * U, RY + (t % 4 ? 5 : 10), { class: t % 4 ? 'tk' : 'tk big' })); if (t % 4 === 0) dim.appendChild(T(X0 + t * U, RY + 32, t === 16 ? '16 ft' : String(t), 'dt', { 'text-anchor': 'middle' })); }
    dim.appendChild(T(X0 - 26, RY + 32, 'Truck bed', 'dt dim2', { 'text-anchor': 'end' }));
    svg.appendChild(dim);
    var rfill = h('rect', { x: X0, y: RY - 3, width: X1 - X0, height: 6, rx: 3, class: 'rfill' }); svg.appendChild(rfill);
    svg.appendChild(T(340, 442, 'Example: 16 ft box truck, 7 ft wide and 7 ft tall', 'cap', { 'text-anchor': 'middle' }));

    /* ---- the fill marker: a line, a handle and a tag ---- */
    var mk = G({ class: 'mk' });
    var mline = L(0, YT - 26, 0, YB, { class: 'mline' });
    var tag = G({ class: 'tag' }, [R(-46, -16, 92, 30, 15, { class: 'tagbg' }), T(0, 5, '8 ft', 'tagtx', { 'text-anchor': 'middle' })]);
    var tagTx = tag.lastChild;
    tag.setAttribute('transform', 'translate(0 ' + (YT - 56) + ')');
    var hd = G({ class: 'hd', transform: 'translate(0 ' + (YT - 26) + ')' }, [h('circle', { r: 17, class: 'hdbg' }), P('M-8 0 l5 -5 v10 z M8 0 l-5 -5 v10 z', { class: 'hda' })]);
    mk.appendChild(mline); mk.appendChild(tag); mk.appendChild(hd);
    svg.appendChild(mk);
    var hit = h('rect', { x: X0 - 20, y: 0, width: X1 - X0 + 100, height: 400, fill: 'transparent', class: 'hit' });
    svg.appendChild(hit);

    /* ---- state + moves ---- */
    var cur = -1, shown = false;
    function setLoad(idx, instant) {
      idx = Math.max(0, Math.min(5, idx));
      var x = X0 + FT[idx] * U, up = idx > cur;
      var fillX = Math.min(x, X1);
      items.forEach(function (it) {
        var on = it.stop <= idx;
        it.el.style.transitionDelay = instant ? '0s' : (on ? (it.base * .1 + (it.x % 4) * .05).toFixed(2) + 's' : '0s');
        it.el.classList.toggle('on', on);
        it.el.classList.toggle('new', on && it.stop === idx);
      });
      var k = Math.max(0, fillX - X0) / (X1 - X0);
      wash.style.transform = 'scaleX(' + k + ')'; rfill.style.transform = 'scaleX(' + k + ')';
      mk.style.transform = 'translateX(' + x + 'px)';
      tagTx.textContent = idx === 5 ? '16 ft + more' : idx === 4 ? 'Full: 16 ft' : FT[idx] + ' of 16 ft';
      tag.querySelector('rect').setAttribute('width', idx === 5 ? 150 : idx === 4 ? 112 : 104); tag.querySelector('rect').setAttribute('x', idx === 5 ? -75 : idx === 4 ? -56 : -52);
      // the suspension settles and the wheels roll a little as the bed loads
      body.style.transform = 'translateY(' + (idx * .9).toFixed(2) + 'px)';
      wl.forEach(function (w) { w.style.transform = 'rotate(' + (idx * 52) + 'deg)'; });
      svg.dataset.idx = idx; cur = idx;
    }
    function reveal() {
      if (shown) return; shown = true;
      if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) { svg.classList.add('done'); return; }
      svg.classList.add('draw');
      scan.addEventListener('animationend', function () { scan.style.display = 'none'; });
      setTimeout(function () { scan.setAttribute('opacity', 1); scan.classList.add('go'); }, 1500);
    }

    /* ---- pointer: tap or drag along the truck to choose a stop ---- */
    function pick(ev) {
      var pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY;
      var p = pt.matrixTransform(svg.getScreenCTM().inverse()), ft = (p.x - X0) / U, best = 0, bd = 1e9;
      FT.forEach(function (v, i) { var d = Math.abs(v - ft); if (d < bd) { bd = d; best = i; } });
      if (best !== cur) onPick(best);
    }
    var down = false;
    svg.addEventListener('pointerdown', function (e) { if (e.pointerType === 'mouse' && e.button !== 0) return; down = true; svg.classList.add('grab'); try { svg.setPointerCapture(e.pointerId); } catch (x) { /* fine */ } pick(e); });
    svg.addEventListener('pointermove', function (e) { if (down) pick(e); });
    var up = function () { down = false; svg.classList.remove('grab'); };
    svg.addEventListener('pointerup', up); svg.addEventListener('pointercancel', up);
    setLoad(2, true);
    return { setLoad: setLoad, reveal: reveal, resize: function () { } };
  }
  window.SwiftGauge = { create: create };
})();
