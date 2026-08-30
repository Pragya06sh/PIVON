uniform float uTime;
uniform float uScrollProgress; // 0..1 driven by GSAP/ScrollTrigger
uniform vec3 uColorDim;   // #8A6F3E
uniform vec3 uColorBright; // #E8C77E
uniform float uIntensity;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;

void main() {
  vec3 viewDir = normalize(vViewPosition);
  float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 2.2);

  // Slow brass shimmer traveling up the facade, independent of scroll
  float shimmer = sin(vUv.y * 12.0 - uTime * 0.6) * 0.5 + 0.5;

  // Scroll ties the bloom intensity to the flythrough so facades "wake up"
  // as the camera approaches them, rather than glowing uniformly at all times.
  float scrollBoost = smoothstep(0.0, 1.0, uScrollProgress);

  vec3 color = mix(uColorDim, uColorBright, shimmer * 0.6 + fresnel * 0.4);
  float alpha = fresnel * (0.35 + 0.65 * scrollBoost) * uIntensity;

  gl_FragColor = vec4(color, alpha);
}
