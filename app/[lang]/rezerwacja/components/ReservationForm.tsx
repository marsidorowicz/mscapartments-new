/** @format */

"use client"

import { type FormEvent, useState, useEffect } from "react"
import CountryCodeAutocomplete from "./CountryCodeAutocomplete"

export type ReservationFormData = {
	name: string
	phone: string
	email: string
	remarks: string
	acceptTerms: boolean
	newsletter: boolean
	invoice: boolean
	companyName: string
	streetAddress: string
	postalCode: string
	invoiceCountry: string
	taxNumber: string
}

const translations = {
	pl: {
		reservationDetails: "Formularz rezerwacji",
		name: "Imię i nazwisko",
		phone: "Telefon",
		email: "Email",
		remarks: "Uwagi",
		invoice: "Faktura",
		company_name: "Nazwa firmy",
		street_address: "Ulica i numer",
		postal_code: "Kod pocztowy",
		country: "Kraj",
		tax_number: "NIP",
		submit: "Rezerwuj",
		thankYou: "Dziękujemy. Twoje dane zostały zapisane lokalnie do dalszej modyfikacji.",

		missingData: "Wypełnij brakujące dane w formularzu:",
		acceptTerms: "Akceptuję regulamin",
		newsletter: "Zapisz się do newslettera, aby być na bieżąco z aktualnymi promocjami!",
		reservation_terms: "Warunki rezerwacji",
		terms_dialog_title: "Warunki rezerwacji",
		terms_dialog_content_p1: "Korzystając z tej usługi, zgadzasz się na poniższe warunki. Prosimy o ich uważne przeczytanie.",
		terms_dialog_content_p2:
			"Wszystkie rezerwacje zależą od dostępności i potwierdzenia. W przypadku wykrycia braku dostępności, możliwe jest anulowanie rezerwacji, ponieważ system może otrzymać inną rezerwację z innego źródła ale nie mieć wystarczająco czasu na zablokowanie terminu. Płatność musi zostać dokonana w całości w momencie rezerwacji, chyba że określono inaczej. Anulacje i modyfikacje podlegają polityce obiektu.",
		terms_dialog_content_p3:
			"Nie przechowujemy numerów twojej karty kredytowej/debetowej. Odpowiada za to nasz dostawca płatności zgodny z PCI DSS, Fiserv Polcard. W przypadku zgody na tokenizację karty, zgadzasz się na jej zapisanie przez Fiserv Polcard, który udostępni nam reprezentujący ją token. Token ten może zostać użyty do preautoryzacji karty na depozyt, pobrania dodatkowej opłaty, np. za dodatkową usługę czy dodatkowy dzień pobytu, do odblokowania preautoryzacji, do jej dopełnienia w przypadku zniszczeń lub pozostawienia mieszkania brudnym, pozostawienia rzeczy osobistych, w tym śmieci, czy nie wykonaniu wstępnego sprzątania po sobie, zmycie naczyń, usunięcie plam wody, silne zabrudzenie pościeli czy ręczników, czy nie zgłoszenia pobytu zwierzęcia, lub dodatkowych osób.",
		terms_dialog_content_p4: 'Dodatkowe warunki znajdziesz na stronie w zakładce "regulamin".',
		terms_dialog_close_button: "Zamknij",
	},
	en: {
		reservationDetails: "Reservation form",
		name: "Name",
		phone: "Phone",
		email: "Email",
		remarks: "Remarks",
		invoice: "Invoice (Faktura)",
		company_name: "Company Name",
		street_address: "Street Address",
		postal_code: "Postal Code",
		country: "Country",
		tax_number: "Tax Number",
		submit: "Send request",
		thankYou: "Thank you. Your details were saved locally for further updates.",

		missingData: "Please fill in missing form data:",
		acceptTerms: "I accept the terms and conditions",
		newsletter: "Sign up for the newsletter to stay up-to-date with current promotions!",
		reservation_terms: "Reservation Terms",
		terms_dialog_title: "Reservation Terms",
		terms_dialog_content_p1: "By using this service, you agree to the following terms and conditions. Please read them carefully.",
		terms_dialog_content_p2:
			"All reservations are subject to availability and confirmation. In case of unavailability detection, reservation cancellation is possible, as the system may receive another reservation from a different source but not have sufficient time to block the date. Payment must be made in full at the time of booking unless otherwise specified. Cancellations and modifications are subject to the property's policy.",
		terms_dialog_content_p3:
			"We do not store your credit or debit card numbers. This is handled by our PCI DSS compliant payment provider, Fiserv Polcard. In case of consent to card tokenization, you agree to have it saved by Fiserv Polcard, which will provide us with a token representing it. This token may be used to pre-authorize the card for a deposit, charge additional fees such as for additional services or extra days of stay, to unblock pre-authorization, to complete it in case of damages or leaving the apartment dirty, leaving personal belongings including trash, or not performing initial cleaning after yourself, washing dishes, removing water stains, heavy soiling of bedding or towels, or not reporting the stay of an animal or additional persons.",
		terms_dialog_content_p4: 'Additional terms can be found on the website in the "Terms" section.',
		terms_dialog_close_button: "Close",
	},
	de: {
		reservationDetails: "Reservierungsformular",
		name: "Name",
		phone: "Telefon",
		email: "Email",
		remarks: "Bemerkungen",
		invoice: "Rechnung",
		company_name: "Firmenname",
		street_address: "Straße i numer",
		postal_code: "Postleitzahl",
		country: "Land",
		tax_number: "Steuernummer",
		submit: "Anfrage senden",
		thankYou: "Danke. Deine Angaben wurden lokal zur weiteren Bearbeitung gespeichert.",

		missingData: "Bitte füllen Sie die fehlenden Formulardaten aus:",
		acceptTerms: "Ich akzeptiere die allgemeinen Geschäftsbedingungen",
		newsletter: "Melden Sie sich für den Newsletter an, um über aktuelle Aktionen auf dem Laufenden zu bleiben!",
		reservation_terms: "Reservierungsbedingungen",
		terms_dialog_title: "Reservierungsbedingungen",
		terms_dialog_content_p1: "Durch die Nutzung dieses Dienstes stimmen Sie den folgenden Bedingungen zu. Bitte lesen Sie diese sorgfältig durch.",
		terms_dialog_content_p2:
			"Alle Reservierungen unterliegen der Verfügbarkeit und Bestätigung. Im Falle einer Nichtverfügbarkeit kann die Reservierung storniert werden, da das System möglicherweise eine andere Reservierung aus einer anderen Quelle erhält, aber nicht genügend Zeit hat, das Datum zu blockieren. Die Zahlung muss zum Zeitpunkt der Buchung vollständig erfolgen, sofern nicht anders angegeben. Stornierungen und Änderungen unterliegen den Richtlinien der Unterkunft.",
		terms_dialog_content_p3:
			"Wir speichern Ihre Kredit- oder Debitkartennummern nicht. Dies wird von unserem PCI DSS-konformen Zahlungsanbieter Fiserv Polcard übernommen. Im Falle der Zustimmung zur Kartentokenisierung erklären Sie sich damit einverstanden, dass diese von Fiserv Polcard gespeichert wird, der uns ein Token zur Verfügung stellt, das sie repräsentiert. Dieses Token kann verwendet werden, um die Karte für eine Kaution vorzuautorisieren, zusätzliche Gebühren wie für zusätzliche Dienstleistungen oder zusätzliche Aufenthaltstage zu berechnen, die Vorautorisierung aufzuheben, sie im Falle von Schäden oder bei Verlassen der Wohnung in schmutzigem Zustand, Zurücklassen persönlicher Gegenstände einschließlich Müll oder bei Nichtdurchführung der Grundreinigung nach sich selbst, Abwaschen des Geschirrs, Entfernen von Wasserflecken, starker Verschmutzung von Bettwäsche oder Handtüchern oder Nichtmeldung des Aufenthalts eines Tieres oder zusätzlicher Personen abzuschließen.",
		terms_dialog_content_p4: 'Weitere Bedingungen finden Sie auf der Website im Bereich "AGB".',
		terms_dialog_close_button: "Schließen",
	},
	es: {
		reservationDetails: "Formulario de reserva",
		name: "Nombre",
		phone: "Teléfono",
		email: "Correo electrónico",
		remarks: "Comentarios",
		invoice: "Factura",
		company_name: "Nombre de la empresa",
		street_address: "Dirección",
		postal_code: "Código postal",
		country: "País",
		tax_number: "NIF/NIE",
		submit: "Enviar solicitud",
		thankYou: "Gracias. Tus datos se han guardado localmente para futuras modificaciones.",

		missingData: "Por favor, complete los datos faltantes del formulario:",
		acceptTerms: "Acepto los términos y condiciones",
		newsletter: "¡Regístrate en el boletín para estar al tanto de las promociones actuales!",
		reservation_terms: "Términos de reserva",
		terms_dialog_title: "Términos de reserva",
		terms_dialog_content_p1: "Al utilizar este servicio, usted acepta los siguientes términos y condiciones. Por favor, léalos cuidadosamente.",
		terms_dialog_content_p2:
			"Todas las reservas están sujetas a disponibilidad y confirmación. En caso de detección de indisponibilidad, es posible cancelar la reserva, ya que el sistema puede recibir otra reserva de una fuente diferente pero no tener tiempo suficiente para bloquear la fecha. El pago debe realizarse en su totalidad en el momento de la reserva, a menos que se especifique lo contrario. Las cancelaciones y modificaciones están sujetas a las políticas del establecimiento.",
		terms_dialog_content_p3:
			"No almacenamos los números de su tarjeta de crédito o débito. Esto lo gestiona nuestro proveedor de pagos que cumple con PCI DSS, Fiserv Polcard. En caso de dar su consentimiento para la tokenización de la tarjeta, acepta que Fiserv Polcard la guarde y nos proporcione un token que la represente. Este token puede usarse para preautorizar la tarjeta para un depósito, cobrar tarifas adicionales, como servicios adicionales o días extras de estadía, para desbloquear la preautorización, para completarla en caso de daños o dejar el apartamento sucio, dejar pertenencias personales incluyendo basura, o no realizar la limpieza inicial después de su uso, lavar los platos, eliminar manchas de agua, ensuciamiento intenso de ropa de cama o toallas, o no informar la estadía de un animal o personas adicionales.",
		terms_dialog_content_p4: 'Se pueden encontrar términos adicionales en el sitio web en la sección de "Términos".',
		terms_dialog_close_button: "Cerrar",
	},
}

