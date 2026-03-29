uniform float uProgress;
// -1 or 1
uniform float uSign;
uniform vec2 uOffset;

varying vec2 vUv;

void main() {
  float progress = sin(uProgress * 3.14159265);
  
  vec3 newPosition = position;

  vec2 bulgePosition = uv - uOffset;
  float bulge = progress * (1.0 - length(bulgePosition.xy));
  newPosition.z += bulge * 5.0;
  newPosition.y += bulge * 0.1 * uSign;
  newPosition.x += bulge * 0.1 * uSign;

  vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;
  gl_Position = projectedPosition;
  vUv = uv;
}