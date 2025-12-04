import { createShader, createProgram } from './utils.js';

export function createCyberGridBackground() {
    const background = document.getElementById('vanta-background');
    const canvas = document.createElement('canvas');
    canvas.id = 'grid-canvas';
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '0';
    background.innerHTML = ''; // Clear previous
    background.appendChild(canvas);

    const gl = canvas.getContext('webgl');
    if (!gl) return;

    // Enable standard derivatives extension for fwidth
    gl.getExtension('OES_standard_derivatives');

    const vertexShaderSource = `
    attribute vec2 a_position;
    void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
    }
    `;

    const fragmentShaderSource = `
    #extension GL_OES_standard_derivatives : enable
    precision mediump float;
    uniform vec2 iResolution;
    uniform float iTime;

    void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * iResolution.xy) / iResolution.y;
        
        // Camera movement
        float speed = 0.5;
        float time = iTime * speed;
        
        // 3D Projection
        vec3 ro = vec3(0.0, 1.0, -time); // Ray origin
        vec3 rd = normalize(vec3(uv.x, uv.y - 0.2, -1.0)); // Ray direction (tilted down)
        
        // Ground Plane Intersection
        float t = -ro.y / rd.y;
        
        vec3 col = vec3(0.0);
        
        if (t > 0.0) {
            vec3 pos = ro + t * rd;
            
            // Grid Logic
            vec2 grid = abs(fract(pos.xz) - 0.5) / fwidth(pos.xz);
            float line = min(grid.x, grid.y);
            
            // Fade out lines in distance
            float fade = exp(-t * 0.2);
            
            // Grid Color (Neon Pink/Purple)
            vec3 gridColor = vec3(1.0, 0.0, 1.0);
            
            // Add glow to lines - Thicker lines (1.5px radius) to prevent flickering
            float glow = 1.0 - smoothstep(0.0, 1.5, line);
            
            col += gridColor * glow * fade;
            
            // Floor gradient (deep purple)
            col += vec3(0.1, 0.0, 0.2) * fade * 0.5;
        }
        
        // Sky / Horizon Glow
        // Horizon line is at uv.y = 0.2 roughly
        float horizon = 0.01 / abs(uv.y - 0.2);
        col += vec3(0.0, 0.8, 1.0) * horizon * 0.5; // Cyan horizon glow
        
        // Deep background
        col += vec3(0.05, 0.0, 0.1);

        gl_FragColor = vec4(col, 1.0);
    }
    `;

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    if (!vertexShader || !fragmentShader) return;

    const program = createProgram(gl, vertexShader, fragmentShader);
    if (!program) return;

    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const uniforms = {
        iResolution: gl.getUniformLocation(program, 'iResolution'),
        iTime: gl.getUniformLocation(program, 'iTime')
    };
    const posLoc = gl.getAttribLocation(program, 'a_position');

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
    }

    let startTime = Date.now();
    function animate() {
        resize();
        gl.useProgram(program);
        gl.uniform2f(uniforms.iResolution, canvas.width, canvas.height);
        gl.uniform1f(uniforms.iTime, (Date.now() - startTime) / 1000);

        gl.enableVertexAttribArray(posLoc);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resize);
    animate();
}
