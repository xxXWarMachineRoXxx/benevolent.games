export interface KeyState {
    isDown: boolean;
}
export interface KeyAction {
    (keyState: KeyState): void;
}
export declare function makeKeyListener(): {
    getKeyState: (key: string) => KeyState;
    on(key: string, action: KeyAction): () => boolean;
    clear(key: string): void;
};
