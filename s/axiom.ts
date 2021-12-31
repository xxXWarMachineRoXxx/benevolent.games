
console.log("💠 axiom", {BABYLON, Ammo})

import {V3} from "./game/utils/v3.js"
import * as v3 from "./game/utils/v3.js"
import {makeGame} from "./game/make-game.js"
import {makeFramerateDisplay} from "./demo/make-framerate-display.js"
import {parseHashForSessionId} from "sparrow-rtc/x/demo/utils/parse-hash-for-session-id.js"

void async function setupPlay() {

	const middle: V3 = [0, 0, 0]
	const game = await makeGame(middle)
	document.querySelector(".game").prepend(game.canvas)
	window.addEventListener("resize", game.resize)
	game.resize()

	let {getCameraPosition} = await game.spawn.camera()
	await Promise.all([
		game.spawn.environment("/assets/environment2.glb", getCameraPosition),
		game.spawn.character("/assets/android14.glb"),
	])
	const player = await game.spawn.player(v3.add(middle, [10, 5, 0]))
	await game.spawn.crate([10, 5, 10])

	getCameraPosition = player.getCameraPosition

	document.querySelector(".stats").appendChild(
		makeFramerateDisplay({
			getFramerate: () => game.framerate,
		})
	)

	{
		const host = location.hash.endsWith("host")
		const sessionId = parseHashForSessionId(location.hash)

		if (host) {
			
		}
		else if (sessionId) {
	
		}
		else {
	
		}
	}
}()
