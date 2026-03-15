uniform sampler2D uTexture;
uniform float uTime;
uniform float uProgress;

varying vec2 vUv;
varying vec3 vWorldPosition;

void main() {
  float noise = calcNoise(vWorldPosition * 0.003, uTime, uProgress);

  vec4 texture = texture2D(uTexture, vUv);
  vec4 textureColorReverse = vec4(1.0 - texture.r, 1.0 - texture.g, 1.0 - texture.b, texture.a);
  gl_FragColor = mix(textureColorReverse, texture, noise);
}