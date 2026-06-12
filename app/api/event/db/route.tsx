/** @format */

import prisma from "@/prisma/prisma"
import { resetHours } from "@/utilities/functions/availability/nobedsManagement"
import { checkInternalAvailability, reduceCacheQuantity } from "@/utilities/functions/nobedsCache"
import { checkOverlappingEvent } from "@/utilities/functions/calendar/overlaps"
import { Event, Property, EventExtendedData } from "@/types"
import { format, subDays, eachDayOfInterval, isSameDay, setHours, setMinutes } from "date-fns"

import { NextRequest, NextResponse } from "next/server"

import { eventBus } from "@/utilities/events/eventBus"
import {
	EmailNotificationHandler,
	// NoBedsAvailabilityHandler,
	UserActivityLogger,
	DeleteNotificationHandler,
	TelegramDevNotificationHandler,
} from "@/utilities/events/handlers"
import {
	generateSecureToken,
	// createMagicLink,
} from "@/utilities/functions/auth/magicLink"
import { EventEntryType } from "@/utilities/types"
import { createEventEntry } from "@/utilities/functions"
import { v4 as uuidv4 } from "uuid"
import { sendMailSDC } from "@/utilities/functions/templates"
import { Prisma } from "@prisma/client"

// Initialize event handlers
const userActivityLogger = new UserActivityLogger()
const emailNotificationHandler = new EmailNotificationHandler()
const deleteNotificationHandler = new DeleteNotificationHandler()
// const noBedsAvailabilityHandler = new NoBedsAvailabilityHandler()
const telegramDevNotificationHandler = new TelegramDevNotificationHandler()

// Subscribe handlers to events
eventBus.subscribe("EVENT_CREATED", userActivityLogger)
eventBus.subscribe("EVENT_UPDATED", userActivityLogger)
eventBus.subscribe("EVENT_DELETED", userActivityLogger)
eventBus.subscribe("EVENT_CREATED", emailNotificationHandler)
eventBus.subscribe("EVENT_DELETED", deleteNotificationHandler)
// // eventBus.subscribe("NOBEDS_AVAILABILITY_UPDATED", noBedsAvailabilityHandler) // Skipping direct NoBeds API calls entirely // Skipping direct NoBeds API calls entirely

// Subscribe telegram dev handler to all events with errors
// NOTE: this route does not send standard Telegram messages to property telegramChatIds for normal EVENT_CREATED.
// Only developer/error notifications and newsletter-related Telegram notifications are sent here.
eventBus.subscribe("EVENT_CREATED", telegramDevNotificationHandler)
eventBus.subscribe("EVENT_UPDATED", telegramDevNotificationHandler)
eventBus.subscribe("EVENT_DELETED", telegramDevNotificationHandler)
eventBus.subscribe("NOBEDS_AVAILABILITY_UPDATED", telegramDevNotificationHandler)

interface RequestBodyPOST {
	event: Event
	property: Property
	id?: string
	source?: string
	offerId?: string
}

function getDatesInRange(startDate: Date, endDate: Date): string[] {
	// For one-day reservations, where endDate is the same as or before startDate after subtracting a day
	if (isSameDay(subDays(new Date(endDate), 1), new Date(startDate)) || subDays(new Date(endDate), 1) < new Date(startDate)) {
		return [format(new Date(startDate), "yyyy-MM-dd")]
	}

	const dates = eachDayOfInterval({
		start: new Date(startDate),
		end: subDays(new Date(endDate), 1), // Subtract one day from end date to exclude departure day
	})
	return dates.map((date) => format(date, "yyyy-MM-dd"))
}

