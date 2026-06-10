/** @format */

import { NextRequest, NextResponse } from "next/server"
import prisma from "@/prisma/prisma"
import { getSimplifiedCacheEntriesForDateRange } from "@/utilities/functions/nobedsCache"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
	try {
		const searchParams = new URL(request.url).searchParams
		const propertyIdParam = searchParams.get("id")
		const startDate = searchParams.get("startDate")
		const endDate = searchParams.get("endDate")

		if (!propertyIdParam || !startDate || !endDate) {
			return NextResponse.json({ error: "Missing required query parameters: id, startDate, endDate" }, { status: 400 })
		}

		const propertyId = Number(propertyIdParam)
		if (Number.isNaN(propertyId)) {
			return NextResponse.json({ error: "Invalid property id" }, { status: 400 })
		}

		const property = await prisma.property.findUnique({
			where: { id: propertyId },
			select: { room_id: true },
		})

		if (!property || property.room_id == null) {
			return NextResponse.json({ error: "Property not found or missing room_id" }, { status: 404 })
		}

		const entries = await getSimplifiedCacheEntriesForDateRange(property.room_id, startDate, endDate)

		return NextResponse.json({
			entries,
			propertyId,
			roomId: property.room_id,
			startDate,
			endDate,
		})
	} catch (error) {
		console.error("NoBeds cache entries retrieval error:", error)
		return NextResponse.json({ error: "Internal server error" }, { status: 500 })
	}
}
