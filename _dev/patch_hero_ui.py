import io
rd = lambda p: io.open(p, encoding='utf8').read()
wr = lambda p, s: io.open(p, 'w', encoding='utf8', newline='').write(s)
R = 'C:/Users/Cleo/Desktop/swift-junk-removal-v5/'

# ---- js
j = rd(R + 'js/site.js')
a = j.index("  const heroEl = $('top'), stage = $('stage'), cv = $('stageCv');")
b = j.index("  /* ==========================================================================\n     SECTIONS")
new = r"""  const heroEl = $('top'), stage = $('stage'), cv = $('stageCv');
  const meter = $('meter'), meterN = $('meterN'), meterLbl = $('meterLbl'), meterHint = $('meterHint');
  const tabs = qsa('#sceneTabs button');
  const coarse = matchMedia('(pointer: coarse)').matches;
  let scene = null, heroVisible = true;

  function frameFn(w, h, portrait) {
    if (portrait) {
      const z = clamp(1.05 * w / h, .4, 1.2);
      return { zoom: z, x: 0, y: h < 700 ? -.012 : .04 };
    }
    const z = Math.min(clamp(h / 790, .8, 1.35), .62 * w / h);
    return { zoom: z, x: w > 1500 ? .2 : .215, y: .035 };
  }

  /* the hero tells the page which scene it is in; the tabs, counter and replay button follow */
  function onHeroEvent(e) {
    if (e.type === 'scene') {
      tabs.forEach((b, i) => { b.classList.toggle('on', i === e.index); b.setAttribute('aria-pressed', String(i === e.index)); });
      if (meterLbl) meterLbl.textContent = 'items in the ' + e.noun;
      meterHint.hidden = true;
    } else if (e.type === 'phase') {
      meter.dataset.phase = e.name;
      tabs.forEach((b, i) => b.classList.toggle('busy', i === e.index && e.name !== 'done' && e.name !== 'hold'));
      meterHint.hidden = e.name !== 'done';
    }
  }
  tabs.forEach((b, i) => b.addEventListener('click', () => { if (scene) scene.jump(i); }));
  if (meterHint) meterHint.addEventListener('click', () => { if (scene) scene.jump(0); });

  function startScene() {
    if (!window.SwiftScene || params.has('noscene')) { stage.classList.add('static'); meter.classList.add('nogl'); return; }
    try {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) { stage.classList.add('static'); meter.classList.add('nogl'); return; }
      scene = SwiftScene.createHero(cv, { low: coarse || (navigator.hardwareConcurrency || 8) <= 4, frame: frameFn, static: reduce, onEvent: onHeroEvent });
      stage.classList.add('live');
      scene.resize();
      const loop = (t) => { requestAnimationFrame(loop); if (heroVisible) { scene.frame(t); const c = scene.count(); if (meterN.textContent !== String(c.n)) meterN.textContent = String(c.n); } };
      requestAnimationFrame(loop);
      addEventListener('resize', () => scene.resize());
      if (!coarse && !reduce) addEventListener('pointermove', (e) => scene.pointer((e.clientX / innerWidth - .5) * 2, (e.clientY / innerHeight - .5) * 2), { passive: true });
      if ('IntersectionObserver' in window) new IntersectionObserver((es) => { heroVisible = es[0].isIntersecting; }, { rootMargin: '10% 0px' }).observe(heroEl);
      window.__scene = scene;
      if (reduce || params.has('still')) scene.jumpNow(+(params.get('scene') || 0)); else scene.start();
    } catch (err) { scene = null; stage.classList.remove('live'); stage.classList.add('static'); meter.classList.add('nogl'); if (window.console) console.warn('scene off', err); }
  }
  startScene();

"""
j = j[:a] + new + j[b:]
j = j.replace("const g = SwiftScene.createHero(cvG, {", "const g = SwiftScene.createGauge(cvG, {")
wr(R + 'js/site.js', j)

