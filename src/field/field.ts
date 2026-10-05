import vertexSource from './fullscreen.vert?raw';
import fragmentSource from './field.frag?raw';

export interface FieldFrame {
  /** Centre of the fold, CSS pixels from the canvas's top-left. */
  origin: [number, number];
  /** How the disc is held, -1 to 1 on each axis. */
  tilt: [number, number];
  /** How fast it is being turned, about -1 to 1 on each axis; 0 at rest. */
  swing: [number, number];
  time: number;
  /** Dither cell size in CSS pixels; 1 draws the field smooth. */
  cell: number;
  /** Colours while dithering. */
  steps: number;
  /** 1 draws one-bit silver dots instead of colour. */
  mono: number;
  /** CSS pixels per unit of the field; overrides the option for this frame. */
  scale?: number;
}

export interface Field {
  render(frame: FieldFrame): void;
  /** Repaint the mask, for shapes that animate. */
  refreshMask(): void;
  /** Size of the canvas in CSS pixels. */
  readonly size: { width: number; height: number };
}

interface FieldOptions {
  /** Paints where the field shows; leave it out to fill the canvas. */
  drawMask?: (ctx: CanvasRenderingContext2D, width: number, height: number) => void;
  /** CSS pixels per unit of the field: how large the fold is. */
  scale?: number;
  /** Highest device pixel ratio to render at. */
  maxRatio?: number;
  /** Fires after a resize; the canvas is blank until the next render. */
  onResize?: () => void;
}

const UNIFORMS = [
  'uResolution',
  'uMask',
  'uOrigin',
  'uTilt',
  'uSwing',
  'uScale',
  'uTime',
  'uCell',
  'uSteps',
  'uMono',
] as const;

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(`Shader failed to compile: ${gl.getShaderInfoLog(shader)}`);
  }
  return shader;
}

/**
 * Draws the silver CD field into a canvas, inside an optional mask.
 * Returns null without WebGL so the caller can keep its CSS fallback.
 */
export function createField(canvas: HTMLCanvasElement, options: FieldOptions = {}): Field | null {
  const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false });
  if (!gl) return null;

  let program: WebGLProgram;
  try {
    program = gl.createProgram()!;
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, vertexSource));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, fragmentSource));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(`Program failed to link: ${gl.getProgramInfoLog(program)}`);
    }
  } catch (error) {
    console.warn(error);
    return null;
  }
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'aPosition');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const u = Object.fromEntries(UNIFORMS.map((name) => [name, gl.getUniformLocation(program, name)])) as Record<
    (typeof UNIFORMS)[number],
    WebGLUniformLocation | null
  >;
  gl.uniform1i(u.uMask, 0);

  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  const maskCanvas = document.createElement('canvas');
  const maskContext = maskCanvas.getContext('2d')!;
  const size = { width: 0, height: 0 };
  let ratio = 1;

  function refreshMask() {
    maskContext.setTransform(1, 0, 0, 1, 0, 0);
    maskContext.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
    maskContext.setTransform(ratio, 0, 0, ratio, 0, 0);
    if (options.drawMask) {
      options.drawMask(maskContext, size.width, size.height);
    } else {
      maskContext.fillStyle = '#fff';
      maskContext.fillRect(0, 0, size.width, size.height);
    }
    gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, gl!.RGBA, gl!.UNSIGNED_BYTE, maskCanvas);
  }

  function resize(width: number, height: number) {
    ratio = Math.min(window.devicePixelRatio || 1, options.maxRatio ?? 2);
    size.width = width;
    size.height = height;
    canvas.width = maskCanvas.width = Math.max(1, Math.round(width * ratio));
    canvas.height = maskCanvas.height = Math.max(1, Math.round(height * ratio));
    gl!.viewport(0, 0, canvas.width, canvas.height);
    refreshMask();
    options.onResize?.();
  }

  const rect = canvas.getBoundingClientRect();
  resize(rect.width, rect.height);
  new ResizeObserver(([entry]) => {
    const { width, height } = entry.contentRect;
    if (Math.abs(width - size.width) > 0.5 || Math.abs(height - size.height) > 0.5) resize(width, height);
  }).observe(canvas);

  return {
    size,
    refreshMask,
    render({ origin, tilt, swing, time, cell, steps, mono, scale }) {
      if (!size.width || !size.height) return;
      gl.uniform2f(u.uResolution, canvas.width, canvas.height);
      // CSS pixels from the top-left become device pixels from the bottom-left.
      gl.uniform2f(u.uOrigin, origin[0] * ratio, (size.height - origin[1]) * ratio);
      gl.uniform2f(u.uTilt, tilt[0], tilt[1]);
      gl.uniform2f(u.uSwing, swing[0], swing[1]);
      gl.uniform1f(u.uScale, (scale ?? options.scale ?? 520) * ratio);
      gl.uniform1f(u.uTime, time);
      // A cell of one CSS pixel means smooth, on any screen; only real dither cells scale with the ratio.
      gl.uniform1f(u.uCell, cell <= 1 ? 1 : cell * ratio);
      gl.uniform1f(u.uSteps, steps);
      gl.uniform1f(u.uMono, mono);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
  };
}
