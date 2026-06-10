/** @format */

"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useDispatch } from "react-redux"
import { usePathname, useRouter, useSearchParams, useParams } from "next/navigation"
import { Actions } from "@/state/action-creators"
import SimpleDateRangePicker from "../apartamenty/components/SimpleDateRangePicker"
// import { IconButton } from "@mui/material"
// import ShoppingBasketIcon from "@mui/icons-material/ShoppingBasket"
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"

type BookingHeaderProps = {
	color?: string
	initialDateRange?: string | null
	showDatePicker?: boolean
	showPriceFrom?: boolean
	showBookButton?: boolean
	totalPrice?: number | null
	minPrice?: number
	hasTotalPrice?: boolean
	cleaningFee?: number
	parkingFee?: number
	isExpanded?: boolean
	onToggleExpanded?: () => void
	onOpenBasket?: () => void
	onAddToBasket?: () => void
	isInBasket?: boolean
	disableAddToBasket?: boolean
	roomsSelectedCount?: number
	showReservationPageButton?: boolean
}

const parseDateRange = (range: string | null): { start: Date | null; end: Date | null } => {
	if (!range) return { start: null, end: null }

	const [startStr, endStr] = range.split("_")
	if (!startStr || !endStr) return { start: null, end: null }

	const start = new Date(startStr)
	const end = new Date(endStr)

	if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
		return { start: null, end: null }
	}

	return { start, end }
}

const translations = {
	pl: {
		totalPrice: "Cena całkowita",
		from: "od",
		night: "noc",
		additionalFees: "Dodatkowe opłaty",
		bookNow: "Zarezerwuj",
		closeMenu: "Zamknij",
		reservationButton: "Rezerwuj",
	},
	en: {
		totalPrice: "Total Price",
		from: "from",
		night: "night",
		additionalFees: "Additional Fees",
		bookNow: "Book Now",
		closeMenu: "Close",
		reservationButton: "Book",
	},
	de: {
		totalPrice: "Gesamtpreis",
		from: "ab",
		night: "Nacht",
		additionalFees: "Zusätzliche Gebühren",
		bookNow: "Jetzt buchen",
		closeMenu: "Schließen",
		reservationButton: "Buchen",
	},
	es: {
		totalPrice: "Precio total",
		from: "desde",
		night: "noche",
		additionalFees: "Tarifas adicionales",
		bookNow: "Reservar",
		closeMenu: "Cerrar",
		reservationButton: "Reservar",
	},
}

