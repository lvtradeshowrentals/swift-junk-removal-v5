/* ============================================================================
   Splash: a white screen builds the Swift lock-up (three chevrons, a rule, SWIFT, JUNK REMOVAL),
   then a chevron-shaped wipe sweeps across and reveals the site. Plays once per visit.
   ?nosplash skips it, ?splash replays it. Reduced-motion visitors never see it.
   The hero waits for the wipe (SwiftSplash.hero(fn) runs fn when the page starts to appear).
   ========================================================================== */
(function () {
  'use strict';
  var root = document.documentElement;
  var S = window.SwiftSplash = { active: root.classList.contains('splash-on'), cbs: [], fired: false };
  S.hero = function (fn) { if (!S.active || S.fired) fn(); else S.cbs.push(fn); };
  function fire() { if (S.fired) return; S.fired = true; root.classList.add('hero-in'); S.cbs.splice(0).forEach(function (f) { try { f(); } catch (e) { /* keep going */ } }); }
  if (!S.active) { S.fired = true; return; }

  var el = document.getElementById('splash'), wipe = document.getElementById('wipe');
  var lines = [document.getElementById('wc0'), document.getElementById('wc1'), document.getElementById('wc2')];
  var T_WIPE = 1950, DUR = 1300, t0 = 0, raf = 0, ready = false, over = false;
  var n = function (v) { return Math.round(v * 10) / 10; };
  var smooth = function (a, b, t) { t = Math.min(1, Math.max(0, (t - a) / (b - a))); return t * t * (3 - 2 * t); };

  function render(t) {
    var W = innerWidth, H = innerHeight, tip = Math.min(W * .16, 240), mid = H / 2;
    var u = Math.min(1, Math.max(0, (t - T_WIPE) / DUR));
    var tipX = -tip * .5 + (W + tip * 2.4) * Math.pow(smooth(0, 1, u), 1.25);
    var X = tipX - tip;
    el.style.clipPath = 'polygon(' + n(X) + 'px 0,' + W * 2 + 'px 0,' + W * 2 + 'px ' + H + 'px,' + n(X) + 'px ' + H + 'px,' + n(tipX) + 'px ' + n(mid) + 'px)';
    lines.forEach(function (ln, k) { var d = k * 30; ln.setAttribute('points', n(X - d) + ',0 ' + n(tipX - d) + ',' + n(mid) + ' ' + n(X - d) + ',' + H); });
    wipe.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    if (u > .3) fire();
  }
  function finish() {
    if (over) return; over = true;
    cancelAnimationFrame(raf);
    root.classList.add('splash-over'); fire();
    el.style.clipPath = '';
    try { sessionStorage.setItem('swiftIntro5', '1'); } catch (e) { /* private mode */ }
    S.active = false;
  }
  function loop() { var t = performance.now() - t0; render(t); if (t >= T_WIPE + DUR + 40) finish(); else raf = requestAnimationFrame(loop); }
  function begin() { if (ready || over) return; ready = true; el.classList.add('play'); t0 = performance.now(); render(0); raf = requestAnimationFrame(loop); }

  render(0);
  addEventListener('keydown', function (e) { if (e.key === 'Escape') finish(); });
  el.addEventListener('click', finish);
  setTimeout(finish, 7000);                                   // never trap anyone behind it
  addEventListener('resize', function () { if (!over && ready) render(performance.now() - t0); });
  window.__splashSeek = function (ms) {                       // dev: freeze the splash at a moment (needs ?splashhold)
    cancelAnimationFrame(raf); el.classList.add('play');
    el.getAnimations({ subtree: true }).forEach(function (an) { an.pause(); an.currentTime = ms; });
    render(ms);
  };
  if (location.search.indexOf('splashhold') > -1) return;
  Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise(function (r) { setTimeout(r, 1300); })]).then(begin);
})();
