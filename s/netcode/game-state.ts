
export function entity() {}

export function gameState({}: {
		addEntity(id: string, entity: any): void
		removeEntity(id: string): void
		updateEntity(id: string, dataLabel: string, data: any): void
	}) {

	const state = new Map<string, {}>()

	return {
		state,
		addEntity(entityId: string, components: [string, any][]) {},
		removeEntity() {},
		updateEntity() {},
	}
}

export function gameWorld() {
	const world = new Map<string, {}>()
}
