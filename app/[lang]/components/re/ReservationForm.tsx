/** @format */
"use client"
import React, { FormEvent, useState } from "react"
import { setNotification, setReservationStepAction } from "@/state/action-creators"
import { useDispatch, useSelector } from "react-redux"
import { upsertEvent } from "@/utilities/functions/calendar"
import { Event } from "@/types"
import { ExtendedData } from "@/types"
import { RootState } from "@/state/store"
import {
	Paper,
	createTheme,
	ThemeProvider,
	Box,
	Typography,
	Button,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	IconButton,
	Collapse,
} from "@mui/material"
import Grid from "@mui/material/Grid"
import CloseIcon from "@mui/icons-material/Close"
import { ReservationForProperty } from "./PropertyList"
import { getPersonAdjustedPrice, hasPersonBasedPricing } from "@/utilities/functions/pricing/personBasedPricing"
import { calculateDiscountedPrice, DiscountData } from "@/utilities/functions/pricing/discountPricing"
import { differenceInDays } from "date-fns"
import { sendGAEvent } from "@next/third-parties/google"

// Add blinking animation keyframes
const styles = `
@keyframes blink {
	0%, 50% { opacity: 1; transform: scale(1); }
	51%, 100% { opacity: 0.2; transform: scale(0.98); }
}
`

// Inject styles into head
if (typeof document !== "undefined") {
	const styleSheet = document.createElement("style")
	styleSheet.type = "text/css"
	styleSheet.innerText = styles
	document.head.appendChild(styleSheet)
}

// Type interface for person-based pricing compatibility
interface PropertyWithPricing {
	personBasedPricings?: {
		id: number
		propertyId: number
		basePersonCount: number
		adjustments: import("@prisma/client/runtime/library").JsonValue
		createdAt: Date
		updatedAt: Date
	}[]
}

// Offer data interface
export interface OfferProperty {
	property: {
		id: number
		name: string
		location: string
		place: {
			name: string
		}
		maxOccupancy: number
		minOccupancy: number
		images: Array<{
			path: string
			filename: string
		}>
		filters: string[]
		size: number
		numSingleBeds: number
		numDoubleBeds: number
	}
	price: number
	originalPrice: number
	discountPercentage: number
	guests: number
}

export interface OfferData {
	offerId: string
	startDate: string
	endDate: string
	guests: number
	currency: string
	expiresAt: string
	offerProperties: OfferProperty[]
	totalValue: number
}

interface ITranslation {
	reservation_details: string
	guest: string
	phone: string
	email: string
	remarks: string
	trip_purpose: string
	card_details: string
	card_type: string
	card_first_name: string
	card_last_name: string
	card_number: string
	card_expiry: string
	card_cvc: string
	discount_code: string
	verify: string
	voucher: string
	reservation_terms: string
	accept_terms: string
	submit: string
	required: string
	event_accepted: string
	event_invalid: string
	leisure: string
	business: string
	reservation_success: string
	terms_dialog_title: string
	terms_dialog_content_p1: string
	terms_dialog_content_p2: string
	terms_dialog_content_p3: string
	terms_dialog_content_p4: string
	terms_dialog_content_p5: string
	terms_dialog_close_button: string
	assignAll: string
	read_terms_step: string
	invoice: string
	company_name: string
	street_address: string
	postal_code: string
	country: string
	tax_number: string
	newsletter_signup: string
}

const privacyNotice: Record<"en" | "pl" | "it" | "de", string> = {
	en: 'For details on how we process your data, see our <a href="/[lang]/privacy" class="underline text-blue-600" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.',
	pl: 'Szczegóły dotyczące przetwarzania danych znajdziesz w naszej <a href="/[lang]/privacy" class="underline text-blue-600" target="_blank" rel="noopener noreferrer">Polityce prywatności</a>.',
	it: 'Per dettagli su come trattiamo i tuoi dati, consulta la nostra <a href="/[lang]/privacy" class="underline text-blue-600" target="_blank" rel="noopener noreferrer">Informativa sulla privacy</a>.',
	de: 'Details zur Datenverarbeitung finden Sie in unserer <a href="/[lang]/privacy" class="underline text-blue-600" target="_blank" rel="noopener noreferrer">Datenschutzerklärung</a>.',
}

