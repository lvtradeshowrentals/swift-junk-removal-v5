import io
rd = lambda p: io.open(p, encoding='utf8').read()
wr = lambda p, s: io.open(p, 'w', encoding='utf8', newline='').write(s)
R = 'C:/Users/Cleo/Desktop/swift-junk-removal-v5/'

# --- gauge.js: scale-based fills
g = rd(R + 'js/gauge.js')
g = g.replace("var wash = h('rect', { x: X0, y: YT, width: 0, height: YB - YT, fill: 'url(#bpFill)', class: 'wash' });", "var wash = h('rect', { x: X0, y: YT, width: X1 - X0, height: YB - YT, fill: 'url(#bpFill)', class: 'wash' });")
g = g.replace("var rfill = h('rect', { x: X0, y: RY - 3, width: 0, height: 6, rx: 3, class: 'rfill' });", "var rfill = h('rect', { x: X0, y: RY - 3, width: X1 - X0, height: 6, rx: 3, class: 'rfill' });")
g = g.replace("      wash.setAttribute('width', Math.max(0, fillX - X0));\n      rfill.setAttribute('width', Math.max(0, fillX - X0));\n", "      var k = Math.max(0, fillX - X0) / (X1 - X0);\n      wash.style.transform = 'scaleX(' + k + ')'; rfill.style.transform = 'scaleX(' + k + ')';\n")
g = g.replace("      svg.classList.add('draw');\n      setTimeout(function () { scan.setAttribute('opacity', 1); scan.classList.add('go'); }, 1500);", "      if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) { svg.classList.add('done'); return; }\n      svg.classList.add('draw');\n      setTimeout(function () { scan.setAttribute('opacity', 1); scan.classList.add('go'); }, 1500);")
wr(R + 'js/gauge.js', g)

# --- html template
t = rd(R + '_dev/tpl.html')
if 'js/gauge.js' not in t:
    t = t.replace('<script src="js/site.js" defer></script>', '<script src="js/gauge.js" defer></script>\n<script src="js/site.js" defer></script>')
if 'js/gauge.js' not in t:
    t = t.replace('<script src="js/site.js"></script>', '<script src="js/gauge.js"></script>\n<script src="js/site.js"></script>')
assert 'js/gauge.js' in t
wr(R + '_dev/tpl.html', t)
f = rd(R + '_dev/frag-sections.html')
old = '<div class="gauge-art" id="gaugeArt"><canvas id="gaugeCv" aria-hidden="true"></canvas></div>'
assert old in f
f = f.replace(old, '<div class="gauge-art" id="gaugeArt"><svg id="gaugeSvg" aria-hidden="true" focusable="false"></svg></div>')
wr(R + '_dev/frag-sections.html', f)

# --- css
c = rd(R + 'css/sections.css')
a = c.index('.gauge-art { position: relative;')
b = c.index('.gauge-read {')
newc = rd(R + '_dev/gauge.css')
c = c[:a] + newc + c[b:]
wr(R + 'css/sections.css', c)
p = rd(R + 'css/phone.css')
p = p.replace("  .size .gauge-art { aspect-ratio: 16 / 10; border-radius: 16px; }", "  .size .gauge-art { border-radius: 16px; }")
wr(R + 'css/phone.css', p)

# --- site.js: use the SVG gauge
j = rd(R + 'js/site.js')
a = j.index("  /* the 3D truck: built the first time")
b = j.index("  window.SWIFT5 = {")
new = rd(R + '_dev/gauge-wire.js')
j = j[:a] + new + j[b:]
j = j.replace("    if (gauge) gauge.setLoad(idx);\n", "    if (gauge) { gauge.setLoad(idx); if (touched && gsvgEl) gsvgEl.classList.remove('hint'); }\n")
j = j.replace("if (gauge) gauge.resize(); };", "};")
j = j.replace("  let gauge = null;                       // the 3D truck, once it has loaded", "  let gauge = null;                       // the blueprint truck\n  const gsvgEl = $('gaugeSvg');")
wr(R + 'js/site.js', j)
print('ok')
