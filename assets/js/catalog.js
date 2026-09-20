// Каталог: фильтры, сортировка и пагинация на клиенте. Состояние хранится в URL (?body=..&sort=..&page=2),
// поэтому ссылкой на отфильтрованный список можно поделиться. Без JS видны все карточки.
const catalogEl = document.querySelector('[data-catalog]');

if (catalogEl) {
  const $ = (sel) => catalogEl.querySelector(sel);
  const form = $('[data-filters]');
  const grid = $('[data-grid]');
  const countEl = $('[data-count]');
  const emptyEl = $('[data-empty]');
  const pagerEl = $('[data-pagination]');
  const priceInput = $('[data-price]');
  const priceOut = $('[data-price-out]');
  const sortSelect = $('[data-sort]');
  const toggleBtn = $('[data-filters-toggle]');
  const badge = $('[data-filters-badge]');

  const cards = [...grid.children];
  const pageSize = Number(catalogEl.dataset.pageSize) || 6;
  const numberFormat = new Intl.NumberFormat(document.documentElement.lang);
  const formatPrice = (n) => catalogEl.dataset.priceFormat.replace('{n}', numberFormat.format(n));

  // Границы слайдера считаем по данным карточек; шаг зависит от порядка цены (59 900 -> 1 000, 5 490 000 -> 100 000)
  const prices = cards.map((c) => Number(c.dataset.price));
  const step = 10 ** (String(Math.max(...prices)).length - 2);
  const bounds = { min: Math.floor(Math.min(...prices) / step) * step, max: Math.ceil(Math.max(...prices) / step) * step };
  Object.assign(priceInput, { min: bounds.min, max: bounds.max, step });

  const SORTS = {
    order: (a, b) => a.order - b.order,
    'price-asc': (a, b) => a.price - b.price,
    'price-desc': (a, b) => b.price - a.price,
    'range-desc': (a, b) => b.range - a.range,
    'accel-asc': (a, b) => a.accel - b.accel,
    'power-desc': (a, b) => b.power - a.power,
  };

  const items = cards.map((el) => ({
    el,
    order: Number(el.dataset.order),
    price: Number(el.dataset.price),
    range: Number(el.dataset.range),
    accel: Number(el.dataset.accel),
    power: Number(el.dataset.power),
    body: el.dataset.body,
    drive: el.dataset.drive,
  }));

  const defaults = () => ({ body: [], drive: [], price: bounds.max, sort: 'order', page: 1 });

  function readUrl() {
    const p = new URLSearchParams(location.search);
    const list = (k) => (p.get(k) ? p.get(k).split(',') : []);
    const s = defaults();
    s.body = list('body');
    s.drive = list('drive');
    const price = Number(p.get('price'));
    if (price >= bounds.min && price <= bounds.max) s.price = price;
    if (SORTS[p.get('sort')]) s.sort = p.get('sort');
    s.page = Math.max(1, parseInt(p.get('page'), 10) || 1);
    return s;
  }

  function writeUrl() {
    const d = defaults();
    const p = new URLSearchParams();
    if (state.body.length) p.set('body', state.body.join(','));
    if (state.drive.length) p.set('drive', state.drive.join(','));
    if (state.price !== d.price) p.set('price', state.price);
    if (state.sort !== d.sort) p.set('sort', state.sort);
    if (state.page > 1) p.set('page', state.page);
    const qs = p.toString();
    history.replaceState(null, '', location.pathname + (qs ? `?${qs}` : ''));
  }

  function syncForm() {
    form.querySelectorAll('input[name="body"]').forEach((i) => (i.checked = state.body.includes(i.value)));
    form.querySelectorAll('input[name="drive"]').forEach((i) => (i.checked = state.drive.includes(i.value)));
    priceInput.value = state.price;
    sortSelect.value = state.sort;
  }

  const checked = (name) => [...form.querySelectorAll(`input[name="${name}"]:checked`)].map((i) => i.value);

  function renderPagination(pages) {
    pagerEl.hidden = pages <= 1;
    pagerEl.replaceChildren();
    if (pages <= 1) return;

    const ul = document.createElement('ul');
    const add = (label, page, { current = false, disabled = false, aria } = {}) => {
      const li = document.createElement('li');
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = label;
      b.disabled = disabled;
      if (aria) b.setAttribute('aria-label', aria);
      if (current) b.setAttribute('aria-current', 'page');
      b.addEventListener('click', () => goTo(page));
      li.append(b);
      ul.append(li);
    };

    const pageLabel = catalogEl.dataset.pageLabel;
    add('←', state.page - 1, { disabled: state.page === 1, aria: catalogEl.dataset.prev });
    for (let n = 1; n <= pages; n++) add(String(n), n, { current: n === state.page, aria: `${pageLabel} ${n}` });
    add('→', state.page + 1, { disabled: state.page === pages, aria: catalogEl.dataset.next });
    pagerEl.append(ul);
  }

  function render() {
    const filtered = items
      .filter((i) => (!state.body.length || state.body.includes(i.body))
        && (!state.drive.length || state.drive.includes(i.drive))
        && i.price <= state.price)
      .sort(SORTS[state.sort]);

    const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
    state.page = Math.min(state.page, pages);
    const visible = new Set(filtered.slice((state.page - 1) * pageSize, state.page * pageSize));

    // порядок в DOM = порядок сортировки; отфильтрованные уходят в конец и скрываются
    const rest = items.filter((i) => !filtered.includes(i));
    grid.append(...filtered.map((i) => i.el), ...rest.map((i) => i.el));
    items.forEach((i) => (i.el.hidden = !visible.has(i)));

    // бейдж на кнопке «Фильтры» (мобильная версия): сколько фильтров активно
    const active = state.body.length + state.drive.length + (state.price !== bounds.max ? 1 : 0);
    badge.textContent = active;
    badge.hidden = active === 0;

    priceOut.textContent = formatPrice(state.price);
    countEl.textContent = catalogEl.dataset.found.replace('{n}', filtered.length);
    emptyEl.hidden = filtered.length > 0;
    renderPagination(pages);
    writeUrl();
  }

  function goTo(page) {
    state.page = page;
    render();
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    grid.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }

  function onChange() {
    state.body = checked('body');
    state.drive = checked('drive');
    state.price = Number(priceInput.value);
    state.sort = sortSelect.value;
    state.page = 1;
    render();
  }

  let state = readUrl();
  form.hidden = false;
  toggleBtn.hidden = false;
  toggleBtn.addEventListener('click', () => {
    const open = toggleBtn.getAttribute('aria-expanded') === 'true';
    toggleBtn.setAttribute('aria-expanded', String(!open));
    form.classList.toggle('is-collapsed', open);
  });
  form.addEventListener('input', onChange);
  form.addEventListener('reset', (e) => {
    e.preventDefault();
    state = defaults();
    syncForm();
    render();
  });
  syncForm();
  render();
}
