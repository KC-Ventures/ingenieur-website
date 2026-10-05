import { createField, type Field } from './field/field';
import { STAGES } from './fidelity';

/**
 * The pinned "idea to company" scene. One full-bleed field sits behind the
 * stage and is clipped to the window; at the end the clip opens to the whole
 * screen and the contact panel appears on top.
 */
export interface Journey {
  field: Field | null;
  stage: HTMLElement;
  fieldElement: HTMLElement;
  cta: HTMLElement;
  /** Distances from the field's edges to the window's: top, right, bottom, left. Updated by measure(). */
  readonly insets: [number, number, number, number];
  /** Re-read the window's position; call after layout changes. */
  measure(): void;
  /** Show step `index` in the copy, progress bar and readout. */
  showStep(index: number): HTMLElement;
  readonly steps: HTMLElement[];
}

export function createJourney(onResize: () => void): Journey {
  const stage = document.querySelector<HTMLElement>('.journey__stage')!;
  const fieldElement = stage.querySelector<HTMLElement>('.journey__field')!;
  const windowElement = stage.querySelector<HTMLElement>('.journey__window')!;
  const steps = [...stage.querySelectorAll<HTMLElement>('.step')];
  const bars = [...stage.querySelectorAll<HTMLElement>('.journey__progress span')];
  const resolution = stage.querySelector<HTMLElement>('[data-resolution]')!;
  const colour = stage.querySelector<HTMLElement>('[data-colour]')!;
  const cta = stage.querySelector<HTMLElement>('.journey__cta')!;

  const field = createField(stage.querySelector<HTMLCanvasElement>('.journey__canvas')!, {
    scale: 360,
    black: 0.12,
    // It can cover the whole screen; soft colour and large dither cells don't need more.
    maxRatio: 1,
    onResize,
  });

  const insets: [number, number, number, number] = [0, 0, 0, 0];
  const measure = () => {
    const outer = fieldElement.getBoundingClientRect();
    const inner = windowElement.getBoundingClientRect();
    insets.splice(0, 4, inner.top - outer.top, outer.right - inner.right, outer.bottom - inner.bottom, inner.left - outer.left);
  };
  measure();

  return {
    field,
    stage,
    fieldElement,
    cta,
    steps,
    insets,
    measure,
    showStep(index) {
      steps.forEach((step, i) => step.classList.toggle('is-current', i === index));
      bars.forEach((bar, i) => bar.classList.toggle('is-on', i <= index));
      resolution.textContent = STAGES[index].resolution;
      colour.textContent = STAGES[index].colour;
      return steps[index];
    },
  };
}
