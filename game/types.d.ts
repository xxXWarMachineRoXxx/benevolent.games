import type { V3 } from "./utils/v3.js";
import { ThumbStick } from "../thumbtastic/thumb-stick.js";
import type { makeKeyListener } from "./utils/key-listener.js";
import type { makeMouseLooker } from "./utils/mouse-looker.js";
export declare type Quality = "q0" | "q1";
export interface Thumbsticks {
    left: ThumbStick;
    right: ThumbStick;
}
export interface SpawnOptions {
    middle: V3;
    quality: Quality;
    scene: BABYLON.Scene;
    canvas: HTMLCanvasElement;
    engine: BABYLON.Engine;
    renderLoop: Set<() => void>;
    looker: ReturnType<typeof makeMouseLooker>;
    keyListener: ReturnType<typeof makeKeyListener>;
    thumbsticks: Thumbsticks;
}
