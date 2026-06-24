/** @format */

import { type Event, type Property } from "@/types"
import { addDays, differenceInDays, format, subDays } from "date-fns"
export { differenceInDays, format }
import type { ReservationFormData } from "../components/ReservationForm"

export type BasketItem = {
	id: string | number
	name: string
	location?: string
	totalPrice?: number
	currency?: string
	dateRange?: string | null
	offerGrossPrice?: number
	offerGrossOriginalPrice?: number
	offerBase?: number
	offerBaseAdjusted?: boolean
	fromOffer?: boolean
}

export type ServiceOption = {
	id: string
	price: number
	labels: Record<string, string>
}

export type ServiceState = ServiceOption & {
	selected: boolean
	quantity: number
	allowed?: boolean
}

export type ItemState = {
	guests: number
	expanded: boolean
	maxOccupancy: number
	parkingQuantity?: number
	petsMax?: number
	breakfastAllowed?: boolean
	petsAllowed?: boolean
	babyCribAllowed?: boolean
	services: ServiceState[]
	propertyName?: string
	placeName?: string
	property?: Property
}

export type PriceChange = {
	item: BasketItem
	previousBasePrice: number
	currentBasePrice: number
	previousTotalPrice: number
	currentTotalPrice: number
}

const serviceTemplates: ServiceOption[] = [
	{
		id: "cleaning",
		price: 120,
		labels: {
			pl: "Opłata rezerwacyjna",
			en: "Reservation fee",
			de: "Reservierungsgebühr",
			es: "Tarifa de reserva",
		},
	},
	{
		id: "breakfast",
		price: 70,
		labels: {
			pl: "Śniadanie",
			en: "Breakfast",
			de: "Frühstück",
			es: "Desayuno",
		},
	},
	{
		id: "parking",
		price: 90,
		labels: {
			pl: "Parking",
			en: "Parking",
			de: "Parken",
			es: "Aparcamiento",
		},
	},
	{
		id: "pets",
		price: 120,
		labels: {
			pl: "Zwierzęta",
			en: "Pets",
			de: "Haustiere",
			es: "Mascotas",
		},
	},
	{
		id: "babyCrib",
		price: 100,
		labels: {
			pl: "Łóżeczko dla dziecka",
			en: "Baby Crib",
			de: "Babybett",
			es: "Cuna para bebé",
		},
	},
	{
		id: "babyBedLinen",
		price: 50,
		labels: {
			pl: "Pościel dla dziecka",
			en: "Baby Bed Linen",
			de: "Babybettwäsche",
			es: "Ropa de cama para bebé",
		},
	},
]

