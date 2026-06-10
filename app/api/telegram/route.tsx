/** @format */

import { NextResponse } from "next/server"

export async function POST() {
	// This route is no longer used - all Telegram calls now go directly to the external service
	// Keeping the file for potential future use or as a reference

	/*
	try {
		const body = await req.json()
		const { chatIds, message, propertyName } = body

		console.log("Received request to send Telegram message:", { chatIds, message, propertyName })

		// Validate input

		if (!chatIds || !Array.isArray(chatIds) || chatIds.length === 0) {
			return NextResponse.json(
				{
					success: false,
					error: "Missing or invalid chatIds. Must be an array of chat ID strings.",
				},
				{ status: 400 },
			)
		}

		if (!message) {
			return NextResponse.json(
				{
					success: false,
					error: "Message is required",
				},
				{ status: 400 },
			)
		}

		// Forward the request to the Node.js server running on port 4000
		const response = await fetch("http://localhost:4000/api/send-telegram", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				chatIds,
				message,
				propertyName,
			}),
		})

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`)
		}

		const data = await response.json()

		// Return the response from the Node.js server
		return NextResponse.json(data, { status: response.status })
	} catch (error: unknown) {
		console.error("Error in telegram notification API route:", error)

		// Check if the error is from fetch response
		if (error instanceof Error && error.message.includes("HTTP error!")) {
			const statusMatch = error.message.match(/status: (\d+)/)
			const status = statusMatch ? parseInt(statusMatch[1]) : 500
			return NextResponse.json(
				{
					success: false,
					error: "Error from notification server",
				},
				{ status },
			)
		}

		// General error handling
		const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
		return NextResponse.json(
			{
				success: false,
				error: errorMessage,
			},
			{ status: 500 },
		)
	}
	*/

	// Return a deprecation notice
	return NextResponse.json(
		{
			success: false,
			error: "This endpoint is deprecated. Telegram notifications are now sent directly to the external service.",
		},
		{ status: 410 }, // 410 Gone
	)
}
