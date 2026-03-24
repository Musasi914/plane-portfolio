uniform sampler2D uEndTexture;
varying vec2 vUv;
varying vec2 vNormaluv;

void main() {
  vec3 baseColor = vec3(1.0);

  vec2 uv = vUv + vNormaluv;
  vec3 endTexture = texture2D(uEndTexture, uv).rgb;
  csm_DiffuseColor = vec4(mix(baseColor, endTexture, endTexture.r), 1.0);
}