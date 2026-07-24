/** @format */

import { NextRequest, NextResponse } from "next/server"
import prisma from "@/prisma/prisma"
import { getCacheEntriesForDateRange } from "@/utilities/functions/nobedsCache"
import { Prisma } from "@prisma/client"

type NoBedsCacheEntry = {
	id: string
	propertyId: number
	room_id: number
	rid: number | null
	date: string
	price: number | null
	available: boolean | null
	quantity: number | null
	minStay: number | null
	maxStay: number | null
	raw: Prisma.JsonValue // lub unknown
	channels: Prisma.JsonValue | null
	source: string
	dirty: boolean
	offlineBooking: boolean | null
	updatedAt: string
}

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
	try {
		const searchParams = new URL(request.url).searchParams
		const idsParam = searchParams.get("ids")
		const startDate = searchParams.get("startDate")
		const endDate = searchParams.get("endDate")

		if (!idsParam || !startDate || !endDate) {
			return NextResponse.json({ error: "Missing required parameters: ids, startDate, endDate" }, { status: 400 })
		}

		const propertyIds = idsParam
			.split(",")
			.map((id) => Number(id.trim()))
			.filter((id) => !Number.isNaN(id) && id > 0)

		if (propertyIds.length === 0) {
			return NextResponse.json({ error: "No valid property ids" }, { status: 400 })
		}

		// Pobierz room_id dla wszystkich properties
		const properties = await prisma.property.findMany({
			where: {
				id: { in: propertyIds },
				room_id: { not: null },
			},
			select: { id: true, room_id: true },
		})

		const propertyMap = new Map(properties.map((p) => [p.id, p.room_id!]))

		// Batch fetch
		const results = await Promise.all(
			propertyIds
				.filter((id) => propertyMap.has(id))
				.map(
					async (
						propId,
					): Promise<{
						propId: number
						entries: NoBedsCacheEntry[]
						total: number
					}> => {
						const roomId = propertyMap.get(propId)!

						try {
							const entries: NoBedsCacheEntry[] = await getCacheEntriesForDateRange(roomId, startDate, endDate)

							const total = entries.reduce((acc: number, cur) => {
								return acc + (Number(cur.price) || 0)
							}, 0)

							return { propId, entries, total }
						} catch (err) {
							console.error(`Error fetching entries for property ${propId}`, err)
							return { propId, entries: [], total: 0 }
						}
					},
				),
		)

		const priceSums: Record<number, number> = {}
		const allEntries: Record<number, NoBedsCacheEntry[]> = {}

		results.forEach(({ propId, entries, total }) => {
			priceSums[propId] = total
			allEntries[propId] = entries
		})

		return NextResponse.json({
			priceSums,
			entries: allEntries,
			processedIds: results.map((r) => r.propId),
			startDate,
			endDate,
		})
	} catch (error) {
		console.error("Batch nobeds cache error:", error)
		return NextResponse.json({ error: "Internal server error" }, { status: 500 })
	}
}
