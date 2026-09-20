// Генерирует cover.png (прозрачный фон) для каждой модели в content/models/<slug>/.
// Это заглушки-иллюстрации: любую можно заменить реальным фото с тем же именем файла.
// Запуск: node scripts/generate-images.mjs
import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Силуэты в системе координат 400x140, земля на y=118
const SHAPES = {
  sedan: { body: 'M20 96c0-10 6-16 18-19l58-12c14-16 32-28 58-30h44c30 2 52 14 70 32l54 10c10 2 16 8 16 18v8c0 6-4 10-10 10H30c-6 0-10-4-10-10z', glass: 'M112 68c10-12 24-22 44-24h40c20 2 38 12 52 26z', r: 22 },
  crossover: { body: 'M18 98c0-12 6-18 18-22l50-10c10-20 28-36 54-38h70c28 2 46 14 58 34l36 8c12 3 20 10 20 22v6c0 6-4 10-10 10H28c-6 0-10-4-10-10z', glass: 'M108 66c8-16 22-28 44-30h72c22 2 38 14 48 30z', r: 24 },
  hatch: { body: 'M24 98c0-10 6-16 18-19l40-8c10-18 26-30 52-32h70c26 0 44 12 52 26l32 8c10 2 16 8 16 18v8c0 6-4 10-10 10H34c-6 0-10-4-10-10z', glass: 'M104 70c8-14 20-24 42-26h72c18 2 30 12 38 26z', r: 21 },
  coupe: { body: 'M16 98c0-10 6-16 18-18l70-14c16-14 36-22 60-22h30c26 2 50 14 66 30l70 12c10 2 16 8 16 16v8c0 6-4 10-10 10H26c-6 0-10-4-10-10z', glass: 'M124 68c14-10 30-16 50-18h30c22 4 42 12 58 22z', r: 22 },
  wagon: { body: 'M18 98c0-10 6-16 18-19l56-12c12-14 28-24 52-26h96c20 0 34 8 44 20l48 12c10 3 18 8 18 18v8c0 6-4 10-10 10H28c-6 0-10-4-10-10z', glass: 'M106 68c8-10 22-18 40-20h100c14 2 26 8 34 22z', r: 22 },
};

const MODELS = {
  aria: ['sedan', '#3b82f6'], terra: ['crossover', '#22c55e'], nova: ['hatch', '#f97316'],
  vega: ['coupe', '#ef4444'], lyra: ['wagon', '#a855f7'], atlas: ['crossover', '#14b8a6'],
  pulse: ['hatch', '#eab308'], zenith: ['sedan', '#64748b'], comet: ['crossover', '#ec4899'],
};

const mix = (hex, to, t) => {
  const n = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [a, b] = [n(hex), n(to)];
  return '#' + a.map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, '0')).join('');
};

// Реальные левая/правая границы кузова (в координатах 400x140) — по обрезке прозрачных краёв
async function extents(body) {
  const buf = await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="560" viewBox="0 0 400 140"><path d="${body}" fill="#000"/></svg>`)).png().toBuffer();
  const { info } = await sharp(buf).trim().toBuffer({ resolveWithObject: true });
  return { left: -info.trimOffsetLeft / 4, right: (-info.trimOffsetLeft + info.width) / 4 };
}

function svg(type, color, ext) {
  const s = SHAPES[type];
  const light = mix(color, '#ffffff', 0.35);
  const dark = mix(color, '#000000', 0.45);
  const wheel = (cx) => `
    <circle cx="${cx}" cy="108" r="${s.r + 4}" fill="#05070a" opacity=".85"/>
    <circle cx="${cx}" cy="108" r="${s.r}" fill="#0d1016"/>
    <circle cx="${cx}" cy="108" r="${s.r * 0.66}" fill="url(#rim)"/>
    <circle cx="${cx}" cy="108" r="${s.r * 0.28}" fill="#1a1f29"/>
    ${[0, 72, 144, 216, 288].map((a) => `<line x1="${cx}" y1="108" x2="${cx + Math.cos((a * Math.PI) / 180) * s.r * 0.62}" y2="${108 + Math.sin((a * Math.PI) / 180) * s.r * 0.62}" stroke="#1a1f29" stroke-width="2.2"/>`).join('')}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="800" viewBox="0 0 1600 800">
  <defs>
    <linearGradient id="body" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${light}"/><stop offset=".45" stop-color="${color}"/><stop offset="1" stop-color="${dark}"/>
    </linearGradient>
    <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1c2433"/><stop offset="1" stop-color="#05070a"/>
    </linearGradient>
    <linearGradient id="rim" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#e5e9f0"/><stop offset="1" stop-color="#6b7486"/>
    </linearGradient>
    <radialGradient id="shadow"><stop offset="0" stop-color="#000" stop-opacity=".55"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
    <radialGradient id="glow"><stop offset="0" stop-color="#fff7d6"/><stop offset="1" stop-color="#fff7d6" stop-opacity="0"/></radialGradient>
  </defs>
  <ellipse cx="800" cy="628" rx="640" ry="44" fill="url(#shadow)"/>
  <g transform="translate(80 185) scale(3.6)">
    <clipPath id="clip"><path d="${s.body}"/></clipPath>
    <path d="${s.body}" fill="url(#body)"/>
    <path d="${s.glass}" fill="url(#glass)"/>
    <g clip-path="url(#clip)">
      <path d="M0 89H400" stroke="#fff" stroke-opacity=".28" stroke-width="1.2" fill="none"/>
      <path d="M0 104H400" stroke="#000" stroke-opacity=".18" stroke-width="1.6" fill="none"/>
    </g>
    <circle cx="${ext.right - 5}" cy="89" r="9" fill="url(#glow)"/>
    <rect x="${ext.right - 12}" y="86.5" width="10" height="4.5" rx="2" fill="#fffbe8"/>
    <rect x="${ext.left + 2}" y="86.5" width="8" height="4.5" rx="2" fill="#ff3b3b"/>
    ${wheel(96)}${wheel(304)}
  </g>
</svg>`;
}

// Контуры + границы кузова для SVG-конфигуратора (data/shapes.yaml)
const yaml = ['# Генерируется scripts/generate-images.mjs, не править вручную'];
for (const [type, sh] of Object.entries(SHAPES)) {
  const e = await extents(sh.body);
  yaml.push(`${type}:`, `  body: "${sh.body}"`, `  glass: "${sh.glass}"`, `  r: ${sh.r}`, `  left: ${e.left}`, `  right: ${e.right}`);
}
await writeFile(path.join(root, 'data/shapes.yaml'), yaml.join('\n') + '\n');
console.log('✓ data/shapes.yaml');

for (const [slug, [type, color]] of Object.entries(MODELS)) {
  const out = path.join(root, 'content/models', slug, 'cover.png');
  const raw = await sharp(Buffer.from(svg(type, color, await extents(SHAPES[type].body)))).png().toBuffer();
  // обрезаем пустые поля, масштабируем и центрируем на холсте 1600x600
  const car = await sharp(raw).trim().resize({ width: 1440, fit: 'inside' }).toBuffer({ resolveWithObject: true });
  const top = Math.floor((600 - car.info.height) / 2);
  const final = await sharp(car.data)
    .extend({ top, bottom: 600 - car.info.height - top, left: 80, right: 80, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 }).toBuffer();
  await writeFile(out, final);
  console.log('✓', path.relative(root, out));
}
