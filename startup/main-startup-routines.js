import * as v3 from "../game/utils/v3.js";
export function getGameQualityMode() {
    return localStorage.getItem("benevolent-high-quality") === "true"
        ? "q0"
        : "q1";
}
export function startLoading({ quality }) {
    const loadingSpan = document.querySelector(".loading span");
    if (quality === "q0")
        loadingSpan.textContent += " high quality";
    return {
        finishLoading() {
            const loading = document.querySelector(".loading");
            loading.style.display = "none";
        }
    };
}
export function wirePointerLockAttribute(element, attributeName) {
    document.addEventListener("pointerlockchange", () => {
        const isPointerLocked = !!document.pointerLockElement;
        element.setAttribute(attributeName, isPointerLocked
            ? "true"
            : "false");
    });
}
export function setupFullscreenToggling(attribute, fullscreenButton) {
    if (document.fullscreenEnabled) {
        document.addEventListener("fullscreenchange", () => {
            const isFullscreen = !!document.fullscreenElement;
            fullscreenButton.setAttribute(attribute, isFullscreen ? "true" : "false");
        });
        fullscreenButton.onclick = () => {
            const isFullscreen = !!document.fullscreenElement;
            if (isFullscreen)
                document.exitFullscreen();
            else
                document.body.requestFullscreen();
        };
    }
    else {
        fullscreenButton.remove();
    }
}
export async function setupHumanoidDemo({ middle, game }) {
    let { getCameraPosition } = await game.spawn.camera();
    await Promise.all([
        game.spawn.environment({ getCameraPosition: () => getCameraPosition() }),
        game.spawn.character(),
    ]);
    const player = await game.spawn.player(v3.add(middle, [10, 5, 0]));
    await game.spawn.crate([10, 5, 10]);
    await game.spawn.dunebuggy([0, 0, 0]);
    getCameraPosition = player.getCameraPosition;
}
export function enableDebugMeshPicking({ game }) {
    game.keyListener.on("e", state => {
        if (state.isDown) {
            const { pickedMesh } = game.scene.pick(game.canvas.width / 2, game.canvas.height / 2);
            window.pick = pickedMesh;
            console.log(pickedMesh.name, pickedMesh);
        }
    });
}
//# sourceMappingURL=main-startup-routines.js.map