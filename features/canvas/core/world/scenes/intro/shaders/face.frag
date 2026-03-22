uniform sampler2D uFace;
uniform sampler2D uFaceSmile;
uniform sampler2D uFluidVelocity;
uniform float uSwitchProgress;

varying vec2 vUv;
varying vec2 vScreenUv;

void main() {
  vec4 faceColor = texture2D(uFace, vUv);
  vec4 faceSmileColor = texture2D(uFaceSmile, vUv);
  vec2 fluidVelocity = texture2D(uFluidVelocity, vScreenUv).xy;

  // uSwitchProgressによって常に表示しているテクスチャとfluidで表示するテクスチャを変える。
  vec4 color = mix(mix(faceColor, faceSmileColor, uSwitchProgress), mix(faceSmileColor, faceColor, uSwitchProgress), step(0.05, length(fluidVelocity)));
  
  gl_FragColor = vec4(color.rgb + 0.1 * (1.0 - color.rgb), color.a);
}