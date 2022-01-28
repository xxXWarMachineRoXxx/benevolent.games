import { V3 } from "../game/utils/v3.js";
import { Quality } from "../game/types.js";
import { Await } from "xiome/x/types/await.js";
import { makeGame } from "../game/make-game.js";
export declare function getGameQualityMode(): Quality;
export declare function startLoading({ quality }: {
    quality: Quality;
}): {
    finishLoading(): void;
};
export declare function wirePointerLockAttribute(element: HTMLElement, attributeName: string): void;
export declare function setupFullscreenToggling(attribute: string, fullscreenButton: HTMLElement): void;
export declare function setupHumanoidDemo({ middle, game }: {
    middle: V3;
    game: Await<ReturnType<typeof makeGame>>;
}): Promise<void>;
export declare function enableDebugMeshPicking({ game }: {
    game: Await<ReturnType<typeof makeGame>>;
}): void;
