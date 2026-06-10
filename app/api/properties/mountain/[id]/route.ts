/** @format */

import { NextResponse } from "next/server"
import { prisma } from "../../../../../lib/prisma"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params
		const { searchParams } = new URL(request.url)
		const userId = searchParams.get("userId") || "clok0rd6f0000kkdgyf1pd0t3"

		// Convert id to number since our database uses numeric IDs
		const propertyId = parseInt(id, 10)

		if (isNaN(propertyId)) {
			return NextResponse.json({ error: "Invalid property ID", success: false }, { status: 400 })
		}

		const property = await prisma.property.findFirst({
			where: {
				id: propertyId,
				userId: userId,
				brand: "MOUNTAIN",
				state: "active", // Only get active properties
			},
			include: {
				images: {
					select: {
						id: true,
						path: true,
						filename: true,
						order: true,
					},
					orderBy: {
						order: "asc",
					},
				},
				place: {
					select: { name: true, location: true, extended: true },
				},
				availabilities: {
					select: {
						price: true,
						isOpen: true,
					},
					where: {
						isOpen: true,
					},
					take: 1, // Get first available pricing
				},
				personBasedPricings: true, // Include person-based pricing data
			},
		})

		if (!property) {
			return NextResponse.json({ error: "Property not found", success: false }, { status: 404 })
		}

		// Transform property to include price from availabilities
		const propertyWithPricing = {
			...property,
			price: property.availabilities.length > 0 ? property.availabilities[0].price : null,
			availabilities: undefined, // Remove availabilities from response to keep it clean
		}

		return NextResponse.json({
			property: propertyWithPricing,
			success: true,
		})
	} catch (error) {
		console.error("API Error fetching property:", error)
		return NextResponse.json({ error: "Failed to fetch property", success: false }, { status: 500 })
	}
}
