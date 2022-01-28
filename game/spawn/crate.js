export function spawnCrate({ scene }) {
    return async function (position) {
        const mesh = BABYLON.Mesh.CreateBox("crate", 1, scene);
        mesh.physicsImpostor = new BABYLON.PhysicsImpostor(mesh, BABYLON.PhysicsImpostor.BoxImpostor, {
            mass: 1,
            friction: 1,
            restitution: 0.5,
        });
        mesh.position = new BABYLON.Vector3(...position);
    };
}
//# sourceMappingURL=crate.js.map