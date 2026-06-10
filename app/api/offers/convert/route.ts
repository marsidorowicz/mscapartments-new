/** @format */

import { NextRequest, NextResponse } from "next/server"
import prisma from "@/prisma/prisma"

export async function POST(request: NextRequest) {
	try {
		const { offerId, eventId } = await request.json()

		if (!offerId || !eventId) {
			return NextResponse.json(
				{ error: "Missing required fields: offerId and eventId" },
				{ status: 400 }
			)
		}

		// Check if the offer exists and is still valid
		const offer = await prisma.offer.findUnique({
			where: { offerId }
		})

		if (!offer) {
			return NextResponse.json(
				{ error: "Offer not found" },
				{ status: 404 }
			)
		}

		if (offer.status === "USED") {
			return NextResponse.json(
				{ error: "Offer has already been used" },
				{ status: 409 }
			)
		}

		if (offer.status === "EXPIRED" || new Date() > offer.expiresAt) {
			return NextResponse.json(
				{ error: "Offer has expired" },
				{ status: 410 }
			)
		}

		// Check if the event exists
		const event = await prisma.event.findUnique({
			where: { id: parseInt(eventId) }
		})

		if (!event) {
			return NextResponse.json(
				{ error: "Event not found" },
				{ status: 404 }
			)
		}

		// Update the offer to mark it as used and link to the event
		const updatedOffer = await prisma.offer.update({
			where: { offerId },
			data: {
				status: "USED",
				convertedEventId: parseInt(eventId),
				updatedAt: new Date()
			}
		})

		return NextResponse.json({
			success: true,
			offer: updatedOffer
		})
	} catch (error) {
		console.error("Error converting offer:", error)
		return NextResponse.json(
			{ error: "Failed to convert offer" },
			{ status: 500 }
		)
	}
}