/** @format */

import prisma from "@/prisma/prisma"
import { resetHours } from "@/utilities/functions/availability/nobedsManagement"
import { checkNoBedsAvailability } from "@/utilities/functions/availability/nobeds"
import { removeAvailability } from "@/utilities/functions/availability/nobedsManagement"
import { checkOverlappingEvent } from "@/utilities/functions/calendar/overlaps"
import { Event, Property, EventExtendedData } from "@/types"
import { format, subDays, eachDayOfInterval, isSameDay } from "date-fns"

import { NextRequest, NextResponse } from "next/server"

import { eventBus } from "@/utilities/events/eventBus"
import {
	EmailNotificationHandler,
	NoBedsAvailabilityHandler,
	UserActivityLogger,
	DeleteNotificationHandler,
	TelegramDevNotificationHandler,
} from "@/utilities/events/handlers"
import { setHours, setMinutes } from "date-fns"
import {
	generateSecureToken,
	// createMagicLink,
} from "@/utilities/functions/auth/magicLink"
import { getPropertyHour, formatEventDate, tokenNeedsRegeneration } from "@/utilities/functions/auth/reservationToken"
import { v4 as uuidv4 } from "uuid"
import { sendMailSDC } from "@/utilities/functions/templates"
import { Prisma } from "@prisma/client"

// Notification messages by language
type MessageStructure = {
	property: string
	newReservation: string
	updateReservation: string
	cancelReservation: string
	arrivalDate: string
	departureDate: string
	people: string
	source: string
}

const notificationMessages: Record<string, MessageStructure> = {
	en: {
		property: "Property",
		newReservation: "New reservation",
		updateReservation: "Reservation updated",
		cancelReservation: "Reservation cancelled",
		arrivalDate: "Arrival Date",
		departureDate: "Departure Date",
		people: "Number of People",
		source: "Source",
	},
	pl: {
		property: "Obiekt",
		newReservation: "Nowa rezerwacja",
		updateReservation: "Aktualizacja rezerwacji",
		cancelReservation: "Rezerwacja anulowana",
		arrivalDate: "Data przyjazdu",
		departureDate: "Data wyjazdu",
		people: "Liczba osób",
		source: "Źródło",
	},
	it: {
		property: "Proprietà",
		newReservation: "Nuova prenotazione",
		updateReservation: "Prenotazione aggiornata",
		cancelReservation: "Prenotazione cancellata",
		arrivalDate: "Data di arrivo",
		departureDate: "Data di partenza",
		people: "Numero di persone",
		source: "Fonte",
	},
	de: {
		property: "Immobilie",
		newReservation: "Neue Reservierung",
		updateReservation: "Reservierung aktualisiert",
		cancelReservation: "Reservierung storniert",
		arrivalDate: "Anreisedatum",
		departureDate: "Abreisedatum",
		people: "Anzahl der Personen",
		source: "Quelle",
	},
	es: {
		property: "Propiedad",
		newReservation: "Nueva reserva",
		updateReservation: "Reserva actualizada",
		cancelReservation: "Reserva cancelada",
		arrivalDate: "Fecha de llegada",
		departureDate: "Fecha de salida",
		people: "Número de personas",
		source: "Fuente",
	},
	fr: {
		property: "Propriété",
		newReservation: "Nouvelle réservation",
		updateReservation: "Réservation mise à jour",
		cancelReservation: "Réservation annulée",
		arrivalDate: "Date d'arrivée",
		departureDate: "Date de départ",
		people: "Nombre de personnes",
		source: "Source",
	},
}

function getNotificationMessages(lang: string) {
	return notificationMessages[lang] || notificationMessages["pl"]
}
import { EventEntryType } from "@/utilities/types"
import { createEventEntry } from "@/utilities/functions"

// Initialize event handlers
const userActivityLogger = new UserActivityLogger()
const emailNotificationHandler = new EmailNotificationHandler()
const deleteNotificationHandler = new DeleteNotificationHandler()
const noBedsAvailabilityHandler = new NoBedsAvailabilityHandler()
const telegramDevNotificationHandler = new TelegramDevNotificationHandler()

