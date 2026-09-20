const root = document.documentElement;

// --- мобильное меню
const toggle = document.querySelector('.nav-toggle');
const nav = document.getElementById('nav');

toggle?.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!open));
  nav.classList.toggle('is-open', !open);
});

// --- переключатель темы: явный выбор сохраняем, иначе следуем системной теме
const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
const currentTheme = () => root.dataset.theme || (systemDark.matches ? 'dark' : 'light');

document.querySelector('[data-theme-toggle]')?.addEventListener('click', () => {
  const next = currentTheme() === 'dark' ? 'light' : 'dark';
  root.dataset.theme = next;
  try { localStorage.setItem('theme', next); } catch (e) {}
});

// --- форма тест-драйва: модель и комплектация приходят из конфигуратора (?model=..&config=..)
const driveForm = document.querySelector('#test-drive .form');
if (driveForm) {
  const params = new URLSearchParams(location.search);
  const model = params.get('model');
  const config = params.get('config');
  if (model && [...driveForm.model.options].some((o) => o.value === model)) driveForm.model.value = model;
  if (config) {
    driveForm.config.value = config;
    const note = driveForm.querySelector('[data-config-note]');
    note.querySelector('span').textContent = config;
    note.hidden = false;
  }
}
