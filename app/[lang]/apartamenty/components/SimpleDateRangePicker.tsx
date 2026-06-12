/** @format */

"use client"

import React, { useState, useEffect } from "react"
import { Button, Box, Paper, Popover } from "@mui/material"
import {
	KeyboardArrowDown as ArrowDownIcon,
	KeyboardArrowLeft as ArrowLeftIcon,
	KeyboardArrowRight as ArrowRightIcon,
	Close as CloseIcon,
	Clear as ClearIcon,
} from "@mui/icons-material"
import { format, isBefore, isAfter, isSameDay, startOfToday, startOfMonth } from "date-fns"
import { useParams } from "next/navigation"

// -------------------------------------------------
// 1) Translation data (simplified)
// -------------------------------------------------
interface ITranslation {
	selectDateRange: string
	startDate: string
	endDate: string
	selectDate: string
	prev: string
	next: string
	day: string
	month: string
	year: string
	months: string[]
	weekdays: string[]
}

const translations: Record<"en" | "pl" | "de" | "es", ITranslation> = {
	en: {
		selectDateRange: "Select date range",
		startDate: "Start Date",
		endDate: "End Date",
		selectDate: "Select dates",
		prev: "Prev",
		next: "Next",
		day: "Day",
		month: "Month",
		year: "Year",
		months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
		weekdays: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
	},
	pl: {
		selectDateRange: "Wybierz termin",
		startDate: "Data początkowa",
		endDate: "Data końcowa",
		selectDate: "Wybierz zakres dat",
		prev: "Poprz.",
		next: "Dalej",
		day: "Dzień",
		month: "Mies.",
		year: "Rok",
		months: ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"],
		weekdays: ["Nd", "Pn", "Wt", "Śr", "Cz", "Pt", "So"],
	},
	de: {
		selectDateRange: "Zeitraum auswählen",
		startDate: "Startdatum",
		endDate: "Enddatum",
		selectDate: "Zeitraum auswählen",
		prev: "Zurück",
		next: "Weiter",
		day: "Tag",
		month: "Monat",
		year: "Jahr",
		months: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
		weekdays: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
	},
	es: {
		selectDateRange: "Seleccionar rango de fechas",
		startDate: "Fecha de inicio",
		endDate: "Fecha de fin",
		selectDate: "Seleccionar rango de fechas",
		prev: "Ant.",
		next: "Sig.",
		day: "Día",
		month: "Mes",
		year: "Año",
		months: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
		weekdays: ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"],
	},
}

// -------------------------------------------------
// 2) Component props
// -------------------------------------------------
interface SimpleDateRangePickerProps {
	onDateRangeChange?: (startDate: Date | null, endDate: Date | null) => void
	initialStartDate?: Date | null
	initialEndDate?: Date | null
	color?: string
}

