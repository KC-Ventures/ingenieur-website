# Ingenieur Labs website

Landing page for Ingenieur Labs, a venture studio ("we turn ambitious ideas into
working software, and working software into companies"). Deployed on Vercel from
`main` of `github.com/KC-Ventures/ingenieur-website`: every push to `main`
redeploys production. Commit or push only when the user asks.

## Status (2026-10-05)

The third design (v3) is live. On 2026-10-05 the field was redone: the
black-and-green field was rejected and replaced with a silver CD field (see the
hard rules). The user asked for a stronger cursor response, which became tilt
plus swing, and then settled on the most modest of three colour mixes. Preserve the
direction and iterate in small, previewed steps; do not start over unless the
user asks.

The field, interaction, phone clip bug and high-density dither bug are done and
live. A polish pass followed, also live: the statement now holds in the middle
of the screen while a light sweeps it, ending on a green "ship" (`13bd803`), and
the journey steps turn like a click wheel on a drum (`74dce7f`). Smaller polish
candidates are under "Open items" below.

### Next task: a founders section

The user wants a section introducing the founders. Nothing has been designed or
built yet, and no content has been provided. Start by asking, in one short
round:

- Who: names, roles, a line or two about each, links (GitHub, LinkedIn, X), and
  whether to show photos.
- Where it goes. The page runs hero → statement → journey (which ends in the
  contact panel) → footer, so the natural spots are between the statement and
  the journey, or after the journey before the footer. Also ask whether it gets
  a header nav link next to "Approach" and "Contact".
- How big: a compact strip or a full section with its own moment.

Already settled: frame the company as a studio, never "two friends"; black
page, green accent, Geist type, flat type; motion minimal (no bounce) and only
where it means something; no tesseract, disc or car imagery. A new `<section>`
inside `<main class="frame">` gets the hairline border and crosshairs from
`.frame > section + section` automatically. Then follow the usual loop: build
2–3 variants on a temporary key switch, screenshot, and commit only when asked.

## Working with this user

- Ask what they want changed before proposing a direction. Their requests are
  short and visual; restate what you understood (what they said vs what you
  assume) and confirm before building.
- For colour or feel decisions, build 2–3 variants they can switch live (a
  temporary key switch, e.g. 1/2/3, removed before committing) instead of
  guessing one. They judge by trying it, and they change their minds once
  motion is added, so re-check colour after any interaction change.
- Show screenshots of every change, and tell them the dev URL to try it.
- Commit and push only when asked, and ask again for each new change; one
  approval does not cover the next.
- They write in plain terms ("too much colour", "interact more"); translate to
  concrete parameter changes and say which ones you changed.

## Commands

```sh
npm install
npm run dev       # Vite on http://localhost:5173
npm run build     # tsc type-check, then vite build to dist/
```

Other worktrees often hold ports 5173, 5179 and 5183; check with
`netstat -ano | grep LISTEN`, start this one on a free port (e.g.
`npx vite --port 5187 --strictPort`), and pass `"url":"http://localhost:5187/"`
to `scripts/shoot.mjs` (it defaults to 5179). Restart the dev server after editing
`vite.config.ts` (it defines `__COMMIT__`).

Shipping: work happens on a branch in a git worktree. To release, `git fetch`,
check `git merge-base --is-ancestor origin/main HEAD`, then
`git push origin HEAD:main`. Vercel redeploys; the footer shows the build hash.

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

Where to tune the field:

| What | Where | Now |
| --- | --- | --- |
| How much silver vs fold | `crest` offset in `field.frag` | `-0.14` |
| How far the fold opens into the other colours | `reach` in `field.frag` | `0.45` |
| Rainbow fan / crest fringe strength | `streak * 0.35`, `fringe * 0.3` | |
| Flare and hue roll while moving | `flare` (`* 1.2`), `roll` (`* 0.6`) | |
| How far each tilt effect travels | `tilt.*` multipliers in `surface()` | |
| Tilt weight and swing decay | `0.09` and `0.15` in `main.ts` `draw` | |
| Fold size | wordmark `width / 2.6`; journey `mix(side * 0.6, max(w, h) * 0.5, open)` in `main.ts` | |

`src/fidelity.ts` defines the four stages shared by the hero intro and journey:
1-bit 14px, 8 colours 8px, 27 colours 3px, and smooth native colour.

`src/wordmark.ts` creates the edge-to-edge `ingenieur` hero word as a Geist 700
text mask. `main.ts` scales the field to the word's width (`width / 2.6`) so one
fold crosses the whole word.

`src/journey.ts` creates the pinned "From idea to company" scene. The full-bleed
field is clipped to the square window; `showStep` swaps the copy, progress bar,
and resolution readout. `motion.ts` re-measures the clip on every step change,
because the readout's text can move the window.

`src/motion.ts` owns the GSAP behavior: hero dither resolve, statement hold,
journey ScrollTrigger, window opening, and contact panel reveal. The statement
pins in the middle of the screen (`HOLD` screens of scroll) while a light
sweeps it word by word, ending on a green "ship". It holds on the way down
only: once the reader is past it and scrolling pauses (or turns back up), the
pin is reverted and the scroll position compensated so nothing moves; it is
re-armed out of sight once the paragraph is below the screen again. "Contact"
releases it before jumping. The
journey includes a visible "Scroll to develop" cue. Its steps sit on a drum
that rolls vertically like a slot machine reel and turns like a click wheel:
within a step it leans only `LEAN` of the way toward the next, then at the
threshold it clicks over in one eased turn (no overshoot; the user wants it
minimal). `DRUM_ANGLE` sets the curve (gentle, 16°). Steps fade as they roll
away, so at rest only the current one shows, with no visible reel. Reduced
motion removes tweens while preserving the states.

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
  light on a CD. No black inside the gradient. Green and silver lead; the user
  chose the modest mix (`reach = 0.45`, faint fan and fringe in the shader). They
  first picked a more colourful one, but with the swing flare it was too much.
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
  click-wheel step drum, and window opening are intentional state changes, not
  generic section fades. Keep motion minimal: no bounce or overshoot.
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
- The hero has empty space between intro and word on tall screens.
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
noWebgl, `dpr`, and per-shot `y`, `sel+offset`, `frac`, `journey` (0–1), `mouse`,
`key`, and `click`. Check desktop 1440×900, phone 390×844, reduced motion,
no-WebGL, and a `"dpr":2` shot (the user's screen is high-density; a 1× check
missed a bug that only showed there).
To check the tilt, shoot the same spot with the mouse in opposite corners; a
shot with `"wait": 90` right after a long mouse move catches the swing flare.
To see a fast GSAP tween frame by frame, slow the page's own GSAP from a
Playwright script: find its URL with `performance.getEntriesByType('resource')`
(the Vite dep `/deps/gsap.js?v=…`; another URL loads a second copy), `import()`
it, and call `gsap.globalTimeline.timeScale(0.1)`.

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
- A dither cell of 1 CSS px means smooth. Do not scale it by the pixel ratio
  (`field.ts`), or high-density screens never leave the dither path.
- Anything that changes the journey window's position needs the clip
  re-measured (`journey.measure()` then `applyOpen()` in `motion.ts`).
- The statement's hold adds about a screen of scroll until it is released. A
  script that jumps past it sees the page get shorter at the next scroll pause,
  so recompute positions per shot (as `shoot.mjs` does) rather than reusing a
  scroll number. A new section above the journey shifts these positions too;
  the hold and the journey re-measure on `ScrollTrigger.refresh()`.
- The user has declined shell file deletions before; ask first. A leftover
  diagnostic, `.shots/clipcheck.mjs`, is harmless (`.shots/` is gitignored).
