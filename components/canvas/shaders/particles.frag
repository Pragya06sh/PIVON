uniform vec3 uColor;

void main() {
  vec2 center = gl_PointCoord - 0.5;
  float dist = length(center);
  float alpha = smoothstep(0.5, 0.0, dist);
  gl_FragColor = vec4(uColor, alpha * 0.55);
}
