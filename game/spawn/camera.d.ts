import { V3 } from "../utils/v3.js";
import { SpawnOptions } from "../types.js";
export declare function spawnCamera({ middle, scene, canvas }: SpawnOptions): () => Promise<{
    getCameraPosition(): V3;
}>;
