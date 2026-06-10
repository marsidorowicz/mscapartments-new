/** @format */

import Image from "next/image"
import Link from "next/link"
import { formatCurrency } from "@/utilities/functions/payments/currencyFormat"
import { buildPropertyUrl } from "@/utilities/functions/propertyUrl"
import {
	type BasketItem,
	type ItemState,
	type ServiceState,
	type ServiceOption,
	formatDate,
	parseDateRange,
	differenceInDays,
} from "../functions/basketHelpers"

type BasketItemCardProps = {
	item: BasketItem
	state: ItemState
	lang: string
	localeCode: string
	t: Record<string, string>
	onRemove: () => void
	onToggleExpanded: () => void
	onUpdateGuests: (value: number) => void
	onToggleServiceSelected: (serviceId: string) => void
	onChangeServiceQuantity: (serviceId: string, delta: number) => void
	onSetServiceQuantity: (serviceId: string, value: number) => void
}

const getServiceLabel = (service: ServiceState | ServiceOption, lang: string) => service.labels[lang] || service.labels.pl

const getItemTotal = (item: BasketItem, services: ServiceState[]) => {
	const serviceTotal = services.reduce((sum, service) => {
		if (!service.selected) return sum
		return sum + service.price * service.quantity
	}, 0)
	return (item.totalPrice ?? 0) + serviceTotal
}

