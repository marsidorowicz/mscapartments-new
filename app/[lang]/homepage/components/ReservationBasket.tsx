/** @format */
"use client"

import React, { useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import CloseIcon from "@mui/icons-material/Close"
import ShoppingBasketIcon from "@mui/icons-material/ShoppingBasket"
import { formatCurrency } from "@/utilities/functions/payments/currencyFormat"
import type { Dictionary } from "@/app/types/dictionary"
import { BasketItemCard } from "@/app/[lang]/rezerwacja/components/BasketItemCard"
import { useLocalStorageNew } from "@/utilities/hooks/useLocalStorage"
import {
	type BasketItem,
	type ItemState,
	translations,
	localeMap,
	buildInitialState,
	createServicesFromProperty,
	parseDateRange,
	differenceInDays,
} from "@/app/[lang]/rezerwacja/functions/basketHelpers"

type ReservationBasketProps = {
	open: boolean
	onClose: () => void
	items: BasketItem[]
	onRemove: (item: BasketItem) => void
	dictionary: Dictionary
}

export default function ReservationBasket({ open, onClose, items, onRemove, dictionary }: ReservationBasketProps) {
	const params = useParams() as { lang?: string }
	const locale = params?.lang || "pl"
	const localeCode = localeMap[locale] || localeMap.pl
	const t = translations[locale as keyof typeof translations] || translations.pl

	const [itemStates, setItemStates] = useLocalStorageNew<Record<string, ItemState>>("rootBasketStates", {})

	// Sync initial states if missing
	useEffect(() => {
		if (typeof window === "undefined") return
		setItemStates((prev) => {
			const next: Record<string, ItemState> = { ...prev }
			let hasChanges = false
			items.forEach((item) => {
				const key = item.id.toString()
				if (!next[key]) {
					next[key] = buildInitialState(item, prev[key])
					hasChanges = true
				}
			})
			// Cleanup orphaned states
			const validKeys = items.map((i) => i.id.toString())
			Object.keys(next).forEach((k) => {
				if (!validKeys.includes(k)) {
					delete next[k]
					hasChanges = true
				}
			})
			return hasChanges ? next : prev
		})
	}, [items, setItemStates])

	// Load property details for states that don't have it
	useEffect(() => {
		if (!items.length) return

		const loadPropertyDetails = async () => {
			const promises = items.map(async (item) => {
				const id = item.id.toString()
				const existing = itemStates[id]
				if (existing?.property) return { id, data: existing.property } // already loaded

				try {
					const response = await fetch(`/api/properties/mountain/${id}`)
					if (!response.ok) return { id, data: null }
					const json = await response.json()
					return { id, data: json.property }
				} catch {
					return { id, data: null }
				}
			})

			const results = await Promise.all(promises)

			setItemStates((prev) => {
				const next = { ...prev }
				let hasUpdates = false

				results.forEach((result) => {
					if (!result.data) return
					const key = result.id
					const existing = next[key]
					if (!existing || existing.property) return

					hasUpdates = true
					// Merge just like BasketPageClient
					next[key] = {
						...existing,
						maxOccupancy: result.data.maxOccupancy || existing?.maxOccupancy || 1,
						parkingQuantity: result.data.parkingQuantity ?? existing?.parkingQuantity ?? 0,
						petsMax: result.data.extended?.petsMax ?? existing?.petsMax ?? 0,
						propertyName: result.data.name || existing?.propertyName,
						breakfastAllowed: result.data.extended?.breakfastAllowed ?? existing?.breakfastAllowed,
						petsAllowed: result.data.extended?.petsAllowed ?? existing?.petsAllowed,
						babyCribAllowed: result.data.extended?.babyCribAllowed ?? existing?.babyCribAllowed,
						placeName: result.data.place?.name || existing?.placeName,
						property: result.data,
						services: createServicesFromProperty(existing?.services, result.data),
					}
				})
				return hasUpdates ? next : prev
			})
		}

		loadPropertyDetails()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [items]) // Re-run if items change but avoid infinity loops via the inside checks

	// --- Basket action handlers (same as BasketPageClient) ---
	const updateGuests = (itemId: string, value: number) => {
		setItemStates((prev) => {
			const existing = prev[itemId]
			if (!existing) return prev
			const guests = Math.max(1, Math.min(existing.maxOccupancy, value))

			const updatedServices = existing.services.map((service) => {
				const maxQuantity = getMaxQuantity(itemId, service.id, { ...existing, guests })
				let quantity = service.quantity
				if (maxQuantity !== undefined && quantity > maxQuantity) quantity = maxQuantity
				return { ...service, quantity, selected: quantity > 0 }
			})

			return { ...prev, [itemId]: { ...existing, guests, services: updatedServices } }
		})
	}

	const toggleServiceSelected = (itemId: string, serviceId: string) => {
		if (serviceId === "cleaning") return
		setItemStates((prev) => {
			const existing = prev[itemId]
			if (!existing) return prev
			return {
				...prev,
				[itemId]: {
					...existing,
					services: existing.services.map((service) => {
						if (service.id === serviceId) {
							const newSelected = !service.selected
							return { ...service, selected: newSelected, quantity: newSelected ? 1 : 0 }
						}
						return service
					}),
				},
			}
		})
	}

	const changeServiceQuantity = (itemId: string, serviceId: string, delta: number) => {
		if (serviceId === "cleaning") return
		setItemStates((prev) => {
			const existing = prev[itemId]
			if (!existing) return prev
			const maxQuantity = getMaxQuantity(itemId, serviceId, existing)
			return {
				...prev,
				[itemId]: {
					...existing,
					services: existing.services.map((service) => {
						if (service.id === serviceId) {
							const current = service.quantity || 0
							let next = current + delta
							if (next < 0) next = 0
							if (maxQuantity !== undefined && next > maxQuantity) next = maxQuantity
							return { ...service, quantity: next, selected: next > 0 }
						}
						return service
					}),
				},
			}
		})
	}

	const setServiceQuantity = (itemId: string, serviceId: string, value: number) => {
		if (serviceId === "cleaning") return
		setItemStates((prev) => {
			const existing = prev[itemId]
			if (!existing) return prev
			const maxQuantity = getMaxQuantity(itemId, serviceId, existing)
			let next = value
			if (next < 0) next = 0
			if (maxQuantity !== undefined && next > maxQuantity) next = maxQuantity

			return {
				...prev,
				[itemId]: {
					...existing,
					services: existing.services.map((service) => {
						if (service.id === serviceId) {
							return { ...service, quantity: next, selected: next > 0 }
						}
						return service
					}),
				},
			}
		})
	}

	const toggleExpanded = (itemId: string) => {
		setItemStates((prev) => {
			const existing = prev[itemId]
			if (!existing) return prev
			return { ...prev, [itemId]: { ...existing, expanded: !existing.expanded } }
		})
	}

	const getMaxQuantity = (itemId: string, serviceId: string, itemState: ItemState) => {
		if (serviceId === "parking") return itemState.parkingQuantity ?? 0
		if (serviceId === "pets") return itemState.petsMax ?? 10
		if (serviceId === "babyCrib" || serviceId === "babyBedLinen") return 2
		if (serviceId === "breakfast") {
			const item = items.find((i) => i.id.toString() === itemId)
			let nights = 1
			if (item) {
				const range = parseDateRange(item.dateRange)
				if (range) nights = Math.max(1, differenceInDays(range.end, range.start))
			}
			return (itemState.guests ?? 1) * nights
		}
		return undefined
	}

	// Calculate total including services and local tax
	const totalGlobalPrice = items.reduce((sum, item) => {
		const id = item.id.toString()
		const state = itemStates[id]
		let itemTotal = item.totalPrice || 0
		if (state) {
			const dateRange = parseDateRange(item.dateRange)
			const nights = dateRange ? Math.max(1, differenceInDays(dateRange.end, dateRange.start)) : 1
			const localTax = (state.property?.localTax ?? 0) * nights * (state.guests ?? 1)
			const serviceTotal = state.services.reduce((s, service) => {
				if (!service.selected) return s
				return s + service.price * service.quantity
			}, 0)
			itemTotal += localTax + serviceTotal
		}
		return sum + itemTotal
	}, 0)

	if (!open) return null

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
			<div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl flex flex-col max-h-[90vh]">
				<div className="flex items-center justify-between border-b border-gray-200 px-4 py-4 shrink-0">
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

				<div className="flex-1 overflow-y-auto px-4 py-4 xs:px-1 xs:py-1">
					{items.length === 0 ? (
						<div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
							{dictionary.apartments?.basketEmpty || "No apartments added to the basket."}
						</div>
					) : (
						<div className="space-y-4">
							{items.map((item) => {
								const id = item.id.toString()
								const state = itemStates[id] || buildInitialState(item, undefined)
								return (
									<BasketItemCard
										key={id}
										item={item}
										state={state}
										lang={locale}
										localeCode={localeCode}
										t={t}
										onRemove={() => onRemove(item)}
										onToggleExpanded={() => toggleExpanded(id)}
										onUpdateGuests={(val) => updateGuests(id, val)}
										onToggleServiceSelected={(sId) => toggleServiceSelected(id, sId)}
										onChangeServiceQuantity={(sId, delta) => changeServiceQuantity(id, sId, delta)}
										onSetServiceQuantity={(sId, val) => setServiceQuantity(id, sId, val)}
									/>
								)
							})}
						</div>
					)}
				</div>

				<div className="shrink-0">
					<div className="flex items-center justify-between border-t border-gray-200 px-4 py-4">
						<span className="font-semibold text-gray-900">{dictionary.apartments?.basketTotal || "Total"}</span>
						<div className="text-right">
							<div className="text-lg font-bold text-green-600">{formatCurrency(totalGlobalPrice, "PLN")}</div>
							{/* <div className="text-sm text-gray-500">+ {dictionary.apartments?.additionalFees}</div> */}
						</div>
					</div>
					{/* <div className="px-4 pb-4 text-sm text-gray-500">
						{dictionary.apartments?.additionalFeesExplanation ||
							"Podane kwoty nie uwzględniają dodatkowych opłat jak opłata rezerwacyjna, podatki oraz koszt dodatkowych usług"}
					</div> */}
					<div className="flex items-center justify-end px-4 pb-6">
						{items.length > 0 && (
							<Link
								href={`/${locale}/rezerwacja`}
								onClick={onClose}
								className="inline-block px-6 py-2 bg-[#cc9678] text-white font-semibold rounded-xl hover:bg-[#a6755a] transition">
								{dictionary.apartments?.bookNow || "Rezerwuj"}
							</Link>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}
