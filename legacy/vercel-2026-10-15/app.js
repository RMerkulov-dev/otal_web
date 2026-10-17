(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let userPaused = false;
  try { userPaused = localStorage.getItem('otal-motion-paused') === 'true'; } catch {}
  let paused = false;
  const animations = new Set();
  const counters = new Map();
  $('#year').textContent = new Date().getFullYear();
  $$('img').forEach(img => {
    const fallback = () => { img.src = 'assets/photo-unavailable.svg'; };
    img.addEventListener('error', fallback, { once: true });
    if (img.complete && !img.naturalWidth) fallback();
  });
  const menu = $('.menu-button');
  const navigation = $('#navigation');
  function closeMenu(focus = false) {
    navigation.classList.remove('open');
    menu.setAttribute('aria-expanded', 'false');
    if (focus) menu.focus();
  }
  menu.addEventListener('click', () => menu.setAttribute('aria-expanded', String(navigation.classList.toggle('open'))));
  navigation.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
  document.addEventListener('click', e => { if (!e.target.closest('.header')) closeMenu(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && navigation.classList.contains('open')) closeMenu(true); });
  matchMedia('(max-width: 800px)').addEventListener('change', () => closeMenu());

  function finishMotion() {
    animations.forEach(animation => animation.finish());
    counters.forEach((frame, element) => { cancelAnimationFrame(frame); element.textContent = element.dataset.counter; });
    counters.clear();
  }
  function syncMotion() {
    paused = userPaused || reduced.matches;
    root.classList.toggle('paused', paused);
    const button = $('.motion-toggle');
    button.setAttribute('aria-pressed', String(paused));
    button.textContent = paused ? 'Увімкнути анімацію' : 'Призупинити анімацію';
    button.disabled = reduced.matches;
    if (paused) finishMotion();
  }
  $('.motion-toggle').addEventListener('click', () => {
    userPaused = !userPaused;
    try { localStorage.setItem('otal-motion-paused', String(userPaused)); } catch {}
    syncMotion();
  });
  reduced.addEventListener('change', syncMotion);
  syncMotion();

  if ('IntersectionObserver' in window) {
    const reveal = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      reveal.unobserve(entry.target);
    }), { threshold: .08 });
    $$('[data-reveal]').forEach(el => { el.classList.add('reveal'); reveal.observe(el); });
    const count = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      count.unobserve(entry.target);
      if (paused || document.hidden) return;
      const el = entry.target, value = Number(el.dataset.counter), start = performance.now();
      function tick(now) {
        const progress = Math.min(1, (now - start) / 1200);
        el.textContent = Math.round(value * (1 - (1 - progress) ** 3));
        if (progress < 1 && !paused && !document.hidden) counters.set(el, requestAnimationFrame(tick));
        else { el.textContent = value; counters.delete(el); }
      }
      counters.set(el, requestAnimationFrame(tick));
    }), { threshold: .8 });
    $$('[data-counter]').forEach(el => count.observe(el));
  }

  const detailAnimations = new Map();
  $$('.service-list details').forEach(details => {
    const summary = details.querySelector('summary');
    summary.addEventListener('click', event => {
      if (paused || !details.animate) return;
      event.preventDefault();
      const prior = detailAnimations.get(details);
      const opening = prior ? !prior.opening : !details.open;
      const startHeight = details.getBoundingClientRect().height;
      if (prior) { animations.delete(prior); prior.cancel(); }
      details.open = true;
      const endHeight = opening ? details.scrollHeight : summary.getBoundingClientRect().height;
      const animation = details.animate({ height: [`${startHeight}px`, `${endHeight}px`] }, { duration: 350, easing: 'cubic-bezier(.22,1,.36,1)' });
      animation.opening = opening;
      detailAnimations.set(details, animation);
      animations.add(animation);
      details.classList.add('is-animating');
      animation.onfinish = () => {
        details.open = opening;
        details.classList.remove('is-animating');
        animations.delete(animation);
        detailAnimations.delete(details);
      };
    });
  });
  function openService(hash, focus = false) {
    const details = document.getElementById(hash.slice(1));
    if (!details?.matches('details')) return;
    const animation = detailAnimations.get(details);
    if (animation) { animation.finish(); }
    details.open = true;
    details.closest('[data-reveal]')?.classList.add('is-visible');
    if (focus) details.querySelector('summary').focus({ preventScroll: true });
  }
  $$('a[href^="#service-"]').forEach(link => link.addEventListener('click', () => openService(link.hash, true)));
  openService(location.hash);
  addEventListener('hashchange', () => openService(location.hash));

  const slider = $('.gallery-slider'), track = $('.gallery-track');
  const slides = $$('.gallery-slide'), dots = $$('.gallery-dots button');
  let slide = 0, touchStart = null;
  function selectSlide(index) {
    slide = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${slide * 100}%)`;
    slides.forEach((el, i) => { el.setAttribute('aria-hidden', String(i !== slide)); });
    dots.forEach((el, i) => el.setAttribute('aria-pressed', String(i === slide)));
    $('.gallery-count').textContent = `${String(slide + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
  }
  $('.previous').addEventListener('click', () => selectSlide(slide - 1));
  $('.next').addEventListener('click', () => selectSlide(slide + 1));
  dots.forEach((button, index) => button.addEventListener('click', () => selectSlide(index)));
  slider.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); selectSlide(slide + (e.key === 'ArrowRight' ? 1 : -1)); }
  });
  slider.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') touchStart = { x: e.clientX, y: e.clientY }; });
  slider.addEventListener('pointerup', e => {
    if (!touchStart) return;
    const dx = e.clientX - touchStart.x, dy = e.clientY - touchStart.y;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) selectSlide(slide + (dx < 0 ? 1 : -1));
    touchStart = null;
  });
  slider.addEventListener('pointercancel', () => { touchStart = null; });
  selectSlide(0);

  const dialog = $('#contact-dialog');
  let dialogTrigger;
  $$('[data-contact]').forEach(button => button.addEventListener('click', () => {
    dialogTrigger = button;
    closeMenu();
    if (!dialog.showModal) { location.hash = 'contacts'; return; }
    dialog.showModal();
    document.body.classList.add('modal-open');
  }));
  $('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => {
    const bounds = dialog.getBoundingClientRect();
    if (e.target === dialog && (e.clientX < bounds.left || e.clientX > bounds.right || e.clientY < bounds.top || e.clientY > bounds.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => { document.body.classList.remove('modal-open'); dialogTrigger?.focus(); });
  const contactForm = $('#contact-form');
  let submitting = false;
  contactForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (submitting) return;
    const status = $('.form-status');
    const button = contactForm.querySelector('[type="submit"]');
    const name = contactForm.elements.namedItem('name');
    name.value = name.value.trim();
    if (!contactForm.reportValidity()) return;
    const data = new FormData(contactForm);
    if (data.get('_honey')) return;
    const payload = Object.fromEntries(data);
    payload._url = location.href.split('#')[0];
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    const originalButton = button.innerHTML;
    submitting = true;
    button.disabled = true;
    button.textContent = 'Надсилаємо…';
    contactForm.setAttribute('aria-busy', 'true');
    status.dataset.state = 'pending';
    status.textContent = 'Зачекайте, надсилаємо вашу заявку.';
    try {
      const response = await fetch(contactForm.action.replace('formsubmit.co/', 'formsubmit.co/ajax/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      const result = await response.json();
      if (!response.ok || (result.success !== true && result.success !== 'true')) {
        throw new Error('Submission not accepted');
      }
      status.dataset.state = 'success';
      status.textContent = 'Заявку прийнято сервісом надсилання. Дякуємо за звернення!';
      contactForm.reset();
    } catch (error) {
      status.dataset.state = 'error';
      status.textContent = error.name === 'AbortError'
        ? 'Не отримали підтвердження вчасно. Заявка могла надійти. Зателефонуйте нам, щоб уточнити: +380 (68) 714-05-82. Ваші дані збережені у формі.'
        : 'Не вдалося підтвердити надсилання. Спробуйте пізніше або зателефонуйте: +380 (68) 714-05-82. Ваші дані збережені у формі.';
    } finally {
      clearTimeout(timeout);
      submitting = false;
      button.disabled = false;
      button.innerHTML = originalButton;
      contactForm.removeAttribute('aria-busy');
    }
  });

  let frame = 0;
  const sections = $$('main section[id]'), links = $$('#navigation a');
  function render() {
    frame = 0;
    const y = scrollY, max = root.scrollHeight - innerHeight;
    const tops = sections.map(section => section.getBoundingClientRect().top);
    let active = '';
    tops.forEach((top, i) => { if (top < innerHeight * .4) active = '#' + sections[i].id; });
    $('.scroll-progress').style.transform = `scaleX(${max > 0 ? Math.max(0, Math.min(1, y / max)) : 0})`;
    document.body.classList.toggle('has-scrolled', y > 20);
    links.forEach(link => {
      if (link.hash === active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  function schedule() { if (!frame && !document.hidden) frame = requestAnimationFrame(render); }
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  addEventListener('load', schedule, { once: true });
  if ('ResizeObserver' in window) new ResizeObserver(schedule).observe(document.body);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { finishMotion(); cancelAnimationFrame(frame); frame = 0; }
    else schedule();
  });
  schedule();
})();
