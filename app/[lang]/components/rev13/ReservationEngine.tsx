/** @format */
"use client"
import React, { useEffect, useState, useCallback, useRef, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Button, CircularProgress, Typography, createTheme, ThemeProvider } from "@mui/material"
import { ChevronRight } from "@mui/icons-material"
import { Grid } from "@mui/material"

import { addDays, differenceInDays } from "date-fns"
import { setNotification, setReservationStepAction, setSelectedPropertiesToRent } from "@/state/action-creators"
import { RootState } from "@/state/store"
import PropertyList, { ReservationForProperty } from "./PropertyList"
import AdditionalServices from "./AdditionalServices"
import ReservationForm from "./ReservationForm"
import BackButton from "./BackButton"

import { FiservPaymentHPP } from "./FiservPaymentHPP"
import DateRangePicker from "./DateRangePickerRE"
import { NotificationComponent } from "./Notification"
import { Dictionary } from "../../../types/dictionary"
import { ExtendedData } from "@/types"

type AvailabilityResponse = {
	availableRoomDetails?: unknown[]
	property?: unknown
	error?: string
	alternativeRanges?: Array<{ start: string; end: string; nights: number }>
}
import { sleep } from "@/utilities/functions"
import { calculateDiscountedPrice } from "@/utilities/functions/pricing/discountPricing"
import { getPersonAdjustedPrice, hasPersonBasedPricing } from "@/utilities/functions/pricing/personBasedPricing"

// Define types for person-based pricing
interface PersonBasedPricing {
	id: number
	propertyId: number
	basePersonCount: number
	adjustments: import("@prisma/client/runtime/library").JsonValue
	createdAt: Date
	updatedAt: Date
}

interface PropertyWithPricing {
	personBasedPricings?: PersonBasedPricing[]
}

