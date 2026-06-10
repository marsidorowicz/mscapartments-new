/** @format */

import { Event } from "@/types"

// Note: This is a non-React file, so we can't use useI18n directly here
// Instead, we'll use basic messages and the component that calls this function
// should handle translations appropriately

const API_URL = "/api/event"

async function upsertEvent({ event, source, id, offerId }: { event: Event; source?: string; id: string; offerId?: string }) {
	try {
		let result
		let response

		if (event?.id) {
			response = await fetch(API_URL, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ event, offerId }),
			})

			const responseData = await response.json()

			if (responseData?.status === "error") {
				return {
					success: false,
					error: responseData.message || "Failed to update event",
					data: null,
				}
			}

			result = response.status === 200 ? responseData : null
		} else {
			response = await fetch(API_URL, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ event, source, id, offerId }),
			})

			const responseData = await response.json()

			if (responseData?.status === "error") {
				return {
					success: false,
					error: responseData.message || "Failed to create event",
					data: null,
				}
			}

			result = response.status === 200 ? responseData : null
		}

		// If API call was unsuccessful, return standardized error response
		if (!result) {
			return {
				success: false,
				error: `Server returned status ${response.status}`,
				data: null,
			}
		}

		// Return a standardized successful response
		return result
	} catch (error) {
		console.error("Error upserting event:", error)
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error occurred",
			data: null,
		}
	}
}

const API_DB_URL = "/api/event/db"

async function upsertEventDb({ event, source, id, offerId }: { event: Event; source?: string; id: string; offerId?: string }) {
	try {
		if (event?.id) {
			return {
				success: false,
				error: "PUT updates are not supported by upsertEventDb",
				data: null,
			}
		}

		const response = await fetch(API_DB_URL, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify({ event, source, id, offerId }),
		})

		const responseData = await response.json()

		if (responseData?.status === "error") {
			return {
				success: false,
				error: responseData.message || "Failed to create event",
				data: null,
			}
		}

		const result = response.status === 200 ? responseData : null

		if (!result) {
			return {
				success: false,
				error: `Server returned status ${response.status}`,
				data: null,
			}
		}

		return result
	} catch (error) {
		console.error("Error upserting event to DB route:", error)
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error occurred",
			data: null,
		}
	}
}

export { upsertEvent, upsertEventDb }
