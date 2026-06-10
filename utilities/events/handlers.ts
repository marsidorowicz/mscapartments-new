/** @format */

import prisma from "@/prisma/prisma"
import { EventCreated, EventDeleted, EventHandler, EventUpdated, NoBedsAvailabilityUpdated, DomainEvent } from "../types/events"
import { sendMailSDC } from "../functions/templates"
import { format, parseISO, startOfDay } from "date-fns"
import { createMagicLink } from "../functions/auth/magicLink"

import axios from "axios"

const NOBEDS_API: string | undefined = process.env.NOBEDS_API_KEY

export class UserActivityLogger implements EventHandler<EventCreated | EventUpdated | EventDeleted> {
	// Map domain events to activity categories
	private getActivityCategory(eventType: string, hasError: boolean = false): string {
		if (hasError) {
			// Error categories
			const errorCategories: Record<string, string> = {
				EVENT_CREATED: "ERROR_EVENT_CREATION",
				EVENT_UPDATED: "ERROR_EVENT_UPDATE",
				EVENT_DELETED: "ERROR_EVENT_DELETION",
			}
			return errorCategories[eventType] || "ERROR_UNKNOWN"
		} else {
			// Standard activity categories
			const activityCategories: Record<string, string> = {
				EVENT_CREATED: "ACTIVITY_EVENT_CREATION",
				EVENT_UPDATED: "ACTIVITY_EVENT_UPDATE",
				EVENT_DELETED: "ACTIVITY_EVENT_DELETION",
			}
			return activityCategories[eventType] || "ACTIVITY_UNKNOWN"
		}
	}
	async handle(event: EventCreated | EventUpdated | EventDeleted): Promise<void> {
		try {
			// Determine if this is an error event
			const hasError = !!event.error
			const category = this.getActivityCategory(event.type, hasError)

			if (!event.userId) {
				// Check if userId is present
				console.error(`[${category}] User ID is missing in the event payload`)
			}

			const metadata = {
				activityCategory: category, // Include category in metadata instead
				...(event.type === "EVENT_UPDATED"
					? {
							...event.payload,
							changedFields: event.payload.changes ? Object.keys(event.payload.changes) : [],
						}
					: event.type === "EVENT_DELETED"
						? {
								...event.payload,
								deletedAt: new Date(),
							}
						: event.payload),
				...(hasError && {
					error: event.error instanceof Error ? event.error.message : String(event.error),
					errorType: event.error instanceof Error ? event.error.name : "Unknown",
				}),
			}

			await prisma.userActivity.create({
				data: {
					userId: event.userId || "",
					activity: hasError ? `${event.type}_ERROR` : event.type,
					metadata,
				},
			})
		} catch (error) {
			const errorCategory = this.getActivityCategory(event.type, true)
			console.error(`[${errorCategory}] Error logging user activity:`, error)
		}
	}
}