export const translations: Record<"pl" | "en" | "de" | "es", Record<string, string>> = {
	pl: {
		summary: "Podsumowanie",
		reservationSummary: "Podsumowanie rezerwacji",
		arrivalDate: "Data przybycia",
		departureDate: "Data odjazdu",
		guestsLabel: "Liczba gości",
		checkInLabel: "Zameldowanie",
		checkInTime: "od 16:00",
		stayLabel: "Pobyt",
		serviceFeeLabel: "Opłaty dodatkowe",
		depositLabel: "Zaliczka",
		totalCostLabel: "Pełny koszt",
		propertyListLabel: "Wybrane apartamenty",
		noneInBasket: "Brak pozycji w koszyku. Dodaj apartament, aby kontynuować.",
		removeLabel: "Usuń z koszyka",
		servicesLabel: "Dodatkowe usługi",
		guestsAssignedLabel: "Przypisani goście",
		localTaxLabel: "Podatek lokalny",
		itemTotalLabel: "Całkowita kwota",
		serviceOptionLabel: "Opcje usług",
		reservationFormLabel: "Formularz rezerwacji",
		moreInfo: "Możesz teraz dodać usługi i podać liczbę gości.",
		discountCodeUsed: "Kod rabatowy został już użyty",
		validationError: "Niektóre pozycje są niedostępne lub cena uległa zmianie.",
		noAvailability: "Brak dostępności",
		confirmPriceChangeTitle: "Potwierdź aktualizację ceny",
		confirmPriceChangeDescription: "Ceny pobytu zmieniły się od momentu dodania do koszyka. Sprawdź różnice i potwierdź rezerwację.",
		checkingOfferDiscount: "Sprawdzam aktualność rabatu z oferty",
		offerDiscountVerified: "Rabat z oferty jest nadal ważny",
		stayPriceLabel: "Cena pobytu",
		totalEstimateLabel: "Szacowana suma",
		confirmButton: "Potwierdź rezerwację",
		cancelButton: "Anuluj",
		backHome: "Powrót do strony głównej",
		apartmentSelectionLabel: "Wybór apartamentów",
		breakfastNote: "Łączna liczba śniadań na cały pobyt. Prosimy w uwagach napisać, ile śniadań w jakie dni Państwo potrzebują.",
		petsNotAllowed: "Zwierzęta nie są akceptowane w tym obiekcie",
		breakfastNotAllowed: "Śniadanie nie jest dostępne w tym obiekcie",
		babyCribNotAllowed: "Usługa łóżeczka dla dziecka nie jest dostępna w tym obiekcie",
	},
	en: {
		summary: "Summary",
		reservationSummary: "Reservation summary",
		arrivalDate: "Arrival date",
		departureDate: "Departure date",
		guestsLabel: "Guests",
		checkInLabel: "Check-in",
		checkInTime: "from 16:00",
		stayLabel: "Stay",
		serviceFeeLabel: "Additional services",
		depositLabel: "Deposit",
		totalCostLabel: "Full cost",
		propertyListLabel: "Selected apartments",
		noneInBasket: "No basket items yet. Add an apartment to continue.",
		removeLabel: "Remove from basket",
		servicesLabel: "Additional services",
		guestsAssignedLabel: "Guests assigned",
		localTaxLabel: "Local tax",
		itemTotalLabel: "Item total",
		serviceOptionLabel: "Service options",
		reservationFormLabel: "Reservation form",
		moreInfo: "You can add services and provide the number of guests.",
		discountCodeUsed: "Discount code has already been used",
		validationError: "Some items are unavailable or prices have changed.",
		noAvailability: "No availability",
		confirmPriceChangeTitle: "Confirm price update",
		confirmPriceChangeDescription: "Stay pricing has changed since you added these items to the basket. Review the update and confirm the reservation.",
		checkingOfferDiscount: "Checking current validity of the offer discount",
		offerDiscountVerified: "Offer discount is still valid",
		stayPriceLabel: "Stay price",
		totalEstimateLabel: "Total estimate",
		confirmButton: "Confirm reservation",
		cancelButton: "Cancel",
		backHome: "Back to homepage",
		apartmentSelectionLabel: "Apartment selection",
		breakfastNote: "Total number of breakfasts for the entire stay. Please write in notes on what days how many breakfasts are required.",
		petsNotAllowed: "Pets are not accepted in this property",
		breakfastNotAllowed: "Breakfast is not available in this property",
		babyCribNotAllowed: "Baby crib service is not available in this property",
	},
	de: {
		summary: "Zusammenfassung",
		reservationSummary: "Reservierungsübersicht",
		arrivalDate: "Anreisedatum",
		departureDate: "Abreisedatum",
		guestsLabel: "Gäste",
		checkInLabel: "Check-in",
		checkInTime: "ab 16:00",
		stayLabel: "Aufenthalt",
		serviceFeeLabel: "Zusatzleistungen",
		depositLabel: "Anzahlung",
		totalCostLabel: "Gesamtkosten",
		propertyListLabel: "Ausgewählte Apartments",
		noneInBasket: "Keine Artikel im Warenkorb. Füge eine Unterkunft hinzu.",
		removeLabel: "Aus dem Warenkorb entfernen",
		servicesLabel: "Zusatzleistungen",
		guestsAssignedLabel: "Zugewiesene Gäste",
		localTaxLabel: "Ortssteuer",
		itemTotalLabel: "Artikelgesamt",
		serviceOptionLabel: "Serviceoptionen",
		reservationFormLabel: "Reservierungsformular",
		moreInfo: "Du kannst jetzt Dienstleistungen hinzufügen und die Anzahl der Gäste angeben.",
		discountCodeUsed: "Der Rabattcode wurde bereits verwendet",
		validationError: "Einige Artikel sind nicht verfügbar oder die Preise haben sich geändert.",
		noAvailability: "Keine Verfügbarkeit",
		confirmPriceChangeTitle: "Preisänderung bestätigen",
		confirmPriceChangeDescription:
			"Die Preise für den Aufenthalt haben sich seit dem Hinzufügen zum Warenkorb geändert. Überprüfe die Aktualisierung und bestätige die Reservierung.",
		checkingOfferDiscount: "Ich prüfe die Gültigkeit des Angebotsrabatts",
		offerDiscountVerified: "Der Angebotsrabatt ist weiterhin gültig",
		stayPriceLabel: "Aufenthaltspreis",
		totalEstimateLabel: "Gesamtschätzung",
		confirmButton: "Reservierung bestätigen",
		cancelButton: "Abbrechen",
		backHome: "Zur Startseite",
		apartmentSelectionLabel: "Apartment-Auswahl",
		breakfastNote:
			"Gesamtanzahl der Frühstücke für den gesamten Aufenthalt. Bitte schreiben Sie in die Notizen, an welchen Tagen wie viele Frühstücke benötigt werden.",
		petsNotAllowed: "Haustiere sind in dieser Unterkunft nicht erlaubt",
		breakfastNotAllowed: "Frühstück ist in dieser Unterkunft nicht verfügbar",
		babyCribNotAllowed: "Babybettservice ist in dieser Unterkunft nicht verfügbar",
	},
	es: {
		summary: "Resumen",
		reservationSummary: "Resumen de reserva",
		arrivalDate: "Fecha de llegada",
		departureDate: "Fecha de salida",
		guestsLabel: "Huéspedes",
		checkInLabel: "Registro",
		checkInTime: "desde las 16:00",
		stayLabel: "Estancia",
		serviceFeeLabel: "Servicios adicionales",
		depositLabel: "Depósito",
		totalCostLabel: "Costo total",
		propertyListLabel: "Apartamentos seleccionados",
		noneInBasket: "No hay artículos en el carrito. Añade un apartamento para continuar.",
		removeLabel: "Eliminar del carrito",
		servicesLabel: "Servicios adicionales",
		guestsAssignedLabel: "Huéspedes asignados",
		localTaxLabel: "Impuesto local",
		itemTotalLabel: "Total del artículo",
		serviceOptionLabel: "Opciones de servicio",
		reservationFormLabel: "Formulario de reserva",
		moreInfo: "Ahora puedes añadir servicios y proporcionar el número de huéspedes.",
		discountCodeUsed: "El código de descuento ya ha sido utilizado",
		validationError: "Algunos artículos no están disponibles o los precios han cambiado.",
		noAvailability: "No hay disponibilidad",
		confirmPriceChangeTitle: "Confirma la actualización de precio",
		confirmPriceChangeDescription:
			"Los precios de la estancia han cambiado desde que los agregaste al carrito. Revisa la actualización y confirma la reserva.",
		checkingOfferDiscount: "Comprobando la validez actual del descuento de la oferta",
		offerDiscountVerified: "El descuento de la oferta sigue siendo válido",
		stayPriceLabel: "Precio de la estancia",
		totalEstimateLabel: "Estimación total",
		confirmButton: "Confirmar reserva",
		cancelButton: "Cancelar",
		backHome: "Volver a la página principal",
		apartmentSelectionLabel: "Selección de apartamentos",
		breakfastNote: "Número total de desayunos para toda la estancia. Por favor escriba en las notas en qué días cuántos desayunos se requieren.",
		petsNotAllowed: "No se aceptan mascotas en esta propiedad",
		breakfastNotAllowed: "El desayuno no está disponible en esta propiedad",
		babyCribNotAllowed: "El servicio de cuna no está disponible en esta propiedad",
	},
}

