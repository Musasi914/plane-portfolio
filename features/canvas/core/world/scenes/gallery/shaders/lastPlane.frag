uniform float uOpacity;
uniform sampler2D uEndTexture;

varying vec2 vUv;

void main() {
  gl_FragColor = vec4(texture2D(uEndTexture, vUv).rgb, uOpacity);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}