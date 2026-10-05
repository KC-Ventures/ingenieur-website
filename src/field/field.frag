#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

// A vivid conic gradient that turns around a focus point (the cursor), like
// the colours on a CD around its centre. It can be drawn smooth, or through an
// ordered dither at a chosen cell size, down to one-bit green on black.

uniform vec2 uResolution; // device pixels
uniform sampler2D uMask;  // where to draw (alpha)
uniform vec2 uFocus;      // centre of the gradient, device pixels, y up
uniform float uScale;     // device pixels per unit of the field
uniform float uTime;      // seconds
uniform float uCell;      // dither cell size in device pixels; 1 means smooth
uniform float uSteps;     // palette steps while dithering
uniform float uMono;      // 1 draws one-bit green dots instead of colour
uniform float uBlack;     // width of the dark band in the palette, 0 to ~0.25
uniform vec3 uDark;       // colour of the dark band

const float TAU = 6.28318530718;

vec3 band(vec3 a, vec3 b, float from, float to, float t) {
  return mix(a, b, smoothstep(from, to, t));
}

// Klein blue, aquamarine, green, citric, tangerine, a dark band, and round again.
vec3 palette(float t) {
  vec3 klein = vec3(0.255, 0.0, 0.961);
  vec3 aqua = vec3(0.608, 0.941, 0.882);
  vec3 green = vec3(0.0, 1.0, 0.533);
  vec3 citric = vec3(0.804, 0.961, 0.392);
  vec3 tangerine = vec3(1.0, 0.275, 0.196);

  vec3 col = band(klein, aqua, 0.0, 0.15, t);
  col = band(col, green, 0.15, 0.31, t);
  col = band(col, citric, 0.31, 0.47, t);
  col = band(col, tangerine, 0.47, 0.62, t);
  col = band(col, uDark, 0.64, 0.74, t);
  col = band(col, klein, 0.74 + uBlack, 1.0, t);
  return col;
}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

// Position along the palette at a point: 0 to 1, wrapping.
float field(vec2 frag) {
  vec2 p = (frag - uFocus) / uScale;
  float radius = length(p);
  float turn = atan(p.y, p.x) / TAU;
  float flow = noise(p * 1.3 + vec2(uTime * 0.05, -uTime * 0.04)) - 0.5;
  // Two colour cycles per turn keep it seamless; the radius twists the bands into arms.
  return fract(turn * 2.0 + radius * 0.55 + flow * 0.3 - uTime * 0.02);
}

// Ordered-dither threshold from an 8x8 Bayer matrix, 0 to 1.
float bayer2(vec2 a) {
  a = floor(a);
  return fract(dot(a, vec2(0.5, a.y * 0.75)));
}
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }
float bayer8(vec2 a) { return bayer4(0.5 * a) * 0.25 + bayer2(a); }

void main() {
  vec2 frag = gl_FragCoord.xy;
  bool dithered = uCell > 1.5;
  vec2 cell = floor(frag / uCell);
  vec2 sampleAt = dithered ? (cell + 0.5) * uCell : frag;

  // Dithered shapes are sampled per cell, so their edges turn to pixels too.
  float mask = texture2D(uMask, sampleAt / uResolution).a;
  if (dithered) mask = step(0.5, mask);
  if (mask < 0.002) {
    gl_FragColor = vec4(0.0);
    return;
  }

  float t = field(sampleAt);
  vec3 col;
  if (!dithered) {
    col = palette(t);
  } else if (uMono > 0.5) {
    float light = dot(palette(t), vec3(0.299, 0.587, 0.114));
    col = step(0.5, light + (bayer8(cell) - 0.5) * 0.9) * vec3(0.0, 1.0, 0.533);
  } else {
    // Dither between neighbouring palette colours, so every cell is on-brand.
    col = palette(fract(floor(t * uSteps + bayer8(cell)) / uSteps));
  }
  gl_FragColor = vec4(col * mask, mask);
}
