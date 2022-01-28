import { V3 } from "../utils/v3.js";
import { SpawnOptions } from "../types.js";
export declare function spawnPlayer({ scene, renderLoop, looker, keyListener, thumbsticks, }: SpawnOptions): (position: V3) => Promise<{
    getCameraPosition(): V3;
}>;