# ---- html
t = rd(R + '_dev/tpl.html')
a = t.index('    <div class="meter" id="meter">')
b = t.index('</div>\n  </div>\n</section>', a)
newm = ('    <div class="meter" id="meter">\n'
        '      <div class="meter-n"><b id="meterN">0</b><span id="meterLbl">items in the room</span></div>\n'
        '      <div class="tabs" id="sceneTabs" role="group" aria-label="Show me">\n'
        '        <button type="button" data-i="0" class="on" aria-pressed="true">Home</button>\n'
        '        <button type="button" data-i="1" aria-pressed="false">Yard</button>\n'
        '        <button type="button" data-i="2" aria-pressed="false">Construction</button>\n'
        '      </div>\n'
        '      <button class="meter-hint" id="meterHint" type="button" hidden><svg aria-hidden="true"><use href="#i-replay"/></svg><span>Replay</span></button>\n    ')
t = t[:a] + newm + t[b:]
wr(R + '_dev/tpl.html', t)

# ---- css
c = rd(R + 'css/site.css')
a = c.index('.meter { position: absolute;')
end = '.meter.is-clear .meter-n b { color: var(--hot2); }'
b = c.index(end) + len(end)
newc = """.meter { position: absolute; z-index: 2; right: max(var(--gut), calc((100% - 1480px) / 2)); bottom: clamp(20px, 4.4svh, 44px); width: min(800px, 58vw); display: flex; align-items: center; justify-content: flex-end; gap: 22px; }
.meter.nogl { display: none; }
.meter-n { display: flex; align-items: baseline; gap: 10px; margin-right: auto; }
.meter-n b { font-family: var(--f-d); font-weight: 600; font-size: 46px; line-height: .9; letter-spacing: -.05em; font-variant-numeric: tabular-nums; min-width: 1.15ch; text-align: right; }
.meter-n span { font-size: 15px; color: var(--mute); font-weight: 500; white-space: nowrap; }
.tabs { display: flex; gap: 4px; padding: 4px; border-radius: 999px; background: rgba(255, 255, 255, .9); box-shadow: 0 0 0 1px var(--line), 0 16px 28px -18px rgba(10, 14, 19, .5); backdrop-filter: blur(8px); }
.tabs button { position: relative; height: 40px; padding: 0 18px; border: 0; border-radius: 999px; background: none; font-size: 15px; font-weight: 600; color: var(--ink2); transition: background .3s var(--ease), color .3s; white-space: nowrap; }
.tabs button:hover { background: rgba(10, 14, 19, .06); }
.tabs button.on { background: var(--ink); color: #fff; }
.tabs button.busy::after { content: ''; position: absolute; right: 9px; top: 9px; width: 7px; height: 7px; border-radius: 50%; background: var(--hot); animation: blink 1.1s ease-in-out infinite; }
@keyframes blink { 50% { opacity: .25; transform: scale(.7); } }
.meter-hint { display: inline-flex; align-items: center; gap: 8px; height: 48px; padding: 0 18px 0 14px; border: 0; border-radius: 999px; background: #fff; box-shadow: 0 0 0 1px var(--line), 0 14px 26px -16px rgba(10, 14, 19, .5); font-size: 15px; font-weight: 600; color: var(--ink); transition: transform .3s var(--ease), box-shadow .3s; white-space: nowrap; }
.meter-hint[hidden] { display: none; }
.meter-hint:hover { transform: translateY(-2px); box-shadow: 0 0 0 1px var(--ink), 0 18px 30px -16px rgba(10, 14, 19, .55); }
.meter-hint svg { width: 18px; height: 18px; }"""
c = c[:a] + newc + c[b:]
wr(R + 'css/site.css', c)

p = rd(R + 'css/phone.css')
a = p.index('  .meter { left: var(--gut);')
end = '  .meter-n b { font-size: 36px; }'
b = p.index(end) + len(end)
newp = """  .meter { left: var(--gut); right: var(--gut); bottom: calc(env(safe-area-inset-bottom) + 112px); width: auto; display: grid; grid-template-columns: 1fr auto; gap: 10px 12px; align-items: center; }
  .tabs { grid-column: 1 / -1; order: 3; justify-content: space-between; }
  .tabs button { flex: 1; padding: 0 8px; height: 42px; font-size: 14.5px; }
  .meter-hint { grid-column: 2; grid-row: 1; height: 42px; padding: 0 14px 0 11px; }
  .meter-n b { font-size: 36px; }"""
p = p[:a] + newp + p[b:]
wr(R + 'css/phone.css', p)
print('ok')
