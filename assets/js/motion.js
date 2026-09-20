// Анимации при прокрутке: появление блоков, счётчики в цифрах, параллакс в hero.
// При prefers-reduced-motion всё показывается сразу и без движения.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');

  // --- появление: блоки с data-reveal выезжают, когда попадают в экран; ступенчатая задержка внутри одной сетки
  const revealEls = [...document.querySelectorAll('[data-reveal]')];
  const shown = (el) => {
    el.classList.add('is-visible');
    // после показа возвращаем элементу обычные переходы (ховер без задержки)
    setTimeout(() => {
      el.removeAttribute('data-reveal');
      el.classList.remove('is-visible');
      el.style.transitionDelay = '';
    }, 900);
  };

  if (reduce.matches || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.removeAttribute('data-reveal'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.filter((e) => e.isIntersecting).forEach((e, i) => {
        e.target.style.transitionDelay = `${i * 80}ms`;
        shown(e.target);
        io.unobserve(e.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => io.observe(el));
  }

  // --- счётчики: число растёт от нуля до значения, знаки после запятой сохраняются
  const counters = [...document.querySelectorAll('[data-count]')];
  const animate = (el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = (el.dataset.count.split('.')[1] || '').length;
    const start = performance.now();
    const duration = 1400;
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - t) ** 3;
      el.textContent = (target * eased).toFixed(decimals);
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    // rAF не вызывается в фоновой вкладке, поэтому итоговое значение ставим и по таймеру
    setTimeout(() => (el.textContent = target.toFixed(decimals)), duration + 50);
  };

  if (!reduce.matches && 'IntersectionObserver' in window) {
    counters.forEach((el) => (el.textContent = '0'));
    const co = new IntersectionObserver((entries) => {
      entries.filter((e) => e.isIntersecting).forEach((e) => {
        animate(e.target);
        co.unobserve(e.target);
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => co.observe(el));
  }

  // --- параллакс: картинка в hero сдвигается медленнее прокрутки
  const layer = document.querySelector('[data-parallax]');
  if (layer && !reduce.matches) {
    let ticking = false;
    const update = () => {
      const y = Math.min(window.scrollY, window.innerHeight);
      layer.style.setProperty('--py', `${y * 0.14}px`);
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
  }
})();