// Subscribe handlers to events
eventBus.subscribe("EVENT_CREATED", userActivityLogger)
eventBus.subscribe("EVENT_UPDATED", userActivityLogger)
eventBus.subscribe("EVENT_DELETED", userActivityLogger)
eventBus.subscribe("EVENT_CREATED", emailNotificationHandler)
eventBus.subscribe("EVENT_DELETED", deleteNotificationHandler)
eventBus.subscribe("NOBEDS_AVAILABILITY_UPDATED", noBedsAvailabilityHandler)

// Subscribe telegram dev handler to all events with errors
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
			startDate: setMinutes(setHours(new Date(event.startDate), overlapCheckInHour), 0),
			endDate: setMinutes(setHours(new Date(event.endDate), overlapCheckOutHour), 0),
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
			// Format dates for NoBeds API
			const checkin = resetHours(format(new Date(startDate), "yyyy-MM-dd'T'HH:mm:ss"))
			// Adjust checkout to be the last day to block (day before departure)
			const adjustedCheckout = resetHours(format(subDays(new Date(endDate), 1), "yyyy-MM-dd'T'HH:mm:ss"))

			interface NoBedsAvailabilityResponse {
				status?: number
				statusText?: string
				data?: NoBedsAvailabilityItem[] | null
				error?: string
			}

			interface NoBedsAvailabilityItem {
				rid: number
				room_id: number
				date: string
				quantity: number
				price: number
				min_stay: number
				max_stay: number
			}

			const availabilityResponse: NoBedsAvailabilityResponse = await checkNoBedsAvailability({
				room_id,
				fromdate: checkin,
				todate: adjustedCheckout,
			})
			const mapPriceAndAvailability: NoBedsAvailabilityItem[] = availabilityResponse?.data || []

			const available =
				mapPriceAndAvailability && mapPriceAndAvailability?.length > 0
					? !mapPriceAndAvailability.some((item: { quantity: number }) => item.quantity === 0)
					: false

			if (!available || availabilityResponse.status !== 200) {
				// Nobeds failed or no availability - mark as offline
				isOffline = true
			} else {
				// Nobeds available - block days in range
				interface RemoveAvailabilityResponse {
					status?: number
					statusText?: string
					data?: unknown
					error?: string
				}

				const removedQuantityResponsesArray: (RemoveAvailabilityResponse | null)[] = await Promise.all(
					mapPriceAndAvailability?.map(async (dayAvailability: NoBedsAvailabilityItem) => {
						const tooManyRoomsAvailable = dayAvailability?.quantity - 1 > property?.roomQuantity
						return await removeAvailability({
							rid: dayAvailability?.rid,
							room_id: dayAvailability?.room_id,
							date: dayAvailability?.date,
							currentAvail: tooManyRoomsAvailable ? 1 : dayAvailability?.quantity,
							price: dayAvailability?.price,
							min_stay: dayAvailability?.min_stay,
							max_stay: dayAvailability?.max_stay,
						})
					}),
				)

				const removedQuantityConfirmed =
					removedQuantityResponsesArray &&
					removedQuantityResponsesArray?.length > 0 &&
					!removedQuantityResponsesArray.some((item) => item?.status !== 200 || item?.statusText !== "OK")

				if (!removedQuantityConfirmed) {
					// Critical error: Failed to block dates
					await eventBus.publish({
						id: uuidv4(),
						timestamp: new Date(),
						userId: user.id,
						type: "NOBEDS_AVAILABILITY_UPDATED",
						payload: {
							room_id,
							dates: getDatesInRange(event.startDate, event.endDate),
							operation: "block",
							propertyId: Number(event.propertyId),
						},
						error: "Failed to block dates in NoBeds system",
					})

					// Rollback - release any days that were blocked
					await eventBus.publish({
						id: uuidv4(),
						timestamp: new Date(),
						userId: user.id, // Using user.id instead of id
						type: "NOBEDS_AVAILABILITY_UPDATED",
						payload: {
							room_id,
							dates: getDatesInRange(event.startDate, event.endDate),
							operation: "release",
						},
					})

					return NextResponse.json({
						status: 400,
						error: "Failed to block dates in NoBeds system",
					})
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

		const startDateFormatted = setMinutes(setHours(new Date(event?.startDate), checkinHour), 0) // Check-in at property hour
		const endDateFormatted = setMinutes(setHours(new Date(event?.endDate), checkoutHour), 0) // Check-out at property hour

		delete event.attributes
		delete event.apartment

		// Set offline flag if Nobeds is unavailable or property has no room_id
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
				error: "No availability in NoBeds system",
			})

			await sendMailSDC({
				to: "marsidorowicz@gmail.com",
				subject: "Rezerwacja offline - brak dostępności w NoBeds",
				html: `Utworzono rezerwację ID: ${event.id}  offline dla nieruchomości ${property?.name} w dniach ${format(event.startDate, "yyyy-MM-dd")} - ${format(event.endDate, "yyyy-MM-dd")}.`,
			})
		}

		// Generate access token for secure magic link access to reservation details
		const accessToken = generateSecureToken()
		// Set token expiry date to match the event end date
		const accessTokenExpiry = new Date(endDateFormatted)

		// Calculate owner price for events with room_id before creating the event
		let ownerPrice: number | null = null
		if (property?.room_id) {
			try {
				// Primary method: Get NoBeds pricing for the date range
				const checkinStr = format(new Date(startDateFormatted), "yyyy-MM-dd'T'00:00:00")
				const adjustedCheckoutStr = format(subDays(new Date(endDateFormatted), 1), "yyyy-MM-dd'T'00:00:00")

				const availabilityResponse = await checkNoBedsAvailability({
					room_id: property.room_id,
					fromdate: checkinStr,
					todate: adjustedCheckoutStr,
				})

				let nobedsTotalBasePrice = 0
				const data = availabilityResponse?.data || []
				if (data && Array.isArray(data) && data.length > 0) {
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					nobedsTotalBasePrice = data.reduce((sum: number, day: any) => sum + (day.price || 0), 0)
				}

				// Deduct ownerPriceDiscount from nobeds total if passed
				const extendedData = event.extended as Record<string, unknown> | undefined
				if (extendedData && typeof extendedData.ownerPriceDiscount === "number") {
					nobedsTotalBasePrice = Math.max(0, nobedsTotalBasePrice - extendedData.ownerPriceDiscount)
					console.log("Reduced nobedsTotalBasePrice by discount:", extendedData.ownerPriceDiscount)
				}

				ownerPrice = nobedsTotalBasePrice > 0 ? nobedsTotalBasePrice : null
				if (ownerPrice !== null) {
					console.log(`Calculated owner price for new reservation: ${ownerPrice} (NoBeds: ${nobedsTotalBasePrice > 0 ? "used" : "fallback"})`)
				}
			} catch (ownerPriceError) {
				console.error(`Failed to calculate owner price for new event:`, ownerPriceError)
			}
		}

		const eventSaved = await prisma.event.create({
			data: {
				...event,
				price: event.price ? parseFloat(event.price.toString()) : null,
				ownerPrice: event.ownerPrice || ownerPrice,
				startDate: new Date(startDateFormatted),
				endDate: new Date(endDateFormatted),
				id: undefined,
				placeId: undefined,
				propertyId: undefined,
				userId: undefined,
				Permission: undefined,
				source: source || "msc",
				// Add security features
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
			// Create EventEntry notification for new calendar event
			try {
				// Create event entry for new calendar event using the utility function
				await createEventEntry({
					type: EventEntryType.EVENT_ADDED,
					title: "Event Added",
					message: "", // Will be constructed on client side
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
				// Don't fail the event creation if notification creation fails
			}
		}

		console.log(`Event created with ID: ${eventSaved.id} for property: ${event?.property?.name}`)

		// If offerId is provided, update the offer to link to this event
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
				// Don't fail the whole booking if offer update fails
			}
		}

		// Log newsletter signup if accepted
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

				// Send Telegram notification for newsletter signup
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
				// Don't fail the booking if activity logging fails
			}
		}

		// Publish EVENT_CREATED event
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
			// Publish NOBEDS_AVAILABILITY_UPDATED event only if we actually blocked in Nobeds
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
			// Critical error: Event DB creation failed
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

		// Send Telegram notification for new reservation if enabled
		try {
			// Fetch property with telegram settings
			const propertyWithTelegram = await prisma.property.findUnique({
				where: { id: event.propertyId },
				select: {
					name: true,
					sendTelegram: true,
					telegramChatIds: true,
					lang: true,
				},
			})

			if (propertyWithTelegram?.sendTelegram && propertyWithTelegram?.telegramChatIds?.length > 0) {
				// Get messages based on the property's language setting
				const lang = propertyWithTelegram.lang || "pl"
				const messages = getNotificationMessages(lang)

				// Build message with translated labels
				const message = `
${messages.newReservation}:
${messages.property}: ${propertyWithTelegram.name}
${messages.arrivalDate}: ${format(new Date(event.startDate), "yyyy-MM-dd")}
${messages.departureDate}: ${format(new Date(event.endDate), "yyyy-MM-dd")}
${messages.people}: ${event.amountOfPeople}
${messages.source}: ${source || "msc"}
`

				// Send to all configured Telegram chat IDs
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
			// Don't fail the event creation if notification fails
		}

		return NextResponse.json({ success: "Event Saved", eventSaved })
	} catch (error) {
		// Critical error: Exception during POST request
		await eventBus.publish({
			id: uuidv4(),
			timestamp: new Date(),
			userId: "clok0rd6f0000kkdgyf1pd0t3",
			type: "EVENT_CREATED",
			payload: {
				error: "Error processing POST request",
				propertyId: 0, // Add required propertyId property
				startDate: new Date(), // Add required startDate property
				endDate: new Date(), // Add required endDate property
			},
			error: error instanceof Error ? error : new Error(String(error)),
		})

		return NextResponse.json({ status: 400, error: "Invalid JSON" })
	}
}

