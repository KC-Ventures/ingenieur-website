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

    // ---- Statement: one phrase at a time, as it reaches the reading line. ----
    gsap.fromTo(
      '.statement__phrase',
      { color: '#2e2e2e' },
      {
        color: '#ffffff',
        ease: 'none',
        stagger: 0.5,
        scrollTrigger: { trigger: '.statement__text', start: 'top 75%', end: 'bottom 40%', scrub: 0.4 },
      },
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
      const top = trigger.start + (trigger.end - trigger.start) * 0.92;
      window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
    });
  }
}
