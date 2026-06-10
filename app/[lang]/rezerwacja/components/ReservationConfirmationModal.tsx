/** @format */

import { formatCurrency } from "@/utilities/functions/payments/currencyFormat"
import type { PriceChange } from "../functions/basketHelpers"

type ReservationConfirmationModalProps = {
	reservationConfirmation: {
		events: unknown[]
		priceChanges: PriceChange[]
	} | null
	t: Record<string, string>
	isSubmitting: boolean
	confirmReservation: () => Promise<void>
	cancelReservationConfirmation: () => void
}

export function ReservationConfirmationModal({
	reservationConfirmation,
	t,
	isSubmitting,
	confirmReservation,
	cancelReservationConfirmation,
}: ReservationConfirmationModalProps) {
	if (!reservationConfirmation) return null

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
			<div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white p-6 shadow-2xl">
				<h3 className="text-xl font-semibold text-gray-900">{t.confirmPriceChangeTitle}</h3>
				<p className="mt-2 text-sm text-gray-600">{t.confirmPriceChangeDescription}</p>
				<div className="mt-5 space-y-4 text-sm text-gray-700">
					{reservationConfirmation.priceChanges.map((change) => (
						<div key={change.item.id.toString()} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
							<div className="font-semibold text-gray-900">{change.item.name}</div>
							<p>
								{t.stayPriceLabel}: <span className="font-medium text-gray-900">{formatCurrency(change.previousBasePrice, "PLN")}</span> →{" "}
								<span className="font-medium text-gray-900">{formatCurrency(change.currentBasePrice, "PLN")}</span>
							</p>
							<p>
								{t.totalEstimateLabel}: <span className="font-medium text-gray-900">{formatCurrency(change.previousTotalPrice, "PLN")}</span> →{" "}
								<span className="font-medium text-gray-900">{formatCurrency(change.currentTotalPrice, "PLN")}</span>
							</p>
						</div>
					))}
				</div>
				<div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
					<button
						type="button"
						onClick={cancelReservationConfirmation}
						className="inline-flex justify-center rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-50">
						{t.cancelButton}
					</button>
					<button
						type="button"
						onClick={confirmReservation}
						disabled={isSubmitting}
						className="inline-flex justify-center rounded-2xl bg-[#cc9678] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#a6755a] disabled:cursor-not-allowed disabled:bg-gray-300">
						{isSubmitting ? `${t.confirmButton}...` : t.confirmButton}
					</button>
				</div>
			</div>
		</div>
	)
}
