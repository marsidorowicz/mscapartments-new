/** @format */

import { eventBus } from "./eventBus"
import { EmailNotificationHandler, UserActivityLogger, DeleteNotificationHandler, NoBedsAvailabilityHandler, TelegramDevNotificationHandler } from "./handlers"

let registered = false

export function registerEventHandlers() {
	if (registered) return
	registered = true

	const userActivityLogger = new UserActivityLogger()
	const emailNotificationHandler = new EmailNotificationHandler()
	const deleteNotificationHandler = new DeleteNotificationHandler()
	const telegramDevNotificationHandler = new TelegramDevNotificationHandler()
	const noBedsAvailabilityHandler = new NoBedsAvailabilityHandler()

	eventBus.subscribe("EVENT_CREATED", userActivityLogger)
	eventBus.subscribe("EVENT_UPDATED", userActivityLogger)
	eventBus.subscribe("EVENT_DELETED", userActivityLogger)

	eventBus.subscribe("EVENT_CREATED", emailNotificationHandler)
	eventBus.subscribe("EVENT_DELETED", deleteNotificationHandler)
	eventBus.subscribe("NOBEDS_AVAILABILITY_UPDATED", noBedsAvailabilityHandler)

	eventBus.subscribe("EVENT_CREATED", telegramDevNotificationHandler)
	eventBus.subscribe("EVENT_UPDATED", telegramDevNotificationHandler)
	eventBus.subscribe("EVENT_DELETED", telegramDevNotificationHandler)
	eventBus.subscribe("NOBEDS_AVAILABILITY_UPDATED", telegramDevNotificationHandler)
}
