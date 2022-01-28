import { render as litRender, html } from "lit";
import { getRando } from "xiome/x/toolbox/get-rando.js";
import { snapstate } from "xiome/x/toolbox/snapstate/snapstate.js";
console.log("💙 heartbeat");
void async function main() {
    const sessionId = parseHashForSessionId(location.hash);
    const app = document.querySelector(".app");
    const rando = await getRando();
    const write = (template) => litRender(template, app);
    if (sessionId)
        initializeClientSession({ write });
    else
        initializeHostSession({ write, rando });
}();
function parseHashForSessionId(hash) {
    hash = (hash.length && hash[0] === "#")
        ? hash.slice(1)
        : hash;
    const result = hash.match(/^session=(\S+)($|\&)/i);
    return result
        ? result[1]
        : undefined;
}
function initializeHostSession({ rando, write }) {
    const { readable, writable, subscribe } = snapstate({
        sessionId: undefined,
    });
    function createSession() {
        writable.sessionId = rando.randomId().toString();
    }
    function render() {
        write(html `
			<p>host session</p>
			${readable.sessionId
            ? html `
					<p>session id: ${readable.sessionId}</p>
				`
            : html `
					<button @click=${createSession}>host session</button>
				`}
		`);
    }
    subscribe(render);
    render();
    return {};
}
function initializeClientSession({ write }) {
    const { readable, writable, subscribe } = snapstate({
        sessionId: undefined,
    });
    function render() {
        write(html `
			<p>client session</p>
			${readable.sessionId
            ? html `
					<p>session id: ${readable.sessionId}</p>
				`
            : html `
					<p>no session</p>
				`}
		`);
    }
    subscribe(render);
    render();
    return {};
}
//# sourceMappingURL=heartbeat-demo.js.map