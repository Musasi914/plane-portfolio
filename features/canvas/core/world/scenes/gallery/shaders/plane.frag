uniform sampler2D uTexture;
uniform float uProgress;
uniform float uOpacity;

varying vec2 vUv;
void main() {
  vec4 texture = texture2D(uTexture, vUv);

  gl_FragColor = vec4(texture.rgb, uOpacity);

  #include <colorspace_fragment>
  #include <tonemapping_fragment>
}