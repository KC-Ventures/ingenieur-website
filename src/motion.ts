import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import type { Journey } from './journey';

gsap.registerPlugin(ScrollTrigger, SplitText);

/** Values the fields read every frame. */
export interface Scene {
  /** Fidelity of the hero wordmark, 0 (idea) to 3 (smooth). */
  hero: number;
  /** Fidelity of the journey window. */
  journey: number;
  /** How far the journey's field has opened to fill the screen, 0 to 1. */
  open: number;
}

interface MotionOptions {
  scene: Scene;
  journey: Journey;
  /** Something the fields draw from has changed. */
  onChange: () => void;
}

// Where things happen along the journey's scroll, 0 to 1.
const STEP_LENGTH = 0.15; // four steps fill the first 60%
const OPEN_FROM = 0.64;
const OPEN_TO = 0.82;
const CTA_AT = 0.8;

// The statement holds for this many screens of scrolling...
const HOLD = 1.1;
// ...while its reading light runs, in timeline units.
const WORD = 0.6; // how long one word takes to light
const WORD_GAP = 0.14; // from one word to the next
const PHRASE_GAP = 0.5; // a beat between phrases
const DIM = '#2e2e2e';

export function initMotion({ scene, journey, onChange }: MotionOptions) {
  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  ScrollTrigger.create({
    start: 'top top-=8',
    end: 'max',
    toggleClass: { targets: '.site-header', className: 'is-scrolled' },
  });

  // ---- Hero: the name resolves from one-bit dots into full colour. ----
  if (reduced) {
    root.classList.add('is-ready');
  } else {
    scene.hero = 0;
    onChange();
    root.classList.add('is-ready');
    const lede = SplitText.create('.hero__lede', { type: 'lines', mask: 'lines' });
    gsap
      .timeline({ defaults: { ease: 'expo.out' } })
      .to(scene, { hero: 3, duration: 1.8, ease: 'steps(9)', onUpdate: onChange }, 0.15)
      .from(lede.lines, { yPercent: 100, duration: 1.2, stagger: 0.08 }, 0.5)
      .from('.hero__actions .button', { y: 14, autoAlpha: 0, duration: 1, stagger: 0.07 }, 0.75)
      .from('.site-header', { autoAlpha: 0, duration: 1 }, 0.85);
  }

  // ---- Statement: the paragraph holds in the middle while a reading light sweeps its words. ----
  // It holds on the way down only. Once it is behind the reader the hold comes out, so scrolling back
  // up goes straight past; it goes back in, out of sight, once the paragraph is below the screen again.
  const phrases = [...document.querySelectorAll<HTMLElement>('.statement__phrase')].map(splitWords);
  // Lets "Contact" skip the hold instead of scrolling through it.
  let releaseStatement = () => {};

  if (!reduced) {
    const text = document.querySelector<HTMLElement>('.statement__text')!;
    const ship = text.querySelector('.statement__ship');
    // The middle of what the sticky header leaves visible.
    const readingLine = () => (window.innerHeight + document.querySelector<HTMLElement>('.site-header')!.offsetHeight) / 2;
    let statement: gsap.Context | undefined;
    let hold: ScrollTrigger;

    const arm = () => {
      statement = gsap.context(() => {
        const tl = gsap.timeline({ defaults: { ease: 'none' } });
        let at = 0;
        phrases.forEach((words, p) => {
          if (p > 0) at += PHRASE_GAP;
          for (const word of words) {
            tl.fromTo(word, { color: DIM }, { color: word === ship ? '#00ff88' : '#ffffff', duration: WORD }, at);
            at += WORD_GAP;
          }
        });
        // A moment fully lit before the paragraph moves on.
        tl.to({}, { duration: 0.8 });
        hold = ScrollTrigger.create({
          animation: tl,
          trigger: text,
          start: () => `center ${readingLine()}px`,
          end: () => `+=${window.innerHeight * HOLD}`,
          pin: true,
          anticipatePin: 1,
          scrub: 0.5,
          // Set again after the journey's trigger, but it has to be measured before it.
          refreshPriority: 1,
        });
      });
    };

    releaseStatement = () => {
      if (!statement) return;
      const y = window.scrollY;
      const passed = gsap.utils.clamp(0, hold.end - hold.start, y - hold.start);
      // Reverting takes out the pin's spacing and the inline colours, which leaves the lit paragraph.
      statement.revert();
      statement = undefined;
      // Everything below moved up by the part of the hold already scrolled through; follow it, so nothing on screen moves.
      window.scrollTo({ top: y - passed, behavior: 'instant' });
      ScrollTrigger.refresh();
    };

    // Not when the page opens below the paragraph.
    const box = text.getBoundingClientRect();
    if (box.top + box.height / 2 > readingLine()) arm();

    // Changes wait until scrolling pauses, so they never interrupt it...
    ScrollTrigger.addEventListener('scrollEnd', () => {
      if (statement && window.scrollY >= hold.end) {
        releaseStatement();
      } else if (!statement && text.getBoundingClientRect().top > window.innerHeight) {
        arm();
        ScrollTrigger.refresh();
      }
    });
    // ...except turning back up, when the hold has to be gone before the paragraph comes back.
    let lastY = window.scrollY;
    window.addEventListener(
      'scroll',
      () => {
        if (statement && window.scrollY < lastY && lastY >= hold.end) releaseStatement();
        lastY = window.scrollY;
      },
      { passive: true },
    );
  }

  // ---- Journey: each step sharpens the window; then the window becomes the page. ----
  const { stage, cta, fieldElement } = journey;
  const openEase = gsap.parseEase('power2.inOut');

  const applyOpen = () => {
    const k = 1 - openEase(scene.open);
    const [top, right, bottom, left] = journey.insets.map((value) => value * k);
    fieldElement.style.clipPath = `inset(${top}px ${right}px ${bottom}px ${left}px)`;
    // The copy clears out early, before the colour reaches it.
    stage.style.setProperty('--copy', String(Math.max(0, 1 - scene.open * 4)));
    onChange();
  };
  const openTo = reduced
    ? (value: number) => {
        scene.open = value;
        applyOpen();
      }
    : gsap.quickTo(scene, 'open', { duration: 0.6, ease: 'power3.out', onUpdate: applyOpen });

  let current = -1;
  const showStep = (index: number) => {
    if (index === current) return;
    current = index;
    const step = journey.showStep(index);
    // The readout's new text can move the window; keep the clip on it.
    journey.measure();
    applyOpen();
    journey.steps.forEach((item, i) => {
      item.classList.toggle('is-prev', i === index - 1);
      item.classList.toggle('is-next', i === index + 1);
      item.style.opacity = i === index ? '1' : i === index - 1 || i === index + 1 ? '0.28' : '0';
    });
    if (reduced) {
      scene.journey = index;
      onChange();
      return;
    }
    // Resolution climbs in visible steps, like an image loading.
    // 'auto' only replaces the previous journey tween; the hero's intro shares this object.
    gsap.to(scene, { journey: index, duration: 0.9, ease: 'steps(6)', overwrite: 'auto', onUpdate: onChange });
    gsap.fromTo(
      step.querySelector('.step__name span'),
      { yPercent: 105 },
      { yPercent: 0, duration: 0.9, ease: 'expo.out', overwrite: true },
    );
    gsap.fromTo(
      [step.querySelector('.step__index'), step.querySelector('.step__text')],
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', stagger: 0.05, overwrite: true },
    );
  };

  let ctaShown = false;
  const showCta = (show: boolean) => {
    if (show === ctaShown) return;
    ctaShown = show;
    cta.inert = !show;
    if (reduced) {
      gsap.set(cta, { opacity: show ? 1 : 0 });
    } else {
      gsap.to(cta, { opacity: show ? 1 : 0, y: show ? 0 : 24, duration: show ? 0.8 : 0.3, ease: 'expo.out', overwrite: true });
    }
  };

  cta.inert = true;
  showStep(0);
  applyOpen();

  const trigger = ScrollTrigger.create({
    trigger: '.journey',
    start: 'top top+=64',
    end: 'bottom bottom',
    onRefresh: () => {
      journey.measure();
      applyOpen();
    },
    onUpdate: (self) => {
      const p = self.progress;
      showStep(Math.min(3, Math.floor(p / STEP_LENGTH)));
      const open = reduced ? Number(p >= (OPEN_FROM + OPEN_TO) / 2) : gsap.utils.clamp(0, 1, (p - OPEN_FROM) / (OPEN_TO - OPEN_FROM));
      openTo(open);
      showCta(p >= CTA_AT);
    },
  });

  // "Contact" lives at the end of the journey, so jump to where the panel is showing.
  for (const link of document.querySelectorAll<HTMLAnchorElement>('a[href="#contact"]')) {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      releaseStatement();
      const top = trigger.start + (trigger.end - trigger.start) * 0.92;
      window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
    });
  }
}

/** Wraps each word of a phrase in a span; child elements count as one word. Words stay inline, so lines break as before. */
function splitWords(phrase: HTMLElement): HTMLElement[] {
  const words: HTMLElement[] = [];
  for (const node of [...phrase.childNodes]) {
    if (node instanceof HTMLElement) {
      words.push(node);
      continue;
    }
    const fragment = document.createDocumentFragment();
    for (const part of (node.textContent ?? '').split(/(\s+)/)) {
      if (!part.trim()) {
        fragment.append(part);
        continue;
      }
      const word = document.createElement('span');
      word.textContent = part;
      fragment.append(word);
      words.push(word);
    }
    node.replaceWith(fragment);
  }
  return words;
}
