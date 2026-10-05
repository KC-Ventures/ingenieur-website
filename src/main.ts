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

// The gradient turns around the pointer. Until someone points, it drifts on its own.
const pointer = { x: 0, y: 0, targetX: 0, targetY: 0, active: false };

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

/** The pointer in a canvas's own coordinates, or a slow drift around `home`. */
function focusFor(canvas: HTMLElement, time: number, home: [number, number], reach: [number, number]): [number, number] {
  const rect = canvas.getBoundingClientRect();
  if (pointer.active) return [pointer.x - rect.left, pointer.y - rect.top];
  return [home[0] + Math.sin(time * 0.35) * reach[0], home[1] + Math.cos(time * 0.27) * reach[1]];
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
        pointer.targetX = event.clientX;
        pointer.targetY = event.clientY;
        if (!pointer.active) {
          pointer.x = event.clientX;
          pointer.y = event.clientY;
          pointer.active = true;
        }
        requestFrame();
      },
      { passive: true },
    );
  }

  const render = (
    field: Field,
    element: HTMLElement,
    fidelity: number,
    time: number,
    home: [number, number],
    reach: [number, number],
    scale?: number,
  ) => {
    field.render({ ...fidelityAt(fidelity), focus: focusFor(element, time, home, reach), time, scale });
  };
  const mix = (a: number, b: number, t: number) => a + (b - a) * t;

  draw = (now) => {
    // Still frames when motion is reduced: no drift, no pointer.
    const time = reducedMotion ? 4 : now / 1000;
    // Close the gap to the pointer quickly so the colour feels attached to it.
    pointer.x += (pointer.targetX - pointer.x) * 0.25;
    pointer.y += (pointer.targetY - pointer.y) * 0.25;

    let animating = false;
    if (wordmark && visible.get(wordmarkCanvas)) {
      const { width, height } = wordmark.size;
      render(wordmark, wordmarkCanvas, scene.hero, time, [width / 2, height / 2], [width * 0.35, height * 0.3]);
      animating = true;
    }
    if (journey.field && visible.get(journey.fieldElement)) {
      // Left alone, the colour circles the window, then the whole screen once it opens.
      const { width, height } = journey.field.size;
      const [top, right, , left] = journey.insets;
      const side = width - left - right;
      const k = scene.open;
      const home: [number, number] = [mix(left + side / 2, width / 2, k), mix(top + side / 2, height / 2, k)];
      const reach: [number, number] = [mix(side * 0.25, width * 0.3, k), mix(side * 0.25, height * 0.3, k)];
      // Opening the window into the page also opens up the colour bands.
      render(journey.field, journey.fieldElement, scene.journey, time, home, reach, 360 + k * 540);
      animating = true;
    }
    if (animating && !reducedMotion) requestFrame();
  };

  initMotion({ scene, journey, onChange: requestFrame });
  requestFrame();
}

start();
