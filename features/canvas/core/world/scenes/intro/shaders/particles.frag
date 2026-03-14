varying float vAlpha;

void main() {
  float alpha = vAlpha;

  if(alpha == 0.0) discard;

  gl_FragColor = vec4(vec3(0.3), alpha);
}
