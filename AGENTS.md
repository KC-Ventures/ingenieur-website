# Ingenieur Labs website

Landing page for Ingenieur Labs, a venture studio ("we turn ambitious ideas into
working software, and working software into companies"). Deployed on Vercel from
`main` of `github.com/KC-Ventures/ingenieur-website`: every push to `main`
redeploys production. Commit or push only when the user asks.

## Status (2026-10-05)

The third design (v3) is live. On 2026-10-05 the field was redone: the
black-and-green field was rejected and replaced with a silver CD field (see the
hard rules). The user picked the "balanced" colour mix out of three and asked
for a stronger cursor response, which became tilt plus swing. Preserve the
direction and iterate in small, previewed steps; do not start over unless the
user asks.

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

`src/field/field.frag` and `src/field/field.ts` implement the WebGL field: a
silver surface with one soft fold leaning up to the right. Green sits at the
heart of the fold and opens with depth into the CD colours along a spectral
ramp (Klein blue, aquamarine, green, citric, tangerine). A rainbow fan (from a
hub far off the surface, so no centre is visible) crosses it, and a thin
rainbow fringe rides the crest. `uTilt` (pointer position) bends and lifts the
crest, slides the colours, and moves the sheen, fan and fringe toward the
pointer. `uSwing` (how fast the pointer moves) rolls the hues and makes the
streaks flare, then settles. It renders smoothly or through an ordered Bayer
dither, inside any 2D mask: 1-bit draws silver dots on black, up to 8 colours
dither between the two nearest brand colours, and more quantise each channel.

`src/fidelity.ts` defines the four stages shared by the hero intro and journey:
1-bit 14px, 8 colours 8px, 27 colours 3px, and smooth native colour.

`src/wordmark.ts` creates the edge-to-edge `ingenieur` hero word as a Geist 700
text mask. `main.ts` scales the field to the word's width (`width / 2.6`) so one
fold crosses the whole word.

`src/journey.ts` creates the pinned "From idea to company" scene. The full-bleed
field is clipped to the square window; `showStep` swaps the copy, progress bar,
and resolution readout. `motion.ts` re-measures the clip on every step change,
because the readout's text can move the window.

`src/motion.ts` owns the GSAP behavior: hero dither resolve, statement phrase
reveal, journey ScrollTrigger, window opening, and contact panel reveal. The
journey includes a visible "Scroll to develop" cue. Its active step stays
legible while the previous and next step titles rotate in as smaller, dimmer
orientation hints; adjacent descriptions stay hidden to protect the active
copy. Reduced motion removes tweens while preserving the states.

`src/main.ts` loads fonts, creates the fields, turns the pointer into tilt
(position across the viewport, eased) and swing (how far the tilt trails the
pointer), runs the on-demand render loop while a field is visible, and writes
the commit hash in the footer. Without a mouse (touch, or before the first
move) the disc turns slowly on its own and scrolling tips it. Reduced motion
keeps one fixed tilt.

`src/style.css` contains the tokens and responsive layout. The pinned scene only
applies under `.js`; `.no-webgl` uses a still silver/green/spectrum CSS gradient
(`--cd`), also clipped to the fallback wordmark text. The journey step viewport
uses a stable viewport-based width on desktop and a compact mobile layout so
active headings do not clip. The viewer is exactly as wide as the window; the
readout wraps (and is always stacked on phones) instead of widening it.

`vite.config.ts` defines `__COMMIT__` from `VERCEL_GIT_COMMIT_SHA`.

`src/foil/` and `src/disc.ts` are unused leftovers from v2 and are excluded in
`tsconfig.json`. Delete them, and remove the exclude, only with the user's OK.

## The user's direction (hard rules)

- Use pure black `#000` as the page base and electric green `#00ff88` for the
  main UI accent.
- The field (wordmark and journey window) is a silver/white surface with one
  soft fold, shaped like the user's mesh-gradient reference (a bright ribbon
  arching over a rounded fold with one crisp crest). Colour it with green plus
  the CD's colours: Klein blue `#4100F5`, aquamarine `#9BF0E1`, green `#00FF88`,
  citric `#CDF564`, tangerine `#FF4632`, and thin rainbow diffraction streaks like
  light on a CD. No black inside the gradient. Green leads; the "balanced" mix
  (`reach = 0.72` in the shader) is the one the user chose.
- Move along the spectral ramp instead of mixing across it: RGB-blending green
  into tangerine goes brown/olive, which reads as murky.
- Cursor interaction is "tilt the disc": pointer position tilts the surface and
  pointer speed makes the spectrum flicker. Every effect moves toward the
  pointer. Do not recreate a visible spiral, radial hub, or cursor-centred swirl.
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
next, and the spiral center felt distracting.

**v3 black-and-green field:** A restrained black/forest/moss/sage light field
whose bands tilted with the pointer. Rejected: the user still didn't like the
black-and-green look ("scratch black"), and the cursor interaction felt weird.
Replaced with the silver CD field.

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
noWebgl, and per-shot `y`, `sel+offset`, `frac`, `journey` (0–1), `mouse`, `key`,
and `click`. Check desktop 1440×900, phone 390×844, reduced motion, and no-WebGL.
To check the tilt, shoot the same spot with the mouse in opposite corners; a
shot with `"wait": 90` right after a long mouse move catches the swing flare.

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
