import { createShader, createProgram } from './utils.js';

// Recursive function to generate lightning segments
function generateSegments(start, end, displacement, iterations) {
    if (iterations === 0) {
        return [start, end];
    }

    const midX = (start[0] + end[0]) / 2;
    const midY = (start[1] + end[1]) / 2;
    const midZ = (start[2] + end[2]) / 2;

    // Add random displacement perpendicular to the direction (roughly)
    // For simplicity, just displace in X and Z, keeping Y mostly downward
    const offsetX = (Math.random() - 0.5) * displacement;
    const offsetZ = (Math.random() - 0.5) * displacement;

    // Digital look: Snap to grid? Or just jagged? 
    // Let's stick to jagged for now, maybe snap later if requested.

    const mid = [midX + offsetX, midY, midZ + offsetZ];

    const left = generateSegments(start, mid, displacement / 2, iterations - 1);
    const right = generateSegments(mid, end, displacement / 2, iterations - 1);

    return left.concat(right.slice(1)); // Avoid duplicating the middle point
}

export function createLightningGeometry(startPoint, endPoint) {
    const points = generateSegments(startPoint, endPoint, 2.0, 5); // 5 iterations

    // Convert to Float32Array for WebGL
    const vertices = [];
    for (let i = 0; i < points.length; i++) {
        vertices.push(points[i][0], points[i][1], points[i][2]);
    }

    return new Float32Array(vertices);
}

// Shader for the lightning (Unlit, glowing color)
const vertexShaderSource = `
    attribute vec3 a_position;
    uniform mat4 u_modelMatrix;
    uniform mat4 u_viewMatrix;
    uniform mat4 u_projectionMatrix;

    void main() {
        gl_Position = u_projectionMatrix * u_viewMatrix * u_modelMatrix * vec4(a_position, 1.0);
    }
`;

const fragmentShaderSource = `
    precision mediump float;
    uniform vec3 u_color;

    void main() {
        gl_FragColor = vec4(u_color, 1.0);
    }
`;

export function initLightningProgram(gl) {
    const vs = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    return createProgram(gl, vs, fs);
}
