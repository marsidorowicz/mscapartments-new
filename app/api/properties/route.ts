/** @format */

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

/**
 * Lists active, bookable properties. Used by the booking engine's
 * available-apartments picker on /rezerwacja, which then checks availability +
 * prices for a selected date range via /api/properties/availability-with-prices.
 */
export async function GET() {
	try {
		const properties = await prisma.property.findMany({
			where: { state: "active", room_id: { not: null } },
			select: {
				id: true,
				name: true,
				location: true,
				brand: true,
				room_id: true,
				commission: true,
				maxOccupancy: true,
				minOccupancy: true,
				cleaningFee: true,
				parkingFee: true,
				parkingQuantity: true,
				localTax: true,
				paymentsOn: true,
				placeId: true,
				userId: true,
				filters: true,
				size: true,
				slugs: true,
				extended: true,
				place: { select: { name: true } },
				images: { select: { path: true, filename: true }, orderBy: { order: "asc" } },
			},
			orderBy: { id: "asc" },
		})

		return NextResponse.json({ properties })
	} catch (error) {
		console.error("Error listing properties:", error)
		return NextResponse.json({ error: "Failed to list properties" }, { status: 500 })
	}
}