export class EmailNotificationHandler implements EventHandler<EventCreated> {
	async handle(event: EventCreated): Promise<void> {
		// Skip notification if eventId is missing (error case)
		if (!event.payload.eventId) {
			console.log("Skipping email notification - missing eventId in payload", event.payload)
			return
		}

		try {
			const eventDetails = await prisma.event.findUnique({
				where: { id: event.payload.eventId },
				include: { property: true },
			})

			const propertyDetails = await prisma.property.findUnique({
				where: { id: event.payload.propertyId },
			})

			if (!eventDetails?.email || !propertyDetails) return

			let BRAND_URL
			switch (propertyDetails?.brand) {
				case "MOUNTAIN":
					BRAND_URL = "https://mountainapartments.pl"
					break
				case "MSC":
					BRAND_URL = "https://pms.cyberwealth.pro"
					break
				default:
					BRAND_URL = "https://pms.cyberwealth.pro"
					break
			}

			const propLanguage = propertyDetails.lang || "pl"
			const reservationLink = eventDetails.accessToken
				? createMagicLink(eventDetails.id, propertyDetails.id, eventDetails.accessToken, propLanguage)
				: `${BRAND_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/${propLanguage}/reservation/${eventDetails.id}/${
						propertyDetails.id
					}`

			const body = ` Dziękujemy za dokonanie rezerwacji. Otrzymała ona numer: ${eventDetails?.id} <br>
			Zarezerwowano ${propertyDetails?.name || "niezdefiniowany"} <br>
			Daty: przyjazd ${format(new Date(eventDetails?.startDate), "yyyy-MM-dd")} wyjazd ${format(new Date(eventDetails?.endDate), "yyyy-MM-dd")} <br><br>

						Szczegóły rezerwacji możesz zobaczyć pod tym linkiem: <a href="${reservationLink}">${reservationLink}</a> <br><br>
			
						Z poważaniem,<br>
						Biuro Mountain Apartments
						`

			for (const recipient of eventDetails?.property?.emailNotification || []) {
				if (!recipient) continue
				await Promise.all([
					sendMailSDC({
						to: recipient,
						subject: `Nowa rezerwacja z ${eventDetails.source || ""}  || ID: ${event.payload.eventId || ""}`,
						html: `Daty: ${format(new Date(event.payload.startDate), "yyyy-MM-dd")} - ${format(new Date(event.payload.endDate), "yyyy-MM-dd")}
						Miejsce: ${eventDetails.property?.name || "niezdefiniowane"} w ${eventDetails.property?.location || "niezdefiniowanej lokalizacji"}
						Z poważaniem,<br>
						Biuro Mountain Apartments
						`,
					}),
				])
			}
			await Promise.all([
				sendMailSDC({
					to: eventDetails.email,
					subject: "Potwierdzenie rezerwacji",
					html: body,
				}),
				sendMailSDC({
					to: "apartamentymsc@gmail.com",
					subject: `Nowa rezerwacja z ${eventDetails.source || ""} `,
					html: body,
				}),
			])
		} catch (error) {
			console.error("Error sending email notification:", error)
		}
	}
}

export class DeleteNotificationHandler implements EventHandler<EventDeleted> {
	async handle(event: EventDeleted): Promise<void> {
		// Skip notification if eventId is missing (error case)
		if (!event.payload.eventId) {
			console.log("Skipping email notification - missing eventId in payload", event.payload)
			return
		}

		const eventDetails = await prisma.eventsDeleted.findFirst({
			where: { deleted_id: event.payload.eventId },
			include: { property: true },
		})

		if (!eventDetails?.email) return

		const body = `Potwierdzamy usunięcie rezerwacji numer: ${event.payload.eventId} <br>
            Zarezerwowano: ${eventDetails.property?.name} <br>
            Daty: przyjazd ${format(new Date(event.payload.startDate), "yyyy-MM-dd")} 
            wyjazd ${format(new Date(event.payload.endDate), "yyyy-MM-dd")} <br><br>

            Z poważaniem,<br>
            Biuro Mountain Apartments`
		for (const recipient of eventDetails?.property?.emailNotification || []) {
			if (!recipient) continue
			await Promise.all([
				sendMailSDC({
					to: recipient,
					subject: `Nowa rezerwacja z ${eventDetails.source || ""}  || ID: ${event.payload.eventId || ""}`,
					html: `Daty: ${format(new Date(event.payload.startDate), "yyyy-MM-dd")} - ${format(new Date(event.payload.endDate), "yyyy-MM-dd")}
						Miejsce: ${eventDetails.property?.name || "niezdefiniowane"} w ${eventDetails.property?.location || "niezdefiniowanej lokalizacji"}
						Z poważaniem,<br>
						Biuro Mountain Apartments
						`,
				}),
			])
		}
		await Promise.all([
			sendMailSDC({
				to: eventDetails.email,
				subject: "Potwierdzenie usunięcia rezerwacji",
				html: body,
			}),
			sendMailSDC({
				to: "apartamentymsc@gmail.com",
				subject: `Usunięta rezerwacja ${eventDetails.source || ""} ${eventDetails.sourceDescription || ""}`,
				html: body,
			}),
		])
	}
}