// Offer data interface
interface OfferProperty {
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

interface OfferData {
	offerId: string
	startDate: string
	endDate: string
	guests: number
	currency: string
	expiresAt: string
	offerProperties: OfferProperty[]
	totalValue: number
}

// Use the same translation interface as DateRangePickerMSC
interface ITranslation {
	completeOnlinePayment: string
	language: string
	selectLanguage: string
	startDate: string
	endDate: string
	day: string
	search: string
	guests: string
	month: string
	year: string
	calendarBtn: string
	prev: string
	next: string
	months: string[]
	weekdays: string[]
	themeLabel: string
	lightTheme: string
	darkTheme: string
	minmaxNotValid: string
	total: string
	cantFit: string
	book: string
	assignAll: string
	successForm: string
	failed: string
	noneAvailable: string
	requestedDatesNotAvailable: string
	apartmentNoLongerAvailable: string
	unknownStep: string
	missing: string
	processingPayment: string
	// Payment-related translations
	partialPayment: string
	partialPaymentInfo: string
	manualPaymentRequired: string
	onlinePaymentAmount: string
	manualPayment: string
	totalAmount: string
	payment_breakdown: string
	// Filter categories
	filterSingular: string
	filterPlural: string
	selected: string
	places: string
	views: string
	amenities: string
	facilities: string
	accessibility: string
	appliances: string
	bathroom: string
	storage: string
	kitchen: string
	bedroom: string
	other: string
	// Added translations for filters
	filters: string
	filterProperties: string
	apply: string
	reset: string
	close: string
	matchingFilters: string
	otherProperties: string
	lastMinute: string
	lastMinuteOnly: string
	lastMinuteDescription: string
	"filter-sauna": string
	"filter-swimming_pool": string
	"filter-balcony": string
	"filter-wifi": string
	"filter-air_conditioning": string
	"filter-pet_friendly": string
	"filter-kitchen": string
	"filter-washing_machine": string
	"filter-parking": string
	"filter-tv": string
	"filter-dishwasher": string
	"filter-heating": string
	"filter-elevator": string
	"filter-sea_view": string
	"filter-mountain_view": string
	"filter-garden": string
	"filter-bbq": string
	"filter-terrace": string
	"filter-wheelchair_accessible": string
	"filter-jacuzzi": string
	"filter-bathroom_with_bathtub": string
	"filter-coffee_tea_set": string
	"filter-lounge_area": string
	"filter-vacuum_cleaner": string
	"filter-iron_ironing_board": string
	"filter-electric_kettle": string
	"filter-refrigerator": string
	"filter-microwave": string
	"filter-kitchen_utensils": string
	"filter-towels": string
	"filter-hair_dryer": string
	"filter-wardrobe": string
	"filter-coffee_machine": string
	"filter-toilet": string
	"filter-upstairs_bedroom": string
	"filter-kitchenette": string
	"filter-cooktop": string
	"filter-oven": string
	"filter-bathroom_with_shower": string
	"filter-safe": string
	"filter-private_garage": string
	"filter-playground": string
	"filter-playroom": string
	"filter-mezzanine": string
	"filter-bunk_bed": string
	"filter-fitness_room": string
	"filter-toaster": string
	"filter-electric_fireplace": string
	"filter-cable_channels": string
	"filter-freezer": string
	"filter-fireplace": string
	"filter-desk": string
	"filter-playstation": string
	"filter-ground_floor": string
	"filter-personcapacity": string
	propertyNotAvailableStayPeriod: string
	propertyNotAvailableGuests: string
	propertyNotAvailableDates: string
}

interface ReservationEngineProps {
	id: string | null | undefined
	propertyId?: number
	disableAutoSelect?: boolean
	propertyName?: string
	booking?: {
		propertyNotAvailable?: string
		suggestAlternatives?: string
		noPropertiesAvailable?: string
		automaticallySelected?: string
	}
	theme?: "light" | "dark"
	onThemeChange: (theme: "light" | "dark") => void
	onCalendarToggle?: (isOpen: boolean) => void // Add callback for calendar open/close state
	filterDictionary?: Dictionary["filters"] // Optional dictionary for filters
	dictionary?: Dictionary // Add dictionary prop for translations
	offerData?: OfferData // Add offer data for pre-filling from offer links
	initialLocale?: "pl" | "en" | "de" | "es" | "it"
}

import { useParams } from "next/navigation"

const translations: Record<"en" | "pl" | "it" | "de" | "es", ITranslation> = {
	en: {
		completeOnlinePayment: "Complete Online Payment",
		language: "",
		selectLanguage: "",
		startDate: "Start Date",
		endDate: "End Date",
		day: "Day",
		search: "Search",
		guests: "Guests",
		month: "Month",
		year: "Year",
		calendarBtn: "Calendar",
		prev: "Previous",
		next: "Next",
		months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
		weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
		themeLabel: "Theme",
		lightTheme: "Light",
		darkTheme: "Dark",
		minmaxNotValid: "Stay period not valid for this property",
		total: "Total",
		cantFit: "Cannot accommodate this many guests",
		book: "Book Now",
		assignAll: "Please assign all guests",
		successForm: "Reservation completed successfully",
		failed: "Reservation failed",
		noneAvailable: "Please call us for information about available spots. Online booking is temporarily unavailable. Tel +48 511 000 660",
		requestedDatesNotAvailable: "These dates are still available, but may sell out quickly",
		apartmentNoLongerAvailable: "This apartment can no longer be reserved",
		unknownStep: "Unknown step",
		missing: "Please fill in all required fields",
		processingPayment: "Processing Payment",
		partialPayment: "Partial Payment Available",
		partialPaymentInfo: "Only part of your reservation can be paid online. The remaining amount must be paid manually.",
		manualPaymentRequired: "Manual Payment Required",
		onlinePaymentAmount: "Online Payment",
		manualPayment: "Manual Payment",
		totalAmount: "Total Amount",
		payment_breakdown: "Payment Breakdown",
		filterSingular: "filter",
		filterPlural: "filters",
		selected: "selected",
		places: "Places",
		views: "Views",
		amenities: "Amenities",
		facilities: "Facilities",
		accessibility: "Accessibility",
		appliances: "Appliances",
		bathroom: "Bathroom",
		storage: "Storage",
		kitchen: "Kitchen",
		bedroom: "Bedroom",
		other: "Other",
		filters: "Filters",
		filterProperties: "Filter Properties",
		apply: "Apply",
		reset: "Reset",
		close: "Close",
		matchingFilters: "Properties Matching Your Filters",
		otherProperties: "Other Available Properties",
		lastMinute: "Last Minute",
		lastMinuteOnly: "Last Minute Only",
		lastMinuteDescription: "Show only last minute offers",
		"filter-sauna": "Sauna",
		"filter-swimming_pool": "Swimming Pool",
		"filter-balcony": "Balcony",
		"filter-wifi": "WiFi",
		"filter-air_conditioning": "Air Conditioning",
		"filter-pet_friendly": "Pet Friendly",
		"filter-kitchen": "Kitchen",
		"filter-washing_machine": "Washing Machine",
		"filter-parking": "Parking",
		"filter-tv": "TV",
		"filter-dishwasher": "Dishwasher",
		"filter-heating": "Heating",
		"filter-elevator": "Elevator",
		"filter-sea_view": "Sea View",
		"filter-mountain_view": "Mountain View",
		"filter-garden": "Garden",
		"filter-bbq": "BBQ",
		"filter-terrace": "Terrace",
		"filter-wheelchair_accessible": "Wheelchair Accessible",
		"filter-jacuzzi": "Jacuzzi",
		"filter-bathroom_with_bathtub": "Bathroom with Bathtub",
		"filter-coffee_tea_set": "Coffee/Tea Set",
		"filter-lounge_area": "Lounge Area",
		"filter-vacuum_cleaner": "Vacuum Cleaner",
		"filter-iron_ironing_board": "Iron/Ironing Board",
		"filter-electric_kettle": "Electric Kettle",
		"filter-refrigerator": "Refrigerator",
		"filter-microwave": "Microwave",
		"filter-kitchen_utensils": "Kitchen Utensils",
		"filter-towels": "Towels",
		"filter-hair_dryer": "Hair Dryer",
		"filter-wardrobe": "Wardrobe",
		"filter-coffee_machine": "Coffee Machine",
		"filter-toilet": "Toilet",
		"filter-upstairs_bedroom": "Upstairs Bedroom",
		"filter-kitchenette": "Kitchenette",
		"filter-cooktop": "Cooktop",
		"filter-oven": "Oven",
		"filter-bathroom_with_shower": "Bathroom with Shower",
		"filter-safe": "Safe",
		"filter-private_garage": "Private Garage",
		"filter-playground": "Playground",
		"filter-playroom": "Playroom",
		"filter-mezzanine": "Mezzanine",
		"filter-bunk_bed": "Bunk Bed",
		"filter-fitness_room": "Fitness Room",
		"filter-toaster": "Toaster",
		"filter-electric_fireplace": "Electric Fireplace",
		"filter-cable_channels": "Cable Channels",
		"filter-freezer": "Freezer",
		"filter-fireplace": "Fireplace",
		"filter-desk": "Desk",
		"filter-playstation": "Playstation",
		"filter-ground_floor": "Ground Floor",
		"filter-personcapacity": "Person Capacity",
		propertyNotAvailableStayPeriod: "Selected property ${propertyName} is not available. The stay period is invalid for this property.",
		propertyNotAvailableGuests: "Selected property ${propertyName} is not available. The property cannot accommodate this many guests.",
		propertyNotAvailableDates: "Selected property ${propertyName} is not available for the selected dates. Here are other available options:",
	},
	pl: {
		completeOnlinePayment: "Zrealizuj płatność online",
		language: "",
		selectLanguage: "",
		startDate: "Data przyjazdu",
		endDate: "Data wyjazdu",
		day: "Dzień",
		search: "Szukaj",
		guests: "Goście",
		month: "Miesiąc",
		year: "Rok",
		calendarBtn: "Kalendarz",
		prev: "Wstecz",
		next: "Dalej",
		minmaxNotValid: "Wybrane daty nie spełniają wymagań minimalnego lub maksymalnego pobytu",
		months: ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"],
		weekdays: ["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"],
		themeLabel: "Motyw",
		lightTheme: "Jasny",
		darkTheme: "Ciemny",
		total: "Razem",
		cantFit: "Zbyt wielu gości",
		book: "Rezerwuj",
		assignAll: "Przypisz wszystkich gości",
		successForm: "Rezerwacja zakończona pomyślnie",
		failed: "Rezerwacja nie powiodła się",
		noneAvailable: "Zapraszamy do kontaktu telefonicznego w celu uzyskania informacji o wolnych miejscach. Tel +48 511 000 660",
		requestedDatesNotAvailable: "Te terminy są jeszcze dostępne, ale mogą się szybko wyprzedać",
		apartmentNoLongerAvailable: "Tego apartamentu nie mozna juz zarezerwować",
		unknownStep: "Nieznany krok",
		missing: "Brak wymaganych informacji",
		processingPayment: "Przetwarzanie płatności",
		partialPayment: "Wymagana częściowa płatność",
		partialPaymentInfo: "Zapłacisz część kwoty online teraz, a resztę w obiekcie.",
		manualPaymentRequired: "Wymagana płatność na miejscu",
		onlinePaymentAmount: "Kwota płatności online",
		manualPayment: "Płatność na miejscu",
		totalAmount: "Całkowita kwota",
		payment_breakdown: "Podział płatności",
		filterSingular: "filtr",
		filterPlural: "filtry",
		selected: "wybrane",
		places: "Miejsca",
		views: "Widoki",
		amenities: "Udogodnienia",
		facilities: "Wyposażenie",
		accessibility: "Dostępność",
		appliances: "Urządzenia",
		bathroom: "Łazienka",
		storage: "Przechowywanie",
		kitchen: "Kuchnia",
		bedroom: "Sypialnia",
		other: "Inne",
		filters: "Filtry",
		filterProperties: "Filtruj nieruchomości",
		apply: "Zastosuj",
		reset: "Resetuj",
		close: "Zamknij",
		matchingFilters: "Obiekty spełniające kryteria",
		otherProperties: "Inne dostępne obiekty",
		lastMinute: "Ostatnia chwila",
		lastMinuteOnly: "Tylko ostatnia chwila",
		lastMinuteDescription: "Pokaż tylko nieruchomości dostępne na ostatnią chwilę",
		"filter-sauna": "Sauna",
		"filter-swimming_pool": "Basen",
		"filter-balcony": "Balkon",
		"filter-wifi": "WiFi",
		"filter-air_conditioning": "Klimatyzacja",
		"filter-pet_friendly": "Przyjazne zwierzętom",
		"filter-kitchen": "Kuchnia",
		"filter-washing_machine": "Pralka",
		"filter-parking": "Parking",
		"filter-tv": "Telewizor",
		"filter-dishwasher": "Zmywarka",
		"filter-heating": "Ogrzewanie",
		"filter-elevator": "Winda",
		"filter-sea_view": "Widok na morze",
		"filter-mountain_view": "Widok na góry",
		"filter-garden": "Ogród",
		"filter-bbq": "Grill",
		"filter-terrace": "Taras",
		"filter-wheelchair_accessible": "Dostępne dla wózków",
		"filter-jacuzzi": "Jacuzzi",
		"filter-bathroom_with_bathtub": "Łazienka z wanną",
		"filter-coffee_tea_set": "Zestaw do kawy/herbaty",
		"filter-lounge_area": "Strefa relaksu",
		"filter-vacuum_cleaner": "Odkurzacz",
		"filter-iron_ironing_board": "Żelazko/deska do prasowania",
		"filter-electric_kettle": "Czajnik elektryczny",
		"filter-refrigerator": "Lodówka",
		"filter-microwave": "Kuchenka mikrofalowa",
		"filter-kitchen_utensils": "Przybory kuchenne",
		"filter-towels": "Ręczniki",
		"filter-hair_dryer": "Suszarka do włosów",
		"filter-wardrobe": "Szafa",
		"filter-coffee_machine": "Ekspres do kawy",
		"filter-toilet": "Toaleta",
		"filter-upstairs_bedroom": "Sypialnia na piętrze",
		"filter-kitchenette": "Aneks kuchenny",
		"filter-cooktop": "Płyta grzewcza",
		"filter-oven": "Piekarnik",
		"filter-bathroom_with_shower": "Łazienka z prysznicem",
		"filter-safe": "Sejf",
		"filter-private_garage": "Prywatne miejsce garażowe",
		"filter-playground": "Plac zabaw",
		"filter-playroom": "Pokój zabaw",
		"filter-mezzanine": "Antresola",
		"filter-bunk_bed": "Łóżko piętrowe",
		"filter-fitness_room": "Sala fitness",
		"filter-toaster": "Toster",
		"filter-electric_fireplace": "Kominek elektryczny",
		"filter-cable_channels": "Kanały kablowe",
		"filter-freezer": "Zamrażarka",
		"filter-fireplace": "Kominek",
		"filter-desk": "Biurko",
		"filter-playstation": "Playstation",
		"filter-ground_floor": "Parter",
		"filter-personcapacity": "Pojemność osób",
		propertyNotAvailableStayPeriod: "Wybrany obiekt ${propertyName} nie jest dostępny. Okres pobytu jest nieprawidłowy dla tego obiektu.",
		propertyNotAvailableGuests: "Wybrany obiekt ${propertyName} nie jest dostępny. Obiekt nie może pomieścić tylu gości.",
		propertyNotAvailableDates: "Wybrany obiekt ${propertyName} nie jest dostępny w wybranych terminach. Oto inne dostępne opcje:",
	},
	it: {
		completeOnlinePayment: "Completa il pagamento online",
		language: "",
		selectLanguage: "",
		startDate: "Data di inizio",
		endDate: "Data di fine",
		search: "Cerca",
		guests: "Ospiti",
		day: "Giorno",
		month: "Mese",
		year: "Anno",
		calendarBtn: "Calendario",
		prev: "Prec",
		next: "Succ",
		minmaxNotValid: "Le date selezionate non soddisfano i requisiti minimi o massimi di soggiorno",
		months: ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"],
		weekdays: ["Lu", "Ma", "Me", "Gi", "Ve", "Sa", "Do"],
		themeLabel: "Tema",
		lightTheme: "Chiaro",
		darkTheme: "Scuro",
		total: "Totale",
		cantFit: "Non possiamo ospitare così tanti ospiti",
		book: "Prenota ora",
		assignAll: "Assegna tutti gli ospiti",
		successForm: "Prenotazione completata con successo",
		failed: "Prenotazione fallita",
		noneAvailable:
			"Vi invitiamo a contattarci telefonicamente per informazioni sui posti disponibili. La prenotazione online è temporaneamente non disponibile. Tel +48 511 000 660",
		requestedDatesNotAvailable: "Queste date sono ancora disponibili, ma potrebbero esaurirsi rapidamente",
		apartmentNoLongerAvailable: "Questo appartamento non può più essere prenotato",
		unknownStep: "Passaggio sconosciuto",
		missing: "Si prega di compilare tutti i campi obbligatori",
		processingPayment: "Elaborazione del pagamento",
		partialPayment: "Pagamento parziale disponibile",
		partialPaymentInfo: "Solo parte della prenotazione può essere pagata online. L'importo rimanente richiede un pagamento manuale.",
		manualPaymentRequired: "Pagamento manuale richiesto",
		onlinePaymentAmount: "Pagamento online",
		manualPayment: "Pagamento manuale",
		totalAmount: "Importo totale",
		payment_breakdown: "Suddivisione pagamenti",
		filterSingular: "filtro",
		filterPlural: "filtri",
		selected: "selezionato",
		places: "Luoghi",
		views: "Viste",
		amenities: "Servizi",
		facilities: "Strutture",
		accessibility: "Accessibilità",
		appliances: "Elettrodomestici",
		bathroom: "Bagno",
		storage: "Deposito",
		kitchen: "Cucina",
		bedroom: "Camera da letto",
		other: "Altro",
		filters: "Filtri",
		filterProperties: "Filtra proprietà",
		apply: "Applica",
		reset: "Reimposta",
		close: "Chiudi",
		matchingFilters: "Proprietà che corrispondono ai filtri",
		otherProperties: "Altre proprietà disponibili",
		"filter-sauna": "Sauna",
		"filter-swimming_pool": "Piscina",
		"filter-balcony": "Balcone",
		"filter-wifi": "WiFi",
		"filter-air_conditioning": "Aria condizionata",
		"filter-pet_friendly": "Animali ammessi",
		"filter-kitchen": "Cucina",
		"filter-washing_machine": "Lavatrice",
		"filter-parking": "Parcheggio",
		"filter-tv": "TV",
		"filter-dishwasher": "Lavastoviglie",
		"filter-heating": "Riscaldamento",
		"filter-elevator": "Ascensore",
		"filter-sea_view": "Vista mare",
		"filter-mountain_view": "Vista montagna",
		"filter-garden": "Giardino",
		"filter-bbq": "Barbecue",
		"filter-terrace": "Terrazza",
		"filter-wheelchair_accessible": "Accessibile ai disabili",
		"filter-jacuzzi": "Jacuzzi",
		"filter-bathroom_with_bathtub": "Bagno con vasca",
		"filter-coffee_tea_set": "Set per caffè/tè",
		"filter-lounge_area": "Area relax",
		"filter-vacuum_cleaner": "Aspirapolvere",
		"filter-iron_ironing_board": "Ferro e asse da stiro",
		"filter-electric_kettle": "Bollitore elettrico",
		"filter-refrigerator": "Frigorifero",
		"filter-microwave": "Microonde",
		"filter-kitchen_utensils": "Utensili da cucina",
		"filter-towels": "Asciugamani",
		"filter-hair_dryer": "Asciugacapelli",
		"filter-wardrobe": "Guardaroba",
		"filter-coffee_machine": "Macchina del caffè",
		"filter-toilet": "WC",
		"filter-upstairs_bedroom": "Camera da letto al piano superiore",
		"filter-kitchenette": "Angolo cottura",
		"filter-cooktop": "Piano cottura",
		"filter-oven": "Forno",
		"filter-bathroom_with_shower": "Bagno con doccia",
		"filter-safe": "Cassaforte",
		"filter-private_garage": "Garage privato",
		"filter-playground": "Parco giochi",
		"filter-playroom": "Sala giochi",
		"filter-mezzanine": "Soppalco",
		"filter-bunk_bed": "Letto a castello",
		"filter-fitness_room": "Sala fitness",
		"filter-toaster": "Tostapane",
		"filter-electric_fireplace": "Camino elettrico",
		"filter-cable_channels": "Canali TV via cavo",
		"filter-freezer": "Congelatore",
		"filter-fireplace": "Camino",
		"filter-desk": "Scrivania",
		"filter-playstation": "PlayStation",
		"filter-ground_floor": "Piano terra",
		"filter-personcapacity": "Capacità Persone",
		lastMinute: "Ultimo minuto",
		lastMinuteOnly: "Solo ultimo minuto",
		lastMinuteDescription: "Mostra solo offerte dell'ultimo minuto",
		propertyNotAvailableStayPeriod:
			"La proprietà selezionata ${propertyName} non è disponibile. Il periodo di soggiorno non è valido per questa proprietà.",
		propertyNotAvailableGuests: "La proprietà selezionata ${propertyName} non è disponibile. La proprietà non può ospitare così tanti ospiti.",
		propertyNotAvailableDates: "La proprietà selezionata ${propertyName} non è disponibile per le date selezionate. Ecco altre opzioni disponibili:",
	},
	de: {
		completeOnlinePayment: "Online-Zahlung abschließen",
		language: "",
		selectLanguage: "",
		startDate: "Startdatum",
		endDate: "Enddatum",
		day: "Tag",
		search: "Suche",
		guests: "Gäste",
		month: "Monat",
		year: "Jahr",
		calendarBtn: "Kalender",
		prev: "Zurück",
		next: "Weiter",
		minmaxNotValid: "Die ausgewählten Daten erfüllen nicht die Mindest- oder Höchstaufenthaltsanforderungen",
		months: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
		weekdays: ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"],
		themeLabel: "Thema",
		lightTheme: "Helles",
		darkTheme: "Dunkles",
		total: "Gesamt",
		cantFit: "Wir können nicht so viele Gäste unterbringen",
		book: "Jetzt buchen",
		assignAll: "Bitte weise alle Gäste zu",
		successForm: "Reservierung erfolgreich abgeschlossen",
		failed: "Reservierung fehlgeschlagen",
		noneAvailable:
			"Wir bitten Sie, uns anzurufen, um Informationen über verfügbare Plätze zu erhalten. Die Online-Buchung ist vorübergehend nicht verfügbar. Tel +48 511 000 660",
		requestedDatesNotAvailable: "Diese Termine sind noch verfügbar, können sich aber schnell ausverkaufen",
		apartmentNoLongerAvailable: "Dieses Apartment kann nicht mehr reserviert werden",
		unknownStep: "Unbekannter Schritt",
		missing: "Bitte fülle alle erforderlichen Felder aus",
		processingPayment: "Zahlung wird verarbeitet",
		partialPayment: "Teilzahlung verfügbar",
		partialPaymentInfo: "Nur ein Teil deiner Reservierung kann online bezahlt werden. Der verbleibende Betrag muss manuell bezahlt werden.",
		manualPaymentRequired: "Manuelle Zahlung erforderlich",
		onlinePaymentAmount: "Online-Zahlung",
		manualPayment: "Manuelle Zahlung",
		totalAmount: "Gesamtbetrag",
		payment_breakdown: "Zahlungsaufteilung",
		filterSingular: "Filter",
		filterPlural: "Filter",
		selected: "ausgewählt",
		places: "Plätze",
		views: "Aussichten",
		amenities: "Annehmlichkeiten",
		facilities: "Einrichtungen",
		accessibility: "Barrierefreiheit",
		appliances: "Geräte",
		bathroom: "Badezimmer",
		storage: "Lagerung",
		kitchen: "Küche",
		bedroom: "Schlafzimmer",
		other: "Andere",
		filters: "Filter",
		filterProperties: "Objekte filtern",
		apply: "Anwenden",
		reset: "Zurücksetzen",
		close: "Schließen",
		matchingFilters: "Objekte, die deinen Filtern entsprechen",
		otherProperties: "Andere verfügbare Objekte",
		"filter-sauna": "Sauna",
		"filter-swimming_pool": "Schwimmbad",
		"filter-balcony": "Balkon",
		"filter-wifi": "WLAN",
		"filter-air_conditioning": "Klimaanlage",
		"filter-pet_friendly": "Haustierfreundlich",
		"filter-kitchen": "Küche",
		"filter-washing_machine": "Waschmaschine",
		"filter-parking": "Parkplatz",
		"filter-tv": "TV",
		"filter-dishwasher": "Geschirrspüler",
		"filter-heating": "Heizung",
		"filter-elevator": "Aufzug",
		"filter-sea_view": "Meerblick",
		"filter-mountain_view": "Bergblick",
		"filter-garden": "Garten",
		"filter-bbq": "Grill",
		"filter-terrace": "Terrasse",
		"filter-wheelchair_accessible": "Rollstuhlgerecht",
		"filter-jacuzzi": "Whirlpool",
		"filter-bathroom_with_bathtub": "Badezimmer mit Badewanne",
		"filter-coffee_tea_set": "Kaffee-/Teezubereitungsset",
		"filter-lounge_area": "Lounge-Bereich",
		"filter-vacuum_cleaner": "Staubsauger",
		"filter-iron_ironing_board": "Bügeleisen und Bügelbrett",
		"filter-electric_kettle": "Wasserkocher",
		"filter-refrigerator": "Kühlschrank",
		"filter-microwave": "Mikrowelle",
		"filter-kitchen_utensils": "Küchenutensilien",
		"filter-towels": "Handtücher",
		"filter-hair_dryer": "Haartrockner",
		"filter-wardrobe": "Kleiderschrank",
		"filter-coffee_machine": "Kaffeemaschine",
		"filter-toilet": "Toilette",
		"filter-upstairs_bedroom": "Schlafzimmer im Obergeschoss",
		"filter-kitchenette": "Kochnische",
		"filter-cooktop": "Kochfeld",
		"filter-oven": "Backofen",
		"filter-bathroom_with_shower": "Badezimmer mit Dusche",
		"filter-safe": "Safe",
		"filter-private_garage": "Privatgarage",
		"filter-playground": "Spielplatz",
		"filter-playroom": "Spielzimmer",
		"filter-mezzanine": "Zwischengeschoss",
		"filter-bunk_bed": "Etagenbett",
		"filter-fitness_room": "Fitnessraum",
		"filter-toaster": "Toaster",
		"filter-electric_fireplace": "Elektrischer Kamin",
		"filter-cable_channels": "Kabel-TV-Kanäle",
		"filter-freezer": "Gefrierschrank",
		"filter-fireplace": "Kamin",
		"filter-desk": "Schreibtisch",
		"filter-playstation": "PlayStation",
		"filter-ground_floor": "Erdgeschoss",
		"filter-personcapacity": "Personenkapazität",
		lastMinute: "Last Minute",
		lastMinuteOnly: "Nur Last Minute",
		lastMinuteDescription: "Nur Last-Minute-Angebote anzeigen",
		propertyNotAvailableStayPeriod:
			"Die ausgewählte Immobilie ${propertyName} ist nicht verfügbar. Der Aufenthaltszeitraum ist für diese Immobilie ungültig.",
		propertyNotAvailableGuests: "Die ausgewählte Immobilie ${propertyName} ist nicht verfügbar. Die Immobilie kann nicht so viele Gäste aufnehmen.",
		propertyNotAvailableDates:
			"Die ausgewählte Immobilie ${propertyName} ist für die ausgewählten Daten nicht verfügbar. Hier sind andere verfügbare Optionen:",
	},
	es: {
		completeOnlinePayment: "Complete Online Payment",
		language: "",
		selectLanguage: "",
		startDate: "Start Date",
		endDate: "End Date",
		day: "Day",
		search: "Search",
		guests: "Guests",
		month: "Month",
		year: "Year",
		calendarBtn: "Calendar",
		prev: "Previous",
		next: "Next",
		months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
		weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
		themeLabel: "Theme",
		lightTheme: "Light",
		darkTheme: "Dark",
		minmaxNotValid: "Stay period not valid for this property",
		total: "Total",
		cantFit: "Cannot accommodate this many guests",
		book: "Book Now",
		assignAll: "Please assign all guests",
		successForm: "Reservation completed successfully",
		failed: "Reservation failed",
		noneAvailable:
			"Le invitamos a llamarnos para obtener información sobre plazas disponibles. La reserva online está temporalmente no disponible. Tel +48 511 000 660",
		requestedDatesNotAvailable: "These dates are still available, but may sell out quickly",
		apartmentNoLongerAvailable: "This apartment can no longer be reserved",
		unknownStep: "Unknown step",
		missing: "Please fill in all required fields",
		processingPayment: "Processing Payment",
		partialPayment: "Partial Payment Available",
		partialPaymentInfo: "Only part of your reservation can be paid online. The remaining amount must be paid manually.",
		manualPaymentRequired: "Manual Payment Required",
		onlinePaymentAmount: "Online Payment",
		manualPayment: "Manual Payment",
		totalAmount: "Total Amount",
		payment_breakdown: "Payment Breakdown",
		filterSingular: "filter",
		filterPlural: "filters",
		selected: "selected",
		places: "Places",
		views: "Views",
		amenities: "Amenities",
		facilities: "Facilities",
		accessibility: "Accessibility",
		appliances: "Appliances",
		bathroom: "Bathroom",
		storage: "Storage",
		kitchen: "Kitchen",
		bedroom: "Bedroom",
		other: "Other",
		filters: "Filters",
		filterProperties: "Filter Properties",
		apply: "Apply",
		reset: "Reset",
		close: "Close",
		matchingFilters: "Properties Matching Your Filters",
		otherProperties: "Other Available Properties",
		lastMinute: "Last Minute",
		lastMinuteOnly: "Last Minute Only",
		lastMinuteDescription: "Show only last minute offers",
		"filter-sauna": "Sauna",
		"filter-swimming_pool": "Swimming Pool",
		"filter-balcony": "Balcony",
		"filter-wifi": "WiFi",
		"filter-air_conditioning": "Air Conditioning",
		"filter-pet_friendly": "Pet Friendly",
		"filter-kitchen": "Kitchen",
		"filter-washing_machine": "Washing Machine",
		"filter-parking": "Parking",
		"filter-tv": "TV",
		"filter-dishwasher": "Dishwasher",
		"filter-heating": "Heating",
		"filter-elevator": "Elevator",
		"filter-sea_view": "Sea View",
		"filter-mountain_view": "Mountain View",
		"filter-garden": "Garden",
		"filter-bbq": "BBQ",
		"filter-terrace": "Terrace",
		"filter-wheelchair_accessible": "Wheelchair Accessible",
		"filter-jacuzzi": "Jacuzzi",
		"filter-bathroom_with_bathtub": "Bathroom with Bathtub",
		"filter-coffee_tea_set": "Coffee/Tea Set",
		"filter-lounge_area": "Lounge Area",
		"filter-vacuum_cleaner": "Vacuum Cleaner",
		"filter-iron_ironing_board": "Iron/Ironing Board",
		"filter-electric_kettle": "Electric Kettle",
		"filter-refrigerator": "Refrigerator",
		"filter-microwave": "Microwave",
		"filter-kitchen_utensils": "Kitchen Utensils",
		"filter-towels": "Towels",
		"filter-hair_dryer": "Hair Dryer",
		"filter-wardrobe": "Wardrobe",
		"filter-coffee_machine": "Coffee Machine",
		"filter-toilet": "Toilet",
		"filter-upstairs_bedroom": "Upstairs Bedroom",
		"filter-kitchenette": "Kitchenette",
		"filter-cooktop": "Cooktop",
		"filter-oven": "Oven",
		"filter-bathroom_with_shower": "Bathroom with Shower",
		"filter-safe": "Safe",
		"filter-private_garage": "Private Garage",
		"filter-playground": "Playground",
		"filter-playroom": "Playroom",
		"filter-mezzanine": "Mezzanine",
		"filter-bunk_bed": "Bunk Bed",
		"filter-fitness_room": "Fitness Room",
		"filter-toaster": "Toaster",
		"filter-electric_fireplace": "Electric Fireplace",
		"filter-cable_channels": "Cable Channels",
		"filter-freezer": "Freezer",
		"filter-fireplace": "Fireplace",
		"filter-desk": "Desk",
		"filter-playstation": "Playstation",
		"filter-ground_floor": "Ground Floor",
		"filter-personcapacity": "Person Capacity",
		propertyNotAvailableStayPeriod: "Selected property ${propertyName} is not available. The stay period is invalid for this property.",
		propertyNotAvailableGuests: "Selected property ${propertyName} is not available. The property cannot accommodate this many guests.",
		propertyNotAvailableDates: "Selected property ${propertyName} is not available for the selected dates. Here are other available options:",
	},
}

const ReservationEngine: React.FC<ReservationEngineProps> = ({
	id,
	propertyId,
	disableAutoSelect = false,
	propertyName,
	booking,
	theme = "light",
	onThemeChange,
	onCalendarToggle,
	filterDictionary,
	dictionary,
	offerData,
	initialLocale,
}) => {
	const dispatch = useDispatch()
	// Section refs for scrolling
	const summaryRef = useRef<HTMLDivElement | null>(null)
	const paymentRef = useRef<HTMLDivElement | null>(null)
	const alternativeDatesRef = useRef<HTMLDivElement | null>(null)
	const params = useParams() as { lang?: string }
	const reservationStep = useSelector((state: RootState) => state.root.reservationStep)
	const [locale, setLocale] = useState<"pl" | "en" | "it" | "de" | "es">(initialLocale || "pl")

	// Reset all steps and go to first step (date picker) on component load
	useEffect(() => {
		dispatch(setReservationStepAction("dateSelection"))
		dispatch(setSelectedPropertiesToRent([]))
		// Reset other state as needed
		setFilteredProperties(null)
		setSelectedFilters([])
		setAvailabilityFound(null)
		setLengthNotValid(false)
	}, [dispatch])

	useEffect(() => {
		// Set locale based on URL parameter or default to 'pl'
		const lang = (params.lang as "pl" | "en" | "it" | "de" | "es") || "pl"
		setLocale(lang)
	}, [params.lang])

	// Translation function wrapped in useCallback
	const t = useCallback(
		(key: keyof ITranslation | string): string => {
			// If dictionary is provided, try to get the value from it
			if (dictionary) {
				// For discount code translations, use the new structure
				if (key.startsWith("discountCode.")) {
					const parts = key.split(".")
					let current: Record<string, unknown> = dictionary.discountCode
					for (let i = 1; i < parts.length; i++) {
						if (current && typeof current === "object" && !Array.isArray(current)) {
							current = current[parts[i]] as Record<string, unknown>
						} else {
							break // Break if path doesn't exist
						}
					}
					if (current && typeof current === "string") {
						return current
					}
				}
				// For other keys, check if dictionary has the key and it's a string
				const dictValue = dictionary[key as keyof typeof dictionary]
				if (typeof dictValue === "string") {
					return dictValue
				}
			}
			// Fallback to translations object
			const translation = translations[locale]?.[key as keyof ITranslation]
			return typeof translation === "string" ? translation : key
		},
		[locale, dictionary],
	)

	const filterTranslations = useMemo(
		() => ({
			"filter-sauna": t("filter-sauna"),
			"filter-swimming_pool": t("filter-swimming_pool"),
			"filter-balcony": t("filter-balcony"),
			"filter-wifi": t("filter-wifi"),
			"filter-air_conditioning": t("filter-air_conditioning"),
			"filter-pet_friendly": t("filter-pet_friendly"),
			"filter-kitchen": t("filter-kitchen"),
			"filter-washing_machine": t("filter-washing_machine"),
			"filter-parking": t("filter-parking"),
			"filter-tv": t("filter-tv"),
			"filter-dishwasher": t("filter-dishwasher"),
			"filter-heating": t("filter-heating"),
			"filter-elevator": t("filter-elevator"),
			"filter-sea_view": t("filter-sea_view"),
			"filter-mountain_view": t("filter-mountain_view"),
			"filter-garden": t("filter-garden"),
			"filter-bbq": t("filter-bbq"),
			"filter-terrace": t("filter-terrace"),
			"filter-wheelchair_accessible": t("filter-wheelchair_accessible"),
			"filter-jacuzzi": t("filter-jacuzzi"),
			"filter-bathroom_with_bathtub": t("filter-bathroom_with_bathtub"),
			"filter-coffee_tea_set": t("filter-coffee_tea_set"),
			"filter-lounge_area": t("filter-lounge_area"),
			"filter-vacuum_cleaner": t("filter-vacuum_cleaner"),
			"filter-iron_ironing_board": t("filter-iron_ironing_board"),
			"filter-electric_kettle": t("filter-electric_kettle"),
			"filter-refrigerator": t("filter-refrigerator"),
			"filter-microwave": t("filter-microwave"),
			"filter-kitchen_utensils": t("filter-kitchen_utensils"),
			"filter-towels": t("filter-towels"),
			"filter-hair_dryer": t("filter-hair_dryer"),
			"filter-wardrobe": t("filter-wardrobe"),
			"filter-coffee_machine": t("filter-coffee_machine"),
			"filter-toilet": t("filter-toilet"),
			"filter-upstairs_bedroom": t("filter-upstairs_bedroom"),
			"filter-kitchenette": t("filter-kitchenette"),
			"filter-cooktop": t("filter-cooktop"),
			"filter-oven": t("filter-oven"),
			"filter-bathroom_with_shower": t("filter-bathroom_with_shower"),
			"filter-safe": t("filter-safe"),
			"filter-private_garage": t("filter-private_garage"),
			"filter-playground": t("filter-playground"),
			"filter-playroom": t("filter-playroom"),
			"filter-mezzanine": t("filter-mezzanine"),
			"filter-bunk_bed": t("filter-bunk_bed"),
			"filter-fitness_room": t("filter-fitness_room"),
			"filter-toaster": t("filter-toaster"),
			"filter-electric_fireplace": t("filter-electric_fireplace"),
			"filter-cable_channels": t("filter-cable_channels"),
			"filter-freezer": t("filter-freezer"),
			"filter-fireplace": t("filter-fireplace"),
			"filter-desk": t("filter-desk"),
			"filter-playstation": t("filter-playstation"),
			"filter-ground_floor": t("filter-ground_floor"),
			"filter-personcapacity": t("filter-personcapacity"),
		}),
		[t],
	)

	// Create default filter dictionary if none provided
	const defaultFilterDictionary: Dictionary["filters"] = {
		title: t("filters"),
		subtitle: t("filterProperties"),
		unselectAll: t("reset"),
		close: t("close"),
		matching: t("matchingFilters"),
		filterSingular: t("filterSingular"),
		filterPlural: t("filterPlural"),
		selected: t("selected"),
		places: t("places"),
		views: t("views"),
		amenities: t("amenities"),
		facilities: t("facilities"),
		accessibility: t("accessibility"),
		appliances: t("appliances"),
		bathroom: t("bathroom"),
		storage: t("storage"),
		kitchen: t("kitchen"),
		bedroom: t("bedroom"),
		other: t("other"),
		apartmentSize: filterDictionary?.apartmentSize || "Apartment Size",
		personCapacity: filterDictionary?.personCapacity || "Person Capacity",
		personCapacityUnit: filterDictionary?.personCapacityUnit || "persons",
		lastMinute: t("lastMinute"),
		lastMinuteOnly: t("lastMinuteOnly"),
		lastMinuteDescription: t("lastMinuteDescription"),
		filters: Object.fromEntries(
			Object.values([
				"SAUNA",
				"SWIMMING_POOL",
				"BALCONY",
				"WIFI",
				"AIR_CONDITIONING",
				"PET_FRIENDLY",
				"KITCHEN",
				"WASHING_MACHINE",
				"PARKING",
				"TV",
				"DISHWASHER",
				"HEATING",
				"ELEVATOR",
				"SEA_VIEW",
				"MOUNTAIN_VIEW",
				"GARDEN",
				"BBQ",
				"TERRACE",
				"WHEELCHAIR_ACCESSIBLE",
				"JACUZZI",
				"BATHROOM_WITH_BATHTUB",
				"COFFEE_TEA_SET",
				"LOUNGE_AREA",
				"VACUUM_CLEANER",
				"IRON_IRONING_BOARD",
				"ELECTRIC_KETTLE",
				"REFRIGERATOR",
				"MICROWAVE",
				"KITCHEN_UTENSILS",
				"TOWELS",
				"HAIR_DRYER",
				"WARDROBE",
				"COFFEE_MACHINE",
				"TOILET",
				"UPSTAIRS_BEDROOM",
				"FITNESS_ROOM",
				"PLAYGROUND",
				"PLAYROOM",
				"KITCHENETTE",
				"COOKTOP",
				"OVEN",
				"BATHROOM_WITH_SHOWER",
				"SAFE",
				"PRIVATE_GARAGE",
				"MEZZANINE",
				"BUNK_BED",
				"TOASTER",
				"ELECTRIC_FIREPLACE",
				"CABLE_CHANNELS",
				"FREEZER",
				"FIREPLACE",
				"DESK",
				"PLAYSTATION",
				"GROUND_FLOOR",
			]).map((filter) => [filter, t(`filter-${filter.toLowerCase()}` as keyof ITranslation)]),
		),
	}

	const finalFilterDictionary = filterDictionary || defaultFilterDictionary

	// Track previous step to detect when going back
	const [previousStep, setPreviousStep] = useState<string>(reservationStep)

	// Clear discount code when going back a step
	useEffect(() => {
		const stepOrder = ["dateSelection", "searching", "roomSelection", "summary", "book", "payment"]
		const currentStepIndex = stepOrder.indexOf(reservationStep)
		const previousStepIndex = stepOrder.indexOf(previousStep)

		// If we're going back to an earlier step, clear the discount
		if (currentStepIndex < previousStepIndex) {
			// Discount codes are now managed in AdditionalServices
		}

		setPreviousStep(reservationStep)
	}, [reservationStep, previousStep])

	// Scroll to section when reservationStep changes
	useEffect(() => {
		const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
			if (ref.current) {
				ref.current.scrollIntoView({
					behavior: "smooth",
					block: "start",
				})
			}
		}
		if (reservationStep === mergedStep) {
			scrollToSection(summaryRef)
		} else if (reservationStep === "payment") {
			scrollToSection(paymentRef)
		}
	}, [reservationStep])
	const roomsSelected: ReservationForProperty[] = useSelector((state: RootState) => state.root.propertiesSelectedToRent)
	const paymentInfo = useSelector((state: RootState) => state.root.paymentInfo)
	const servicesState = useSelector((state: RootState) => state.root.services)

