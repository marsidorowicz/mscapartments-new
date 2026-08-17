/** @format */

import { NextRequest, NextResponse } from "next/server"
import prisma from "@/prisma/prisma"
import { getCacheEntriesForDateRange } from "@/utilities/functions/nobedsCache"
import { differenceInCalendarDays } from "date-fns"

type NoBedsCacheEntry = {
	price: number | null
	quantity: number | null
	minStay?: number | null
	maxStay?: number | null
	date: string
	// inne pola jeśli chcesz
}

const applyMountainCommission = (price: number, commission?: number): number => {
	if (commission != null && commission > 0) {
		return price * (1 + commission / 100)
	}
	return price
}

export async function POST(req: NextRequest) {
	try {
		const { startDate, endDate, propertyIds } = await req.json()

		if (!startDate || !endDate || !propertyIds || !Array.isArray(propertyIds)) {
			return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
		}

		const nights = differenceInCalendarDays(new Date(endDate), new Date(startDate))

		const properties = await prisma.property.findMany({
			where: {
				id: { in: propertyIds },
				room_id: {
					not: null,
					gt: 0, // room_id > 0
				},
			},
			select: { id: true, room_id: true, brand: true, commission: true },
		})

		const availablePropertyIds: number[] = []
		const priceSums: Record<number, number> = {}

		// Jeden batch dla wszystkich properties
		const results = await Promise.all(
			properties.map(async (property) => {
				try {
					const isMountain = property?.brand === "MOUNTAIN"

					const entries: NoBedsCacheEntry[] = await getCacheEntriesForDateRange(property.room_id!, startDate, endDate)
					const rawTotal = entries.reduce((sum: number, entry: { price?: number | string | null }) => {
						const price = Number(entry.price) || 0
						return sum + price
					}, 0)
					// === Sprawdzenie dostępności ===
					const hasEntriesForAllNights = entries.length === nights
					const hasAvailability =
						hasEntriesForAllNights &&
						entries.every((entry) => {
							const quantityOk = entry.quantity && entry.quantity > 0
							const minStayOk = !entry.minStay || entry.minStay <= nights
							const maxStayOk = !entry.maxStay || entry.maxStay >= nights
							return quantityOk && minStayOk && maxStayOk
						})

					if (hasAvailability) {
						availablePropertyIds.push(property.id)
					}

					// === Obliczenie sumy cen ===
					const total = isMountain ? applyMountainCommission(rawTotal, property?.commission) : rawTotal

					priceSums[property.id] = total

					return { id: property.id, hasAvailability }
				} catch (err) {
					console.error(`Error processing property ${property.id}`, err)
					priceSums[property.id] = 0
					return { id: property.id, hasAvailability: false }
				}
			}),
		)

		return NextResponse.json({
			availablePropertyIds,
			priceSums,
			success: true,
			results,
		})
	} catch (error) {
		console.error("Error checking availability with prices:", error)
		return NextResponse.json({ error: "Internal server error" }, { status: 500 })
	}
}
