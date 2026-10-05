#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 uResolution;
uniform float uTime;
uniform float uScroll;   // surface offset, in units of half the viewport height
uniform vec2 uPointer;   // smoothed pointer, -1..1
uniform float uExposure; // how bright the room is, 0..1
uniform float uReveal;   // seconds since the lights started coming on

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

mat2 rotate(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat2(c, s, -s, c);
}

float easeOutExpo(float x) {
  return x >= 1.0 ? 1.0 : 1.0 - pow(2.0, -10.0 * x);
}

float luminance(vec3 c) {
  return dot(c, vec3(0.2126, 0.7152, 0.0722));
}

// Slope of the sculpted surface. Long swells give the reflections somewhere
// to flow, and periodic feature lines split them cleanly. Analytic, so it
// stays smooth at mediump.
vec2 surfaceGradient(vec2 s) {
  float a = 1.45 * s.y + 0.45 * sin(0.55 * s.x + 1.3);
  float b = 0.75 * s.x - 0.45 * s.y + 0.8;
  vec2 grad = 0.17 * cos(a) * vec2(0.45 * 0.55 * cos(0.55 * s.x + 1.3), 1.45);
  grad += 0.09 * cos(b) * vec2(0.75, -0.45);

  // Feature lines: a crisp ridge every 2W units, blended back to flat between.
  const float W = 1.35;
  float g = s.y + 0.24 * s.x + 0.10 * sin(1.3 * s.x);
  float d = (fract(g / (2.0 * W) + 0.2) - 0.5) * 2.0 * W;
  float ridge = 0.075 * (d / W - d / sqrt(d * d + 0.0008));
  grad += ridge * vec2(0.24 + 0.13 * cos(1.3 * s.x), 1.0);
  return grad;
}

// Signed-distance rectangle in (azimuth, elevation) space with a soft edge.
float box(vec2 a, vec2 center, vec2 halfSize, float blur) {
  vec2 q = abs(a - center) - halfSize;
  float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
  float soft = 0.004 + blur;
  return 1.0 - smoothstep(-soft, soft, d);
}

// A horizontal light strip that draws itself from x0 towards x1 as grow goes
// 0 to 1. Its far ends fade out, like a tube light seen along its length.
float strip(vec2 a, float x0, float x1, float y, float halfHeight, float grow, float blur) {
  if (grow <= 0.0) return 0.0;
  float end = mix(x0, x1, grow);
  vec2 center = vec2(0.5 * (x0 + end), y);
  vec2 halfSize = vec2(0.5 * abs(end - x0), halfHeight);
  float t = clamp((a.x - x0) / (x1 - x0), 0.0, 1.0);
  float fade = smoothstep(0.0, 0.22, t) * smoothstep(1.0, 0.7, t);
  return box(a, center, halfSize, blur) * mix(1.0, fade, grow);
}

float growAt(float delay, float duration) {
  return easeOutExpo(clamp((uReveal - delay) / duration, 0.0, 1.0));
}

// The room the surface reflects: dark, with a few long softboxes at the given brightness.
vec3 studio(vec3 r, float blur, float level) {
  vec2 a = vec2(atan(r.x, r.z), asin(clamp(r.y, -1.0, 1.0)));
  float room = smoothstep(0.0, 1.6, uReveal);
  vec3 col = (vec3(0.002, 0.004, 0.003) + vec3(0.010, 0.016, 0.013) * smoothstep(-0.3, 1.0, r.y)) * room;

  float lights = 0.0;
  lights += 3.2 * strip(a, -1.05, 0.95, 0.34, 0.018, growAt(0.15, 1.1), blur);
  lights += 1.8 * strip(a, 0.85, -0.35, 0.11, 0.032, growAt(0.40, 1.1), blur);
  lights += 2.4 * strip(a, -0.80, 0.05, -0.12, 0.010, growAt(0.62, 1.0), blur);
  lights += 1.3 * box(a, vec2(0.66, 0.02), vec2(0.022, 0.42), blur) * growAt(0.95, 0.9);
  // A wide, dim bounce from below so the lower surface still has a gradient.
  lights += 0.06 * box(a, vec2(0.1, -0.42), vec2(1.3, 0.06), blur + 0.12) * growAt(1.1, 1.4);

  return col + vec3(1.0, 1.0, 0.98) * lights * level;
}

void main() {
  vec2 p = (2.0 * gl_FragCoord.xy - uResolution) / uResolution.y;
  vec2 s = vec2(p.x, p.y - uScroll);

  vec3 n = normalize(vec3(-surfaceGradient(s), 1.0));
  vec3 view = normalize(vec3(p * 0.35, -1.0));

  mat2 yaw = rotate(uPointer.x * 0.20 + 0.07 * sin(uTime * 0.11));
  mat2 pitch = rotate(uPointer.y * 0.10 + 0.035 * sin(uTime * 0.07 + 1.0));

  vec3 r = reflect(view, n);
  r.xz = yaw * r.xz;
  r.yz = pitch * r.yz;

  float facing = clamp(dot(n, -view), 0.0, 1.0);
  float fresnel = 0.04 + 0.96 * pow(1.0 - facing, 5.0);

  vec3 lacquer = vec3(0.0012, 0.013, 0.008);
  vec3 flakeTint = vec3(0.10, 0.62, 0.36);

  // As the room dims, the white reflections go first and the green glow lingers,
  // so reading sections sit on deep green rather than grey haze.
  float coatLevel = uExposure * uExposure * uExposure;
  float glowLevel = mix(0.18, 1.0, uExposure);

  // Base coat: deep green that picks up a broad, blurred version of the lights.
  float room = smoothstep(0.0, 1.8, uReveal);
  vec3 col = lacquer * (0.35 + 0.65 * (n.y * 0.5 + 0.5)) * mix(0.45, 1.0, uExposure) * room;
  col += studio(r, 0.14, glowLevel) * flakeTint * 0.16;

  // Metallic flake: sparse, slightly tilted cells that only glint right next to a light.
  vec2 cell = floor(s * 320.0);
  float pick = step(0.975, hash12(cell));
  vec3 fn = normalize(n + 0.12 * vec3(hash12(cell + 7.13) - 0.5, hash12(cell + 3.71) - 0.5, 0.0));
  vec3 fr = reflect(view, fn);
  fr.xz = yaw * fr.xz;
  fr.yz = pitch * fr.yz;
  col += flakeTint * pick * luminance(studio(fr, 0.01, coatLevel)) * 0.09;

  // Clear coat: a sharp, colourless reflection on top.
  col += studio(r, 0.0, coatLevel) * mix(0.32, 1.0, fresnel);

  col *= 1.0 - 0.5 * smoothstep(0.5, 2.1, length(p * vec2(0.7, 1.0)));

  col = 1.0 - exp(-col * 1.5);
  col = pow(col, vec3(1.0 / 2.2));
  col += (hash12(gl_FragCoord.xy + fract(uTime) * 61.0) - 0.5) / 255.0;

  gl_FragColor = vec4(col, 1.0);
}
