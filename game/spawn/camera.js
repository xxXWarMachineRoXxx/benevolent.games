export function spawnCamera({ middle, scene, canvas }) {
    return async function () {
        const campos = new BABYLON.Vector3(...middle);
        const camera = new BABYLON.FreeCamera("camera1", campos, scene);
        camera.attachControl(canvas, true);
        camera.minZ = 1;
        camera.maxZ = 2000;
        scene.activeCamera = camera;
        return {
            getCameraPosition() {
                return [
                    camera.globalPosition.x,
                    camera.globalPosition.y,
                    camera.globalPosition.z,
                ];
            },
        };
    };
}
//# sourceMappingURL=camera.js.map