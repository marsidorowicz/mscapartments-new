/** @format */

import { NextResponse } from "next/server"
import { prisma } from "../../../../lib/prisma"

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url)
		const userId = searchParams.get("userId") || "clok0rd6f0000kkdgyf1pd0t3"

		// Get unique places from active properties
		const places = await prisma.place.findMany({
			where: {
				properties: {
					some: {
						userId: userId,
						state: "active",
						id: { not: 53 }, // Exclude property 53
					},
				},
			},
			select: {
				id: true,
				name: true,
				location: true,
				description: true,
				images: true,
				extended: true,
			},
			orderBy: {
				name: "asc",
			},
		})

		return NextResponse.json({
			places,
			success: true,
		})
	} catch (error) {
		console.error("API Error fetching places:", error)
		return NextResponse.json({ error: "Failed to fetch places", success: false }, { status: 500 })
	}
}
