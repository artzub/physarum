#version 300 es
precision mediump float;
in vec2 uv;
uniform vec2 u_resolution;
uniform sampler2D prevStateCells;
#define rnd(x) fract(54321.987 * sin(987.12345 * x))
out vec4 outColor;

void main() {
  outColor = vec4(1,0,1,1);
  // outColor = texture(prevStateCells, uv);
  // outColor.rgb *= mat3(0, .4, 0, 0, .92, .7 ,1,.0,1);
}