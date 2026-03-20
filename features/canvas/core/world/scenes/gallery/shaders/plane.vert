uniform float uProgress;
uniform float uToDetail;

varying vec2 vUv;

vec2 random2(vec2 p) {
  return fract(sin(vec2(
    dot(p, vec2(127.1, 311.7)),
    dot(p, vec2(269.5, 183.3))
  )) * 43758.5453);
}

void main() {
  float progress = sin(uProgress * 3.14159265);
  
  vec3 newPosition = position;
  // vec2 transition = -vec2(position.x * 0.5, position.y * 0.2);
  // newPosition.xy += transition * progress;

  vec2 bulgePosition = uv - (uToDetail - 0.2);
  float bulge = progress * (1.0 - length(bulgePosition.xy));
  newPosition.z += bulge * 5.0;
  newPosition.y += bulge * 0.1 * (uToDetail * 2.0 - 1.0);
  newPosition.x += bulge * 0.1 * (uToDetail * 2.0 - 1.0);

  vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;
  gl_Position = projectedPosition;
  vUv = uv;
}