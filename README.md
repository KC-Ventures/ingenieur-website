# Ingenieur Labs

Landing page for Ingenieur Labs, a venture studio.

Plain HTML, CSS and TypeScript built with Vite, with GSAP for scroll animation.

One WebGL shader (`src/field/field.frag`) draws a silver surface with one soft
fold, lit like the silver side of a CD: green at the heart of the fold, the
disc's colours (Klein blue, aquamarine, citric, tangerine) along a spectral
ramp, and thin rainbow streaks. The pointer tilts it, and moving the pointer
quickly makes the spectrum flicker. It can be drawn smooth or through an
ordered dither, from one-bit dots up to full colour; `src/fidelity.ts` defines
those steps. `src/field/field.ts` renders it inside any 2D mask: the hero
wordmark, and the window in the "idea to company" journey (`src/journey.ts`).

`src/motion.ts` runs the scroll: the wordmark resolves from dots to full colour
on load, the statement holds while a light reads it word by word, and the
journey's steps turn like a click wheel while the window sharpens one stage at a
time, then opens to fill the screen behind the contact panel.

The logo mark and its exports are in `public/brand/`; regenerate the PNGs with
`node scripts/export-brand.mjs` after changing an SVG.

The footer shows the commit a build came from, read from Vercel's
`VERCEL_GIT_COMMIT_SHA` (`vite.config.ts`).

`DESIGN.md` is the design reference (references, tokens, motion, the field).
`AGENTS.md` has the working notes for agents.

## Develop

```sh
npm install
npm run dev
```

## Build

```sh
npm run build    # type-checks, then writes dist/
npm run preview  # serves dist/ locally
```

## Deploy

Vercel builds `main` of `github.com/KC-Ventures/ingenieur-website`; every push
to `main` redeploys production. It detects Vite automatically: build command
`npm run build`, output directory `dist`.

## Things to fill in

- Social preview image: add an `og:image` meta tag once there's artwork.
