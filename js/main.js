import { createMatrix4, identity, perspective, translate, rotateY, invert, transpose, createShader, createProgram } from './utils.js';
import { createCyberGridBackground } from './background.js';
import { createLightningGeometry, initLightningProgram } from './lightning.js';

// Shaders
const vertexShaderSource = `
    attribute vec3 a_position;
    attribute vec3 a_normal;

    uniform mat4 u_modelMatrix;
    uniform mat4 u_viewMatrix;
    uniform mat4 u_projectionMatrix;
    uniform mat4 u_normalMatrix;

    varying vec3 v_normal;
    varying vec3 v_position;

    void main() {
        v_normal = mat3(u_normalMatrix) * a_normal;
        v_position = vec3(u_modelMatrix * vec4(a_position, 1.0));
        gl_Position = u_projectionMatrix * u_viewMatrix * u_modelMatrix * vec4(a_position, 1.0);
    }
`;

const fragmentShaderSource = `
    precision mediump float;

    uniform vec3 u_color;
    uniform vec3 u_lightPosition;
    uniform vec3 u_viewPosition;

    varying vec3 v_normal;
    varying vec3 v_position;

    void main() {
        // Ambient
        float ambientStrength = 0.3;
        vec3 ambient = ambientStrength * u_color;

        // Diffuse
        vec3 norm = normalize(v_normal);
        vec3 lightDir = normalize(u_lightPosition - v_position);
        float diff = max(dot(norm, lightDir), 0.0);
        vec3 diffuse = diff * u_color;

        // Specular
        float specularStrength = 0.8;
        vec3 viewDir = normalize(u_viewPosition - v_position);
        vec3 reflectDir = reflect(-lightDir, norm);
        float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
        vec3 specular = specularStrength * vec3(1.0, 1.0, 1.0) * spec;

        vec3 result = ambient + diffuse + specular;
        gl_FragColor = vec4(result, 1.0);
    }
`;

// Create V shape vertices with Normals
export function createVVertices() {
    const depth = 0.3;
    const scale = 0.6;

    const vertices = [];

    // Helper to add a triangle with its normal
    function addTriangle(p1, p2, p3) {
        // Calculate normal
        const u = [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]];
        const v = [p3[0] - p1[0], p3[1] - p1[1], p3[2] - p1[2]];

        const nx = u[1] * v[2] - u[2] * v[1];
        const ny = u[2] * v[0] - u[0] * v[2];
        const nz = u[0] * v[1] - u[1] * v[0];

        // Normalize
        const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
        const normal = [nx / len, ny / len, nz / len];

        // Push vertices and normals
        vertices.push(
            p1[0], p1[1], p1[2], normal[0], normal[1], normal[2],
            p2[0], p2[1], p2[2], normal[0], normal[1], normal[2],
            p3[0], p3[1], p3[2], normal[0], normal[1], normal[2]
        );
    }

    const points = [
        [-1.5 * scale, 1.0 * scale],   // 0: Top left outer
        [-0.5 * scale, 1.0 * scale],   // 1: Top left inner
        [-0.2 * scale, -1.0 * scale],  // 2: Bottom center left
        [1.5 * scale, 1.0 * scale],    // 3: Top right outer
        [0.5 * scale, 1.0 * scale],    // 4: Top right inner
        [0.2 * scale, -1.0 * scale],   // 5: Bottom center right
    ];

    // Front face (z = depth/2)
    addTriangle(
        [points[0][0], points[0][1], depth / 2],
        [points[2][0], points[2][1], depth / 2],
        [points[1][0], points[1][1], depth / 2]
    );
    addTriangle(
        [points[3][0], points[3][1], depth / 2],
        [points[4][0], points[4][1], depth / 2],
        [points[5][0], points[5][1], depth / 2]
    );

    // Back face (z = -depth/2) - reversed for culling
    addTriangle(
        [points[0][0], points[0][1], -depth / 2],
        [points[1][0], points[1][1], -depth / 2],
        [points[2][0], points[2][1], -depth / 2]
    );
    addTriangle(
        [points[3][0], points[3][1], -depth / 2],
        [points[5][0], points[5][1], -depth / 2],
        [points[4][0], points[4][1], -depth / 2]
    );

    // Side faces
    // Left arm outer
    addTriangle(
        [points[0][0], points[0][1], depth / 2],
        [points[0][0], points[0][1], -depth / 2],
        [points[2][0], points[2][1], depth / 2]
    );
    addTriangle(
        [points[0][0], points[0][1], -depth / 2],
        [points[2][0], points[2][1], -depth / 2],
        [points[2][0], points[2][1], depth / 2]
    );

    // Left arm inner
    addTriangle(
        [points[1][0], points[1][1], depth / 2],
        [points[2][0], points[2][1], depth / 2],
        [points[1][0], points[1][1], -depth / 2]
    );
    addTriangle(
        [points[1][0], points[1][1], -depth / 2],
        [points[2][0], points[2][1], depth / 2],
        [points[2][0], points[2][1], -depth / 2]
    );

    // Right arm outer
    addTriangle(
        [points[3][0], points[3][1], depth / 2],
        [points[5][0], points[5][1], depth / 2],
        [points[3][0], points[3][1], -depth / 2]
    );
    addTriangle(
        [points[3][0], points[3][1], -depth / 2],
        [points[5][0], points[5][1], depth / 2],
        [points[5][0], points[5][1], -depth / 2]
    );

    // Right arm inner
    addTriangle(
        [points[4][0], points[4][1], depth / 2],
        [points[4][0], points[4][1], -depth / 2],
        [points[5][0], points[5][1], depth / 2]
    );
    addTriangle(
        [points[4][0], points[4][1], -depth / 2],
        [points[5][0], points[5][1], -depth / 2],
        [points[5][0], points[5][1], depth / 2]
    );

    // Top left
    addTriangle(
        [points[0][0], points[0][1], depth / 2],
        [points[1][0], points[1][1], depth / 2],
        [points[0][0], points[0][1], -depth / 2]
    );
    addTriangle(
        [points[0][0], points[0][1], -depth / 2],
        [points[1][0], points[1][1], depth / 2],
        [points[1][0], points[1][1], -depth / 2]
    );

    // Top right
    addTriangle(
        [points[3][0], points[3][1], depth / 2],
        [points[3][0], points[3][1], -depth / 2],
        [points[4][0], points[4][1], depth / 2]
    );
    addTriangle(
        [points[3][0], points[3][1], -depth / 2],
        [points[4][0], points[4][1], -depth / 2],
        [points[4][0], points[4][1], depth / 2]
    );

    return new Float32Array(vertices);
}

