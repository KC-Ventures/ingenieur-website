// How faithfully the gradient is drawn at each step from idea to company:
// one-bit dots, then a handful of palette colours, then fine dither, then smooth.

export interface Stage {
  /** Dither cell size in CSS pixels; 1 is smooth. */
  cell: number;
  /** Palette steps while dithering. */
  steps: number;
  /** 1 draws one-bit green dots. */
  mono: number;
  /** What the readout says about this stage. */
  resolution: string;
  colour: string;
}

export const STAGES: Stage[] = [
  { cell: 14, steps: 2, mono: 1, resolution: '14 px', colour: '1-bit' },
  { cell: 8, steps: 6, mono: 0, resolution: '8 px', colour: '6 colours' },
  { cell: 3, steps: 24, mono: 0, resolution: '3 px', colour: '24 colours' },
  { cell: 1, steps: 256, mono: 0, resolution: 'Native', colour: 'Full colour' },
];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Drawing settings for a fidelity between 0 (idea) and 3 (company). */
export function fidelityAt(value: number): Pick<Stage, 'cell' | 'steps' | 'mono'> {
  const f = Math.min(3, Math.max(0, value));
  const i = Math.min(2, Math.floor(f));
  const t = f - i;
  const a = STAGES[i];
  const b = STAGES[i + 1];
  return {
    // Cell sizes shrink geometrically, like an image loading progressively.
    cell: Math.round(Math.exp(lerp(Math.log(a.cell), Math.log(b.cell), t))),
    steps: Math.round(lerp(a.steps, b.steps, t)),
    mono: f < 0.5 ? 1 : 0,
  };
}
