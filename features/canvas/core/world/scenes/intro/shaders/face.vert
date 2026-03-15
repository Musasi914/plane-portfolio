uniform sampler2D uFaceDisplacement;
uniform sampler2D uFaceSmileDisplacement;
uniform sampler2D uFluidVelocity;
uniform float uPlaneWidth;
uniform float uFaceScale;
varying vec2 vUv;
varying vec2 vScreenUv;

void main() {
  float faceDisplacement = texture2D(uFaceDisplacement, uv).r;
  float faceSmileDisplacement = texture2D(uFaceSmileDisplacement, uv).r;

  // undisplaced の位置でスクリーンUVを算出（流体サンプリング用）
  vec4 modelPosUndisplaced = modelMatrix * vec4(position, 1.0);
  vec4 clipPosUndisplaced = projectionMatrix * viewMatrix * modelPosUndisplaced;
  vec2 screenUv = (clipPosUndisplaced.xy / clipPosUndisplaced.w) * 0.5 + 0.5;

  // 流体に基づいて displacement をブレンド
  vec2 fluidVelocity = texture2D(uFluidVelocity, screenUv).xy;
  float fluidFactor = step(0.05, length(fluidVelocity));
  float blendedDisplacement = mix(faceDisplacement, faceSmileDisplacement, fluidFactor);

  // ブレンドした displacement を適用
  vec3 displacedPosition = position + normal * blendedDisplacement * uPlaneWidth * uFaceScale * 0.5; // 0.5は適当な調整

  // 通常の MVP 変換（displaced を反映）
  vec4 clipPosition = projectionMatrix * viewMatrix * modelMatrix * vec4(displacedPosition, 1.0);
  gl_Position = clipPosition;
  
  vUv = uv;
  vScreenUv = screenUv;
}