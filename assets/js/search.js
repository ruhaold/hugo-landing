// Поиск по сайту на Pagefind. Индекс появляется после сборки (npm run build / preview),
// в режиме hugo server его нет, поэтому библиотека грузится лениво и с понятным сообщением при ошибке.
(() => {
  const dialog = document.querySelector('[data-search]');
  if (!dialog) return;

  const input = dialog.querySelector('[data-search-input]');
  const status = dialog.querySelector('[data-search-status]');
  const list = dialog.querySelector('[data-search-results]');
  const opener = document.querySelector('[data-search-open]');
  let pagefind = null;
  let loading = null;

  // загрузка одна на все вызовы: запрос, введённый до её конца, дожидается результата
  function load() {
    loading ??= (async () => {
      try {
        pagefind = await import(dialog.dataset.pagefind);
        await pagefind.init();
      } catch (e) {
        status.textContent = dialog.dataset.unavailable;
      }
    })();
    return loading;
  }

  function open() {
    if (!dialog.open) dialog.showModal();
    input.focus();
    input.select();
    load();
  }

  async function run(query) {
    list.replaceChildren();
    if (!query.trim()) {
      status.textContent = dialog.dataset.hint;
      return;
    }
    await load();
    if (!pagefind) return;

    const search = await pagefind.debouncedSearch(query.trim(), {}, 150);
    if (!search) return; // пришёл более новый запрос

    const items = await Promise.all(search.results.slice(0, 8).map((r) => r.data()));
    status.textContent = items.length
      ? dialog.dataset.found.replace('{n}', search.results.length)
      : dialog.dataset.empty;

    for (const item of items) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = item.url;
      const title = document.createElement('strong');
      title.textContent = item.meta?.title || item.url;
      const excerpt = document.createElement('span');
      excerpt.className = 'muted';
      excerpt.innerHTML = item.excerpt; // Pagefind экранирует всё, кроме <mark>
      a.append(title, excerpt);
      li.append(a);
      list.append(li);
    }
  }

  opener?.addEventListener('click', open);
  input.addEventListener('input', () => run(input.value));

  // «/» и Ctrl/⌘+K открывают поиск, если фокус не в поле ввода
  document.addEventListener('keydown', (e) => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName);
    if ((e.key === '/' && !typing) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) {
      e.preventDefault();
      open();
    }
  });

  // клик по подложке закрывает окно
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });
})();
