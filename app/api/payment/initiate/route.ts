/** @format */

import { NextRequest, NextResponse } from "next/server"
import prisma from "@/prisma/prisma"
import { z } from "zod"
import { v4 as uuidv4 } from "uuid"

const initiatePaymentSchema = z.object({
	orderId: z.string().uuid("Invalid Order ID format"),
	eventId: z.number().int().positive().optional(), // Assuming eventId is a number
	chargeTotal: z
		.string()
		.regex(/^\d+(\.\d{1,2})?$/, "Invalid charge total format"), // Expecting string like "123.45"
	currency: z.string().length(3, "Invalid currency code"), // E.g., "PLN", "EUR"
	locale: z.string().optional(), // To store the locale at the time of initiation
})

export async function POST(req: NextRequest) {
	try {
		let requestBody
		try {
			requestBody = await req.json()
		} catch (error) {
			console.error("Initiate Payment: Failed to parse JSON body:", error)
			return NextResponse.json(
				{ error: "Invalid request body" },
				{ status: 400 }
			)
		}

		const validation = initiatePaymentSchema.safeParse(requestBody)

		if (!validation.success) {
			console.error(
				"Initiate Payment: Validation failed:",
				validation.error.flatten()
			)
			return NextResponse.json(
				{ error: "Invalid input", details: validation.error.flatten() },
				{ status: 400 }
			)
		}

		const { orderId, eventId, chargeTotal, currency, locale } =
			validation.data

		// Convert chargeTotal to a number for storage if your schema expects a Decimal/Float
		// Prisma handles string-to-Decimal conversion if the schema type is Decimal
		const amount = parseFloat(chargeTotal)

		const event = eventId
			? await prisma.event.findUnique({
					where: { id: eventId },
					include: { user: true },
			  })
			: null

		// Check if a payment with this orderId already exists to prevent duplicates
		const existingPayment = await prisma.payment.findUnique({
			where: { orderId },
		})
		if (existingPayment) {
			if (existingPayment.status === "COMPLETED") {
				// Allow additional payments for COMPLETED orders (e.g., partial payments)
				console.log(
					`Initiate Payment: Creating additional payment for already COMPLETED orderId ${orderId}.`
				)

				// Create a new payment record for the additional payment
				const additionalPaymentData = {
					orderId: uuidv4(), // Generate new unique UUID for additional payment
					amount: amount,
					currency: currency.toUpperCase(),
					status: "PENDING",
					paymentMethod: "FISERV_HPP",
					initiatedAt: new Date(),
					...(event?.userId && { user: { connect: { id: event?.userId } } }),
					...(event?.propertyId && {
						property: { connect: { id: event?.propertyId } },
					}),
					...(eventId && { event: { connect: { id: eventId } } }),
					metadata: {
						initialChargeTotal: chargeTotal,
						locale,
						...(eventId && { eventId }),
						parentOrderId: orderId, // Reference to original orderId
						additionalPayment: true,
					},
				}

				const additionalPayment = await prisma.payment.create({
					data: additionalPaymentData,
				})

				return NextResponse.json(
					{
						message: "Additional payment initiated successfully",
						orderId: additionalPayment.orderId,
						status: "PENDING",
						payment: additionalPayment,
					},
					{ status: 201 }
				)
			}

			if (existingPayment.status === "PENDING") {
				// If already PENDING, the prerequisite is met. No need to do anything else here.
				console.log(
					`Initiate Payment: Payment for orderId ${orderId} already PENDING.`
				)
				// We can return a 200 OK, indicating the initiation is effectively successful as the record is ready.
				return NextResponse.json(
					{
						message:
							"Payment initiation successful (already pending)",
						orderId: orderId,
						status: "PENDING",
					},
					{ status: 200 }
				)
			}
			if (existingPayment.status === "FAILED") {
				// Allow retry for failed payments - reset to PENDING status
				console.log(
					`Initiate Payment: Resetting failed payment ${orderId} to PENDING for retry.`
				)

				const updatedPayment = await prisma.payment.update({
					where: { orderId },
					data: {
						status: "PENDING",
						initiatedAt: new Date(), // Update initiation time
						...(amount && { amount }), // Update amount if provided
						...(currency && { currency: currency.toUpperCase() }), // Update currency if provided
						metadata: {
							...((existingPayment.metadata as Record<
								string,
								unknown
							>) || {}),
							initialChargeTotal: chargeTotal,
							locale,
							...(eventId && { eventId }),
							retryAttempt: true, // Mark as retry attempt
						},
					},
				})

				return NextResponse.json(
					{
						message: "Payment retry initiated successfully",
						orderId: orderId,
						status: "PENDING",
						payment: updatedPayment,
					},
					{ status: 200 }
				)
			}

			// For any other status, prevent duplicate
			console.warn(
				`Initiate Payment: Order ID ${orderId} already exists with status ${existingPayment.status}.`
			)
			return NextResponse.json(
				{
					error: `Order ID already exists with status ${existingPayment.status}`,
				},
				{ status: 409 }
			) // 409 Conflict
		}

		type PaymentData = {
			orderId: string
			amount: number
			currency: string
			status: string
			paymentMethod: string
			initiatedAt: Date
			user?: { connect: { id: string } }
			property?: { connect: { id: number } }
			event?: { connect: { id: number } }
			metadata: {
				initialChargeTotal: string
				locale?: string
				eventId?: number
			}
		}

		const paymentData: PaymentData = {
			orderId,
			amount: amount, // Ensure this matches your Prisma schema (Number or Decimal)
			currency: currency.toUpperCase(),
			status: "PENDING",
			paymentMethod: "FISERV_HPP", // Indicate payment method
			initiatedAt: new Date(),
			...(event?.userId && { user: { connect: { id: event?.userId } } }),
			...(event?.propertyId && {
				property: { connect: { id: event?.propertyId } },
			}),
			...(eventId && { event: { connect: { id: eventId } } }), // Connect to Event at the root of paymentData
			metadata: {
				initialChargeTotal: chargeTotal, // Store original string value if needed
				locale,
				...(eventId && { eventId }), // Keep eventId in metadata for informational purposes if needed
				// ...(userId && { initiatedByUserId: userId }) // Include userId in metadata if available
			},
		}

		// if (userId) {
		//   paymentData.userId = userId;
		// }

		const newPayment = await prisma.payment.create({
			data: paymentData,
		})

		console.log(
			`Initiate Payment: Successfully created PENDING payment for orderId ${orderId}`
		)
		return NextResponse.json(
			{ message: "Payment initiated successfully", payment: newPayment },
			{ status: 201 }
		)
	} catch (error) {
		console.error("Initiate Payment: Internal server error:", error)
		// Check for ZodError specifically if not caught by safeParse (e.g. if parsing happens outside)
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: "Invalid input", details: error.flatten() },
				{ status: 400 }
			)
		}
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		)
	}
}
