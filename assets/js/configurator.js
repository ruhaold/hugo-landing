// Конфигуратор: пересчитывает цену и запас хода, перекрашивает SVG, хранит выбор в URL
// (?color=red&wheels=w21&pkg=assist,roof), чтобы комплектацией можно было поделиться.
(() => {
  const el = document.querySelector('[data-configurator]');
  if (!el) return;

  const $ = (s) => el.querySelector(s);
  const form = $('[data-options]');
  const svg = $('.car-config');
  const basePrice = Number(el.dataset.basePrice);
  const baseRange = Number(el.dataset.baseRange);
  const nf = new Intl.NumberFormat(document.documentElement.lang);
  const money = (n) => el.dataset.priceFormat.replace('{n}', nf.format(n));
  const checked = (name) => form.querySelector(`input[name="${name}"]:checked`);

  // --- состояние из URL
  const p = new URLSearchParams(location.search);
  const pick = (name, value) => {
    const input = form.querySelector(`input[name="${name}"][value="${CSS.escape(value)}"]`);
    if (input) input.checked = true;
  };
  if (p.get('color')) pick('color', p.get('color'));
  if (p.get('wheels')) pick('wheels', p.get('wheels'));
  (p.get('pkg') ? p.get('pkg').split(',') : []).forEach((v) => pick('pkg', v));

  function update() {
    const color = checked('color');
    const wheels = checked('wheels');
    const pkgs = [...form.querySelectorAll('input[name="pkg"]:checked')];

    const price = basePrice + [color, wheels, ...pkgs].reduce((sum, i) => sum + Number(i.dataset.price), 0);
    const range = Math.round(baseRange * Number(wheels.dataset.rangeFactor));
    const wheelsText = `${wheels.dataset.name} ${wheels.dataset.size}${el.dataset.inch}`;
    const pkgText = pkgs.length ? pkgs.map((i) => i.dataset.name).join(', ') : el.dataset.none;

    // превью: цвет кузова и рисунок дисков
    svg.style.setProperty('--paint', color.dataset.hex);
    svg.querySelectorAll('use.wheel').forEach((u) => u.setAttribute('href', `#wheel-${wheels.dataset.size}`));

    // сводка
    $('[data-sum-color]').textContent = color.dataset.name;
    $('[data-color-hint]').textContent = color.dataset.name;
    $('[data-sum-wheels]').textContent = wheelsText;
    $('[data-sum-packages]').textContent = pkgText;
    $('[data-range]').textContent = `${range} ${el.dataset.km}`;
    $('[data-total]').textContent = money(price);

    // кнопка ведёт в форму тест-драйва с готовой комплектацией
    const summary = `${color.dataset.name}, ${wheelsText}, ${pkgText} — ${money(price)}`;
    $('[data-cta]').href = `${el.dataset.homeUrl}?model=${encodeURIComponent(el.dataset.model)}&config=${encodeURIComponent(summary)}#test-drive`;

    // URL: только отличия от значений по умолчанию
    const q = new URLSearchParams();
    if (color.value !== 'signature') q.set('color', color.value);
    if (!wheels.defaultChecked) q.set('wheels', wheels.value);
    if (pkgs.length) q.set('pkg', pkgs.map((i) => i.value).join(','));
    const qs = q.toString();
    history.replaceState(null, '', location.pathname + (qs ? `?${qs}` : '') + location.hash);
  }

  form.addEventListener('change', update);
  update();
})();
