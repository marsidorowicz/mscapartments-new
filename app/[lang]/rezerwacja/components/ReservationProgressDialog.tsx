/** @format */
"use client"

import React from "react"
import CircularProgress from "@mui/material/CircularProgress"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import ErrorIcon from "@mui/icons-material/Error"
import CloseIcon from "@mui/icons-material/Close"
import IconButton from "@mui/material/IconButton"

export type ProgressStatus = "idle" | "loading" | "success" | "error"

export type ReservationProgressState = {
	isOpen: boolean
	availabilityStatus: ProgressStatus
	priceStatus: ProgressStatus
	reservationStatus: ProgressStatus
	errorMsg: string | null
	paymentLink?: string | null
	paymentLinks?: string[]
	priceNote?: string | null
}

const staticTranslations: Record<string, Record<string, string>> = {
	pl: {
		title: "Trwa przypisywanie rezerwacji",
		stepAvailability: "Sprawdzanie dostępności",
		stepPrice: "Potwierdzanie ceny",
		stepReservation: "Rezerwuję",
		successMsg: "Dziękujemy za dokonanie rezerwacji, na podany email wysłaliśmy wiadomość z potwierdzeniem.",
		successMsgPaymentPrefix: "Teraz mozesz bezpiecznie zapłacić za rezerwację",
		successMsgPaymentLinkText: "płacę",
		close: "Zamknij",
	},
	en: {
		title: "Assigning reservation",
		stepAvailability: "Checking availability",
		stepPrice: "Confirming price",
		stepReservation: "Booking",
		successMsg: "Thank you for your reservation, we have sent a confirmation email to the provided address.",
		successMsgPaymentPrefix: "Now you can safely pay for your reservation",
		successMsgPaymentLinkText: "pay",
		close: "Close",
	},
	de: {
		title: "Reservierung wird zugewiesen",
		stepAvailability: "Verfügbarkeit prüfen",
		stepPrice: "Preis bestätigen",
		stepReservation: "Buchen",
		successMsg: "Vielen Dank für Ihre Reservierung. Wir haben eine Bestätigungs-E-Mail an die angegebene Adresse gesendet.",
		successMsgPaymentPrefix: "Jetzt können Sie Ihre Reservierung sicher bezahlen",
		successMsgPaymentLinkText: "bezahlen",
		close: "Schließen",
	},
	es: {
		title: "Asignando reserva",
		stepAvailability: "Comprobando disponibilidad",
		stepPrice: "Confirmando precio",
		stepReservation: "Reservando",
		successMsg: "Gracias por su reserva, hemos enviado un correo de confirmación a la dirección proporcionada.",
		successMsgPaymentPrefix: "Ahora puede pagar su reserva de forma segura",
		successMsgPaymentLinkText: "pagar",
		close: "Cerrar",
	},
}

type Props = {
	lang: string
	state: ReservationProgressState
	onClose: () => void
}

export function ReservationProgressDialog({ lang, state, onClose }: Props) {
	if (!state.isOpen) return null

	const t = staticTranslations[lang] || staticTranslations.pl

	const renderIcon = (status: ProgressStatus) => {
		if (status === "idle") return <div className="w-6 h-6 rounded-full border-2 border-gray-200" />
		if (status === "loading") return <CircularProgress size={24} className="text-[#cc9678]" />
		if (status === "success") return <CheckCircleIcon className="text-green-500 w-6 h-6" />
		if (status === "error") return <ErrorIcon className="text-red-500 w-6 h-6" />
		return null
	}

	const isCompletedSuccess = state.reservationStatus === "success"

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-all">
			<div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 shadow-2xl">
				{/* Header */}
				<div className="mb-6 flex items-center justify-between">
					<h3 className="text-xl font-semibold text-gray-900">{t.title}</h3>
					{(isCompletedSuccess || state.errorMsg) && (
						<IconButton onClick={onClose} size="small">
							<CloseIcon />
						</IconButton>
					)}
				</div>

				{/* Steps */}
				<div className="space-y-5">
					<div className="flex items-center justify-between">
						<span className={`text-base font-medium ${state.availabilityStatus === "idle" ? "text-gray-400" : "text-gray-800"}`}>
							{t.stepAvailability}
						</span>
						{renderIcon(state.availabilityStatus)}
					</div>

					<div className="flex items-start justify-between gap-4">
						<div className="min-w-0">
							<span className={`text-base font-medium ${state.priceStatus === "idle" ? "text-gray-400" : "text-gray-800"}`}>{t.stepPrice}</span>
							{state.priceNote ? <p className="mt-1 text-sm text-gray-600">{state.priceNote}</p> : null}
						</div>
						{renderIcon(state.priceStatus)}
					</div>

					<div className="flex items-center justify-between">
						<span className={`text-base font-medium ${state.reservationStatus === "idle" ? "text-gray-400" : "text-gray-800"}`}>
							{t.stepReservation}
						</span>
						{renderIcon(state.reservationStatus)}
					</div>
				</div>

				{state.errorMsg && (
					<div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700 text-center font-medium border border-red-100 whitespace-pre-line">
						{state.errorMsg}
					</div>
				)}

				{isCompletedSuccess && (
					<div className="mt-6 space-y-4">
						<div className="rounded-xl bg-green-50 p-4 text-sm text-green-700 text-center font-medium border border-green-100">{t.successMsg}</div>
						{(state.paymentLinks?.length ?? 0) > 0 ? (
							<div className="space-y-3 rounded-xl bg-white p-5">
								<span className="text-sm font-medium text-black text-center">{t.successMsgPaymentPrefix}</span>
								<div className="grid gap-3">
									{state.paymentLinks?.map((link, index) => (
										<a
											key={`${link}-${index}`}
											href={link}
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex w-full justify-center rounded-2xl bg-[#1D2430] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1D2430] shadow-sm">
											{t.successMsgPaymentLinkText}
											{state.paymentLinks && state.paymentLinks.length > 1 ? ` ${"booking #"} ${index + 1} ` : ""}
										</a>
									))}
								</div>
							</div>
						) : state.paymentLink ? (
							<div className="flex flex-col items-center gap-3 rounded-xl bg-white p-5 ">
								<span className="text-sm font-medium text-black text-center">{t.successMsgPaymentPrefix}</span>
								<a
									href={state.paymentLink}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex w-full justify-center rounded-2xl bg-[#1D2430] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1D2430] shadow-sm">
									{t.successMsgPaymentLinkText}
								</a>
							</div>
						) : null}
					</div>
				)}
				{/* Actions (Only show Close when done or error) */}
				{/* {(isCompletedSuccess || state.errorMsg) && (
					<div className="mt-6 flex justify-center">
						<button
							type="button"
							onClick={onClose}
							className="inline-flex w-full justify-center rounded-2xl bg-[#cc9678] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#a6755a]">
							{t.close}
						</button>
					</div>
				)} */}
			</div>
		</div>
	)
}