	// Dates & guests
	const [arrivalDate, setArrivalDate] = useState<Date | null>(new Date())
	const [departureDate, setDepartureDate] = useState<Date | null>(addDays(new Date(), 3))
	const [guests, setGuests] = useState(1)
	const [apartments, setApartments] = useState(1)

	// Calculations
	const [numberOfNights, setNumberOfNights] = useState<number>(0)

	// Calculate numberOfNights whenever dates change
	useEffect(() => {
		if (arrivalDate && departureDate) {
			const nights = differenceInDays(departureDate, arrivalDate)
			setNumberOfNights(nights)
		} else {
			setNumberOfNights(0)
		}
	}, [arrivalDate, departureDate])
	// const [remaining, setRemaining] = useState<number>(guests || 1)
	const [maxOccupancy, setMaxOccupancy] = useState<number>(0)

	// Filters	// Filters - these will be read from localStorage (set by FilterButton)
	const [filteredProperties, setFilteredProperties] = useState<ReservationForProperty[] | null>(null)
	const [selectedFilters, setSelectedFilters] = useState<string[]>([])

	// Validations
	const [lengthNotValid, setLengthNotValid] = useState<boolean>(false)
	const [availabilityFound, setAvailabilityFound] = useState<ReservationForProperty[] | null>(null)
	const [alternativeRanges, setAlternativeRanges] = useState<Array<{ start: string; end: string; nights: number }> | null>(null)
	const [hasOverflow, setHasOverflow] = useState(false)