const translations: Record<"en" | "pl" | "it" | "de", ITranslation> = {
	en: {
		invoice: "Invoice (Faktura)",
		company_name: "Company Name",
		street_address: "Street Address",
		postal_code: "Postal Code",
		country: "Country",
		tax_number: "Tax Number",
		reservation_details: "Reservation Details",
		guest: "Name and Surname",
		phone: "Phone",
		email: "Email",
		remarks: "Remarks",
		trip_purpose: "Trip Purpose",
		card_details: "Card Details",
		card_type: "Card Type",
		card_first_name: "First Name on Card",
		card_last_name: "Last Name on Card",
		card_number: "Card Number",
		card_expiry: "Expiry Date",
		card_cvc: "CVC",
		discount_code: "Discount Code",
		verify: "Verify",
		voucher: "Voucher",
		reservation_terms: "Reservation Terms",
		accept_terms: "I accept the terms and conditions",
		submit: "Submit",
		required: "This field is required",
		event_accepted: "Reservation accepted",
		event_invalid: "Invalid form data",
		leisure: "Leisure",
		business: "Business",
		reservation_success: "Reservation completed successfully",
		terms_dialog_title: "Reservation Engine Terms of Use",
		terms_dialog_content_p1:
			"Welcome to our reservation engine. By using this service, you agree to the following terms and conditions. Please read them carefully.",
		terms_dialog_content_p2:
			"All reservations are subject to availability and confirmation. In case of unavailability detection, reservation cancellation is possible, as the system may receive another reservation from a different source but not have sufficient time to block the date. Payment must be made in full at the time of booking unless otherwise specified. Cancellations and modifications are subject to the property's policy.",
		terms_dialog_content_p3:
			"We do not store your credit or debit card numbers. This is handled by our PCI DSS compliant payment provider, Fiserv Polcard. In case of consent to card tokenization, you agree to have it saved by Fiserv Polcard, which will provide us with a token representing it. This token may be used to pre-authorize the card for a deposit, charge additional fees such as for additional services or extra days of stay, to unblock pre-authorization, to complete it in case of damages or leaving the apartment dirty, leaving personal belongings including trash, or not performing initial cleaning after yourself, washing dishes, removing water stains, heavy soiling of bedding or towels, or not reporting the stay of an animal or additional persons.",
		terms_dialog_content_p4: 'Additional terms can be found on the website in the "Terms" section.',
		terms_dialog_content_p5:
			"Mountain Apartments reserves the right to change or cancel reservations in the event of detection of incorrect prices, search result errors, improper functioning of discount codes, reservation system or payment system, and also in other justified cases. In such a case, the Client has the right to receive a refund of the paid deposit or use it for future reservations.",
		terms_dialog_close_button: "Close",
		assignAll: "Please assign all guests",
		read_terms_step: "1. Read terms and conditions",
		newsletter_signup: "Sign up for Newsletter to stay up-to-date with current promotions!",
	},
	pl: {
		invoice: "Faktura",
		company_name: "Nazwa firmy",
		street_address: "Ulica i numer",
		postal_code: "Kod pocztowy",
		country: "Kraj",
		tax_number: "NIP",
		reservation_details: "Szczegóły rezerwacji",
		guest: "Imię i nazwisko",
		phone: "Telefon",
		email: "Email",
		remarks: "Uwagi",
		trip_purpose: "Cel podróży",
		card_details: "Dane karty",
		card_type: "Typ karty",
		card_first_name: "Imię na karcie",
		card_last_name: "Nazwisko na karcie",
		card_number: "Numer karty",
		card_expiry: "Data ważności",
		card_cvc: "CVC",
		discount_code: "Kod rabatowy",
		verify: "Weryfikuj",
		voucher: "Voucher",
		reservation_terms: "Warunki rezerwacji",
		accept_terms: "Akceptuję warunki",
		submit: "Wyślij",
		required: "To pole jest wymagane",
		event_accepted: "Rezerwacja przyjęta",
		event_invalid: "Nieprawidłowe dane formularza",
		leisure: "Wypoczynek",
		business: "Biznes",
		reservation_success: "Rezerwacja zakończona pomyślnie",
		terms_dialog_title: "Warunki korzystania z silnika rezerwacji",
		terms_dialog_content_p1:
			"Witamy w naszym silniku rezerwacji. Korzystając z tej usługi, zgadzasz się na poniższe warunki. Prosimy o ich uważne przeczytanie.",
		terms_dialog_content_p2:
			"Wszystkie rezerwacje zależą od dostępności i potwierdzenia. W przypadku wykrycia braku dostępności, możliwe jest anulowanie rezerwacji, ponieważ system może otrzymać inną rezerwację z innego źródła ale nie mieć wystarczająco czasu na zablokowanie terminu. Płatność musi zostać dokonana w całości w momencie rezerwacji, chyba że określono inaczej. Anulacje i modyfikacje podlegają polityce obiektu.",
		terms_dialog_content_p3:
			"Nie przechowujemy numerów twojej karty kredytowej/debetowej. Odpowiada za to nasz dostawca płatności zgodny z PCI DSS, Fiserv Polcard. W przypadku zgody na tokenizację karty, zgadzasz się na jej zapisanie przez Fiserv Polcard, który udostępni nam reprezentujący ją token. Token ten może zostać użyty do preautoryzacji karty na depozyt, pobrania dodatkowej opłaty, np. za dodatkową usługę czy dodatkowy dzień pobytu, do odblokowania preautoryzacji, do jej dopełnienia w przypadku zniszczeń lub pozostawienia mieszkania brudnym, pozostawienia rzeczy osobistych, w tym śmieci, czy nie wykonaniu wstępnego sprzątania po sobie, zmycie naczyń, usunięcie plam wody, silne zabrudzenie pościeli czy ręczników, czy nie zgłoszenia pobytu zwierzęcia, lub dodatkowych osób.",
		terms_dialog_content_p4: 'Dodatkowe warunki znajdziesz na stronie w zakładce "regulamin".',
		terms_dialog_content_p5:
			"Mountain Apartments zastrzega sobie prawo do zmiany lub anulowania rezerwacji w przypadku wykrycia nieprawidłowych cen, błędów w wynikach wyszukiwania, nieprawidłowego działania kodów rabatowych, systemu rezerwacji lub systemu płatności, a także w innych uzasadnionych przypadkach. W takim przypadku Klient ma prawo do otrzymania zwrotu wpłaconej zaliczki lub jej wykorzystania na przyszłe rezerwacje.",
		terms_dialog_close_button: "Zamknij",
		assignAll: "Przypisz wszystkich gości",
		read_terms_step: "1. Przeczytaj warunki",
		newsletter_signup: "Zapisz się do Newslettera aby być na bieźąco z aktualnymi probmocjami!",
	},
	it: {
		invoice: "Fattura",
		company_name: "Nome azienda",
		street_address: "Indirizzo",
		postal_code: "CAP",
		country: "Paese",
		tax_number: "Partita IVA",
		reservation_details: "Dettagli della prenotazione",
		guest: "Nome e cognome",
		phone: "Telefono",
		email: "Email",
		remarks: "Note",
		trip_purpose: "Scopo del viaggio",
		card_details: "Dettagli della carta",
		card_type: "Tipo di carta",
		card_first_name: "Nome sulla carta",
		card_last_name: "Cognome sulla carta",
		card_number: "Numero della carta",
		card_expiry: "Data di scadenza",
		card_cvc: "CVC",
		discount_code: "Codice sconto",
		verify: "Verifica",
		voucher: "Voucher",
		reservation_terms: "Termini di prenotazione",
		accept_terms: "Accetto i termini e le condizioni",
		submit: "Invia",
		required: "Questo campo è obbligatorio",
		event_accepted: "Prenotazione accettata",
		event_invalid: "Dati del modulo non validi",
		leisure: "Svago",
		business: "Affari",
		reservation_success: "Prenotazione completata con successo",
		terms_dialog_title: "Termini di utilizzo del motore di prenotazione",
		terms_dialog_content_p1:
			"Benvenuti nel nostro motore di prenotazione. Utilizzando questo servizio, accettate i seguenti termini e condizioni. Si prega di leggerli attentamente.",
		terms_dialog_content_p2:
			"Tutte le prenotazioni sono soggette a disponibilità e conferma. In caso di rilevamento di indisponibilità, è possibile l'annullamento della prenotazione, poiché il sistema potrebbe ricevere un'altra prenotazione da una fonte diversa ma non avere tempo sufficiente per bloccare la data. Il pagamento deve essere effettuato per intero al momento della prenotazione, salvo diversa indicazione. Le cancellazioni e le modifiche sono soggette alla politica della struttura.",
		terms_dialog_content_p3:
			"Non memorizziamo i numeri della tua carta di credito o debito. Questo è gestito dal nostro fornitore di pagamenti conforme a PCI DSS, Fiserv Polcard. In caso di consenso alla tokenizzazione della carta, accetti che venga salvata da Fiserv Polcard, che ci fornirà un token che la rappresenta. Questo token può essere utilizzato per preautorizzare la carta per un deposito, addebitare commissioni aggiuntive, ad esempio per servizi aggiuntivi o giorni extra di soggiorno, per sbloccare la preautorizzazione, per completarla in caso di danni o di lasciare l'appartamento sporco, lasciare effetti personali inclusi rifiuti, o non eseguire la pulizia iniziale dopo di sé, lavare i piatti, rimuovere macchie d'acqua, sporcare pesantemente biancheria da letto o asciugamani, o non segnalare il soggiorno di un animale o persone aggiuntive.",
		terms_dialog_content_p4: 'Termini aggiuntivi possono essere trovati sul sito web nella sezione "Regolamento".',
		terms_dialog_content_p5:
			"Mountain Apartments si riserva il diritto di modificare o cancellare le prenotazioni in caso di rilevamento di prezzi errati, errori nei risultati di ricerca, malfunzionamento di codici sconto, sistema di prenotazione o sistema di pagamento, e anche in altri casi giustificati. In tal caso, il Cliente ha diritto al rimborso dell'acconto versato o al suo utilizzo per future prenotazioni.",
		terms_dialog_close_button: "Chiudi",
		assignAll: "Assegna tutti gli ospiti",
		read_terms_step: "1. Leggi i termini e condizioni",
		newsletter_signup: "Iscriviti alla Newsletter per rimanere aggiornato sulle attuali promozioni!",
	},
	de: {
		invoice: "Rechnung",
		company_name: "Firmenname",
		street_address: "Straße und Hausnummer",
		postal_code: "Postleitzahl",
		country: "Land",
		tax_number: "Steuernummer",
		reservation_details: "Reservierungsdetails",
		guest: "Vor- und Nachname",
		phone: "Telefon",
		email: "E-Mail",
		remarks: "Bemerkungen",
		trip_purpose: "Reisezweck",
		card_details: "Kartendetails",
		card_type: "Kartentyp",
		card_first_name: "Vorname auf der Karte",
		card_last_name: "Nachname auf der Karte",
		card_number: "Kartennummer",
		card_expiry: "Ablaufdatum",
		card_cvc: "CVC",
		discount_code: "Rabattcode",
		verify: "Überprüfen",
		voucher: "Gutschein",
		reservation_terms: "Reservierungsbedingungen",
		accept_terms: "Ich akzeptiere die Bedingungen und Konditionen",
		submit: "Absenden",
		required: "Dieses Feld ist erforderlich",
		event_accepted: "Reservierung akzeptiert",
		event_invalid: "Ungültige Formulardaten",
		leisure: "Freizeit",
		business: "Geschäftlich",
		reservation_success: "Reservierung erfolgreich abgeschlossen. Vielen Dank!",
		terms_dialog_title: "Nutzungsbedingungen der Reservierungsmaschine",
		terms_dialog_content_p1:
			"Willkommen bei unserer Reservierungsmaschine. Durch die Nutzung dieses Dienstes stimmen Sie den folgenden Bedingungen zu. Bitte lesen Sie diese sorgfältig durch.",
		terms_dialog_content_p2:
			"Alle Reservierungen unterliegen der Verfügbarkeit und Bestätigung. Im Falle einer Nichtverfügbarkeit kann die Reservierung storniert werden, da das System möglicherweise eine andere Reservierung aus einer anderen Quelle erhält, aber nicht genügend Zeit hat, das Datum zu blockieren. Die Zahlung muss zum Zeitpunkt der Buchung vollständig erfolgen, sofern nicht anders angegeben. Stornierungen und Änderungen unterliegen den Richtlinien der Unterkunft.",
		terms_dialog_content_p3:
			"Wir speichern Ihre Kredit- oder Debitkartennummern nicht. Dies wird von unserem PCI DSS-konformen Zahlungsanbieter Fiserv Polcard übernommen. Im Falle der Zustimmung zur Kartentokenisierung erklären Sie sich damit einverstanden, dass diese von Fiserv Polcard gespeichert wird, der uns ein Token zur Verfügung stellt, das sie repräsentiert. Dieses Token kann verwendet werden, um die Karte für eine Kaution vorzuautorisieren, zusätzliche Gebühren wie für zusätzliche Dienstleistungen oder zusätzliche Aufenthaltstage zu berechnen, die Vorautorisierung aufzuheben, sie im Falle von Schäden oder bei Verlassen der Wohnung in schmutzigem Zustand, Zurücklassen persönlicher Gegenstände einschließlich Müll oder bei Nichtdurchführung der Grundreinigung nach sich selbst, Abwaschen des Geschirrs, Entfernen von Wasserflecken, starker Verschmutzung von Bettwäsche oder Handtüchern oder Nichtmeldung des Aufenthalts eines Tieres oder zusätzlicher Personen abzuschließen.",
		terms_dialog_content_p4: 'Weitere Bedingungen finden Sie auf der Website im Bereich "AGB".',
		terms_dialog_content_p5:
			"Mountain Apartments behält sich das Recht vor, Reservierungen zu ändern oder zu stornieren im Falle der Feststellung falscher Preise, Suchergebnisfehler, Fehlfunktion von Rabattcodes, Reservierungssystem oder Zahlungssystem, und auch in anderen gerechtfertigten Fällen. In einem solchen Fall hat der Kunde das Recht auf Rückerstattung der geleisteten Anzahlung oder deren Verwendung für zukünftige Reservierungen.",
		terms_dialog_close_button: "Schließen",
		assignAll: "Bitte alle Gäste zuweisen",
		read_terms_step: "1. Bitte lesen Sie die Allgemeinen Geschäftsbedingungen sorgfältig durch.",
		newsletter_signup: "Melden Sie sich für den Newsletter an, um über aktuelle Aktionen auf dem Laufenden zu bleiben!",
	},
}

