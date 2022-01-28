import "./thumbtastic/thumbtastic.js";
declare global {
    interface Window {
        scene: BABYLON.Scene;
        engine: BABYLON.Engine;
        pick: BABYLON.AbstractMesh;
    }
}
