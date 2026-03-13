uniform sampler2D uTexActive;
uniform sampler2D uTexNext;
uniform float uProgress;
uniform sampler2D uFluidVelocity;
varying vec2 vUv;

void main() {
  // uProgressが0.0の時0.0、 0.5の時1.0、 1.0の時0.0になる
  float transitionFactor = 1.0 - abs(uProgress * 2.0 - 1.0); 

  vec2 uv = vUv;
  vec2 p = 2.0 * uv - vec2(1.0);
  p += 0.2 * sin(uProgress / 80.0) * cos(vec2(2.0, 3.0) * p.yx + (1.0 - uProgress) + vec2(2.0, 3.0));
  p -= 0.2 * cos(uProgress / 80.0) * cos(vec2(0.6, 5.2) * p.yx + (1.0 - uProgress) * 1.5 + vec2(0.6, 5.2));
  p += 0.2 * sin(uProgress / 80.0) * cos(vec2(3.1, 2.4) * p.yx + (1.0 - uProgress) * 2.6 + vec2(3.1, 2.4));
  p += 0.2 * cos(vec2(5.4, 1.4) * p.yx + (1.0 - uProgress) * 3.8 + vec2(5.4, 1.4));
  
  uv.x = mix(uv.x, length(p), transitionFactor);
  uv.y = mix(uv.y, (1.0 - length(p)) * 1.1, transitionFactor);

  vec2 fluidVelocity = texture2D(uFluidVelocity, uv).xy;
  float fluidVelocityLen = length(fluidVelocity);

  float texActiveR = texture2D(uTexActive, uv + fluidVelocityLen * 0.01).r;
  float texActiveG = texture2D(uTexActive, uv + fluidVelocityLen * 0.03).g;
  float texActiveB = texture2D(uTexActive, uv + fluidVelocityLen * 0.05).b;
  vec4 texActive = vec4(texActiveR, texActiveG, texActiveB, 1.0);

  float texNextR = texture2D(uTexNext, uv + fluidVelocityLen * 0.01).r;
  float texNextG = texture2D(uTexNext, uv + fluidVelocityLen * 0.03).g;
  float texNextB = texture2D(uTexNext, uv + fluidVelocityLen * 0.05).b;
  vec4 texNext = vec4(texNextR, texNextG, texNextB, 1.0);

  gl_FragColor = mix(texActive, texNext, uProgress);
}