export default function BookingHeader({
	color = "#1976d2",
	initialDateRange = null,
	showDatePicker = true,
	showPriceFrom = true,
	showBookButton = true,
	totalPrice = null,
	minPrice = 0,
	hasTotalPrice = false,
	cleaningFee = 0,
	parkingFee = 0,
	isExpanded = false,
	onToggleExpanded,
	onOpenBasket,
	onAddToBasket,
	isInBasket = false,
	disableAddToBasket = false,
	// roomsSelectedCount = 0,
	showReservationPageButton = false,
}: BookingHeaderProps) {
	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()
	const params = useParams() as { lang?: string }
	const dispatch = useDispatch()

	const effectiveDateRange = useMemo(() => {
		return initialDateRange || searchParams.get("dateRange")
	}, [initialDateRange, searchParams])

	const { start: initialStart, end: initialEnd } = useMemo(() => parseDateRange(effectiveDateRange), [effectiveDateRange])
	const lang = params.lang || "pl"
	const translation = translations[lang as keyof typeof translations] || translations.pl
	const [checkInDate, setCheckInDate] = useState<Date | null>(initialStart)
	const [checkOutDate, setCheckOutDate] = useState<Date | null>(initialEnd)

	useEffect(() => {
		setCheckInDate(initialStart)
		setCheckOutDate(initialEnd)
	}, [initialStart, initialEnd])

	const updateDateRange = (startDate: Date | null, endDate: Date | null) => {
		setCheckInDate(startDate)
		setCheckOutDate(endDate)

		const lang = params.lang || "pl"
		const targetPath = pathname || `/${lang}`
		const newSearchParams = new URLSearchParams(Array.from(searchParams.entries()))

		if (startDate && endDate) {
			const startStr = startDate.toLocaleDateString("sv-SE")
			const endStr = endDate.toLocaleDateString("sv-SE")
			const dateRangeParam = `${startStr}_${endStr}`
			newSearchParams.set("dateRange", dateRangeParam)
			const query = newSearchParams.toString()
			router.push(`${targetPath}${query ? `?${query}` : ""}`)
			dispatch({
				type: Actions.SET_FILTERS,
				payload: {
					byCreatedAt: false,
					startDate: startStr,
					endDate: endStr,
				},
			})
		} else if (!startDate && !endDate) {
			newSearchParams.delete("dateRange")
			const query = newSearchParams.toString()
			router.push(`${targetPath}${query ? `?${query}` : ""}`)
			dispatch({
				type: Actions.SET_FILTERS,
				payload: {
					byCreatedAt: false,
				},
			})
		}
	}

	const hasPrice = minPrice > 0
	const showPriceBlock = showPriceFrom && hasPrice

	return (
		<div className="mb-4">
			{showDatePicker && (
				<div className="mb-4">
					<SimpleDateRangePicker onDateRangeChange={updateDateRange} initialStartDate={checkInDate} initialEndDate={checkOutDate} color={color} />
				</div>
			)}

			{(showPriceFrom || showBookButton) && (
				<div className="flex items-center justify-between gap-3 p-1 md:flex-row">
					{showPriceBlock ? (
						<div className="text-left w-2/3 md:w-full md:p-2">
							<div className="text-md font-semibold text-gray-800">
								{hasTotalPrice ? translation.totalPrice : translation.from}{" "}
								<span className="text-2xl font-bold text-green-600">PLN {hasTotalPrice ? totalPrice?.toFixed(0) : minPrice?.toFixed(0)}</span>{" "}
								{hasTotalPrice ? "" : translation.night}
							</div>
							<div className="text-sm text-gray-600 mt-1">
								{"+ " + translation.additionalFees}: {cleaningFee + parkingFee} PLN
							</div>
						</div>
					) : (
						<div className="flex-1" />
					)}

					{(showBookButton && onToggleExpanded) || onAddToBasket || onOpenBasket || showReservationPageButton ? (
						<div className="flex items-center gap-2 w-full md:w-auto">
							{showBookButton && onToggleExpanded && (
								<button className="bg-[#cc9678] w-full text-white font-semibold py-2 px-4 rounded" onClick={onToggleExpanded}>
									{isExpanded ? translation.closeMenu : translation.bookNow}
								</button>
							)}

							{onAddToBasket && (
								<button
									onClick={onAddToBasket}
									disabled={disableAddToBasket}
									className={`inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white text-gray-700 transition-colors duration-200 px-3 py-[6px] shadow-sm hover:bg-gray-100 ${disableAddToBasket ? "opacity-50 cursor-not-allowed" : ""}`}>
									{isInBasket ? (
										<>
											<CheckCircleIcon className="h-5 w-5 text-green-600" />
										</>
									) : (
										<AddShoppingCartIcon className="h-5 w-5" />
									)}
								</button>
							)}
							{/* {onOpenBasket ? (
								<IconButton
									aria-label="Basket"
									onClick={onOpenBasket}
									className="rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
									<ShoppingBasketIcon className="h-5 w-5" />
									{roomsSelectedCount > 0 && <span className="ml-1 text-sm font-semibold">{roomsSelectedCount}</span>}
								</IconButton>
							) : null}
							{showReservationPageButton && (
								<button
									className="bg-[#cc9678] w-full text-white font-semibold py-2 px-4 rounded md:w-auto hover:bg-[#b88569] transition-colors"
									onClick={() => router.push(`/${lang}/rezerwacja`)}>
									{translation.reservationButton}
								</button>
							)} */}
						</div>
					) : null}
				</div>
			)}
		</div>
	)
}