export function BasketItemCard({
	item,
	state,
	lang,
	localeCode,
	t,
	onRemove,
	onToggleExpanded,
	onUpdateGuests,
	onToggleServiceSelected,
	onChangeServiceQuantity,
	onSetServiceQuantity,
}: BasketItemCardProps) {
	const dateRange = parseDateRange(item.dateRange)
	const nights = dateRange ? Math.max(1, differenceInDays(dateRange.end, dateRange.start)) : 1
	const localTax = (state.property?.localTax ?? 0) * nights * (state.guests ?? 1)
	const itemTotal = getItemTotal(item, state.services) + localTax

	const propertyUrl = buildPropertyUrl(item.id, state.property?.name ?? item.name, lang, state.property?.slugs)
	const propertyUrlWithDateRange = item.dateRange ? `${propertyUrl}?dateRange=${encodeURIComponent(item.dateRange)}` : propertyUrl

	return (
		<div className="rounded-2xl border border-[#cc9678]/10 bg-white px-2 py-5 sm:px-5 shadow-sm shadow-[#cc9678]/10">
			<div className="grid gap-4 lg:grid-cols-[320px_1fr] items-start">
				<div className="overflow-hidden rounded-2xl bg-[#fff3e9] self-start transition hover:opacity-90">
					<Link href={propertyUrlWithDateRange} className="block w-full h-full">
						<Image
							alt={item.name}
							src={state.property?.images?.[0]?.path?.replace(/\\/g, "/") ?? "/images/apartment-default-small.jpg"}
							width={360}
							height={240}
							className="h-64 w-full object-cover transition duration-300 hover:scale-105"
							unoptimized
						/>
					</Link>
				</div>

				<div className="space-y-4">
					<div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] items-start">
						<div className="space-y-3">
							<Link href={propertyUrlWithDateRange} className="hover:underline">
								<p className="text-lg font-semibold text-[#7a4a2a]">{item.name}</p>
							</Link>
							<p className="text-sm text-gray-500">{item.location || state.placeName || "–"}</p>
							{dateRange ? (
								<p className="text-sm text-gray-600">
									{formatDate(dateRange.start, localeCode)} — {formatDate(dateRange.end, localeCode)}
								</p>
							) : null}
						</div>
						<button
							type="button"
							onClick={onRemove}
							className="self-start rounded-lg border border-[#cc9678]/30 bg-[#fff2e6] px-3 py-2 text-sm font-semibold text-[#7a4a2a] transition hover:bg-[#fde8d8]">
							{t.removeLabel}
						</button>
					</div>

					<div className="grid gap-4 sm:grid-cols-2">
						<div className="rounded-2xl border border-[#cc9678]/10 bg-[#fff6ef] px-3 py-4">
							<p className="text-sm font-medium text-[#7a4a2a]">{t.guestsAssignedLabel}</p>
							<div className="mt-3 flex items-center gap-3">
								<button
									type="button"
									onClick={() => onUpdateGuests((state.guests ?? 1) - 1)}
									className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 transition hover:border-gray-400">
									-
								</button>
								<input
									type="number"
									value={state.guests}
									onChange={(event) => onUpdateGuests(Number(event.target.value))}
									onFocus={(e) => e.target.select()}
									className="w-20 rounded-lg border border-gray-300 bg-white px-3 py-2 text-center text-sm text-black outline-none"
									min={1}
									max={state.maxOccupancy}
								/>
								<button
									type="button"
									onClick={() => onUpdateGuests((state.guests ?? 1) + 1)}
									className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 transition hover:border-gray-400">
									+
								</button>
							</div>
							<p className="mt-2 text-xs text-gray-500">1 — {state.maxOccupancy}</p>
						</div>

						<div className="rounded-2xl border border-[#cc9678]/10 bg-[#fff7ef] px-3 py-4">
							<p className="text-sm font-medium text-[#7a4a2a]">{t.stayLabel}</p>
							<p className="mt-3 text-lg font-semibold text-gray-900">{formatCurrency(item.totalPrice ?? 0, item.currency || "PLN")}</p>
						</div>
						{/* <div className="rounded-2xl border border-[#cc9678]/10 bg-[#fff7ef] px-3 py-4 sm:col-span-2">
							<p className="text-sm font-medium text-[#7a4a2a]">{t.localTaxLabel}</p>
							<p className="mt-3 text-lg font-semibold text-[#7a4a2a]">{formatCurrency(localTax, item.currency || "PLN")}</p>
						</div> */}
					</div>
				</div>
			</div>

			<div className="mt-4 rounded-2xl border border-[#cc9678]/10 bg-white px-0 py-0 sm:px-1 shadow-sm shadow-[#cc9678]/10">
				<button
					type="button"
					onClick={onToggleExpanded}
					className="flex w-full items-center justify-between rounded-2xl border border-[#cc9678]/10 bg-[#fff4e8] px-1 sm:px-4 py-3 text-left text-sm font-semibold text-[#7a4a2a] transition hover:bg-[#fbe6d6]">
					<span>{t.servicesLabel}</span>
					<span>{state.expanded ? "−" : "+"}</span>
				</button>
				{state.expanded && (
					<div className="mt-4 space-y-3 px-2 sm:px-4 pb-4">
						{state.services.map((service) => (
							<div key={service.id} className="flex flex-col gap-1">
								<div className="flex flex-col gap-3 rounded-2xl border border-[#cc9678]/10 bg-[#fff8f0] px-2 py-3 sm:flex-row sm:items-center sm:justify-between">
									<div>
										<label className="inline-flex items-center gap-2 text-sm text-gray-900">
											<input
												type="checkbox"
												checked={service.selected}
												disabled={service.id === "cleaning"}
												onChange={() => service.id !== "cleaning" && onToggleServiceSelected(service.id)}
												className="h-4 w-4 rounded border-gray-300 text-[#cc9678]"
											/>
											<span>{getServiceLabel(service, lang)}</span>
										</label>
										<p className="mt-1 text-xs text-gray-500">{formatCurrency(service.price, item.currency || "PLN")}</p>
									</div>
									<div className="flex items-center gap-2 text-sm text-gray-700">
										{service.id === "cleaning" ? (
											<>
												<span className="text-sm font-medium">1</span>
												<p className="min-w-[80px] text-right font-semibold text-gray-900">
													{formatCurrency(service.price, item.currency || "PLN")}
												</p>
											</>
										) : (
											<>
												<button
													type="button"
													onClick={() => onChangeServiceQuantity(service.id, -1)}
													className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white transition hover:border-gray-400">
													-
												</button>
												<input
													type="number"
													value={service.quantity || ""}
													min={0}
													onFocus={(e) => e.target.select()}
													onChange={(e) => {
														const val = e.target.value === "" ? 0 : parseInt(e.target.value) || 0
														onSetServiceQuantity(service.id, val)
													}}
													onBlur={(e) => {
														const val = parseInt(e.target.value) || 0
														onSetServiceQuantity(service.id, val)
													}}
													className="w-12 h-9 text-center rounded-lg border border-gray-300 bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:outline-none focus:ring-1 focus:ring-[#cc9678]"
												/>
												<button
													type="button"
													onClick={() => onChangeServiceQuantity(service.id, 1)}
													className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white transition hover:border-gray-400">
													+
												</button>
												<p className="min-w-[80px] text-right font-semibold text-gray-900">
													{formatCurrency(service.price * service.quantity, item.currency || "PLN")}
												</p>
											</>
										)}
									</div>
								</div>
								{service.id === "breakfast" && ((service.quantity ?? 0) > 0 || service.selected) && (
									<p className="text-[0.875rem] font-medium italic text-red-600 px-2 mt-1">
										{t.breakfastNote} max ({(state.guests ?? 1) * nights})
									</p>
								)}
							</div>
						))}
						<div className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
							<label className="inline-flex items-center gap-2 text-sm text-gray-900">
								<input type="checkbox" checked disabled className="h-4 w-4 rounded border-gray-300 text-[#cc9678]" />
								<span>{t.localTaxLabel}</span>
							</label>
							<p className="text-sm font-semibold text-gray-900">{formatCurrency(localTax, item.currency || "PLN")}</p>
						</div>
					</div>
				)}
			</div>

			<div className="mt-4 rounded-2xl border border-[#cc9678]/10 bg-white px-0 py-0 sm:px-1 shadow-sm shadow-[#cc9678]/10">
				<div className="flex w-full items-center justify-between rounded-2xl bg-[#fff4e8] px-3 py-4">
					<div>
						<p className="text-sm font-medium text-[#7a4a2a]">{t.itemTotalLabel}</p>
						<p className="mt-2 text-xl font-semibold text-[#7a4a2a]">{formatCurrency(itemTotal, item.currency || "PLN")}</p>
					</div>
				</div>
			</div>
		</div>
	)
}
