/* ============================================
   MASTERSTOCK - interactions
   ============================================ */

document.getElementById('year').textContent = new Date().getFullYear();
document.documentElement.classList.add('js');

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Lenis smooth scroll (Awwwards-style inertia) ---------- */
const lenis = (function smoothScroll() {
  if (prefersReduced || typeof Lenis === 'undefined') return null;
  const l = new Lenis({ lerp: 0.1, smoothWheel: true });

  // Drive Lenis from GSAP's ticker so ScrollTrigger stays perfectly in sync.
  if (typeof gsap !== 'undefined') {
    if (typeof ScrollTrigger !== 'undefined') l.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => l.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    const raf = (t) => { l.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  return l;
})();
window.lenis = lenis;

// In-page anchor links: Lenis disables CSS smooth-scroll, so route them
// through Lenis to keep a smooth jump (and not break the nav/menu links).
if (lenis) {
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target);
    });
  });
}

/* ---------- Custom cursor ---------- */
(function cursor() {
  return; // custom cursor disabled - using native navy pointer (lighter, no per-frame repaint)
  if (window.matchMedia('(hover: none)').matches) return;
  const ring = document.getElementById('cursor');
  const dot = document.getElementById('cursorDot');
  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let rx = mx, ry = my;

  window.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
  });

  function loop() {
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
    requestAnimationFrame(loop);
  }
  loop();

  const hoverables = 'a, button, .tag, .cat, .step, .fix, select, input, .stack-card, .ms-globe-wrap';
  document.querySelectorAll(hoverables).forEach((el) => {
    el.addEventListener('mouseenter', () => ring.classList.add('is-hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('is-hover'));
  });
})();

/* ---------- Menu toggle ---------- */
(function menu() {
  const toggle = document.getElementById('navToggle');
  const overlay = document.getElementById('menuOverlay');
  let open = false;
  const setOpen = (v) => { open = v; document.body.classList.toggle('menu-open', v); };

  toggle.addEventListener('click', (e) => { e.stopPropagation(); setOpen(!open); });
  overlay.querySelectorAll('.menu-link').forEach((l) => l.addEventListener('click', () => setOpen(false)));
  // click outside the panel closes it
  document.addEventListener('click', (e) => {
    if (open && !overlay.contains(e.target) && !toggle.contains(e.target)) setOpen(false);
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && open) setOpen(false); });
})();

/* ---------- Global particle network background ---------- */
(function bgCanvas() {
  return; // particle network disabled - removed for a cleaner look
  if (prefersReduced) return;
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, dpr, particles;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(95, Math.floor((w * h) / 20000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.6 + 0.4,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(6,182,212,0.5)';
      ctx.fill();
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 130) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(37,99,235,${0.14 * (1 - dist / 130)})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }

  resize();
  draw();
  window.addEventListener('resize', resize);
})();

