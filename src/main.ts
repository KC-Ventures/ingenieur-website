import './style.css';
import { createLacquer } from './lacquer';
import { initThesis } from './thesis';

const root = document.documentElement;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const canvas = document.querySelector<HTMLCanvasElement>('.lacquer')!;
const thesisTitle = document.querySelector<HTMLElement>('.thesis__title')!;
const sections = [...document.querySelectorAll<HTMLElement>('[data-exposure]')];

// How bright the room should be: an average over the sections in the middle
// half of the screen, so the lights follow what's being read.
function targetExposure(): number {
  const top = window.innerHeight * 0.25;
  const bottom = window.innerHeight * 0.75;
  let total = 0;
  let weight = 0;
  for (const section of sections) {
    const rect = section.getBoundingClientRect();
    const visible = Math.min(rect.bottom, bottom) - Math.max(rect.top, top);
    if (visible <= 0) continue;
    total += visible * Number(section.dataset.exposure ?? 1);
    weight += visible;
  }
  return weight > 0 ? total / weight : 1;
}

function fontsReady(timeout: number): Promise<unknown> {
  return Promise.race([document.fonts.ready, new Promise((resolve) => setTimeout(resolve, timeout))]);
}

function startLacquer() {
  // Resizing clears the canvas, so the still frame used for reduced motion has to be redrawn.
  let repaint = () => {};
  const lacquer = createLacquer(canvas, () => repaint());
  if (!lacquer) {
    root.classList.add('no-webgl');
    return;
  }
  // If the GPU drops the context, show the CSS gradient instead of a frozen frame.
  canvas.addEventListener('webglcontextlost', () => root.classList.add('no-webgl'));

  if (reducedMotion) {
    // One still frame with the lights already on; redraw only when the room brightness changes.
    let queued = false;
    repaint = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        lacquer.render({ time: 0, scroll: 0, pointer: [0, 0], exposure: targetExposure(), reveal: 60 });
      });
    };
    window.addEventListener('scroll', repaint, { passive: true });
    repaint();
    return;
  }

  const pointerTarget: [number, number] = [0, 0];
  const pointer: [number, number] = [0, 0];
  window.addEventListener(
    'pointermove',
    (event) => {
      pointerTarget[0] = (event.clientX / window.innerWidth) * 2 - 1;
      pointerTarget[1] = -((event.clientY / window.innerHeight) * 2 - 1);
    },
    { passive: true },
  );

  const litAt = performance.now();
  let last = litAt;
  let exposure = 1;
  let slowFrames = 0;
  let sampledFrames = 0;

  function frame(now: number) {
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;

    const ease = 1 - Math.exp(-dt * 3);
    pointer[0] += (pointerTarget[0] - pointer[0]) * ease;
    pointer[1] += (pointerTarget[1] - pointer[1]) * ease;
    exposure += (targetExposure() - exposure) * (1 - Math.exp(-dt * 4));

    const reveal = (now - litAt) / 1000;
    lacquer!.render({
      time: now / 1000,
      scroll: window.scrollY / window.innerHeight,
      pointer,
      exposure,
      reveal,
    });

    // After the intro, drop resolution on machines that can't keep up.
    if (reveal > 3 && lacquer!.quality > 0.5) {
      sampledFrames += 1;
      if (dt > 1 / 40) slowFrames += 1;
      if (sampledFrames === 90) {
        if (slowFrames > 45) lacquer!.setQuality(Math.max(0.5, lacquer!.quality - 0.2));
        sampledFrames = 0;
        slowFrames = 0;
      }
    }

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

initThesis(thesisTitle, reducedMotion);

fontsReady(1500).then(() => {
  startLacquer();
  root.classList.add('is-lit');
});
