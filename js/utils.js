// Matrix Math Utilities
export function createMatrix4() {
    return new Float32Array(16);
}

export function identity(matrix) {
    matrix[0] = 1; matrix[1] = 0; matrix[2] = 0; matrix[3] = 0;
    matrix[4] = 0; matrix[5] = 1; matrix[6] = 0; matrix[7] = 0;
    matrix[8] = 0; matrix[9] = 0; matrix[10] = 1; matrix[11] = 0;
    matrix[12] = 0; matrix[13] = 0; matrix[14] = 0; matrix[15] = 1;
    return matrix;
}

export function perspective(matrix, fovy, aspect, near, far) {
    const f = 1.0 / Math.tan(fovy / 2);
    const nf = 1 / (near - far);

    matrix[0] = f / aspect;
    matrix[1] = 0;
    matrix[2] = 0;
    matrix[3] = 0;
    matrix[4] = 0;
    matrix[5] = f;
    matrix[6] = 0;
    matrix[7] = 0;
    matrix[8] = 0;
    matrix[9] = 0;
    matrix[10] = (far + near) * nf;
    matrix[11] = -1;
    matrix[12] = 0;
    matrix[13] = 0;
    matrix[14] = (2 * far * near) * nf;
    matrix[15] = 0;

    return matrix;
}

export function translate(matrix, x, y, z) {
    matrix[12] += matrix[0] * x + matrix[4] * y + matrix[8] * z;
    matrix[13] += matrix[1] * x + matrix[5] * y + matrix[9] * z;
    matrix[14] += matrix[2] * x + matrix[6] * y + matrix[10] * z;
    matrix[15] += matrix[3] * x + matrix[7] * y + matrix[11] * z;
    return matrix;
}

export function rotateY(matrix, angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const m00 = matrix[0], m01 = matrix[1], m02 = matrix[2], m03 = matrix[3];
    const m20 = matrix[8], m21 = matrix[9], m22 = matrix[10], m23 = matrix[11];

    matrix[0] = m00 * c + m20 * s;
    matrix[1] = m01 * c + m21 * s;
    matrix[2] = m02 * c + m22 * s;
    matrix[3] = m03 * c + m23 * s;
    matrix[8] = m20 * c - m00 * s;
    matrix[9] = m21 * c - m01 * s;
    matrix[10] = m22 * c - m02 * s;
    matrix[11] = m23 * c - m03 * s;

    return matrix;
}

export function invert(out, a) {
    const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
    const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
    const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
    const a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

    const b00 = a00 * a11 - a01 * a10;
    const b01 = a00 * a12 - a02 * a10;
    const b02 = a00 * a13 - a03 * a10;
    const b03 = a01 * a12 - a02 * a11;
    const b04 = a01 * a13 - a03 * a11;
    const b05 = a02 * a13 - a03 * a12;
    const b06 = a20 * a31 - a21 * a30;
    const b07 = a20 * a32 - a22 * a30;
    const b08 = a20 * a33 - a23 * a30;
    const b09 = a21 * a32 - a22 * a31;
    const b10 = a21 * a33 - a23 * a31;
    const b11 = a22 * a33 - a23 * a32;

    let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    if (!det) {
        return null;
    }
    det = 1.0 / det;

    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
    out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
    out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
    out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
    out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
    out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
    out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
    out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

    return out;
}

export function transpose(out, a) {
    if (out === a) {
        let a01 = a[1], a02 = a[2], a03 = a[3];
        let a12 = a[6], a13 = a[7];
        let a23 = a[11];

        out[1] = a[4];
        out[2] = a[8];
        out[3] = a[12];
        out[4] = a01;
        out[6] = a[9];
        out[7] = a[13];
        out[8] = a02;
        out[9] = a12;
        out[11] = a[14];
        out[12] = a03;
        out[13] = a13;
        out[14] = a23;
    } else {
        out[0] = a[0]; out[1] = a[4]; out[2] = a[8]; out[3] = a[12];
        out[4] = a[1]; out[5] = a[5]; out[6] = a[9]; out[7] = a[13];
        out[8] = a[2]; out[9] = a[6]; out[10] = a[10]; out[11] = a[14];
        out[12] = a[3]; out[13] = a[7]; out[14] = a[11]; out[15] = a[15];
    }
    return out;
}

// WebGL Helpers
export function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Error compiling shader:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

export function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Error linking program:', gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }
    return program;
}
