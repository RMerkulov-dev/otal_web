(() => {
  'use strict';

  const root = document.documentElement;
  const body = document.body;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const depthMotion = matchMedia('(min-width: 761px) and (min-height: 651px) and (hover: hover) and (pointer: fine)');
  const menuButton = document.querySelector('.menu-button');
  const navigation = document.querySelector('#navigation');
  const motionButton = document.querySelector('.motion-toggle');
  let userPaused = false;
  try { userPaused = localStorage.getItem('otal-motion-paused') === 'true'; } catch { /* Storage is optional. */ }
  let paused = userPaused || reducedMotion.matches;
  let frame = 0;
  let scrollDirty = true;
  const runningAnimations = new Set();
  const counterFrames = new Map();
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
        if (paused || document.hidden) return;
        const started = performance.now();
        const tick = now => {
          const progress = clamp((now - started) / 1400);
          element.textContent = Math.round(target * (1 - (1 - progress) ** 3));
          if (progress < 1 && !paused && !document.hidden) counterFrames.set(element, requestAnimationFrame(tick));
          else { element.textContent = target; counterFrames.delete(element); }
        };
        counterFrames.set(element, requestAnimationFrame(tick));
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
        markScrollDirty();
      };
    });
  });

  const hero = document.querySelector('.hero');
  const servicePhoto = document.querySelector('.service-photo');
  const cards = [...document.querySelectorAll('.gallery-grid figure')];
  const sections = [...document.querySelectorAll('main section[id]')];
  const navLinks = [...navigation.querySelectorAll('a')];
  const progressBar = document.querySelector('.scroll-progress');

  // Keep native anchor navigation and expose the actual service before scrolling.
  document.querySelectorAll('.lab-service').forEach(link => {
    link.addEventListener('click', () => {
      const details = document.querySelector(link.getAttribute('href'));
      if (details) {
        details.open = true;
        details.classList.add('is-visible');
        const summary = details.querySelector('summary');
        summary.focus({ preventScroll: true });
      }
    });
  });

  const gallery = document.querySelector('.gallery');
  const contacts = document.querySelector('.contacts');
  const motionRegions = [hero, contacts];
  const visibleRegions = new Set([hero, servicePhoto, gallery, contacts]);
  const writtenStyles = new WeakMap();
  let currentSection = null;
  let headerScrolled = null;
  const serviceDial = document.querySelector('.lab-interface');
  const serviceSlides = [...document.querySelectorAll('.service-slides .lab-service')];
  const serviceSwitches = [...document.querySelectorAll('.service-switch')];
  let selectedService = 0;
  let serviceTimer = 0;
  let dialHovered = false;
  let dialFocused = false;

  function syncServiceRotation() {
    clearTimeout(serviceTimer);
    serviceTimer = 0;
    if (paused || document.hidden || !visibleRegions.has(hero) || dialHovered || dialFocused) return;
    serviceTimer = setTimeout(() => selectService((selectedService + 1) % serviceSlides.length), 4500);
  }
  function selectService(index) {
    selectedService = index;
    serviceSlides.forEach((slide, position) => {
      const selected = position === index;
      slide.classList.toggle('is-current', selected);
      slide.setAttribute('aria-hidden', String(!selected));
      slide.tabIndex = selected ? 0 : -1;
      serviceSwitches[position].setAttribute('aria-pressed', String(selected));
    });
    syncServiceRotation();
  }
  serviceSwitches.forEach((button, index) => button.addEventListener('click', () => selectService(index)));
  serviceDial.addEventListener('pointerenter', event => {
    if (event.pointerType === 'touch') return;
    dialHovered = true;
    syncServiceRotation();
  });
  serviceDial.addEventListener('pointerleave', () => { dialHovered = false; syncServiceRotation(); });
  serviceDial.addEventListener('focusin', () => { dialFocused = true; syncServiceRotation(); });
  serviceDial.addEventListener('focusout', event => {
    dialFocused = serviceDial.contains(event.relatedTarget);
    syncServiceRotation();
  });

  function writeStyle(element, property, value) {
    let previous = writtenStyles.get(element);
    if (!previous) { previous = new Map(); writtenStyles.set(element, previous); }
    if (previous.get(property) === value) return;
    element.style.setProperty(property, value);
    previous.set(property, value);
  }

  if ('IntersectionObserver' in window) {
    const viewportObserver = new IntersectionObserver(entries => {
      entries.forEach(({ target, isIntersecting }) => {
        if (isIntersecting) visibleRegions.add(target);
        else visibleRegions.delete(target);
        if (motionRegions.includes(target)) {
          target.classList.toggle('motion-idle', !isIntersecting);
          target.classList.toggle('motion-active', isIntersecting);
        }
      });
      scrollDirty = true;
      scheduleFrame();
      syncServiceRotation();
    }, { threshold: 0 });
    [...visibleRegions].forEach(element => viewportObserver.observe(element));
  }

  function renderFrame() {
    frame = 0;
    if (document.hidden) return;
    const animateDepth = !paused && depthMotion.matches;
    const viewport = innerHeight;
    const updateScroll = scrollDirty;
    scrollDirty = false;

    // Read layout first. No style or attribute writes until all measurements finish.
    const scrollPosition = scrollY;
    const scrollable = updateScroll ? root.scrollHeight - viewport : 0;
    const sectionTops = updateScroll ? sections.map(section => section.getBoundingClientRect().top) : [];
    const heroRect = animateDepth && visibleRegions.has(hero) && updateScroll
      ? hero.getBoundingClientRect() : null;
    const photoRect = updateScroll && animateDepth && visibleRegions.has(servicePhoto)
      ? servicePhoto.getBoundingClientRect() : null;
    const cardRects = updateScroll && animateDepth && visibleRegions.has(gallery)
      ? cards.map(card => card.getBoundingClientRect()) : [];

    // Write phase. Stable values are skipped instead of invalidating styles again.
    if (updateScroll) {
      writeStyle(progressBar, 'transform', `scaleX(${(scrollable > 0 ? clamp(scrollPosition / scrollable) : 0).toFixed(4)})`);
      const scrolled = scrollPosition > 24;
      if (headerScrolled !== scrolled) { body.classList.toggle('has-scrolled', scrolled); headerScrolled = scrolled; }
      let current = '';
      sectionTops.forEach((top, index) => { if (top < viewport * 0.42) current = `#${sections[index].id}`; });
      if (current !== currentSection) {
        navLinks.forEach(link => {
          if (link.getAttribute('href') === current) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
        currentSection = current;
      }
      if (heroRect) {
        writeStyle(hero, '--hero-scroll', `${clamp(-heroRect.top * 0.12, 0, 48).toFixed(2)}px`);
        writeStyle(hero, '--copy-scroll', `${(clamp(-heroRect.top, 0, heroRect.height) * 0.055).toFixed(2)}px`);
      }
      if (photoRect) writeStyle(servicePhoto, '--photo-shift', `${clamp((viewport / 2 - photoRect.top - photoRect.height / 2) * 0.09, -25, 25).toFixed(2)}px`);
      cardRects.forEach((rect, index) => {
        const next = cardRects[index + 1];
        const overlap = next ? clamp((viewport * 0.7 - next.top) / (viewport * 0.6)) : 0;
        writeStyle(cards[index], '--stack-scale', (1 - overlap * 0.045).toFixed(4));
        writeStyle(cards[index], '--stack-turn', `${(-overlap * 1.2).toFixed(3)}deg`);
      });
    }
  }

  function scheduleFrame() { if (!frame && !document.hidden) frame = requestAnimationFrame(renderFrame); }
  function markScrollDirty() { scrollDirty = true; scheduleFrame(); }
  addEventListener('scroll', markScrollDirty, { passive: true });
  addEventListener('resize', markScrollDirty, { passive: true });
  addEventListener('load', markScrollDirty, { once: true });
  // Image loads, font swaps and accordion expansion can change document height.
  if ('ResizeObserver' in window) new ResizeObserver(markScrollDirty).observe(body);

  depthMotion.addEventListener('change', markScrollDirty);

  function finishTransientMotion() {
    runningAnimations.forEach(animation => animation.finish());
    counterFrames.forEach((id, element) => {
      cancelAnimationFrame(id);
      element.textContent = element.dataset.counter;
    });
    counterFrames.clear();
  }
  function syncPageVisibility() {
    body.classList.toggle('page-hidden', document.hidden);
    syncServiceRotation();
    if (document.hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
      finishTransientMotion();
    } else markScrollDirty();
  }
  document.addEventListener('visibilitychange', syncPageVisibility);
  syncPageVisibility();

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
    if (paused) finishTransientMotion();
    syncServiceRotation();
    markScrollDirty();
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
