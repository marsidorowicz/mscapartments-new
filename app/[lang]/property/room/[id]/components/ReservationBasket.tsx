/** @format */
"use client"

import React from "react"
import CloseIcon from "@mui/icons-material/Close"
import ShoppingBasketIcon from "@mui/icons-material/ShoppingBasket"
import DeleteIcon from "@mui/icons-material/Delete"
import { useDispatch, useSelector } from "react-redux"
import { formatCurrency } from "@/utilities/functions/payments/currencyFormat"
import type { ReservationForProperty } from "@/app/[lang]/components/rev13/PropertyList"
import type { Dictionary } from "@/app/types/dictionary"
import type { ExtendedData } from "@/types"
import type { RootState } from "@/state/store"
import { setSelectedPropertiesToRent, setServices } from "@/state/action-creators"

const getItemTotal = (item: ReservationForProperty, serviceReservations: ReservationForProperty[] = []) => {
	const source = serviceReservations.find((res) => res.id === item.id) || item
	const baseTotal = source.totalPrice ?? source.price ?? 0
	const cleaningFee = source.cleaningFee ?? 0
	const parkingTotal = (source.parkingQuantity ?? 0) * (source.parkingFee ?? 0)
	const localTaxTotal = source.localTaxSum ?? 0
	const extended = source.extended as { breakfastFee?: number; petFee?: number; babyCribFee?: number } | undefined
	const breakfastTotal = (source.breakfastQuantity ?? 0) * (extended?.breakfastFee ?? 0)
	const petsTotal = (source.petsQuantity ?? 0) * (extended?.petFee ?? 0)
	const babyCribTotal = (source.babyCribQuantity ?? 0) * (extended?.babyCribFee ?? 0)
	const babyBedLinenTotal = source.babyBedLinen ? (source.babyBedLinenQuantity ?? 0) * 50 : 0
	return baseTotal + cleaningFee + parkingTotal + localTaxTotal + breakfastTotal + petsTotal + babyCribTotal + babyBedLinenTotal
}

const createServicesPayload = (reservations: ReservationForProperty[], servicesState: RootState["root"]["services"] | null | undefined) => {
	const totalPrice = reservations.reduce((sum, reservation) => sum + getItemTotal(reservation, reservations), 0)
	const paymentOption = servicesState?.paymentOption || "100"
	const totalPriceOnline = paymentOption === "30" ? totalPrice * 1.05 : (servicesState?.totalPriceOnline ?? 0)
	const parkingTotal = reservations.reduce((sum, reservation) => sum + (reservation.parkingQuantity ?? 0) * (reservation.parkingFee ?? 0), 0)
	const cleaningFee = reservations.reduce((sum, reservation) => sum + (reservation.cleaningFee ?? 0), 0)
	const cityTax = reservations.reduce((sum, reservation) => sum + (reservation.localTaxSum ?? 0), 0)
	const petsTotal = reservations.reduce(
		(sum, reservation) => sum + (reservation.petsQuantity ?? 0) * ((reservation.extended as ExtendedData)?.petFee || 0),
		0,
	)
	const breakfastTotal = reservations.reduce(
		(sum, reservation) => sum + (reservation.breakfastQuantity ?? 0) * ((reservation.extended as ExtendedData)?.breakfastFee || 0),
		0,
	)
	const babyCribTotal = reservations.reduce(
		(sum, reservation) => sum + (reservation.babyCribQuantity ?? 0) * ((reservation.extended as ExtendedData)?.babyCribFee || 0),
		0,
	)
	const babyBedLinenTotal = reservations.reduce((sum, reservation) => sum + (reservation.babyBedLinen ? (reservation.babyCribQuantity ?? 0) * 50 : 0), 0)

	return {
		reservations,
		totalPrice,
		totalPriceOnline,
		remainingGuests: servicesState?.remainingGuests ?? 0,
		parkingTotal,
		cleaningFee,
		cityTax,
		petsTotal,
		breakfastTotal,
		babyCribTotal,
		babyBedLinenTotal,
		paymentOption,
		discountData: servicesState?.discountData ?? null,
		discountTotal: servicesState?.discountTotal ?? 0,
		currentTotalPrice: totalPrice,
		parsedRemarks: servicesState?.parsedRemarks,
		notes: servicesState?.notes,
	}
}

type ReservationBasketProps = {
	open: boolean
	onClose: () => void
	items: ReservationForProperty[]
	serviceReservations?: ReservationForProperty[]
	totalPrice: number
	dictionary: Dictionary
}

export default function ReservationBasket({ open, onClose, items, serviceReservations = [], totalPrice, dictionary }: ReservationBasketProps) {
	const dispatch = useDispatch()
	const servicesState = useSelector((state: RootState) => state.root.services)

	const handleRemove = (item: ReservationForProperty) => {
		const updatedItems = items.filter((reservation) => reservation.id !== item.id)
		const updatedReservations = serviceReservations.filter((reservation) => reservation.id !== item.id)

		dispatch(setSelectedPropertiesToRent(updatedItems))
		dispatch(setServices(createServicesPayload(updatedReservations, servicesState)))
	}

	if (!open) return null

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
			<div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
				<div className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
					<div className="flex items-center gap-3">
						<ShoppingBasketIcon className="h-6 w-6 text-gray-900" />
						<div>
							<h2 className="text-lg font-semibold text-gray-900">{dictionary.apartments?.basketTitle || "Basket"}</h2>
							<p className="text-sm text-gray-500">{dictionary.apartments?.basketDescription || "Selected apartments in your basket"}</p>
						</div>
					</div>
					<button
						className="rounded-full border border-gray-200 bg-white p-2 text-gray-700 transition hover:bg-gray-50"
						onClick={onClose}
						aria-label="Close basket">
						<CloseIcon className="h-5 w-5" />
					</button>
				</div>

				<div className="max-h-[70vh] overflow-y-auto px-4 py-4">
					{items.length === 0 ? (
						<div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
							{dictionary.apartments?.basketEmpty || "No apartments added to the basket."}
						</div>
					) : (
						<div className="space-y-3">
							{items.map((item) => (
								<div key={item.id} className="rounded-2xl border border-gray-200 p-4">
									<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
										<div>
											<p className="font-semibold text-gray-900">{item.name}</p>
											<p className="text-sm text-gray-500">{item.location}</p>
										</div>
										<div className="flex items-center justify-between gap-4 text-right">
											<div>
												<p className="font-semibold text-gray-900">
													{formatCurrency(getItemTotal(item, serviceReservations), item.currency || "PLN")}
												</p>
												<p className="text-sm text-gray-500">{dictionary.apartments?.basketItemPerStay || "per stay"}</p>
											</div>
											<button
												className="rounded-full border border-gray-200 bg-white p-2 text-gray-700 transition hover:bg-gray-50"
												onClick={() => handleRemove(item)}
												aria-label="Remove apartment from basket">
												<DeleteIcon className="h-5 w-5" />
											</button>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				<div className="flex items-center justify-between border-t border-gray-200 px-4 py-4">
					<span className="font-semibold text-gray-900">{dictionary.apartments?.basketTotal || "Total"}</span>
					<span className="text-lg font-bold text-green-600">{formatCurrency(totalPrice, "PLN")}</span>
				</div>
			</div>
		</div>
	)
}
