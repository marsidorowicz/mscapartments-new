/** @format */

import { NextRequest, NextResponse } from "next/server"
import prisma from "@/prisma/prisma"

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ offerId: string }> }
) {
	try {
		const { offerId } = await params

		if (!offerId) {
			return NextResponse.json(
				{ error: "Offer ID is required" },
				{ status: 400 }
			)
		}

		// Fetch the offer with all related data
		const offer = await prisma.offer.findUnique({
			where: { offerId },
			include: {
				offerProperties: {
					include: {
						property: {
							select: {
								id: true,
								name: true,
								location: true,
								place: {
									select: {
										name: true,
									},
								},
								maxOccupancy: true,
								minOccupancy: true,
								images: {
									orderBy: { order: "asc" },
									take: 1,
									select: {
										path: true,
										filename: true,
									},
								},
								filters: true,
								size: true,
								numSingleBeds: true,
								numDoubleBeds: true,
							},
						},
					},
				},
			},
		})

		if (!offer) {
			return NextResponse.json(
				{ error: "Offer not found" },
				{ status: 404 }
			)
		}

		// Check if offer is expired
		if (new Date(offer.expiresAt) < new Date()) {
			return NextResponse.json(
				{ error: "Offer has expired" },
				{ status: 410 }
			)
		}

		// Check if offer has already been used (converted to booking)
		if (offer.convertedEventId) {
			return NextResponse.json(
				{ error: "Offer has already been used" },
				{ status: 409 }
			)
		}

		// Transform the offer data for public access (no sensitive sender info)
		const transformedOffer = {
			offerId: offer.offerId,
			startDate: offer.startDate,
			endDate: offer.endDate,
			guests: offer.guests,
			currency: offer.currency,
			expiresAt: offer.expiresAt,
			offerProperties: offer.offerProperties.map((op: { property: unknown; offerPrice: number; originalPrice: number; discountPercentage: number | null; guests: number }) => ({
				property: op.property,
				price: op.offerPrice, // This is the total discounted price for the entire stay
				originalPrice: op.originalPrice,
				discountPercentage: op.discountPercentage,
				guests: op.guests,
			})),
			totalValue: offer.offerProperties.reduce(
				(sum: number, op: { offerPrice: number }) => sum + op.offerPrice,
				0
			),
		}

		return NextResponse.json(transformedOffer)
	} catch (error) {
		console.error("Error fetching public offer:", error)
		return NextResponse.json(
			{ error: "Failed to fetch offer" },
			{ status: 500 }
		)
	}
}