uniform sampler2D heightmap;
uniform float uDivides;
uniform float uWidth;
varying vec2 vUv;
varying vec2 vNormaluv;

void main() {
  vec2 cellSize = vec2(1.0 / uDivides);
  float heightValue = texture2D(heightmap, uv).x;
  csm_Position = vec3(position.x, position.y, heightValue);

  float xDiff =
    texture2D(heightmap, uv + vec2(-cellSize.x, 0.0)).x -
    texture2D(heightmap, uv + vec2(cellSize.x, 0.0)).x;
  
  float yDiff =
    texture2D(heightmap, uv + vec2(0.0, -cellSize.y)).x -
    texture2D(heightmap, uv + vec2(0.0, cellSize.y)).x;
  
  // ざっくり「傾き」= (高さ差) / (ワールド1単位あたりのテクセル数)
  float slopeScale = uDivides / uWidth;
  csm_Normal = vec3(xDiff * slopeScale, yDiff * slopeScale, 1.0);

  vUv = uv;
  vNormaluv = csm_Normal.xy;
}