# Ingenieur Labs

Landing page for Ingenieur Labs, a venture studio of two.

Plain HTML, CSS and TypeScript built with Vite. The background is a single WebGL
fragment shader (`src/shaders/lacquer.frag`): a deep green lacquered surface
reflecting a few long strip lights. It follows the pointer, flows as the page
scrolls, and dims while you read (each section sets its own `data-exposure`).

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