	// Check for overflow in alternative dates container
	useEffect(() => {
		const checkOverflow = () => {
			if (alternativeDatesRef.current) {
				const container = alternativeDatesRef.current
				const hasHorizontalOverflow = container.scrollWidth > container.clientWidth
				setHasOverflow(hasHorizontalOverflow)
			}
		}

		// Check overflow when alternativeRanges changes
		if (alternativeRanges && alternativeRanges.length > 0) {
			// Use setTimeout to ensure DOM is updated
			setTimeout(checkOverflow, 100)
		} else {
			setHasOverflow(false)
		}

		// Also check on window resize
		window.addEventListener("resize", checkOverflow)
		return () => window.removeEventListener("resize", checkOverflow)
	}, [alternativeRanges])

	const discountData = servicesState?.discountData || null

	// Clear discount code if offer discounts are detected
	const canFit = guests <= maxOccupancy

	// Update maxOccupancy when selected properties change
	useEffect(() => {
		if (roomsSelected && roomsSelected.length > 0) {
			// Sum up maxOccupancy of all selected properties
			const totalMaxOccupancy = roomsSelected.reduce((sum, property) => sum + (property.maxOccupancy || 0), 0)
			setMaxOccupancy(totalMaxOccupancy)
		} else {
			setMaxOccupancy(0)
		}
	}, [roomsSelected])

