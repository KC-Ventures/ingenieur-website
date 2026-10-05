import { createField, type Field } from './field/field';

const WORD = 'ingenieur';
const TRACKING = -0.05; // em
const PAD = 0.04; // space above and below the ink, in em
const font = (size: number) => `700 ${size}px Geist`;

interface Layout {
  /** Pen position of each letter, before shifting the ink to x = 0. */
  xs: number[];
  /** How far the first letter's ink sits right of its pen position (negative). */
  inset: number;
  inkWidth: number;
  ascent: number;
  descent: number;
}

function layout(ctx: CanvasRenderingContext2D, size: number): Layout {
  ctx.font = font(size);
  const xs = [...WORD].map((_, i) => ctx.measureText(WORD.slice(0, i)).width + i * TRACKING * size);
  const whole = ctx.measureText(WORD);
  const last = ctx.measureText(WORD[WORD.length - 1]);
  const inset = whole.actualBoundingBoxLeft;
  return {
    xs,
    inset,
    inkWidth: xs[xs.length - 1] + last.actualBoundingBoxRight + inset,
    ascent: whole.actualBoundingBoxAscent,
    descent: whole.actualBoundingBoxDescent,
  };
}

/**
 * The hero word, set edge to edge and filled with the gradient. The canvas
 * takes the word's proportions so it lays out like an image.
 */
export function createWordmark(canvas: HTMLCanvasElement, onResize: () => void): Field | null {
  const probe = layout(document.createElement('canvas').getContext('2d')!, 100);
  canvas.style.aspectRatio = String(probe.inkWidth / (probe.ascent + probe.descent + PAD * 2 * 100));

  return createField(canvas, {
    drawMask: (ctx, width) => {
      const size = (100 * width) / probe.inkWidth;
      const l = layout(ctx, size);
      ctx.fillStyle = '#fff';
      [...WORD].forEach((letter, i) => ctx.fillText(letter, l.inset + l.xs[i], PAD * size + l.ascent));
    },
    // Keep the dark band inside the same restrained green system as the field.
    black: 0,
    dark: [0.02, 0.09, 0.05],
    scale: 420,
    onResize,
  });
}
