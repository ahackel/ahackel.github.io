precision mediump float;

uniform float time;
uniform sampler2D u_image;
varying vec2 v_texCoord;

void main() {
    float pixelCount = 10.0 + 40.0 * (0.5 + 0.5 * sin(time * 0.01));
    vec2 uv = floor(v_texCoord * pixelCount) / pixelCount;
    vec4 color = texture2D(u_image, uv);
    
    // calculate a circle mask
    vec2 center = vec2(0.5, 0.5);
    float radius = 0.5;
    float dist = distance(uv, center);
    float alpha = smoothstep(radius, radius - 0.01, dist);
    color.a *= alpha;
    
    gl_FragColor = color;  
}

