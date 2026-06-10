/** @format */

import { NextResponse } from "next/server"
import { prisma } from "../../../../../../lib/prisma"

export async function GET(request: Request, { params }: { params: Promise<{ lang: string; slug: string }> }) {
	try {
		const { lang, slug } = await params
		const { searchParams } = new URL(request.url)
		const userId = searchParams.get("userId") || "clok0rd6f0000kkdgyf1pd0t3"

		// Fetch all properties and find the one with matching slug
		const properties = await prisma.property.findMany({
			where: {
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

		// console.log("properties", properties[0])

		// Find the property with matching slug
		const property = properties.find((prop) => {
			if (prop.slugs && typeof prop.slugs === "object") {
				const slugs = prop.slugs as Record<string, string>
				return slugs[lang] === slug
			}
			return false
		})

		if (!property) {
			return NextResponse.json({ error: "Property not found", success: false }, { status: 404 })
		}

		// Filter extended fields to only allowed ones
		const allowedExtendedFields = [
			"minPrice",
			"maxPrice",
			"babyCribAllowed",
			"babyCribFee",
			"breakfastAllowed",
			"breakfastFee",
			"petFee",
			"petsAllowed",
			"petsMax",
		]

		const filteredExtended = property.extended
			? Object.fromEntries(Object.entries(property.extended as Record<string, unknown>).filter(([key]) => allowedExtendedFields.includes(key)))
			: null

		delete (property as unknown as { commissionSettings?: unknown }).commissionSettings
		delete (property as unknown as { commision?: unknown }).commision
		delete (property as unknown as { emailNotification?: unknown }).emailNotification
		delete (property as unknown as { emailNotification?: unknown }).emailNotification
		delete (property as unknown as { telegramChatIds?: unknown }).telegramChatIds

		const propertyWithFilteredExtended = {
			...property,
			extended: filteredExtended,
		}

		return NextResponse.json({
			property: propertyWithFilteredExtended,
			success: true,
		})
	} catch (error) {
		console.error("Error fetching property by slug:", error)
		return NextResponse.json({ error: "Internal server error", success: false }, { status: 500 })
	}
}
