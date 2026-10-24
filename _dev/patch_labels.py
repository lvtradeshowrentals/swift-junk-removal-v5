import io
rd = lambda p: io.open(p, encoding='utf8').read()
wr = lambda p, s: io.open(p, 'w', encoding='utf8', newline='').write(s)
R = 'C:/Users/Cleo/Desktop/swift-junk-removal-v5/'

# ---- markup: a layer for the floating labels, inside the stage
t = rd(R + '_dev/tpl.html')
if 'id="lifts"' not in t:
    t = t.replace('<canvas id="stageCv"></canvas>', '<canvas id="stageCv"></canvas>\n      <div class="lifts" id="lifts"></div>', 1)
wr(R + '_dev/tpl.html', t)

# ---- css
c = rd(R + 'css/site.css')
if '.lifts' not in c:
    c += """
/* the names of what is being taken float up as each piece is lifted */
.lifts { position: absolute; inset: 0; z-index: 1; pointer-events: none; overflow: hidden; }
.lift { position: absolute; left: 0; top: 0; display: inline-flex; align-items: center; gap: 7px; padding: 7px 13px 7px 10px; border-radius: 999px; background: rgba(255, 255, 255, .94); box-shadow: 0 0 0 1px rgba(10, 14, 19, .08), 0 14px 26px -14px rgba(10, 14, 19, .45); font-size: 13.5px; font-weight: 650; letter-spacing: -.005em; color: var(--ink); white-space: nowrap; opacity: 0; will-change: transform, opacity; animation: liftUp 1.55s var(--ease) forwards; }
.lift i { width: 8px; height: 8px; border-radius: 50%; background: var(--hot); box-shadow: 0 0 0 3px rgba(255, 90, 31, .2); }
@keyframes liftUp { 0% { opacity: 0; transform: translate(var(--x), calc(var(--y) + 10px)) scale(.85); } 14% { opacity: 1; transform: translate(var(--x), var(--y)) scale(1); } 72% { opacity: 1; transform: translate(var(--x), calc(var(--y) - 34px)) scale(1); } 100% { opacity: 0; transform: translate(var(--x), calc(var(--y) - 52px)) scale(.98); } }
@media (prefers-reduced-motion: reduce) { .lifts { display: none; } }
"""
wr(R + 'css/site.css', c)
p = rd(R + 'css/phone.css')
if '.lift {' not in p:
    p = p.rstrip()
    p = p[:-1] + "  .lift { font-size: 12.5px; padding: 6px 11px 6px 9px; }\n}\n"
wr(R + 'css/phone.css', p)

# ---- js
j = rd(R + 'js/site.js')
if "e.type === 'lift'" not in j:
    j = j.replace("  function onHeroEvent(e) {\n    if (e.type === 'count') {",
"""  const liftsEl = $('lifts');
  function onHeroEvent(e) {
    if (e.type === 'lift') {
      if (!liftsEl || reduce) return;
      const s = document.createElement('span'); s.className = 'lift'; s.innerHTML = '<i></i>' + e.name;
      const pad = 12, w = 130;
      s.style.setProperty('--x', Math.round(clamp(e.x - 40, pad, liftsEl.clientWidth - w - pad)) + 'px'); s.style.setProperty('--y', Math.round(clamp(e.y - 30, 70, liftsEl.clientHeight - 80)) + 'px');
      liftsEl.appendChild(s); setTimeout(() => s.remove(), 1700);
    } else if (e.type === 'count') {""", 1)
    j = j.replace("if (reduce || params.has('still')) scene.jumpNow(params.get('still') === 'final' || reduce); else SPL.hero(() => scene.start());",
                  "if (reduce || params.has('still')) scene.jumpNow(params.get('still') === 'final'); else SPL.hero(() => scene.start());", 1)
wr(R + 'js/site.js', j)
print('ok')
