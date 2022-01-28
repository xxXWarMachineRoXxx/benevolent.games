export declare function loadMaterial({ scene, path, label, }: {
    path: string;
    label: string;
    scene: BABYLON.Scene;
}): Promise<{
    material: BABYLON.NodeMaterial;
    assignTextures(textures: {
        [blockName: string]: string;
    }): BABYLON.NodeMaterial;
}>;