/* ---------- GSAP animations ---------- */
window.addEventListener('load', () => {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  if (prefersReduced) return;

  /* Hero tagline rises as you scroll (scroll-driven reveal, like the standards section) */
  const heroTagLines = gsap.utils.toArray('.hero__tl > span');
  if (heroTagLines.length) {
    // No pin: the hero is position:sticky, so the video stays put while the
    // "How a lot moves" section slides up over it. We just scrub the wordmark
    // (fades to grey + shrinks, price-pierce style) and rise the tagline.
    const heroTagTl = gsap.timeline({
      scrollTrigger: { trigger: '.hero-stage', start: 'top top', end: '+=100%', scrub: true },
    });
    heroTagTl
      .fromTo(heroTagLines, { yPercent: 120 }, { yPercent: 0, ease: 'power3.out', stagger: 0.16, duration: 0.32 }, 0)
      .to('.hero__wordmark', { color: 'rgba(150,157,166,0.92)', scale: 0.82, filter: 'blur(3px)', ease: 'power1.in', duration: 0.5 }, 0.06);
  }

  /* Kinetic typography - split big headings into words and reveal them
     line-by-line (masked) as they scroll into view. Runs after fonts load
     so SplitType measures line breaks correctly. */
  if (typeof SplitType !== 'undefined') {
    const setupKinetic = () => {
      // Reveal via IntersectionObserver - robust against late layout shifts on this
      // very tall page (ScrollTrigger 'once' was firing at load before it settled).
      const revealIO = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          gsap.to(e.target.__ktWords, { yPercent: 0, opacity: 1, duration: 1.0, ease: 'expo.out', stagger: 0.06 });
          revealIO.unobserve(e.target);
        });
      }, { rootMargin: '0px 0px -10% 0px', threshold: 0 });
      gsap.utils.toArray('.section__title, .cta__title, .follow__title, .stack-card__title').forEach((h) => {
        const split = new SplitType(h, { types: 'lines,words', lineClass: 'kt-line', wordClass: 'kt-word' });
        gsap.set(split.words, { yPercent: 120, opacity: 0 });
        h.__ktWords = split.words;
        revealIO.observe(h);
      });

      /* Continuous kinetic skew: big type leans with scroll velocity, then springs
         back to straight (the "alive" Awwwards feel). */
      const skewEls = gsap.utils.toArray('.section__title, .cta__title, .follow__title, .stack-card__title, .ticker__item, .hero__title');
      const proxy = { v: 0 };
      const applySkew = () => skewEls.forEach((el) => gsap.set(el, { skewY: proxy.v }));
      const clampSkew = gsap.utils.clamp(-6, 6);
      ScrollTrigger.create({
        onUpdate: (self) => {
          const s = clampSkew(self.getVelocity() / -300);
          if (Math.abs(s) > Math.abs(proxy.v)) {
            proxy.v = s;
            gsap.to(proxy, { v: 0, duration: 0.7, ease: 'power3', overwrite: true, onUpdate: applySkew });
          }
        },
      });

      ScrollTrigger.refresh();
    };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(setupKinetic);
    else setupKinetic();
  }

  /* Hero intro */
  const introTl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  introTl
    .fromTo('.hero__brand', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 })
    .fromTo('.hero__title .line > span', { yPercent: 110 }, { yPercent: 0, duration: 1.1, stagger: 0.1 }, '-=0.4')
    .fromTo('[data-hero-tags] .tag', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.05, clearProps: 'transform' }, '-=0.6')
    .fromTo('[data-hero-lead]', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, '-=0.4')
    .fromTo('[data-hero-claims]', { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, '-=0.5')
    .fromTo('[data-scroll-hint]', { opacity: 0 }, { opacity: 1, duration: 0.6 }, '-=0.3');

  /* Failsafe: if the ticker is throttled and the intro never finishes,
     force the hero to its final visible state (gsap.set is instant, no RAF). */
  setTimeout(() => {
    if (introTl.progress() < 1) {
      gsap.set(['.hero__brand', '.hero__title .line > span', '[data-hero-tags] .tag',
        '[data-hero-lead]', '[data-hero-claims]', '[data-scroll-hint]'], { clearProps: 'all' });
    }
  }, 4500);

  /* Title decode / scramble on load (runs alongside the slide-in).
     Final text already lives in the HTML, so if this never runs the title
     just stays correct and visible. */
  (function scrambleTitle() {
    const lines = document.querySelectorAll('.hero__title .line > span');
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&@*';
    lines.forEach((span, idx) => {
      const target = span.textContent;
      let it = 0;
      setTimeout(() => {
        const iv = setInterval(() => {
          span.textContent = target.split('').map((c, i) =>
            c === ' ' ? ' ' : (i < it ? target[i] : chars[Math.floor(Math.random() * chars.length)])
          ).join('');
          it += 0.5;
          if (it >= target.length) { clearInterval(iv); span.textContent = target; }
        }, 45);
      }, 250 + idx * 260);
    });
  })();

  /* Scroll reveals - IntersectionObserver toggles a class; CSS handles the
     transition. Native + reliable, with NO dependency on the RAF-driven
     ticker (which the old gsap.from reveals relied on). Content is visible
     by default; the hidden state is only applied when we can observe it. */
  const hasIO = 'IntersectionObserver' in window;
  const io = hasIO ? new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0 }) : null;

  const tagReveal = (els, stagger) => {
    if (!hasIO) return; // no IntersectionObserver → leave everything visible
    els.forEach((el, i) => {
      el.setAttribute('data-reveal', '');
      el.style.transitionDelay = (i * (stagger || 0)) + 's';
      io.observe(el);
    });
  };

  document.querySelectorAll('.section__head').forEach((h) => tagReveal([...h.children].filter((c) => !c.classList.contains('section__title')), 0.08));
  tagReveal([...document.querySelectorAll('.compare__grid .fix')], 0.08);
  tagReveal([...document.querySelectorAll('.cat-grid .cat')], 0.07);
  const ctaCard = document.querySelector('.cta__card');
  if (ctaCard) tagReveal([ctaCard], 0);

  /* Card stack - sticky shrink via scrub (scroll-driven, no RAF needed) */
  const cards = gsap.utils.toArray('.stack-card');
  cards.forEach((card, i) => {
    const inner = card.querySelector('.stack-card__inner');
    if (i < cards.length - 1) {
      // recede cleanly and QUICKLY (short range, no blur) so you never sit in an ugly mid-transition
      gsap.to(inner, {
        scale: 0.94, opacity: 0.35,
        scrollTrigger: { trigger: card, start: 'top 16%', end: '+=32%', scrub: 0.3 },
      });
    }
  });

  /* Nav hide/show on scroll */
  let lastY = 0;
  const nav = document.getElementById('floatingNav');
  const darkSections = Array.from(document.querySelectorAll('.support'));
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: (self) => {
      const y = self.scroll();
      nav.classList.toggle('floating-nav--scrolled', y > window.innerHeight * 0.6);
      // When the nav floats over a dark section, force the white logo so it stays visible.
      const navRect = nav.getBoundingClientRect();
      const navMid = navRect.top + navRect.height / 2;
      const overDark = darkSections.some((s) => {
        const r = s.getBoundingClientRect();
        return r.top <= navMid && r.bottom >= navMid;
      });
      nav.classList.toggle('floating-nav--on-dark', overDark);
      // Nav stays visible at all times (no hide on scroll).
    },
  });

  /* Scroll progress bar - fills as you approach the end */
  const progressBar = document.getElementById('scrollProgress');
  if (progressBar) {
    gsap.to(progressBar, { scaleX: 1, ease: 'none',
      scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });
  }

  /* Globe follows scroll (Messenger-style): scrolling the hero turns the globe.
     The globe IIFE reads window.__globeScroll and eases its rotation toward it. */
  ScrollTrigger.create({
    trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true,
    onUpdate: (self) => { window.__globeScroll = self.progress; },
  });

  /* Credit ladder: cards rise, then the bars CLIMB in sequence (cycle 1 -> 2 -> 3),
     each with a light sweep, and the featured tier pulses when the line maxes out. */
  /* Credit ladder: one slide per cycle (text + its own video). Side arrows + pills + auto-advance. */
  const cslider = document.getElementById('creditSlider');
  if (cslider) {
    const track = cslider.querySelector('.cslider__track');
    const slides = [...cslider.querySelectorAll('.cslide')];
    const pills = [...cslider.querySelectorAll('.cs-pill')];
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const DELAY = 5500;
    let idx = 0, timer = null, inView = false, engaged = false;
    const go = (i) => {
      idx = (i + slides.length) % slides.length; // wrap around
      track.style.transform = 'translateX(' + (-idx * 100) + '%)';
      pills.forEach((p, k) => p.classList.toggle('is-active', k === idx));
      cslider.querySelectorAll('.cslide video').forEach((v) => v.pause());
      const v = slides[idx].querySelector('video');
      if (v) { const p = v.play(); if (p && p.catch) p.catch(() => {}); }
    };
    const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
    const start = () => { stop(); if (!reduce && inView && !engaged) timer = setInterval(() => go(idx + 1), DELAY); };
    // ANY click inside the slider means the user is reading/navigating: stop auto-advance for good.
    cslider.addEventListener('click', () => { engaged = true; stop(); });
    pills.forEach((p, k) => p.addEventListener('click', () => go(k)));
    cslider.querySelectorAll('.cslider__arrow').forEach((a) =>
      a.addEventListener('click', () => go(idx + Number(a.dataset.dir))));
    // pause on hover, resume on leave (only until the user has engaged)
    cslider.addEventListener('mouseenter', stop);
    cslider.addEventListener('mouseleave', start);
    // auto-advance only while the slider is on screen
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((es) => {
        inView = es[0].isIntersecting;
        inView ? start() : stop();
      }, { threshold: 0.3 }).observe(cslider);
    } else { inView = true; start(); }
    // per-slide FAQ accordion (independent toggle)
    cslider.querySelectorAll('.cslide .acc-trigger').forEach((tr) =>
      tr.addEventListener('click', () => tr.closest('.acc-item').classList.toggle('is-open')));
    go(0);
  }

});

