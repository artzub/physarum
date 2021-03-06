precision mediump float;
// varying vec2 v_position;
uniform sampler2D u_tex_draw;
uniform vec2 u_resolution;
uniform float DECAY;
uniform float DIFFUSE_RADIUS;
#define DIFFUSE_RADIUS_MAX  10

void main() {
    vec4 val = vec4(0);

//     vec2 R = vec2(0, 1);
//     val += texture2D(u_tex_draw, gl_FragCoord.xy / u_resolution);
//     val += texture2D(u_tex_draw, fract((gl_FragCoord.xy + R.xy) / u_resolution)) / 2.;
//     val += texture2D(u_tex_draw, fract((gl_FragCoord.xy + R.yx) / u_resolution)) / 2.;
//     val += texture2D(u_tex_draw, fract((gl_FragCoord.xy - R.xy) / u_resolution)) / 2.;
//     val += texture2D(u_tex_draw, fract((gl_FragCoord.xy - R.yx) / u_resolution)) / 2.;
//     val /= 3.;
//    gl_FragColor = val * DECAY;

    float k_sum = 0.;
    for(int i = -DIFFUSE_RADIUS_MAX; i <= DIFFUSE_RADIUS_MAX; i++) {
        if(abs(float(i)) > DIFFUSE_RADIUS)
            continue;
        for(int j = -DIFFUSE_RADIUS_MAX; j <= DIFFUSE_RADIUS_MAX; j++) {
            if(abs(float(j)) > DIFFUSE_RADIUS)
                continue;
            vec2 ij = vec2(i, j);
            // float k = 1./(length(ij)+1.);
            float k = 1.;//(length(ij)+1.);
            val += k * texture2D(u_tex_draw, fract((gl_FragCoord.xy - ij) / u_resolution));
            k_sum += k;
        }
    }
    gl_FragColor = val / k_sum * DECAY;
    // gl_FragColor *= smoothstep(1., .9, length((gl_FragCoord.xy * 2. - u_resolution) / u_resolution));
}