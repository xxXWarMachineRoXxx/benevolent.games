import { cap } from "./numpty.js";
export function makeMouseLooker() {
    let sensitivity = 1 / 1000;
    const radian = Math.PI / 2;
    let horizontalRadians = 0;
    let verticalRadians = 0;
    function add(x, y) {
        horizontalRadians += x;
        verticalRadians += y;
        verticalRadians = cap(verticalRadians, -radian, radian);
    }
    window.addEventListener("mousemove", (event) => {
        const { movementX, movementY } = event;
        if (document.pointerLockElement) {
            const x = movementX * sensitivity;
            const y = movementY * sensitivity;
            add(x, y);
        }
    });
    return {
        add,
        get mouseLook() {
            return { horizontalRadians, verticalRadians };
        },
    };
}
//# sourceMappingURL=mouse-looker.js.map