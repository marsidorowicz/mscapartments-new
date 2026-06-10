/** @format */

import axios from "axios"
import { format, parseISO, startOfDay } from "date-fns"

const NOBEDS_API: string | undefined = process.env.NOBEDS_API_KEY

type RemoveAvailabilityData = {
	rid: number
	room_id: number
	date: string
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	currentAvail: any
	price: number
	min_stay: number
	max_stay: number
}

type RestoreAvailabilityData = {
	rid: number
	room_id: number
	date: string
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	currentAvail: any
	price: number
	min_stay: number
	max_stay: number
	targetQuantity?: number // Optional target quantity for restoration
}

export const restoreAvailability = async (data: RestoreAvailabilityData) => {
	const {
		rid,
		room_id,
		date,
		currentAvail,
		price,
		min_stay,
		max_stay,
		targetQuantity,
	} = data
	if (!rid || !room_id || date === "") return null

	// Use targetQuantity if provided, otherwise default to currentAvail + 1
	const finalQuantity =
		targetQuantity !== undefined ? targetQuantity : currentAvail + 1

	const requestData = {
		rid: rid,
		room_id: room_id,
		date: date,
		quantity: finalQuantity,
		// Include price, min_stay, max_stay to preserve existing pricing while updating quantity
		price: price,
		min_stay: min_stay,
		max_stay: max_stay,
	}

	const options = {
		method: "PUT",
		url: `https://api.nobeds.com/api/Availability/${NOBEDS_API}`,
		headers: {
			accept: "application/json",
			"content-type": "application/*+json",
		},
		data: requestData,
	}

	try {
		const response = await axios.request(options)
		return response
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		console.error(
			`[restoreAvailability] Error releasing date ${date} for room ${room_id}:`,
			error
		)
		return {
			status: error.response?.status || 500,
			statusText: error.response?.statusText || "Error",
			error: error.message || "Unknown error",
		}
	}
}

export const removeAvailability = async (data: RemoveAvailabilityData) => {
	const { rid, room_id, date, currentAvail, price, min_stay, max_stay } = data

	if (!rid || !room_id || date === "") return null

	const options = {
		method: "PUT",
		url: `https://api.nobeds.com/api/Availability/${NOBEDS_API}`,
		headers: {
			accept: "application/json",
			"content-type": "application/*+json",
		},
		data: {
			rid: rid,
			room_id: room_id,
			date: date,
			quantity: currentAvail > 0 ? currentAvail - 1 : 0,
			price: price,
			min_stay: min_stay,
			max_stay: max_stay,
		},
	}

	try {
		const response = await axios.request(options)
		return response
	} catch (error: unknown) {
		const axiosError = error as {
			response?: { status?: number; statusText?: string }
			message?: string
		}
		console.error(`Error blocking date ${date} for room ${room_id}:`, error)
		return {
			status: axiosError.response?.status || 500,
			statusText: axiosError.response?.statusText || "Error",
			error: axiosError.message || "Unknown error",
		}
	}
}

export const resetHours = (dateToReset: string) => {
	const date = parseISO(dateToReset)
	const startOfDate = startOfDay(date)
	const newDateString = format(startOfDate, "yyyy-MM-dd'T'HH:mm:ss")
	return newDateString
}
