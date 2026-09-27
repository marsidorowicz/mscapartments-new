/** @format */

import prisma from "@/prisma/prisma"
import { getCacheEntriesForDateRange } from "@/utilities/functions/nobedsCache"
import { differenceInCalendarDays } from "date-fns"
import {
	getPersonAdjustedPrice,
	hasPersonBasedPricing,
} from "@/utilities/functions/pricing/personBasedPricing"

export interface AIAvailabilityOffer {
	propertyId: number
	name: string
	location: string
	city?: string | null
	placeName?: string | null
	minOccupancy: number
	maxOccupancy: number
	totalPrice: number
	basePrice: number
	cleaningFee: number
	localTax: number
	currency: string
	startDate: string
	endDate: string
	guests: number
	nights: number
	available: boolean
}

export interface AIAvailabilityResult {
	success: boolean
	availablePropertyIds: number[]
	priceSums: Record<number, number>
	offers: AIAvailabilityOffer[]
	startDate: string
	endDate: string
	guests: number
	message?: string
}

const applyMountainCommission = (price: number, commission?: number): number => {
	if (commission != null && commission > 0) {
		return price * (1 + commission / 100)
	}
	return price
}

/**
 * Search available properties for a date range and guest count (shared DB with simplevent).
 * Mirrors mscapartments /api/properties/availability-with-prices logic (NoBeds cache),
 * but also filters by occupancy and returns offer details for the AI assistant.
 */
export async function searchAvailableOffers(input: {
	fromdate: string
	todate: string
	guests: number
}): Promise<AIAvailabilityResult> {
	const { fromdate, todate, guests } = input

	if (!fromdate || !todate || !guests || guests < 1) {
		return {
			success: false,
			availablePropertyIds: [],
			priceSums: {},
			offers: [],
			startDate: fromdate,
			endDate: todate,
			guests,
			message:
				"Missing or invalid search parameters: fromdate, todate and guests are required.",
		}
	}

	try {
		const nights = differenceInCalendarDays(new Date(todate), new Date(fromdate))
		if (nights < 1) {
			return {
				success: false,
				availablePropertyIds: [],
				priceSums: {},
				offers: [],
				startDate: fromdate,
				endDate: todate,
				guests,
				message: "The departure date must be after the arrival date.",
			}
		}

		// All active properties (client-facing site shows the whole portfolio),
		// excluding test properties so the assistant never recommends them.
		const allProperties = await prisma.property.findMany({
			where: {
				state: "active",
				room_id: { not: null, gt: 0 },
			},
			include: {
				place: true,
				city: { include: { country: true } },
				personBasedPricings: true,
			},
		})

		// Filter out test properties by name (case-insensitive)
		const properties = allProperties.filter(
			(property): property is (typeof allProperties)[number] =>
				!property.name.toLowerCase().includes("test")
		)

		const availablePropertyIds: number[] = []
		const priceSums: Record<number, number> = {}
		const offers: AIAvailabilityOffer[] = []

		await Promise.all(
			properties.map(async property => {
				if (property.room_id == null) return

				try {
					if (guests < property.minOccupancy || guests > property.maxOccupancy) {
						return
					}

					const isMountain = property?.brand === "MOUNTAIN"
					const entries = await getCacheEntriesForDateRange(
						property.room_id,
						fromdate,
						todate
					)

					const rawTotal = entries.reduce((sum: number, entry: any) => {
						const price = Number(entry.price) || 0
						return sum + price
					}, 0)

					const hasEntriesForAllNights = entries.length === nights
					const hasAvailability =
						hasEntriesForAllNights &&
						entries.every((entry: any) => {
							const quantityOk = entry.quantity && entry.quantity > 0
							const minStayOk = !entry.minStay || entry.minStay <= nights
							const maxStayOk = !entry.maxStay || entry.maxStay >= nights
							return quantityOk && minStayOk && maxStayOk
						})

					let basePrice = isMountain
						? applyMountainCommission(rawTotal, property?.commission)
						: rawTotal

					// Person-based pricing adjustment for the requested guest count
					let total = basePrice
					if (hasPersonBasedPricing(property as any)) {
						total = getPersonAdjustedPrice(property as any, guests, basePrice)
					}

					// Match the basket's all-inclusive total: stay + cleaning fee + local tax.
					const cleaningFee =
						property.cleaningFeeDays === 0 ||
						property.cleaningFeeDays === null ||
						property.cleaningFeeDays > nights
							? property.cleaningFee || 0
							: 0
					const localTax = (property.localTax || 0) * nights * guests
					total = total + cleaningFee + localTax

					// Round to 2 decimals to keep tool output small
					total = Math.round(total * 100) / 100
					basePrice = Math.round(basePrice * 100) / 100

					priceSums[property.id] = total

					if (hasAvailability) {
						availablePropertyIds.push(property.id)
						offers.push({
							propertyId: property.id,
							name: property.name,
							location: property.location,
							city: property.city?.name,
							placeName: property.place?.name,
							minOccupancy: property.minOccupancy,
							maxOccupancy: property.maxOccupancy,
							totalPrice: total,
							basePrice,
							cleaningFee,
							localTax,
							currency: "PLN",
							startDate: fromdate,
							endDate: todate,
							guests,
							nights,
							available: true,
						})
					}
				} catch (error) {
					console.error(`Error processing property ${property.id}`, error)
				}
			})
		)

		offers.sort((a, b) => a.totalPrice - b.totalPrice)

		return {
			success: availablePropertyIds.length > 0,
			availablePropertyIds,
			priceSums,
			offers,
			startDate: fromdate,
			endDate: todate,
			guests,
			...(availablePropertyIds.length === 0 && {
				message: "No rooms available for the selected dates and number of guests.",
			}),
		}
	} catch (error) {
		console.error("searchAvailableOffers error:", error)
		return {
			success: false,
			availablePropertyIds: [],
			priceSums: {},
			offers: [],
			startDate: fromdate,
			endDate: todate,
			guests,
			message: "Failed to search availability.",
		}
	}
}