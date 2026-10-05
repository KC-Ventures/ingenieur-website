#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

// A diffraction grating, like the data side of a CD. Light hitting the
// concentric grooves splits into colour bands that line up with the light's
// direction through the centre, and sweep as the light moves.

uniform vec2 uResolution;  // device pixels
uniform sampler2D uMask;   // where the material is (alpha)
uniform vec2 uCenter;      // centre of the grooves, device pixels, y up
uniform vec3 uLight;       // light position; z is height above the surface
uniform vec3 uEye;         // viewer position
uniform float uPitch;      // groove spacing, nm per unit of half-vector
uniform float uSpread;     // angular width of the colour bands
uniform float uSilver;     // 0 = black foil, 1 = silver foil
uniform float uSheen;      // strength of the broad conic iridescence
uniform float uPalette;    // 0 = physical spectrum, 1 = the curated CD palette
uniform float uBevel;      // strength of the lit edge around the mask
uniform float uPixel;      // one CSS pixel in device pixels
uniform float uCycles;     // colour cycles per turn of the sheen; keep it a whole number
uniform vec3 uBase;        // metal brightness at the top, the horizon band, and the bottom
uniform float uHorizon;    // where the horizon band sits, 0 (top) to 1 (bottom)
uniform float uRainbow;    // strength of the diffraction bands

// Alan Zucconi's six-bump fit of the visible spectrum.
vec3 bump3(vec3 x, vec3 yoffset) {
  vec3 y = vec3(1.0) - x * x;
  return clamp(y - yoffset, 0.0, 1.0);
}

vec3 physical(float t) {
  const vec3 c1 = vec3(3.54585104, 2.93225262, 2.41593945);
  const vec3 x1 = vec3(0.69549072, 0.49228336, 0.27699880);
  const vec3 y1 = vec3(0.02312639, 0.15225084, 0.52607955);
  const vec3 c2 = vec3(3.90307140, 3.21182957, 3.96587128);
  const vec3 x2 = vec3(0.11748627, 0.86755042, 0.66077860);
  const vec3 y2 = vec3(0.84897130, 0.88445281, 0.73949448);
  return bump3(c1 * (t - x1), y1) + bump3(c2 * (t - x2), y2);
}

// Violet, cyan, a wide vibrant green, lime, pink.
vec3 curated(float t) {
  vec3 col = mix(vec3(0.52, 0.38, 1.00), vec3(0.15, 0.80, 1.00), smoothstep(0.00, 0.20, t));
  col = mix(col, vec3(0.05, 1.00, 0.52), smoothstep(0.20, 0.36, t));
  col = mix(col, vec3(0.86, 1.00, 0.30), smoothstep(0.56, 0.70, t));
  col = mix(col, vec3(1.00, 0.36, 0.80), smoothstep(0.74, 0.92, t));
  return col;
}

vec3 spectrum(float lambda) {
  float t = clamp((lambda - 400.0) / 300.0, 0.0, 1.0);
  vec3 col = mix(physical(t), curated(t), uPalette);
  // Fade out past the ends of the visible range instead of clamping to a colour.
  return col * smoothstep(340.0, 440.0, lambda) * (1.0 - smoothstep(660.0, 760.0, lambda));
}

float maskAt(vec2 frag) {
  return texture2D(uMask, frag / uResolution).a;
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  float mask = maskAt(frag);
  if (mask < 0.002) {
    gl_FragColor = vec4(0.0);
    return;
  }

  // Treat the mask's soft edge as a bevel so the shape catches light at its rim.
  float d = 1.5 * uPixel;
  vec2 slope = vec2(maskAt(frag + vec2(d, 0.0)) - maskAt(frag - vec2(d, 0.0)),
                    maskAt(frag + vec2(0.0, d)) - maskAt(frag - vec2(0.0, d)));
  vec3 n = normalize(vec3(-slope * uBevel, 1.0));

  vec3 P = vec3(frag, 0.0);
  vec3 L = normalize(uLight - P);
  vec3 V = normalize(uEye - P);
  vec3 H = L + V;

  vec2 radial = frag - uCenter;
  vec2 across = radial / max(length(radial), 1e-3); // perpendicular to the grooves
  vec2 along = vec2(-across.y, across.x);           // along the grooves

  float u = dot(H.xy, across);
  float w = dot(H.xy, along);

  // Light only diffracts toward the eye where the half-vector lies across the grooves.
  float band = exp(-(w * w) / (uSpread * uSpread));

  vec3 rainbow = spectrum(uPitch * abs(u)) + 0.55 * spectrum(uPitch * abs(u) * 0.5);
  rainbow *= band;

  // Broad conic iridescence, the "CD gradient" seen away from the bands. A whole
  // number of colour cycles per turn keeps it seamless all the way round.
  float turns = atan(radial.y, radial.x) / 6.2831853;
  float drift = dot(L.xy, vec2(1.2, 0.8));
  vec3 sheen = curated(fract(turns * uCycles + drift));

  // Neutral metal: bright above, a dark horizon band, a mid tone below, like
  // polished chrome reflecting a room. uSilver scales it from black to bright.
  float vertical = 1.0 - frag.y / uResolution.y; // 0 at the top
  float metal = mix(uBase.x, uBase.y, smoothstep(0.0, uHorizon, vertical));
  metal = mix(metal, uBase.z, smoothstep(uHorizon, 1.0, vertical));
  vec3 base = vec3(metal) * uSilver;

  // The sheen tints the metal; the diffraction bands are added as clean, bright colour.
  base = mix(base, base * (0.4 + 0.8 * sheen), uSheen);
  vec3 col = base + rainbow * uRainbow * (1.0 - 0.45 * base);

  // Rim light from the bevel, and a mirror glint where the light reflects straight back.
  float rim = pow(max(dot(reflect(-L, n), V), 0.0), 12.0) * (1.0 - n.z) * 40.0;
  float glint = exp(-dot(H.xy, H.xy) / 0.004);
  col += vec3(rim + glint * 0.8);

  col = 1.0 - exp(-col * 1.4);
  gl_FragColor = vec4(col * mask, mask);
}