export const localeMap: Record<string, string> = {
	pl: "pl-PL",
	en: "en-US",
	de: "de-DE",
	es: "es-ES",
}

export const parseDateRange = (range?: string | null) => {
	if (!range) return null
	const parts = range.split("_")
	if (parts.length !== 2) return null
	const start = new Date(parts[0])
	const end = new Date(parts[1])
	if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null
	return { start, end }
}

export const formatDate = (value: Date | null, localeCode: string) => {
	if (!value) return "–"
	return value.toLocaleDateString(localeCode, {
		day: "numeric",
		month: "short",
		year: "numeric",
	})
}

export type AlternativeDate = {
	start: string
	end: string
	price: number
}

export const fetchCurrentNoBedsCachePrice = async (
	propertyId: number,
	start: Date,
	end: Date,
): Promise<{ available: boolean; totalPrice: number; error?: string; alternatives?: { start: string; end: string; price: number }[] }> => {
	try {
		const response = await fetch(
			`/api/nobeds-cache/entries?id=${encodeURIComponent(propertyId)}&startDate=${encodeURIComponent(
				start.toISOString(),
			)}&endDate=${encodeURIComponent(end.toISOString())}`,
		)

		if (!response.ok) {
			const json = await response.json().catch(() => null)
			return {
				available: false,
				totalPrice: 0,
				error: json?.error || "Failed to validate NoBedsCache availability",
			}
		}

		const json = await response.json()
		const entries = Array.isArray(json.entries) ? json.entries : []
		const totalPrice = entries.reduce((sum: number, entry: { price?: number | string | null }) => {
			const price = Number(entry.price) || 0
			return sum + price
		}, 0)
		const nights = Math.max(1, differenceInDays(end, start))
		let errorMsg: string | undefined = undefined

		const available =
			entries.length > 0 &&
			entries.every(
				(entry: { quantity?: number | null; available?: boolean | null }) => entry.available !== false && !!entry.quantity && entry.quantity > 0,
			)

		if (!available) {
			errorMsg = "Brak dostępności"
		} else {
			const hasValidMinStay = entries.every((entry: { minStay?: number | null }) => !entry.minStay || entry.minStay <= nights)
			const hasValidMaxStay = entries.every((entry: { maxStay?: number | null }) => !entry.maxStay || entry.maxStay >= nights)
			if (!hasValidMinStay || !hasValidMaxStay) {
				errorMsg = "Wybrane daty nie spełniają wymagań minimalnego lub maksymalnego pobytu"
			}
		}

		if (available && !errorMsg) {
			return {
				available: true,
				totalPrice,
			}
		}

		// Calculate Alternatives
		const alternatives: AlternativeDate[] = []
		try {
			const searchStart = subDays(start, 5)
			const searchEnd = addDays(end, 5)
			const altResp = await fetch(
				`/api/nobeds-cache/entries?id=${encodeURIComponent(propertyId)}&startDate=${encodeURIComponent(searchStart.toISOString())}&endDate=${encodeURIComponent(searchEnd.toISOString())}`,
			)
			if (altResp.ok) {
				const altJson = await altResp.json()
				const altEntries: {
					available?: boolean | null
					quantity?: number | null
					minStay?: number | null
					maxStay?: number | null
					price?: number | string | null
					date: string
				}[] = Array.isArray(altJson.entries) ? altJson.entries : []
				// Scan for blocks of 'nights' days
				for (let i = 0; i <= altEntries.length - nights; i++) {
					const block = altEntries.slice(i, i + nights)
					if (block.length < nights) continue
					const blockAvailable = block.every((e) => e.available !== false && !!e.quantity && e.quantity > 0)
					if (blockAvailable) {
						const hasValidMinStay = block.every((e) => !e.minStay || e.minStay <= nights)
						const hasValidMaxStay = block.every((e) => !e.maxStay || e.maxStay >= nights)
						if (hasValidMinStay && hasValidMaxStay) {
							const blockPrice = block.reduce((sum, e) => sum + (Number(e.price) || 0), 0)
							const blockStartStr = block[0].date
							const blockEndStr = format(addDays(new Date(blockStartStr), nights), "yyyy-MM-dd")
							if (blockStartStr && blockEndStr) {
								const startStrOnly = blockStartStr.split("T")[0]
								const endStrOnly = blockEndStr.split("T")[0]
								// don't add duplicates
								if (!alternatives.find((a) => a.start === startStrOnly)) {
									alternatives.push({
										start: startStrOnly,
										end: endStrOnly,
										price: blockPrice,
									})
								}
								if (alternatives.length >= 3) break
							}
						}
					}
				}
			}
		} catch (altErr) {
			console.error("Failed to fetch alternatives", altErr)
		}

		return {
			available: false,
			totalPrice: 0,
			error: errorMsg,
			alternatives: alternatives.length > 0 ? alternatives : undefined,
		}
	} catch (error) {
		console.error("Failed to fetch NoBedsCache entries for price validation:", error)
		return {
			available: false,
			totalPrice: 0,
			error: error instanceof Error ? error.message : String(error),
		}
	}
}