/* ---------- Scroll follower: dot follows + opens the steps ---------- */
(function follow() {
  const sec = document.getElementById('follow');
  if (!sec) return;
  const wrap = sec.querySelector('.follow__path-wrap');
  const dot = sec.querySelector('.follow__dot');
  const fg = sec.querySelector('.follow__path-fg');
  const VBW = 70, VBH = 600;
  const fgLen = fg ? fg.getTotalLength() : 0;
  if (fg) { fg.style.strokeDasharray = fgLen; fg.style.strokeDashoffset = fgLen; }
  const steps = [...sec.querySelectorAll('.fstep')];
  const thresholds = [0.04, 0.30, 0.56, 0.80];
  function update() {
    const total = sec.offsetHeight - window.innerHeight;
    if (total <= 0) { steps.forEach((s) => s.classList.add('active')); return; }
    const p = Math.min(1, Math.max(0, -sec.getBoundingClientRect().top / total));
    if (fg) fg.style.strokeDashoffset = fgLen * (1 - p);
    if (fg && dot && wrap) {
      const pt = fg.getPointAtLength(Math.max(0.001, p) * fgLen);
      dot.style.left = (pt.x / VBW * wrap.clientWidth) + 'px';
      dot.style.top = (pt.y / VBH * wrap.clientHeight) + 'px';
    }
    let cur = -1;
    steps.forEach((s, i) => { const on = p >= (thresholds[i] !== undefined ? thresholds[i] : 1); s.classList.toggle('active', on); if (on) cur = i; });
    steps.forEach((s, i) => s.classList.toggle('current', i === cur));
  }
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();

/* ---------- Category cards: play videos only while the grid is on screen ---------- */
(function catVideos() {
  const vids = [...document.querySelectorAll('.cat__media')];
  const grid = document.querySelector('.cat-grid');
  if (!vids.length || !grid) return;
  const play = () => vids.forEach((v) => { const pr = v.play(); if (pr && pr.catch) pr.catch(() => {}); });
  const pause = () => vids.forEach((v) => v.pause());
  if (prefersReduced) return;
  if (!('IntersectionObserver' in window)) { play(); return; }
  new IntersectionObserver((es) => {
    es.forEach((e) => (e.isIntersecting ? play() : pause()));
  }, { threshold: 0.15 }).observe(grid);
})();

/* ---------- Step cards: video + scroll parallax (ship sails out of frame) ---------- */
(function stepsScene() {
  const sec = document.querySelector('.flow');
  if (!sec) return;
  const vids = [...sec.querySelectorAll('.step__vid')];
  if (!vids.length) return;
  const play = () => { if (prefersReduced) return; vids.forEach((v) => { const p = v.play(); if (p && p.catch) p.catch(() => {}); }); };
  const pause = () => vids.forEach((v) => v.pause());
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? play() : pause())), { threshold: 0.12 }).observe(sec);
  } else { play(); }

  if (prefersReduced) return;
  function apply() {
    const r = sec.getBoundingClientRect(), vh = window.innerHeight;
    const p = Math.max(0, Math.min(1, (vh - r.top) / (vh + r.height))); // 0..1 as the section travels up
    vids.forEach((v, i) => {
      if (i === 2) {
        // ship sails out: pan horizontally + a little up, while staying covered (scale)
        v.style.transform = 'translate(' + (-(p) * 60).toFixed(1) + 'px,' + ((p - 0.5) * 18).toFixed(1) + 'px) scale(1.4)';
      } else {
        v.style.transform = 'translateY(' + ((p - 0.5) * 44).toFixed(1) + 'px) scale(1.4)';
      }
    });
  }
  window.addEventListener('scroll', apply, { passive: true });
  window.addEventListener('resize', apply);
  apply();
})();

