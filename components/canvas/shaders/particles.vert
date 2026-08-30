uniform float uTime;
uniform float uPixelRatio;
attribute float aScale;
attribute float aSpeed;

void main() {
  vec3 pos = position;
  pos.y += sin(uTime * aSpeed + position.x * 2.0) * 0.15;
  pos.x += cos(uTime * aSpeed * 0.8 + position.z * 2.0) * 0.1;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  gl_PointSize = aScale * uPixelRatio * (300.0 / -mvPosition.z);
}
