/** @format */

import prisma from "@/prisma/prisma"
import { NobedsSearchRequestType } from "@/types"
import { NextRequest, NextResponse } from "next/server"
import dotenv from "dotenv"
import { subDays, parseISO, setMinutes, setHours, format, differenceInHours, eachDayOfInterval } from "date-fns"
import { checkNoBedsAvailabilityAll } from "@/utilities/functions/availability/nobeds"
import { getPersonAdjustedPrice } from "@/utilities/functions/pricing/personBasedPricing"

dotenv.config()

const NOBEDS_API: string | undefined = process.env.NOBEDS_API_KEY

// Create limiter to prevent 429 errors (max 10 concurrent Nobeds API requests)
// const limitNobedsRequests = createLimiter(10, 100) // Limit to 10 concurrent requests with 100ms delay between starts

import { JsonValue } from "@prisma/client/runtime/library"

// Function to sanitize extended data by removing sensitive fields
function sanitizeExtendedData(extended: JsonValue): JsonValue {
	if (!extended || typeof extended !== "object" || Array.isArray(extended)) return extended

	const safeFields = [
		"title",
		"keywords",
		"minPrice",
		"platnosc",
		"apartament",
		"petFee",
		"petsMax",
		"petsAllowed",
		"tabelka",
		"babyCribFee",
		"babyCribAllowed",
		"breakfastFee",
		"breakfastAllowed",
	]

	const sanitized: Record<string, unknown> = {}
	for (const field of safeFields) {
		if ((extended as Record<string, unknown>)[field] !== undefined) {
			sanitized[field] = (extended as Record<string, unknown>)[field]
		}
	}
	return sanitized as JsonValue
}

// Function to sanitize property data by removing sensitive fields
function sanitizeProperty(property: Record<string, unknown>) {
	if (!property || typeof property !== "object") return property

	const sensitiveFields = ["emailNotification", "telegramChatIds", "sendTelegram", "htmlDetails", "ownerReceivePayment", "commissionSettings"]

	const sanitized = { ...property }
	for (const field of sensitiveFields) {
		delete sanitized[field]
	}

	// Also sanitize the extended field
	if (sanitized.extended) {
		sanitized.extended = sanitizeExtendedData(sanitized.extended as JsonValue)
	}

	return sanitized
}

