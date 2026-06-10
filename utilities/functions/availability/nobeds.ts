/** @format */

import { parseISO, format, startOfDay } from "date-fns"

const NOBEDS_API: string | undefined = process.env.NOBEDS_API_KEY

export const checkNoBedsAvailability = async ({ room_id, fromdate, todate }: { room_id: number; fromdate: string; todate: string }) => {
	function resetHours(dateToReset: string) {
		const date = parseISO(dateToReset)
		const startOfDate = startOfDay(date)
		const newDateString = format(startOfDate, "yyyy-MM-dd'T'HH:mm:ss")
		return newDateString
	}

	const formattedFromDate = resetHours(fromdate)
	const formattedToDate = resetHours(todate)

	const url = new URL(`https://api.nobeds.com/api/Availability/${NOBEDS_API}`)
	url.searchParams.append("room_id", room_id.toString())
	url.searchParams.append("fromdate", formattedFromDate)
	url.searchParams.append("todate", formattedToDate)

	try {
		const response = await fetch(url.toString(), {
			method: "GET",
			headers: { accept: "application/json" },
		})

		const data = await response.json()

		console.log(`NoBeds availability response for room ${room_id}:`, data)

		// Return response in axios-like format for compatibility
		return {
			status: response.status,
			statusText: response.statusText,
			data: data,
			headers: response.headers,
		}
	} catch (error) {
		console.error(`Error checking availability for room ${room_id}:`, error)

		// Handle fetch errors (network errors, etc.)
		return {
			status: 500,
			statusText: "Network Error",
			data: null,
			error: error instanceof Error ? error.message : "Unknown error",
		}
	}
}

export const checkNoBedsAvailabilityAll = async ({ fromdate, todate }: { fromdate: string; todate: string }) => {
	console.log(`Checking NoBeds availability for all properties from ${fromdate} to ${todate}...`)
	function resetHours(dateToReset: string) {
		const date = parseISO(dateToReset)
		const startOfDate = startOfDay(date)
		const newDateString = format(startOfDate, "yyyy-MM-dd'T'HH:mm:ss")
		return newDateString
	}

	const formattedFromDate = resetHours(fromdate)
	const formattedToDate = resetHours(todate)

	const url = new URL(`https://api.nobeds.com/api/Availability/${NOBEDS_API}`)
	url.searchParams.append("fromdate", formattedFromDate)
	url.searchParams.append("todate", formattedToDate)

	try {
		const response = await fetch(url.toString(), {
			method: "GET",
			headers: { accept: "application/json" },
		})

		const data = await response.json()

		// Return response in axios-like format for compatibility
		return {
			status: response.status,
			statusText: response.statusText,
			data: data,
			headers: response.headers,
		}
	} catch (error) {
		console.error(`Error checking availability for all properties:`, error)

		// Handle fetch errors (network errors, etc.)
		return {
			status: 500,
			statusText: "Network Error",
			data: null,
			error: error instanceof Error ? error.message : "Unknown error",
		}
	}
}
