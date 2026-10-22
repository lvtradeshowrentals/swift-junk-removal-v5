import io
rd = lambda p: io.open(p, encoding='utf8').read()
wr = lambda p, s: io.open(p, 'w', encoding='utf8', newline='').write(s)
R = 'C:/Users/Cleo/Desktop/swift-junk-removal-v5/'

# ---------- template: head gate, splash markup, splash.js
t = rd(R + '_dev/tpl.html')
gate = """<script>
/* The splash plays once per visit. ?nosplash skips it, ?splash replays it. Reduced motion never sees it. */
(function () {
  var play = true;
  try {
    if (location.search.indexOf('nosplash') > -1) play = false;
    else if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) play = false;
    else if (sessionStorage.getItem('swiftIntro5') && location.search.indexOf('splash') < 0) play = false;
  } catch (e) {}
  if (play) document.documentElement.classList.add('splash-on');
})();
</script>
"""
if 'swiftIntro5' not in t:
    t = t.replace("<script>document.documentElement.className='js'</script>", "<script>document.documentElement.className='js'</script>\n" + gate, 1)
    # className assignment would wipe splash-on if it ran after; keep order: js class first, then the gate adds splash-on
splash = """<div class="splash" id="splash" aria-hidden="true">
  <div class="sp-lock">
    <svg class="sp-mark" viewBox="0 0 142 108" focusable="false">
      <path class="c1" d="M0 0H28L62 54L28 108H0L34 54Z" fill="#ffd2bd"/><path class="c2" d="M40 0H68L102 54L68 108H40L74 54Z" fill="#ff5a1f"/><path class="c3" d="M80 0H108L142 54L108 108H80L114 54Z" fill="#0a0e13"/>
    </svg>
    <span class="sp-rule"></span>
    <div class="sp-text">
      <div class="sp-word"><span style="--i:0">S</span><span style="--i:1">W</span><span style="--i:2">I</span><span style="--i:3">F</span><span style="--i:4">T</span></div>
      <div class="sp-sub">JUNK REMOVAL</div>
    </div>
  </div>
</div>
<svg class="wipe" id="wipe" aria-hidden="true" focusable="false">
  <polyline id="wc2" fill="none" stroke="#c43e0e" stroke-width="5" stroke-linejoin="miter" stroke-opacity=".85"/>
  <polyline id="wc1" fill="none" stroke="#ff5a1f" stroke-width="6" stroke-linejoin="miter"/>
  <polyline id="wc0" fill="none" stroke="#ffb08a" stroke-width="7" stroke-linejoin="miter"/>
</svg>

"""
if 'id="splash"' not in t:
    t = t.replace('<a class="skip" href="#quote">', splash + '<a class="skip" href="#quote">', 1)
if 'js/splash.js' not in t:
    t = t.replace('<script src="js/vendor/lenis.min.js"', '<script src="js/splash.js"></script>\n<script src="js/vendor/lenis.min.js"', 1)
wr(R + '_dev/tpl.html', t)

# ---------- sections: wrap the steps in the route
f = rd(R + '_dev/frag-sections.html')
if 'id="route"' not in f:
    a = f.index('    <ol class="steps" id="steps">')
    b = f.index('    </ol>', a) + len('    </ol>\n')
    ol = f[a:b]
    end = ('      <a class="route-end" id="routeEnd" href="#quote" data-service="general"><span>Ready? Start your quote</span><svg aria-hidden="true"><use href="#i-arrow"/></svg></a>\n')
    f = f[:a] + '    <div class="route" id="route">\n      <svg class="road" id="routeRoad" aria-hidden="true" focusable="false"></svg>\n' + ol + end + '    </div>\n' + f[b:]
wr(R + '_dev/frag-sections.html', f)

# ---------- css
c = rd(R + 'css/site.css')
if '.sp-lock' not in c:
    c += rd(R + '_dev/splash.css')
wr(R + 'css/site.css', c)
s = rd(R + 'css/sections.css')
if '.route-end' not in s:
    s += rd(R + '_dev/route.css')
wr(R + 'css/sections.css', s)
p = rd(R + 'css/phone.css')
if '.route {' not in p:
    p = p.rstrip()
    assert p.endswith('}')
    p = p[:-1] + rd(R + '_dev/route-phone.css') + '}\n'
wr(R + 'css/phone.css', p)

# ---------- js
j = rd(R + 'js/site.js')
if 'SwiftSplash' not in j:
    j = j.replace("""  let started = false;
  const go = () => { if (started) return; started = true; root.classList.add('go'); };""", """  let started = false;
  const SPL = window.SwiftSplash || { hero: (fn) => fn() };
  const go = () => { if (started) return; started = true; SPL.hero(() => root.classList.add('go')); };""", 1)
    j = j.replace("if (params.has('introt')) scene.introAt(+params.get('introt')); else if (reduce || params.has('still')) scene.introNow(); else scene.play();",
                  "if (params.has('introt')) scene.introAt(+params.get('introt')); else if (reduce || params.has('still')) scene.introNow(); else SPL.hero(() => scene.play());", 1)
    j = j.replace("if (!reduce && !params.has('introt') && !params.has('still')) runClear(2700);", "if (!reduce && !params.has('introt') && !params.has('still')) SPL.hero(() => runClear(2700));", 1)
    j = j.replace("  if (!scene) { setHeroP(0); if (!reduce) runClear(900); } else setHeroP(0);", "  if (!scene) { setHeroP(0); if (!reduce) SPL.hero(() => runClear(900)); } else setHeroP(0);", 1)
a = j.index("  /* ---------- how: each phone plays once when it arrives ---------- */")
b = j.index("  /* ---------- FAQ ---------- */")
j = j[:a] + rd(R + '_dev/route.js') + j[b:]
wr(R + 'js/site.js', j)
print('ok')
