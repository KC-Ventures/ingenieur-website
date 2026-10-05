# Ingenieur Labs website

Landing page for Ingenieur Labs, a venture studio ("we turn ambitious ideas into
working software, and working software into companies"). Deployed on Vercel from
`main` of github.com/KC-Ventures/ingenieur-website: **every push to main
redeploys production.** Commit or push only when the user asks.

## Status (2026-10-05)

Third design (v3) is live. The user said it is "90% there" but did not say what
the last 10% is. **Ask them what is missing before changing direction; do not
start over.** Iterate in small, previewed steps.

## Commands

```sh
npm install
npm run dev       # Vite on http://localhost:5173 (earlier sessions used --port 5179)
npm run build     # tsc type-check, then vite build to dist/
```

Restart the dev server after editing `vite.config.ts` (it defines `__COMMIT__`).

## How the page works

Plain HTML/CSS/TypeScript, Vite, GSAP (ScrollTrigger + SplitText, free since 3.13).

- `index.html`: all content. Sections: header, hero, statement, journey (pinned),
  footer. The contact panel lives inside the journey (`#contact`).
- `src/field/field.frag` + `field.ts`: the one WebGL shader. A vivid conic
  gradient that turns around a focus point (the cursor), drawn smooth or through
  an ordered Bayer dither in palette space, inside any 2D mask.
- `src/fidelity.ts`: the four resolution stages (1-bit 14px, 6 colours 8px,
  24 colours 3px, smooth) shared by the hero intro and the journey.
- `src/wordmark.ts`: hero word "ingenieur" (Geist 700, -0.05em) as a text mask,
  edge to edge; dark band of the palette swapped for deep blue so letters stay legible.
- `src/journey.ts`: the pinned "From idea to company" scene. A full-bleed field is
  clipped (`clip-path: inset`) to the square window; `showStep` swaps copy,
  progress bar and the resolution readout.
- `src/motion.ts`: all GSAP. Hero intro (dither resolve), statement phrase
  reveal, journey ScrollTrigger (steps at 15% each, window opens 64–82%, contact
  panel at 80%), Contact link scrolls to the panel. Reduced motion: no tweens.
- `src/main.ts`: font loading, creates the fields, pointer tracking, on-demand
  render loop (only while a field is visible), commit hash in the footer.
- `src/style.css`: tokens at the top. Base styles are a plain flowing layout; the
  pinned scene only applies under `.js`. `.no-webgl` falls back to CSS gradients.
- `vite.config.ts`: `__COMMIT__` from `VERCEL_GIT_COMMIT_SHA`.
- `src/foil/` and `src/disc.ts`: **unused leftovers from v2**, excluded in
  `tsconfig.json`. Delete them (with the user's OK) and remove the exclude.

## The user's direction (hard rules)

- Pure black `#000` everywhere and vibrant green `#00ff88`. No murky dark-green
  glows, no full-page ambient shader.
- The CD gradient palette (from their reference): Klein blue `#4100F5`,
  aquamarine `#9BF0E1`, green `#00FF88`, citric `#CDF564`, tangerine `#FF4632`,
  black. Use it on "some parts", not everywhere.
- The gradient must follow the cursor (the cursor is the centre of the swirl).
- Flat type: no 3D, bevel or chrome on the wordmark.
- Don't depict a literal CD/disc, a car, or a tesseract. The logo concept is a
  tesseract ("make things beyond us concrete"), but it must not appear on the site.
- "Feels like a Ferrari, not a car": sleek, intentional, minimal-maximal.
  Vercel is the inspiration, pushed further. Strong typography (Geist / Geist Mono).
- Scroll animations must be intentional (each one carries meaning), not generic fades.
- Framing: a studio. Don't describe it as "two friends".
- Contact: ingenieur.labs@gmail.com, GitHub org KC-Ventures.
- References they like: distrategy.plastic.design, plastic.design, vercel.com/ship.

## What was tried and rejected

- v1: deep-green lacquer shader with studio light reflections across the whole
  page, Archivo expanded type. Rejected: murky greens, shader everywhere, weird motion.
- v2: Vercel-style layout, dark-chrome CD diffraction shader on a 3D-bevelled
  wordmark, a black CD disc at the end, small sphere progression for the process.
  Rejected: 3D text, gradient not vibrant enough, the disc felt random, light
  moved away from the cursor, scroll animations generic, no "wow".

## Open items worth raising with the user

- No `og:image` social preview yet.
- The journey is long (620vh); tune `.js .journey { height }` and the constants
  at the top of `motion.ts` if it drags.
- The statement section is plain; the hero has empty space between intro and word
  on tall screens.
- No projects/portfolio section (no content provided).
- Real low-end mobile performance is untested (two canvases animate while visible).

## Previewing and verifying

Take screenshots before showing the user anything; they asked for iteration.

```sh
npm i --no-save playwright-core
node scripts/shoot.mjs '{"shots":[{"name":"hero","y":0,"wait":3500,"mouse":[700,560]},{"name":"j2","journey":0.35,"wait":1600}]}'
```

Images land in `.shots/`. Options: `width/height`, `touch`, `reduced`,
`noWebgl`, and per shot `y`, `sel`+`offset`, `frac`, `journey` (0–1), `mouse`, `click`.
Check desktop 1440×900, phone 390×844, reduced motion and no-WebGL.

## Gotchas already hit

- The Playwright MCP browser here came up with a forced 0.8 pixel ratio and
  throttled `requestAnimationFrame`; use `scripts/shoot.mjs` (headless, SwiftShader).
- Stopping a background `npx vite` leaves `node.exe` holding the port: find it with
  `netstat -ano` and stop it with `taskkill //PID <pid> //F`.
- GSAP `overwrite: true` on the shared `scene` object kills the hero intro tween;
  use `overwrite: 'auto'`.
- Don't centre GSAP-animated elements with the CSS `translate` property; GSAP
  absorbs it into its transform. Use `inset: 0; margin: auto`.
- `background-clip: text` only paints inside the box; pad for descenders.
- The user has declined shell file deletions before; ask first.
