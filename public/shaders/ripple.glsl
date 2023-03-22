// Adds a water ripple effect with a single drop to the image, simulating a reflection on a water surface

precision mediump float;

uniform float time;
uniform sampler2D u_image;
varying vec2 v_texCoord;

const float PI = 3.14159265359;

vec2 rippleDisplacement(vec2 uv, vec2 center, float frequency, float speed, float amplitude, float phase) {
    vec2 dir = uv - center;
    float dist = length(dir);
    float i = dist * frequency - time * speed + phase;
    float sinValue = sin(i);

    // Calculate the gradient of the ripple function
    vec2 gradient = dir * sinValue;

    // Normalize the gradient
    vec2 normalizedGradient = normalize(gradient);

    // Compute displacement vector based on the gradient and amplitude
    vec2 displacement = amplitude * sinValue * normalizedGradient * (0.5 - dist);

    return displacement;
}


float circleMask(vec2 uv) {
    vec2 center = vec2(0.5, 0.5);
    float radius = 0.5;
    float dist = distance(uv, center);
    return smoothstep(radius, radius - 0.01, dist);
}

void main() {
    vec2 uv = v_texCoord;
    vec2 center = vec2(0.5, 0.5);
    vec2 center2 = vec2(0.4, 0.4);
    float rippleSpeed = 5.0;
    float rippleFrequency = 25.0;
    float rippleAmplitude = 0.02;
    float rippleDuration = 2.0;

    float phase = 1.0;
    vec2 offset = rippleDisplacement(uv, center, rippleFrequency, rippleSpeed, rippleAmplitude, 0.0);
    offset += rippleDisplacement(uv, center2, rippleFrequency, rippleSpeed, rippleAmplitude, 0.4);
    vec4 color = texture2D(u_image, uv + offset) * 0.9;
    color = mix(color, color * color, length(offset) * length(offset) * 2000.0);

    float mask = circleMask(uv);

    gl_FragColor = color * mask;
}