export async function POST(req: NextRequest) {
	const { fromdate, todate, guests }: NobedsSearchRequestType = await req.json()

	if (!fromdate || !todate || fromdate === "" || todate === "" || !guests) return NextResponse.json({ error: "Missing dates or guest number" })
	// const checkin = resetHours(format(parseISO(fromdate), "yyyy-MM-dd'T'HH:mm:ss"))
	// const checkout = resetHours(format(parseISO(todate), "yyyy-MM-dd'T'HH:mm:ss"))

	// Subtract one day from the checkout date

	try {
		if (!NOBEDS_API) {
			return NextResponse.json({ error: "no api key" })
		}

		// Remove user validation for public availability access
		// const user = await prisma.user.findUnique({
		// 	where: { id: id },
		// })

		// if (!user?.id) {
		// 	return NextResponse.json({ error: "unauthorised" })
		// }

		const startDate = setMinutes(setHours(new Date(fromdate), 16), 0o0) // Check-in: 4 PM (16:00)
		const endDate = setMinutes(setHours(new Date(todate), 11), 0o0) // Check-out: 11 AM (11:00)
		const adjustedCheckout = subDays(parseISO(todate), 1).toISOString()

		const reservationInterval = {
			start: new Date(fromdate),
			end: new Date(endDate),
		}

		const reservationLengthInHours = reservationInterval ? differenceInHours(reservationInterval.end, reservationInterval.start) : null

		const numNights = reservationLengthInHours ? Math.ceil(reservationLengthInHours / 24) : null

		// 1. Get ALL properties first
		const allProperties = await prisma.property.findMany({
			where: {
				state: "active",
				userId: "clok0rd6f0000kkdgyf1pd0t3",
				brand: "MOUNTAIN",
			},
			include: {
				images: {
					orderBy: { order: "asc" },
				},
				city: { include: { country: true } },
				place: true, // Include place relation
				personBasedPricings: true, // Include person-based pricing data
				// Note: NOT including availabilities here - we'll fetch them separately based on roomId
			},
		})

		// 2. Check ALL properties for existing events/reservations (considering real check-in/out times)
		const availableProperties = await Promise.all(
			allProperties.map(async (property) => {
				// Check for existing reservations/events in the database
				// Account for real arrival/departure times:
				// - New reservation: arrives at 16:00 (4 PM), departs at 11:00 (11 AM)
				// - Existing events: also follow same pattern
				// - Gap needed: departure 11:00 -> arrival 16:00 (5 hour gap for cleaning)
				const existingEvents = await prisma.event.findMany({
					where: {
						propertyId: property.id,
						AND: [
							{
								OR: [
									// Case 1: Existing event starts before our departure and ends after our arrival
									// This means there's an overlap in the actual stay period
									{
										startDate: { lt: endDate }, // Existing starts before we leave
										endDate: { gt: startDate }, // Existing ends after we arrive
									},
									// Case 2: Our reservation completely contains an existing event
									{
										startDate: { gte: startDate },
										endDate: { lte: endDate },
									},
									// Case 3: Existing event completely contains our reservation
									{
										startDate: { lte: startDate },
										endDate: { gte: endDate },
									},
								],
							},
						],
					},
					select: { startDate: true, endDate: true },
				})

				// If there are existing events that overlap with real check-in/out times, property is not available
				if (existingEvents.length > 0) {
					return null
				}

				return property
			}),
		)

		// Filter out null values (properties with overlapping events)
		const propertiesAvailableByEvents = availableProperties.filter((property) => property !== null)

		// 3. Split properties by roomId presence
		const propertiesWithRoomId = propertiesAvailableByEvents.filter((property) => property?.room_id !== null && property?.room_id !== 0)
		const propertiesWithoutRoomId = propertiesAvailableByEvents.filter((property) => property?.room_id === null || property?.room_id === 0)

		// 4. Handle properties WITHOUT roomId (use database availability)
		const databaseAvailabilities = await prisma.availability.findMany({
			where: {
				propertyId: {
					in: propertiesWithoutRoomId.map((property) => property.id),
				},
				startDate: {
					lte: format(startDate, "yyyy-MM-dd"),
				},
				endDate: {
					gte: format(endDate, "yyyy-MM-dd"),
				},
				property: {
					state: "active",
				},
			},
			include: {
				weekPrices: true,
			},
		})

		const finalPropertiesWithoutRoomId = databaseAvailabilities
			.map((availability) => {
				const property = propertiesWithoutRoomId.find((p) => p.id === availability.propertyId)
				if (!property) return null

				const basePrice = (availability?.price || 0) * (numNights || 0)
				// Apply person-based pricing adjustment
				const totalPrice = getPersonAdjustedPrice(property, guests, basePrice)
				const minStay = availability?.minStay || 0
				const maxStay = availability?.maxStay || 0

				return sanitizeProperty({
					...property,
					totalPrice,
					minStay,
					maxStay,
					name: property.name, // Explicitly ensure name is included
				})
			})
			.filter(Boolean)

		// Call NoBeds API for all properties at once
		const allNobedsResponse = await checkNoBedsAvailabilityAll({
			fromdate: fromdate,
			todate: adjustedCheckout,
		})

		let finalPropertiesWithRoomId = []

		if (allNobedsResponse.status !== 200 || !allNobedsResponse.data) {
			console.error(
				`NoBeds API failed for all properties with status ${allNobedsResponse.status}:`,
				"error" in allNobedsResponse ? allNobedsResponse.error : "Unknown error",
			)
			// Fall back to DB availability for all properties with room_id
			finalPropertiesWithRoomId = await Promise.all(
				propertiesWithRoomId.map(async (property) => {
					const dbAvailabilities = await prisma.availability.findMany({
						where: {
							propertyId: property.id,
							startDate: {
								lte: format(startDate, "yyyy-MM-dd"),
							},
							endDate: {
								gte: format(endDate, "yyyy-MM-dd"),
							},
							property: {
								state: "active",
							},
						},
						include: {
							weekPrices: true,
						},
					})

					if (dbAvailabilities.length > 0) {
						// Check for overlapping events that would block the dates
						const overlappingEvent = await prisma.event.findFirst({
							where: {
								propertyId: property.id,
								OR: [
									// Case 1: Existing event starts before our end and ends after our start
									{
										startDate: { lt: endDate },
										endDate: { gt: startDate },
									},
									// Case 2: Existing event completely contains our period
									{
										startDate: { lte: startDate },
										endDate: { gte: endDate },
									},
									// Case 3: Our period completely contains existing event
									{
										startDate: { gte: startDate },
										endDate: { lte: endDate },
									},
								],
							},
						})

						if (overlappingEvent) {
							return null
						}

						const availability = dbAvailabilities[0]
						const basePrice = (availability?.price || 0) * (numNights || 0)
						const totalPrice = getPersonAdjustedPrice(property, guests, basePrice)
						const minStay = availability?.minStay || 0
						const maxStay = availability?.maxStay || 0
						return sanitizeProperty({
							...property,
							totalPrice,
							minStay,
							maxStay,
							name: property.name,
						})
					} else {
						return null
					}
				}),
			).then((results) => results.filter(Boolean))
		} else {
			// Process the NoBeds data for each property
			finalPropertiesWithRoomId = propertiesWithRoomId
				.map((property) => {
					if (!property.room_id) return null

					// Filter the array for records matching this property's room_id
					const roomData = allNobedsResponse.data.filter((item: Record<string, unknown>) => item.room_id === property.room_id)
					if (!roomData || roomData.length < 1) {
						return null
					}

					const noBedsData = roomData

					// Check all requested dates for quantity availability
					const allRequestedDates =
						format(new Date(fromdate), "yyyy-MM-dd") !== format(new Date(adjustedCheckout), "yyyy-MM-dd")
							? eachDayOfInterval({
									start: new Date(fromdate),
									end: new Date(adjustedCheckout),
								}).map((date) => format(date, "yyyy-MM-dd"))
							: [format(new Date(fromdate), "yyyy-MM-dd")]

					const hasQuantityAvailability = allRequestedDates.every((date: string) => {
						const dayData = noBedsData.find((day: { date: string; quantity: number }) => format(new Date(day.date), "yyyy-MM-dd") === date)
						return dayData && dayData.quantity > 0
					})

					if (!hasQuantityAvailability) {
						console.log("Returning null due to no quantity availability for property", property.id)
						return null
					}

					// Calculate NoBeds values
					const baseTotalPrice = noBedsData.reduce((acc: number, day: { price: number }) => acc + day.price, 0)
					// Apply person-based pricing adjustment to NoBeds price
					const totalPrice = getPersonAdjustedPrice(property, guests, baseTotalPrice)
					const minStay = Math.max(...noBedsData.map((day: { min_stay: number }) => day.min_stay || 1))
					const maxStay = Math.min(...noBedsData.map((day: { max_stay: number }) => day.max_stay || Infinity).filter((max: number) => max > 0))

					// Create clean property object with only NoBeds values
					// Explicitly exclude any potential database availability values
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					const { availabilities, ...cleanProperty } = property as Record<string, unknown> & { availabilities?: unknown }

					// Return clean property object with NoBeds values explicitly set
					const result = {
						...cleanProperty,
						totalPrice,
						minStay, // NoBeds value (should be 2-60)
						maxStay, // NoBeds value (should be 2-60)
						// Ensure no database availability values can interfere
						roomId: property.room_id, // Keep roomId for reference
						name: property.name, // Explicitly ensure name is included
						extended: sanitizeExtendedData(cleanProperty.extended as JsonValue),
					}
					result.minStay = minStay
					result.maxStay = maxStay

					return sanitizeProperty(result)
				})
				.filter(Boolean)
		}

		// 6. Combine both arrays into one consistent result
		const allAvailableProperties = [...finalPropertiesWithoutRoomId, ...finalPropertiesWithRoomId.filter(Boolean)]

		if (!allAvailableProperties.length) {
			return NextResponse.json({
				error: "No rooms available for the selected dates and number of guests.",
			})
		}
		return NextResponse.json({
			success: "map availability successful",
			availableRoomDetails: allAvailableProperties,
		})
	} catch (error: unknown) {
		if (error instanceof Error) {
			return NextResponse.json({ error: "cannot map availability" })
		} else {
			return NextResponse.json({ error: "cannot map availability" })
		}
	} finally {
		await prisma.$disconnect()
	}
}
