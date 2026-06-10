/** @format */

import {
	CreatePriceAvailability,
	Event,
	DeletePriceAvailability,
	NobedsRequestDeleteType,
	Availability,
	NobedsSearchRequestType,
	PrismaUserRoomIdhRequestType,
	NEXT_PUBLIC_API_BASE_URL,
} from "@/types"
import { format, parseISO, startOfDay } from "date-fns"

export const AVAILABILITY_URL = NEXT_PUBLIC_API_BASE_URL + "/availability"

const date = new Date() // Use the current date
const formattedDate = format(date, "yyyy-MM-dd'T'HH:mm:ss")

async function deleteReservationNobedsPrisma({
	event,
	availability,
	price,
	ip,
}: {
	event: Event
	availability: Availability | undefined
	price: number
	ip: string
}) {
	const requestData: NobedsRequestDeleteType = {
		event: event,
		room_id: event?.room_id,
		availability: availability,
		price: price,
	}

	const options = {
		method: "POST",
		headers: {
			accept: "application/json",
			"content-type": "application/json",
		},
		body: JSON.stringify(requestData),
	}
	try {
		const response = await fetch(`${ip}/delete-reservation`, options)
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`)
		}
		const data = await response.json()
		return data
	} catch (error) {
		console.error("Error deleting reservation:", error)
		return null
	}
}

async function searchAvailable({ data }: { data: NobedsSearchRequestType }) {
	if (!data) {
		return null
	}

	const options = {
		method: "POST",
		headers: {
			accept: "application/json",
			"content-type": "application/json",
		},
		body: JSON.stringify(data),
	}
	try {
		const response = await fetch(`${AVAILABILITY_URL}/re`, options)
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`)
		}
		const data = await response.json()
		return data
	} catch (error) {
		console.log("Error searching available:", error)
		return null
	}
}

async function searchAvailableOneProperty({ data }: { data: NobedsSearchRequestType & { propertyName: string } }) {
	if (!data || !data.propertyName) {
		return null
	}

	const options = {
		method: "POST",
		headers: {
			accept: "application/json",
			"content-type": "application/json",
		},
		body: JSON.stringify(data),
	}
	try {
		const response = await fetch(`${AVAILABILITY_URL}/reOne`, options)
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`)
		}
		const data = await response.json()
		return data
	} catch (error) {
		console.log("Error searching available for one property:", error)
		return null
	}
}

async function getEventsByRoomIdAndUserId({ data }: { data: PrismaUserRoomIdhRequestType }) {
	if (!data || !data?.room_id || !data?.userId) {
		return null
	}

	const options = {
		method: "POST",
		headers: {
			accept: "application/json",
			"content-type": "application/json",
		},
		body: JSON.stringify(data),
	}
	try {
		const response = await fetch(`/api/event/getByUserIdRoomId`, options)
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`)
		}
		const data = await response.json()
		return data
	} catch (error) {
		console.error("Error fetching events by roomId and userId:", error)
		return null
	}
}

type DeleteAvailByDateRequest = {
	date: string
	room_id: number
}

async function delAvailByDay({ date, room_id, ip }: { date: string; room_id: number; ip: string }) {
	console.log("deleting avail by date")
	if (!date) {
		return null
	}
	const requestData: DeleteAvailByDateRequest = {
		date: date,
		room_id: room_id,
	}

	const options = {
		method: "POST",
		headers: { accept: "application/json" },
		body: JSON.stringify(requestData),
	}
	try {
		const response = await fetch(`${ip}/delAvailByDate`, options)
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`)
		}
		const data = await response.json()
		return data
	} catch (error) {
		console.error("Error deleting availability by date:", error)
		return null
	}
}

async function createPriceAvailability({ data }: { data: CreatePriceAvailability }) {
	const options = {
		method: "POST",
		headers: {
			accept: "application/json",
			"content-type": "application/json",
		},
		body: JSON.stringify(data),
	}
	try {
		const response = await fetch(`${AVAILABILITY_URL}/tariff`, options)
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`)
		}
		const data = await response.json()
		return data
	} catch (error) {
		console.error("Error creating price availability:", error)
		return null
	}
}

async function deletePriceAvailability({ data }: { data: DeletePriceAvailability }) {
	const options = {
		method: "DELETE",
		headers: {
			accept: "application/json",
			"content-type": "application/json",
		},
		body: JSON.stringify(data),
	}
	try {
		const response = await fetch(`${AVAILABILITY_URL}/tariff`, options)
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`)
		}
		const data = await response.json()
		return data
	} catch (error) {
		console.error("Error deleting price availability:", error)
		return error
	}
}

function resetHours(dateToReset: string) {
	const date = parseISO(dateToReset)
	const startOfDate = startOfDay(date)
	const newDateString = format(startOfDate, "yyyy-MM-dd'T'HH:mm:ss")
	return newDateString
}

export {
	deleteReservationNobedsPrisma,
	resetHours,
	formattedDate,
	createPriceAvailability,
	deletePriceAvailability,
	delAvailByDay,
	searchAvailable,
	searchAvailableOneProperty,
	getEventsByRoomIdAndUserId,
}