export const checkNoBedsAvailability = async ({ room_id, fromdate, todate }: { room_id: number; fromdate: string; todate: string }) => {
	function resetHours(dateToReset: string) {
		const date = parseISO(dateToReset)
		const startOfDate = startOfDay(date)
		const newDateString = format(startOfDate, "yyyy-MM-dd'T'HH:mm:ss")
		return newDateString
	}

	const formattedFromDate = resetHours(fromdate)
	const formattedToDate = resetHours(todate)

	const options = {
		method: "GET",
		url: `https://api.nobeds.com/api/Availability/${NOBEDS_API}`,
		params: {
			room_id,
			fromdate: formattedFromDate,
			todate: formattedToDate,
		},
		headers: { accept: "application/json" },
	}

	try {
		const response = await axios.request(options)
		return response
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		console.error(`Error checking availability for room ${room_id}:`, error)
		return {
			status: error.response?.status || 500,
			statusText: error.response?.statusText || "Error",
			data: null,
			error: error.message || "Unknown error",
		}
	}
}

export class NoBedsAvailabilityHandler implements EventHandler<NoBedsAvailabilityUpdated> {
	async handle(event: NoBedsAvailabilityUpdated): Promise<void> {
		const { room_id, dates, operation } = event.payload

		// We are moving away from direct NoBeds API calls.
		// Logging the event for tracking purposes without executing HTTP requests.
		console.log(
			`[NoBedsAvailabilityHandler] Local handler acknowledging ${operation} for room ${room_id} on dates ${dates.join(", ")}. Skipping external NoBeds API calls.`,
		)
		return
	}
}

export class TelegramDevNotificationHandler implements EventHandler<DomainEvent> {
	// Replace this with your actual dev chat ID
	private readonly devChatId = "1691373957"

	// Map domain events to error categories
	private getErrorCategory(eventType: string): string {
		const errorCategories: Record<string, string> = {
			EVENT_CREATED: "ERROR_EVENT_CREATION",
			EVENT_UPDATED: "ERROR_EVENT_UPDATE",
			EVENT_DELETED: "ERROR_EVENT_DELETION",
			NOBEDS_AVAILABILITY_UPDATED: "ERROR_NOBEDS_AVAILABILITY",
		}

		return errorCategories[eventType] || "ERROR_UNKNOWN"
	}

	async handle(event: DomainEvent): Promise<void> {
		// Skip if the event doesn't have an error payload
		if (!event.error) return

		// Get the appropriate error category
		const errorCategory = this.getErrorCategory(event.type)

		try {
			// Format the message for developers with proper type checking for the error
			const errorMessage = event.error instanceof Error ? event.error.message : String(event.error)

			const errorStack = event.error instanceof Error && event.error.stack ? `\nStack: ${event.error.stack}` : ""

			const message = `
			🚨 ERROR ALERT 🚨
			Category: ${errorCategory}
			User ID: ${event.userId || "N/A"}
			Type: ${event.type}
						Error: ${errorMessage}
			${errorStack}

			Details:
			${JSON.stringify(event.payload, null, 2)}

			Time: ${format(new Date(event.timestamp), "yyyy-MM-dd HH:mm:ss")}
			` // Send the notification via Telegram API using absolute URL
			await fetch("http://localhost:4000/api/send-telegram", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					chatIds: [this.devChatId],
					message,
					propertyName: `${errorCategory} | DEV_ERROR_NOTIFICATION`,
				}),
			})

			// Log error to console with category
			console.error(`[${errorCategory}] Error in ${event.type} operation:`, errorMessage)
		} catch (error) {
			// Just log to console if the notification fails - don't create an infinite loop
			console.error("Failed to send developer error notification:", error)
		}
	}
}
