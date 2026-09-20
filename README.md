# VELORA — сайт вымышленного электро-бренда на Hugo

Многостраничный сайт автобренда (главная, модельный ряд, страницы моделей, новости).
Бренд и данные вымышленные.

**Демо:** https://ruhaold.github.io/hugo-landing/

## Запуск

Нужен Hugo **extended** (в проекте он лежит в `bin/`, в git не попадает) и Node.js для Dart Sass.

```bash
npm install      # ставит sass-embedded
npm run dev      # http://localhost:1313, live reload
npm run build    # production-сборка в public/ + индекс поиска Pagefind
npm run preview  # сборка + индекс + локальный сервер, чтобы проверить поиск
```

Если Hugo и Dart Sass установлены глобально (`brew install hugo sass/sass/sass`), можно просто `hugo server`.

## Что демонстрирует проект

| Возможность Hugo | Где смотреть |
|---|---|
| Базовый шаблон и блоки (`baseof`, `define "main"`) | `layouts/baseof.html`, `layouts/home.html` |
| Партиалы, передача контекста через `dict` | `layouts/_partials/` (`car.html`, `model-card.html`) |
| Шаблоны по секциям (`models`, `news`) | `layouts/models/`, `layouts/news/` |
| Front matter как источник данных модели | `content/models/*.md` |
| Шорткоды | `layouts/_shortcodes/callout.html` |
| Таксономии (тип кузова) | `hugo.toml`, `layouts/taxonomy.html`, `layouts/term.html` |
| Меню из конфига, `aria-current` | `hugo.toml`, `layouts/_partials/header.html` |
| Hugo Pipes: SCSS, минификация, fingerprint + SRI | `layouts/_partials/head.html`, `assets/` |
| Окружения (`hugo.IsProduction`) | `head.html` |
| Многоязычность: `languages`, перевод по суффиксу файла (`aria.en.md`) | `hugo.toml`, `content/` |
| Строки интерфейса через `i18n` | `i18n/ru.yaml`, `i18n/en.yaml` |
| Data-файлы по языкам (`index hugo.Data.tech site.Language.Lang`) | `data/tech/`, `data/stats/` |
| Переключатель языка, `hreflang`, локальные даты и цены | `layouts/_partials/lang-switcher.html`, `head.html`, `price.html` |
| Page bundles: модель = папка с `index.md` + `cover.png` | `content/models/<slug>/` |
| Image Processing: WebP, `srcset`, размеры, fallback PNG | `layouts/_partials/picture.html` |
| Светлая/тёмная тема на CSS custom properties, без мигания | `assets/scss/_themes.scss`, `assets/js/theme-init.js` |
| Каталог: фильтры, сортировка, пагинация, состояние в URL | `layouts/models/section.html`, `assets/js/catalog.js` |
| Конфигуратор: данные в YAML, SVG перекрашивается через `--paint`, состояние в URL | `layouts/_partials/configurator.html`, `car-config.html`, `assets/js/configurator.js`, `data/configurator/` |
| `.Related` и `[related]` в конфиге: похожие модели | `layouts/_partials/related-models.html`, `hugo.toml` |
| Хлебные крошки + `BreadcrumbList`, partial с `return` | `layouts/_partials/breadcrumbs.html`, `func/crumbs.html` |
| Микроразметка JSON-LD (Organization, WebSite, Product+Car) | `layouts/_partials/schema.html` |
| Сравнение моделей: таблица целиком в Hugo, JS скрывает колонки и подсвечивает лучшее | `layouts/compare/section.html`, `assets/js/compare.js` |
| Калькулятор: диапазоны из `params.calc` по языкам | `layouts/_partials/calculator.html`, `assets/js/calculator.js` |
| Поиск на Pagefind (индекс после сборки, оба языка) | `layouts/_partials/search.html`, `assets/js/search.js` |
| Анимации: IntersectionObserver, счётчики, параллакс, `prefers-reduced-motion` | `assets/js/motion.js`, `assets/scss/_motion.scss` |
| SEO: title, description, canonical, Open Graph | `head.html` |

## Изображения

`cover.png` у моделей — иллюстрации-заглушки с прозрачным фоном, их создаёт `node scripts/generate-images.mjs`.
Чтобы использовать настоящие фото, положите свой файл `cover.jpg|png|webp` в папку модели, а старый `cover.png` удалите:
Hugo сам сделает WebP нужных размеров.

## Каталог

Фильтры, сортировка и пагинация работают на клиенте (сайт статический), состояние хранится в URL:
`/models/?body=кроссовер&drive=awd&sort=price-asc&page=2`. Без JavaScript показываются все модели.

## Конфигуратор

На странице каждой модели: цвет кузова, диски и пакеты опций. Цена и запас хода пересчитываются сразу,
автомобиль рисуется inline-SVG по контурам из `data/shapes.yaml` (цвет через CSS-переменную `--paint`).
Комплектация хранится в URL (`?color=red&wheels=w21&pkg=assist,roof`), а кнопка передаёт модель и выбор в форму тест-драйва.
Цвета, диски и опции редактируются в `data/configurator/ru.yaml` и `en.yaml`.

## Вёрстка

- Mobile-first, брейкпоинты через SCSS-миксин `up()`
- Дизайн-токены в `assets/scss/_variables.scss`
- Семантическая разметка, skip-link, `aria-expanded` у меню, `:focus-visible`
- Цвет модели передаётся через CSS-переменную `--accent` из front matter

## Идеи для развития

- Заменить сгенерированные `cover.png` реальными фотографиями (имя файла то же, шаблоны менять не нужно)
- Деплой на GitHub Pages / Netlify

## Как добавить язык

1. Блок `[languages.xx]` с меню в `hugo.toml`
2. `i18n/xx.yaml`, `data/tech/xx.yaml`, `data/stats/xx.yaml`
3. Файлы `*.xx.md` рядом с русскими в `content/`

## Качество

Lighthouse 12.8 на живом сайте, мобильный профиль (главная, каталог, страница модели, сравнение, новости, английская версия):

| Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|
| 98–100 | 100 | 100 | 100 |

LCP 0,8–1,2 с, TBT 0 мс, CLS ≤ 0,05. Единственное замечание, которое Lighthouse оставляет, — срок кэширования 10 минут:
его задаёт сам GitHub Pages, на бесплатном хостинге он не настраивается.

## Деплой

Сайт публикуется на GitHub Pages через GitHub Actions ([deploy.yml](.github/workflows/deploy.yml)) при каждом push в `main`:
установка зависимостей, сборка Hugo с нужным `baseURL`, индекс поиска Pagefind, публикация.
Сайт живёт в подпапке `/hugo-landing/`, поэтому все ссылки строятся через `RelPermalink` / `GetPage`, а не через жёсткие пути.
В настройках репозитория: **Settings → Pages → Source: GitHub Actions**.
