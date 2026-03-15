uniform sampler2D uFace;
uniform sampler2D uFaceSmile;
uniform sampler2D uFluidVelocity;

varying vec2 vUv;
varying vec2 vScreenUv;

void main() {
  vec4 faceColor = texture2D(uFace, vUv);
  vec4 faceSmileColor = texture2D(uFaceSmile, vUv);
  vec2 fluidVelocity = texture2D(uFluidVelocity, vScreenUv).xy;

  vec4 color = mix(faceColor, faceSmileColor, step(0.05, length(fluidVelocity)));
  
  gl_FragColor = color;
}