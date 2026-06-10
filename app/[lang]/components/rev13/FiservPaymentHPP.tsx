/** @format */

"use client"
import { useState, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import { formatCurrency } from "@/utilities/functions/payments/currencyFormat"
import { sendGAEvent } from "@next/third-parties/google"
import { IconButton } from "@mui/material"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp"

const FISERV_HPP_URL =
	process.env.NEXT_PUBLIC_APP_ENV === "production"
		? "https://www.ipg-online.com/connect/gateway/processing"
		: "https://test.ipg-online.com/connect/gateway/processing"
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://simplevent.vercel.app"
const NEXT_PUBLIC_FISERV_STORENAME = process.env.NEXT_PUBLIC_FISERV_STORENAME

interface ITranslation {
	"fiservForm.title": string
	"fiservForm.tokenConsent": string
	"fiservForm.tokenConsentFull": string
	"fiservForm.readMore": string
	"fiservForm.readLess": string
	"fiservForm.payButton": string
	"fiservForm.redirectNotice": string
	"fiservForm.hashLabel": string
	"fiservForm.generating": string
	"fiservForm.orderIdLabel": string
	"fiservForm.eventIdLabel": string
	"fiservForm.paymentAmountLabel": string
	"fiservForm.depositOption": string
	"fiservForm.fullPaymentOption": string
	"fiservForm.recreateOrderId": string
}

const translations: Record<"en" | "pl" | "it" | "de", ITranslation> = {
	en: {
		"fiservForm.title": "Payment Details",
		"fiservForm.tokenConsent": "I agree to tokenize my bank card",
		"fiservForm.tokenConsentFull":
			"I agree to Fiserv (tokenization) storing my card for future payments and for pre-authorization of the card to secure the deposit, its completion, and release of the block after the end of the reservation. I understand that I can withdraw my consent for tokenization at any time by contacting Fiserv. I understand that tokenization is not required to make a payment. More information about tokenization can be found in Fiserv's Privacy Policy.",
		"fiservForm.readMore": "read more",
		"fiservForm.readLess": "read less",
		"fiservForm.payButton": "Pay",
		"fiservForm.redirectNotice": "You will be redirected to the payment gateway.",
		"fiservForm.hashLabel": "Hash:",
		"fiservForm.generating": "Generating...",
		"fiservForm.orderIdLabel": "Order ID:",
		"fiservForm.eventIdLabel": "Event ID:",
		"fiservForm.paymentAmountLabel": "Payment Amount:",
		"fiservForm.depositOption": "Deposit (30%)",
		"fiservForm.fullPaymentOption": "Full Payment (100%)",
		"fiservForm.recreateOrderId": "Recreate Order ID (for failed/pending payments)",
	},
	pl: {
		"fiservForm.title": "Szczegóły płatności",
		"fiservForm.tokenConsent": "Wyrażam zgodę na tokenizację mojej karty bankowej",
		"fiservForm.tokenConsentFull":
			"Wyrażam zgodę na przechowywanie przez Fiserv (tokenizację) mojej karty do przyszłych płatności oraz na preautoryzację karty w celu zabezpieczenia depozytu, jego realizacji i zwolnienia blokady po zakończeniu rezerwacji. Rozumiem, że mogę wycofać swoją zgodę na tokenizację w dowolnym momencie, kontaktując się z Fiserv. Rozumiem, że tokenizacja nie jest wymagana do dokonania płatności. Więcej informacji na temat tokenizacji można znaleźć w Polityce Prywatności Fiserv.",
		"fiservForm.readMore": "czytaj więcej",
		"fiservForm.readLess": "czytaj mniej",
		"fiservForm.payButton": "Zapłać",
		"fiservForm.redirectNotice": "Zostaniesz przekierowany do bramki płatności.",
		"fiservForm.hashLabel": "Skrót:",
		"fiservForm.generating": "Generowanie...",
		"fiservForm.orderIdLabel": "ID zamówienia:",
		"fiservForm.eventIdLabel": "ID wydarzenia:",
		"fiservForm.paymentAmountLabel": "Kwota płatności:",
		"fiservForm.depositOption": "Zadatek (30%)",
		"fiservForm.fullPaymentOption": "Pełna płatność (100%)",
		"fiservForm.recreateOrderId": "Utwórz nowe ID zamówienia (dla nieudanych/oczekujących płatności)",
	},
	it: {
		"fiservForm.title": "Dettagli di pagamento",
		"fiservForm.tokenConsent": "Accetto la tokenizzazione della mia carta bancaria",
		"fiservForm.tokenConsentFull":
			"Acconsento a Fiserv (tokenizzazione) di memorizzare la mia carta per pagamenti futuri e per la pre-autorizzazione della carta per garantire il deposito, il suo completamento e lo sblocco al termine della prenotazione. Comprendo di poter ritirare il mio consenso per la tokenizzazione in qualsiasi momento contattando Fiserv. Comprendo che la tokenizzazione non è necessaria per effettuare un pagamento. Maggiori informazioni sulla tokenizzazione sono disponibili nella Privacy Policy di Fiserv.",
		"fiservForm.readMore": "leggi di più",
		"fiservForm.readLess": "leggi meno",
		"fiservForm.payButton": "Paga",
		"fiservForm.redirectNotice": "Sarai reindirizzato al gateway di pagamento.",
		"fiservForm.hashLabel": "Hash:",
		"fiservForm.generating": "Generazione...",
		"fiservForm.orderIdLabel": "ID ordine:",
		"fiservForm.eventIdLabel": "ID evento:",
		"fiservForm.paymentAmountLabel": "Importo del pagamento:",
		"fiservForm.depositOption": "Deposito (30%)",
		"fiservForm.fullPaymentOption": "Pagamento completo (100%)",
		"fiservForm.recreateOrderId": "Ricrea ID ordine (per pagamenti falliti/in sospeso)",
	},
	de: {
		"fiservForm.title": "Zahlungsdetails",
		"fiservForm.tokenConsent": "Ich stimme der Tokenisierung meiner Bankkarte zu",
		"fiservForm.tokenConsentFull":
			"Ich stimme zu, dass Fiserv (Tokenisierung) meine Karte für zukünftige Zahlungen speichert und die Karte für die Vorautorisierung des Betrags blockiert, um die Anzahlung zu sichern, ihre Ausführung und Freigabe der Blockade nach Abschluss der Reservierung. Ich verstehe, dass ich meine Zustimmung zur Tokenisierung jederzeit widerrufen kann, indem ich Fiserv kontaktiere. Ich verstehe, dass die Tokenisierung nicht erforderlich ist, um eine Zahlung vorzunehmen. Weitere Informationen zur Tokenisierung finden Sie in der Datenschutzrichtlinie von Fiserv.",
		"fiservForm.readMore": "mehr lesen",
		"fiservForm.readLess": "weniger lesen",
		"fiservForm.payButton": "Bezahlen",
		"fiservForm.redirectNotice": "Sobald Sie auf 'Bezahlen' klicken, werden Sie zum Zahlungsportal weitergeleitet.",
		"fiservForm.hashLabel": "Hash:",
		"fiservForm.generating": "Generiere...",
		"fiservForm.orderIdLabel": "Bestell-ID:",
		"fiservForm.eventIdLabel": "Event-ID:",
		"fiservForm.paymentAmountLabel": "Zahlungsbetrag:",
		"fiservForm.depositOption": "Anzahlung (30%)",
		"fiservForm.fullPaymentOption": "Vollständige Zahlung (100%)",
		"fiservForm.recreateOrderId": "Bestell-ID neu erstellen (für fehlgeschlagene/ausstehende Zahlungen)",
	},
}

function getCurrentFiservDateTime() {
	const now = new Date()
	// Adjust for server timezone (-1 hour)
	const serverTime = new Date(now.getTime() - 1 * 60 * 60 * 1000)
	const pad = (n: number) => n.toString().padStart(2, "0")
	const result = `${serverTime.getFullYear()}:${pad(serverTime.getMonth() + 1)}:${pad(serverTime.getDate())}-${pad(serverTime.getHours())}:${pad(
		serverTime.getMinutes(),
	)}:${pad(serverTime.getSeconds())}`
	console.log("Generated txndatetime:", result, "(client time:", now.toISOString(), "server time:", serverTime.toISOString() + ")")
	return result
}

export function FiservPaymentHPP({
	chargeTotal,
	eventId,
	locale,
	oid,
	theme = "light",
	paymentOptions = true,
	forceNewOrderId = false,
}: {
	chargeTotal: string
	eventId: number
	locale: "en" | "pl" | "it" | "de"
	oid?: string
	theme?: "light" | "dark"
	paymentOptions?: boolean
	forceNewOrderId?: boolean
}) {
	const t = (key: keyof ITranslation) => translations[locale]?.[key]

	// Helper function to convert Fiserv currency codes to standard codes
	const getCurrencyCode = (fiservCode: string): string => {
		switch (fiservCode) {
			case "985":
				return "PLN"
			case "978":
				return "EUR"
			case "840":
				return "USD"
			default:
				return "PLN" // Default to PLN
		}
	}

	const [orderId, setOrderId] = useState<string>("")
	const [paymentPercentage, setPaymentPercentage] = useState<number>(100) // Default to 100%
	const [showFullConsent, setShowFullConsent] = useState<boolean>(false)
	const [showDebugInfo, setShowDebugInfo] = useState<boolean>(false)
	const [form, setForm] = useState({
		assignToken: "false",
		authenticateTransaction: "true",
		chargetotal: chargeTotal,
		checkoutoption: "combinedpage",
		currency: "985", // PLN
		hash_algorithm: "HMACSHA256",
		responseFailURL: "",
		responseSuccessURL: "",
		storename: NEXT_PUBLIC_FISERV_STORENAME || "", // Provided by Fiserv - NOW FROM ENV
		timezone: "Europe/Warsaw", // Provided by Fiserv
		transactionNotificationURL: "",
		txndatetime: getCurrentFiservDateTime(),
		txntype: "sale",
		unscheduledCredentialOnFileType: "",
		oid: "",
		tokenType: "MULTIPAY",
	})

	// Calculate actual payment amount based on percentage
	const calculatePaymentAmount = (total: string, percentage: number): string => {
		const totalNum = parseFloat(total) || 0
		const paymentAmount = (totalNum * percentage) / 100
		return paymentAmount.toFixed(2)
	}

	// Reset payment initiation when percentage changes
	useEffect(() => {
		setPaymentInitiated(false)
	}, [paymentPercentage])
	const [hashExtended, setHashExtended] = useState("")
	const [submitting, setSubmitting] = useState(false)
	const [paymentInitiated, setPaymentInitiated] = useState(false) // Added state for payment initiation tracking

	// Check for Fiserv storename configuration
	useEffect(() => {
		if (!NEXT_PUBLIC_FISERV_STORENAME) {
			console.error("Fiserv storename is not configured. Please set the NEXT_PUBLIC_FISERV_STORENAME environment variable. Payments may fail.")
			// Optionally, you could set an error state here to inform the user in the UI
		}
	}, [])

	// Generate UUID on component mount and set initial form values
	useEffect(() => {
		const generatedOrderId = forceNewOrderId ? uuidv4() : oid && oid !== "" ? oid : uuidv4()
		setOrderId(generatedOrderId)

		setForm((prevForm) => ({
			...prevForm,
			oid: generatedOrderId,
			responseFailURL: `${SITE_URL}/api/payment/handle-fiserv-browser-redirect?locale=${locale}&oid=${generatedOrderId}${
				eventId ? `&eventId=${eventId}` : ""
			}&fail=true`,
			responseSuccessURL: `${SITE_URL}/api/payment/handle-fiserv-browser-redirect?locale=${locale}&oid=${generatedOrderId}${
				eventId ? `&eventId=${eventId}` : ""
			}&fail=false`,
			transactionNotificationURL: `${SITE_URL}/api/payment/verify?locale=${locale}`,
		}))
	}, [eventId, locale, oid, forceNewOrderId])

	// Update chargetotal and txndatetime when chargeTotal changes (but respect percentage selection)
	useEffect(() => {
		const newPaymentAmount = calculatePaymentAmount(chargeTotal, paymentPercentage)
		const newTxnDateTime = paymentInitiated ? undefined : getCurrentFiservDateTime()
		console.log("Updating payment amount. New amount:", newPaymentAmount, "New txndatetime:", newTxnDateTime, "Payment initiated:", paymentInitiated)
		setForm((f) => ({
			...f,
			chargetotal: newPaymentAmount,
			// Only set txndatetime if payment hasn't been initiated yet
			...(newTxnDateTime ? { txndatetime: newTxnDateTime } : {}),
		}))
	}, [chargeTotal, paymentPercentage, paymentInitiated])

	// Initiate payment when form.oid and other necessary details are set
	useEffect(() => {
		const initiatePayment = async () => {
			// Validate chargetotal before attempting to parse or send
			if (!form.chargetotal || isNaN(parseFloat(form.chargetotal))) {
				console.warn("Initiate payment: chargetotal is invalid or not yet available. Value:", form.chargetotal)
				setPaymentInitiated(false) // Ensure it's false if chargetotal is invalid
				return // Exit early
			}

			// Ensure oid and currency are also present
			if (!form.oid || !form.currency) {
				console.warn("Initiate payment: oid or currency not yet available. OID:", form.oid, "Currency:", form.currency)
				setPaymentInitiated(false)
				return
			}

			try {
				console.log("Attempting to initiate payment with:", {
					orderId: form.oid,
					chargeTotal: form.chargetotal, // Send as string
					currency: form.currency,
					eventId: eventId,
					paymentPercentage: paymentPercentage,
				})
				const response = await fetch("/api/payment/initiate", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						orderId: form.oid,
						chargeTotal: form.chargetotal, // Send as string
						currency: form.currency,
						eventId: eventId,
					}),
				})
				if (response.ok) {
					setPaymentInitiated(true)
					console.log("Payment initiated successfully for orderId:", form.oid)
				} else {
					const errorData = await response.json()
					// Log the specific error from the backend
					console.error("Failed to initiate payment:", response.status, errorData)
					setPaymentInitiated(false)
				}
			} catch (error) {
				console.error("Error initiating payment (network or other issue):", error)
				setPaymentInitiated(false)
			}
		}

		// Only attempt to initiate if not already done and essential fields seem available.
		// The initiatePayment function itself will perform more detailed validation.
		if (!paymentInitiated && form.oid && form.chargetotal && form.currency) {
			initiatePayment()
		} else if (!paymentInitiated) {
			// This log can help if the component is waiting for props/state to be set.
			// console.log("Initiate payment call deferred: Not yet initiated or missing critical form data.",
			//     { oid: form.oid, chargetotal: form.chargetotal, currency: form.currency });
		}
	}, [form.oid, form.chargetotal, form.currency, eventId, paymentPercentage, paymentInitiated])

	// Fetch hash once payment is initiated and form details are ready
	useEffect(() => {
		const fetchHash = async () => {
			if (!paymentInitiated) {
				console.log("Payment not initiated yet. Hash calculation will wait.")
				setHashExtended("")
				return
			}
			// Guard condition: Ensure critical fields are populated before fetching hash
			if (!form.oid || !form.responseFailURL || !form.responseSuccessURL || !form.transactionNotificationURL || !form.chargetotal || !form.txndatetime) {
				console.log("Form not yet ready for hash calculation, critical fields missing:", form)
				setHashExtended("")
				return
			}
			const res = await fetch("/api/fiserv-hash", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(form),
			})
			const data = await res.json()
			setHashExtended(data.hashExtended || "")
		}

		if (paymentInitiated) {
			fetchHash()
		} else {
			setHashExtended("") // Clear hash if payment is not (or no longer) initiated
		}
	}, [form, paymentInitiated])

	const handleConsentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const checked = e.target.checked
		setForm((f) => ({
			...f,
			assignToken: checked ? "true" : "false",
			unscheduledCredentialOnFileType: checked ? "FIRST" : "",
		}))

		// Send Google Analytics event for token consent
		sendGAEvent("event", "payment_consent", {
			event_category: "engagement",
			event_label: checked ? "consent_granted" : "consent_revoked",
			payment_amount: form.chargetotal,
			currency: getCurrencyCode(form.currency),
			event_id: eventId,
			order_id: orderId,
			page_location: typeof window !== "undefined" ? window.location.href : "",
		})
	}

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setSubmitting(true)
		console.log("Submitting Fiserv payment form with hashExtended:", hashExtended, "and txndatetime:", form.txndatetime)

		// Send Google Analytics event for payment initiation
		sendGAEvent("event", "payment_initiate", {
			event_category: "conversion",
			event_label: "payment_started",
			payment_amount: form.chargetotal,
			currency: getCurrencyCode(form.currency),
			payment_percentage: paymentPercentage,
			event_id: eventId,
			order_id: orderId,
			token_consent: form.assignToken === "true",
			page_location: typeof window !== "undefined" ? window.location.href : "",
		})

		const f = document.createElement("form")
		f.method = "POST"
		f.action = FISERV_HPP_URL
		f.target = "_blank" // Open in new tab
		Object.entries({ ...form, hashExtended }).forEach(([k, v]) => {
			const input = document.createElement("input")
			input.type = "hidden"
			input.name = k
			input.value = v
			f.appendChild(input)
		})
		document.body.appendChild(f)
		f.submit()
	}

	// Theme-based classes
	const isDark = theme === "dark"
	const bgClass = isDark ? "bg-gray-800" : "bg-gray-50"
	const borderClass = "border"
	const textMainClass = isDark ? "text-gray-100" : "text-gray-900"
	const labelTextClass = isDark ? "text-gray-200" : "text-gray-800"
	const hashTextClass = isDark ? "text-gray-400" : "text-gray-500"

	return (
		<form onSubmit={handleSubmit} className={`${borderClass} p-4 rounded ${bgClass} max-w-lg mx-auto mt-8`}>
			<h2 className={`font-bold text-2xl align-middle text-center mb-2 ${textMainClass}`}>{t("fiservForm.title")}</h2>

			{/* Payment Amount Selection - Only show if paymentOptions is true */}
			{paymentOptions && (
				<div className="mb-6">
					<label className={`block text-sm font-medium mb-3 ${labelTextClass}`}>{t("fiservForm.paymentAmountLabel")}</label>
					<div className="space-y-3">
						<label
							className={`flex items-center p-3 border rounded-xl cursor-pointer transition-colors ${paymentPercentage === 30 ? "border-[#cc9678] bg-[#cc9678]/5" : "border-gray-200 hover:border-[#cc9678]/50"} ${labelTextClass}`}>
							<input
								type="radio"
								value={30}
								checked={paymentPercentage === 30}
								onChange={(e) => setPaymentPercentage(parseInt(e.target.value))}
								className="mr-3 h-5 w-5 accent-[#cc9678] cursor-pointer"
							/>
							<span className="font-medium text-base">
								{t("fiservForm.depositOption")} - {formatCurrency(calculatePaymentAmount(chargeTotal, 30), getCurrencyCode(form.currency))}
							</span>
						</label>
						<label
							className={`flex items-center p-3 border rounded-xl cursor-pointer transition-colors ${paymentPercentage === 100 ? "border-[#cc9678] bg-[#cc9678]/5" : "border-gray-200 hover:border-[#cc9678]/50"} ${labelTextClass}`}>
							<input
								type="radio"
								value={100}
								checked={paymentPercentage === 100}
								onChange={(e) => setPaymentPercentage(parseInt(e.target.value))}
								className="mr-3 h-5 w-5 accent-[#cc9678] cursor-pointer"
							/>
							<span className="font-medium text-base">
								{t("fiservForm.fullPaymentOption")} - {formatCurrency(calculatePaymentAmount(chargeTotal, 100), getCurrencyCode(form.currency))}
							</span>
						</label>
					</div>
				</div>
			)}

			<div className="mt-2">
				<div className="flex items-start">
					<input type="checkbox" id="tokenizeConsent" checked={form.assignToken === "true"} onChange={handleConsentChange} className="mr-2 mt-1" />
					<label htmlFor="tokenizeConsent" className={`text-sm ${labelTextClass} flex-1`}>
						{showFullConsent ? t("fiservForm.tokenConsentFull") : t("fiservForm.tokenConsent")}
						{!showFullConsent && (
							<button type="button" onClick={() => setShowFullConsent(true)} className="ml-1 text-blue-600 hover:text-blue-800 underline text-xs">
								{t("fiservForm.readMore")}
							</button>
						)}
						{showFullConsent && (
							<button
								type="button"
								onClick={() => setShowFullConsent(false)}
								className="ml-1 text-blue-600 hover:text-blue-800 underline text-xs">
								{t("fiservForm.readLess")}
							</button>
						)}
					</label>
				</div>
			</div>

			<div className="mt-4">
				<div className="flex">
					<div className="w-full">
						<button
							type="submit"
							className={`mt-2 inline-flex w-full justify-center rounded-2xl bg-[#cc9678] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#a6755a] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed`}
							disabled={submitting || !hashExtended || !paymentInitiated}>
							{t("fiservForm.payButton")}
						</button>
					</div>
				</div>
			</div>
			<div className={`mt-1 w-full text-sm ${hashTextClass}`}>
				<div className={`p-1 ${isDark ? "text-white" : "text-gray-900"}`}>{t("fiservForm.redirectNotice")}</div>
			</div>

			{/* Expandable Debug Information */}
			<div className="mt-2">
				<div className="flex items-center justify-center">
					<IconButton
						onClick={() => setShowDebugInfo(!showDebugInfo)}
						size="small"
						sx={{
							color: hashTextClass.includes("gray-400") ? "#9ca3af" : "#6b7280",
							"&:hover": {
								color: hashTextClass.includes("gray-400") ? "#d1d5db" : "#4b5563",
							},
						}}>
						{showDebugInfo ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
					</IconButton>
				</div>

				{showDebugInfo && (
					<div className="mt-2 space-y-1">
						<div className={`text-xs ${hashTextClass}`}>
							{t("fiservForm.hashLabel")} {hashExtended ? hashExtended.slice(0, 16) + "..." : t("fiservForm.generating")}
						</div>
						<div className={`text-xs ${hashTextClass}`}>
							{t("fiservForm.orderIdLabel")} {orderId ? orderId.slice(0, 8) + "..." : t("fiservForm.generating")}
						</div>
						{eventId && (
							<div className={`text-xs ${hashTextClass}`}>
								{t("fiservForm.eventIdLabel")} {eventId}
							</div>
						)}
					</div>
				)}
			</div>
		</form>
	)
}
