import { V3 } from "../utils/v3.js";
import { SpawnOptions } from "../types.js";
export declare function spawnEnvironment({ quality, scene, renderLoop }: SpawnOptions): ({ getCameraPosition }: {
    getCameraPosition: () => V3;
}) => Promise<void>;
