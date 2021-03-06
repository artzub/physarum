precision mediump float;

varying vec2 v_position;
varying float v_id; // похоже, тут никак этого не получить. Разве что вычислять из координат пикселя. Но для этого надо знать разрешение текстуры.
// varying float v_mass;
uniform sampler2D u_tex_fbo;
uniform float u_time;
uniform float u_tick;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

mat2 rot(float a){float s=sin(a),c=cos(a);return mat2(c,-s,s,c);}

#pragma glslify: random = require(glsl-random)
float rnd(float x) {return random(vec2(x));}

// #pragma glslify: snoise3 = require(glsl-noise/simplex/3d)
// #pragma glslify: noise = require(glsl-noise/simplex/3d)
vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}
vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}
vec4 permute(vec4 x) {
  return mod289(((x * 34.0) + 1.0) * x);
}
vec4 taylorInvSqrt(vec4 r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}
float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

// First corner
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

// Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  //   x0 = x0 - 0.0 + 0.0 * C.xxx;
  //   x1 = x0 - i1  + 1.0 * C.xxx;
  //   x2 = x0 - i2  + 2.0 * C.xxx;
  //   x3 = x0 - 1.0 + 3.0 * C.xxx;
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
  vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

// Permutations
  i = mod289(i);
  vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));

// Gradients: 7x7 points over a square, mapped onto an octahedron.
// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
  float n_ = 0.142857142857; // 1.0/7.0
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);    // mod(j,N)

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

//Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

// Mix final noise value
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

void main() {
    // поскольку v_id получить не можем (тут нет айдишников вершин, вершин всего 4)
    // вычислим айдишник пикселя из его координат, зная разрешение
  float id = (floor(gl_FragCoord.x) + floor(gl_FragCoord.y) * u_resolution.y) * .0001;

    // vec2 pos;
    // pos.x = floor(rnd(id) * 2.) / 2.;
    // pos.y = floor(rnd(id + .01) * 2.) / 2.;
    // gl_FragColor = vec4(pos, 0, 0);
    // координаты нормально работают.

  vec4 particle = texture2D(u_tex_fbo, v_position);
  vec2 pos = particle.xy;
  vec2 vel = particle.zw;
  //   // хак! Массу высчитываем прямо тут
  //   float mass = rnd(length(v_position));

  // init
  // if(u_tick == 0. || rnd(floor(id * 1000000. + u_time)) < .01) {
  if(rnd(id + u_time) < .01) {
  // if(u_tick == 0.) {
    gl_FragColor.r = rnd(floor(id) * .1 + u_mouse.x) * 2. - 1.;
    gl_FragColor.g = rnd(floor(id) + .2 + u_mouse.y) * 2. - 1.;
    gl_FragColor.ba = vec2(.001,0) * rot(rnd(id * .01) * 2. * 3.1415);
  }

  // physics
  else {
    // // force
    // vel *= .999;
    // vel.x += .001 * snoise(vec3(pos * 1.1, u_time * .0));
    // vel.y += .001 * pow(snoise(vec3(pos, u_time) + 10.), 8.);
    // float angle = atan(pos.y, pos.x);
    // vel.y -= sin(angle) * .0001;

    // vec2 vecToMouse = pos - u_mouse;
    // vel -= 1./vecToMouse * .000001;

    // float n = snoise(vec3(angle, pos.x, u_time));
    // vel.x += .0001 * sin(angle) * n;
    // vel.y -= .0001 * cos(angle) * n;

    // // avoid center
    // // vec2 vecToCenter = pos-.5;
    // // vec2 repulsion = pow(1./vecToCenter, vec2(.5));
    // // vel -= repulsion * .0001;

    pos += vel;// / mass * .01;
    gl_FragColor = vec4(pos, vel);
  }
}