// Main WebGL setup and animation
export function main() {
    console.log('Starting WebGL setup...');
    const canvas = document.getElementById('webgl-canvas');
    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false });

    if (!gl) {
        alert('WebGL not supported');
        return;
    }
    console.log('WebGL context created successfully');

    // Enable blending for transparency
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Set canvas size
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Create shaders and program
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program = createProgram(gl, vertexShader, fragmentShader);

    if (!program) {
        console.error('Failed to create shader program');
        return;
    }

    // Get attribute and uniform locations
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const normalLocation = gl.getAttribLocation(program, 'a_normal');

    const modelMatrixLocation = gl.getUniformLocation(program, 'u_modelMatrix');
    const viewMatrixLocation = gl.getUniformLocation(program, 'u_viewMatrix');
    const projectionMatrixLocation = gl.getUniformLocation(program, 'u_projectionMatrix');
    const normalMatrixLocation = gl.getUniformLocation(program, 'u_normalMatrix');
    const colorLocation = gl.getUniformLocation(program, 'u_color');
    const lightPosLocation = gl.getUniformLocation(program, 'u_lightPosition');
    const viewPosLocation = gl.getUniformLocation(program, 'u_viewPosition');

    // Create V geometry
    const vertices = createVVertices();
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // --- Lightning Setup ---
    const lightningProgram = initLightningProgram(gl);
    const lightningBuffer = gl.createBuffer();
    const lightningPosLoc = gl.getAttribLocation(lightningProgram, 'a_position');
    const lightningModelLoc = gl.getUniformLocation(lightningProgram, 'u_modelMatrix');
    const lightningViewLoc = gl.getUniformLocation(lightningProgram, 'u_viewMatrix');
    const lightningProjLoc = gl.getUniformLocation(lightningProgram, 'u_projectionMatrix');
    const lightningColorLoc = gl.getUniformLocation(lightningProgram, 'u_color');

    let lightningActive = false;
    let lightningTimer = 0;
    let lightningVertsCount = 0;

    // Start Background
    const bgController = createCyberGridBackground();

    // Set up matrices
    const modelMatrix = createMatrix4();
    const viewMatrix = createMatrix4();
    const projectionMatrix = createMatrix4();
    const normalMatrix = createMatrix4();
    const tempMatrix = createMatrix4();

    // Set up view matrix
    identity(viewMatrix);
    translate(viewMatrix, 0, 0, -3);

    // Enable depth testing and face culling
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.frontFace(gl.CCW);

    // Hide loading text
    const loading = document.getElementById('loading');
    if (loading) loading.style.display = 'none';

    // Animation loop
    let rotation = 0;
    function animate() {
        rotation += 0.02;

        // Clear canvas
        gl.clearColor(0.0, 0.0, 0.0, 0.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Set up projection matrix
        const aspect = canvas.width / canvas.height;
        perspective(projectionMatrix, Math.PI / 4, aspect, 0.1, 100);

        // --- Render V Logo ---
        gl.useProgram(program);

        // Set up model matrix with rotation
        identity(modelMatrix);
        rotateY(modelMatrix, rotation);

        // Calculate Normal Matrix (Inverse Transpose of Model)
        invert(tempMatrix, modelMatrix);
        transpose(normalMatrix, tempMatrix);

        // Set uniforms
        gl.uniformMatrix4fv(modelMatrixLocation, false, modelMatrix);
        gl.uniformMatrix4fv(viewMatrixLocation, false, viewMatrix);
        gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);
        gl.uniformMatrix4fv(normalMatrixLocation, false, normalMatrix);

        gl.uniform3f(colorLocation, 0.0, 0.7, 1.0); // Bright blue color
        gl.uniform3f(lightPosLocation, 2.0, 2.0, 5.0); // Light top right front
        gl.uniform3f(viewPosLocation, 0.0, 0.0, 3.0); // Camera position

        // Set up vertex attributes
        const stride = 6 * 4; // 3 pos + 3 normal * 4 bytes

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, stride, 0);

        gl.enableVertexAttribArray(normalLocation);
        gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, stride, 3 * 4);

        // Draw the V
        gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 6);

        // --- Render Lightning ---
        // Trigger logic
        if (!lightningActive && Math.random() < 0.02) { // 2% chance per frame
            lightningActive = true;
            lightningTimer = 1.0;

            // Generate bolt
            const startX = (Math.random() - 0.5) * 10;
            const startY = 5.0; // High up
            const startZ = -5.0 - Math.random() * 5; // Behind

            const endX = (Math.random() - 0.5) * 10;
            const endY = -2.0; // Ground level (approx)
            const endZ = -2.0 - Math.random() * 5;

            const boltVerts = createLightningGeometry([startX, startY, startZ], [endX, endY, endZ]);
            lightningVertsCount = boltVerts.length / 3;

            gl.bindBuffer(gl.ARRAY_BUFFER, lightningBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, boltVerts, gl.DYNAMIC_DRAW);

            // Trigger explosion in background
            // Map world X/Z to UV space roughly. 
            // Assuming view is centered and grid is infinite.
            // Let's just pass a mapped value.
            bgController.triggerExplosion(endX * 0.1, endZ * 0.1); // Scale down
        }

        if (lightningActive) {
            gl.useProgram(lightningProgram);

            // Identity model for lightning (vertices are already world space)
            identity(modelMatrix);

            gl.uniformMatrix4fv(lightningModelLoc, false, modelMatrix);
            gl.uniformMatrix4fv(lightningViewLoc, false, viewMatrix);
            gl.uniformMatrix4fv(lightningProjLoc, false, projectionMatrix);

            // Flash color (Cyan/Magenta mix)
            if (Math.random() > 0.5) {
                gl.uniform3f(lightningColorLoc, 0.0, 1.0, 1.0); // Cyan
            } else {
                gl.uniform3f(lightningColorLoc, 1.0, 0.0, 1.0); // Magenta
            }

            gl.bindBuffer(gl.ARRAY_BUFFER, lightningBuffer);
            gl.enableVertexAttribArray(lightningPosLoc);
            gl.vertexAttribPointer(lightningPosLoc, 3, gl.FLOAT, false, 0, 0);

            gl.drawArrays(gl.LINE_STRIP, 0, lightningVertsCount);

            lightningTimer -= 0.05;
            if (lightningTimer <= 0) {
                lightningActive = false;
            }
        }

        requestAnimationFrame(animate);
    }

    animate();
}

// Initialize
console.log('Module loaded, starting app...');
main();
