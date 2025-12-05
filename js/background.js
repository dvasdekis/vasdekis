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
    uniform vec3 u_explosion; // x, y (screen coords), z (start time)

    // Pseudo-random hash
    float hash(float n) {
        return fract(sin(n) * 43758.5453123);
    }

    // 3D Square Explosion
    float squareExplosion(vec2 uv, vec2 center, float progress) {
        vec2 p = uv - center;
        p.x *= iResolution.x / iResolution.y; 
        
        float d = max(abs(p.x), abs(p.y));
        
        // Expanding rings - Smaller and tighter
        float rings = 0.0;
        for(float i=0.0; i<3.0; i++) {
            float size = progress * (0.1 + i * 0.05); // Much smaller expansion
            float thickness = 0.002; // Thinner lines
            float ring = smoothstep(size + thickness, size, d) * smoothstep(size - thickness, size, d);
            
            // Fade out
            ring *= 1.0 - smoothstep(0.2, 1.0, progress); // Fade earlier
            rings += ring;
        }
        
        // Random particles (squares) - More numerous, smaller
        float particles = 0.0;
        float seed = dot(center, vec2(12.9898, 78.233));
        for(float i=0.0; i<30.0; i++) { // Increased count to 30
            float angle = hash(seed + i) * 6.28;
            float speed = 0.1 + hash(seed + i + 1.0) * 0.2; // Slower speed
            vec2 dir = vec2(cos(angle), sin(angle));
            vec2 pos = dir * progress * speed;
            
            vec2 partUV = p - pos;
            float partSize = 0.003 * (1.0 - progress); // Tiny particles
            float part = step(max(abs(partUV.x), abs(partUV.y)), partSize);
            particles += part;
        }
        
        return rings + particles;
    }

    void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * iResolution.xy) / iResolution.y;
        
        // Camera movement
        float speed = 0.5;
        float time = iTime * speed;
        
        // 3D Projection
        vec3 ro = vec3(0.0, 1.0, -time); 
        vec3 rd = normalize(vec3(uv.x, uv.y - 0.2, -1.0)); 
        
        float t = -ro.y / rd.y;
        
        vec3 col = vec3(0.0);
        
        // --- Grid Rendering ---
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
        
        // --- Sky ---
        
        // Horizon Glow
        float horizon = 0.01 / abs(uv.y - 0.2);
        vec3 skyCol = vec3(0.0, 0.8, 1.0) * horizon * 0.5; // Cyan
        skyCol += vec3(0.05, 0.0, 0.1);
        
        // --- Explosion (Triggered externally) ---
        if (u_explosion.z > 0.0) {
            float age = iTime - u_explosion.z;
            if (age < 1.0) { // Effect lasts 1 second
                vec2 impactPos = u_explosion.xy;
                float explosion = squareExplosion(uv, impactPos, age * 2.0);
                skyCol += vec3(1.0, 1.0, 0.0) * explosion;
                
                // Flash
                float flash = exp(-age * 10.0) * 0.3;
                skyCol += vec3(0.0, 1.0, 1.0) * flash; 
                col += vec3(1.0, 0.0, 1.0) * flash;
            }
        }
        
        col += skyCol;

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
        iTime: gl.getUniformLocation(program, 'iTime'),
        u_explosion: gl.getUniformLocation(program, 'u_explosion')
    };
    const posLoc = gl.getAttribLocation(program, 'a_position');

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
    }

    let explosionData = [0, 0, -100]; // x, y, startTime

    let startTime = Date.now();
    function animate() {
        resize();
        gl.useProgram(program);
        gl.uniform2f(uniforms.iResolution, canvas.width, canvas.height);
        let floatTime = (Date.now() - startTime) / 1000;
        gl.uniform1f(uniforms.iTime, floatTime);
        gl.uniform3f(uniforms.u_explosion, explosionData[0], explosionData[1], explosionData[2]);

        gl.enableVertexAttribArray(posLoc);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resize);
    animate();

    return {
        triggerExplosion: (x, y) => {
            // x, y are in UV space (center 0,0)
            // The shader expects UVs where (0,0) is center.
            // We will pass the impact position directly in this space.
            explosionData = [x, y, (Date.now() - startTime) / 1000];
        }
    };
}
