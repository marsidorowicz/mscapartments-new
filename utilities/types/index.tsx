/**
 * Enum for event entry types used in user notifications
 *
 * @format
 */

export enum EventEntryType {
	NEW_BOOKING = "new_booking",
	PAYMENT_RECEIVED = "payment_received",
	EVENT_ADDED = "event_added",
	EVENT_DELETED = "event_deleted",
	PRICE_MISSING = "price_missing",
	SYSTEM_ALERT = "system_alert",
}

/**
 * Available event entry types for notifications
 * @see EventEntryType for the complete list of available values
 */

/**
 * Interface for creating a new event entry
 */
export interface CreateEventEntry {
	/**
	 * The type of the event entry (required)
	 * @see EventEntryType for available values
	 */
	type: EventEntryType
	/**
	 * The title of the event entry (required)
	 */
	title: string
	/**
	 * Optional message for additional details
	 */
	message?: string
	/**
	 * Data object containing event-specific information (required)
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	data: Record<string, any>
	/**
	 * The user IDs this event entry should be sent to (optional, can be single user or array)
	 * If not provided, propertyId must be provided to automatically find target users
	 */
	userIds?: string | string[]
	/**
	 * The property ID to automatically find MANAGER/ADMIN users and global ADMINs (optional)
	 * If not provided, userIds must be provided
	 */
	propertyId?: number
}
