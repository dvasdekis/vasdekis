import { createShader, createProgram } from '../js/utils.js';
import { createVVertices, main } from '../js/main.js';
import { createCyberGridBackground } from '../js/background.js';

function assert(condition, message) {
    if (!condition) {
        throw new Error(message || "Assertion failed");
    }
}

export function runWebGLTests() {
    const results = document.getElementById('results');
    const log = (msg, type = 'info') => {
        const div = document.createElement('div');
        div.textContent = msg;
        div.className = type;
        results.appendChild(div);
    };

    try {
        log('Running WebGL Tests...', 'header');

        // Setup Test Canvas
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl');
        if (!gl) {
            log('⚠️ WebGL not supported, skipping WebGL tests', 'error');
            return;
        }

        // Test createShader
        const vsSource = 'attribute vec2 p; void main() { gl_Position = vec4(p,0,1); }';
        const fsSource = 'void main() { gl_FragColor = vec4(1,0,0,1); }';

        const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
        assert(vs instanceof WebGLShader, 'createShader should return a WebGLShader');
        log('✓ createShader Test Passed', 'success');

        // Test createProgram
        const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
        const prog = createProgram(gl, vs, fs);
        assert(prog instanceof WebGLProgram, 'createProgram should return a WebGLProgram');
        log('✓ createProgram Test Passed', 'success');

        // Test createVVertices
        const vertices = createVVertices();
        assert(vertices instanceof Float32Array, 'createVVertices should return Float32Array');
        assert(vertices.length > 0, 'Vertices array should not be empty');
        assert(vertices.length % 6 === 0, 'Vertices should have 6 components per vertex (3 pos + 3 normal)');
        log('✓ createVVertices Test Passed', 'success');

        // Test main() smoke test
        // Mock DOM elements
        const mockCanvas = document.createElement('canvas');
        mockCanvas.id = 'webgl-canvas';
        document.body.appendChild(mockCanvas);

        const mockLoading = document.createElement('div');
        mockLoading.id = 'loading';
        document.body.appendChild(mockLoading);

        try {
            main();
            log('✓ main() Smoke Test Passed', 'success');
        } catch (e) {
            throw new Error(`main() failed: ${e.message}`);
        }

        // Test createCyberGridBackground() smoke test
        const mockBg = document.createElement('div');
        mockBg.id = 'vanta-background';
        document.body.appendChild(mockBg);

        try {
            createCyberGridBackground();
            log('✓ createCyberGridBackground() Smoke Test Passed', 'success');
        } catch (e) {
            throw new Error(`createCyberGridBackground() failed: ${e.message}`);
        }

        // Cleanup
        document.body.removeChild(mockCanvas);
        document.body.removeChild(mockLoading);
        document.body.removeChild(mockBg);

    } catch (e) {
        log(`❌ WebGL Test Failed: ${e.message}`, 'error');
        console.error(e);
    }
}
