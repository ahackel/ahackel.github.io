precision mediump float;

uniform float time;
uniform sampler2D u_image;
varying vec2 v_texCoord;

float circleMask(vec2 uv) {
    vec2 center = vec2(0.5, 0.5);
    float radius = 0.5;
    float dist = distance(uv, center);
    return smoothstep(radius, radius - 0.01, dist);
}

void main() {
    float sinTime = 0.5 + 0.5 * sin(time);
    vec2 uv = v_texCoord;
    vec2 offset = vec2(0.05, 0.05) * sinTime;
    vec4 colorR = texture2D(u_image, uv + offset);
    vec4 colorG = texture2D(u_image, uv);
    vec4 colorB = texture2D(u_image, uv - offset);
    vec4 color = vec4(colorR.r, colorG.g, colorB.b, colorG.a);

    float mask = circleMask(uv);

    gl_FragColor = color * mask;  
}