	// Auto-advance to next step when required number of apartments are selected
	useEffect(() => {
		if (reservationStep !== "roomSelection") {
			return
		}

		// If we are returning from the summary step, do not auto-advance again
		const returningFromSummary = previousStep === "summary"
		const noNewPropertySelection = roomsSelected.length > 0 && roomsSelected.length === previousSelectedCountRef.current

		if (returningFromSummary && noNewPropertySelection) {
			return
		}

		if (preventAutoAdvanceRef.current) {
			preventAutoAdvanceRef.current = false
			return
		}

		if (autoSelectInProgressRef.current) {
			return
		}

		if (roomsSelected && roomsSelected.length > 0) {
			if (apartments > 1 && roomsSelected.length === apartments) {
				// If multiple apartments are needed and all are selected, go to next step
				dispatch(setReservationStepAction("summary"))
			}
		}
	}, [roomsSelected, apartments, reservationStep, dispatch, previousStep])

	// Filter properties based on filters from localStorage
	useEffect(() => {
		if (!availabilityFound) return

		// Read filters from localStorage
		const getFiltersFromStorage = () => {
			if (typeof window === "undefined") return []
			const savedFilters = localStorage.getItem("propertyFilters")
			try {
				return savedFilters ? JSON.parse(savedFilters) : []
			} catch {
				return []
			}
		}

		const selectedFiltersFromStorage = getFiltersFromStorage()
		setSelectedFilters(selectedFiltersFromStorage)

		let propertiesToFilter = availabilityFound

		if (selectedFiltersFromStorage.length === 0) {
			// If no filters selected, use all available properties
			propertiesToFilter = availabilityFound
		} else {
			// Split properties into matching and non-matching
			const matching = availabilityFound.filter((property) => {
				// Check if property has filters array and if any selected filter is in it
				return property.filters && property.filters.some((filter: string) => selectedFiltersFromStorage.includes(filter))
			})

			const nonMatching = availabilityFound.filter((property) => {
				return !property.filters || !property.filters.some((filter: string) => selectedFiltersFromStorage.includes(filter))
			})

			// Set filtered properties with matching first, then non-matching
			propertiesToFilter = [...matching, ...nonMatching]
		}

		// Prioritize offer properties if offerData exists
		if (offerData && offerData.offerProperties && offerData.offerProperties.length > 0) {
			const offerPropertyIds = offerData.offerProperties.map((op) => op.property.id)
			const offerProperties = propertiesToFilter.filter((p) => offerPropertyIds.includes(p.id))
			const otherProperties = propertiesToFilter.filter((p) => !offerPropertyIds.includes(p.id))
			propertiesToFilter = [...offerProperties, ...otherProperties]
		}

		// Prioritize propertyId if provided
		if (propertyId) {
			const prioritized = propertiesToFilter.filter((p) => p.id === propertyId)
			const others = propertiesToFilter.filter((p) => p.id !== propertyId)
			setFilteredProperties([...prioritized, ...others])
		} else {
			setFilteredProperties(propertiesToFilter)
		}

		// Listen for localStorage changes from FilterButton
		const handleStorageChange = (e: CustomEvent) => {
			if (e.detail.key === "propertyFilters") {
				// Re-run filtering when filters change
				const newFilters = e.detail.value || []
				setSelectedFilters(newFilters)
				let newPropertiesToFilter = availabilityFound

				if (newFilters.length === 0) {
					newPropertiesToFilter = availabilityFound
				} else {
					// Re-filter with new filters
					const newMatching = availabilityFound.filter((property) => {
						return property.filters && property.filters.some((filter: string) => newFilters.includes(filter))
					})

					const newNonMatching = availabilityFound.filter((property) => {
						return !property.filters || !property.filters.some((filter: string) => newFilters.includes(filter))
					})

					newPropertiesToFilter = [...newMatching, ...newNonMatching]
				}

				// Prioritize offer properties if offerData exists
				if (offerData && offerData.offerProperties && offerData.offerProperties.length > 0) {
					const offerPropertyIds = offerData.offerProperties.map((op) => op.property.id)
					const offerProperties = newPropertiesToFilter.filter((p) => offerPropertyIds.includes(p.id))
					const otherProperties = newPropertiesToFilter.filter((p) => !offerPropertyIds.includes(p.id))
					newPropertiesToFilter = [...offerProperties, ...otherProperties]
				}

				// Prioritize propertyId if provided
				if (propertyId) {
					const prioritized = newPropertiesToFilter.filter((p) => p.id === propertyId)
					const others = newPropertiesToFilter.filter((p) => p.id !== propertyId)
					setFilteredProperties([...prioritized, ...others])
				} else {
					setFilteredProperties(newPropertiesToFilter)
				}
			}
		}

		// Add event listener for localStorage changes
		window.addEventListener("localStorageChange", handleStorageChange as EventListener)

		return () => {
			window.removeEventListener("localStorageChange", handleStorageChange as EventListener)
		}
	}, [availabilityFound, propertyId, offerData])

