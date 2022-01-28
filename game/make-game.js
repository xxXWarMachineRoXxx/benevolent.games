import { makeKeyListener } from "./utils/key-listener.js";
import { makeMouseLooker } from "./utils/mouse-looker.js";
import { spawnCrate } from "./spawn/crate.js";
import { spawnCamera } from "./spawn/camera.js";
import { spawnPlayer } from "./spawn/player.js";
import { spawnCharacter } from "./spawn/character.js";
import { spawnDunebuggy } from "./spawn/dunebuggy.js";
import { spawnEnvironment } from "./spawn/environment.js";
export async function makeGame({ quality, thumbsticks, middle = [0, 0, 0], }) {
    console.log("💅", quality);
    const canvas = document.createElement("canvas");
    const engine = new BABYLON.Engine(canvas);
    const scene = new BABYLON.Scene(engine);
    await Ammo();
    const gravity = new BABYLON.Vector3(0, -9.81, 0);
    const physics = new BABYLON.AmmoJSPlugin(false);
    scene.enablePhysics(gravity, physics);
    BABYLON.SceneLoader.ShowLoadingScreen = false;
    engine.loadingScreen = null;
    const renderLoop = new Set();
    engine.runRenderLoop(() => {
        for (const fun of renderLoop)
            fun();
        scene.render();
    });
    canvas.onclick = (event) => {
        const notTouch = event.pointerType !== undefined
            ? event.pointerType !== "touch"
            : true;
        if (notTouch && !document.pointerLockElement)
            canvas.requestPointerLock();
    };
    const options = {
        scene,
        engine,
        canvas,
        middle,
        quality,
        renderLoop,
        thumbsticks,
        looker: makeMouseLooker(),
        keyListener: makeKeyListener(),
    };
    return {
        scene,
        engine,
        ...options,
        resize: () => engine.resize(),
        get framerate() { return engine.getFps(); },
        spawn: {
            camera: spawnCamera(options),
            crate: spawnCrate(options),
            player: spawnPlayer(options),
            character: spawnCharacter(options),
            environment: spawnEnvironment(options),
            dunebuggy: spawnDunebuggy(options),
        }
    };
}
//# sourceMappingURL=make-game.js.map