type ReservationFormProps = {
	id: string
	properties: ReservationForProperty[]
	arrivalDate: Date | null
	departureDate: Date | null
	theme?: "light" | "dark"
	locale: "en" | "pl" | "it" | "de"
	discountData?: DiscountData | null
	offerData?: OfferData
}

type ReservationFormData = {
	firstName: string
	lastName: string
	phone: string
	email: string
	remarks: string
	tripPurpose: string
	cardType: string
	cardFirstName: string
	cardLastName: string
	cardNumber: string
	cardExpiry: string
	cardCvc: string
	discountCode: string
	voucher: string
	acceptTerms: boolean
	invoice: boolean
	companyName: string
	streetAddress: string
	postalCode: string
	invoiceCountry: string
	taxNumber: string
	newsletter: boolean
	source?: string
}

function ReservationForm({ id, arrivalDate, departureDate, theme = "light", locale, discountData, offerData }: ReservationFormProps) {
	const dispatch = useDispatch()
	const t = (key: keyof ITranslation) => translations[locale][key]
	const servicesState = useSelector((state: RootState) => state.root.services)

	const [openTermsDialog, setOpenTermsDialog] = useState(false)
	const [userReadTerms, setUserReadTerms] = useState(false)

	const handleOpenTermsDialog = () => {
		setOpenTermsDialog(true)
		setUserReadTerms(true)
	}

	const handleCloseTermsDialog = () => {
		setOpenTermsDialog(false)
	}

	// Create MUI theme
	const muiTheme = React.useMemo(
		() =>
			createTheme({
				palette: {
					mode: theme as "light" | "dark",
					primary: {
						main: "#3b82f6",
					},
					background: {
						default: theme === "light" ? "#ffffff" : "#1f2937",
						paper: theme === "light" ? "#ffffff" : "#374151",
					},
					text: {
						primary: theme === "light" ? "#1f2937" : "#f3f4f6",
						secondary: theme === "light" ? "#4b5563" : "#9ca3af",
					},
				},
			}),
		[theme],
	)

	const [formData, setFormData] = useState<ReservationFormData>({
		firstName: "",
		lastName: "",
		phone: "",
		email: "",
		remarks: "",
		tripPurpose: "leisure",
		cardType: "",
		cardFirstName: "",
		cardLastName: "",
		cardNumber: "",
		cardExpiry: "",
		cardCvc: "",
		discountCode: "",
		voucher: "",
		acceptTerms: false,
		invoice: false,
		companyName: "",
		streetAddress: "",
		postalCode: "",
		invoiceCountry: "",
		taxNumber: "",
		newsletter: false,
	})

	const [errors, setErrors] = useState<{ [key: string]: string }>({})
	const servicesStateReservations: ReservationForProperty[] = useSelector((state: RootState) => state.root.services.reservations)
	const [sending, setSending] = useState<boolean>(false)
	const [createdEventId, setCreatedEventId] = useState<number | null>(null)

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value, type, checked } = e.target
		setFormData({
			...formData,
			[name]: type === "checkbox" ? checked : value,
		})
	}

	const isRequired = [
		"firstName",
		"phone",
		"email",
		"tripPurpose",
		"acceptTerms",
		// Invoice fields required if invoice checked
		...(formData.invoice ? ["companyName", "streetAddress", "postalCode", "invoiceCountry", "taxNumber"] : []),
	]

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		setSending(true)
		e.preventDefault()
		const newErrors: { [key: string]: string } = {}
		let isValid = true

		Object.keys(formData).forEach((key) => {
			if (!formData[key as keyof ReservationFormData]) {
				if (!isRequired.includes(key)) return

				isValid = false
				newErrors[key] = t("required")
			}
		})

		setErrors(newErrors)

		if (isValid) {
			if (!arrivalDate || !departureDate) return

			const promises = servicesStateReservations?.map(async (property: ReservationForProperty) => {
				const eventWithRoomId: Event = {
					room_id: property.room_id,
					startDate: arrivalDate,
					endDate: departureDate,
					deposit: "0",
					depositReturned: false,
					paid: false,
					id: undefined,
					extraFees: servicesState?.parkingTotal,
					cityTax: property.localTaxSum,
					amountOfPeople: property.guestsAssigned,
					reason: formData?.tripPurpose,
					status: "New",
					numOfParkingPlaces: property?.parkingQuantity,
					source: "mountain",
					sourceDescription: offerData
						? (() => {
								return `Offer: ${offerData.offerId}`
							})()
						: undefined,
					placeId: property?.placeId,
					propertyId: property?.id,
					userId: property?.userId,
					createdAt: new Date(),
					document: formData?.invoice ? "invoice" : "receipt",
					documentDone: false,
					name: formData?.firstName + " " + formData?.lastName,
					surname: "",
					email: formData?.email || "",
					phone: formData?.phone || "",
					notes: (() => {
						let notes = formData?.remarks || ""
						if (servicesState?.notes) {
							notes += (notes ? "\n" : "") + servicesState.notes
						}
						return notes
					})(),
					parsedRemarks: (() => {
						let parsedRemarks: {
							invoiceData?: {
								companyName: string
								streetAddress: string
								postalCode: string
								invoiceCountry: string
								taxNumber: string
							}
							withBreakfast?: boolean
							withPets?: boolean
							extraBedRequested?: boolean
						} = formData?.invoice
							? {
									invoiceData: {
										companyName: formData.companyName,
										streetAddress: formData.streetAddress,
										postalCode: formData.postalCode,
										invoiceCountry: formData.invoiceCountry,
										taxNumber: formData.taxNumber,
									},
								}
							: {}

						// Calculate boolean flags directly from property data
						const totalBreakfastQuantity = servicesStateReservations?.reduce((acc, prop) => acc + (prop.breakfastQuantity || 0), 0) || 0
						const totalPetsQuantity = servicesStateReservations?.reduce((acc, prop) => acc + (prop.petsQuantity || 0), 0) || 0
						const totalBabyCribQuantity = servicesStateReservations?.reduce((acc, prop) => acc + (prop.babyCribQuantity || 0), 0) || 0

						if (totalBreakfastQuantity > 0) {
							parsedRemarks.withBreakfast = true
						}
						if (totalPetsQuantity > 0) {
							parsedRemarks.withPets = true
						}
						if (totalBabyCribQuantity > 0) {
							parsedRemarks.extraBedRequested = true
						}

						// Also merge any additional parsedRemarks from servicesState if they exist
						if (servicesState?.parsedRemarks) {
							parsedRemarks = { ...parsedRemarks, ...servicesState.parsedRemarks }
						}

						return Object.keys(parsedRemarks).length > 0 ? parsedRemarks : undefined
					})(),
					price: (() => {
						// Calculate the base price for this property (accommodation + fees)
						const propertyBasePrice = property.totalPrice || 0
						const adjustedBasePrice = hasPersonBasedPricing(property as PropertyWithPricing)
							? getPersonAdjustedPrice(property as PropertyWithPricing, property.guestsAssigned || property.guestsAssigned, propertyBasePrice)
							: propertyBasePrice

						const cleaningFee = property.cleaningFee || 0
						const cityTax = property.localTaxSum || 0
						const parking = property.parkingQuantity * (property.parkingFee || 0)

						// Calculate additional services for this property
						const breakfastCost = (property.breakfastQuantity || 0) * ((property.extended as ExtendedData)?.breakfastFee || 0)
						const petsCost = (property.petsQuantity || 0) * ((property.extended as ExtendedData)?.petFee || 0)
						const babyCribCost = (property.babyCribQuantity || 0) * ((property.extended as ExtendedData)?.babyCribFee || 100)
						const babyBedLinenCost = property.babyBedLinen ? (property.babyCribQuantity || 0) * 50 : 0
						const additionalServicesCost = breakfastCost + petsCost + babyCribCost + babyBedLinenCost

						// Apply offer discount if available
						let offerDiscountAmount = 0
						if (offerData && offerData.offerProperties) {
							const offerProperty = offerData.offerProperties.find((op) => op.property.id === property.id)
							if (offerProperty) {
								// Use the offer's discount amount directly
								offerDiscountAmount = offerProperty.originalPrice - offerProperty.price
							}
						}

						// Apply discount code if available (after offer discount)
						const priceBreakdown = calculateDiscountedPrice(adjustedBasePrice - offerDiscountAmount, cleaningFee, cityTax, discountData)

						// Calculate final price including accommodation + cleaning fee + parking, then apply 5% fee, then exclude city tax for event.price
						const finalPriceIncludingFees = priceBreakdown.finalPrice + parking + additionalServicesCost
						const finalPriceWithFee = servicesState?.paymentOption === "30" ? finalPriceIncludingFees * 1.05 : finalPriceIncludingFees
						const finalPriceExcludingCityTax = finalPriceWithFee - cityTax

						return parseFloat(finalPriceExcludingCityTax.toFixed(2))
					})(),
					ownerPrice: (() => {
						// Calculate the discounted base price for owner (same logic as above)
						const propertyBasePrice = property.totalPrice || 0
						const adjustedBasePrice = hasPersonBasedPricing(property as PropertyWithPricing)
							? getPersonAdjustedPrice(property as PropertyWithPricing, property.guestsAssigned || property.guestsAssigned, propertyBasePrice)
							: propertyBasePrice

						const cleaningFee = property.cleaningFee || 0
						const cityTax = property.localTaxSum || 0

						// Apply offer discount if available
						let offerDiscountAmount = 0
						if (offerData && offerData.offerProperties) {
							const offerProperty = offerData.offerProperties.find((op) => op.property.id === property.id)
							if (offerProperty) {
								// Use the offer's discount amount directly
								offerDiscountAmount = offerProperty.originalPrice - offerProperty.price
							}
						}

						// Apply discount code if available (after offer discount)
						const priceBreakdown = calculateDiscountedPrice(adjustedBasePrice - offerDiscountAmount, cleaningFee, cityTax, discountData)

						return priceBreakdown.discountedBasePrice
					})(),
					property: property,
					updated: null,
					extended: (() => {
						let extended: {
							newsletter?: {
								accepted: boolean
								date: string
								email: string
								bonus: undefined
							}
							internalNotes?: string
							pets?: string
							petsPrice?: string
						} = formData.newsletter
							? {
									newsletter: {
										accepted: true,
										date: new Date().toISOString(),
										email: formData.email,
										bonus: undefined,
									},
								}
							: {}

						// Calculate total breakfast quantity for internal notes
						const totalBreakfastQuantity = servicesStateReservations?.reduce((acc, prop) => acc + (prop.breakfastQuantity || 0), 0) || 0

						// Calculate total pets quantity and price
						const totalPetsQuantity = servicesStateReservations?.reduce((acc, prop) => acc + (prop.petsQuantity || 0), 0) || 0
						const totalPetsPrice = servicesStateReservations?.reduce((acc, prop) => acc + (prop.petsPrice || 0), 0) || 0

						// Calculate total baby crib and bed linen quantities
						const totalBabyCribQuantity = servicesStateReservations?.reduce((acc, prop) => acc + (prop.babyCribQuantity || 0), 0) || 0
						const totalBabyBedLinenQuantity = servicesStateReservations?.reduce((acc, prop) => acc + (prop.babyBedLinenQuantity || 0), 0) || 0

						const internalNotesParts: string[] = []

						if (totalBreakfastQuantity > 0) {
							internalNotesParts.push(`Ilość śniadań: ${totalBreakfastQuantity}`)
						}

						if (totalPetsQuantity > 0) {
							extended = {
								...extended,
								pets: totalPetsQuantity.toString(),
								petsPrice: totalPetsPrice.toString(),
							}
							internalNotesParts.push(`Zwierzęta: ${totalPetsQuantity} sztuk`)
						}

						if (totalBabyCribQuantity > 0 || totalBabyBedLinenQuantity > 0) {
							const babyInfo = []
							if (totalBabyCribQuantity > 0) {
								babyInfo.push(`łóżeczka dla dzieci: ${totalBabyCribQuantity}`)
							}
							if (totalBabyBedLinenQuantity > 0) {
								babyInfo.push(`pościel dla dzieci: ${totalBabyBedLinenQuantity}`)
							}
							internalNotesParts.push(`Dodatkowe usługi dla dzieci: ${babyInfo.join(", ")}`)
						}

						if (internalNotesParts.length > 0) {
							extended = {
								...extended,
								internalNotes: internalNotesParts.join("; "),
							}
						}

						return Object.keys(extended).length > 0 ? extended : undefined
					})(),
				}

				const response = await upsertEvent({
					event: eventWithRoomId,
					id,
					source: "mountain", //TODO: get source from url
					offerId: offerData?.offerId,
				})

				if (response?.error || !response) {
					dispatch(
						setNotification({
							severity: "error",
							message: response.error,
							open: true,
						}),
					)
					return Promise.reject(response.error)
				} else if (response?.success === "Event Saved" && response?.eventSaved?.id) {
					if (!createdEventId) {
						setCreatedEventId(response.eventSaved.id)
					}
					dispatch(
						setNotification({
							severity: "success",
							message: t("event_accepted"),
							open: true,
						}),
					)

					// Send Google Analytics event for booking submission
					sendGAEvent("event", "booking_submit", {
						event_category: "conversion",
						event_label: "booking_completed",
						property_id: property.id,
						property_name: property.name,
						guests: property.guestsAssigned,
						checkin_date: arrivalDate?.toISOString().split("T")[0],
						checkout_date: departureDate?.toISOString().split("T")[0],
						total_price: property.totalPrice,
						currency: property.currency || "PLN",
						page_location: typeof window !== "undefined" ? window.location.href : "",
					})
					if (formData.newsletter) {
						sendGAEvent("event", "newsletter_signup", {
							event_category: "conversion",
							event_label: "user_signed_up_for_newsletter",
							page_location: typeof window !== "undefined" ? window.location.href : "",
						})
					}

					return Promise.resolve(response.eventSaved.id)
				}
			})

			if (promises) {
				try {
					const eventIds = await Promise.all(promises)

					// Apply discount if available
					if ((discountData || (offerData && offerData.offerProperties)) && eventIds.length > 0) {
						try {
							const discountPromises = eventIds.map(async (eventId, index) => {
								if (!eventId) {
									console.log("Skipping discount application for null/undefined eventId at index.", index)
									return
								}

								const property = servicesStateReservations[index]
								// Use the individual property's base price, not derived from aggregated total
								const propertyBasePrice = property.totalPrice || 0
								const adjustedBasePrice = hasPersonBasedPricing(property as PropertyWithPricing)
									? getPersonAdjustedPrice(property as PropertyWithPricing, property.guestsAssigned || 0, propertyBasePrice)
									: propertyBasePrice
								const basePrice = adjustedBasePrice
								const cleaningFee = servicesState?.cleaningFee || 0
								const cityTax = property.localTaxSum || 0
								const parking = property.parkingQuantity * (property.parkingFee || 0)

								// Apply offer discount if available
								let offerDiscountAmount = 0
								if (offerData && offerData.offerProperties) {
									const offerProperty = offerData.offerProperties.find((op) => op.property.id === property.id)
									if (offerProperty) {
										// Calculate base price for this property (accommodation + cleaning fee, without tax)
										const basePriceWithCleaning = basePrice + cleaningFee

										// Check if the calculated price matches the offer's original price
										if (Math.abs(basePriceWithCleaning - offerProperty.originalPrice) < 0.01) {
											offerDiscountAmount = offerProperty.originalPrice - offerProperty.price
										}
									}
								}

								const priceBreakdown = calculateDiscountedPrice(basePrice - offerDiscountAmount, cleaningFee, cityTax, discountData)
								// Calculate final price same as event creation: apply 5% fee to total including fees + parking, then exclude city tax
								const finalPriceIncludingFees = priceBreakdown.finalPrice + parking
								const finalPriceWithFee = servicesState?.paymentOption === "30" ? finalPriceIncludingFees * 1.05 : finalPriceIncludingFees
								const finalPriceExcludingCityTax = finalPriceWithFee - cityTax

								const requestBody = {
									codeId: discountData?.codeId,
									campaignId: discountData?.campaignId,
									eventId: eventId,
									userId: null, // No logged-in user for now
									originalPrice: basePrice,
									discountAmount: priceBreakdown.discountAmount + offerDiscountAmount,
									finalPrice: finalPriceExcludingCityTax, // Match event price calculation
									guestEmail: formData.email,
									guestName: formData.firstName + " " + formData.lastName,
								}

								await fetch("/api/discount-codes/apply", {
									method: "POST",
									headers: {
										"Content-Type": "application/json",
									},
									body: JSON.stringify(requestBody),
								})
							})

							await Promise.all(discountPromises)
						} catch (discountError) {
							console.error("Error applying discount:", discountError)
							// Don't fail the booking if discount application fails
						}
					}

					// Link offer to the first created event if offer was used
					if (offerData && eventIds.length > 0) {
						try {
							const firstEventId = eventIds.find((id) => id !== null && id !== undefined)
							if (firstEventId) {
								await fetch("/api/offers/convert", {
									method: "POST",
									headers: {
										"Content-Type": "application/json",
									},
									body: JSON.stringify({
										offerId: offerData.offerId,
										eventId: firstEventId,
									}),
								})
							}
						} catch (offerError) {
							console.error("Error linking offer to event:", offerError)
							// Don't fail the booking if offer linking fails
						}
					}

					// Calculate number of nights for cleaning fee calculation and stay duration validation
					// Set specific UTC times: arrival at 14:00 UTC, departure at 09:00 UTC
					const arrivalUTC = new Date(arrivalDate)
					arrivalUTC.setUTCHours(14, 0, 0, 0)

					const departureUTC = new Date(departureDate)
					departureUTC.setUTCHours(9, 0, 0, 0)

					// Calculate nights using UTC dates without time
					const arrivalDateOnly = new Date(arrivalUTC.getUTCFullYear(), arrivalUTC.getUTCMonth(), arrivalUTC.getUTCDate())
					const departureDateOnly = new Date(departureUTC.getUTCFullYear(), departureUTC.getUTCMonth(), departureUTC.getUTCDate())

					const numberOfNights = differenceInDays(departureDateOnly, arrivalDateOnly)

					// Validate stay duration against property requirements
					const invalidStayProperties = servicesStateReservations.filter((property: ReservationForProperty) => {
						const hasValidMinStay = !property?.minStay || property.minStay <= numberOfNights
						const hasValidMaxStay = !property?.maxStay || property.maxStay >= numberOfNights
						return !hasValidMinStay || !hasValidMaxStay
					})

					if (invalidStayProperties.length > 0) {
						dispatch(setReservationStepAction("failed"))
						dispatch(
							setNotification({
								severity: "error",
								message: "Stay duration does not meet property requirements",
								open: true,
							}),
						)
						return
					}

					// Find the event ID that corresponds to a property requiring online payment
					let paymentEventId: number | null = null
					let paymentAmount = 0
					const propertiesRequiringPayment: {
						eventId: number
						property: ReservationForProperty
						eventPrice: number
					}[] = []

					// Map event IDs to their corresponding properties to find those requiring payment
					servicesStateReservations?.forEach((property: ReservationForProperty, index: number) => {
						if (property.paymentsOn && eventIds[index]) {
							// Calculate the event price for this property (same logic as in event creation)
							const propertyBasePrice = property.totalPrice || 0
							const adjustedBasePrice = hasPersonBasedPricing(property as PropertyWithPricing)
								? getPersonAdjustedPrice(property as PropertyWithPricing, property.guestsAssigned || 0, propertyBasePrice)
								: propertyBasePrice
							const basePrice = adjustedBasePrice
							const cleaningFee = servicesState?.cleaningFee || 0
							const cityTax = property.localTaxSum || 0
							const parking = property.parkingQuantity * (property.parkingFee || 0)

							// Apply offer discount if available
							let offerDiscountAmount = 0
							if (offerData && offerData.offerProperties) {
								const offerProperty = offerData.offerProperties.find((op) => op.property.id === property.id)
								if (offerProperty) {
									// Calculate base price for this property (accommodation + cleaning fee, without tax)
									const basePriceWithCleaning = basePrice + cleaningFee

									// Check if the calculated price matches the offer's original price
									if (Math.abs(basePriceWithCleaning - offerProperty.originalPrice) < 0.01) {
										offerDiscountAmount = offerProperty.originalPrice - offerProperty.price
									}
								}
							}

							const priceBreakdown = calculateDiscountedPrice(basePrice - offerDiscountAmount, cleaningFee, cityTax, discountData)
							// Event price calculation: apply 5% fee to total including fees + parking, then exclude city tax
							const finalPriceIncludingFees = priceBreakdown.finalPrice + parking
							const finalPriceWithFee = servicesState?.paymentOption === "30" ? finalPriceIncludingFees * 1.05 : finalPriceIncludingFees
							const eventPrice = finalPriceWithFee - cityTax

							propertiesRequiringPayment.push({
								eventId: eventIds[index],
								property: property,
								eventPrice: eventPrice,
							})
						}
					})

					if (propertiesRequiringPayment.length === 1) {
						// Single property requiring payment
						const { eventId, eventPrice } = propertiesRequiringPayment[0]
						paymentEventId = eventId

						// For 30% payment, online payment is 30% of the event price
						// For 100% payment, online payment is the full event price
						paymentAmount = servicesState?.paymentOption === "30" ? eventPrice * 0.3 : eventPrice
					} else if (propertiesRequiringPayment.length > 1) {
						// Multiple properties requiring payment
						paymentEventId = propertiesRequiringPayment[0].eventId

						// Sum all event prices
						const totalEventPrice = propertiesRequiringPayment.reduce((sum, item) => sum + item.eventPrice, 0)

						// For 30% payment, online payment is 30% of the total event price
						// For 100% payment, online payment is the full total event price
						paymentAmount = servicesState?.paymentOption === "30" ? totalEventPrice * 0.3 : totalEventPrice
					}

					// If we have online payments required, use the specific event ID and calculated amount
					// Otherwise, use the first event ID with total amount (for backward compatibility)
					const targetEventId = paymentEventId
					const targetAmount = paymentAmount

					if (targetEventId) {
						dispatch({
							type: "SET_PAYMENT_INFO",
							payload: {
								eventId: targetEventId,
								amount: targetAmount,
							},
						})
						dispatch(setReservationStepAction("payment"))
					} else {
						// No online payment required, reservation completed
						dispatch(setReservationStepAction("success"))
					}
				} catch (error) {
					dispatch(setReservationStepAction("failed"))
					dispatch(
						setNotification({
							severity: "error",
							message: t("event_invalid"),
							open: true,
						}),
					)
					console.log("Error in submitting reservations:", error)
				}
			}
		} else {
			setSending(false)
			dispatch(
				setNotification({
					severity: "error",
					message: t("event_invalid"),
					open: true,
				}),
			)
			console.log("Form is invalid, check log for errors:", newErrors)
		}
	}

	return (
		<ThemeProvider theme={muiTheme}>
			<div className="sm:px-1 mt-10 mb-10">
				<Paper
					sx={{
						p: { xs: 2, sm: 4 },
						m: 0,
						bgcolor: "background.paper",
						color: "text.primary",
						width: "100%",
					}}
					elevation={1}>
					<form onSubmit={handleSubmit}>
						<Box sx={{ mb: 4 }}>
							<Typography variant="h5" fontWeight="bold">
								{t("reservation_details")}
							</Typography>
						</Box>

						<Box
							sx={{
								display: "flex",
								flexDirection: "column",
								gap: 3,
							}}>
							<Grid container spacing={3}>
								<Grid size={{ xs: 12, sm: 6 }}>
									<Box
										sx={{
											display: "flex",
											flexDirection: "column",
										}}>
										<Typography variant="subtitle2" sx={{ mb: 1 }}>
											{t("guest")}
										</Typography>
										<input
											type="text"
											name="firstName"
											value={formData.firstName}
											onChange={handleChange}
											className="w-full p-2 border rounded bg-inherit text-inherit border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-400"
										/>
										{errors.firstName && (
											<Typography color="error" variant="caption">
												{t("required")}
											</Typography>
										)}
									</Box>
								</Grid>
								<Grid size={{ xs: 12, sm: 6 }}>
									<Box
										sx={{
											display: "flex",
											flexDirection: "column",
										}}>
										<Typography variant="subtitle2" sx={{ mb: 1 }}>
											{t("phone")}
										</Typography>
										<input
											type="text"
											name="phone"
											value={formData.phone}
											onChange={handleChange}
											className="w-full p-2 border rounded bg-inherit text-inherit border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-400"
										/>
										{errors.phone && (
											<Typography color="error" variant="caption">
												{t("required")}
											</Typography>
										)}
									</Box>
								</Grid>
							</Grid>
							<Grid container spacing={3}>
								<Grid size={{ xs: 12, sm: 6 }}>
									<Box
										sx={{
											display: "flex",
											flexDirection: "column",
										}}>
										<Typography variant="subtitle2" sx={{ mb: 1 }}>
											{t("email")}
										</Typography>
										<input
											type="email"
											name="email"
											value={formData.email}
											onChange={handleChange}
											className="w-full p-2 border rounded bg-inherit text-inherit border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-400"
										/>
										{errors.email && (
											<Typography color="error" variant="caption">
												{t("required")}
											</Typography>
										)}
									</Box>
								</Grid>
								<Grid size={{ xs: 12, sm: 6 }}>
									<Box
										sx={{
											display: "flex",
											flexDirection: "column",
										}}>
										<Typography variant="subtitle2" sx={{ mb: 1 }}>
											{t("remarks")}
										</Typography>
										<input
											type="text"
											name="remarks"
											value={formData.remarks}
											onChange={handleChange}
											className="w-full p-2 border rounded bg-inherit text-inherit border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-400"
										/>
									</Box>
								</Grid>
							</Grid>
							{/* <Box>
								<Typography variant="subtitle2" sx={{ mb: 2 }}>
									{t("trip_purpose")}
								</Typography>
								<Box sx={{ display: "flex", gap: 3 }}>
									<label className="flex items-center gap-2">
										<input
											type="radio"
											name="tripPurpose"
											value="leisure"
											checked={
												formData.tripPurpose ===
												"leisure"
											}
											onChange={handleChange}
											className="text-blue-600"
										/>
										<Typography>{t("leisure")}</Typography>
									</label>
									<label className="flex items-center gap-2">
										<input
											type="radio"
											name="tripPurpose"
											value="business"
											checked={
												formData.tripPurpose ===
												"business"
											}
											onChange={handleChange}
											className="text-blue-600"
										/>
										<Typography>{t("business")}</Typography>
									</label>
								</Box>
							</Box>{" "} */}
							<Box
								sx={{
									display: "flex",
									flexDirection: "column",
									gap: 2,
									mt: 2,
								}}>
								{/* Faktura (Invoice) checkbox and animated fields */}
								<Box
									sx={{
										display: "flex",
										alignItems: "center",
										gap: 1,
									}}>
									<input
										type="checkbox"
										name="invoice"
										checked={formData.invoice}
										onChange={(e) =>
											setFormData({
												...formData,
												invoice: e.target.checked,
											})
										}
										className="text-blue-600"
									/>
									<Typography>{t("invoice")}</Typography>
								</Box>
								<Box sx={{ pl: 3, pr: 3 }}>
									<Collapse in={formData.invoice} timeout="auto" unmountOnExit>
										<Grid container spacing={2} sx={{ mt: 1 }}>
											<Grid size={{ xs: 12, sm: 6 }}>
												<input
													type="text"
													name="companyName"
													value={formData.companyName}
													onChange={handleChange}
													placeholder={t("company_name")}
													className="w-full p-2 border rounded bg-inherit text-inherit border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-400"
												/>
												{errors.companyName && (
													<Typography color="error" variant="caption">
														{t("required")}
													</Typography>
												)}
											</Grid>
											<Grid size={{ xs: 12, sm: 6 }}>
												<input
													type="text"
													name="streetAddress"
													value={formData.streetAddress}
													onChange={handleChange}
													placeholder={t("street_address")}
													className="w-full p-2 border rounded bg-inherit text-inherit border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-400"
												/>
												{errors.streetAddress && (
													<Typography color="error" variant="caption">
														{t("required")}
													</Typography>
												)}
											</Grid>
											<Grid size={{ xs: 12, sm: 6 }}>
												<input
													type="text"
													name="postalCode"
													value={formData.postalCode}
													onChange={handleChange}
													placeholder={t("postal_code")}
													className="w-full p-2 border rounded bg-inherit text-inherit border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-400"
												/>
												{errors.postalCode && (
													<Typography color="error" variant="caption">
														{t("required")}
													</Typography>
												)}
											</Grid>
											<Grid size={{ xs: 12, sm: 6 }}>
												<input
													type="text"
													name="invoiceCountry"
													value={formData.invoiceCountry}
													onChange={handleChange}
													placeholder={t("country")}
													className="w-full p-2 border rounded bg-inherit text-inherit border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-400"
												/>
												{errors.invoiceCountry && (
													<Typography color="error" variant="caption">
														{t("required")}
													</Typography>
												)}
											</Grid>
											<Grid size={{ xs: 12, sm: 6 }}>
												<input
													type="text"
													name="taxNumber"
													value={formData.taxNumber}
													onChange={handleChange}
													placeholder={t("tax_number")}
													className="w-full p-2 border rounded bg-inherit text-inherit border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-400"
												/>
												{errors.taxNumber && (
													<Typography color="error" variant="caption">
														{t("required")}
													</Typography>
												)}
											</Grid>
										</Grid>
									</Collapse>
								</Box>
								{/* Step indicator for reading terms */}
								<Box
									sx={{
										display: "flex",
										alignItems: "center",
										gap: 2,
										p: 2,
										borderRadius: 1,
										backgroundColor: "#cc9678",
										color: "#ffffff",
									}}>
									<Box
										sx={{
											width: 24,
											height: 24,
											borderRadius: "50%",
											backgroundColor: "#b8856a",
											color: "white",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											fontSize: "0.875rem",
											fontWeight: "bold",
										}}>
										{userReadTerms ? "✓" : "!"}
									</Box>
									<Typography variant="body2" fontWeight="medium">
										{/* {t("read_terms_step")} */}
									</Typography>{" "}
									<Typography
										component="span"
										onClick={handleOpenTermsDialog}
										sx={{
											cursor: "pointer",
											color: "#ffffff",
											"&:hover": {
												textDecoration: "underline",
											},
											ml: 1,
											fontWeight: "medium",
										}}>
										{t("reservation_terms")}
									</Typography>
								</Box>
								<Box
									sx={{
										display: "flex",
										alignItems: "center",
										gap: 1,
										animation: !formData.acceptTerms ? "blink 2s infinite" : "none",
										"&:hover": {
											animation: "none",
										},
									}}>
									<input
										type="checkbox"
										name="acceptTerms"
										required
										checked={formData.acceptTerms}
										// disabled={!userReadTerms}
										onChange={(e) =>
											setFormData({
												...formData,
												acceptTerms: e.target.checked,
											})
										}
										className="text-blue-600"
									/>{" "}
									<Typography
										sx={{
											color: !formData.acceptTerms ? "green" : "inherit",
											opacity: userReadTerms ? 1 : 0.5,
										}}>
										{t("accept_terms")}
										{!formData.acceptTerms && (
											<Typography
												color="error"
												variant="caption"
												sx={{
													mt: 2,
													textAlign: "center",
													ml: 2,
												}}>
												{t("required")}
											</Typography>
										)}
									</Typography>
								</Box>{" "}
								<Box
									sx={{
										display: "flex",
										alignItems: "center",
										gap: 1,
										mt: 1,
									}}>
									<input
										type="checkbox"
										name="newsletter"
										checked={formData.newsletter}
										onChange={(e) =>
											setFormData({
												...formData,
												newsletter: e.target.checked,
											})
										}
										className="text-blue-600"
									/>
									<Typography>{t("newsletter_signup")}</Typography>
								</Box>
								<Button
									type="submit"
									variant="contained"
									fullWidth
									disabled={sending || !formData.acceptTerms}
									sx={{
										mt: 2,
										backgroundColor: "#22c55e",
										animation: formData.acceptTerms ? "blink 2s infinite" : "none",
										"&:hover": {
											backgroundColor: "#16a34a",
											animation: "none",
										},
									}}>
									{t("submit")}
								</Button>
							</Box>
						</Box>
					</form>
				</Paper>
			</div>
			<Dialog open={openTermsDialog} onClose={handleCloseTermsDialog} maxWidth="md" fullWidth sx={{ zIndex: 150 }}>
				<DialogTitle>
					{t("terms_dialog_title")}
					<IconButton
						aria-label="close"
						onClick={handleCloseTermsDialog}
						sx={{
							position: "absolute",
							right: 8,
							top: 8,
							color: (theme) => theme.palette.grey[500],
						}}>
						<CloseIcon />
					</IconButton>
				</DialogTitle>{" "}
				<DialogContent dividers>
					<Typography gutterBottom>{t("terms_dialog_content_p1")}</Typography>
					<Typography gutterBottom>{t("terms_dialog_content_p2")}</Typography>
					<Typography gutterBottom>{t("terms_dialog_content_p3")}</Typography>
					<Typography gutterBottom>{t("terms_dialog_content_p4")}</Typography>
					{/* <Typography gutterBottom>{t("terms_dialog_content_p5")}</Typography> */}
					<Typography gutterBottom component="div" sx={{ mt: 2 }}>
						<span
							dangerouslySetInnerHTML={{
								__html: privacyNotice[locale].replace("[lang]", locale),
							}}
						/>
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseTermsDialog} color="primary">
						{t("terms_dialog_close_button")}
					</Button>
				</DialogActions>
			</Dialog>
		</ThemeProvider>
	)
}

export default ReservationForm
