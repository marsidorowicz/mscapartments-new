/** @format */
"use client"
import React, { JSX, useEffect, useState } from "react"

export interface DateRange {
	startDate: Date
	endDate: Date
}

interface ColorOptions {
	available: string // Color for available dates
	blocked: string // Color for blocked dates
}

interface CalendarProps {
	unavailableDates: DateRange[][]
	monthsToDisplay?: number
	locale?: string
	colors?: ColorOptions // New prop for color options
	disableSelection?: boolean // New prop to disable selection
	middleChange: (date: Date) => void
}

const monthNames: Record<string, string[]> = {
	en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
	pl: ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"],
	de: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
	es: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
}

const buttonLabels: Record<string, { prev: string; next: string }> = {
	en: { prev: "Prev", next: "Next" },
	pl: { prev: "Poprzedni", next: "Następny" },
	de: { prev: "Zurück", next: "Weiter" },
	es: { prev: "Anterior", next: "Siguiente" },
	// Add more languages as needed
}

const dayNames: Record<string, string[]> = {
	en: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
	pl: ["Pon", "Wt", "Śr", "Czw", "Pt", "Sb", "Nd"],
	de: ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"],
	es: ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"],
}

const getDaysInMonth = (year: number, month: number) => {
	return new Date(year, month + 1, 0).getDate()
}

const isDateInRange = (date: Date, dateRange: DateRange) => {
	const start = new Date(dateRange.startDate.getFullYear(), dateRange.startDate.getMonth(), dateRange.startDate.getDate())
	const end = new Date(dateRange.endDate.getFullYear(), dateRange.endDate.getMonth(), dateRange.endDate.getDate())
	const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

	return targetDate >= start && targetDate <= end
}

const AvailabilityCalendar: React.FC<CalendarProps> = ({
	unavailableDates,
	monthsToDisplay,
	locale = "pl",
	colors = { available: "bg-green-200", blocked: "bg-red-500" }, // Default colors
	disableSelection = false, // Default value set to false
	middleChange,
}) => {
	const [currentMonth, setCurrentMonth] = useState(new Date())
	const [selectedStart, setSelectedStart] = useState<Date | null>(null)
	const [selectedEnd, setSelectedEnd] = useState<Date | null>(null)
	const [currentLocale, setCurrentLocale] = useState(locale)

	useEffect(() => {
		if (!monthNames[currentLocale] || !buttonLabels[currentLocale] || !dayNames[currentLocale]) {
			setCurrentLocale("en")
		}
	}, [currentLocale])

	useEffect(() => {
		if (currentMonth) {
			middleChange(currentMonth)
		}

		return () => {}
	}, [currentMonth, middleChange])

	const handleDateClick = (date: Date) => {
		if (!disableSelection) {
			if (!selectedStart || (selectedStart && selectedEnd)) {
				setSelectedStart(date)
				setSelectedEnd(null)
			} else if (selectedStart && !selectedEnd) {
				if (date < selectedStart) {
					setSelectedEnd(selectedStart)
					setSelectedStart(date)
				} else {
					setSelectedEnd(date)
				}
			} else if (selectedStart && selectedEnd) {
				const isOutsideRange = date < selectedStart || date > selectedEnd
				if (isOutsideRange) {
					setSelectedStart(date)
					setSelectedEnd(null)
				}
			}
		}
	}

	const isPastMonth = (month: Date) => {
		const today = new Date()
		const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)
		return month < currentMonthStart
	}

	const renderCalendar = () => {
		const calendars = []
		const month = currentMonth.getMonth()
		const year = currentMonth.getFullYear()
		const today = new Date()

		for (let i = 0; i < (monthsToDisplay || 1); i++) {
			const displayMonth = new Date(year, month + i)

			// Prepare a 7x6 grid (7 days a week, up to 6 weeks)
			const weeks: JSX.Element[][] = Array.from({ length: 6 }, () => Array(7).fill(null))

			const totalDays = getDaysInMonth(displayMonth.getFullYear(), displayMonth.getMonth())
			const firstDayOfMonth = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), 1)
			const startingDay = (firstDayOfMonth.getDay() + 6) % 7 // Adjusting to make Monday as the start day

			for (let dayIndex = 0; dayIndex < totalDays; dayIndex++) {
				const date = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), dayIndex + 1)
				// Compare only date parts (not time) to determine if it's a past date
				const today = new Date()
				const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
				const dateDateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
				const isPastDate = dateDateOnly < todayDateOnly
				const isUnavailable = unavailableDates.some((ranges) => ranges.some((range) => isDateInRange(date, range)))

				const isSelected = selectedStart && (date.getTime() === selectedStart.getTime() || date.getTime() === selectedEnd?.getTime() || (selectedEnd && date >= selectedStart && date <= selectedEnd))

				const weekIndex = Math.floor((dayIndex + startingDay) / 7)
				const dayOfWeek = (dayIndex + startingDay) % 7

				weeks[weekIndex][dayOfWeek] = (
					<div
						key={dayIndex}
						onClick={() => !isPastDate && !isUnavailable && !disableSelection && handleDateClick(date)}
						className={`flex items-center justify-center h-6 w-6
							${isPastDate ? "bg-gray-300" : isUnavailable ? colors.blocked : colors.available} 
							${isSelected ? "border-2 border-blue-500" : ""}
							${disableSelection || isPastDate ? "cursor-default" : "cursor-pointer"}
							${(isUnavailable || isPastDate) && disableSelection ? "opacity-80" : " "}
						`}>
						{date.getDate()}
					</div>
				)
			}

			calendars.push(
				<div key={i} className="border p-4 m-2 rounded-lg shadow-md">
					<h2 className="text-xl font-bold mb-2">
						{monthNames[currentLocale][displayMonth.getMonth()]} {displayMonth.getFullYear()}
					</h2>
					<div className="grid grid-cols-7 gap-2">
						{dayNames[currentLocale].map((day, index) => (
							<div key={index} className="font-bold text-center">
								{day}
							</div>
						))}
						{weeks.map((week, weekIndex) => (
							<React.Fragment key={weekIndex}>
								{week.map((day, dayIndex) => (
									<div
										key={dayIndex}
										className="flex justify-center"
										style={{
											minHeight: "16px",
											minWidth: "16px",
										}}>
										{day}
									</div>
								))}
							</React.Fragment>
						))}
					</div>
				</div>
			)
		}

		return calendars
	}

	return (
		<div className="flex flex-col items-center mt-1 w-full">
			<div className="flex mb-4 space-x-2">
				<button onClick={() => (isPastMonth(currentMonth) ? {} : setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)))} disabled={isPastMonth(currentMonth)} className={`px-4 py-2 bg-gray-200 rounded-l ${isPastMonth(currentMonth) ? "opacity-50 cursor-not-allowed" : ""}`}>
					{"<< " + buttonLabels[currentLocale].prev}
				</button>
				<button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="px-4 py-2 bg-gray-200 rounded-r">
					{buttonLabels[currentLocale].next + " >>"}
				</button>
			</div>
			{/* Wrapping the calendar with a responsive container */}
			<div className="w-full flex flex-wrap justify-center">{renderCalendar()}</div>
			<div className="flex items-center justify-center">
				<select value={currentLocale} onChange={(e) => setCurrentLocale(e.target.value)} className="  p-2 border rounded bg-gray-200">
					<option value="en">English</option>
					<option value="pl">Polski</option>
					<option value="de">Deutsch</option>
					<option value="es">Español</option>
					{/* Add more languages as needed */}
				</select>
			</div>
		</div>
	)
}

export default AvailabilityCalendar
