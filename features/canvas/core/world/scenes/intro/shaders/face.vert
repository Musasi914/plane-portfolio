uniform sampler2D uFaceDisplacement;
uniform sampler2D uFaceSmileDisplacement;
uniform sampler2D uFluidVelocity;
varying vec2 vUv;
varying vec2 vScreenUv;

void main() {
  float faceDisplacement = texture2D(uFaceDisplacement, uv).r;
  float faceSmileDisplacement = texture2D(uFaceSmileDisplacement, uv).r;

  // 1. undisplaced の位置でスクリーンUVを算出（流体サンプリング用）
  vec4 modelPosUndisplaced = modelMatrix * vec4(position, 1.0);
  vec4 clipPosUndisplaced = projectionMatrix * viewMatrix * modelPosUndisplaced;
  vec2 screenUv = (clipPosUndisplaced.xy / clipPosUndisplaced.w) * 0.5 + 0.5;

  // 2. 流体に基づいて displacement をブレンド
  vec2 fluidVelocity = texture2D(uFluidVelocity, screenUv).xy;
  float fluidFactor = smoothstep(0.01, 0.1, length(fluidVelocity));
  float blendedDisplacement = mix(faceDisplacement, faceSmileDisplacement, fluidFactor);

  // 3. ブレンドした displacement を適用
  vec3 displacedPosition = position + normal * blendedDisplacement * 200.0;

  // 4. 通常の MVP 変換（displaced を反映）
  vec4 clipPosition = projectionMatrix * viewMatrix * modelMatrix * vec4(displacedPosition, 1.0);
  gl_Position = clipPosition;
  vUv = uv;
  vScreenUv = screenUv;
}