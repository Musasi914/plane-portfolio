attribute vec3 aRandom;

uniform float uTime;
uniform float uResolutionY;
uniform float uPointSize;
uniform float uProgress;
uniform float uMaxDepth;

varying float vAlpha;

#define PI 3.1415926535897932384626433832795

// Simplex 4D Noise
// by Ian McEwan, Ashima Arts
// [-1,1]
vec4 permute(vec4 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}
vec4 taylorInvSqrt(vec4 r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}
float simplexNoise3d(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  // First corner
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  // Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  //  x0 = x0 - 0. + 0.0 * C 
  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

  // Permutations
  i = mod(i, 289.0);
  vec4 p = permute(
    permute(
      permute(i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0)
    )
    + i.x + vec4(0.0, i1.x, i2.x, 1.0)
  );

  // Gradients
  // ( N*N points uniformly over a square, mapped onto an octahedron.)
  float n_ = 1.0 / 7.0; // N=7
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z); //  mod(p,N*N)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_); // mod(j,N)

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  // Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  // Mix final noise value
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
// Simplex Noise End

float calcNoise(vec3 position) {
  float noise = simplexNoise3d(vec3(position.yx, position.z * 0.2 + uTime * 0.2));
  noise = noise * 0.5 + 0.5;
  noise = smoothstep(0.4, 1.0, noise);

  // 後半はnoiseを小さく
  noise = mix(noise, 1.0, uProgress);
  
  return noise;
}

vec2 calcRandomOffset(float strength) {
  float offsetDirection = aRandom.x * 2.0 * PI;
  float s = sin(offsetDirection) * strength;
  float c = cos(offsetDirection) * strength;
  return vec2(s, c);
}

const float fogNear = 10.0;
const float fogFar = 1000.0;

void main() {
  vec3 newPosition = position;

  float noise = calcNoise(newPosition * 0.003);

  // 進行度に応じてzを移動
  newPosition.z *= mix(0.0, 1.0, uProgress);

  // 進行度が進むとノイズではなく時間でアニメーション　中くらいのパーティクルが、たまにサイズが0になるような 
  float size = mix(1.0, 0.15, uProgress);
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
  float alpha = 1.0 - (-position.z / uMaxDepth);
  alpha = smoothstep(mix(0.9, 0.0, uProgress), 1.0, alpha);

  // alphaは今後ろ側が小さい値のまま。 進行度が進むとalphaをfogにしたい。
  float cameraZ = length(viewPosition.xyz);
  float fog = clamp((fogFar - cameraZ) / (fogFar - fogNear), 0.0, 1.0);

  vAlpha = mix(alpha, fog, smoothstep(0.0, 0.6, uProgress));
}