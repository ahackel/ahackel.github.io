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
    // halftone pattern effect from image texture
    float sinTime = 0.5 + 0.5 * sin(time * 1.1);
    float raster = 200.0;
    vec2 uv = v_texCoord;
    float PI2 = 6.28318530718;
    float pixelCount = 512.0; // raster / PI2;
    vec2 texUv = floor(v_texCoord * pixelCount) / pixelCount;
    vec4 tex = texture2D(u_image, texUv);
    vec2 s = sin(uv * raster + time * 10.0);
    float r = 0.5 + 0.25 * (s.x * s.y);
    float value = smoothstep(r - 0.1, r + 0.1, tex.x);
    float mask = circleMask(uv);
    vec4 color = vec4(value, value, value, 1.0);
    color *= mask;
    
    gl_FragColor = color;  
}

