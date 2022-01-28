export function makeFramerateDisplay({ getFramerate }) {
    const element = document.createElement("p");
    element.className = "framerate";
    element.textContent = "-";
    setInterval(() => element.textContent = getFramerate().toFixed(0), 100);
    return element;
}
//# sourceMappingURL=make-framerate-display.js.map