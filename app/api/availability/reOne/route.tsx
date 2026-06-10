/** @format */

import prisma from "@/prisma/prisma"
import { NobedsSearchRequestType } from "@/types"
import { NextRequest, NextResponse } from "next/server"
import dotenv from "dotenv"
import { subDays, parseISO, format, differenceInDays, eachDayOfInterval, addDays, startOfDay } from "date-fns"
import { checkNoBedsAvailability } from "@/utilities/functions/availability/nobeds"
import { getPersonAdjustedPrice } from "@/utilities/functions/pricing/personBasedPricing"
import { JsonValue } from "@prisma/client/runtime/library"

dotenv.config()

const NOBEDS_API: string | undefined = process.env.NOBEDS_API_KEY

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
	const reqBody = await req.json()
	const { fromdate, todate, guests, propertyName }: NobedsSearchRequestType & { propertyName?: string } = reqBody

	console.log("reOne API called with:", { fromdate, todate, guests, propertyName })

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
		const today = startOfDay(new Date())
		const userStartDate = startOfDay(new Date(fromdate))
		const userEndDate = startOfDay(new Date(todate))
		const daysToArrival = differenceInDays(userStartDate, today)

		// Determine search range: max 15 days before arrival, total 30 days
		let searchStartDate: Date

		if (daysToArrival > 15) {
			// Arrival is more than 15 days away, search from 15 days before arrival
			searchStartDate = addDays(userStartDate, -15)
		} else if (daysToArrival > 0) {
			// Arrival is within 15 days, search from today
			searchStartDate = today
		} else {
			// Arrival is today or in the past, search from user start date
			searchStartDate = userStartDate
		}

		// End date is 30 days from search start, or user end date, whichever is later
		const maxEndDate = addDays(searchStartDate, 30)
		const searchEndDate = userEndDate > maxEndDate ? userEndDate : maxEndDate

		// 3. Check NoBeds availability for the extended range
		const adjustedCheckout = subDays(parseISO(todate), 1).toISOString()

		let noBedsAvailability
		try {
			noBedsAvailability = await checkNoBedsAvailability({
				room_id: property.room_id,
				fromdate: format(searchStartDate, "yyyy-MM-dd"),
				todate: format(searchEndDate, "yyyy-MM-dd"),
			})
		} catch (error) {
			console.error("NoBeds availability failed for reOne, falling back to DB .", error)
			noBedsAvailability = null
		}

		if (!noBedsAvailability?.data || noBedsAvailability?.data?.length < 1) {
			// Fall back to DB
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

				if (overlappingEvent) {
					return NextResponse.json({ error: "No availability data found" })
				}

				const availability = dbAvailabilities[0]
				const numNights = differenceInDays(userEndDate, userStartDate)
				const basePrice = (availability?.price || 0) * numNights
				const totalPrice = getPersonAdjustedPrice(fullProperty, guests, basePrice)
				const minStay = availability?.minStay || 0
				const maxStay = availability?.maxStay || 0
				const result = sanitizeProperty({
					...fullProperty,
					totalPrice,
					minStay,
					maxStay,
					name: property.name,
					available: true,
				})
				return NextResponse.json({
					success: "Property availability checked successfully (DB fallback)",
					property: result,
				})
			} else {
				return NextResponse.json({ error: "No availability data found" })
			}
		}

		const noBedsData = noBedsAvailability.data

		// 4. Check availability for user's requested dates
		const userRequestedDates = eachDayOfInterval({
			start: userStartDate,
			end: parseISO(adjustedCheckout),
		}).map((date) => format(date, "yyyy-MM-dd"))

		const hasUserDatesAvailable = userRequestedDates.every((date: string) => {
			const dayData = noBedsData.find((day: { date: string; quantity: number }) => format(new Date(day.date), "yyyy-MM-dd") === date)
			return dayData && dayData.quantity > 0
		})

		if (!hasUserDatesAvailable) {
			// Find alternative available date ranges within the extended search period
			const availableDates = noBedsData
				.filter((day: { date: string; quantity: number }) => day.quantity > 0)
				.map((day: { date: string }) => format(new Date(day.date), "yyyy-MM-dd"))
				.sort()

			console.log("Available dates from NoBeds:", availableDates)
			console.log("User requested nights:", differenceInDays(userEndDate, userStartDate))
			console.log("User start date:", userStartDate, "User end date:", userEndDate)

			// Group consecutive dates into ranges and filter by user's stay preferences
			const availableRanges: Array<{ start: string; end: string; nights: number; score: number }> = []
			let currentRange: string[] = []

			for (let i = 0; i < availableDates.length; i++) {
				const currentDate = availableDates[i]
				const nextDate = availableDates[i + 1]

				currentRange.push(currentDate)

				// If next date is not consecutive or this is the last date, close the range
				if (!nextDate || differenceInDays(parseISO(nextDate), parseISO(currentDate)) > 1) {
					if (currentRange.length > 0) {
						// Instead of one big range, create multiple smaller ranges of reasonable lengths
						// For each possible start date in this consecutive block, create ranges of user's preferred length
						const userRequestedNights = differenceInDays(userEndDate, userStartDate)
						const maxReasonableNights = Math.max(userRequestedNights * 3, userRequestedNights + 7)

						for (let rangeStartIdx = 0; rangeStartIdx < currentRange.length; rangeStartIdx++) {
							const rangeStart = currentRange[rangeStartIdx]
							const maxPossibleNights = currentRange.length - rangeStartIdx

							// Create ranges from the user's requested length up to the max reasonable length
							for (let nights = userRequestedNights; nights <= Math.min(maxPossibleNights, maxReasonableNights); nights++) {
								const rangeEndIdx = rangeStartIdx + nights - 1
								const rangeEnd = currentRange[rangeEndIdx]

								// Check min/max stay requirements for this specific range
								const rangeDays = currentRange.slice(rangeStartIdx, rangeStartIdx + nights)
								const minStayInRange = Math.max(
									...rangeDays.map((date) => {
										const dayData = noBedsData.find(
											(day: { date: string; min_stay: number }) => format(new Date(day.date), "yyyy-MM-dd") === date,
										)
										return dayData?.min_stay || 1
									}),
								)

								const maxStayInRange = Math.min(
									...rangeDays
										.map((date) => {
											const dayData = noBedsData.find(
												(day: { date: string; max_stay: number }) => format(new Date(day.date), "yyyy-MM-dd") === date,
											)
											return dayData?.max_stay || Infinity
										})
										.filter((max) => max > 0),
								)

								if (nights >= minStayInRange && nights <= maxStayInRange) {
									// Calculate a score based on how close the range length is to user's request
									// and how close the start date is to user's requested start date
									const lengthDifference = Math.abs(nights - userRequestedNights)
									const startDateDifference = Math.abs(differenceInDays(parseISO(rangeStart), userStartDate))
									const score = lengthDifference + startDateDifference * 0.1 // Weight date proximity less

									availableRanges.push({
										start: rangeStart,
										end: format(addDays(parseISO(rangeEnd), 1), "yyyy-MM-dd"), // Add 1 day for checkout
										nights,
										score,
									})
								}
							}
						}
					}
					currentRange = []
				}
			}

			// Sort by score (best matches first) and limit to top 5 suggestions
			availableRanges.sort((a, b) => a.score - b.score)

			return NextResponse.json({
				error: "Requested dates are not available for this property",
				available: false,
				alternativeRanges: availableRanges.slice(0, 5).map((range) => ({
					start: range.start,
					end: range.end,
					nights: range.nights,
				})),
			})
		}

		// 5. Calculate pricing for user's dates
		const userDateData = noBedsData.filter((day: { date: string }) => userRequestedDates.includes(format(new Date(day.date), "yyyy-MM-dd")))

		const baseTotalPrice = userDateData.reduce((acc: number, day: { price: number }) => acc + day.price, 0)
		const totalPrice = getPersonAdjustedPrice(fullProperty, guests, baseTotalPrice)
		const minStay = Math.max(...userDateData.map((day: { min_stay: number }) => day.min_stay || 1))
		const maxStay = Math.min(...userDateData.map((day: { max_stay: number }) => day.max_stay || Infinity).filter((max: number) => max > 0))

		// 7. Return sanitized property with availability info
		const result = sanitizeProperty({
			...fullProperty,
			totalPrice,
			minStay,
			maxStay,
			roomId: property.room_id,
			name: property.name,
			available: true,
			requestedDates: userRequestedDates,
		})

		return NextResponse.json({
			success: "Property availability checked successfully",
			property: result,
		})
	} catch (error: unknown) {
		console.error("Error in reOne API:", error)
		if (error instanceof Error) {
			return NextResponse.json({ error: "Cannot check property availability: " + error.message })
		} else {
			return NextResponse.json({ error: "Cannot check property availability" })
		}
	} finally {
		await prisma.$disconnect()
	}
}
