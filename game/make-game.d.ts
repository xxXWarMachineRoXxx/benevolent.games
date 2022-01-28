import { V3 } from "./utils/v3.js";
import { Quality, Thumbsticks } from "./types.js";
export declare function makeGame({ quality, thumbsticks, middle, }: {
    quality: Quality;
    thumbsticks: Thumbsticks;
    middle?: V3;
}): Promise<{
    resize: () => void;
    framerate: number;
    spawn: {
        camera: () => Promise<{
            getCameraPosition(): V3;
        }>;
        crate: (position: V3) => Promise<void>;
        player: (position: V3) => Promise<{
            getCameraPosition(): V3;
        }>;
        character: () => Promise<void>;
        environment: ({ getCameraPosition }: {
            getCameraPosition: () => V3;
        }) => Promise<void>;
        dunebuggy: (position: V3) => Promise<void>;
    };
    middle: V3;
    quality: Quality;
    scene: BABYLON.Scene;
    canvas: HTMLCanvasElement;
    engine: BABYLON.Engine;
    renderLoop: Set<() => void>;
    looker: {
        add: (x: number, y: number) => void;
        readonly mouseLook: {
            horizontalRadians: number;
            verticalRadians: number;
        };
    };
    keyListener: {
        getKeyState: (key: string) => import("./utils/key-listener.js").KeyState;
        on(key: string, action: import("./utils/key-listener.js").KeyAction): () => boolean;
        clear(key: string): void;
    };
    thumbsticks: Thumbsticks;
}>;
