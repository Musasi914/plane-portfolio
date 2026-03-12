uniform sampler2D uTexActive;
uniform sampler2D uTexNext;
uniform float uProgress;

varying vec2 vUv;

void main() {
  vec4 texActive = texture2D(uTexActive, vUv);
  vec4 texNext = texture2D(uTexNext, vUv);
  gl_FragColor = mix(texActive, texNext, uProgress);
}
