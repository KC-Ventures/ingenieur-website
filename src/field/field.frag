#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

// A silver surface with one soft fold of colour across it, lit like a CD.
// Green fills the fold, the disc's spectrum runs in thin streaks near its crest,
// and tilting the disc (the pointer) bends the fold, swings the rainbow and leans
// the sheen; turning it quickly makes the spectrum flicker, as a disc does in the
// hand. Nothing is centred on the cursor. Drawn smooth, or through an ordered dither.

uniform vec2 uResolution; // device pixels
uniform sampler2D uMask;  // where to draw (alpha)
uniform vec2 uOrigin;     // centre of the fold, device pixels, y up
uniform vec2 uTilt;       // how the disc is held, -1 to 1 on each axis
uniform vec2 uSwing;      // how fast it is being turned, about -1 to 1, 0 at rest
uniform float uScale;     // device pixels per unit of the field
uniform float uTime;      // seconds
uniform float uCell;      // dither cell size in device pixels; 1 means smooth
uniform float uSteps;     // colours while dithering
uniform float uMono;      // 1 draws one-bit silver dots instead of colour

const vec3 WHITE = vec3(0.965, 0.972, 0.98);
const vec3 SILVER = vec3(0.70, 0.725, 0.75);
const vec3 GREEN = vec3(0.0, 1.0, 0.533);         // #00FF88
const vec3 FOLD = vec3(0.0, 0.62, 0.40);          // green in the fold's shadow
const vec3 BLUE = vec3(0.255, 0.0, 0.961);        // #4100F5
const vec3 AQUA = vec3(0.608, 0.941, 0.882);      // #9BF0E1
const vec3 CITRIC = vec3(0.804, 0.961, 0.392);    // #CDF564
const vec3 TANGERINE = vec3(1.0, 0.275, 0.196);   // #FF4632

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

// Hue to a fully saturated colour, red at 0 through green and blue back to red.
vec3 spectrum(float h) {
  return clamp(abs(fract(h + vec3(0.0, 2.0 / 3.0, 1.0 / 3.0)) * 6.0 - 3.0) - 1.0, 0.0, 1.0);
}

// The disc's colours in spectral order, blue through green to tangerine, 0 to 1.
vec3 ramp(float s) {
  vec3 col = mix(BLUE, AQUA, smoothstep(0.0, 0.3, s));
  col = mix(col, GREEN, smoothstep(0.3, 0.5, s));
  col = mix(col, CITRIC, smoothstep(0.5, 0.7, s));
  return mix(col, TANGERINE, smoothstep(0.7, 1.0, s));
}

