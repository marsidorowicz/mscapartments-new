/** @format */

"use client"

import React, { useEffect, useMemo, useState } from "react"
import clsx from "clsx"
import { useParams, useSearchParams } from "next/navigation"
import { useDispatch } from "react-redux"
import { addDays, addMonths, format, isAfter, isBefore, isSameDay, lastDayOfMonth, startOfMonth, startOfToday, differenceInDays } from "date-fns"
import { Actions, setNotification } from "@/state/action-creators"
import { useLocalStorageNew } from "@/utilities/hooks/useLocalStorage"

type LocaleType = "en" | "pl" | "it" | "de" | "es"

interface BasketItem {
	id: string | number
	name: string
	location?: string
	totalPrice?: number
	currency?: string
	dateRange?: string | null
}

interface NoBedsCacheCalendarEntry {
	id: string
	propertyId: number
	room_id: number
	rid?: number | null
	date: string
	price?: number | null
	available?: boolean | null
	quantity?: number | null
	minStay?: number | null
	maxStay?: number | null
	dirty?: boolean | null
}

const localeData: Record<
	LocaleType,
	{
		months: string[]
		weekdays: string[]
		prev: string
		next: string
		totalPriceLabel: string
		errors: {
			unavailableDates: string
			minStay: (nights: number) => string
			maxStay: (nights: number) => string
		}
	}
> = {
	en: {
		months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
		weekdays: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
		prev: "Prev",
		next: "Next",
		totalPriceLabel: "Total Price",
		errors: {
			unavailableDates: "Selected date range contains unavailable dates.",
			minStay: (nights) => `Minimum stay for selected dates is ${nights} nights.`,
			maxStay: (nights) => `Maximum stay for selected dates is ${nights} nights.`,
		},
	},
	pl: {
		months: ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"],
		weekdays: ["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"],
		prev: "Poprzedni",
		next: "Następny",
		totalPriceLabel: "Całkowita cena",
		errors: {
			unavailableDates: "Wybrany zakres zawiera niedostępne dni.",
			minStay: (nights) => `Minimalny pobyt dla wybranych dat to ${nights} dni.`,
			maxStay: (nights) => `Maksymalny pobyt dla wybranych dat to ${nights} dni.`,
		},
	},
	it: {
		months: ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"],
		weekdays: ["Lu", "Ma", "Me", "Gi", "Ve", "Sa", "Do"],
		prev: "Prec.",
		next: "Succ.",
		totalPriceLabel: "Prezzo totale",
		errors: {
			unavailableDates: "L\'intervallo di date selezionato contiene date non disponibili.",
			minStay: (nights) => `Il soggiorno minimo per le date selezionate è di ${nights} notti.`,
			maxStay: (nights) => `Il soggiorno massimo per le date selezionate è di ${nights} notti.`,
		},
	},
	de: {
		months: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
		weekdays: ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"],
		prev: "Zurück",
		next: "Weiter",
		totalPriceLabel: "Gesamtpreis",
		errors: {
			unavailableDates: "Der ausgewählte Zeitraum enthält nicht verfügbare Daten.",
			minStay: (nights) => `Mindestaufenthalt für ausgewählte Daten beträgt ${nights} Nächte.`,
			maxStay: (nights) => `Maximalaufenthalt für ausgewählte Daten beträgt ${nights} Nächte.`,
		},
	},
	es: {
		months: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
		weekdays: ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"],
		prev: "Ant.",
		next: "Sig.",
		totalPriceLabel: "Precio total",
		errors: {
			unavailableDates: "El rango de fechas seleccionado contiene fechas no disponibles.",
			minStay: (nights) => `La estancia mínima para las fechas seleccionadas es de ${nights} noches.`,
			maxStay: (nights) => `La estancia máxima para las fechas seleccionadas es de ${nights} noches.`,
		},
	},
}

interface DateRangeCalendarProps {
	propertyId?: string | null
	locale?: LocaleType
	monthsToShow?: number
	startDate?: Date
	endDate?: Date | null
	onDateClick?: (date: Date) => void
	onDateRangeChange?: (startDate: Date | null, endDate: Date | null) => void
	minDate?: Date
	theme?: "light" | "dark"
	initialCurrentMonth?: Date
}

