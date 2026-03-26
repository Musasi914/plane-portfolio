// NOTE: `heightmap`, `resolution` are injected

#define PI 3.14159265359

uniform vec2 uPointer;
uniform vec2 uPointerPrev;

float distanceToLineSegment(vec2 point, vec2 lineStart, vec2 lineEnd) {
  vec2 prevToCurrent = lineEnd - lineStart;
  float lineLength = length(prevToCurrent);
  if(lineLength > 100.0) return PI / 2.0;
  if(lineLength < 0.001) return PI / 2.0;
  vec2 prevToUv = point - lineStart;
  float t = clamp(dot(prevToCurrent, prevToUv) / pow(lineLength, 2.0), 0.0, 1.0);
  vec2 linePointPos = lineStart + prevToCurrent * t;
  return clamp(length(point - linePointPos) * PI * 10.0, 0.0, PI / 2.0);
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 heightmapValue = texture2D(heightmap, uv);
  float currentHeight = heightmapValue.x;
  float prevHeight = heightmapValue.y;

  vec2 cellSize = 1.0 / resolution.xy;

  // next = 左右平均 - prev;
  float average = (
    texture2D(heightmap, uv + vec2(cellSize.x * 2.0, 0.0)) +
    texture2D(heightmap, uv + vec2(-cellSize.x * 2.0, 0.0)) +
    texture2D(heightmap, uv + vec2(0.0, cellSize.y * 2.0)) +
    texture2D(heightmap, uv + vec2(0.0, -cellSize.y * 2.0))
  ).x / 4.0;
  float nextHeight = average - prevHeight;
  nextHeight *= 0.9;

  // line
  float lineDistance = distanceToLineSegment(uv, uPointerPrev, uPointer);
  nextHeight -= cos(lineDistance) * 0.05;

  // mouse
  float mousePhase = clamp(length(uv - uPointer) * PI * 10.0, 0.0, PI / 2.0);
  nextHeight -= cos(mousePhase) * 0.05;

  heightmapValue.y = currentHeight;
  heightmapValue.x = nextHeight;
  
  gl_FragColor = heightmapValue;
}