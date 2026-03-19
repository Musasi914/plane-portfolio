uniform float uOpacity;
uniform float uProgress;
varying vec2 vUv;

void main() {
  gl_FragColor = vec4(0.5, 0.8 , 1.0, uOpacity);
}