	// Effect to update nights when dates change
	useEffect(() => {
		if (arrivalDate && departureDate) {
			// Set specific UTC times: arrival at 14:00 UTC, departure at 09:00 UTC
			const arrivalUTC = new Date(arrivalDate)
			arrivalUTC.setUTCHours(14, 0, 0, 0)

			const departureUTC = new Date(departureDate)
			departureUTC.setUTCHours(9, 0, 0, 0)

			// Calculate nights using UTC dates without time
			const arrivalDateOnly = new Date(arrivalUTC.getUTCFullYear(), arrivalUTC.getUTCMonth(), arrivalUTC.getUTCDate())
			const departureDateOnly = new Date(departureUTC.getUTCFullYear(), departureUTC.getUTCMonth(), departureUTC.getUTCDate())

			const nights = differenceInDays(departureDateOnly, arrivalDateOnly)
			setNumberOfNights(nights)
		}
	}, [arrivalDate, departureDate])

	// Effect to pre-fill dates and guests from offerData
	useEffect(() => {
		if (offerData) {
			// Pre-fill dates from offer
			if (offerData.startDate) {
				setArrivalDate(new Date(offerData.startDate))
			}
			if (offerData.endDate) {
				setDepartureDate(new Date(offerData.endDate))
			}
			// Pre-fill guests from offer
			if (offerData.guests) {
				setGuests(offerData.guests)
			}
		}
	}, [offerData])

