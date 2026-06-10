/** @format */
"use client"
import { format, parseISO, startOfDay } from "date-fns"
import { upsertEvent, upsertEventDb } from "./event"

// Function to get a 7-day window centered on the given date
function getWeek(date: Date) {
	// Calculate 3 days before and 3 days after the given date to put it in the middle
	const middleDay = new Date(date)
	const firstDayOfWeek = new Date(middleDay)
	firstDayOfWeek.setDate(middleDay.getDate() - 3)

	const lastDayOfWeek = new Date(middleDay)
	lastDayOfWeek.setDate(middleDay.getDate() + 3)

	return {
		start: firstDayOfWeek,
		end: lastDayOfWeek,
	}
}

// Function to get the month for a given date
function getMonth(date: Date) {
	const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
	const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0)
	return { start: firstDayOfMonth, end: lastDayOfMonth }
}

export function resetHours(dateToReset: string | Date) {
	let date
	if (typeof dateToReset === "string") {
		date = parseISO(dateToReset)
	} else if (typeof dateToReset === "object") {
		date = dateToReset
	} else return 0

	const startOfDate = startOfDay(date)
	const newDateString = format(startOfDate, "yyyy-MM-dd'T'HH:mm:ss")
	return new Date(newDateString)
}

export { getWeek, getMonth, upsertEvent, upsertEventDb }
