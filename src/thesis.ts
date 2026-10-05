// The thesis headline condenses as it scrolls into view: each line starts
// hairline-thin and fully expanded (the idea, out of reach) and settles
// heavy and narrow (the thing, made concrete).

const FROM = { weight: 110, width: 125, alpha: 0.38 };
const TO = { weight: 820, width: 88, alpha: 1 };

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smoothstep = (x: number) => x * x * (3 - 2 * x);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

function setLine(line: HTMLElement, t: number) {
  line.style.fontVariationSettings = `"wght" ${mix(FROM.weight, TO.weight, t).toFixed(1)}, "wdth" ${mix(FROM.width, TO.width, t).toFixed(2)}`;
  line.style.opacity = mix(FROM.alpha, TO.alpha, t).toFixed(3);
}

export function initThesis(title: HTMLElement, reducedMotion: boolean) {
  const lines = [...title.querySelectorAll<HTMLElement>('.thesis__line')];

  if (reducedMotion) {
    lines.forEach((line) => setLine(line, 1));
    return;
  }

  let queued = false;

  function update() {
    queued = false;
    const rect = title.getBoundingClientRect();
    const viewport = window.innerHeight;
    // 0 when the title's top meets the bottom 10% of the screen, 1 when it reaches 35%.
    const progress = clamp01((viewport * 0.9 - rect.top) / (viewport * 0.55));
    lines.forEach((line, index) => {
      const local = clamp01((progress - index * 0.14) / 0.72);
      setLine(line, smoothstep(local));
    });
  }

  function queue() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  }

  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', queue);
  update();
}