vec3 surface(vec2 frag) {
  vec2 p = (frag - uOrigin) / uScale;
  vec2 tilt = uTilt;
  float t = uTime;
  // Turning the disc rolls every hue on it and makes its light flare.
  float roll = (uSwing.x - uSwing.y) * 0.6;
  float flare = 1.0 + min(length(uSwing), 1.0) * 1.2;

  // A slow, low warp so the fold reads as fabric rather than a drawn curve.
  vec2 warp = vec2(noise(p * 0.9 + vec2(t * 0.05, 0.0)), noise(p * 0.9 + vec2(3.7, -t * 0.04))) - 0.5;
  vec2 q = p + warp * 0.22;
  // Lean the whole fold so its crest rises to the right.
  q = vec2(q.x * 0.95 + q.y * 0.31, q.y * 0.95 - q.x * 0.31);

  // The crest: one broad hump. Tilting sideways rolls it along; tilting up and down lifts it.
  float crest = 0.26 * sin(q.x * 1.5 + 0.4 - tilt.x * 0.9 + t * 0.06)
              + 0.06 * sin(q.x * 3.1 - 1.3 + tilt.x * 0.4 - t * 0.05)
              - tilt.y * 0.14 - 0.04;
  float d = q.y - crest; // above the crest is silver, below is the fold
  float depth = max(-d, 0.0);

  // Which colour the fold opens into: Klein blue on the left, tangerine on the right.
  // Tilting slides the colours across.
  float side = smoothstep(-0.95, 0.95, q.x + 0.25 * sin(q.y * 1.8 + t * 0.05) - tilt.x * 0.4 + depth * 0.25);
  const float reach = 0.72;

  // Silver: brightest where the light catches just above the crest.
  vec3 silver = mix(SILVER, WHITE, 0.3 + 0.7 * exp(-max(d, 0.0) * 2.4));
  // The sheen follows the tilt along the crest.
  float along = q.x - tilt.x * 1.5;
  float sheen = exp(-along * along * 1.4) * exp(-max(d, 0.0) * 3.0);
  silver = mix(silver, vec3(1.0), sheen * 0.7);
  // Far from the crest the silver picks up a little of the disc's colour.
  silver = mix(silver, ramp(side), smoothstep(0.25, 1.0, d) * 0.35 * reach);

  // The fold: green at its heart, opening with depth into the disc's colours.
  // It moves along the spectrum rather than blending across it, which would turn muddy.
  vec3 fold = ramp(mix(0.5, side, smoothstep(0.12, 0.6, depth) * reach));
  fold = mix(FOLD, fold, smoothstep(0.0, 0.16, depth));
  fold = mix(fold, WHITE, smoothstep(0.55, 1.4, depth) * 0.3);

  // One sharp edge, as in a fold of silk; everything else stays soft.
  float onSilver = smoothstep(-0.01, 0.01, d);
  vec3 col = mix(fold, silver, onSilver);

  // The disc's rainbow: a fan of spectral light from a point well off the
  // surface, so it crosses as a streak. Tilting turns the fan and rolls its hues.
  vec2 hub = vec2(-2.6, -2.2);
  vec2 r = q - hub;
  float angle = atan(r.y, r.x);
  // The fan sweeps towards the pointer, across its own direction.
  float aim = 0.62 - tilt.x * 0.25 - tilt.y * 0.17 + sin(t * 0.11) * 0.02;
  float across = (angle - aim) / 0.055;
  float streak = exp(-across * across) * smoothstep(2.0, 3.0, length(r));
  vec3 rainbow = spectrum(0.5 + across * 0.22 - tilt.y * 0.35 + roll);
  float amount = min(streak * 0.58 * flare, 0.9);
  // It tints the silver, and adds light over the fold (a screen) so the colours never go grey.
  vec3 tinted = mix(col, rainbow, amount);
  vec3 lit = 1.0 - (1.0 - col) * (1.0 - rainbow * amount);
  col = mix(lit, tinted, onSilver);

  // A thin fringe of the same spectrum riding the crest on the silver side.
  float fringe = smoothstep(0.0, 0.015, d) * exp(-d * 20.0) * exp(-along * along * 2.5);
  col = mix(col, spectrum(d * 12.0 - tilt.x * 0.8 + tilt.y * 0.4 + roll + 0.1), min(fringe * 0.48 * flare, 0.9));

  return col;
}

// A palette for the coarse dither stage, the disc's colours on silver.
vec3 brand(int i) {
  if (i == 0) return WHITE;
  if (i == 1) return SILVER;
  if (i == 2) return GREEN;
  if (i == 3) return FOLD;
  if (i == 4) return CITRIC;
  if (i == 5) return AQUA;
  if (i == 6) return TANGERINE;
  return BLUE;
}

// Ordered-dither threshold from an 8x8 Bayer matrix, 0 to 1.
float bayer2(vec2 a) {
  a = floor(a);
  return fract(dot(a, vec2(0.5, a.y * 0.75)));
}
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }
float bayer8(vec2 a) { return bayer4(0.5 * a) * 0.25 + bayer2(a); }

// Dither between the two nearest of the first `count` brand colours.
vec3 nearestTwo(vec3 col, float count, float threshold) {
  vec3 a = WHITE;
  vec3 b = WHITE;
  float da = 1e9;
  float db = 1e9;
  for (int i = 0; i < 8; i++) {
    if (float(i) >= count) break;
    vec3 c = brand(i);
    vec3 e = col - c;
    float dist = dot(e, e);
    if (dist < da) {
      b = a;
      db = da;
      a = c;
      da = dist;
    } else if (dist < db) {
      b = c;
      db = dist;
    }
  }
  vec3 ab = b - a;
  float f = clamp(dot(col - a, ab) / max(dot(ab, ab), 1e-5), 0.0, 1.0);
  return f > threshold ? b : a;
}

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

  vec3 col = surface(sampleAt);
  if (!dithered) {
    // A trace of noise keeps the long silver gradients from banding.
    col += (hash(frag) - 0.5) / 255.0;
  } else {
    float threshold = bayer8(cell);
    if (uMono > 0.5) {
      // Light catches as silver dots; the fold stays mostly dark.
      float light = smoothstep(0.5, 1.0, dot(col, vec3(0.299, 0.587, 0.114)));
      col = step(threshold, light) * WHITE;
    } else if (uSteps <= 8.5) {
      col = nearestTwo(col, uSteps, threshold);
    } else {
      // Finer stages quantise each channel, so the dither stays faithful to the colour.
      float levels = max(2.0, floor(pow(uSteps, 1.0 / 3.0) + 0.5) - 1.0);
      col = floor(col * levels + threshold) / levels;
    }
  }
  gl_FragColor = vec4(col * mask, mask);
}