	// New DB-based availability functions
	const searchAvailable = async ({ data }: { data: { fromdate: string; todate: string; guests: number; id: string } }) => {
		const options = {
			method: "POST",
			headers: {
				accept: "application/json",
				"content-type": "application/json",
			},
			body: JSON.stringify(data),
		}
		try {
			const response = await fetch(`/api/availability/re-db`, options)
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`)
			}
			const data = await response.json()
			return data
		} catch (error) {
			console.log("Error searching available (DB-first):", error)
			return null
		}
	}

	const searchAvailableOneProperty = async ({ data }: { data: { fromdate: string; todate: string; guests: number; id: string; propertyName: string } }) => {
		const options = {
			method: "POST",
			headers: {
				accept: "application/json",
				"content-type": "application/json",
			},
			body: JSON.stringify(data),
		}
		try {
			const response = await fetch(`/api/availability/reOne-db`, options)
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`)
			}
			const data = await response.json()
			return data
		} catch (error) {
			console.log("Error searching available for one property (DB-first):", error)
			return null
		}
	}

	const checkAvailability = useCallback(
		async (startDate: Date, endDate: Date, guests: number, id: string, propertyName?: string) => {
			setAvailabilityFound(null)
			setAlternativeRanges(null)
			dispatch(setSelectedPropertiesToRent([]))

			// Discount codes are now managed in AdditionalServices

			if (!startDate || !endDate || guests <= 0 || !id) {
				dispatch(
					setNotification({
						severity: "error",
						message: t("missing"),
						open: true,
					}),
				)
				return
			}

			dispatch(setReservationStepAction("searching"))

			// Create dates that will be consistent regardless of server timezone
			// We want: the selected date at 14:00 and 09:00 regardless of timezone

			// Get the date components (year, month, day) from the selected dates
			const startYear = startDate.getFullYear()
			const startMonth = startDate.getMonth()
			const startDay = startDate.getDate()

			const endYear = endDate.getFullYear()
			const endMonth = endDate.getMonth()
			const endDay = endDate.getDate()

			// Create new dates with explicit UTC times to avoid timezone shifts
			// This ensures the date stays the same regardless of server timezone
			const arrivalUTC = new Date(Date.UTC(startYear, startMonth, startDay, 14, 0, 0, 0))
			const departureUTC = new Date(Date.UTC(endYear, endMonth, endDay, 9, 0, 0, 0))

			let response: AvailabilityResponse | null = null

			if (propertyName) {
				response = await searchAvailableOneProperty({
					data: {
						fromdate: arrivalUTC.toISOString(),
						todate: departureUTC.toISOString(),
						guests: guests,
						id: id,
						propertyName: propertyName,
					},
				})

				// If property not found or other error, fall back to normal search
				if (
					response?.error &&
					(response.error.includes("not found") || response.error.includes("not configured") || response.error.includes("Property not found"))
				) {
					response = await searchAvailable({
						data: {
							fromdate: arrivalUTC.toISOString(),
							todate: departureUTC.toISOString(),
							guests: guests,
							id: id,
						},
					})
				}
			} else {
				response = await searchAvailable({
					data: {
						fromdate: arrivalUTC.toISOString(),
						todate: departureUTC.toISOString(),
						guests: guests,
						id: id,
					},
				})
			}

			if (response?.error) {
				// Check if there are alternative ranges available
				if (response.alternativeRanges && Array.isArray(response.alternativeRanges)) {
					setAlternativeRanges(response.alternativeRanges)
					dispatch(setReservationStepAction("alternativeDates"))
				} else {
					dispatch(setReservationStepAction("noneAvailable"))
				}
				return
			}

			if (response?.availableRoomDetails && Array.isArray(response.availableRoomDetails) && response.availableRoomDetails.length > 0) {
				setAvailabilityFound(response.availableRoomDetails as ReservationForProperty[])
				dispatch(setReservationStepAction("roomSelection"))
			} else if (response?.property) {
				// For single property search, wrap the property in an array
				setAvailabilityFound([response.property as ReservationForProperty])
				dispatch(setReservationStepAction("roomSelection"))
			} else {
				dispatch(setReservationStepAction("noneAvailable"))
			}
		},
		[dispatch, setAvailabilityFound, t],
	)

	// Effect to auto-search when offerData is provided
	useEffect(() => {
		if (offerData && arrivalDate && departureDate && guests > 0 && id) {
			// Auto-search after a short delay to allow state to settle
			const timer = setTimeout(() => {
				checkAvailability(arrivalDate, departureDate, guests, id)
			}, 1000)
			return () => clearTimeout(timer)
		}
	}, [offerData, arrivalDate, departureDate, guests, id, checkAvailability])

	const mergedStep = "summary"

	const renderDatePicker = () => (
		<div className="w-full">
			<DateRangePicker
				dictionary={finalFilterDictionary}
				monthsToShow={3}
				theme={theme}
				onThemeChange={onThemeChange}
				locale={locale}
				onLocaleChange={setLocale}
				onCalendarToggle={onCalendarToggle || (() => {})}
				initialStartDate={arrivalDate}
				initialEndDate={departureDate}
				initialGuests={guests}
				initialApartments={apartments}
				onSearch={(start: Date | null, end: Date | null, guestsCount: number, apartmentsCount: number, propertyName?: string) => {
					setGuests((Number(guestsCount) > 0 && Number(guestsCount)) || 0)
					setApartments((Number(apartmentsCount) > 0 && Number(apartmentsCount)) || 1)
					setArrivalDate(start)
					setDepartureDate(end)

					if (start && end && guestsCount > 0 && id) {
						checkAvailability(start, end, guestsCount, id, propertyName)
					}
				}}
			/>
		</div>
	)

	// Create MUI theme
	const muiTheme = createTheme({
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
			error: {
				main: "#ef4444",
			},
		},
	})
	// Handle property preselection when propertyId is provided
	useEffect(() => {
		if (disableAutoSelect) return
		const autoSelectProperty = async () => {
			if (!propertyId || !availabilityFound || availabilityFound.length === 0) return

			// Try to find the specific property by ID
			let targetProperty = availabilityFound.find((property) => property.id == propertyId)

			if (targetProperty) {
				// Fetch full property data to get extended fields like petsAllowed, breakfastAllowed, etc.
				try {
					const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mountainapartments.pl"
					const response = await fetch(`${baseUrl}/api/properties/mountain/${propertyId}?userId=clok0rd6f0000kkdgyf1pd0t3`, {
						cache: "no-store",
					})
					if (response.ok) {
						const data = await response.json()
						const fullProperty = data.property

						// Extract extended fields that should be in the extended object
						const extendedFields = {
							petFee: (fullProperty.extended as ExtendedData)?.petFee,
							petsAllowed: (fullProperty.extended as ExtendedData)?.petsAllowed,
							petsMax: (fullProperty.extended as ExtendedData)?.petsMax,
							breakfastFee: (fullProperty.extended as ExtendedData)?.breakfastFee,
							breakfastAllowed: (fullProperty.extended as ExtendedData)?.breakfastAllowed,
							babyCribFee: (fullProperty.extended as ExtendedData)?.babyCribFee,
							babyCribAllowed: (fullProperty.extended as ExtendedData)?.babyCribAllowed,
							// Add other extended fields as needed
						}

						// Merge the full property data with availability data
						targetProperty = {
							...targetProperty,
							...fullProperty,
							// Ensure extended field contains the flattened data
							extended: {
								...fullProperty.extended,
								...extendedFields,
							},
							// Set direct properties from extended data for ReservationForProperty
							petsAllowed: extendedFields.petsAllowed || false,
							petsMax: extendedFields.petsMax || 0,
							petFee: extendedFields.petFee || 0,
							breakfastAllowed: extendedFields.breakfastAllowed || false,
							breakfastFee: extendedFields.breakfastFee || 0,
							babyCribAllowed: extendedFields.babyCribAllowed || false,
							babyCribFee: extendedFields.babyCribFee || 0,
							// Keep availability-specific fields from targetProperty
							price: targetProperty.price,
							available: targetProperty.available,
							minStay: targetProperty.minStay,
							maxStay: targetProperty.maxStay,
						}
						if (targetProperty) {
						}
					}
				} catch (error) {
					console.error("Error fetching full property data:", error)
					// Continue with targetProperty from availability data
				}

				// Ensure targetProperty is still valid after merge attempt
				if (!targetProperty) return

				// Validate the property before auto-selecting it
				const hasValidMinStay = !targetProperty.minStay || targetProperty.minStay <= numberOfNights
				const hasValidMaxStay = !targetProperty.maxStay || targetProperty.maxStay >= numberOfNights
				const stayPeriodValid = hasValidMinStay && hasValidMaxStay
				const canAccommodateGuests = targetProperty.maxOccupancy === 0 || guests <= targetProperty.maxOccupancy

				if (!stayPeriodValid) {
					// Property doesn't meet stay period requirements - prevent auto-selection
					const message = t("propertyNotAvailableStayPeriod").replace("${propertyName}", propertyName || "")

					dispatch(
						setNotification({
							message,
							severity: "error",
							open: true,
						}),
					)
					// Don't auto-select, just show error and allow manual selection
					dispatch(setReservationStepAction("roomSelection"))
					return
				}

				if (!canAccommodateGuests) {
					// Property can't accommodate the guests - prevent auto-selection
					const message = t("propertyNotAvailableGuests").replace("${propertyName}", propertyName || "")

					dispatch(
						setNotification({
							message,
							severity: "error",
							open: true,
						}),
					)
					// Don't auto-select, just show error and allow manual selection
					dispatch(setReservationStepAction("roomSelection"))
					return
				}

				// Property found, available, and meets all requirements - auto-select it
				const selectedProperty: ReservationForProperty = {
					...targetProperty,
					selected: true,
					guestsAssigned: Math.min(guests, targetProperty.maxOccupancy),
					// Ensure required fields are present
					filters: targetProperty.filters || [],
					// Initialize quantity fields
					petsQuantity: 0,
					breakfastQuantity: 0,
					babyCribQuantity: 0,
					babyBedLinenQuantity: 0,
				}

				await sleep(1000) // Wait for a short time to ensure state updates

				autoSelectInProgressRef.current = true
				dispatch(setSelectedPropertiesToRent([selectedProperty])) // Show notification that property was auto-selected
				setTimeout(() => {
					autoSelectInProgressRef.current = false
				}, 0)
				if (propertyName && booking?.automaticallySelected) {
					dispatch(
						setNotification({
							message: `${propertyName} ${booking.automaticallySelected}`,
							severity: "success",
							open: true,
							horizontal: "center",
							vertical: "top",
						}),
					)
				}
			} else {
				// Property not found or not available - show alternatives message
				const message = t("propertyNotAvailableDates").replace("${propertyName}", propertyName || "")

				dispatch(
					setNotification({
						message,
						severity: "error",
						open: true,
					}),
				)
			}
		}
		autoSelectProperty()
	}, [propertyId, availabilityFound, guests, propertyName, booking, dispatch, numberOfNights, t, disableAutoSelect])

	const preventAutoAdvanceRef = useRef(false)
	const autoSelectInProgressRef = useRef(false)
	const previousSelectedCountRef = useRef<number>(0)
	const propertyListRef = useRef<HTMLDivElement>(null)
	// Track selected room count for back-navigation auto-advance guard
	useEffect(() => {
		previousSelectedCountRef.current = roomsSelected.length
	}, [roomsSelected])

	// Scroll to property list when results are shown
	useEffect(() => {
		const hasResults =
			(Array.isArray(filteredProperties) && filteredProperties.length > 0) || (Array.isArray(availabilityFound) && availabilityFound.length > 0)
		if (reservationStep === "roomSelection" && hasResults) {
			propertyListRef.current?.scrollIntoView({ behavior: "smooth" })
		}
	}, [reservationStep, filteredProperties, availabilityFound])
	// Guard if ID is missing
	if (!id) {
		return (
			<ThemeProvider theme={muiTheme}>
				<div className="flex justify-center items-center">
					<CircularProgress />
				</div>
				<NotificationComponent />
			</ThemeProvider>
		)
	}

	console.log("reservationStep:", reservationStep)

	return (
		<div className="relative">
			{/* 
				IMPORTANT: FilterButton is rendered outside MUI ThemeProvider 
				to preserve Tailwind CSS styles and prevent Material-UI theme 
				from overriding the button's gradient background and other styles 
			*/}

			<ThemeProvider theme={muiTheme}>
				<div
					className={`w-full min-h-full p-1 ${
						(reservationStep === "roomSelection" && roomsSelected.length > 0) ||
						reservationStep === "summary" ||
						reservationStep === "book" ||
						reservationStep === "payment"
							? "pb-24"
							: ""
					}`}>
					{/* Date picker appears in all steps */}
					<div className="">{renderDatePicker()}</div>
					{/* Loading indicator for searching step */}
					{reservationStep === "searching" && (
						<div className="flex justify-center my-4">
							<CircularProgress />
						</div>
					)}
					{/* Success and failure messages */}
					{reservationStep === "success" && (
						<div className="flex justify-center items-center h-[150px]">
							<Typography color="text.primary">{t("successForm")}</Typography>
						</div>
					)}
					{reservationStep === "failed" && (
						<div className="flex justify-center items-center h-[150px]">
							<Typography color="text.primary">{t("failed")}</Typography>
						</div>
					)}
					{/* No availability message */}
					{reservationStep === "noneAvailable" && (
						<div className="flex justify-center items-center mt-4">
							<Typography color="text.primary">{t("noneAvailable")}</Typography>
						</div>
					)}
					{/* Alternative dates message */}
					{reservationStep === "alternativeDates" && alternativeRanges && (
						<div className="mt-4 mb-12">
							<Typography color="error" className="mb-2 pl-5">
								{t("apartmentNoLongerAvailable")}
							</Typography>
							<Typography color="text.primary" className="mb-6 pl-5">
								{t("requestedDatesNotAvailable")}
							</Typography>
							<div className="relative">
								<div ref={alternativeDatesRef} className="flex gap-3 overflow-x-auto pb-2 max-h-60 mt-5">
									{alternativeRanges
										.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
										.map((range, index) => (
											<div
												key={index}
												className="flex-shrink-0 w-48 p-1 rounded-lg cursor-pointer hover:shadow-md transition-all duration-200 bg-white"
												style={{ borderColor: "#cc9678" }}
												onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#b8856a")}
												onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#cc9678")}
												onClick={() => {
													// Parse the dates and update the date picker
													const startDate = new Date(range.start)
													const endDate = new Date(range.end)
													setArrivalDate(startDate)
													setDepartureDate(endDate)
													setAlternativeRanges(null)
													// Automatically trigger search with the new dates
													checkAvailability(startDate, endDate, guests, id!, propertyName)
												}}>
												<div className="text-center">
													<Typography variant="h6" color="text.primary" className="font-semibold mb-1">
														{new Date(range.start).toLocaleDateString("en-US", { month: "short", day: "numeric" })} -{" "}
														{new Date(range.end).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
													</Typography>
													<Typography variant="body2" color="text.secondary">
														{range.nights}{" "}
														{range.nights === 1
															? dictionary?.apartments?.night || "night"
															: dictionary?.apartments?.nights || "nights"}
													</Typography>
												</div>
											</div>
										))}
								</div>
								{/* Arrow indicator for small screens when content overflows */}
								{hasOverflow && (
									<div
										className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white/90 rounded-full p-1 shadow-md md:hidden cursor-pointer hover:bg-white transition-colors"
										onClick={() => {
											if (alternativeDatesRef.current) {
												const container = alternativeDatesRef.current
												const scrollAmount = 200 // Scroll by 200px
												container.scrollBy({ left: scrollAmount, behavior: "smooth" })
											}
										}}>
										<ChevronRight className="text-gray-500 w-5 h-5" />
									</div>
								)}
							</div>
						</div>
					)}
					{/* Unknown step message */}
					{reservationStep !== "dateSelection" &&
						reservationStep !== "searching" &&
						reservationStep !== "roomSelection" &&
						reservationStep !== "summary" &&
						reservationStep !== "book" &&
						reservationStep !== "success" &&
						reservationStep !== "failed" &&
						reservationStep !== "payment" &&
						reservationStep !== "noneAvailable" &&
						reservationStep !== "alternativeDates" && (
							<div className="flex justify-center items-center mt-4">
								<Typography color="text.primary">{t("unknownStep")}</Typography>
							</div>
						)}
					{/* Property List */}
					{reservationStep === "roomSelection" && (
						<div ref={propertyListRef}>
							<PropertyList
								properties={filteredProperties || availabilityFound}
								guests={guests}
								numberOfNights={numberOfNights}
								locale={locale}
								selectedFilters={selectedFilters}
								matchingFiltersLabel={t("matchingFilters")}
								otherPropertiesLabel={t("otherProperties")}
								filterTranslations={filterTranslations}
							/>
						</div>
					)}
					{/* Merged Additional Services + ReservationForm step */}
					{reservationStep === mergedStep && arrivalDate && departureDate && (
						<div ref={summaryRef}>
							<Grid container spacing={1}>
								<Grid size={{ xs: 12, lg: 6 }}>
									<AdditionalServices
										arrivalDate={arrivalDate}
										departureDate={departureDate}
										guests={guests}
										theme={theme}
										locale={locale as "pl" | "en" | "it" | "de"}
										offerData={offerData}
									/>
								</Grid>
								<Grid size={{ xs: 12, lg: 6 }}>
									<ReservationForm
										id={id}
										properties={roomsSelected}
										arrivalDate={arrivalDate}
										departureDate={departureDate}
										theme={theme}
										locale={locale as "pl" | "en" | "it" | "de"}
										discountData={discountData}
										offerData={offerData}
										onBack={() => {
											preventAutoAdvanceRef.current = true
										}}
									/>
								</Grid>
							</Grid>
						</div>
					)}
					{/* Payment Step - Enhanced UI (Light mode only) */}
					{reservationStep === "payment" && (
						<div ref={paymentRef} className="flex flex-col items-center mt-8 px-1">
							{/* Payment Header */}
							<div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden mb-6">
								<div className="bg-[#cc9678] px-1 py-1">
									<Typography variant="h5" className="text-white font-semibold text-center">
										{t("processingPayment")}
									</Typography>
								</div>

								{paymentInfo?.eventId &&
									(() => {
										const anyPropertyRequiresPayment = servicesState?.reservations?.some(
											(prop: ReservationForProperty) => prop.paymentsOn === true,
										)
										const allPropertiesRequirePayment = servicesState?.reservations?.every(
											(prop: ReservationForProperty) => prop.paymentsOn === true,
										)

										// If no properties require payment, don't show payment UI at all
										if (!anyPropertyRequiresPayment) {
											return (
												<div className="p-6 text-center">
													<div className="bg-white border border-gray-200 rounded-xl p-6 mb-4">
														<div className="text-gray-900 text-4xl mb-3"></div>
														<Typography variant="h6" className="text-gray-900 font-semibold mb-3">
															{t("noOnlinePaymentRequired")}
														</Typography>
														<Typography variant="body1" className="text-gray-700 mb-4">
															{t("contactPropertyForPayment")}
														</Typography>
														<div className="bg-gray-50 rounded-lg p-1 border border-gray-200">
															<Typography variant="h6" className="text-gray-900 font-bold">
																{t("totalAmount")}:{" "}
																<span className="text-black">{(servicesState.totalPrice || 0).toFixed(2)} PLN</span>
															</Typography>
														</div>
													</div>
												</div>
											)
										}

										// If not all properties require payment (mixed), show manual payment message
										if (!allPropertiesRequirePayment) {
											const totalPrice = servicesState.totalPrice || 0
											return (
												<div className="p-6 text-center">
													<div className="bg-white border border-gray-200 rounded-xl p-6 mb-4">
														<div className="text-gray-900 text-4xl mb-3"></div>
														<Typography variant="h6" className="text-gray-900 font-semibold mb-3">
															{t("manualPaymentRequired")}
														</Typography>
														<Typography variant="body1" className="text-gray-700 mb-4">
															{t("partialPaymentInfo")}
														</Typography>
														<div className="bg-gray-50 rounded-lg p-1 border border-gray-200">
															<Typography variant="h6" className="text-gray-900 font-bold">
																{t("totalAmount")}: <span className="text-gray-900">{totalPrice.toFixed(2)} PLN</span>
															</Typography>
														</div>
													</div>
												</div>
											)
										}
										// Calculate base price (accommodation only, without fees) - only for properties requiring payment
										const propertiesRequiringPayment =
											servicesState.reservations?.filter((prop: ReservationForProperty) => prop.paymentsOn === true) || []
										let basePrice = propertiesRequiringPayment.reduce((sum: number, prop: ReservationForProperty) => {
											const propertyBasePrice = prop.totalPrice || 0
											const adjustedBasePrice = hasPersonBasedPricing(prop as PropertyWithPricing)
												? getPersonAdjustedPrice(prop as PropertyWithPricing, prop.guestsAssigned || guests, propertyBasePrice)
												: propertyBasePrice
											return sum + adjustedBasePrice
										}, 0)

										// Apply offer discounts to base price
										let offerDiscountTotal = 0
										if (offerData && offerData.offerProperties) {
											propertiesRequiringPayment.forEach((prop: ReservationForProperty) => {
												const offerProperty = offerData.offerProperties.find((op) => op.property.id === prop.id)
												if (offerProperty) {
													// Calculate base price for this property (accommodation + cleaning fee, without tax)
													const propertyBasePrice = prop.totalPrice || 0
													const adjustedBasePrice = hasPersonBasedPricing(prop as PropertyWithPricing)
														? getPersonAdjustedPrice(prop as PropertyWithPricing, prop.guestsAssigned || guests, propertyBasePrice)
														: propertyBasePrice
													const basePriceWithCleaning = adjustedBasePrice + (prop.cleaningFee || 0)

													// Check if the calculated price matches the offer's original price
													if (Math.abs(basePriceWithCleaning - offerProperty.originalPrice) < 0.01) {
														offerDiscountTotal += offerProperty.originalPrice - offerProperty.price
													}
												}
											})
										}
										basePrice -= offerDiscountTotal

										// Calculate fees only for properties requiring payment
										const cleaningFee = propertiesRequiringPayment.reduce(
											(sum: number, prop: ReservationForProperty) => sum + (prop.cleaningFee || 0),
											0,
										)
										const cityTax = propertiesRequiringPayment.reduce(
											(sum: number, prop: ReservationForProperty) => sum + (prop.localTaxSum || 0),
											0,
										)
										const parkingTotal = propertiesRequiringPayment.reduce(
											(sum: number, prop: ReservationForProperty) => sum + (prop.parkingQuantity || 0) * (prop.parkingFee || 0),
											0,
										)

										const discountedPriceBreakdown = calculateDiscountedPrice(basePrice, cleaningFee, cityTax, discountData)
										const discountedTotalPrice = discountedPriceBreakdown.finalPrice + parkingTotal

										// Add 5% fee for 30% payment option
										const finalTotalPrice = servicesState?.paymentOption === "30" ? discountedTotalPrice * 1.05 : discountedTotalPrice

										// Calculate online payment amount
										const discountedTotalPriceOnline =
											servicesState?.paymentOption === "30" ? finalTotalPrice * 0.3 : servicesState?.currentTotalPrice || finalTotalPrice

										const hasPartialPayment = discountedTotalPriceOnline > 0 && discountedTotalPriceOnline < finalTotalPrice
										const hasNoOnlinePayment = discountedTotalPriceOnline === 0

										if (hasNoOnlinePayment) {
											return (
												<div className="p-6 text-center">
													<div className="bg-white  bp-1 mb-4">
														<div className="text-black text-4xl mb-3"></div>
														<Typography variant="h6" className="text-black font-semibold mb-3">
															{t("manualPaymentRequired")}
														</Typography>
														<Typography variant="body1" className="text-black mb-4">
															{t("partialPaymentInfo")}
														</Typography>
														<div className="bg-white r">
															<Typography variant="h6" className="text-gray-900 font-bold">
																{t("totalAmount")}: <span className="text-black">{finalTotalPrice.toFixed(2)} PLN</span>
															</Typography>
														</div>
													</div>
												</div>
											)
										}

										if (hasPartialPayment) {
											return (
												<div className="p-1">
													<div className="bg-white  p-1 mb-6">
														<div className="text-amber-600 text-4xl text-center mb-3"></div>
														<Typography variant="h6" className="text-black font-semibold text-center mb-3">
															{t("partialPayment")}
														</Typography>
														<Typography variant="body2" className="text-black text-center mb-2">
															{t("partialPaymentInfo")}
														</Typography>
													</div>

													{/* Payment Breakdown Card */}
													<div className="bg-white border border-gray-200 rounded-xl p-1 mb-6">
														<Typography variant="h6" className="text-gray-900 font-semibold mb-4 text-center">
															{t("payment_breakdown")}
														</Typography>
														<div className="space-y-1">
															<div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg border border-gray-200">
																<span className="text-gray-700 font-medium"> {t("onlinePaymentAmount")}:</span>
																<span className="font-bold text-gray-900 text-lg">
																	{discountedTotalPriceOnline.toFixed(2)} PLN
																</span>
															</div>

															<div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg border border-gray-200">
																<span className="text-gray-700 font-medium">{t("manualPayment")}:</span>
																<span className="font-bold text-gray-900 text-lg">
																	{(finalTotalPrice - discountedTotalPriceOnline).toFixed(2)} PLN
																</span>
															</div>

															<div className="border-t-2 border-gray-300 pt-3 mt-3">
																<div className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg border border-gray-200">
																	<span className="text-gray-900 font-bold text-lg">{t("total")}:</span>
																	<span className="font-bold text-gray-900 text-xl">{finalTotalPrice.toFixed(2)} PLN</span>
																</div>
															</div>
														</div>
													</div>

													{/* Payment Button Container */}
													<div className="flex justify-center">
														<div className="w-full ">
															<FiservPaymentHPP
																chargeTotal={discountedTotalPriceOnline.toFixed(2)}
																eventId={paymentInfo.eventId}
																locale={locale as "pl" | "en" | "it" | "de"}
																theme="light"
																paymentOptions={servicesState?.paymentOption !== "30"}
															/>
														</div>
													</div>
												</div>
											)
										}

										// Full online payment
										return (
											<div className="p-6">
												<div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
													<div className="text-green-600 text-4xl text-center mb-3">✅</div>
													<Typography variant="h6" className="text-green-700 font-semibold text-center mb-3">
														{t("completeOnlinePayment")}
													</Typography>
													<div className="bg-white rounded-lg p-1 border-2 border-green-200">
														<Typography variant="h6" className="text-gray-900 font-bold text-center">
															{t("total")}: <span className="text-green-600">{discountedTotalPriceOnline.toFixed(2)} PLN</span>
														</Typography>
													</div>
												</div>
												{/* Payment Button Container */}
												<div className="flex justify-center">
													<div className="w-full ">
														<FiservPaymentHPP
															chargeTotal={discountedTotalPriceOnline.toFixed(2)}
															eventId={paymentInfo.eventId}
															locale={locale as "pl" | "en" | "it" | "de"}
															theme="light"
															paymentOptions={servicesState?.paymentOption !== "30"}
														/>
													</div>
												</div>
											</div>
										)
									})()}
							</div>
						</div>
					)}
					{/* Notification component always visible */}
					<NotificationComponent />
				</div>
			</ThemeProvider>

			{/* Fixed Bottom Navigation */}
			{(reservationStep === "roomSelection" && roomsSelected.length > 0) ||
			reservationStep === "summary" ||
			reservationStep === "book" ||
			reservationStep === "payment" ? (
				<div className="fixed bottom-0 left-0 right-2 bg-transparent border-t border-gray-200 shadow-lg z-10">
					<div className="flex justify-center items-center py-4 px-6 space-x-4">
						{/* Previous/Back Button */}
						{(reservationStep === "summary" || reservationStep === "book") && (
							<BackButton
								step={reservationStep === "summary" ? "roomSelection" : reservationStep === "payment" ? "book" : "summary"}
								locale={locale as "pl" | "en" | "it" | "de"}
								onBack={
									reservationStep === "summary"
										? () => {
												preventAutoAdvanceRef.current = true
											}
										: undefined
								}
							/>
						)}

						{/* Next Button */}
						{reservationStep === "roomSelection" && roomsSelected.length > 0 && (
							<Button
								disabled={!canFit || lengthNotValid}
								variant="contained"
								onClick={() => dispatch(setReservationStepAction(mergedStep))}
								sx={{
									minWidth: "120px",
									transition: "colors 0.2s",
									backgroundColor: canFit && !lengthNotValid ? "#22c55e" : "#dc2626",
									color: "white",
									animation: canFit && !lengthNotValid ? "blink 2s infinite" : "none",
									"@keyframes blink": {
										"0%": { opacity: 1 },
										"50%": { opacity: 0.6 },
										"100%": { opacity: 1 },
									},
									"&:hover": {
										backgroundColor: canFit && !lengthNotValid ? "#16a34a" : "#b91c1c",
										animation: "none", // Stop blinking on hover
									},
									"&:disabled": {
										backgroundColor: "#9ca3af",
										color: "#6b7280",
									},
								}}>
								{canFit ? t("next") : t("cantFit")}
							</Button>
						)}
					</div>
				</div>
			) : null}
		</div>
	)
}

export default ReservationEngine