type ReservationFormProps = {
	lang?: string
	values: ReservationFormData
	onChange: (nextValues: ReservationFormData) => void
	onSubmit: (event: FormEvent<HTMLFormElement>) => void
	submitLabel?: string
	isSubmitting?: boolean
	disabled?: boolean
	isRemarksRequired?: boolean
}

export default function ReservationForm({
	lang = "pl",
	values,
	onChange,
	onSubmit,
	submitLabel,
	isSubmitting = false,
	disabled = false,
	isRemarksRequired = false,
}: ReservationFormProps) {
	const locale = translations[lang as keyof typeof translations] || translations.pl

	const [phoneCode, setPhoneCode] = useState("48")
	const [isTermsDialogOpen, setIsTermsDialogOpen] = useState(false)
	const [phoneBody, setPhoneBody] = useState("")

	// Initialize from values.phone if it exists, roughly
	useEffect(() => {
		if (values.phone && !phoneBody && !values.phone.includes(" ")) {
			setPhoneBody(values.phone)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const handlePhoneChange = (code: string, body: string) => {
		onChange({ ...values, phone: `+${code} ${body}`.trim() })
	}

	const handleChange = (key: keyof ReservationFormData, value: string) => {
		onChange({ ...values, [key]: value })
	}

	const handleCheckboxChange = (key: keyof ReservationFormData, value: boolean) => {
		onChange({ ...values, [key]: value })
	}

	const missingFields = []
	if (!values.name.trim()) missingFields.push(locale.name)
	if (!phoneBody.trim()) missingFields.push(locale.phone)
	if (!values.email.trim()) missingFields.push(locale.email)
	if (isRemarksRequired && !values.remarks.trim()) missingFields.push(locale.remarks)
	if (values.invoice) {
		if (!values.companyName.trim()) missingFields.push(locale.company_name)
		if (!values.streetAddress.trim()) missingFields.push(locale.street_address)
		if (!values.postalCode.trim()) missingFields.push(locale.postal_code)
		if (!values.invoiceCountry.trim()) missingFields.push(locale.country)
		if (!values.taxNumber.trim()) missingFields.push(locale.tax_number)
	}
	if (!values.acceptTerms) missingFields.push(locale.acceptTerms)

	const isSubmitDisabled = disabled || isSubmitting || missingFields.length > 0

	return (
		<div className="rounded-xl bg-white px-2 sm:px-3 py-1 shadow-sm shadow-gray-200">
			<div className="mb-4 border-b border-gray-200 pb-3">
				<h2 className="text-xl font-semibold text-gray-900">{locale.reservationDetails}</h2>
			</div>
			<form id="reservation-form" onSubmit={onSubmit} className="space-y-4 pb-10 sm:pb-0">
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">
						{locale.name} <span className="text-red-500">*</span>
					</label>
					<input
						type="text"
						value={values.name}
						onChange={(event) => handleChange("name", event.target.value)}
						className="w-full rounded-2xl border border-gray-300 px-2 sm:px-4 py-3 text-sm text-black outline-none transition focus:border-[#cc9678] focus:ring-2 focus:ring-[#cc9678]/20"
						placeholder={locale.name}
					/>
				</div>
				<div className="grid gap-4 sm:grid-cols-2">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							{locale.phone} <span className="text-red-500">*</span>
						</label>
						<div className="flex w-full overflow-hidden rounded-2xl border border-gray-300 bg-white transition focus-within:border-[#cc9678] focus-within:ring-2 focus-within:ring-[#cc9678]/20">
							<CountryCodeAutocomplete
								value={phoneCode}
								onChange={(code) => {
									setPhoneCode(code)
									handlePhoneChange(code, phoneBody)
								}}
							/>
							<input
								type="tel"
								value={phoneBody}
								onChange={(event) => {
									setPhoneBody(event.target.value)
									handlePhoneChange(phoneCode, event.target.value)
								}}
								className="w-full bg-transparent px-2 sm:px-4 py-3 text-sm text-black outline-none"
								placeholder={locale.phone}
							/>
						</div>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							{locale.email} <span className="text-red-500">*</span>
						</label>
						<input
							type="email"
							value={values.email}
							onChange={(event) => handleChange("email", event.target.value)}
							className="w-full rounded-2xl border border-gray-300 px-2 sm:px-4 py-3 text-sm text-black outline-none transition focus:border-[#cc9678] focus:ring-2 focus:ring-[#cc9678]/20"
							placeholder={locale.email}
						/>
					</div>
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">
						{locale.remarks}
						{isRemarksRequired && <span className="text-red-500"> *</span>}
					</label>
					<textarea
						value={values.remarks}
						onChange={(event) => handleChange("remarks", event.target.value)}
						rows={4}
						className="w-full rounded-2xl border border-gray-300 px-2 sm:px-4 py-3 text-sm text-black outline-none transition focus:border-[#cc9678] focus:ring-2 focus:ring-[#cc9678]/20"
						placeholder={locale.remarks}
					/>
				</div>
				<div className="space-y-4">
					<label className="flex items-start gap-2 cursor-pointer">
						<input
							type="checkbox"
							checked={values.invoice}
							onChange={(e) => handleCheckboxChange("invoice", e.target.checked)}
							className="mt-1 shrink-0 rounded border-gray-300 text-[#cc9678] focus:ring-[#cc9678]"
						/>
						<span className="text-sm text-gray-700">{locale.invoice}</span>
					</label>
					{values.invoice && (
						<div className="grid gap-4 sm:grid-cols-2">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									{locale.company_name} <span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									value={values.companyName}
									onChange={(event) => handleChange("companyName", event.target.value)}
									className="w-full rounded-2xl border border-gray-300 px-2 sm:px-4 py-3 text-sm text-black outline-none transition focus:border-[#cc9678] focus:ring-2 focus:ring-[#cc9678]/20"
									placeholder={locale.company_name}
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									{locale.street_address} <span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									value={values.streetAddress}
									onChange={(event) => handleChange("streetAddress", event.target.value)}
									className="w-full rounded-2xl border border-gray-300 px-2 sm:px-4 py-3 text-sm text-black outline-none transition focus:border-[#cc9678] focus:ring-2 focus:ring-[#cc9678]/20"
									placeholder={locale.street_address}
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									{locale.postal_code} <span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									value={values.postalCode}
									onChange={(event) => handleChange("postalCode", event.target.value)}
									className="w-full rounded-2xl border border-gray-300 px-2 sm:px-4 py-3 text-sm text-black outline-none transition focus:border-[#cc9678] focus:ring-2 focus:ring-[#cc9678]/20"
									placeholder={locale.postal_code}
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									{locale.country} <span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									value={values.invoiceCountry}
									onChange={(event) => handleChange("invoiceCountry", event.target.value)}
									className="w-full rounded-2xl border border-gray-300 px-2 sm:px-4 py-3 text-sm text-black outline-none transition focus:border-[#cc9678] focus:ring-2 focus:ring-[#cc9678]/20"
									placeholder={locale.country}
								/>
							</div>
							<div className="sm:col-span-2">
								<label className="block text-sm font-medium text-gray-700 mb-1">
									{locale.tax_number} <span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									value={values.taxNumber}
									onChange={(event) => handleChange("taxNumber", event.target.value)}
									className="w-full rounded-2xl border border-gray-300 px-2 sm:px-4 py-3 text-sm text-black outline-none transition focus:border-[#cc9678] focus:ring-2 focus:ring-[#cc9678]/20"
									placeholder={locale.tax_number}
								/>
							</div>
						</div>
					)}
				</div>
				<div className="flex flex-col gap-3 py-2">
					<label className="flex items-start gap-2 cursor-pointer">
						<input
							type="checkbox"
							checked={values.acceptTerms}
							onChange={(e) => handleCheckboxChange("acceptTerms", e.target.checked)}
							className="mt-1 shrink-0 rounded border-gray-300 text-[#cc9678] focus:ring-[#cc9678]"
						/>
						<span className="text-sm text-gray-700">
							{locale.acceptTerms} <span className="text-red-500">*</span>{" "}
							<button
								type="button"
								className="text-blue-600 underline ml-1 hover:text-blue-800"
								onClick={(e) => {
									e.stopPropagation()
									e.preventDefault()
									setIsTermsDialogOpen(true)
								}}>
								({locale.reservation_terms})
							</button>
						</span>
					</label>
					<label className="flex items-start gap-2 cursor-pointer">
						<input
							type="checkbox"
							checked={values.newsletter}
							onChange={(e) => handleCheckboxChange("newsletter", e.target.checked)}
							className="mt-1 shrink-0 rounded border-gray-300 text-[#cc9678] focus:ring-[#cc9678]"
						/>
						<span className="text-sm text-gray-700">{locale.newsletter}</span>
					</label>
				</div>
				{missingFields.length > 0 && (
					<div className="text-sm text-red-500 font-medium mb-3">
						* {locale.missingData} <span className="font-semibold">{missingFields.join(", ")}</span>
					</div>
				)}
				<button
					type="submit"
					disabled={isSubmitDisabled}
					className="hidden sm:block w-full rounded-2xl bg-[#1D2430] px-2 sm:px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#a6755a] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500">
					{isSubmitting ? locale.submit + "..." : (submitLabel ?? locale.submit)}
				</button>
			</form>

			{isTermsDialogOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-opacity">
					<div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 sm:p-8 shadow-2xl">
						<button
							onClick={() => setIsTermsDialogOpen(false)}
							className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-800 transition-colors">
							<svg
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round">
								<line x1="18" y1="6" x2="6" y2="18"></line>
								<line x1="6" y1="6" x2="18" y2="18"></line>
							</svg>
						</button>
						<h2 className="mb-6 text-2xl font-semibold text-gray-900">{locale.terms_dialog_title}</h2>
						<div className="space-y-4 text-sm leading-relaxed text-gray-600">
							<p>{locale.terms_dialog_content_p1}</p>
							<p>{locale.terms_dialog_content_p2}</p>
							<p>{locale.terms_dialog_content_p3}</p>
							<p>{locale.terms_dialog_content_p4}</p>
						</div>
						<div className="mt-8 flex justify-end">
							<button
								onClick={() => setIsTermsDialogOpen(false)}
								className="rounded-xl bg-gray-100 px-6 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-gray-200">
								{locale.terms_dialog_close_button}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
