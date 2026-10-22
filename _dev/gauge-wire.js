  /* the blueprint truck: its outline draws itself the first time the quote section is on screen */
  if (gsvgEl && window.SwiftGauge) {
    gauge = SwiftGauge.create(gsvgEl, (idx) => { rng.value = idx; setLoad(idx, true); });
    gsvgEl.classList.add('hint');
    gauge.setLoad(+$('f-load').value, true);
    const art = $('gaugeArt');
    if ('IntersectionObserver' in window) {
      const iog = new IntersectionObserver((es) => {
        if (!es[0].isIntersecting) return;
        iog.disconnect(); gauge.reveal();
        /* a short demo so it reads as interactive */
        if (!reduce) [0, 1, 3, 4, 2].forEach((idx, n) => setTimeout(() => { if (!St.loadSet) gauge.setLoad(idx); }, 2300 + n * 900));
      }, { threshold: .55 });
      iog.observe(art);
    } else gauge.reveal();
  }
