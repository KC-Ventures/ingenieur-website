// PNG versions of the brand SVGs in public/, for use outside the site.
//
//   npm i --no-save playwright-core
//   node scripts/export-brand.mjs
//
// Every PNG is square, with the mark centred at FILL of the side so it also works as an
// avatar (GitHub org picture). The marks go to public/brand/png/ at a few sizes with
// transparent backgrounds, plus avatar-*.png on black, since a transparent white mark
// vanishes on a light page. The favicon tile also becomes public/apple-touch-icon.png:
// iOS ignores SVG icons and rounds the corners itself, so that one is a full black square.
import { chromium } from 'playwright-core';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const pub = join(import.meta.dirname, '..', 'public');
const outDir = join(pub, 'brand', 'png');
mkdirSync(outDir, { recursive: true });

// playwright-core may expect a newer browser build than the one installed; fall back to a cached one.
const cached = `${process.env.LOCALAPPDATA}/ms-playwright/chromium-1234/chrome-win64/chrome.exe`;
const executablePath = process.env.CHROMIUM_PATH ?? (existsSync(cached) ? cached : undefined);
const browser = await chromium.launch({ executablePath });
const page = await browser.newPage();

const FILL = 0.7;

async function exportSvg(src, out, size, { background = 'transparent', fill = FILL } = {}) {
  const svg = readFileSync(join(pub, src), 'utf8');
  const [, , w, h] = svg.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number);
  const scale = (size * fill) / Math.max(w, h);
  await page.setViewportSize({ width: size, height: size });
  const data = Buffer.from(svg).toString('base64');
  await page.setContent(
    `<body style="margin:0;height:100vh;display:grid;place-items:center;background:${background}">` +
      `<img src="data:image/svg+xml;base64,${data}" style="width:${w * scale}px;height:${h * scale}px">`,
  );
  await page.locator('img').evaluate((img) => img.decode());
  await page.screenshot({ path: out, omitBackground: background === 'transparent' });
  console.log(`${out.slice(pub.length + 1)} ${size}x${size}`);
}

for (const colour of ['white', 'green', 'refracted']) {
  for (const size of [512, 1024, 2048]) {
    await exportSvg(`brand/mark-${colour}.svg`, join(outDir, `mark-${colour}-${size}.png`), size);
  }
  await exportSvg(`brand/mark-${colour}.svg`, join(outDir, `avatar-${colour}-1024.png`), 1024, { background: '#000' });
}
await exportSvg('favicon.svg', join(outDir, 'favicon-512.png'), 512, { fill: 1 });
await exportSvg('favicon.svg', join(pub, 'apple-touch-icon.png'), 180, { background: '#000', fill: 1 });

await browser.close();
