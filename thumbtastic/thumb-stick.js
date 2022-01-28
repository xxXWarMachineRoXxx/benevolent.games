var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _ThumbStick_basis, _ThumbStick_updateBasis;
import { LitElement, html, css } from "lit";
export class ThumbStick extends LitElement {
    constructor() {
        super(...arguments);
        this.values = { x: 0, y: 0 };
        this.onstickmove = (values) => { };
        _ThumbStick_basis.set(this, void 0);
        _ThumbStick_updateBasis.set(this, () => {
            const base = this.shadowRoot.querySelector(".base");
            const stick = this.shadowRoot.querySelector(".stick");
            const rect = base.getBoundingClientRect();
            const radius = (rect.width / 2) - (stick.getBoundingClientRect().width / 4);
            __classPrivateFieldSet(this, _ThumbStick_basis, { rect, radius }, "f");
        });
    }
    firstUpdated() {
        const base = this.shadowRoot.querySelector(".base");
        const stick = this.shadowRoot.querySelector(".stick");
        const understick = this.shadowRoot.querySelector(".understick");
        __classPrivateFieldGet(this, _ThumbStick_updateBasis, "f").call(this);
        const withinRadius = (x, y) => {
            return (x ** 2) + (y ** 2) < (__classPrivateFieldGet(this, _ThumbStick_basis, "f").radius ** 2);
        };
        const findClosestPointOnCircle = (x, y) => {
            const mag = Math.sqrt((x ** 2) + (y ** 2));
            return [
                x / mag * __classPrivateFieldGet(this, _ThumbStick_basis, "f").radius,
                y / mag * __classPrivateFieldGet(this, _ThumbStick_basis, "f").radius,
            ];
        };
        const registerFinalValues = (x, y) => {
            const values = {
                x: x / __classPrivateFieldGet(this, _ThumbStick_basis, "f").radius,
                y: -(y / __classPrivateFieldGet(this, _ThumbStick_basis, "f").radius),
            };
            this.values = values;
            this.onstickmove(values);
            stick.style.transform = `translate(${x}px, ${y}px)`;
            const underX = x * 0.5;
            const underY = y * 0.5;
            understick.style.transform = `translate(${underX}px, ${underY}px)`;
        };
        const moveStick = (clientX, clientY) => {
            const { left, top, height, width } = __classPrivateFieldGet(this, _ThumbStick_basis, "f").rect;
            const middleX = left + (width / 2);
            const middleY = top + (height / 2);
            let x = clientX - middleX;
            let y = clientY - middleY;
            if (!withinRadius(x, y)) {
                [x, y] = findClosestPointOnCircle(x, y);
            }
            registerFinalValues(x, y);
        };
        const resetStick = () => {
            registerFinalValues(0, 0);
        };
        let trackingMouse = false;
        let trackingTouchId;
        base.addEventListener("mousedown", ({ clientX, clientY }) => {
            trackingMouse = true;
            moveStick(clientX, clientY);
        });
        window.addEventListener("mouseup", () => {
            trackingMouse = false;
            resetStick();
        });
        window.addEventListener("mousemove", ({ clientX, clientY }) => {
            if (trackingMouse)
                moveStick(clientX, clientY);
        });
        base.addEventListener("touchstart", (event) => {
            const touch = event.targetTouches[0];
            trackingTouchId = touch.identifier;
            const { clientX, clientY } = touch;
            moveStick(clientX, clientY);
            event.preventDefault();
        });
        base.addEventListener("touchmove", (event) => {
            const touch = event.touches.item(trackingTouchId);
            if (touch) {
                const { clientX, clientY } = touch;
                moveStick(clientX, clientY);
            }
            event.preventDefault();
        });
        base.addEventListener("touchend", () => {
            trackingTouchId = undefined;
            resetStick();
        });
        window.addEventListener("resize", () => {
            __classPrivateFieldGet(this, _ThumbStick_updateBasis, "f").call(this);
        });
        window.addEventListener("scroll", () => {
            __classPrivateFieldGet(this, _ThumbStick_updateBasis, "f").call(this);
        });
    }
    render() {
        return html `
			<div class=base>
				<div class=stick></div>
				<div class=understick></div>
			</div>
		`;
    }
}
_ThumbStick_basis = new WeakMap(), _ThumbStick_updateBasis = new WeakMap();
ThumbStick.styles = css `
	:host {
		display: block;
		width: 20em;
		height: 20em;
	}
	.base {
		position: relative;
		width: 100%;
		height: 100%;
		background: var(--thumb-stick-background, #000);
		border-radius: 100%;
	}
	.stick, .understick {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		width: var(--thumb-stick-size, 66%);
		height: var(--thumb-stick-size, 66%);
		border-radius: 999em;
		background: var(--thumb-stick-color, #fff);
		margin: auto;
		pointer-events: none;
	}
	.understick {
		opacity: 0.5;
	}
	`;
//# sourceMappingURL=thumb-stick.js.map