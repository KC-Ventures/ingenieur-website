import vertexSource from './shaders/fullscreen.vert?raw';
import fragmentSource from './shaders/lacquer.frag?raw';

export interface LacquerFrame {
  time: number;
  scroll: number;
  pointer: [number, number];
  exposure: number;
  reveal: number;
}

export interface Lacquer {
  render(frame: LacquerFrame): void;
  /** Multiplier on the device pixel ratio, lowered when frames run long. */
  setQuality(scale: number): void;
  readonly quality: number;
}

const UNIFORMS = ['uResolution', 'uTime', 'uScroll', 'uPointer', 'uExposure', 'uReveal'] as const;
type UniformName = (typeof UNIFORMS)[number];

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('Could not create shader');
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader failed to compile: ${log}`);
  }
  return shader;
}

/**
 * Full-screen lacquered surface. Returns null when WebGL isn't available so
 * the page can fall back to its CSS gradient. Resizing clears the canvas, so
 * callers that don't redraw every frame should repaint in onResize.
 */
export function createLacquer(canvas: HTMLCanvasElement, onResize?: () => void): Lacquer | null {
  const gl = canvas.getContext('webgl', {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: false,
  });
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

  // One triangle that covers the whole viewport.
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'aPosition');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const uniforms = Object.fromEntries(
    UNIFORMS.map((name) => [name, gl.getUniformLocation(program, name)]),
  ) as Record<UniformName, WebGLUniformLocation | null>;

  let quality = 1;
  let { width: cssWidth, height: cssHeight } = canvas.getBoundingClientRect();

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5) * quality;
    const width = Math.max(1, Math.round(cssWidth * ratio));
    const height = Math.max(1, Math.round(cssHeight * ratio));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      gl!.viewport(0, 0, width, height);
      onResize?.();
    }
  }

  resize();
  new ResizeObserver(([entry]) => {
    cssWidth = entry.contentRect.width;
    cssHeight = entry.contentRect.height;
    resize();
  }).observe(canvas);

  return {
    get quality() {
      return quality;
    },
    setQuality(scale) {
      quality = scale;
      resize();
    },
    render(frame) {
      if (!cssWidth || !cssHeight) return;
      gl.uniform2f(uniforms.uResolution, canvas.width, canvas.height);
      gl.uniform1f(uniforms.uTime, frame.time);
      gl.uniform1f(uniforms.uScroll, frame.scroll);
      gl.uniform2f(uniforms.uPointer, frame.pointer[0], frame.pointer[1]);
      gl.uniform1f(uniforms.uExposure, frame.exposure);
      gl.uniform1f(uniforms.uReveal, frame.reveal);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
  };
}
