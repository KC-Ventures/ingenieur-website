#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

// A restrained green light field. The pointer changes its direction and flow,
// rather than becoming a visible centre of rotation. It can be drawn smooth,
// or through an ordered dither at a chosen cell size.

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

// Black, forest, moss, and soft signal green. The palette keeps the gradient
// inside Ingenieur's black-and-green world instead of reaching for spectacle.
vec3 palette(float t) {
  vec3 black = vec3(0.004, 0.009, 0.006);
  vec3 forest = vec3(0.018, 0.085, 0.052);
  vec3 moss = vec3(0.06, 0.16, 0.09);
  vec3 sage = vec3(0.16, 0.35, 0.20);
  vec3 signal = vec3(0.28, 0.55, 0.31);

  vec3 col = band(black, forest, 0.0, 0.2, t);
  col = band(col, moss, 0.2, 0.42, t);
  col = band(col, sage, 0.42, 0.62, t);
  col = band(col, signal, 0.62, 0.74, t);
  col = band(col, uDark, 0.76, 0.84, t);
  col = band(col, forest, 0.84 + uBlack * 0.35, 1.0, t);
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

// Position along a broad, slightly irregular light field. The cursor changes
// the angle and phase of the field across the whole surface; there is no local
// spotlight or radial hub to follow.
float field(vec2 frag) {
  vec2 uv = frag / uResolution;
  vec2 cursor = uFocus / uResolution;
  vec2 sway = cursor - 0.5;
  vec2 axis = normalize(vec2(0.92, 0.18) + sway * 0.65);
  vec2 drift = vec2(uTime * 0.018, -uTime * 0.012);
  float diagonal = dot(uv - 0.5, axis);
  float cross = dot(uv - 0.5, vec2(-axis.y, axis.x));
  float grain = noise((uv + drift) * 3.2 + sway * 0.7) - 0.5;
  float bands = diagonal * 1.55 + cross * 0.22 + grain * 0.12;
  return fract(bands + 0.54 + sway.x * 0.12 + sway.y * 0.08);
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
    col = step(0.5, light + (bayer8(cell) - 0.5) * 0.9) * vec3(0.23, 0.68, 0.35);
  } else {
    // Dither between neighbouring palette colours, so every cell is on-brand.
    col = palette(fract(floor(t * uSteps + bayer8(cell)) / uSteps));
  }
  gl_FragColor = vec4(col * mask, mask);
}
