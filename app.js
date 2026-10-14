(() => {
  'use strict';

  const root = document.documentElement;
  const body = document.body;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const menuButton = document.querySelector('.menu-button');
  const navigation = document.querySelector('#navigation');
  const motionButton = document.querySelector('.motion-toggle');
  let userPaused = false;
  try { userPaused = localStorage.getItem('otal-motion-paused') === 'true'; } catch { /* Storage is optional. */ }
  let paused = userPaused || reducedMotion.matches;
  let frame = 0;
  const runningAnimations = new Set();
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

  document.querySelector('#year').textContent = new Date().getFullYear();
  document.querySelectorAll('img').forEach(img => {
    const fallback = () => {
      img.classList.add('image-unavailable');
      img.src = 'assets/photo-unavailable.svg';
    };
    img.addEventListener('error', fallback, { once: true });
    if (img.complete && !img.naturalWidth) fallback();
  });

  function closeMenu(returnFocus = false) {
    navigation.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.querySelector('span').textContent = '＋';
    if (returnFocus) menuButton.focus();
  }
  menuButton.addEventListener('click', () => {
    const open = navigation.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.querySelector('span').textContent = open ? '−' : '＋';
  });
  navigation.addEventListener('click', event => {
    if (event.target.closest('a')) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && navigation.classList.contains('open')) closeMenu(true);
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.header')) closeMenu();
  });
  matchMedia('(max-width: 760px)').addEventListener('change', () => closeMenu());

  // Reveal only after observers exist, so content remains readable without JS.
  const revealTargets = document.querySelectorAll('.about > .eyebrow, .about h2, .about-text > p, .facts > div, .section-heading, .service-photo, .service-list details, .reviews > div, .reviews > .eyebrow, .contact-top > *, .contact-grid > div');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });
    revealTargets.forEach((element, index) => {
      element.classList.add('reveal');
      element.style.setProperty('--reveal-delay', `${index % 3 * 75}ms`);
      revealObserver.observe(element);
    });

    const counterObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        counterObserver.unobserve(entry.target);
        const element = entry.target;
        const target = Number(element.dataset.counter);
        if (paused) return;
        const started = performance.now();
        const tick = now => {
          const progress = clamp((now - started) / 1400);
          element.textContent = Math.round(target * (1 - (1 - progress) ** 3));
          if (progress < 1 && !paused) requestAnimationFrame(tick);
          else element.textContent = target;
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.8 });
    document.querySelectorAll('[data-counter]').forEach(element => counterObserver.observe(element));
  }

  // Native details remain functional with JS disabled; WAAPI adds reversible transitions.
  document.querySelectorAll('.service-list details').forEach(details => {
    const summary = details.querySelector('summary');
    let animation;
    summary.addEventListener('click', event => {
      if (paused || !details.animate) return;
      event.preventDefault();
      const startHeight = details.getBoundingClientRect().height;
      const opening = animation ? animation.otalClosing : !details.open;
      if (animation) { runningAnimations.delete(animation); animation.cancel(); }
      details.open = true;
      const endHeight = opening ? details.scrollHeight : summary.getBoundingClientRect().height;
      animation = details.animate({ height: [`${startHeight}px`, `${endHeight}px`] }, { duration: 360, easing: 'cubic-bezier(.22,1,.36,1)' });
      animation.otalClosing = !opening;
      runningAnimations.add(animation);
      details.classList.add('is-animating');
      animation.onfinish = () => {
        details.open = opening;
        details.classList.remove('is-animating');
        runningAnimations.delete(animation);
        animation = null;
        scheduleFrame();
      };
    });
  });

  const hero = document.querySelector('.hero');
  const visual = document.querySelector('.hero-visual');
  const servicePhoto = document.querySelector('.service-photo');
  const cards = [...document.querySelectorAll('.gallery-grid figure')];
  const sections = [...document.querySelectorAll('main section[id]')];
  const navLinks = [...navigation.querySelectorAll('a')];
  const progressBar = document.querySelector('.scroll-progress');

  function renderScroll() {
    frame = 0;
    const viewport = innerHeight;
    const scrollable = root.scrollHeight - viewport;
    progressBar.style.transform = `scaleX(${scrollable > 0 ? clamp(scrollY / scrollable) : 0})`;
    body.classList.toggle('has-scrolled', scrollY > 24);
    let current = '';
    sections.forEach(section => { if (section.getBoundingClientRect().top < viewport * 0.42) current = `#${section.id}`; });
    navLinks.forEach(link => {
      if (link.getAttribute('href') === current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    if (paused) return;
    const heroRect = hero.getBoundingClientRect();
    if (heroRect.bottom > 0) {
      hero.style.setProperty('--hero-scroll', `${clamp(-heroRect.top, 0, heroRect.height) * 0.15}px`);
      hero.style.setProperty('--copy-scroll', `${clamp(-heroRect.top, 0, heroRect.height) * 0.055}px`);
    }
    const photoRect = servicePhoto.getBoundingClientRect();
    if (photoRect.top < viewport && photoRect.bottom > 0) {
      servicePhoto.style.setProperty('--photo-shift', `${clamp((viewport / 2 - photoRect.top - photoRect.height / 2) * 0.09, -25, 25)}px`);
    }
    cards.forEach((card, index) => {
      const next = cards[index + 1];
      const overlap = next ? clamp((viewport * 0.7 - next.getBoundingClientRect().top) / (viewport * 0.6)) : 0;
      card.style.setProperty('--stack-scale', 1 - overlap * 0.045);
      card.style.setProperty('--stack-turn', `${-overlap * 1.2}deg`);
    });
  }
  function scheduleFrame() { if (!frame) frame = requestAnimationFrame(renderScroll); }
  addEventListener('scroll', scheduleFrame, { passive: true });
  addEventListener('resize', scheduleFrame, { passive: true });
  addEventListener('load', scheduleFrame, { once: true });

  let pointerFrame = 0;
  let pointerX = 0;
  let pointerY = 0;
  visual.addEventListener('pointermove', event => {
    if (paused || !finePointer.matches) return;
    const rect = visual.getBoundingClientRect();
    pointerX = ((event.clientX - rect.left) / rect.width - 0.5) * 18;
    pointerY = ((event.clientY - rect.top) / rect.height - 0.5) * 18;
    if (!pointerFrame) pointerFrame = requestAnimationFrame(() => {
      pointerFrame = 0;
      if (paused) return;
      visual.style.setProperty('--pointer-x', `${pointerX}px`);
      visual.style.setProperty('--pointer-y', `${pointerY}px`);
    });
  });
  visual.addEventListener('pointerleave', () => {
    cancelAnimationFrame(pointerFrame);
    pointerFrame = 0;
    visual.style.setProperty('--pointer-x', '0px');
    visual.style.setProperty('--pointer-y', '0px');
  });

  function applyMotionPreference() {
    paused = userPaused || reducedMotion.matches;
    body.classList.toggle('paused', paused);
    motionButton.setAttribute('aria-pressed', String(paused));
    const label = reducedMotion.matches ? 'Рух вимкнено в налаштуваннях системи' : paused ? 'Увімкнути анімацію' : 'Призупинити анімацію';
    motionButton.setAttribute('aria-label', label);
    motionButton.title = label;
    motionButton.disabled = reducedMotion.matches;
    motionButton.querySelector('[aria-hidden]').textContent = paused ? '▶' : 'Ⅱ';
    motionButton.querySelector('.motion-label').textContent = paused ? 'Рух вимкнено' : 'Рух увімкнено';
    if (paused) runningAnimations.forEach(animation => animation.finish());
    scheduleFrame();
  }
  motionButton.addEventListener('click', () => {
    userPaused = !userPaused;
    try { localStorage.setItem('otal-motion-paused', String(userPaused)); } catch { /* Works on file:// as well. */ }
    applyMotionPreference();
  });
  reducedMotion.addEventListener('change', applyMotionPreference);
  applyMotionPreference();
  body.classList.add('motion-ready');
  scheduleFrame();
})();
