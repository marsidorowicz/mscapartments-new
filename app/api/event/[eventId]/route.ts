/** @format */

import { PrismaClient } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"
import { validateTokenWithExpiry } from "@/utilities/functions/auth/magicLink"
import { checkRateLimit } from "@/utilities/functions/auth/rateLimiter"
import dotenv from "dotenv"

dotenv.config()
// import { getI18n } from "@/locales/server"

const prisma = new PrismaClient()

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ eventId: string }> }
) {
	// const t = await getI18n()
	const { eventId: eventIdParam } = await params
	const eventId = parseInt(eventIdParam)
	const propertyIdParam = req.nextUrl.searchParams.get("propertyId")
	const token = req.nextUrl.searchParams.get("token")

	// Get client IP for rate limiting
	const forwardedFor = req.headers.get("x-forwarded-for")
	const clientIp = forwardedFor
		? forwardedFor.split(",")[0].trim()
		: "unknown-ip"

	if (isNaN(eventId) || !propertyIdParam) {
		return NextResponse.json(
			{ error: "Invalid event ID or property ID" },
			{ status: 400 }
		)
	}
	const propertyId = parseInt(propertyIdParam)
	if (isNaN(propertyId)) {
		return NextResponse.json(
			{ error: "Invalid property ID" },
			{ status: 400 }
		)
	}

	try {
		const event = await prisma.event.findUnique({
			where: {
				id: eventId,
				propertyId: propertyId,
			},
			include: {
				payments: {
					orderBy: {
						initiatedAt: "desc", // Get the latest payment first
					},
				},
				property: {
					select: {
						id: true,
						name: true,
						location: true,
						type: true,
						place: {select: { name: true }},
						checkinInstructionTime: true,
						checkoutInstructionTime: true,
						emailTemplates: true,
						payments: true,
						paymentsOn: true,
						// Add any other property fields you need
					},
				},
				convertedOffer: true,
			},
		})

		if (!event) {
			return NextResponse.json(
				{ error: "Reservation not found" },
				{ status: 404 }
			)
		} // Enhanced security check: Always require token validation if access token is set
		// Create a unique identifier for this reservation's access attempts
		const rateKey = `event-${eventId}-property-${propertyId}`

		// If event has an access token, validate it
		if (event.accessToken) {
			// Check current rate limit status without incrementing counters
			const rateLimitCheck = checkRateLimit(clientIp, rateKey)

			// If rate limited, return 429 Too Many Requests
			if (!rateLimitCheck.allowed && process.env.NODE_ENV === "production") {
				const response = NextResponse.json(
					{
						error: "Too many requests, please try again later",
						retryAfter: rateLimitCheck.retryAfterSeconds,
						reason: rateLimitCheck.blockReason,
					},
					{ status: 429 }
				)

				// Set Retry-After header according to HTTP spec
				if (rateLimitCheck.retryAfterSeconds) {
					response.headers.set(
						"Retry-After",
						rateLimitCheck.retryAfterSeconds.toString()
					)
				}

				return response
			}

			// Validate token and check expiry
			const isValid = validateTokenWithExpiry(
				token,
				event.accessToken,
				event.accessTokenExpiry
			)

			// Update rate limiter with the result
			const rateLimitUpdate = checkRateLimit(clientIp, rateKey, isValid)
			
			// Check if this attempt caused rate limiting
			if (!rateLimitUpdate.allowed && process.env.NODE_ENV === "production") {
				const response = NextResponse.json(
					{
						error: "Rate limit exceeded",
						retryAfter: rateLimitUpdate.retryAfterSeconds,
						reason: rateLimitUpdate.blockReason,
					},
					{ status: 429 }
				)

				if (rateLimitUpdate.retryAfterSeconds) {
					response.headers.set(
						"Retry-After",
						rateLimitUpdate.retryAfterSeconds.toString()
					)
				}

				return response
			}

			if (!token || !isValid) {
				return NextResponse.json(
					{
						error: "Access denied: Invalid or expired token",
						remainingInvalidAttempts:
							rateLimitUpdate.remainingInvalidAttempts,
					},
					{ status: 401 }
				)
			}
		} else {
			// If no access token is set for this event, deny access for security
			// This prevents unauthorized access to events that should be protected
			return NextResponse.json(
				{
					error: "Access denied: This reservation requires authentication",
				},
				{ status: 401 }
			)
		}

		return NextResponse.json(event)
	} catch (error) {
		console.error("Error fetching event:", error)
		return NextResponse.json(
			{ error: "Failed to fetch reservation details" },
			{ status: 500 }
		)
	} finally {
		await prisma.$disconnect()
	}
}
