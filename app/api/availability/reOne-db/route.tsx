/** @format */

import prisma from "@/prisma/prisma"
import { NobedsSearchRequestType } from "@/types"
import { NextRequest, NextResponse } from "next/server"
import dotenv from "dotenv"
import { format, differenceInDays, startOfDay } from "date-fns"
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
	const reqBody = await req.json()
	const { fromdate, todate, guests, propertyName }: NobedsSearchRequestType & { propertyName?: string } = reqBody

	console.log("reOne-db API called with:", { fromdate, todate, guests, propertyName })

	if (!fromdate || !todate || fromdate === "" || todate === "" || !guests || !propertyName) {
		return NextResponse.json({ error: "Missing required fields: dates, guests, or propertyName" })
	}

	try {
		if (!NOBEDS_API) {
			return NextResponse.json({ error: "no api key" })
		}

		// 1. Check if property exists by name for this user
		// First get all properties for this user
		const allUserProperties = await prisma.property.findMany({
			where: {
				userId: "clok0rd6f0000kkdgyf1pd0t3",
				state: "active",
				brand: "MOUNTAIN",
			},
			select: {
				id: true,
				name: true,
				room_id: true,
			},
		})

		// Find property with smart matching: prioritize properties with valid room_id
		// First, filter to only properties that have a valid room_id (not 0 or null)
		const validProperties = allUserProperties.filter((p) => p.room_id && p.room_id > 0)

		let property = validProperties.find((p) => p.name && p.name.toLowerCase() === propertyName.toLowerCase())

		// If no exact match, try "starts with" match
		if (!property) {
			property = validProperties.find((p) => p.name && p.name.toLowerCase().startsWith(propertyName.toLowerCase()))
		}

		// If still no match, try "contains" match (but only if input is at least 3 characters)
		if (!property && propertyName.length >= 3) {
			property = validProperties.find((p) => p.name && p.name.toLowerCase().includes(propertyName.toLowerCase()))
		}

		console.log("Property search result:", {
			propertyName,
			found: !!property,
			property: property ? { id: property.id, name: property.name, room_id: property.room_id } : null,
			validProperties: validProperties.map((p) => ({ id: p.id, name: p.name, room_id: p.room_id })),
			allProperties: allUserProperties.map((p) => ({ id: p.id, name: p.name, room_id: p.room_id })),
		})

		if (!property || !property.room_id) {
			return NextResponse.json({ error: "Property not found or not configured for external availability" })
		}

		// Get full property data
		const fullProperty = await prisma.property.findUnique({
			where: { id: property.id },
			include: {
				images: {
					orderBy: { order: "asc" },
				},
				city: { include: { country: true } },
				place: true, // Include place relation
				personBasedPricings: true,
			},
		})

		if (!fullProperty) {
			return NextResponse.json({ error: "Property data not found" })
		}

		// 2. Calculate extended date range for checking availability
		const userStartDate = startOfDay(new Date(fromdate))
		const userEndDate = startOfDay(new Date(todate))

		// Note: Extended search range logic removed as we only check database availability now

		// 3. CHECK DATABASE AVAILABILITY FIRST
		let propertyResult = null
		const availabilitySource = "database"

		const dbAvailabilities = await prisma.availability.findMany({
			where: {
				propertyId: property.id,
				startDate: {
					lte: format(userStartDate, "yyyy-MM-dd"),
				},
				endDate: {
					gte: format(userEndDate, "yyyy-MM-dd"),
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
							startDate: { lt: userEndDate },
							endDate: { gt: userStartDate },
						},
						// Case 2: Existing event completely contains our period
						{
							startDate: { lte: userStartDate },
							endDate: { gte: userEndDate },
						},
						// Case 3: Our period completely contains existing event
						{
							startDate: { gte: userStartDate },
							endDate: { lte: userEndDate },
						},
					],
				},
			})

			if (!overlappingEvent) {
				const availability = dbAvailabilities[0]
				const numNights = differenceInDays(userEndDate, userStartDate)
				const basePrice = (availability?.price || 0) * numNights
				const totalPrice = getPersonAdjustedPrice(fullProperty, guests, basePrice)
				const minStay = availability?.minStay || 0
				const maxStay = availability?.maxStay || 0
				propertyResult = sanitizeProperty({
					...fullProperty,
					totalPrice,
					minStay,
					maxStay,
					name: property.name,
					available: true,
					source: "database",
				})
			}
		}

		// 4. If no database availability found, check NoBeds cache
		if (!propertyResult) {
			try {
				const cacheEntries = await getSimplifiedCacheEntriesForDateRange(
					property.room_id,
					format(userStartDate, "yyyy-MM-dd"),
					format(userEndDate, "yyyy-MM-dd"),
				)

				// Check if all dates in the range have available quantity > 0
				const hasAvailability = cacheEntries.every((entry) => entry.quantity && entry.quantity > 0)

				if (hasAvailability && cacheEntries.length > 0) {
					// Calculate pricing from cache data
					const totalPriceFromCache = cacheEntries.reduce((acc, entry) => acc + (entry.price || 0), 0)
					const totalPrice = getPersonAdjustedPrice(fullProperty, guests, totalPriceFromCache)

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

					propertyResult = sanitizeProperty({
						...fullProperty,
						totalPrice,
						minStay: finalMinStay,
						maxStay: finalMaxStay,
						name: property.name,
						available: true,
						source: "nobedscache",
					})
				} else {
					// No cache availability, use default availability
					const numNights = differenceInDays(userEndDate, userStartDate)
					const defaultPricePerNight = 150 // Default price per night in PLN
					const basePrice = defaultPricePerNight * numNights
					const totalPrice = getPersonAdjustedPrice(fullProperty, guests, basePrice)

					propertyResult = sanitizeProperty({
						...fullProperty,
						totalPrice,
						minStay: 1, // Default minimum stay
						maxStay: 30, // Default maximum stay
						name: property.name,
						available: true,
						source: "default",
					})
				}
			} catch (error) {
				console.error(`Error checking NoBeds cache for property ${property.id}:`, error)
				// Fallback to default availability if cache check fails
				const numNights = differenceInDays(userEndDate, userStartDate)
				const defaultPricePerNight = 150 // Default price per night in PLN
				const basePrice = defaultPricePerNight * numNights
				const totalPrice = getPersonAdjustedPrice(fullProperty, guests, basePrice)

				propertyResult = sanitizeProperty({
					...fullProperty,
					totalPrice,
					minStay: 1, // Default minimum stay
					maxStay: 30, // Default maximum stay
					name: property.name,
					available: true,
					source: "default",
				})
			}
		}

		return NextResponse.json({
			success: `Property availability checked successfully (${availabilitySource})`,
			property: propertyResult,
		})
	} catch (error: unknown) {
		console.error("Error in reOne-db API:", error)
		if (error instanceof Error) {
			return NextResponse.json({ error: "Cannot check property availability: " + error.message })
		} else {
			return NextResponse.json({ error: "Cannot check property availability" })
		}
	} finally {
		await prisma.$disconnect()
	}
}
