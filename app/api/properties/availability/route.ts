/** @format */

import { NextRequest, NextResponse } from "next/server"
import { getSimplifiedCacheEntriesForDateRange } from "../../../../utilities/functions/nobedsCache"
import prisma from "@/prisma/prisma"

export async function POST(req: NextRequest) {
	try {
		const { startDate, endDate, propertyIds } = await req.json()

		if (!startDate || !endDate || !propertyIds || !Array.isArray(propertyIds)) {
			return NextResponse.json({ error: "Missing required parameters: startDate, endDate, propertyIds" }, { status: 400 })
		}

		const availablePropertyIds: number[] = []

		// Get all properties with their room_ids in one query
		const properties = await prisma.property.findMany({
			where: {
				id: { in: propertyIds },
				AND: [{ room_id: { not: null } }, { room_id: { not: 0 } }],
			},
			select: {
				id: true,
				room_id: true,
			},
		})

		// Check availability for each property that has a room_id
		for (const property of properties) {
			if (property.room_id != null) {
				try {
					const cacheEntries = await getSimplifiedCacheEntriesForDateRange(property.room_id, startDate, endDate)

					// Check if all dates in the range have available quantity > 0
					const hasAvailability = cacheEntries.every((entry: { date: string; quantity: number | null }) => {
						return entry.quantity && entry.quantity > 0
					})

					if (hasAvailability && cacheEntries.length > 0) {
						availablePropertyIds.push(property.id)
					}
				} catch (error) {
					console.error(`Error checking availability for property ${property.id}:`, error)
					// Skip this property if there's an error
				}
			}
		}

		return NextResponse.json({
			availablePropertyIds,
			success: true,
		})
	} catch (error) {
		console.error("Error checking properties availability:", error)
		return NextResponse.json({ error: "Failed to check properties availability" }, { status: 500 })
	}
}
