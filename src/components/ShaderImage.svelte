<script lang="ts">
    import {afterUpdate, beforeUpdate, onMount} from 'svelte';
    export let src: string;
    export let shaderUrl: string;

    let canvas: HTMLCanvasElement;
    let shader: string;

  beforeUpdate(async () => {
    if (shaderUrl) {
      const response = await fetch(shaderUrl);
      const newShader = await response.text();
      console.log(`Loaded shader: ${shaderUrl}`)
      updateCanvas(newShader);
    } else {
      updateCanvas("");
    }
  });
  
  function updateCanvas(fragmentShader: string)
  {
      if (fragmentShader === shader)
        return;
      
      shader = fragmentShader;
      
      // Get canvas and WebGL context
      let gl = canvas.getContext("webgl", { premultipliedAlpha: true });
      if (!gl)
        throw new Error("WebGL not supported");

      // Set canvas size
      canvas.width = 512;
      canvas.height = 512;

      // Vertex shader source
      var vertexShaderSource = `
attribute vec4 a_position;
attribute vec2 a_texCoord;

varying vec2 v_texCoord;

void main() {
  gl_Position = a_position;
  v_texCoord = a_texCoord;
}
`;

      // Fragment shader source
      var fragmentShaderSource = fragmentShader || `
precision mediump float;

uniform sampler2D u_image;
varying vec2 v_texCoord;

void main() {
    vec4 color = texture2D(u_image, v_texCoord);
    gl_FragColor = color;  
}
`;

      // Create, compile, and attach the shaders
      function createShader(gl, type, source) {
        var shader = gl.createShader(type);
        if (!shader)
          throw new Error("Shader not created");
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        return shader;
      }

      var vertexShader = createShader(
        gl,
        gl.VERTEX_SHADER,
        vertexShaderSource
      );
      var fragmentShader = createShader(
        gl,
        gl.FRAGMENT_SHADER,
        fragmentShaderSource
      );

      var program = gl.createProgram();
      if (!program)
        throw new Error("Program not created");
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      gl.useProgram(program);

      // Set up vertex data (positions and texture coordinates)
      var vertices = new Float32Array([
        -1, -1, 0, 1, 1, -1, 1, 1, -1, 1, 0, 0, 1, 1, 1, 0,
      ]);

      var vertexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

      var a_position = gl.getAttribLocation(program, "a_position");
      gl.enableVertexAttribArray(a_position);
      gl.vertexAttribPointer(
        a_position,
        2,
        gl.FLOAT,
        false,
        4 * Float32Array.BYTES_PER_ELEMENT,
        0
      );

      var a_texCoord = gl.getAttribLocation(program, "a_texCoord");
      gl.enableVertexAttribArray(a_texCoord);
      gl.vertexAttribPointer(
        a_texCoord,
        2,
        gl.FLOAT,
        false,
        4 * Float32Array.BYTES_PER_ELEMENT,
        2 * Float32Array.BYTES_PER_ELEMENT
      );

      // Create and load the texture
      var image = new Image();
      image.src = src;
      image.onload = () => {
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          image
        );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        // Set texture uniform
        var u_image = gl.getUniformLocation(program, "u_image");
        gl.uniform1i(u_image, 0);

        requestAnimationFrame(render);
      };

      var timeLocation = gl.getUniformLocation(program, "time");

      function render(time){
        gl.uniform1f(timeLocation, time * 0.001);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        requestAnimationFrame(render);  
      }

      // Error handling
      if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(vertexShader));
      }

      if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(fragmentShader));
      }

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
      }
    }
</script>

<canvas bind:this={canvas} on:click />

<style is:global>
  canvas {
      width: 20rem;
      margin: 0 auto;
      display: block;
      /*border-radius: 100%;*/
  }
</style>
