/** @format */

import { DomainEvent, EventHandler } from "../types/events"

class EventBus {
	private static instance: EventBus
	private handlers: Map<string, EventHandler<DomainEvent>[]>

	private constructor() {
		this.handlers = new Map()
	}

	public static getInstance(): EventBus {
		if (!EventBus.instance) {
			EventBus.instance = new EventBus()
		}
		return EventBus.instance
	}

	public subscribe<T extends DomainEvent>(
		eventType: T["type"],
		handler: EventHandler<T>
	) {
		const handlers = this.handlers.get(eventType) || []
		handlers.push(handler)
		this.handlers.set(eventType, handlers)
	}

	public async publish<T extends DomainEvent>(event: T): Promise<void> {
		const handlers = this.handlers.get(event.type) || []
		await Promise.all(handlers.map((handler) => handler.handle(event)))
	}
}

export const eventBus = EventBus.getInstance()