export const createDefaultServices = () =>
	serviceTemplates.map((service) => ({
		...service,
		selected: service.id === "cleaning",
		quantity: service.id === "cleaning" ? 1 : 0,
		labels: service.labels,
	}))

export const createServicesFromProperty = (
	existingServices: ServiceState[] | undefined,
	property: {
		cleaningFee?: number
		parkingFee?: number
		extended?: {
			breakfastFee?: number | string
			petFee?: number | string
			babyCribFee?: number | string
			petsMax?: number
			petsAllowed?: boolean
			breakfastAllowed?: boolean
			babyCribAllowed?: boolean
		}
		place?: { name?: string }
	},
) => {
	const baseServices = existingServices && existingServices.length > 0 ? existingServices : createDefaultServices()
	return baseServices.map((service) => {
		const breakfastFee = Number(property.extended?.breakfastFee ?? service.price)
		const petFee = Number(property.extended?.petFee ?? service.price)
		const babyCribFee = Number(property.extended?.babyCribFee ?? service.price)
		const basePrice =
			service.id === "cleaning"
				? (property.cleaningFee ?? service.price)
				: service.id === "parking"
					? (property.parkingFee ?? service.price)
					: service.id === "breakfast"
						? breakfastFee
						: service.id === "pets"
							? petFee
							: service.id === "babyCrib"
								? babyCribFee
								: service.price
		const allowed =
			service.id === "pets"
				? property.extended?.petsAllowed !== false
				: service.id === "breakfast"
					? property.extended?.breakfastAllowed !== false
					: service.id === "babyCrib" || service.id === "babyBedLinen"
						? property.extended?.babyCribAllowed !== false
						: true
		return {
			...service,
			price: basePrice,
			allowed,
			selected: service.id === "cleaning" ? true : service.selected && allowed,
			quantity: service.id === "cleaning" ? 1 : allowed ? service.quantity : 0,
		}
	})
}

