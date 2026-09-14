const toggle = document.getElementById('nav-toggle');
const links  = document.getElementById('nav-links');
if (toggle && links) {
  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', isOpen);
  });
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ── Reviews Carousel ── */
(function () {
  const carousel   = document.getElementById('reviews-carousel');
  const dotsWrap   = document.getElementById('carousel-dots');
  const prevBtn    = document.getElementById('carousel-prev');
  const nextBtn    = document.getElementById('carousel-next');
  if (!carousel) return;

  const cards      = Array.from(carousel.querySelectorAll('.ticket'));
  const total      = cards.length;
  let visibleCount = 3;
  let current      = 0;
  let autoTimer    = null;
  let isDragging   = false;
  let dragStartX   = 0;
  let dragDeltaX   = 0;

  function getVisible() {
    const w = window.innerWidth;
    if (w <= 600) return 1;
    if (w <= 900) return 2;
    return 3;
  }

  function maxIndex() { return Math.max(0, total - visibleCount); }

  /* Build dots */
  function buildDots() {
    dotsWrap.innerHTML = '';
    const pages = maxIndex() + 1;
    for (let i = 0; i < pages; i++) {
      const d = document.createElement('button');
      d.className = 'carousel-dot' + (i === current ? ' active' : '');
      d.setAttribute('aria-label', 'Go to review ' + (i + 1));
      d.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(d);
    }
  }

  function updateDots() {
    dotsWrap.querySelectorAll('.carousel-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  function getCardWidth() {
    if (!cards[0]) return 0;
    return cards[0].getBoundingClientRect().width + 24; /* +gap */
  }

  function applyTranslate(extra) {
    const offset = current * getCardWidth();
    carousel.style.transform = `translateX(${-(offset - (extra || 0))}px)`;
  }

  function goTo(index) {
    current = Math.max(0, Math.min(index, maxIndex()));
    applyTranslate(0);
    updateDots();
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current >= maxIndex();
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function startAuto() {
    stopAuto();
    autoTimer = setInterval(() => {
      if (current >= maxIndex()) goTo(0);
      else next();
    }, 4200);
  }

  function stopAuto() { clearInterval(autoTimer); }

  prevBtn.addEventListener('click', () => { prev(); startAuto(); });
  nextBtn.addEventListener('click', () => { next(); startAuto(); });

  /* Drag / swipe */
  carousel.addEventListener('mousedown',  e => { isDragging = true; dragStartX = e.clientX; carousel.style.transition = 'none'; });
  carousel.addEventListener('mousemove',  e => { if (!isDragging) return; dragDeltaX = e.clientX - dragStartX; applyTranslate(dragDeltaX); });
  carousel.addEventListener('mouseup',    e => { if (!isDragging) return; isDragging = false; carousel.style.transition = ''; if (Math.abs(dragDeltaX) > 60) { dragDeltaX < 0 ? next() : prev(); } else { applyTranslate(0); } dragDeltaX = 0; });
  carousel.addEventListener('mouseleave', e => { if (!isDragging) return; isDragging = false; carousel.style.transition = ''; applyTranslate(0); dragDeltaX = 0; });

  carousel.addEventListener('touchstart', e => { dragStartX = e.touches[0].clientX; carousel.style.transition = 'none'; }, {passive:true});
  carousel.addEventListener('touchmove',  e => { dragDeltaX = e.touches[0].clientX - dragStartX; applyTranslate(dragDeltaX); }, {passive:true});
  carousel.addEventListener('touchend',   () => { carousel.style.transition = ''; if (Math.abs(dragDeltaX) > 50) { dragDeltaX < 0 ? next() : prev(); } else { applyTranslate(0); } dragDeltaX = 0; });

  /* Pause auto on hover */
  const wrap = carousel.closest('.carousel-container');
  if (wrap) {
    wrap.addEventListener('mouseenter', stopAuto);
    wrap.addEventListener('mouseleave', startAuto);
  }

  /* Init + responsive */
  function init() {
    visibleCount = getVisible();
    buildDots();
    goTo(Math.min(current, maxIndex()));
  }

  init();
  startAuto();
  window.addEventListener('resize', init);
})();
