/** @format */

import { formatCurrency } from "@/utilities/functions/payments/currencyFormat"
import { formatDate } from "../functions/basketHelpers"
import type { BasketItem } from "../functions/basketHelpers"
import type { DiscountData } from "@/utilities/functions/pricing/discountPricing"
import type { PublicOfferData } from "@/types"

type BasketSidebarSummaryProps = {
	basketItems: BasketItem[]
	basketSummary: {
		stayTotal: number
		serviceTotal: number
		localTaxTotal: number
		fullTotal: number
		onlineTotal: number
		manualTotal: number
		totalGuests: number
		offerDiscountTotal?: number
		discountCodeDiscount?: number
	}
	t: Record<string, string>
	localeCode: string
	firstRange: { start: Date; end: Date } | null
	sameRange: boolean
	discountCode?: string
	setDiscountCode?: (val: string) => void
	validatingCode?: boolean
	validateDiscountCodeFn?: (val: string) => void
	discountData?: DiscountData | null
	discountCodeExpanded?: boolean
	setDiscountCodeExpanded?: (val: boolean) => void
	offerData?: PublicOfferData | null
}

export function BasketSidebarSummary({
	basketItems,
	basketSummary,
	t,
	localeCode,
	firstRange,
	sameRange,
	discountCode,
	setDiscountCode,
	validatingCode,
	validateDiscountCodeFn,
	discountData,
	discountCodeExpanded,
	setDiscountCodeExpanded,
	offerData,
}: BasketSidebarSummaryProps) {
	const hasOfferItem = basketItems.some((item) => item.fromOffer)
	return (
		<aside className="space-y-5">
			{!offerData && !hasOfferItem && setDiscountCodeExpanded && (
				<div className="rounded-xl bg-white p-5 shadow-sm shadow-gray-200">
					<div onClick={() => setDiscountCodeExpanded(!discountCodeExpanded)} className="flex items-center cursor-pointer justify-between">
						<h3 className="text-lg font-semibold text-gray-900">
							{discountData ? `✅ ${t["discountCode.title"] || "Kod rabatowy"}` : t["discountCode.title"] || "Kod rabatowy"}
						</h3>
						<span className="text-gray-500">{discountCodeExpanded ? "-" : "+"}</span>
					</div>
					{discountCodeExpanded && (
						<div className="mt-4 pt-4 border-t border-gray-100 flex gap-2 text-black">
							<input
								type="text"
								placeholder={t["discountCode.placeholder"] || "Wpisz kod"}
								value={discountCode || ""}
								onChange={(e) => setDiscountCode?.(e.target.value)}
								disabled={validatingCode}
								className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#cc9678] focus:ring-1 focus:ring-[#cc9678]"
							/>
							<button
								onClick={() => validateDiscountCodeFn?.(discountCode || "")}
								disabled={!discountCode || validatingCode}
								className="rounded-lg bg-[#cc9678] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#a6755a] disabled:opacity-50">
								{validatingCode ? "..." : t["discountCode.apply"] || "Zastosuj"}
							</button>
						</div>
					)}
					{discountData && (
						<div className="mt-3 rounded bg-green-50 p-2 text-sm text-green-700">{t["discountCode.offerApplied"] || "Kod rabatowy aktywny!"}</div>
					)}
				</div>
			)}
			{!offerData && hasOfferItem && (
				<div className="rounded-xl bg-white p-5 shadow-sm shadow-gray-200 text-sm text-gray-600">
					{t["offerItem.discountCodeBlocked"] || "Koszyk zawiera ofertę — kody rabatowe są niedostępne."}
				</div>
			)}
			<div className="sticky top-6 rounded-xl bg-white p-5 shadow-sm shadow-gray-200">
				<h2 className="text-xl font-semibold text-gray-900">{t.summary}</h2>
				<div className="mt-5 divide-y divide-gray-200 text-sm text-gray-700">
					<div className="flex space-x-2 justify-between py-4">
						<div>
							<p className="font-medium text-gray-900">{t.arrivalDate}</p>
							<p className="mt-2 text-gray-600">{sameRange && firstRange ? formatDate(firstRange.start, localeCode) : "–"}</p>
						</div>
						<div>
							<p className="font-medium text-gray-900">{t.departureDate}</p>
							<p className="mt-2 text-gray-600">{sameRange && firstRange ? formatDate(firstRange.end, localeCode) : "–"}</p>
						</div>
					</div>

					<div className="py-4">
						<p className="font-medium text-gray-900">{t.propertyListLabel}</p>
						<p className="mt-2 text-gray-600">{basketItems.map((item) => item.name).join(", ")}</p>
					</div>
					<div className="flex space-x-2 justify-between py-4">
						<p className="font-medium text-gray-900">{t.guestsLabel}</p>
						<p className="mt-2 text-gray-600">{basketSummary.totalGuests}</p>
					</div>
					<div className="flex space-x-2 justify-between py-4">
						<p className="font-medium text-gray-900">{t.checkInLabel}</p>
						<p className="mt-2 text-gray-600">{t.checkInTime}</p>
					</div>
					<div className="flex flex-col py-4 gap-2">
						<div className="flex justify-between">
							<p className="font-medium text-gray-900">{t.stayLabel}</p>
							<p className="text-gray-600">
								{basketSummary.offerDiscountTotal || basketSummary.discountCodeDiscount ? (
									<>
										<span className="line-through text-gray-400 mr-2">{formatCurrency(basketSummary.stayTotal, "PLN")}</span>
										<span className="text-green-600 font-bold">
											{formatCurrency(
												basketSummary.stayTotal - (basketSummary.offerDiscountTotal || 0) - (basketSummary.discountCodeDiscount || 0),
												"PLN",
											)}
										</span>
									</>
								) : (
									formatCurrency(basketSummary.stayTotal, "PLN")
								)}
							</p>
						</div>
						{(basketSummary.offerDiscountTotal || 0) > 0 && (
							<div className="flex justify-between text-green-600 text-xs font-semibold">
								<p>{t.offerApplied || "Zastosowano ofertę"}</p>
							</div>
						)}
					</div>
					<div className="flex space-x-2 justify-between py-4">
						<p className="font-medium text-gray-900">{t.serviceFeeLabel}</p>
						<p className="mt-2 text-gray-600">{formatCurrency(basketSummary.serviceTotal, "PLN")}</p>
					</div>
					<div className="flex space-x-2 justify-between py-4">
						<p className="font-medium text-gray-900">{t.localTaxLabel}</p>
						<p className="mt-2 text-gray-600">{formatCurrency(basketSummary.localTaxTotal, "PLN")}</p>
					</div>

					{basketSummary.manualTotal > 0 && basketSummary.onlineTotal > 0 && (
						<div className="flex flex-col space-y-2 py-4 border-b border-gray-200">
							<p className="font-semibold text-gray-900 mb-1">{t.payment_breakdown || "Podział płatności"}</p>
							<div className="flex justify-between text-sm">
								<p className="text-gray-700">{t.onlinePaymentAmount || "Do zapłaty teraz online"}</p>
								<p className="font-medium">{formatCurrency(basketSummary.onlineTotal, "PLN")}</p>
							</div>
							<div className="flex justify-between text-sm">
								<p className="text-gray-700">{t.manualPayment || "Do zapłaty na miejscu"}</p>
								<p className="font-medium">{formatCurrency(basketSummary.manualTotal, "PLN")}</p>
							</div>
						</div>
					)}

					<div className="flex space-x-2 justify-between py-4 border-b border-gray-200">
						<p className="font-medium text-gray-900">{t.depositLabel}</p>
						<p className="mt-2 text-gray-600">{formatCurrency(basketSummary.onlineTotal > 0 ? basketSummary.onlineTotal * 0.3 : 0, "PLN")}</p>
					</div>

					<div className="flex space-x-2 justify-between py-4">
						<p className="font-medium text-gray-900">{t.totalCostLabel}</p>
						<p className="mt-2 text-xl font-semibold text-gray-900">{formatCurrency(basketSummary.fullTotal, "PLN")}</p>
					</div>
				</div>
			</div>
		</aside>
	)
}