export async function PUT(req: NextRequest) {
	try {
		const { event, offerId }: RequestBodyPOST = await req.json()

		let eventSaved
		let available
		delete event?.date
		delete event?.type

		const { room_id, startDate, endDate } = event
		if (!event || !startDate || !endDate) {
			// Critical error: Missing required fields
			await eventBus.publish({
				id: uuidv4(),
				timestamp: new Date(),
				userId: "clok0rd6f0000kkdgyf1pd0t3",
				type: "EVENT_UPDATED",
				payload: {
					eventId: event?.id || 0,
					propertyId: Number(event?.propertyId || 0),
					fields: {
						event: !!event,
						startDate: !!startDate,
						endDate: !!endDate,
					},
				},
				error: "Missing required fields for event update",
			})

			return NextResponse.json({
				status: 400,
				error: "no email or no event provided",
			})
		}

		const user = await prisma.user.findUnique({
			where: { id: event?.userId },
		})

		if (!user?.id) {
			// Critical error: Unauthorized update attempt
			await eventBus.publish({
				id: uuidv4(),
				timestamp: new Date(),
				userId: "clok0rd6f0000kkdgyf1pd0t3",
				type: "EVENT_UPDATED",
				payload: {
					eventId: event?.id || 0,
					propertyId: Number(event?.propertyId || 0),
					userId: event?.userId,
				},
				error: "Unauthorized attempt to update event",
			})

			return NextResponse.json({ status: 400, error: "unauthorised" })
		}

		if (!event?.id) {
			// Critical error: Missing event ID
			await eventBus.publish({
				id: uuidv4(),
				timestamp: new Date(),
				userId: user.id,
				type: "EVENT_UPDATED",
				payload: {
					propertyId: Number(event.propertyId || 0),
					startDate: event.startDate,
					endDate: event.endDate,
				},
				error: "Missing event ID in PUT request",
			})

			return NextResponse.json({ status: 400, error: "no id" })
		}

		// Check if an event with the same properties already exists
		const property = await prisma.property.findUnique({
			where: { id: event?.propertyId, placeId: event?.placeId },
		})
		// Check if an event with the same properties already exists using our helper function
		// Make sure the event has the necessary placeId and propertyId
		if (!event.placeId && property?.placeId) {
			event.placeId = property.placeId
		}
		if (!event.propertyId && property?.id) {
			event.propertyId = property.id
		}

		const overlappingEvent = await checkOverlappingEvent(event, event.id)

		if (overlappingEvent && overlappingEvent?.id !== event?.id) {
			return NextResponse.json({
				status: "error",
				message: "Cannot create event, overlapping with existing event",
			})
		}

		//check if trully in db
		const existingInDb = await prisma.event.findFirst({
			where: {
				AND: [
					{ id: event?.id },
					// Add other properties as needed
				],
			},
			include: {
				property: true,
				place: true,
			},
		})

		if (!existingInDb) {
			// Critical error: Event not found in database
			await eventBus.publish({
				id: uuidv4(),
				timestamp: new Date(),
				userId: user.id,
				type: "EVENT_UPDATED",
				payload: {
					eventId: event.id,
					propertyId: Number(event.propertyId || 0),
				},
				error: "Event ID provided but not found in database",
			})

			return NextResponse.json({
				status: 400,
				error: "Error adding reservation, has id, but not found in db",
			})
		}

		const isReservationUnchanged = (newStartDate: Date, newEndDate: Date, existingStartDate: Date, existingEndDate: Date) => {
			// Compare only the check-in and the last night (not departure day)
			return (
				format(new Date(newStartDate), "yyyy-MM-dd") === format(new Date(existingStartDate), "yyyy-MM-dd") &&
				format(subDays(new Date(newEndDate), 1), "yyyy-MM-dd") === format(subDays(new Date(existingEndDate), 1), "yyyy-MM-dd")
			)
		}

		try {
			if (room_id && existingInDb?.id && property?.id) {
				// Get the dates arrays using our consistent getDatesInRange function
				const existingDates = getDatesInRange(new Date(existingInDb?.startDate), new Date(existingInDb?.endDate))
				const newDates = getDatesInRange(new Date(event.startDate), new Date(event.endDate))

				// Find dates to update
				const toReleaseDays = existingDates.filter((date) => !newDates.includes(date))
				const toBlockDays = newDates.filter((date) => !existingDates.includes(date))

				const isUnChangedDateRange = isReservationUnchanged(
					new Date(event.startDate),
					new Date(event.endDate),
					new Date(existingInDb?.startDate),
					new Date(existingInDb?.endDate),
				)

				// Compare existing reservation with updated reservation
				if (isUnChangedDateRange) {
					// Check if any other fields have changed
					const fieldsToCompare = [
						"name",
						"email",
						"phone",
						"persons",
						"notes",
						"source",
						"sourceDescription",
						"status",
						"passcode",
						"price",
						"deposit",
						"depositReturned",
						"total",
						"tax",
					] as const

					type EventField = (typeof fieldsToCompare)[number]
					type Changes = {
						[K in EventField]?: {
							from: unknown
							to: unknown
						}
					}

					const changes = fieldsToCompare.reduce((acc: Changes, field) => {
						if (existingInDb[field as keyof typeof existingInDb] !== event[field as keyof typeof event]) {
							acc[field] = {
								from: existingInDb[field as keyof typeof existingInDb],
								to: event[field as keyof typeof event],
							}
						}
						return acc
					}, {})

					const hasFieldChanges = Object.keys(changes).length > 0

					if (hasFieldChanges) {
						// Publish EVENT_UPDATED event for field changes
						await eventBus.publish({
							id: uuidv4(),
							timestamp: new Date(),
							userId: user.id,
							type: "EVENT_UPDATED",
							payload: {
								eventId: event.id,
								propertyId: Number(event.propertyId),
								changes,
							},
						})
					}
				} else {
					// Publish EVENT_UPDATED event for date changes
					await eventBus.publish({
						id: uuidv4(),
						timestamp: new Date(),
						userId: user.id,
						type: "EVENT_UPDATED",
						payload: {
							eventId: event.id,
							propertyId: Number(event.propertyId),
							startDate: event.startDate,
							endDate: event.endDate,
							changes: {
								startDate: {
									from: existingInDb.startDate,
									to: event.startDate,
								},
								endDate: {
									from: existingInDb.endDate,
									to: event.endDate,
								},
							},
						},
					})

					if (room_id) {
						// Release old dates
						if (toReleaseDays?.length > 0) {
							await eventBus.publish({
								id: uuidv4(),
								timestamp: new Date(),
								userId: user.id,
								type: "NOBEDS_AVAILABILITY_UPDATED",
								payload: {
									room_id,
									dates: toReleaseDays,
									operation: "release",
								},
							})
						}

						// Block new dates
						if (toBlockDays?.length > 0) {
							await eventBus.publish({
								id: uuidv4(),
								timestamp: new Date(),
								userId: user.id,
								type: "NOBEDS_AVAILABILITY_UPDATED",
								payload: {
									room_id,
									dates: toBlockDays,
									operation: "block",
								},
							})
						}
					}
				}
			}

			// Get the property-specific check-in/checkout hours
			const checkinHour = property?.checkinInstructionTime ? getPropertyHour(property?.checkinInstructionTime, 16) : 16
			const checkoutHour = property?.checkoutInstructionTime ? getPropertyHour(property?.checkoutInstructionTime, 11) : 11

			// Format the dates with proper check-in/out hours
			const startDateFormatted = formatEventDate(event.startDate, checkinHour)
			const endDateFormatted = formatEventDate(event.endDate, checkoutHour) // Use token regeneration logic that considers only date changes
			const needsNewToken = tokenNeedsRegeneration(existingInDb.accessToken, existingInDb.accessTokenExpiry, endDateFormatted)

			// Generate token data updates if needed
			const tokenData = needsNewToken
				? {
						accessToken: generateSecureToken(),
						accessTokenExpiry: new Date(endDateFormatted), // Update token and expiry date
					}
				: {}

			eventSaved = await prisma.event.update({
				where: {
					id: event.id,
					userId: event.userId,
					propertyId: event?.propertyId,
				},
				data: {
					...event,
					price: event.price ? parseFloat(event.price.toString()) : null,
					...tokenData, // Include any token expiry updates
					startDate: startDateFormatted,
					endDate: endDateFormatted,
					place: undefined,
					id: undefined,
					user: undefined,
					property: undefined,
					Permission: undefined,
					placeId: undefined,
					propertyId: undefined,
					userId: undefined,
					convertedOffer: undefined,
					updated: event?.updated?.toString() || null,
					...(offerId && {
						convertedOffer: {
							connect: { offerId: offerId },
						},
					}),
				} as unknown as Prisma.EventUpdateInput,
			})

			console.log(`Event updated with ID: ${eventSaved.id} for property: ${event?.property?.name}`)

			// Send Telegram notification for event update if enabled
			try {
				// Fetch property with telegram settings
				const propertyWithTelegram = await prisma.property.findUnique({
					where: { id: event.propertyId },
					select: {
						name: true,
						sendTelegram: true,
						telegramChatIds: true,
						lang: true,
					},
				})

				if (propertyWithTelegram?.sendTelegram && propertyWithTelegram?.telegramChatIds?.length > 0) {
					// Get messages based on the property's language setting
					const lang = propertyWithTelegram.lang || "pl"
					const messages = getNotificationMessages(lang)

					// Build message with translated labels
					const message = `
${messages.updateReservation}:
${messages.property}: ${propertyWithTelegram.name}
${messages.arrivalDate}: ${format(new Date(event.startDate), "yyyy-MM-dd")}
${messages.departureDate}: ${format(new Date(event.endDate), "yyyy-MM-dd")}
${messages.people}: ${event.amountOfPeople}
${messages.source}: ${event.source || "msc"}
`

					// Send to all configured Telegram chat IDs
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
						console.log(`Sent Telegram notification for event update: ${eventSaved.id}`)
					}
				}
			} catch (telegramError) {
				console.error(`Failed to send Telegram notification for event update:`, telegramError)
				// Don't fail the event update if notification fails
			}

			if (!room_id && eventSaved?.id)
				return NextResponse.json({
					status: 201,
					success: "Updated in db, but no room_id, skipping CM",
				})
			if (room_id && eventSaved?.id && !available)
				return NextResponse.json({
					status: 201,
					success: "Updated in db, but not available not in CM",
				})
			if (room_id && eventSaved?.id && available)
				return NextResponse.json({
					status: 201,
					success: "Updated in CM and db",
				})
		} catch (error) {
			// Critical error: Error during event update
			await eventBus.publish({
				id: uuidv4(),
				timestamp: new Date(),
				userId: user.id,
				type: "EVENT_UPDATED",
				payload: {
					eventId: event.id,
					propertyId: Number(event.propertyId || 0),
					startDate: event.startDate,
					endDate: event.endDate,
				},
				error: error instanceof Error ? error : new Error(String(error)),
			})

			return NextResponse.json({
				status: "error",
				message: "Error updating event",
			})
		} finally {
			await prisma.$disconnect()
		}
	} catch (error) {
		// Critical error: Exception during PUT request
		await eventBus.publish({
			id: uuidv4(),
			timestamp: new Date(),
			userId: "clok0rd6f0000kkdgyf1pd0t3",
			type: "EVENT_UPDATED",
			payload: {
				propertyId: 0, // Add required property
				error: "Error processing PUT request",
			},
			error: error instanceof Error ? error : new Error(String(error)),
		})

		return NextResponse.json({ status: 400, error: "Invalid JSON" })
	}
}