// -------------------------------------------------
// 3) The main component
// -------------------------------------------------
const SimpleDateRangePicker: React.FC<SimpleDateRangePickerProps> = ({ onDateRangeChange, initialStartDate, initialEndDate, color = "#cc9678" }) => {
	const params = useParams() as { lang?: string }
	const [startDate, setStartDate] = useState<Date | null>(initialStartDate ?? null)
	const [endDate, setEndDate] = useState<Date | null>(initialEndDate ?? null)
	const [locale, setLocale] = useState<"pl" | "en" | "de" | "es">("pl")
	const [isOpen, setIsOpen] = useState(false)
	const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
	const [currentMonth, setCurrentMonth] = useState(startOfMonth(startOfToday()))

	useEffect(() => {
		// Set locale based on URL parameter or default to 'pl'
		const lang = (params.lang as "pl" | "en" | "de" | "es") || "pl"
		setLocale(lang)
	}, [params.lang])

	useEffect(() => {
		setStartDate(initialStartDate ?? null)
		setEndDate(initialEndDate ?? null)
	}, [initialStartDate, initialEndDate])

	const t = (key: keyof ITranslation): string => {
		const value = translations[locale][key]
		return Array.isArray(value) ? value.join(", ") : value
	}

	const today = startOfToday()

	// Get calendar data
	const getCalendarMatrix = (monthDate: Date) => {
		const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
		const lastDay = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)
		const startDate = new Date(firstDay)
		startDate.setDate(startDate.getDate() - firstDay.getDay())

		const matrix = []
		const currentDate = new Date(startDate)

		for (let week = 0; week < 6; week++) {
			const weekRow = []
			for (let day = 0; day < 7; day++) {
				weekRow.push(currentDate.getMonth() === monthDate.getMonth() ? new Date(currentDate) : null)
				currentDate.setDate(currentDate.getDate() + 1)
			}
			matrix.push(weekRow)
			if (currentDate > lastDay && week >= 4) break
		}
		return matrix.flat()
	}

	const handleDateClick = (date: Date) => {
		if (isBefore(date, today)) return

		if (!startDate || (startDate && endDate)) {
			// Start new selection
			setStartDate(date)
			setEndDate(null)
		} else if (startDate && !endDate) {
			// Complete selection
			if (isBefore(date, startDate)) {
				setStartDate(date)
			} else {
				setEndDate(date)
				setIsOpen(false)
				onDateRangeChange?.(startDate, date)
			}
		}
	}

	const handlePrevMonth = () => {
		setCurrentMonth((prev: Date) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
	}

	const handleNextMonth = () => {
		setCurrentMonth((prev: Date) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
	}

	const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget)
		setIsOpen(true)
	}

	const handleClose = () => {
		setIsOpen(false)
		setAnchorEl(null)
	}

	const shortWeekdays: Record<"pl" | "en" | "de" | "es", string[]> = {
		pl: ["nd", "pn", "wt", "śr", "cz", "pt", "so"],
		en: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
		de: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
		es: ["do", "lu", "ma", "mi", "ju", "vi", "sa"],
	}

	const shortMonths: Record<"pl" | "en" | "de" | "es", string[]> = {
		pl: ["sty", "lut", "mar", "kwi", "maj", "cze", "lip", "sie", "wrz", "paź", "lis", "gru"],
		en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
		de: ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"],
		es: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"],
	}

	const formatSingleDate = (date: Date): string => {
		const weekday = shortWeekdays[locale][date.getDay()]
		const month = shortMonths[locale][date.getMonth()]
		return `${weekday}. ${date.getDate()} ${month}.`
	}

	const formatDateRange = (): string => {
		if (!startDate) return "-"
		if (!endDate) return formatSingleDate(startDate)
		return `${formatSingleDate(startDate)} - ${formatSingleDate(endDate)}`
	}

	const monthsArr = t("months").split(", ")
	const weekdaysArr = t("weekdays").split(", ")
	const days = getCalendarMatrix(currentMonth)

	return (
		<Box>
			<Button
				variant="outlined"
				onClick={handleButtonClick}
				sx={{
					width: "100%",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					textTransform: "none",
					padding: "12px 16px",
					border: "2px solid",
					borderColor: color,
					"&:hover": {
						borderColor: color,
					},
				}}>
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						width: "100%",
						fontSize: "1rem",
						color: "text.secondary",
						mb: 0.5,
						px: 1,
						whiteSpace: "nowrap",
						position: "relative",
					}}>
					{t("selectDateRange")}
					<Box sx={{ display: "flex", alignItems: "center", ml: 0.5 }}>
						<ArrowDownIcon sx={{ fontSize: "1rem" }} />
						{(startDate || endDate) && (
							<ClearIcon
								onClick={(e) => {
									e.stopPropagation()
									setStartDate(null)
									setEndDate(null)
									onDateRangeChange?.(null, null)
								}}
								sx={{
									fontSize: "1rem",
									ml: 0.5,
									cursor: "pointer",
									color: color,
									"&:hover": {
										color: "error.main",
									},
								}}
							/>
						)}
					</Box>
				</Box>
				<div style={{ fontSize: "1.1rem", fontWeight: "bold", color: color, width: "280px", textAlign: "center" }}>{formatDateRange()}</div>
			</Button>

			<Popover
				open={isOpen}
				anchorEl={anchorEl}
				onClose={handleClose}
				anchorOrigin={{
					vertical: "bottom",
					horizontal: "left",
				}}
				transformOrigin={{
					vertical: "top",
					horizontal: "left",
				}}>
				<Paper sx={{ p: 2, minWidth: "300px" }}>
					{/* Header with close button */}
					<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
						<Box sx={{ fontWeight: "bold" }}>{t("selectDate")}</Box>
						<Button onClick={handleClose} size="small" sx={{ color: color, minWidth: "auto", px: 1 }}>
							<CloseIcon />
						</Button>
					</Box>

					{/* Month navigation */}
					<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
						<Button onClick={handlePrevMonth} size="small" sx={{ color: color }}>
							<ArrowLeftIcon />
						</Button>
						<Box sx={{ fontWeight: "bold" }}>
							{monthsArr[currentMonth.getMonth()]} {currentMonth.getFullYear()}
						</Box>
						<Button onClick={handleNextMonth} size="small" sx={{ color: color }}>
							<ArrowRightIcon />
						</Button>
					</Box>

					{/* Weekdays header */}
					<Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1, mb: 1 }}>
						{weekdaysArr.map((day) => (
							<Box key={day} sx={{ textAlign: "center", fontSize: "0.8rem", fontWeight: "bold" }}>
								{day}
							</Box>
						))}
					</Box>

					{/* Calendar grid */}
					<Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1 }}>
						{days.map((date, i) => {
							if (!date) return <Box key={i} sx={{ p: 1 }} />

							const disabled = isBefore(date, today)
							const isStart = startDate && isSameDay(date, startDate)
							const isEnd = endDate && isSameDay(date, endDate)
							const inRange = startDate && endDate && isAfter(date, startDate) && isBefore(date, endDate)

							return (
								<Button
									key={i}
									disabled={disabled}
									onClick={() => handleDateClick(date)}
									sx={{
										minWidth: "36px",
										height: "36px",
										p: 0,
										borderRadius: "4px",
										fontSize: "0.9rem",
										backgroundColor: isStart || isEnd ? color : inRange ? `${color}20` : "transparent",
										color: isStart || isEnd ? "white" : disabled ? "text.disabled" : "text.primary",
										"&:hover": {
											backgroundColor: isStart || isEnd ? color : inRange ? `${color}40` : "action.hover",
										},
									}}>
									{format(date, "d")}
								</Button>
							)
						})}
					</Box>
				</Paper>
			</Popover>
		</Box>
	)
}

export default SimpleDateRangePicker
