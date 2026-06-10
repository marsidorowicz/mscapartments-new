/** @format */

import { NextRequest, NextResponse } from "next/server"
import prisma from "@/prisma/prisma"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
	try {
		// Get the oid from URL params
		const searchParams = new URL(req.url).searchParams
		const oid = searchParams.get("oid")
		console.log("Payment details request for order ID:", oid)

		// Basic validation
		if (!oid) {
			return NextResponse.json(
				{ error: "Missing order ID" },
				{ status: 400 }
			)
		}
		// Find the payment by orderId and include the related event with its access token
		const payment = await prisma.payment.findFirst({
			where: {
				orderId: oid,
			},
			include: {
				event: {
					select: {
						accessToken: true,
						accessTokenExpiry: true,
					},
				},
			},
			orderBy: {
				createdAt: "desc", // Get most recent if multiple exist
			},
		})

		if (!payment) {
			return NextResponse.json(
				{ error: "Payment not found" },
				{ status: 404 }
			)
		}

		// Include the access token in the response if available
		const responseData = {
			...payment,
			accessToken: payment.event?.accessToken || null,
			accessTokenExpiry: payment.event?.accessTokenExpiry || null,
		}

		return NextResponse.json(responseData)
	} catch (error) {
		console.error("Payment details retrieval error:", error)
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		)
	}
}