export async function POST(req: NextRequest) {
	try {
		const { event, id, source, offerId }: RequestBodyPOST = await req.json()

		const { room_id, startDate, endDate } = event

		// Get property information early to avoid undefined property references
		const property = await prisma.property.findUnique({
			where: { id: event?.propertyId },
		})

		const user = await prisma.user.findUnique({
			where: { id: id },
		})

		if (!user?.id) {
			// Critical error: Unauthorized access attempt
			await eventBus.publish({
				id: uuidv4(),
				timestamp: new Date(),
				userId: "clok0rd6f0000kkdgyf1pd0t3", // No valid user ID available
				type: "EVENT_CREATED",
				payload: {
					propertyId: Number(event.propertyId || 0),
					startDate: event.startDate,
					endDate: event.endDate,
					source: source || "unknown",
					attemptedId: id,
				},
				error: "Unauthorized attempt to create event",
			})

			return NextResponse.json({ error: "unauthorised" })
		}

		if (!event?.propertyId) {
			// Critical error: Missing required property ID
			await eventBus.publish({
				id: uuidv4(),
				timestamp: new Date(),
				userId: user.id,
				type: "EVENT_CREATED",
				payload: {
					propertyId: 0, // Adding required propertyId property
					startDate: event.startDate,
					endDate: event.endDate,
					source: source || "unknown",
				},
				error: "Missing property ID in event creation",
			})

			return NextResponse.json({
				error: "Cannot create event no property id found for this event",
			})
		}

		if (event?.id) {
			// Critical error: ID provided in POST request
			await eventBus.publish({
				id: uuidv4(),
				timestamp: new Date(),
				userId: user.id,
				type: "EVENT_CREATED",
				payload: {
					eventId: event.id,
					propertyId: Number(event.propertyId),
					startDate: event.startDate,
					endDate: event.endDate,
					source: source || "unknown",
				},
				error: "Event ID provided in POST request - should use PUT instead",
			})

			return NextResponse.json({
				error: "Event id provided although route is to create new event",
			})
		}

		const overlapCheckInHour = property?.checkinInstructionTime ? parseInt(property?.checkinInstructionTime.split(":")[0], 10) || 16 : 16
		const overlapCheckOutHour = property?.checkoutInstructionTime ? parseInt(property?.checkoutInstructionTime.split(":")[0], 10) || 11 : 11
		const eventWithHours = {
			...event,
			startDate: setMinutes(setHours(new Date(startDate), overlapCheckInHour), 0),
			endDate: setMinutes(setHours(new Date(endDate), overlapCheckOutHour), 0),
		}

		// Check if an event with the same properties already exists using our helper function
		const overlappingEvent = await checkOverlappingEvent(eventWithHours)

		if (overlappingEvent) {
			// Critical error: Overlapping events
			await eventBus.publish({
				id: uuidv4(),
				timestamp: new Date(),
				userId: user.id,
				type: "EVENT_CREATED",
				payload: {
					propertyId: Number(event.propertyId),
					startDate: event.startDate,
					endDate: event.endDate,
					source: source || "unknown",
					conflictingEventId: overlappingEvent.id,
				},
				error: "Attempted to create overlapping reservation",
			})

			return NextResponse.json({
				error: "Cannot create event, overlapping with existing event",
			})
		}

		let isOffline = false

		if (room_id && property?.id) {
			const checkin = resetHours(format(new Date(startDate), "yyyy-MM-dd'T'HH:mm:ss"))
			const checkout = resetHours(format(new Date(endDate), "yyyy-MM-dd'T'HH:mm:ss"))

			const available = await checkInternalAvailability(room_id, checkin, checkout)

			if (!available) {
				isOffline = true
			} else {
				try {
					await reduceCacheQuantity(room_id, checkin, checkout)
				} catch (cacheError) {
					console.error("Failed to reduce NoBedsCache quantity:", cacheError)
					isOffline = true
				}
			}
		} else {
			// No room_id - mark as offline
			isOffline = true
		}

		const getHour = (timeStr: string | undefined, fallback: number) => {
			if (!timeStr) return fallback
			const h = parseInt(timeStr.split(":")[0], 10)
			return isNaN(h) ? fallback : h
		}

		const checkinHour = property?.checkinInstructionTime ? getHour(property?.checkinInstructionTime, 16) : 16
		const checkoutHour = property?.checkoutInstructionTime ? getHour(property?.checkoutInstructionTime, 11) : 11

		const startDateFormatted = setMinutes(setHours(new Date(event?.startDate), checkinHour), 0)
		const endDateFormatted = setMinutes(setHours(new Date(event?.endDate), checkoutHour), 0)

		delete event.attributes
		delete event.apartment

		if (isOffline) {
			event.extended = {
				...event.extended,
				offline: true,
			}

			await eventBus.publish({
				id: uuidv4(),
				timestamp: new Date(),
				userId: user.id,
				type: "EVENT_CREATED",
				payload: {
					propertyId: Number(event.propertyId),
					startDate: event.startDate,
					endDate: event.endDate,
					room_id: room_id || undefined,
					source: source || "unknown",
				},
				error: "No availability in NoBedsCache system",
			})

			await sendMailSDC({
				to: "marsidorowicz@gmail.com",
				subject: "Rezerwacja offline - brak dostępności w NoBedsCache",
				html: `Utworzono rezerwację ID: ${event.id}  offline dla nieruchomości ${property?.name} w dniach ${format(event.startDate, "yyyy-MM-dd")} - ${format(event.endDate, "yyyy-MM-dd")}.`,
			})
		}

		const accessToken = generateSecureToken()
		const accessTokenExpiry = endDateFormatted

		const ownerPrice: number | null = null
		// Owner price is calculated in the frontend and should be passed through unchanged.
		// Avoid recalculating it here to prevent double-discounting.

		const eventSaved = await prisma.event.create({
			data: {
				...event,
				price: event.price ? parseFloat(event.price.toString()) : null,
				ownerPrice: ownerPrice || event.ownerPrice,
				startDate: startDateFormatted,
				endDate: endDateFormatted,
				id: undefined,
				placeId: undefined,
				propertyId: undefined,
				userId: undefined,
				Permission: undefined,
				source: source || "msc",
				accessToken,
				accessTokenExpiry,
				user: {
					connect: { id: user.id },
				},
				property: {
					connect: { id: event.propertyId },
				},
				place: {
					connect: { id: event.placeId },
				},
				updated: null,
				...(offerId && {
					convertedOffer: {
						connect: { offerId: offerId },
					},
				}),
			} as unknown as Prisma.EventCreateInput,
			include: { property: { select: { name: true } } },
		})

		if (eventSaved?.id) {
			try {
				await createEventEntry({
					type: EventEntryType.EVENT_ADDED,
					title: "Event Added",
					message: "",
					data: {
						eventType: "calendar_event",
						eventId: eventSaved.id,
						propertyName: eventSaved.property?.name,
						eventName: event.name,
						startDate: event.startDate,
						endDate: event.endDate,
						amountOfPeople: event.amountOfPeople,
						price: event.price,
						source: source || "msc",
						createdByUser: user.name || user.email,
						messageKey: "eventAddedMessage",
					},
					propertyId: event.propertyId,
				})
			} catch (eventEntryError) {
				console.error("Error creating EventEntry for new calendar event:", eventEntryError)
			}
		}

		if (offerId && eventSaved.id) {
			try {
				await prisma.offer.update({
					where: { offerId: offerId },
					data: {
						convertedEventId: eventSaved.id,
					},
				})
				console.log(`Successfully linked offer ${offerId} to event ${eventSaved.id}`)
			} catch (offerError) {
				console.error(`Failed to update offer ${offerId}:`, offerError)
			}
		}

		try {
			const propertyWithTelegram = await prisma.property.findUnique({
				where: { id: event.propertyId },
				select: {
					name: true,
					sendTelegram: true,
					telegramChatIds: true,
				},
			})

			if (propertyWithTelegram?.sendTelegram && propertyWithTelegram?.telegramChatIds?.length > 0) {
				const message = `Nowa rezerwacja:\n${propertyWithTelegram.name}\nPrzyjazd: ${format(new Date(event.startDate), "yyyy-MM-dd")}\nWyjazd: ${format(new Date(event.endDate), "yyyy-MM-dd")}\nOsób: ${event.amountOfPeople}\nŹródło: ${source || "msc"}`

				const telegramResponse = await fetch("http://localhost:4000/api/send-telegram", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						chatIds: propertyWithTelegram.telegramChatIds,
						message: message,
						propertyName: propertyWithTelegram.name,
					}),
				})

				if (!telegramResponse.ok) {
					console.error(`Telegram notification failed with status ${telegramResponse.status}`)
				} else {
					console.log(`Sent Telegram notification for new reservation: ${eventSaved.id}`)
				}
			}
		} catch (telegramError) {
			console.error(`Failed to send Telegram notification for new reservation:`, telegramError)
		}

		const extended = event.extended as EventExtendedData
		if (extended?.newsletter?.accepted) {
			try {
				await prisma.userActivity.create({
					data: {
						userId: user.id,
						activity: "USER_SIGNED_TO NEWSLETTER",
						metadata: {
							eventId: eventSaved.id,
							email: extended.newsletter.email,
							date: extended.newsletter.date,
						},
					},
				})
				console.log(`Logged newsletter signup for user ${user.id}, event ${eventSaved.id}`)
				try {
					const telegramMessage = `Newsletter ma nowego subskrybenta, ${extended.newsletter.email} rezerwacja ${eventSaved.id}`
					const telegramResponse = await fetch("http://localhost:4000/api/send-telegram", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							chatIds: ["1691373957"],
							message: telegramMessage,
							propertyName: "NEWSLETTER",
						}),
					})

					if (!telegramResponse.ok) {
						console.error(`Telegram notification failed with status ${telegramResponse.status}`)
					} else {
						console.log(`Sent Telegram notification for newsletter signup: ${telegramMessage}`)
					}
				} catch (telegramError) {
					console.error(`Failed to send Telegram notification for newsletter signup:`, telegramError)
				}
			} catch (activityError) {
				console.error(`Failed to log newsletter signup activity:`, activityError)
			}
		}

		await eventBus.publish({
			id: uuidv4(),
			timestamp: new Date(),
			userId: user.id,
			type: "EVENT_CREATED",
			payload: {
				eventId: eventSaved.id,
				propertyId: Number(event.propertyId),
				startDate: event.startDate,
				endDate: event.endDate,
				source: source || "msc",
			},
		})

		if (room_id && !isOffline) {
			await eventBus.publish({
				id: uuidv4(),
				timestamp: new Date(),
				userId: user.id,
				type: "NOBEDS_AVAILABILITY_UPDATED",
				payload: {
					room_id,
					dates: getDatesInRange(event.startDate, event.endDate),
					operation: "block",
				},
			})
		}

		if (!eventSaved?.id) {
			await eventBus.publish({
				id: uuidv4(),
				timestamp: new Date(),
				userId: user.id,
				type: "EVENT_CREATED",
				payload: {
					propertyId: Number(event.propertyId),
					startDate: event.startDate,
					endDate: event.endDate,
					source: source || "unknown",
				},
				error: "Event creation in database failed",
			})

			return NextResponse.json({
				success: "Event creation in db failed",
				eventSaved,
			})
		}

		return NextResponse.json({ success: "Event Saved", eventSaved })
	} catch (error) {
		await eventBus.publish({
			id: uuidv4(),
			timestamp: new Date(),
			userId: "clok0rd6f0000kkdgyf1pd0t3",
			type: "EVENT_CREATED",
			payload: {
				error: "Error processing POST request",
				propertyId: 0,
				startDate: new Date(),
				endDate: new Date(),
			},
			error: error instanceof Error ? error : new Error(String(error)),
		})

		return NextResponse.json({ status: 400, error: "Invalid JSON" })
	}
}

export async function PUT() {
	return new NextResponse(JSON.stringify({ error: "PUT is not supported on /api/event/db" }), {
		status: 405,
		headers: { "Content-Type": "application/json" },
	})
}
