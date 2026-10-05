import { createFoil } from './foil/foil';
import { CHROME } from './wordmark';

export interface Disc {
  render(light: [number, number, number]): void;
  readonly size: { width: number; height: number };
}

/** The disc's crown just inside the top of the canvas, its centre far below the page. */
function geometry(width: number, height: number) {
  const radius = width * 0.75;
  return { radius, center: [width / 2, radius + height * 0.06] as [number, number] };
}

export function createDisc(canvas: HTMLCanvasElement, onResize: () => void): Disc | null {
  const foil = createFoil(
    canvas,
    (ctx, width, height) => {
      const { radius, center } = geometry(width, height);
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(center[0], center[1], radius, 0, Math.PI * 2);
      ctx.fill();
      // A few shallow grooves near the rim; the shader lights their edges.
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.lineWidth = 1.5;
      for (const inset of [0.035, 0.11, 0.2]) {
        ctx.beginPath();
        ctx.arc(center[0], center[1], radius * (1 - inset), 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalCompositeOperation = 'source-over';
    },
    // A dark mirror: mostly black, with the colour arriving in vivid bands.
    { ...CHROME, base: [0.5, 0.05, 0.2], sheen: 0.1, cycles: 2 },
    onResize,
  );
  if (!foil) return null;

  return {
    size: foil.size,
    render(light) {
      const { width, height } = foil.size;
      foil.render({ light, center: geometry(width, height).center });
    },
  };
}
