// Headless screenshots of the site for visual review.
//
//   npm i --no-save playwright-core
//   node scripts/shoot.mjs '{"shots":[{"name":"hero","y":0,"wait":3500}]}'
//
// Config: { url, width, height, dpr, reduced, touch, noWebgl, waitUntil, shots: [shot] }
// Shot:   { name, wait, key?: string, mouse?: [x, y], click?: selector, full?: bool, and one of:
//           y (px) | sel + offset | frac (0-1 of the page) | journey (0-1 through the pinned journey) }
// Images go to .shots/ (gitignored). Set CHROMIUM_PATH to use a specific browser binary.
import { chromium } from 'playwright-core';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const config = JSON.parse(process.argv[2]);
const outDir = join(import.meta.dirname, '..', '.shots');
mkdirSync(outDir, { recursive: true });

// playwright-core may expect a newer browser build than the one installed; fall back to a cached one.
const cached = `${process.env.LOCALAPPDATA}/ms-playwright/chromium-1234/chrome-win64/chrome.exe`;
const executablePath = process.env.CHROMIUM_PATH ?? (existsSync(cached) ? cached : undefined);

const browser = await chromium.launch({
  executablePath,
  args: config.noWebgl
    ? ['--disable-webgl', '--disable-3d-apis']
    : ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const context = await browser.newContext({
  viewport: { width: config.width ?? 1440, height: config.height ?? 900 },
  deviceScaleFactor: config.dpr ?? 1,
  reducedMotion: config.reduced ? 'reduce' : 'no-preference',
  hasTouch: !!config.touch,
  isMobile: !!config.touch,
});
const page = await context.newPage();
const logs = [];
page.on('console', (m) => (m.type() === 'error' || m.type() === 'warning') && logs.push(`${m.type()}: ${m.text()}`));
page.on('pageerror', (e) => logs.push(`pageerror: ${e.message}`));

await page.goto(config.url ?? 'http://localhost:5179/', { waitUntil: config.waitUntil ?? 'load', timeout: 90000 });
const results = [];
for (const shot of config.shots) {
  if (shot.key) await page.keyboard.press(shot.key);
  if (shot.mouse) await page.mouse.move(shot.mouse[0], shot.mouse[1], { steps: 8 });
  if (shot.click) {
    await page.click(shot.click);
    await page.waitForTimeout(shot.wait ?? 1200);
    await page.screenshot({ path: join(outDir, `${shot.name}.png`) });
    results.push(`${shot.name} clicked ${shot.click} -> @${await page.evaluate(() => Math.round(scrollY))}`);
    continue;
  }
  const y = await page.evaluate(({ y, sel, offset, frac, journey }) => {
    let target = y ?? 0;
    if (sel) target = document.querySelector(sel).getBoundingClientRect().top + scrollY + (offset ?? 0);
    if (frac != null) target = (document.documentElement.scrollHeight - innerHeight) * frac;
    if (journey != null) {
      // Matches the journey's ScrollTrigger: start 'top top+=64', end 'bottom bottom'.
      const el = document.querySelector('.journey');
      const top = el.getBoundingClientRect().top + scrollY;
      const start = top - 64;
      const end = top + el.offsetHeight - innerHeight;
      target = start + (end - start) * journey;
    }
    window.scrollTo(0, target);
    return Math.round(scrollY);
  }, shot);
  await page.waitForTimeout(shot.wait ?? 1200);
  await page.screenshot({ path: join(outDir, `${shot.name}.png`), fullPage: !!shot.full });
  results.push(`${shot.name} @${y}`);
}
console.log(JSON.stringify({ results, logs }, null, 1));
await browser.close();