export default function DateRangeCalendar({
	propertyId,
	locale,
	monthsToShow = 3,
	startDate,
	endDate,
	onDateClick,
	onDateRangeChange,
	minDate,
	theme = "light",
	initialCurrentMonth,
}: DateRangeCalendarProps) {
	const params = useParams() as { lang?: string }
	const currentLocale = (locale || (["en", "pl", "it", "de", "es"].includes(params?.lang || "") ? (params.lang as LocaleType) : "pl")) as LocaleType
	const localeStrings = localeData[currentLocale]

	const today = startOfToday()
	const effectiveMinDate = minDate || today
	const [currentMonth, setCurrentMonth] = useState<Date>(initialCurrentMonth || startOfMonth(effectiveMinDate))
	const [cacheEntries, setCacheEntries] = useState<NoBedsCacheCalendarEntry[]>([])
	const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(startDate || null)
	const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(endDate || null)
	const [displayMonths, setDisplayMonths] = useState<number>(monthsToShow)
	const [basketItems, setBasketItems] = useLocalStorageNew<BasketItem[]>("rootBasket", [])

	const searchParams = useSearchParams()
	const dispatch = useDispatch()

	const parseDateRangeParam = (dateRange: string | null): { startDate: Date | null; endDate: Date | null } => {
		if (!dateRange) return { startDate: null, endDate: null }
		const [start, end] = dateRange.split("_")
		if (!start || !end) return { startDate: null, endDate: null }
		const parsedStart = new Date(`${start}T00:00:00`)
		const parsedEnd = new Date(`${end}T00:00:00`)
		if (Number.isNaN(parsedStart.getTime()) || Number.isNaN(parsedEnd.getTime())) {
			return { startDate: null, endDate: null }
		}
		return { startDate: parsedStart, endDate: parsedEnd }
	}

	const queryDateRange = useMemo(() => parseDateRangeParam(searchParams?.get("dateRange")), [searchParams])

	const cacheEntryMap = useMemo(() => new Map(cacheEntries.map((entry) => [entry.date.slice(0, 10), entry])), [cacheEntries])

	const computeRangeTotal = React.useCallback(
		(rangeStart: Date | null, rangeEnd: Date | null) => {
			if (!rangeStart || !rangeEnd) return 0
			let total = 0
			let cursor = rangeStart
			while (isBefore(cursor, rangeEnd)) {
				const entry = cacheEntryMap.get(format(cursor, "yyyy-MM-dd"))
				if (entry?.price != null) total += entry.price
				cursor = addDays(cursor, 1)
			}
			return total
		},
		[cacheEntryMap],
	)

	// const selectedRangeTotal = useMemo(() => computeRangeTotal(selectedStartDate, selectedEndDate), [computeRangeTotal, selectedEndDate, selectedStartDate])

	const updateDateRangeUrl = (newStart: Date | null, newEnd: Date | null) => {
		const urlParams = new URLSearchParams(searchParams.toString())
		if (newStart && newEnd) {
			urlParams.set("dateRange", `${format(newStart, "yyyy-MM-dd")}_${format(newEnd, "yyyy-MM-dd")}`)
		} else {
			urlParams.delete("dateRange")
		}
		const queryString = urlParams.toString()
		const path = typeof window !== "undefined" ? window.location.pathname : `/${params.lang || "pl"}`
		// Use window.history.replaceState to prevent Next.js from triggering a Server Component re-render
		window.history.replaceState(null, "", `${path}${queryString ? `?${queryString}` : ""}`)
	}

	const fetchCacheEntries = async (roomId: string, rangeStart: Date, rangeEnd: Date) => {
		const queryParams = new URLSearchParams({
			id: roomId,
			startDate: format(rangeStart, "yyyy-MM-dd"),
			endDate: format(rangeEnd, "yyyy-MM-dd"),
		})

		try {
			const response = await fetch(`/api/nobeds-cache/entries?${queryParams.toString()}`)
			const data = await response.json()
			if (!response.ok) {
				console.error("Failed to load calendar prices:", data)
				return
			}
			setCacheEntries((prev) => {
				const fetched = data.entries || []
				if (prev.length > 0 && fetched.length > 0 && prev[0].propertyId.toString() !== fetched[0].propertyId.toString()) {
					return fetched
				}
				const map = new Map(prev.map((e) => [e.date.slice(0, 10), e]))
				fetched.forEach((e: NoBedsCacheCalendarEntry) => map.set(e.date.slice(0, 10), e))
				return Array.from(map.values())
			})
		} catch (error) {
			console.error("Error fetching calendar prices:", error)
		}
	}

	useEffect(() => {
		if (!propertyId) {
			return
		}

		const rangeStart = startOfMonth(currentMonth)
		const rangeEnd = lastDayOfMonth(addMonths(currentMonth, monthsToShow - 1))
		fetchCacheEntries(propertyId, rangeStart, rangeEnd)
	}, [propertyId, currentMonth, monthsToShow])

	const getMonthList = () => {
		return Array.from({ length: displayMonths }, (_, index) => addMonths(currentMonth, index))
	}

	useEffect(() => {
		const updateDisplayMonths = () => {
			if (typeof window !== "undefined" && window.innerWidth <= 640) {
				setDisplayMonths(1)
			} else {
				setDisplayMonths(monthsToShow)
			}
		}

		updateDisplayMonths()
		window.addEventListener("resize", updateDisplayMonths)
		return () => window.removeEventListener("resize", updateDisplayMonths)
	}, [monthsToShow])

	useEffect(() => {
		setSelectedStartDate(startDate || null)
	}, [startDate])

	useEffect(() => {
		setSelectedEndDate(endDate || null)
	}, [endDate])

	useEffect(() => {
		if ((!startDate || !endDate) && queryDateRange.startDate && queryDateRange.endDate) {
			setSelectedStartDate(queryDateRange.startDate)
			setSelectedEndDate(queryDateRange.endDate)
		}
	}, [startDate, endDate, queryDateRange])

	useEffect(() => {
		if (selectedStartDate && selectedEndDate) {
			const nextTotal = computeRangeTotal(selectedStartDate, selectedEndDate)
			dispatch({
				type: Actions.SET_FILTERS,
				payload: {
					byCreatedAt: false,
					startDate: format(selectedStartDate, "yyyy-MM-dd"),
					endDate: format(selectedEndDate, "yyyy-MM-dd"),
					totalPrice: nextTotal,
				},
			})
		} else {
			dispatch({
				type: Actions.SET_FILTERS,
				payload: {
					byCreatedAt: false,
					startDate: selectedStartDate ? format(selectedStartDate, "yyyy-MM-dd") : undefined,
					endDate: selectedEndDate ? format(selectedEndDate, "yyyy-MM-dd") : undefined,
					totalPrice: null,
				},
			})
		}
	}, [selectedStartDate, selectedEndDate, computeRangeTotal, dispatch])

	const getCalendarMatrix = (monthDate: Date) => {
		const startM = startOfMonth(monthDate)
		const dayOfWeek = (startM.getDay() + 6) % 7
		const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate()

		return Array.from({ length: 42 }, (_, i) => {
			const dayNum = i - dayOfWeek + 1
			if (dayNum < 1 || dayNum > daysInMonth) return null
			return new Date(monthDate.getFullYear(), monthDate.getMonth(), dayNum)
		})
	}

	const handleDateClick = (clicked: Date) => {
		if (isBefore(clicked, effectiveMinDate)) return

		let nextStart: Date | null = null
		let nextEnd: Date | null = null

		if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
			nextStart = clicked
			nextEnd = null
		} else {
			if (isBefore(clicked, selectedStartDate)) {
				nextStart = clicked
				nextEnd = selectedStartDate
			} else {
				nextStart = selectedStartDate
				nextEnd = clicked
			}
		}

		if (nextStart && nextEnd) {
			const numNights = differenceInDays(nextEnd, nextStart)
			let cursor = nextStart
			let isRangeValid = true
			let validationMessage = localeStrings.errors.unavailableDates

			while (isBefore(cursor, nextEnd)) {
				const dateKey = format(cursor, "yyyy-MM-dd")
				const cacheEntry = cacheEntryMap.get(dateKey)
				if (!cacheEntry || cacheEntry.quantity === 0 || cacheEntry.quantity === null) {
					isRangeValid = false
					break
				}
				if (cacheEntry.minStay && numNights < cacheEntry.minStay) {
					isRangeValid = false
					validationMessage = localeStrings.errors.minStay(cacheEntry.minStay)
					break
				}
				if (cacheEntry.maxStay && numNights > cacheEntry.maxStay) {
					isRangeValid = false
					validationMessage = localeStrings.errors.maxStay(cacheEntry.maxStay)
					break
				}
				cursor = addDays(cursor, 1)
			}

			if (!isRangeValid) {
				console.log("Validation failed, showing notification:", validationMessage)
				dispatch(
					setNotification({
						open: true,
						message: validationMessage,
						severity: "error",
					}),
				)
				nextStart = clicked
				nextEnd = null
			}
		}

		setSelectedStartDate(nextStart)
		setSelectedEndDate(nextEnd)

		if (onDateClick) {
			onDateClick(clicked)
		}

		if (onDateRangeChange) {
			onDateRangeChange(nextStart, nextEnd)
		}

		const nextTotal = computeRangeTotal(nextStart, nextEnd)

		if (nextStart && nextEnd) {
			updateDateRangeUrl(nextStart, nextEnd)

			if (propertyId && basketItems.some((item) => item.id.toString() === propertyId.toString())) {
				setBasketItems((prev) =>
					prev.map((item) => {
						if (item.id.toString() === propertyId.toString()) {
							return {
								...item,
								dateRange: `${format(nextStart!, "yyyy-MM-dd")}_${format(nextEnd!, "yyyy-MM-dd")}`,
								totalPrice: nextTotal,
							}
						}
						return item
					}),
				)
			}
			dispatch({
				type: Actions.SET_FILTERS,
				payload: {
					byCreatedAt: false,
					startDate: format(nextStart, "yyyy-MM-dd"),
					endDate: format(nextEnd, "yyyy-MM-dd"),
					totalPrice: nextTotal,
				},
			})
		} else {
			dispatch({
				type: Actions.SET_FILTERS,
				payload: {
					byCreatedAt: false,
					startDate: nextStart ? format(nextStart, "yyyy-MM-dd") : undefined,
					endDate: nextEnd ? format(nextEnd, "yyyy-MM-dd") : undefined,
					totalPrice: null,
				},
			})
		}
	}

	const handlePrevMonth = () => setCurrentMonth((prev) => addMonths(prev, -1))
	const handleNextMonth = () => setCurrentMonth((prev) => addMonths(prev, 1))

	const monthList = getMonthList()

	const colors = {
		light: {
			calendarBg: "bg-white",
			calendarBorder: "border-gray-200",
			calendarShadow: "shadow-lg",
			calendarText: "text-gray-800",
			calendarDay: "text-gray-700",
			calendarDayDisabled: "text-gray-400 bg-gray-50",
			calendarDaySelected: "bg-[#cc9678] text-white opacity-100",
			calendarDayInRange: "bg-[#cc9678]/20",
			calendarDayHover: "hover:bg-[#cc9678]/10",
		},
		dark: {
			calendarBg: "bg-gray-800",
			calendarBorder: "border-gray-700",
			calendarShadow: "shadow-lg shadow-gray-900/50",
			calendarText: "text-gray-200",
			calendarDay: "text-gray-200",
			calendarDayDisabled: "text-gray-600 bg-gray-800",
			calendarDaySelected: "bg-[#cc9678] text-white opacity-100",
			calendarDayInRange: "bg-[#cc9678]/30",
			calendarDayHover: "hover:bg-[#cc9678]/20",
		},
	}

	const c = colors[theme]

	return (
		<div className={clsx("bg-white/98 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/50", c.calendarBg)}>
			<div className="flex flex-col gap-4">
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
					{monthList.map((monthDate, idx) => {
						const days = getCalendarMatrix(monthDate)
						const monthLabel = `${localeStrings.months[monthDate.getMonth()]} ${monthDate.getFullYear()}`

						return (
							<div key={idx} className="min-w-0">
								<div className={clsx("flex items-center justify-between font-semibold mb-2", c.calendarText)}>
                                    {idx === 0 ? (
                                        <button
                                            onClick={handlePrevMonth}
                                            className={clsx("px-3 py-1 rounded-md transition-colors duration-200 text-black", c.calendarDayHover, c.calendarBorder)}
                                        >
                                            {"<"}
                                        </button>
                                    ) : (
                                        <div className="w-10"></div>
                                    )}
                                    <div className="text-center">{monthLabel}</div>
                                    {idx === monthList.length - 1 ? (
                                        <button
                                            onClick={handleNextMonth}
                                            className={clsx("px-3 py-1 rounded-md transition-colors duration-200 text-black", c.calendarDayHover, c.calendarBorder)}
                                        >
                                            {">"}
                                        </button>
                                    ) : (
                                        <div className="w-10"></div>
                                    )}
                                </div>
								<div className={clsx("grid grid-cols-7 text-center text-sm mb-1", c.calendarText)}>
									{localeStrings.weekdays.map((day) => (
										<div key={day} className="p-1">
											{day}
										</div>
									))}
								</div>
								<div className="grid grid-cols-7 gap-1">
									{days.map((date, i) => {
										if (!date) return <div key={i} className="p-2" />

										const disabled = isBefore(date, effectiveMinDate)
										const isStart = selectedStartDate && isSameDay(date, selectedStartDate)
										const isEnd = selectedEndDate && isSameDay(date, selectedEndDate)
										const inRange =
											selectedEndDate && selectedStartDate && isAfter(date, selectedStartDate) && isBefore(date, selectedEndDate)
										const dateKey = format(date, "yyyy-MM-dd")
										const cacheEntry = cacheEntryMap.get(dateKey)
										const hasAvailableQuantity = !disabled && cacheEntry?.quantity != null && cacheEntry.quantity > 0

										const quantityUnavailable = cacheEntry ? cacheEntry.quantity === 0 || cacheEntry.quantity === null : true
										return (
											<button
												key={i}
												disabled={disabled || quantityUnavailable}
												onClick={() => {
													if (disabled || quantityUnavailable) return
													handleDateClick(date)
												}}
												className={clsx(
													"p-2 rounded-md transition-colors duration-200",
													(disabled || quantityUnavailable) && !(isStart || isEnd)
														? "text-gray-300 bg-gray-100 cursor-not-allowed"
														: c.calendarDay,
													!disabled && !quantityUnavailable && !(isStart || isEnd) && c.calendarDayHover,
													hasAvailableQuantity && !(isStart || isEnd) ? "border border-emerald-400" : "",
													isStart || isEnd ? c.calendarDaySelected : inRange ? c.calendarDayInRange : "",
												)}>
												<div className="flex flex-col items-center gap-[2px]">
													<span>{format(date, "d")}</span>
													{cacheEntry?.price != null && (
														<>
															<span
																className={clsx(
																	"text-sm leading-none",
																	hasAvailableQuantity ? "text-green-600 font-semibold" : "text-gray-300",
																)}>
																{Math.round(cacheEntry.price)}
															</span>
															<span
																className={clsx(
																	"text-[10px] uppercase tracking-[0.15em]",
																	hasAvailableQuantity ? "text-green-600" : "text-gray-300",
																)}>
																PLN
															</span>
														</>
													)}
												</div>
											</button>
										)
									})}
								</div>
							</div>
						)
					})}
				</div>
				{selectedStartDate && selectedEndDate && (
					<div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
						<div>
							<strong>{format(selectedStartDate, "dd.MM")}</strong> - <strong>{format(selectedEndDate, "dd.MM")}</strong>
						</div>
						{/* <div className="text-green-600 font-semibold">
							{localeStrings.totalPriceLabel}: PLN {selectedRangeTotal.toFixed(0)}
						</div> */}
					</div>
				)}
			</div>
		</div>
	)
}
