# Ingenieur Labs website

Landing page for Ingenieur Labs, a venture studio ("we turn ambitious ideas into
working software, and working software into companies"). Deployed on Vercel from
`main` of `github.com/KC-Ventures/ingenieur-website`: every push to `main`
redeploys production. Commit or push only when the user asks.

## Status (2026-10-05)

The third design (v3) is live. The latest iteration was approved by the user as
"looks good" after refining the gradient and the journey interaction. Preserve
the direction and iterate in small, previewed steps; do not start over unless
the user asks.

## Commands

```sh
npm install
npm run dev       # Vite on http://localhost:5173 (earlier sessions used --port 5179)
npm run build     # tsc type-check, then vite build to dist/
```

Restart the dev server after editing `vite.config.ts` (it defines `__COMMIT__`).

## How the page works

Plain HTML/CSS/TypeScript, Vite, and GSAP (`ScrollTrigger` + `SplitText`, free
since 3.13).

`index.html` contains all content: header, hero, statement, pinned journey, and
footer. The contact panel lives inside the journey at `#contact`.

`src/field/field.frag` and `src/field/field.ts` implement the WebGL field. The
shader is a restrained black-and-green light field: pointer movement changes its
angle and flow across the surface, without a visible cursor-centered spiral or
hub. It renders smoothly or through an ordered Bayer dither in four fidelity
stages, inside any 2D mask.

`src/fidelity.ts` defines the four stages shared by the hero intro and journey:
1-bit 14px, 6 colours 8px, 24 colours 3px, and smooth native colour.

`src/wordmark.ts` creates the edge-to-edge `ingenieur` hero word as a Geist 700
text mask. Its dark band stays within the restrained green system so the letters
remain legible.

`src/journey.ts` creates the pinned "From idea to company" scene. The full-bleed
field is clipped to the square window; `showStep` swaps the copy, progress bar,
and resolution readout.

`src/motion.ts` owns the GSAP behavior: hero dither resolve, statement phrase
reveal, journey ScrollTrigger, window opening, and contact panel reveal. The
journey includes a visible "Scroll to develop" cue. Its active step stays
legible while the previous and next step titles rotate in as smaller, dimmer
orientation hints; adjacent descriptions stay hidden to protect the active
copy. Reduced motion removes tweens while preserving the states.

`src/main.ts` loads fonts, creates the fields, tracks the pointer, runs the
on-demand render loop while a field is visible, and writes the commit hash in
the footer.

`src/style.css` contains the tokens and responsive layout. The pinned scene only
applies under `.js`; `.no-webgl` uses a quiet CSS fallback gradient. The journey
step viewport uses a stable viewport-based width on desktop and a compact mobile
layout so active headings do not clip.

`vite.config.ts` defines `__COMMIT__` from `VERCEL_GIT_COMMIT_SHA`.

`src/foil/` and `src/disc.ts` are unused leftovers from v2 and are excluded in
`tsconfig.json`. Delete them, and remove the exclude, only with the user's OK.

## The user's direction (hard rules)

- Use pure black `#000` as the base and electric green `#00ff88` for the main UI
  accent.
- Keep the gradient inside a restrained black/forest/moss/sage green range. It
  must feel atmospheric and intentional rather than pale, neon, or overly
  saturated.
- The gradient responds to the cursor through broad changes in angle and flow;
  do not recreate a visible spiral, radial hub, or cursor-centered swirl.
- Keep type flat: no 3D, bevel, chrome, or literal CD/disc treatment on the
  wordmark.
- Do not depict a literal CD/disc, a car, or a tesseract. The logo concept is a
  tesseract ("make things beyond us concrete"), but it must not appear on the
  site.
- Keep the feeling sleek, intentional, and minimal-maximal: Ferrari energy
  without showing a car. Vercel is the inspiration, pushed further. Strong
  typography uses Geist / Geist Mono.
- Scroll animations must carry meaning. The journey's resolution progression,
  rotating step previews, and window opening are intentional state changes, not
  generic section fades.
- Frame the company as a studio. Do not describe it as "two friends."
- Contact: `ingenieur.labs@gmail.com`, GitHub organization `KC-Ventures`.
- References they like: `distrategy.plastic.design`, `plastic.design`, and
  `vercel.com/ship`.

## What was tried and rejected

**v1:** Deep-green lacquer shader with studio-light reflections across the whole
page and Archivo Expanded type. Rejected: murky greens, shader everywhere, and
weird motion.

**v2:** Vercel-style layout, dark-chrome CD diffraction shader on a 3D-bevelled
wordmark, a black CD disc at the end, and small sphere progression for the
process. Rejected: 3D text, gradient not vibrant enough, random disc, light
moving away from the cursor, generic scroll animation, and no "wow".

**Early v3 field:** A highly saturated conic gradient with a visible spiral
center following the cursor. Rejected: too pale in one pass, too vibrant in the
next, and the spiral center felt distracting. Replaced with the current broad
green light field.

## Open items worth raising with the user

- No `og:image` social preview yet.
- The journey is long (`620vh`); tune `.js .journey { height }` and the constants
  at the top of `src/motion.ts` if it drags.
- The statement section is plain; the hero has empty space between intro and
  word on tall screens.
- No projects/portfolio section (no content provided).
- Real low-end mobile performance is untested (two canvases animate while
  visible).

## Previewing and verifying

Take screenshots before showing the user anything; they asked for iteration.

```sh
npm i --no-save playwright-core
node scripts/shoot.mjs '{"shots":[{"name":"hero","y":0,"wait":3500,"mouse":[700,560]},{"name":"j2","journey":0.35,"wait":1600}]}'
```

Images land in `.shots/`. Options include width/height, touch, reduced,
noWebgl, and per-shot `y`, `sel+offset`, `frac`, `journey` (0–1), `mouse`, and
`click`. Check desktop 1440×900, phone 390×844, reduced motion, and no-WebGL.

## Gotchas already hit

- The Playwright MCP browser came up with a forced 0.8 pixel ratio and throttled
  `requestAnimationFrame`; use `scripts/shoot.mjs` (headless, SwiftShader).
- Stopping a background `npx vite` leaves `node.exe` holding the port: find it
  with `netstat -ano` and stop it with `taskkill //PID <pid> //F`.
- GSAP `overwrite: true` on the shared scene object kills the hero intro tween;
  use `overwrite: 'auto'`.
- Do not center GSAP-animated elements with CSS `translate`; GSAP absorbs it
  into its transform. Use `inset: 0; margin: auto`.
- `background-clip: text` only paints inside the box; pad for descenders.
- The user has declined shell file deletions before; ask first.
