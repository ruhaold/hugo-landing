// Калькулятор: стоимость 100 км и владения за год и за пять лет, электромобиль против бензинового авто.
(() => {
  const el = document.querySelector('[data-calculator]');
  if (!el) return;

  const $ = (s) => el.querySelector(s);
  const form = el.querySelector('form');
  const digits = Number(el.dataset.digits);
  const lang = document.documentElement.lang;
  const fmt = (n, d) => new Intl.NumberFormat(lang, { maximumFractionDigits: d }).format(n);
  const money = (n, d = 0) => el.dataset.priceFormat.replace('{n}', fmt(n, d));
  const num = (name) => Number(form.elements[name].value);

  function update() {
    const kwh100 = Number(form.elements.model.value);
    const mileage = num('mileage');

    // стоимость 100 км
    const ev100 = kwh100 * num('tariff');
    const ice100 = num('consumption') * num('fuel');

    const year = (per100) => (per100 * mileage) / 100;
    const [evYear, iceYear] = [year(ev100), year(ice100)];
    const diff = (iceYear - evYear) * 5;

    $('[data-kwh]').textContent = fmt(kwh100, 1);
    el.querySelectorAll('[data-out]').forEach((o) => {
      const v = num(o.dataset.out);
      o.textContent = o.dataset.money === 'true' ? money(v, digits) : fmt(v, 1);
    });

    $('[data-ev100]').textContent = money(ev100, digits);
    $('[data-ice100]').textContent = money(ice100, digits);
    $('[data-ev-year]').textContent = money(evYear);
    $('[data-ice-year]').textContent = money(iceYear);
    $('[data-ev-five]').textContent = money(evYear * 5);
    $('[data-ice-five]').textContent = money(iceYear * 5);

    // столбики: ширина пропорциональна годовым расходам
    const top = Math.max(evYear, iceYear) || 1;
    $('[data-bar-ev]').style.width = `${(evYear / top) * 100}%`;
    $('[data-bar-ice]').style.width = `${(iceYear / top) * 100}%`;

    $('[data-diff]').textContent = money(Math.abs(diff));
    $('[data-diff-note]').textContent = `(${diff >= 0 ? el.dataset.saved : el.dataset.extra})`;
  }

  form.addEventListener('input', update);
  update();
})();
