
import {pub} from "sparrow-rtc/x/toolbox/pub.js"
import {JoinerControls, HostState} from "sparrow-rtc/x/types.js"
import {createSessionAsHost} from "sparrow-rtc/x/connect/create-session-as-host.js"
import {standardRtcConfig} from "sparrow-rtc/x/connect/utils/standard-rtc-config.js"

export async function hostGameState({
		render,
		signalServerUrl,
	}: {
		signalServerUrl: string
		render(state: HostState): void
	}) {

	type Client = {
		controls: JoinerControls
		lastContactTime: number
	}

	const clients = new Set<Client>()
	const closeEvent = pub()

	const hostConnection = await createSessionAsHost({
		signalServerUrl,
		label: "session",
		rtcConfig: standardRtcConfig,
		onStateChange: render,
		handleJoin: controls => {
			const client: Client = {controls, lastContactTime: Date.now()}
			clients.add(client)
			const unsubscribeCloseListener = closeEvent.subscribe(close)
			return {
				handleClose() {
					clients.delete(client)
					unsubscribeCloseListener()
				},
				handleMessage(message) {
					client.lastContactTime = Date.now()
					// TODO actually process incoming message lol
				},
			}
		},
	})

	return {
		close() {
			closeEvent.publish()
		}
	}
}
