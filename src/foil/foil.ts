import vertexSource from './fullscreen.vert?raw';
import fragmentSource from './foil.frag?raw';

export interface FoilLook {
  /** Groove spacing in nm per unit of half-vector: shifts which colours appear. */
  pitch: number;
  /** Angular width of the diffraction bands. */
  spread: number;
  /** Strength of the diffraction bands. */
  rainbow: number;
  /** Scales the metal from black (0) to its full brightness (1). */
  silver: number;
  /** Metal brightness at the top, at the horizon band, and at the bottom. */
  base: [number, number, number];
  /** Where the horizon band sits, 0 (top) to 1 (bottom). */
  horizon: number;
  /** Strength of the broad conic iridescence tinting the metal. */
  sheen: number;
  /** 0 is the physical spectrum, 1 the curated CD palette. */
  palette: number;
  /** Strength of the lit edge around the shape. */
  bevel: number;
  /** Colour cycles per turn of the sheen; a whole number keeps it seamless. */
  cycles: number;
}

export interface FoilFrame {
  /** Light position in CSS pixels from the canvas's top-left; z is height above it. */
  light: [number, number, number];
  /** Centre of the grooves, CSS pixels from the canvas's top-left. */
  center: [number, number];
}

export interface Foil {
  render(frame: FoilFrame): void;
  /** Repaint the mask, for shapes that animate. */
  refreshMask(): void;
  /** Size of the canvas in CSS pixels. */
  readonly size: { width: number; height: number };
}

type DrawMask = (ctx: CanvasRenderingContext2D, width: number, height: number) => void;

const UNIFORMS = [
  'uResolution',
  'uMask',
  'uCenter',
  'uLight',
  'uEye',
  'uPitch',
  'uSpread',
  'uSilver',
  'uSheen',
  'uPalette',
  'uBevel',
  'uPixel',
  'uCycles',
  'uBase',
  'uHorizon',
  'uRainbow',
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
 * Renders the diffraction-foil material inside whatever drawMask paints.
 * Returns null without WebGL so the caller can keep its CSS fallback.
 * The mask is repainted on resize, after which onResize fires so the caller
 * can draw a frame (resizing clears the canvas).
 */
export function createFoil(
  canvas: HTMLCanvasElement,
  drawMask: DrawMask,
  look: FoilLook,
  onResize?: () => void,
): Foil | null {
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

  gl.uniform1f(u.uPitch, look.pitch);
  gl.uniform1f(u.uSpread, look.spread);
  gl.uniform1f(u.uSilver, look.silver);
  gl.uniform1f(u.uSheen, look.sheen);
  gl.uniform1f(u.uPalette, look.palette);
  gl.uniform1f(u.uBevel, look.bevel);
  gl.uniform1f(u.uCycles, look.cycles);
  gl.uniform3f(u.uBase, ...look.base);
  gl.uniform1f(u.uHorizon, look.horizon);
  gl.uniform1f(u.uRainbow, look.rainbow);
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

  function resize(width: number, height: number) {
    ratio = Math.min(window.devicePixelRatio || 1, 2);
    size.width = width;
    size.height = height;
    const pixelWidth = Math.max(1, Math.round(width * ratio));
    const pixelHeight = Math.max(1, Math.round(height * ratio));
    canvas.width = maskCanvas.width = pixelWidth;
    canvas.height = maskCanvas.height = pixelHeight;
    gl!.viewport(0, 0, pixelWidth, pixelHeight);
    refreshMask();
    onResize?.();
  }

  function refreshMask() {
    maskContext.setTransform(1, 0, 0, 1, 0, 0);
    maskContext.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
    maskContext.setTransform(ratio, 0, 0, ratio, 0, 0);
    drawMask(maskContext, size.width, size.height);
    gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, gl!.RGBA, gl!.UNSIGNED_BYTE, maskCanvas);
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
    render({ light, center }) {
      if (!size.width || !size.height) return;
      // CSS pixels from the top-left become device pixels from the bottom-left.
      const toGl = (x: number, y: number): [number, number] => [x * ratio, (size.height - y) * ratio];
      gl.uniform2f(u.uResolution, canvas.width, canvas.height);
      gl.uniform1f(u.uPixel, ratio);
      gl.uniform2f(u.uCenter, ...toGl(center[0], center[1]));
      gl.uniform3f(u.uLight, ...toGl(light[0], light[1]), light[2] * ratio);
      gl.uniform3f(u.uEye, ...toGl(size.width / 2, size.height / 2), Math.max(size.width, size.height) * 1.1 * ratio);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
  };
}
