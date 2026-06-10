/** @format */

import { NextResponse } from "next/server"
import { prisma } from "../../../../lib/prisma"

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url)
		const userId = searchParams.get("userId") || "clok0rd6f0000kkdgyf1pd0t3"

		const properties = await prisma.property.findMany({
			where: {
				userId: userId,
				brand: "MOUNTAIN",
				state: "active", // Only get active properties
				id: {
					not: 53, // Exclude property 53
				},
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
					select: { id: true, name: true, location: true },
				},
				city: {
					select: { name: true },
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

		// Transform properties to include price from availabilities and sanitize extended data
		const propertiesWithPricing = properties.map((property) => {
			// Sanitize extended data - remove sensitive fields
			const sanitizedExtended = property.extended
				? (() => {
						const extended = property.extended as Record<string, unknown>
						const safeFields = ["title", "keywords", "minPrice", "maxPrice"] //allow safe fields only, add new fields if needed
						const sanitized: Record<string, unknown> = {}

						for (const field of safeFields) {
							if (extended[field] !== undefined) {
								sanitized[field] = extended[field]
							}
						}

						return sanitized
					})()
				: null

			return {
				...property,
				extended: sanitizedExtended,
				price: property.availabilities.length > 0 ? property.availabilities[0].price : null,
				availabilities: undefined, // Remove availabilities from response to keep it clean
			}
		})

		const response = NextResponse.json({
			properties: propertiesWithPricing,
			success: true,
		})
		response.headers.set("Access-Control-Allow-Origin", "*")
		response.headers.set("Access-Control-Allow-Methods", "GET")
		response.headers.set("Access-Control-Allow-Headers", "Content-Type")
		return response
	} catch (error) {
		console.error("API Error fetching mountain properties:", error)
		const errorResponse = NextResponse.json({ error: "Failed to fetch properties", success: false }, { status: 500 })
		errorResponse.headers.set("Access-Control-Allow-Origin", "*")
		errorResponse.headers.set("Access-Control-Allow-Methods", "GET")
		errorResponse.headers.set("Access-Control-Allow-Headers", "Content-Type")
		return errorResponse
	}
}
