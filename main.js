console.log("👼 benevolent.games", { BABYLON, Ammo });
import { makeGame } from "./game/make-game.js";
import { makeFramerateDisplay } from "./demo/make-framerate-display.js";
import "./thumbtastic/thumbtastic.js";
import { getGameQualityMode, startLoading, wirePointerLockAttribute, setupFullscreenToggling, setupHumanoidDemo, enableDebugMeshPicking } from "./startup/main-startup-routines.js";
void async function main() {
    const quality = getGameQualityMode();
    const { finishLoading } = startLoading({ quality });
    wirePointerLockAttribute(document.body, "data-pointer-lock");
    setupFullscreenToggling("data-fullscreen", document.querySelector(".buttonbar .fullscreen"));
    const middle = [0, 0, 0];
    const game = await makeGame({
        quality,
        middle,
        thumbsticks: {
            left: document.querySelector("thumb-stick.left"),
            right: document.querySelector("thumb-stick.right"),
        },
    });
    document.querySelector(".game body").prepend(game.canvas);
    window.addEventListener("resize", game.resize);
    game.resize();
    window.scene = game.scene;
    window.engine = game.engine;
    await setupHumanoidDemo({ middle, game });
    enableDebugMeshPicking({ game });
    document.querySelector(".stats").appendChild(makeFramerateDisplay({
        getFramerate: () => game.framerate,
    }));
    finishLoading();
}();
//# sourceMappingURL=main.js.map