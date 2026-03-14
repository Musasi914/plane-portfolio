attribute vec3 aRandom;

uniform float uTime;
uniform float uResolutionY;
uniform float uPointSize;
uniform float uProgress;
uniform float uMaxDepth;
uniform float uGridSize;
uniform float uDepthPerLayer;

varying float vAlpha;

#define PI 3.1415926535897932384626433832795

vec2 calcRandomOffset(float strength) {
  float offsetDirection = aRandom.x * 2.0 * PI;
  float s = sin(offsetDirection) * strength;
  float c = cos(offsetDirection) * strength;
  return vec2(s, c);
}

const float fogNear = 10.0;
const float fogFar = 1000.0;

void main() {
  vec3 worldPosition = position * vec3(uGridSize, uGridSize, uDepthPerLayer);
  vec3 newPosition = worldPosition;

  float noise = calcNoise(newPosition * 0.003, uTime, uProgress);

  // 進行度に応じてzを移動
  newPosition.z *= mix(0.0, 1.0, uProgress);

  float progressTwice = pow(uProgress, 2.0);

  // 進行度が進むとノイズではなく時間でアニメーション　中くらいのパーティクルが、たまにサイズが0になるような 
  float size = mix(1.0, 0.15, progressTwice);
  size = mix(size, 0.0, smoothstep(0.5, 1.0, cos(aRandom.z * 2.0 * PI + uTime) * uProgress));

  // 進行度が進むとxy方向にランダムに移動
  newPosition.xy += calcRandomOffset(smoothstep(0.6, 1.0, uProgress) * uPointSize);

  // 進行度が進むと見えている量を減らす
  float visibleAmount = step(0.8, aRandom.y);
  visibleAmount = mix(1.0, visibleAmount, uProgress);
  
  vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;

  gl_Position = projectedPosition;
  gl_PointSize = uPointSize * uResolutionY * noise * size;
  gl_PointSize *= visibleAmount;
  gl_PointSize *= (1.0 / -viewPosition.z);

  // 進行度が０のときは手前側しか表示しない
  // 手前を1 奥を0
  float alpha = 1.0 - (-worldPosition.z / uMaxDepth);
  alpha = smoothstep(mix(0.9, 0.0, uProgress), 1.0, alpha);

  // alphaは今後ろ側が小さい値のまま。 進行度が進むとalphaをfogにしたい。
  float cameraZ = length(viewPosition.xyz);
  float fog = clamp((fogFar - cameraZ) / (fogFar - fogNear), 0.0, 1.0);

  vAlpha = mix(alpha, fog, smoothstep(0.0, 0.6, uProgress));
}