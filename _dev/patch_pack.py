import io
rd = lambda p: io.open(p, encoding='utf8').read()
wr = lambda p, s: io.open(p, 'w', encoding='utf8', newline='').write(s)
R = 'C:/Users/Cleo/Desktop/swift-junk-removal-v5/'

g = rd(R + 'js/gauge.js')
a = g.index('  /* ---- junk, drawn as line art')
b = g.index('  function create(svg, onPick) {')
new = r"""  /* ---- junk, drawn as line art at a native size, then scaled to fit its slot exactly ---- */
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
  function item(stop, x, base, w, hh, kind, ghost) {
    var art = ART[kind], parts = art[2](vcount++);
    var inner = G({ transform: 'scale(' + ((w * U - 2) / art[0]).toFixed(3) + ' ' + ((hh * U - 2) / art[1]).toFixed(3) + ')' }, parts);
    var g = G({ transform: 'translate(' + (X0 + x * U + 1).toFixed(1) + ' ' + (YB - base * U - 1).toFixed(1) + ')' }, [inner]);
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

"""
g = g[:a] + new + g[b:]
g = g.replace("var items = manifest().map(function (it, n) { var g = it.g; g.setAttribute('class', 'it' + (it.ghost ? ' ghost' : '')); svg.appendChild(g); return { stop: it.stop, el: g, n: n }; });",
              "var items = manifest().map(function (it, n) { var g = it.g; g.setAttribute('class', 'it' + (it.ghost ? ' ghost' : '')); svg.appendChild(g); return { stop: it.stop, el: g, n: n, base: it.base, x: it.x }; });")
g = g.replace("it.el.style.transitionDelay = instant ? '0s' : (on ? (it.n % 8) * 0.045 + 's' : '0s');",
              "it.el.style.transitionDelay = instant ? '0s' : (on ? (it.base * .1 + (it.x % 4) * .05).toFixed(2) + 's' : '0s');")
wr(R + 'js/gauge.js', g)

c = rd(R + 'css/sections.css')
c = c.replace(".bp .it * { fill: rgba(188, 215, 236, .06); stroke: #e4f1fb; stroke-width: 1.7; stroke-linejoin: round; stroke-linecap: round; }",
              ".bp .it * { fill: rgba(188, 215, 236, .06); stroke: #e4f1fb; stroke-width: 1.5; stroke-linejoin: round; stroke-linecap: round; vector-effect: non-scaling-stroke; }")
wr(R + 'css/sections.css', c)
print('ok')
