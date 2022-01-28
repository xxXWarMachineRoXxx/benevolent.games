export function zero() {
    return [0, 0];
}
export function rotate(x, y, radians) {
    return [
        (x * Math.cos(radians)) - (y * Math.sin(radians)),
        (x * Math.sin(radians)) + (y * Math.cos(radians)),
    ];
}
export function dot(a, b) {
    return (a[0] * b[0]) + (a[1] * b[1]);
}
export function distance([x1, y1], [x2, y2]) {
    const x = x1 - x2;
    const y = y1 - y2;
    return Math.sqrt((x * x) + (y * y));
}
export function atan2([ax, ay], [bx, by]) {
    return Math.atan2(by, bx) - Math.atan2(ay, ax);
}
export function magnitude([x, y]) {
    return Math.sqrt(x * x +
        y * y);
}
export function subtract(a, b) {
    return [
        a[0] - b[0],
        a[1] - b[1],
    ];
}
export function normalize(vector) {
    const length = magnitude(vector);
    const [x, y] = vector;
    return length === 0
        ? vector
        : [
            x / length,
            y / length,
        ];
}
export function applyBy(vector, change) {
    return [
        change(vector[0]),
        change(vector[1]),
    ];
}
export function negate(vector) {
    return applyBy(vector, a => a * -1);
}
export function multiplyBy(vector, factor) {
    return applyBy(vector, a => a * factor);
}
//# sourceMappingURL=v2.js.map