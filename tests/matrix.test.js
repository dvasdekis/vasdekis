import { createMatrix4, identity, translate, rotateY, invert, transpose, perspective } from '../js/utils.js';

function assert(condition, message) {
    if (!condition) {
        throw new Error(message || "Assertion failed");
    }
}

function assertClose(a, b, epsilon = 0.0001) {
    if (Math.abs(a - b) > epsilon) {
        throw new Error(`Expected ${a} to be close to ${b}`);
    }
}

export function runTests() {
    const results = document.getElementById('results');
    const log = (msg, type = 'info') => {
        const div = document.createElement('div');
        div.textContent = msg;
        div.className = type;
        results.appendChild(div);
    };

    try {
        log('Running Matrix Tests...', 'header');

        // Test Identity
        const m1 = createMatrix4();
        identity(m1);
        assert(m1[0] === 1 && m1[5] === 1 && m1[10] === 1 && m1[15] === 1, 'Identity matrix diagonal should be 1');
        log('✓ Identity Test Passed', 'success');

        // Test Translate
        const m2 = createMatrix4();
        identity(m2);
        translate(m2, 1, 2, 3);
        assert(m2[12] === 1 && m2[13] === 2 && m2[14] === 3, 'Translation should set last column');
        log('✓ Translate Test Passed', 'success');

        // Test RotateY
        const m3 = createMatrix4();
        identity(m3);
        rotateY(m3, Math.PI); // 180 degrees
        assertClose(m3[0], -1); // cos(180) = -1
        assertClose(m3[2], 0);  // sin(180) = 0 (approx)
        assertClose(m3[8], 0);  // -sin(180) = 0
        assertClose(m3[10], -1); // cos(180) = -1
        log('✓ RotateY Test Passed', 'success');

        // Test Perspective
        const m4 = createMatrix4();
        perspective(m4, Math.PI / 4, 1.0, 0.1, 100.0);
        assert(m4[5] !== 0, 'Perspective matrix should have non-zero scaling factor');
        log('✓ Perspective Test Passed', 'success');

        log('All Tests Passed!', 'success');

    } catch (e) {
        log(`❌ Test Failed: ${e.message}`, 'error');
        console.error(e);
    }
}

runTests();
