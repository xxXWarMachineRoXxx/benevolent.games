import { loadGlb } from "../babylon/load-glb.js";
export function spawnDunebuggy({ quality, scene }) {
    return async function (position) {
        const assets = await loadGlb(scene, `/assets/art/dunebuggy/dunebuggy.${quality}.glb`);
        assets.removeAllFromScene();
        assets.addAllToScene();
        // mesh.position = new BABYLON.Vector3(...position)
    };
}
//# sourceMappingURL=dunebuggy.js.map