export const buildInitialState = (item: BasketItem, previous: ItemState | undefined) => ({
	guests: previous?.guests ?? 1,
	expanded: previous?.expanded ?? true,
	maxOccupancy: previous?.maxOccupancy ?? 1,
	services: previous?.services ?? createDefaultServices(),
	propertyName: previous?.propertyName,
	placeName: previous?.placeName,
	property: previous?.property,
})

export const getServiceQuantity = (services: ServiceState[], serviceId: string) => {
	const service = services.find((item) => item.id === serviceId)
	return service && service.selected ? service.quantity : 0
}

export const getExtendedFee = (extended: unknown, key: string, fallback = 0) => {
	if (!extended || typeof extended !== "object" || Array.isArray(extended)) return fallback
	const value = (extended as Record<string, unknown>)[key]
	if (typeof value === "number") return value
	if (typeof value === "string") return Number(value) || fallback
	return fallback
}

export const buildEventFromItem = (item: BasketItem, state: ItemState, form: ReservationFormData, overrideBasePrice?: number): Event | null => {
	if (!state || !state.property) return null
	const property = state.property
	const range = parseDateRange(item.dateRange)
	if (!range) return null

	const nights = Math.max(1, differenceInDays(range.end, range.start))
	const breakfastQuantity = getServiceQuantity(state.services, "breakfast")
	const petsQuantity = getServiceQuantity(state.services, "pets")
	const babyCribQuantity = getServiceQuantity(state.services, "babyCrib")
	const babyBedLinenQuantity = getServiceQuantity(state.services, "babyBedLinen")
	const parkingQuantity = getServiceQuantity(state.services, "parking")

	const cleaningFee = property.cleaningFee ?? 0
	const parkingFee = property.parkingFee ?? 0
	const cityTaxPerNight = property.localTax ?? 0
	const localTaxSum = cityTaxPerNight * nights * (state.guests ?? 1)

	const breakfastFee = getExtendedFee(property.extended, "breakfastFee", 0)
	const petFee = getExtendedFee(property.extended, "petFee", 0)
	const babyCribFee = getExtendedFee(property.extended, "babyCribFee", 100)

	const additionalServicesCost =
		breakfastQuantity * breakfastFee + petsQuantity * petFee + babyCribQuantity * babyCribFee + (babyCribQuantity > 0 ? babyCribQuantity * 50 : 0)
	const parkingCost = parkingQuantity * parkingFee

	const baseAccommodationPrice = overrideBasePrice !== undefined ? overrideBasePrice : (item.totalPrice ?? 0)
	const totalPrice = baseAccommodationPrice + cleaningFee + parkingCost + additionalServicesCost
	const eventPrice = totalPrice

	const parsedRemarks: Record<string, unknown> = {}
	if (form.invoice) {
		parsedRemarks.invoiceData = {
			companyName: form.companyName,
			streetAddress: form.streetAddress,
			postalCode: form.postalCode,
			invoiceCountry: form.invoiceCountry,
			taxNumber: form.taxNumber,
		}
	}
	if (breakfastQuantity > 0) parsedRemarks.withBreakfast = true
	if (petsQuantity > 0) parsedRemarks.withPets = true
	if (babyCribQuantity > 0) parsedRemarks.extraBedRequested = true

	const internalNotes: string[] = []
	if (breakfastQuantity > 0) internalNotes.push(`Śniadania: ${breakfastQuantity}`)
	if (petsQuantity > 0) internalNotes.push(`Zwierzęta: ${petsQuantity}`)
	if (babyCribQuantity > 0) internalNotes.push(`Łóżeczka: ${babyCribQuantity}`)
	if (babyBedLinenQuantity > 0) internalNotes.push(`Pościel dla dzieci: ${babyBedLinenQuantity}`)

	const extended: Record<string, unknown> = {}
	if (internalNotes.length > 0) extended.internalNotes = internalNotes.join("; ")
	if (form.newsletter) {
		extended.newsletter = {
			accepted: true,
			date: new Date().toISOString(),
			email: form.email,
		}
	}

	return {
		room_id: property.room_id ?? property.roomId ?? undefined,
		startDate: range.start,
		endDate: range.end,
		deposit: "0",
		depositReturned: false,
		paid: false,
		id: undefined,
		extraFees: 0,
		cityTax: localTaxSum,
		amountOfPeople: state.guests,
		reason: "",
		status: "New",
		numOfParkingPlaces: parkingQuantity,
		source: "msc",
		sourceDescription: undefined,
		placeId: property.placeId,
		propertyId: property.id,
		userId: property.userId,
		createdAt: new Date(),
		document: form.invoice ? "invoice" : "receipt",
		documentDone: false,
		name: form.name || "",
		surname: "",
		email: form.email || "",
		phone: form.phone || "",
		notes: form.remarks || undefined,
		parsedRemarks: Object.keys(parsedRemarks).length > 0 ? parsedRemarks : undefined,
		price: parseFloat(eventPrice.toFixed(2)),
		property: property,
		updated: null,
		extended: Object.keys(extended).length > 0 ? extended : undefined,
	}
}