/* ---------- Interactive 3D tilt on cards (steps, categories, why-us, credit) ---------- */
(function cardTilt() {
  if (prefersReduced || !window.matchMedia('(hover: hover)').matches) return;
  document.querySelectorAll('.flow .step, .cat, .fix, .tier').forEach((card) => {
    card.addEventListener('pointerenter', () => {
      card.style.transition = 'transform 0s, box-shadow .4s var(--ease)';
    });
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      card.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
      card.style.setProperty('--my', (py * 100).toFixed(1) + '%');
      const rx = ((0.5 - py) * 9).toFixed(2);
      const ry = ((px - 0.5) * 11).toFixed(2);
      card.style.transform = `perspective(1100px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
    });
    card.addEventListener('pointerleave', () => {
      card.style.transition = 'transform .55s var(--ease), box-shadow .4s var(--ease)';
      card.style.transform = '';
    });
  });
})();

/* ---------- Form ---------- */
(function form() {
  const f = document.getElementById('accessForm');
  const ok = document.getElementById('formOk');
  f.addEventListener('submit', (e) => {
    e.preventDefault();
    ok.hidden = false;
    f.querySelector('.access-form__submit span').textContent = 'Request sent';
    setTimeout(() => f.reset(), 400);
  });
})();

/* ===== 05 Why MasterStock: before/after comparison slider ===== */
(function () {
  var root = document.getElementById('msCompare');
  if (!root) return;
  var vp = root.querySelector('.msc__viewport');
  var handle = root.querySelector('.msc__handle');
  if (!vp || !handle) return;
  var dragging = false;

  function setPos(pct) {
    pct = Math.max(0, Math.min(100, pct)); // full range so each side can be read end to end
    vp.style.setProperty('--pos', pct + '%');
    handle.setAttribute('aria-valuenow', Math.round(pct));
  }
  function fromClientX(clientX) {
    var r = vp.getBoundingClientRect();
    setPos(((clientX - r.left) / r.width) * 100);
  }
  function onDown(e) { dragging = true; vp.setPointerCapture && e.pointerId != null && vp.setPointerCapture(e.pointerId); fromClientX(e.clientX); }
  function onMove(e) { if (dragging) fromClientX(e.clientX); }
  function onUp() { dragging = false; }

  vp.addEventListener('pointerdown', onDown);
  vp.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
  vp.addEventListener('pointerleave', onUp);

  handle.addEventListener('keydown', function (e) {
    var cur = parseFloat(handle.getAttribute('aria-valuenow')) || 50;
    if (e.key === 'ArrowLeft') { setPos(cur - 4); e.preventDefault(); }
    else if (e.key === 'ArrowRight') { setPos(cur + 4); e.preventDefault(); }
    else if (e.key === 'Home') { setPos(4); e.preventDefault(); }
    else if (e.key === 'End') { setPos(96); e.preventDefault(); }
  });

  setPos(50);
})();
