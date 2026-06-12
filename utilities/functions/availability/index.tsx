/** @format */

import { AvailabilityGetRequestType, NEXT_PUBLIC_API_BASE_URL, SetPriceAvailability } from "@//types"

export const AVAILABILITY_URL = NEXT_PUBLIC_API_BASE_URL + "/availability"

async function getAvailability({ data }: { data: AvailabilityGetRequestType }) {
	if (!data) {
		return null
	}
	const params = new URLSearchParams({
		data: JSON.stringify(data),
	})
	const url = `${AVAILABILITY_URL}?${params.toString()}`

	try {
		const response = await fetch(url, {
			method: "GET",
		})
		const dataJson = await response.json()
		return dataJson
	} catch (error) {
		return { error: true, message: error }
	}
}

//for nobeds with room_id
async function mapPriceAvailability({ data }: { data: SetPriceAvailability }) {
	const url = `${AVAILABILITY_URL}/map`

	try {
		const response = await fetch(url, {
			method: "POST",
			headers: {
				accept: "application/json",
				"content-type": "application/json",
			},
			body: JSON.stringify(data),
		})

		if (!response.ok) {
			console.log("Error mapping price availability: fetch failed with status", response.status)
			return null
		}

		const dataJson = await response.json()
		return dataJson
	} catch (error) {
		console.log("Error mapping price availability:", error)
		return null
	}
}

export { getAvailability, mapPriceAvailability }
