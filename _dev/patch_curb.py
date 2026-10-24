import io
rd = lambda p: io.open(p, encoding='utf8').read()
wr = lambda p, s: io.open(p, 'w', encoding='utf8', newline='').write(s)
R = 'C:/Users/Cleo/Desktop/swift-junk-removal-v5/'

j = rd(R + 'js/site.js')
a = j.index("  const heroEl = $('top'), stage = $('stage'), cv = $('stageCv');")
b = j.index("  /* ==========================================================================\n     SECTIONS")
new = r"""  const heroEl = $('top'), stage = $('stage'), cv = $('stageCv');
  const meter = $('meter'), meterN = $('meterN'), meterBar = $('meterBar'), meterHint = $('meterHint'), meterLbl = $('meterLbl');
  const coarse = matchMedia('(pointer: coarse)').matches;
  let scene = null, heroVisible = true;
  const posterA = qs('.poster--a'), posterB = qs('.poster--b');

  /* where the curb sits in the frame: right of the headline on a wide screen, under it on a phone */
  function frameFn(w, h, portrait) {
    if (portrait) return { zoom: clamp(1.9 * w / h, .8, 2.0), x: 0, y: h < 700 ? -.02 : .05 };
    const z = Math.min(clamp(h / 640, 1.0, 1.9), .98 * w / h);
    return { zoom: z, x: w > 1500 ? .17 : .2, y: .03 };
  }

  /* the scene reports what it is doing; the readout and the button follow it */
  function onHeroEvent(e) {
    if (e.type === 'count') {
      if (meterN.textContent !== String(e.left)) meterN.textContent = String(e.left);
      if (meterBar) meterBar.style.transform = 'scaleX(' + (1 - e.left / e.total).toFixed(3) + ')';
    } else if (e.type === 'phase') {
      meter.dataset.phase = e.name;
      const done = e.name === 'done';
      meterHint.hidden = !done;
      meter.classList.toggle('is-clear', done);
      if (meterLbl) meterLbl.textContent = done ? 'left at the curb' : e.name === 'build' ? 'at the curb' : 'pieces left at the curb';
    }
  }
  if (meterHint) meterHint.addEventListener('click', () => { if (scene) { meterHint.hidden = true; scene.replay(); } });

  function startScene() {
    if (!window.SwiftScene || params.has('noscene')) { stage.classList.add('static'); meter.classList.add('nogl'); return; }
    try {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) { stage.classList.add('static'); meter.classList.add('nogl'); return; }
      scene = SwiftScene.createHero(cv, { low: coarse || (navigator.hardwareConcurrency || 8) <= 4, frame: frameFn, static: reduce, onEvent: onHeroEvent });
      stage.classList.add('live');
      scene.resize();
      const loop = (t) => { requestAnimationFrame(loop); if (heroVisible) scene.frame(t); };
      requestAnimationFrame(loop);
      addEventListener('resize', () => scene.resize());
      if (!coarse && !reduce) addEventListener('pointermove', (e) => scene.pointer((e.clientX / innerWidth - .5) * 2, (e.clientY / innerHeight - .5) * 2), { passive: true });
      if ('IntersectionObserver' in window) new IntersectionObserver((es) => { heroVisible = es[0].isIntersecting; }, { rootMargin: '10% 0px' }).observe(heroEl);
      window.__scene = scene;
      if (reduce || params.has('still')) scene.jumpNow(params.get('still') === 'final' || reduce); else SPL.hero(() => scene.start());
    } catch (err) { scene = null; stage.classList.remove('live'); stage.classList.add('static'); meter.classList.add('nogl'); if (window.console) console.warn('scene off', err); }
  }
  startScene();

"""
j = j[:a] + new + j[b:]
wr(R + 'js/site.js', j)

t = rd(R + '_dev/tpl.html')
a = t.index('    <div class="meter" id="meter">')
b = t.index('</div>\n  </div>\n</section>', a)
newm = ('    <div class="meter" id="meter">\n'
        '      <div class="meter-n"><b id="meterN">22</b><span id="meterLbl">pieces left at the curb</span></div>\n'
        '      <div class="meter-bar"><i id="meterBar"></i></div>\n'
        '      <button class="meter-hint" id="meterHint" type="button" hidden><svg aria-hidden="true"><use href="#i-replay"/></svg><span>Replay</span></button>\n    ')
t = t[:a] + newm + t[b:]
wr(R + '_dev/tpl.html', t)
print('ok')
