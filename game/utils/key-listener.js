export function makeKeyListener() {
    const keyStates = new Map();
    const keyActions = new Map();
    function getKeyState(key) {
        var _a;
        return (_a = keyStates.get(key)) !== null && _a !== void 0 ? _a : { isDown: undefined };
    }
    function setKeyDownState(key, isDown) {
        var _a;
        const oldState = (_a = keyStates.get(key)) !== null && _a !== void 0 ? _a : { isDown: undefined };
        const newState = { ...oldState, isDown };
        const isChanged = oldState.isDown !== isDown;
        keyStates.set(key, newState);
        return isChanged;
    }
    function triggerKeyActions(key) {
        const actions = keyActions.get(key);
        if (actions) {
            const keyState = getKeyState(key);
            for (const action of actions)
                action(keyState);
        }
    }
    function assertKeyActionSet(key) {
        let set = keyActions.get(key);
        if (!set) {
            set = new Set();
            keyActions.set(key, set);
        }
        return set;
    }
    window.addEventListener("keydown", ({ key }) => {
        key = key.toLowerCase();
        const isChanged = setKeyDownState(key, true);
        if (isChanged)
            triggerKeyActions(key);
    });
    window.addEventListener("keyup", ({ key }) => {
        key = key.toLowerCase();
        const isChanged = setKeyDownState(key, false);
        if (isChanged)
            triggerKeyActions(key);
    });
    return {
        getKeyState,
        on(key, action) {
            const set = assertKeyActionSet(key);
            set.add(action);
            return () => set.delete(action);
        },
        clear(key) {
            const set = assertKeyActionSet(key);
            set.clear();
        },
    };
}
//# sourceMappingURL=key-listener.js.map