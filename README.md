# Ingenieur Labs

Landing page for Ingenieur Labs, a venture studio.

Plain HTML, CSS and TypeScript built with Vite, with GSAP for scroll animation.

One WebGL shader (`src/field/field.frag`) draws a vivid conic gradient that
turns around the pointer, like the colours on a CD around its centre. It can be
drawn smooth or through an ordered dither, from one-bit dots up to full colour;
`src/fidelity.ts` defines those steps. `src/field/field.ts` renders it inside any
2D mask: the hero wordmark, and the window in the "idea to company" journey
(`src/journey.ts`), which sharpens one step at a time as you scroll and then
opens up to fill the screen behind the contact panel (`src/motion.ts`).

The footer shows the commit a build came from, read from Vercel's
`VERCEL_GIT_COMMIT_SHA` (`vite.config.ts`).

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

Import the repo in Vercel. It detects Vite automatically: build command
`npm run build`, output directory `dist`.

## Things to fill in

- Social preview image: add an `og:image` meta tag once there's artwork.
