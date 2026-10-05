import './style.css';
import { fidelityAt } from './fidelity';
import type { Field } from './field/field';
import { createJourney } from './journey';
import { initMotion, type Scene } from './motion';
import { createWordmark } from './wordmark';

const root = document.documentElement;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.querySelector('[data-commit]')!.textContent = __COMMIT__;

const scene: Scene = { hero: 3, journey: 0, open: 0 };

// The pointer holds the disc: where it sits on screen is the angle of the tilt, and
// how fast it moves is the swing that makes the colours flicker.
// Until a mouse moves (and always on touch), the disc turns slowly on its own and scrolling tips it.
const tilt = { x: 0.3, y: -0.1, targetX: 0.3, targetY: -0.1, swingX: 0, swingY: 0, pointing: false };
const clamp = (value: number) => Math.max(-1, Math.min(1, value));

let frameQueued = false;
// Draws the fields; replaced once the canvases exist.
let draw = (_now: number) => {};

function requestFrame() {
  if (frameQueued) return;
  frameQueued = true;
  requestAnimationFrame((now) => {
    frameQueued = false;
    draw(now);
  });
}

async function start() {
  // The wordmark mask is drawn with the font, so it has to be loaded first.
  await Promise.race([
    Promise.all([document.fonts.load('700 100px Geist'), document.fonts.ready]),
    new Promise((resolve) => setTimeout(resolve, 2500)),
  ]);

  const wordmarkCanvas = document.querySelector<HTMLCanvasElement>('.wordmark__field')!;
  const wordmark = createWordmark(wordmarkCanvas, requestFrame);
  const journey = createJourney(requestFrame);
  if (!wordmark) root.classList.add('no-webgl');

  const visible = new Map<Element, boolean>();
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) visible.set(entry.target, entry.isIntersecting);
    requestFrame();
  });
  observer.observe(wordmarkCanvas);
  observer.observe(journey.fieldElement);

  if (!reducedMotion) {
    window.addEventListener(
      'pointermove',
      (event) => {
        // A finger drags the page; only a mouse or pen holds the disc.
        if (event.pointerType === 'touch') return;
        tilt.targetX = clamp((event.clientX / window.innerWidth) * 2 - 1);
        tilt.targetY = clamp((event.clientY / window.innerHeight) * 2 - 1);
        tilt.pointing = true;
        requestFrame();
      },
      { passive: true },
    );
  }

  const render = (field: Field, fidelity: number, time: number, origin: [number, number], scale?: number) => {
    field.render({
      ...fidelityAt(fidelity),
      origin,
      tilt: [tilt.x, tilt.y],
      swing: [tilt.swingX, tilt.swingY],
      time,
      scale,
    });
  };
  const mix = (a: number, b: number, t: number) => a + (b - a) * t;

  draw = (now) => {
    // Still frames when motion is reduced: no drift, no pointer.
    const time = reducedMotion ? 4 : now / 1000;
    if (!tilt.pointing && !reducedMotion) {
      const scroll = window.scrollY / window.innerHeight;
      tilt.targetX = clamp(Math.sin(time * 0.21) * 0.5 + Math.sin(scroll * 0.9) * 0.45);
      tilt.targetY = clamp(Math.cos(time * 0.16) * 0.35 + Math.cos(scroll * 0.7) * 0.25);
    }
    // Eased, so the disc has some weight in the hand. How far it trails the pointer is
    // how fast it is being turned; that swing settles a little more slowly than the tilt.
    const lagX = tilt.targetX - tilt.x;
    const lagY = tilt.targetY - tilt.y;
    tilt.x += lagX * 0.09;
    tilt.y += lagY * 0.09;
    tilt.swingX += (clamp(lagX * 2) - tilt.swingX) * 0.15;
    tilt.swingY += (clamp(lagY * 2) - tilt.swingY) * 0.15;

    let animating = false;
    if (wordmark && visible.get(wordmarkCanvas)) {
      // One fold across the whole word, at any width.
      const { width, height } = wordmark.size;
      render(wordmark, scene.hero, time, [width / 2, height / 2], width / 2.6);
      animating = true;
    }
    if (journey.field && visible.get(journey.fieldElement)) {
      // The fold is centred in the window, then in the whole screen once it opens.
      const { width, height } = journey.field.size;
      const [top, right, , left] = journey.insets;
      const side = width - left - right;
      const k = scene.open;
      const origin: [number, number] = [mix(left + side / 2, width / 2, k), mix(top + side / 2, height / 2, k)];
      // Opening the window into the page also opens up the fold.
      render(journey.field, scene.journey, time, origin, mix(side * 0.6, Math.max(width, height) * 0.5, k));
      animating = true;
    }
    if (animating && !reducedMotion) requestFrame();
  };

  initMotion({ scene, journey, onChange: requestFrame });
  requestFrame();
}

start();
