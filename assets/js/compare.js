// Сравнение моделей: скрывает лишние колонки, подсвечивает лучшее значение в строке.
// Выбор хранится в URL (?m=aria,terra), без JS таблица показывает все модели.
(() => {
  const el = document.querySelector('[data-compare]');
  if (!el) return;

  const table = el.querySelector('[data-table]');
  const picker = el.querySelector('[data-picker]');
  const hint = el.querySelector('[data-hint]');
  const boxes = [...picker.querySelectorAll('input[name="m"]')];
  const min = Number(el.dataset.min);
  const max = Number(el.dataset.max);
  const bestLabel = el.dataset.bestLabel;

  // выбор из URL, иначе первые три модели каталога
  const fromUrl = (new URLSearchParams(location.search).get('m') || '').split(',').filter(Boolean);
  const known = new Set(boxes.map((b) => b.value));
  let selected = fromUrl.filter((v) => known.has(v)).slice(0, max);
  if (selected.length < min) selected = [...new Set([...selected, ...boxes.map((b) => b.value)])].slice(0, 3);

  function render() {
    boxes.forEach((b) => {
      b.checked = selected.includes(b.value);
      // при максимуме нельзя добавить ещё, при минимуме нельзя убрать
      b.disabled = (!b.checked && selected.length >= max) || (b.checked && selected.length <= min);
    });
    hint.textContent = selected.length >= max ? el.dataset.hintMax : selected.length <= min ? el.dataset.hintMin : '';

    table.querySelectorAll('[data-model]').forEach((cell) => {
      cell.hidden = !selected.includes(cell.dataset.model);
    });

    table.querySelectorAll('tbody tr[data-best]').forEach((row) => {
      row.querySelectorAll('.is-best').forEach((c) => {
        c.classList.remove('is-best');
        c.querySelector('.sr-only')?.remove();
      });
      const mode = row.dataset.best;
      if (!mode) return;
      const cells = [...row.querySelectorAll('td:not([hidden])')];
      const values = cells.map((c) => Number(c.dataset.value));
      const target = mode === 'min' ? Math.min(...values) : Math.max(...values);
      if (values.every((v) => v === target)) return; // все равны — подсвечивать нечего
      cells.forEach((c, i) => {
        if (values[i] !== target) return;
        c.classList.add('is-best');
        const note = document.createElement('span');
        note.className = 'sr-only';
        note.textContent = ` (${bestLabel})`;
        c.append(note);
      });
    });

    const qs = selected.length ? `?m=${selected.join(',')}` : '';
    history.replaceState(null, '', location.pathname + qs);
  }

  picker.addEventListener('change', (e) => {
    const { value, checked } = e.target;
    selected = checked ? [...selected, value] : selected.filter((v) => v !== value);
    render();
  });

  render();
})();
