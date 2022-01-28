export function zero() {
    return [0, 0, 0];
}
export function add(...vectors) {
    let x = 0;
    let y = 0;
    let z = 0;
    for (const [vx, vy, vz] of vectors) {
        x += vx;
        y += vy;
        z += vz;
    }
    return [x, y, z];
}
function applyBy([x, y, z], action) {
    return [
        action(x),
        action(y),
        action(z),
    ];
}
export function negate(vector) {
    return applyBy(vector, a => a * -1);
}
export function subtract(a, b) {
    return [
        a[0] - b[0],
        a[1] - b[1],
        a[2] - b[2],
    ];
}
export function addBy(vector, delta) {
    return applyBy(vector, a => a + delta);
}
export function multiplyBy(vector, delta) {
    return applyBy(vector, a => a * delta);
}
export function divideBy(vector, delta) {
    return applyBy(vector, a => delta === 0
        ? a
        : a / delta);
}
export function magnitude([x, y, z]) {
    return Math.sqrt(x * x +
        y * y +
        z * z);
}
export function normalize(vector) {
    const length = magnitude(vector);
    const [x, y, z] = vector;
    return length === 0
        ? vector
        : [
            x / length,
            y / length,
            z / length,
        ];
}
//# sourceMappingURL=v3.js.map