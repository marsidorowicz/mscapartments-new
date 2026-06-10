/** @format */

export interface BaseEvent {
	id: string
	timestamp: Date
	userId: string // Changed back to string to match DB schema
	error?: Error | string // Added error property for error notifications
}

export interface EventCreated extends BaseEvent {
	type: "EVENT_CREATED"
	payload: {
		eventId?: number // Made optional for failed creation events
		propertyId: number
		startDate: Date
		endDate: Date
		source?: string
		// Additional properties used in error reporting
		requestedBy?: string
		attemptedId?: string
		conflictingEventId?: number
		room_id?: number
		error?: string // For error-only events
	}
}

export interface EventUpdated extends BaseEvent {
	type: "EVENT_UPDATED"
	payload: {
		eventId?: number // Made optional for error cases
		propertyId: number
		startDate?: Date
		endDate?: Date
		changes?: Record<
			string,
			{
				from: any
				to: any
			}
		>
		// Additional properties used in error reporting
		userId?: string
		fields?: Record<string, boolean>
		error?: string // For error-only events
	}
}

export interface EventDeleted extends BaseEvent {
	type: "EVENT_DELETED"
	payload: {
		eventId: number
		propertyId: number
		startDate: Date
		endDate: Date
		// Additional properties used in error reporting
		requestedBy?: string
		nobedsCleared?: boolean
		restoredQuantityConfirmed?: boolean
	}
}

export interface NoBedsAvailabilityUpdated extends BaseEvent {
	type: "NOBEDS_AVAILABILITY_UPDATED"
	payload: {
		room_id: number
		dates: string[]
		operation: "block" | "release"
		// Additional properties used in error reporting
		propertyId?: number
		originalError?: unknown
	}
}

export type DomainEvent =
	| EventCreated
	| EventUpdated
	| EventDeleted
	| NoBedsAvailabilityUpdated

export interface EventHandler<T extends DomainEvent> {
	handle(event: T): Promise<void>
}
