/** @format */

"use client"

import { useEffect, useState } from "react"
import { getEventsByRoomIdAndUserId } from "@/utilities/functions/nobeds"
import { addDays, subDays } from "date-fns"
import AvailabilityCalendar, { DateRange } from "./Calendarv2"
import { Property } from "@/types"
import { Dictionary } from "../../../../../types/dictionary"

// Sample Event interface (adjust based on your actual event structure)
interface Event {
	startDate?: string // or Date if you're directly using Date objects
	endDate?: string // same as above
}

interface PropertyAvailabilityCalendarProps {
	property: Property
	dictionary: Dictionary
	lang: string
	numOfMonths?: number
	colorAvailable?: string
	colorBlocked?: string
}

export default function PropertyAvailabilityCalendar({
	property,
	dictionary,
	lang,
	numOfMonths = 3,
	colorAvailable = "bg-emerald-50 text-emerald-900 border-2 border-emerald-600 font-semibold",
	colorBlocked = "bg-red-50 text-red-900 border-2 border-red-600 font-semibold",
}: PropertyAvailabilityCalendarProps) {
	const [events, setEvents] = useState([])
	const [middleMonth, setMiddleMonth] = useState<Date | null>(new Date())

	// Get a dummy user ID - in a real scenario, this would come from auth or be static
	const userId = "clok0rd6f0000kkdgyf1pd0t3" // This should be replaced with actual user logic

	useEffect(() => {
		if (!property.room_id && !property.room_id) return
		if (!userId || !middleMonth) return

		const toDateDays = (numOfMonths + 1) * 30
		const roomId = property.room_id || property.room_id

		async function getEvents() {
			const data = {
				room_id: roomId || 0,
				userId: userId,
				toDate: addDays(middleMonth || new Date(), toDateDays),
			}

			try {
				const fetchEvents = await getEventsByRoomIdAndUserId({ data })
				setEvents(fetchEvents?.events || [])
			} catch (error) {
				console.error("Error fetching events:", error)
				setEvents([])
			}
		}

		getEvents()
	}, [property.room_id, userId, middleMonth, numOfMonths])

	const getDisabledRangesFromEvents = (events: Event[]): DateRange[] => {
		if (!events || events.length === 0) return []

		return events.reduce<DateRange[]>((acc, event) => {
			// Ensure that both startDate and endDate exist
			if (event.startDate && event.endDate) {
				const startDate = new Date(event.startDate) // Convert string to Date
				const endDate = new Date(event.endDate)

				// Subtract one day for endDate if needed
				const adjustedEndDate = subDays(endDate, 1)

				// Push valid DateRange objects into the accumulator
				acc.push({ startDate, endDate: adjustedEndDate })
			}
			return acc
		}, [])
	}

	const disabledRanges = getDisabledRangesFromEvents(events)

	// Don't render if no room ID available
	if (!property.room_id && !property.room_id) {
		return (
			<div className="bg-white/98 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/50">
				<div className="text-center py-12">
					<p className="text-lg text-gray-700 font-medium">{dictionary.calendar.notAvailable}</p>
				</div>
			</div>
		)
	}

	return (
		<div className="bg-white/98 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/50">
			<div className="mb-8">
				{/* <h2 className="text-lg  text-gray-900 mb-3">{dictionary.calendar.title || "Property Calendar"}</h2> */}

				<p className="text-lg text-gray-700 font-medium">{dictionary.calendar.subtitle.replace("{{propertyName}}", property.name)}</p>
			</div>

			<div className="flex flex-col items-center justify-center bg-white rounded-xl p-6 border border-gray-200">
				<div className="w-full [&_h2]:text-gray-800 [&_h2]:font-bold [&_h2]:text-xl [&_.font-bold]:text-gray-700 [&_.font-bold]:font-semibold [&_button]:bg-[#cc9678] [&_button]:text-white [&_button]:font-semibold [&_button]:border-0 [&_button]:shadow-md [&_button:hover]:bg-[#b8856a] [&_button:disabled]:bg-gray-400 [&_button:disabled]:opacity-60 [&_select]:bg-gray-50 [&_select]:border-2 [&_select]:border-gray-300 [&_select]:text-gray-700 [&_select]:font-medium [&_.border]:border-gray-200">
					<AvailabilityCalendar
						disableSelection
						colors={{
							available: colorAvailable,
							blocked: colorBlocked,
						}}
						unavailableDates={[disabledRanges]} // Pass valid DateRange[]
						middleChange={(date) => setMiddleMonth(date)}
						locale={lang}
					/>
				</div>
			</div>

			{/* Legend */}
			<div className="mt-8 flex justify-center gap-8">
				<div className="flex items-center gap-3">
					<div className="w-6 h-6 bg-emerald-50 border-2 border-emerald-600 rounded-lg shadow-sm flex items-center justify-center">
						<span className="text-xs font-bold text-emerald-900">✓</span>
					</div>
					<span className="text-base text-gray-800 font-semibold">{dictionary.calendar.available}</span>
				</div>
				<div className="flex items-center gap-3">
					<div className="w-6 h-6 bg-red-50 border-2 border-red-600 rounded-lg shadow-sm flex items-center justify-center">
						<span className="text-xs font-bold text-red-900">✕</span>
					</div>
					<span className="text-base text-gray-800 font-semibold">{dictionary.calendar.booked}</span>
				</div>
			</div>
		</div>
	)
}
