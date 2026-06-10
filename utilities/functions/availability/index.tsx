/** @format */

import { AvailabilityGetRequestType, NEXT_PUBLIC_API_BASE_URL, SetPriceAvailability } from "@//types"
import axios from "axios"

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
		const response = await axios.get(url)
		return response?.data
	} catch (error) {
		return { error: true, message: error }
	}
}

//for nobeds with room_id
async function mapPriceAvailability({ data }: { data: SetPriceAvailability }) {
	const options = {
		method: "POST",
		url: `${AVAILABILITY_URL}/map`,
		headers: {
			accept: "application/json",
			"content-type": "application/json",
		},
		data: data,
	}
	try {
		const response = await axios
			.request(options)
			.then(function (response) {
				return response
			})
			.catch(function (error) {
				console.log("Error mapping price availability:", error)

				return null
			})
		return response?.data
	} catch (error) {
		return error
	}
}

export { getAvailability, mapPriceAvailability }
