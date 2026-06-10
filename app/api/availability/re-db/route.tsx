/** @format */

import prisma from "@/prisma/prisma"
import { NobedsSearchRequestType } from "@/types"
import { NextRequest, NextResponse } from "next/server"
import dotenv from "dotenv"
import { setMinutes, setHours, format, differenceInHours } from "date-fns"
import { getPersonAdjustedPrice } from "@/utilities/functions/pricing/personBasedPricing"
import { getSimplifiedCacheEntriesForDateRange } from "@/utilities/functions/nobedsCache"

dotenv.config()

const NOBEDS_API: string | undefined = process.env.NOBEDS_API_KEY

// Function to sanitize extended data by removing sensitive fields
function sanitizeExtendedData(extended: unknown): unknown {
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
	return sanitized
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
		sanitized.extended = sanitizeExtendedData(sanitized.extended)
	}

	return sanitized
}

export async function POST(req: NextRequest) {
	const { fromdate, todate, guests }: NobedsSearchRequestType = await req.json()

	if (!fromdate || !todate || fromdate === "" || todate === "" || !guests) return NextResponse.json({ error: "Missing dates or guest number" })

	try {
		if (!NOBEDS_API) {
			return NextResponse.json({ error: "no api key" })
		}

		const startDate = setMinutes(setHours(new Date(fromdate), 16), 0o0) // Check-in: 4 PM (16:00)
		const endDate = setMinutes(setHours(new Date(todate), 11), 0o0) // Check-out: 11 AM (11:00)

		const reservationInterval = {
			start: startDate,
			end: endDate,
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
			},
		})

		// 2. Check ALL properties for existing events/reservations (considering real check-in/out times)
		const availableProperties = await Promise.all(
			allProperties.map(async (property) => {
				// Check for existing reservations/events in the database
				const existingEvents = await prisma.event.findMany({
					where: {
						propertyId: property.id,
						AND: [
							{
								OR: [
									// Case 1: Existing event starts before our departure and ends after our arrival
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

		// 5. Handle properties WITH roomId - CHECK DATABASE FIRST, then NoBeds as fallback
		let finalPropertiesWithRoomId = []

		// First, try to get database availability for all properties with room_id
		const dbAvailabilitiesForRoomIdProperties = await prisma.availability.findMany({
			where: {
				propertyId: {
					in: propertiesWithRoomId.map((property) => property.id),
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

		// Process database availability for properties with room_id
		const dbAvailableProperties = (
			await Promise.all(
				dbAvailabilitiesForRoomIdProperties.map(async (availability) => {
					const property = propertiesWithRoomId.find((p) => p.id === availability.propertyId)
					if (!property) return null

					// Check for overlapping events that would block the dates
					// (This is already done above, but double-checking for safety)
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
						source: "database", // Mark as coming from database
					})
				}),
			)
		).filter(Boolean)

		// For properties with room_id that don't have database availability, check NoBeds cache
		const propertiesNeedingCache = propertiesWithRoomId.filter((property) => !dbAvailableProperties.some((p) => p?.id === property.id))

		const cacheAvailableProperties: Record<string, unknown>[] = []

		if (propertiesNeedingCache.length > 0) {
			// Check NoBeds cache for properties that don't have database availability
			for (const property of propertiesNeedingCache) {
				if (!property.room_id) continue

				try {
					const cacheEntries = await getSimplifiedCacheEntriesForDateRange(
						property.room_id,
						format(startDate, "yyyy-MM-dd"),
						format(endDate, "yyyy-MM-dd"),
					)

					// Check if all dates in the range have available quantity > 0
					const hasAvailability = cacheEntries.every((entry) => entry.quantity && entry.quantity > 0)

					if (hasAvailability && cacheEntries.length > 0) {
						// Calculate pricing from cache data
						const totalPriceFromCache = cacheEntries.reduce((acc, entry) => acc + (entry.price || 0), 0)
						const totalPrice = getPersonAdjustedPrice(property, guests, totalPriceFromCache)

						// Get min/max stay from cache (use the most restrictive values)
						// For minStay: use the highest minimum stay requirement (most restrictive)
						// For maxStay: use the lowest maximum stay limit (most restrictive)
						const minStayValues = cacheEntries.map((entry) => entry.minStay || 1).filter((val) => val > 0)
						const maxStayValues = cacheEntries.map((entry) => entry.maxStay || 30).filter((val) => val > 0)

						const minStay = minStayValues.length > 0 ? Math.max(...minStayValues) : 1
						const maxStay = maxStayValues.length > 0 ? Math.min(...maxStayValues) : 30

						// Ensure minStay doesn't exceed maxStay
						const finalMinStay = Math.min(minStay, maxStay)
						const finalMaxStay = Math.max(maxStay, finalMinStay)

						const cleanProperty = sanitizeProperty({
							...property,
							totalPrice,
							minStay: finalMinStay,
							maxStay: finalMaxStay,
							name: property.name,
							source: "nobedscache", // Mark as coming from NoBeds cache
						})

						cacheAvailableProperties.push(cleanProperty)
					}
				} catch (error) {
					console.error(`Error checking NoBeds cache for property ${property.id}:`, error)
					// Skip this property if there's an error
				}
			}
		}

		// Combine database and cache results
		finalPropertiesWithRoomId = [...dbAvailableProperties, ...cacheAvailableProperties]

		// 6. Include properties that passed event check but don't have availability data
		// These properties are considered available by default (no database availability = available)
		const propertiesWithoutAvailabilityData = propertiesAvailableByEvents.filter((property) => {
			const hasDbAvailability =
				finalPropertiesWithoutRoomId.some((p) => p?.id === property.id) || finalPropertiesWithRoomId.some((p) => p?.id === property.id)
			return !hasDbAvailability
		})

		// For properties without availability data, create basic availability with default pricing
		const defaultAvailableProperties = propertiesWithoutAvailabilityData.map((property) => {
			// Use a reasonable default price per night (could be improved with property-specific pricing)
			const defaultPricePerNight = 150 // Default price per night in PLN
			const basePrice = defaultPricePerNight * (numNights || 1)
			const totalPrice = getPersonAdjustedPrice(property, guests, basePrice)

			return sanitizeProperty({
				...property,
				totalPrice,
				minStay: 1, // Default minimum stay
				maxStay: 30, // Default maximum stay
				name: property.name,
				source: "default", // Mark as default availability
			})
		})

		// 7. Combine all available properties
		const allAvailableProperties = [...finalPropertiesWithoutRoomId, ...finalPropertiesWithRoomId.filter(Boolean), ...defaultAvailableProperties]

		if (!allAvailableProperties.length) {
			return NextResponse.json({
				error: "No rooms available for the selected dates and number of guests.",
			})
		}
		return NextResponse.json({
			success: "map availability successful (DB-first)",
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
