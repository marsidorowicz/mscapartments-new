/** @format */

import React, { useState, useEffect, useRef, useMemo, FocusEvent, useCallback } from "react"
import { CalendarMonth as CalendarMonthIcon, House as HouseIcon, Close as CloseIcon } from "@mui/icons-material"
import clsx from "clsx"
import { Paper } from "@mui/material"

// date-fns
import {
	format,
	addDays,
	addMonths,
	startOfToday,
	isBefore,
	isAfter,
	isSameDay,
	eachMonthOfInterval,
	startOfMonth,
	lastDayOfMonth,
	parseISO,
	isValid,
} from "date-fns"
import Logo from "@/public/images/logo-nobg.png"
import Image from "next/image"
import { useParams, useSearchParams } from "next/navigation"
import LocaleSwitcher from "../LocaleSwitcher"
import { Dictionary } from "@/app/types/dictionary"
import FilterButtonSearch from "./FilterButtonSearch"

// -------------------------------------------------
// 1) Typed translation data
// -------------------------------------------------
interface ITranslation {
	language: string
	selectLanguage: string
	startDate: string
	endDate: string
	day: string
	search: string
	guests: string
	apartments: string
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
	systemTitle: string // Adding new translation key for the system title
	propertyName: string
	selectDate: string
}

interface ITranslationR {
	completeOnlinePayment: string
	language: string
	selectLanguage: string
	startDate: string
	endDate: string
	day: string
	search: string
	guests: string
	apartments: string
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
	apartmentSize: string
	personCapacity: string
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
}

const translations: Record<"en" | "pl" | "it" | "de" | "es", ITranslation> = {
	en: {
		language: "",
		selectLanguage: "",
		startDate: "Start Date",
		endDate: "End Date",
		search: "Search",
		guests: "Guests",
		apartments: "Apartments",
		day: "Day",
		month: "Month",
		year: "Year",
		calendarBtn: "Calendar",
		prev: "Prev",
		next: "Next",
		months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
		weekdays: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
		themeLabel: "Theme",
		lightTheme: "Light",
		darkTheme: "Dark",
		systemTitle: "Simplevent reservation system",
		propertyName: "Optionally search by name",
		selectDate: "Select date",
	},
	pl: {
		language: "",
		selectLanguage: "",
		startDate: "Data początkowa",
		endDate: "Data końcowa",
		day: "Dzień",
		search: "Szukaj",
		guests: "Goście",
		apartments: "Apartamenty",
		month: "Mies.",
		year: "Rok",
		calendarBtn: "Kalendarz",
		prev: "Poprzedni",
		next: "Następny",
		months: ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"],
		weekdays: ["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"],
		themeLabel: "Motyw",
		lightTheme: "Jasny",
		darkTheme: "Ciemny",
		systemTitle: "System rezerwacji Simplevent",
		propertyName: "Opcjonalnie wyszukaj po nazwie",
		selectDate: "Wybierz datę",
	},
	it: {
		language: "",
		selectLanguage: "",
		startDate: "Data di inizio",
		endDate: "Data di fine",
		day: "Giorno",
		search: "Cerca",
		guests: "Ospiti",
		apartments: "Appartamenti",
		month: "Mese",
		year: "Anno",
		calendarBtn: "Calendario",
		prev: "Prec.",
		next: "Succ.",
		months: ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"],
		weekdays: ["Lu", "Ma", "Me", "Gi", "Ve", "Sa", "Do"],
		themeLabel: "Tema",
		lightTheme: "Chiaro",
		darkTheme: "Scuro",
		systemTitle: "Sistema di prenotazione Simplevent",
		propertyName: "Cerca opzionalmente per nome",
		selectDate: "Seleziona data",
	},
	de: {
		language: "",
		selectLanguage: "",
		startDate: "Startdatum",
		endDate: "Enddatum",
		day: "Tag",
		search: "Suchen",
		guests: "Gäste",
		apartments: "Apartments",
		month: "Monat",
		year: "Jahr",
		calendarBtn: "Kalender",
		prev: "Zurück",
		next: "Weiter",
		months: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
		weekdays: ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"],
		themeLabel: "Thema",
		lightTheme: "Hell",
		darkTheme: "Dunkel",
		systemTitle: "Simplevent Reservierungssystem",
		propertyName: "Optional nach Name suchen",
		selectDate: "Datum auswählen",
	},
	es: {
		language: "",
		selectLanguage: "",
		startDate: "Start Date",
		endDate: "End Date",
		search: "Search",
		guests: "Guests",
		apartments: "Apartments",
		day: "Day",
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
		systemTitle: "Simplevent reservation system",
		propertyName: "Buscar opcionalmente por nombre",
		selectDate: "Select date",
	},
}

const translationsR: Record<"en" | "pl" | "it" | "de" | "es", ITranslationR> = {
	en: {
		completeOnlinePayment: "Complete Online Payment",
		language: "",
		selectLanguage: "",
		startDate: "Start Date",
		endDate: "End Date",
		search: "Search",
		guests: "Guests",
		apartments: "Apartments",
		day: "Day",
		month: "Month",
		year: "Year",
		calendarBtn: "Calendar",
		prev: "Prev",
		next: "Next",
		minmaxNotValid: "Selected dates do not meet minimum or maximum stay requirements",
		months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
		weekdays: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
		themeLabel: "Theme",
		lightTheme: "Light",
		darkTheme: "Dark",
		total: "Total",
		cantFit: "Cannot accommodate this many guests",
		book: "Book Now",
		assignAll: "Please assign all guests",
		successForm: "Reservation completed successfully",
		failed: "Reservation failed",
		noneAvailable: "Please call us for information about available spots. Online booking is temporarily unavailable. Tel +48 515 857 609",
		unknownStep: "Unknown step",
		missing: "Please fill in all required fields",
		processingPayment: "Processing Payment",
		partialPayment: "Partial Payment Available",
		partialPaymentInfo: "Only part of your reservation can be paid online. The remaining amount must be paid manually.",
		manualPaymentRequired: "Manual Payment Required",
		onlinePaymentAmount: "Online Payment",
		manualPayment: "Manual Payment",
		totalAmount: "Total Amount",
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
		apartmentSize: "Apartment Size",
		personCapacity: "Person Capacity",
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
		"filter-coffee_tea_set": "Coffee/Tea Making Set",
		"filter-lounge_area": "Lounge Area",
		"filter-vacuum_cleaner": "Vacuum Cleaner",
		"filter-iron_ironing_board": "Iron and Ironing Board",
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
		"filter-cable_channels": "Cable TV Channels",
		"filter-freezer": "Freezer",
		"filter-fireplace": "Fireplace",
		"filter-desk": "Desk",
		"filter-playstation": "PlayStation",
		"filter-ground_floor": "Ground Floor",
	},
	pl: {
		completeOnlinePayment: "Dokonaj płatności online",
		language: "",
		selectLanguage: "",
		startDate: "Data początkowa",
		endDate: "Data końcowa",
		day: "Dzień",
		search: "Szukaj",
		guests: "Goście",
		apartments: "Apartamenty",
		month: "Mies.",
		year: "Rok",
		calendarBtn: "Kalendarz",
		prev: "Poprz.",
		next: "Dalej.",
		minmaxNotValid: "Wybrane daty nie spełniają wymagań minimalnego lub maksymalnego pobytu",
		months: ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"],
		weekdays: ["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"],
		themeLabel: "Motyw",
		lightTheme: "Jasny",
		darkTheme: "Ciemny",
		total: "Razem",
		cantFit: "Nie możemy pomieścić tylu gości",
		book: "Zarezerwuj",
		assignAll: "Przypisz wszystkich gości",
		successForm: "Rezerwacja zakończona pomyślnie",
		failed: "Rezerwacja nie powiodła się",
		noneAvailable: "Zapraszamy do kontaktu telefonicznego w celu uzyskania informacji o wolnych miejscach. Tel +48 515 857 609",
		unknownStep: "Nieznany krok",
		missing: "Proszę wypełnić wszystkie wymagane pola",
		processingPayment: "Przetwarzanie płatności",
		partialPayment: "Częściowa płatność dostępna",
		partialPaymentInfo: "Niektóre obiekty nie obsługują płatności online. Możesz zapłacić online za część rezerwacji, a resztę ręcznie.",
		manualPaymentRequired: "Wymagana płatność ręczna",
		onlinePaymentAmount: "Kwota płatności online",
		manualPayment: "Płatność ręczna",
		totalAmount: "Łączna kwota",
		filterSingular: "filtr",
		filterPlural: "filtry",
		selected: "wybrane",
		places: "Miejsca",
		views: "Widoki",
		amenities: "Udogodnienia",
		facilities: "Obiekty",
		accessibility: "Dostępność",
		appliances: "Urządzenia",
		bathroom: "Łazienka",
		storage: "Przechowywanie",
		kitchen: "Kuchnia",
		bedroom: "Sypialnia",
		other: "Inne",
		filters: "Filtry",
		filterProperties: "Filtruj obiekty",
		apply: "Zastosuj",
		reset: "Resetuj",
		close: "Zamknij",
		matchingFilters: "Obiekty spełniające kryteria",
		otherProperties: "Inne dostępne obiekty",
		apartmentSize: "Rozmiar apartamentu",
		personCapacity: "Ilość osób",
		"filter-sauna": "Sauna",
		"filter-swimming_pool": "Basen",
		"filter-balcony": "Balkon",
		"filter-wifi": "WiFi",
		"filter-air_conditioning": "Klimatyzacja",
		"filter-pet_friendly": "Przyjazny zwierzętom",
		"filter-kitchen": "Kuchnia",
		"filter-washing_machine": "Pralka",
		"filter-parking": "Parking",
		"filter-tv": "TV",
		"filter-dishwasher": "Zmywarka",
		"filter-heating": "Ogrzewanie",
		"filter-elevator": "Winda",
		"filter-sea_view": "Widok na morze",
		"filter-mountain_view": "Widok na góry",
		"filter-garden": "Ogród",
		"filter-bbq": "Grill",
		"filter-terrace": "Taras",
		"filter-wheelchair_accessible": "Dostęp dla niepełnosprawnych",
		"filter-jacuzzi": "Jacuzzi",
		"filter-bathroom_with_bathtub": "Łazienka z wanną",
		"filter-coffee_tea_set": "Zestaw do parzenia kawy lub herbaty",
		"filter-lounge_area": "Część wypoczynkowa",
		"filter-vacuum_cleaner": "Odkurzacz",
		"filter-iron_ironing_board": "Żelazko i deska do prasowania",
		"filter-electric_kettle": "Czajnik elektryczny",
		"filter-refrigerator": "Lodówka",
		"filter-microwave": "Kuchenka mikrofalowa",
		"filter-kitchen_utensils": "Przybory kuchenne",
		"filter-towels": "Ręczniki",
		"filter-hair_dryer": "Suszarka do włosów",
		"filter-wardrobe": "Szafa",
		"filter-coffee_machine": "Ekspres do kawy",
		"filter-toilet": "Dodatkowa toaleta",
		"filter-upstairs_bedroom": "Sypialnia na piętrze",
		"filter-kitchenette": "Aneks kuchenny",
		"filter-cooktop": "Płyta grzewcza",
		"filter-oven": "Piekarnik",
		"filter-bathroom_with_shower": "Łazienka z prysznicem",
		"filter-safe": "Sejf",
		"filter-private_garage": "Prywatne miejsce garażowe",
		"filter-playground": "Plac zabaw",
		"filter-playroom": "Sala zabaw",
		"filter-mezzanine": "Antresola",
		"filter-bunk_bed": "Łóżko piętrowe",
		"filter-fitness_room": "Sala fitness",
		"filter-toaster": "Toster",
		"filter-electric_fireplace": "Kominek elektryczny",
		"filter-cable_channels": "Kanały telewizji kablowej",
		"filter-freezer": "Zamrażarka",
		"filter-fireplace": "Kominek",
		"filter-desk": "Biurko",
		"filter-playstation": "PlayStation",
		"filter-ground_floor": "Parter",
	},
	it: {
		completeOnlinePayment: "Completa il pagamento online",
		language: "",
		selectLanguage: "",
		startDate: "Data di inizio",
		endDate: "Data di fine",
		search: "Cerca",
		guests: "Ospiti",
		apartments: "Appartamenti",
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
			"Vi invitiamo a contattarci telefonicamente per informazioni sui posti disponibili. La prenotazione online è temporaneamente non disponibile. Tel +48 515 857 609",
		unknownStep: "Passaggio sconosciuto",
		missing: "Si prega di compilare tutti i campi obbligatori",
		processingPayment: "Elaborazione del pagamento",
		partialPayment: "Pagamento parziale disponibile",
		partialPaymentInfo: "Solo parte della prenotazione può essere pagata online. L'importo rimanente richiede un pagamento manuale.",
		manualPaymentRequired: "Pagamento manuale richiesto",
		onlinePaymentAmount: "Pagamento online",
		manualPayment: "Pagamento manuale",
		totalAmount: "Importo totale",
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
		apartmentSize: "Dimensione appartamento",
		personCapacity: "Capacità persone",
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
		apartments: "Apartments",
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
			"Wir bitten Sie, uns anzurufen, um Informationen über verfügbare Plätze zu erhalten. Die Online-Buchung ist vorübergehend nicht verfügbar. Tel +48 515 857 609",
		unknownStep: "Unbekannter Schritt",
		missing: "Bitte fülle alle erforderlichen Felder aus",
		processingPayment: "Zahlung wird verarbeitet",
		partialPayment: "Teilzahlung verfügbar",
		partialPaymentInfo: "Nur ein Teil deiner Reservierung kann online bezahlt werden. Der verbleibende Betrag muss manuell bezahlt werden.",
		manualPaymentRequired: "Manuelle Zahlung erforderlich",
		onlinePaymentAmount: "Online-Zahlung",
		manualPayment: "Manuelle Zahlung",
		totalAmount: "Gesamtbetrag",
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
		apartmentSize: "Wohnungsgröße",
		personCapacity: "Personenkapazität",
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
	},
	es: {
		completeOnlinePayment: "Complete Online Payment",
		language: "",
		selectLanguage: "",
		startDate: "Start Date",
		endDate: "End Date",
		search: "Search",
		guests: "Guests",
		apartments: "Apartments",
		day: "Day",
		month: "Month",
		year: "Year",
		calendarBtn: "Calendar",
		prev: "Previous",
		next: "Next",
		minmaxNotValid: "Stay period not valid for this property",
		months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
		weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
		themeLabel: "Theme",
		lightTheme: "Light",
		darkTheme: "Dark",
		total: "Total",
		cantFit: "Cannot accommodate this many guests",
		book: "Book Now",
		assignAll: "Please assign all guests",
		successForm: "Reservation completed successfully",
		failed: "Reservation failed",
		noneAvailable:
			"Le invitamos a llamarnos para obtener información sobre plazas disponibles. La reserva online está temporalmente no disponible. Tel +48 515 857 609",
		unknownStep: "Unknown step",
		missing: "Please fill in all required fields",
		processingPayment: "Processing Payment",
		partialPayment: "Partial Payment Available",
		partialPaymentInfo: "Only part of your reservation can be paid online. The remaining amount must be paid manually.",
		manualPaymentRequired: "Manual Payment Required",
		onlinePaymentAmount: "Online Payment",
		manualPayment: "Manual Payment",
		totalAmount: "Total Amount",
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
		apartmentSize: "Apartment Size",
		personCapacity: "Person Capacity",
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
	},
}

// -------------------------------------------------
// 2) Our component props
// -------------------------------------------------
interface NoBedsCacheCalendarEntry {
	id: string
	propertyId: number
	room_id: number
	rid?: number | null
	date: string
	price?: number | null
	available?: boolean | null
	quantity?: number | null
	minStay?: number | null
	maxStay?: number | null
	dirty?: boolean | null
}

interface DateRangePickerProps {
	monthsToShow?: number // min 2
	dictionary: Dictionary["filters"] // Optional dictionary prop
	/** Called only upon pressing "Search" */
	onSearch?: (start: Date | null, end: Date | null, guests: number, apartments: number, propertyName?: string) => void
	theme?: "light" | "dark" // Add theme prop
	onThemeChange: (theme: "light" | "dark") => void
	locale?: "en" | "pl" | "it" | "de" | "es"
	onLocaleChange?: (locale: "en" | "pl" | "it" | "de" | "es") => void
	onCalendarToggle: (isOpen: boolean) => void // Add callback for calendar open/close state
	initialStartDate?: Date | null // Add initial start date
	initialEndDate?: Date | null // Add initial end date
	initialGuests?: number // Add initial guests
	initialApartments?: number // Add initial apartments
}

const parseDateRangeQuery = (value: string | null) => {
	if (!value) {
		return { start: null, end: null }
	}

	const [startValue, endValue] = value.split("_")
	if (!startValue || !endValue) {
		return { start: null, end: null }
	}

	const start = parseISO(startValue)
	const end = parseISO(endValue)

	if (!isValid(start) || !isValid(end) || isAfter(start, end)) {
		return { start: null, end: null }
	}

	return { start, end }
}

// -------------------------------------------------
// 3) The main component
// -------------------------------------------------
const DateRangePicker: React.FC<DateRangePickerProps> = ({
	monthsToShow = 2,
	dictionary, // Default to Polish
	onSearch,
	// theme = "light", // Default to light theme
	// onThemeChange,
	onCalendarToggle,
	initialStartDate,
	initialEndDate,
	initialGuests,
	initialApartments,
}) => {
	const params = useParams() as { lang?: string }
	const searchParams = useSearchParams()
	const propertyId = searchParams?.get("id")
	const [locale, setLocale] = useState<"pl" | "en" | "it" | "de" | "es">("pl")

	useEffect(() => {
		// Set locale based on URL parameter or default to 'pl'
		const lang = (params.lang as "pl" | "en" | "it" | "de" | "es") || "pl"
		setLocale(lang)
	}, [params.lang])
	// Fallback to 'pl' if lang param is not present or invalid
	const currentLocale = (["en", "pl", "it", "de", "es"].includes(params?.lang || "") ? params.lang : "pl") as "en" | "pl" | "it" | "de" | "es"
	const t = (key: keyof Omit<ITranslation, "months" | "weekdays">): string => {
		return translations[currentLocale][key]
	}

	// Translation function wrapped in useCallback
	const tR = useCallback(
		(key: keyof ITranslationR) => {
			const value = translationsR[locale as "en" | "pl" | "it" | "de" | "es"][key]
			return Array.isArray(value) ? value.join(", ") : value
		},
		[locale],
	)

	const dateRangeFromUrl = useMemo(() => parseDateRangeQuery(searchParams?.get("dateRange") ?? null), [searchParams])

	const defaultFilterDictionary: Dictionary["filters"] = {
		title: tR("filters"),
		subtitle: tR("filterProperties"),
		unselectAll: tR("reset"),
		close: tR("close"),
		matching: tR("matchingFilters"),
		filterSingular: tR("filterSingular"),
		filterPlural: tR("filterPlural"),
		selected: tR("selected"),
		places: tR("places"),
		views: tR("views"),
		amenities: tR("amenities"),
		facilities: tR("facilities"),
		accessibility: tR("accessibility"),
		appliances: tR("appliances"),
		bathroom: tR("bathroom"),
		storage: tR("storage"),
		kitchen: tR("kitchen"),
		bedroom: tR("bedroom"),
		other: tR("other"),
		apartmentSize: tR("apartmentSize" as keyof ITranslationR) ?? "Apartment size",
		personCapacity: tR("personCapacity" as keyof ITranslationR) ?? "Person capacity",
		personCapacityUnit: tR("personCapacityUnit" as keyof ITranslationR) ?? "persons",
		lastMinute: "Last Minute",
		lastMinuteOnly: "Only Last Minute Offers",
		lastMinuteDescription: "Show only properties with active last minute promotions",
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
			]).map((filter) => [filter, tR(`filter-${filter.toLowerCase()}` as keyof ITranslationR)]),
		),
	}

	// For months and weekdays, we reference them directly
	const monthsArr = translations[currentLocale].months // string[]
	const weekdaysArr = translations[currentLocale].weekdays // string[]

	// Always at least 2 months
	const finalMonthsToShow = Math.max(2, monthsToShow)

	// Defaults: today & tomorrow
	const today = startOfToday()
	const tomorrow = addDays(today, 1)

	// Real date states - use initial values if provided
	const [startDate, setStartDate] = useState<Date>(initialStartDate || today)
	const [endDate, setEndDate] = useState<Date>(initialEndDate || tomorrow)

	// Number of guests - use initial value if provided
	const [guests, setGuests] = useState<number>(initialGuests || 1)

	// Number of apartments - use initial value if provided
	const [apartments, setApartments] = useState<number>(initialApartments || 1)

	// Property name filter
	const [propertyName, setPropertyName] = useState<string>("")

	// Load property name filter from localStorage on mount
	useEffect(() => {
		if (typeof window !== "undefined") {
			const savedPropertyName = localStorage.getItem("propertyNameFilter")
			if (savedPropertyName) {
				setPropertyName(savedPropertyName)
			}
		}
	}, [])

	// Save property name filter to localStorage whenever it changes
	useEffect(() => {
		if (typeof window !== "undefined") {
			localStorage.setItem("propertyNameFilter", propertyName)
			// Dispatch custom event for same-tab communication
			window.dispatchEvent(
				new CustomEvent("localStorageChange", {
					detail: { key: "propertyNameFilter", value: propertyName },
				}),
			)
		}
	}, [propertyName])

	// Update startDate when initialStartDate prop changes
	useEffect(() => {
		if (initialStartDate) {
			setStartDate(initialStartDate)
			setStartDay(format(initialStartDate, "dd"))
			setStartMonth(format(initialStartDate, "MM"))
			setStartYear(format(initialStartDate, "yyyy"))
		}
	}, [initialStartDate])

	// Update endDate when initialEndDate prop changes
	useEffect(() => {
		if (initialEndDate) {
			setEndDate(initialEndDate)
			setEndDay(format(initialEndDate, "dd"))
			setEndMonth(format(initialEndDate, "MM"))
			setEndYear(format(initialEndDate, "yyyy"))
		}
	}, [initialEndDate])

	// Update guests when initialGuests prop changes
	useEffect(() => {
		if (initialGuests) {
			setGuests(initialGuests)
		}
	}, [initialGuests])

	// Current "view" month for the calendar
	const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(today))

	// Show/hide popup
	const [isOpen, setIsOpen] = useState(false)
	const [visibleCacheEntries, setVisibleCacheEntries] = useState<NoBedsCacheCalendarEntry[]>([])

	const cacheEntryMap = useMemo(() => new Map(visibleCacheEntries.map((entry) => [entry.date.slice(0, 10), entry])), [visibleCacheEntries])

	// Manual day–month–year fields (strings) - initialize with provided dates
	const [startDay, setStartDay] = useState(format(initialStartDate || today, "dd"))
	const [startMonth, setStartMonth] = useState(format(initialStartDate || today, "MM"))
	const [startYear, setStartYear] = useState(format(initialStartDate || today, "yyyy"))

	const [endDay, setEndDay] = useState(format(initialEndDate || tomorrow, "dd"))
	const [endMonth, setEndMonth] = useState(format(initialEndDate || tomorrow, "MM"))
	const [endYear, setEndYear] = useState(format(initialEndDate || tomorrow, "yyyy"))

	useEffect(() => {
		if (dateRangeFromUrl.start && dateRangeFromUrl.end) {
			setStartDate(dateRangeFromUrl.start)
			setEndDate(dateRangeFromUrl.end)
			setStartDay(format(dateRangeFromUrl.start, "dd"))
			setStartMonth(format(dateRangeFromUrl.start, "MM"))
			setStartYear(format(dateRangeFromUrl.start, "yyyy"))
			setEndDay(format(dateRangeFromUrl.end, "dd"))
			setEndMonth(format(dateRangeFromUrl.end, "MM"))
			setEndYear(format(dateRangeFromUrl.end, "yyyy"))
			setCurrentMonth(startOfMonth(dateRangeFromUrl.start))
		}
	}, [dateRangeFromUrl])

	// Close on outside click
	const calendarRef = useRef<HTMLDivElement>(null)
	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
				setIsOpen(false)
				// Call onCalendarToggle callback when calendar is closed by clicking outside
				if (onCalendarToggle) {
					onCalendarToggle(false)
				}
			}
		}
		document.addEventListener("mousedown", handleClickOutside)
		return () => document.removeEventListener("mousedown", handleClickOutside)
	}, [onCalendarToggle])

	// NOTE: We removed the effect that calls "onChange" automatically.
	// Now, we will call onSearch(...) only when the "Search" button is pressed.

	// Select-all on focus
	const handleFocusSelectAll = (e: FocusEvent<HTMLInputElement>) => {
		e.target.select()
	}

	// Calendar nav
	const handlePrevMonth = () => {
		setCurrentMonth((prev) => addMonths(prev, -1))
	}
	const handleNextMonth = () => {
		setCurrentMonth((prev) => addMonths(prev, 1))
	}

	const fetchVisibleCacheEntries = async (propertyId: string | null, rangeStart: Date, rangeEnd: Date) => {
		if (!propertyId) {
			return
		}

		try {
			const queryParams = new URLSearchParams({
				id: propertyId,
				startDate: format(rangeStart, "yyyy-MM-dd"),
				endDate: format(rangeEnd, "yyyy-MM-dd"),
			})

			const response = await fetch(`/api/nobeds-cache/entries?${queryParams.toString()}`)
			const data = await response.json()

			if (!response.ok) {
				console.error("Failed to load NoBeds cache entries:", data)
				return
			}

			setVisibleCacheEntries(data.entries || [])
		} catch (error) {
			console.error("Error fetching NoBeds cache entries:", error)
		}
	}

	// Build months array
	const getMonthList = () => {
		return eachMonthOfInterval({
			start: currentMonth,
			end: addMonths(currentMonth, finalMonthsToShow - 1),
		})
	}

	// 6-week matrix
	const getCalendarMatrix = (monthDate: Date) => {
		const startM = startOfMonth(monthDate)
		const dayOfWeek = (startM.getDay() + 6) % 7
		const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate()

		return Array.from({ length: 42 }, (_, i) => {
			const dayNum = i - dayOfWeek + 1
			if (dayNum < 1 || dayNum > daysInMonth) return null
			return new Date(monthDate.getFullYear(), monthDate.getMonth(), dayNum)
		})
	}

	// 2-click selection logic
	const handleDateClick = (clicked: Date) => {
		if (isBefore(clicked, today)) return // disallow
		// If we have a full range, start fresh
		if (!startDate || (startDate && endDate)) {
			setStartDate(clicked)
			setStartDay(format(clicked, "dd"))
			setStartMonth(format(clicked, "MM"))
			setStartYear(format(clicked, "yyyy"))

			// Clear end
			setEndDate(null as unknown as Date)
			setEndDay("")
			setEndMonth("")
			setEndYear("")
		} else {
			// We have start but no end
			if (isBefore(clicked, startDate)) {
				// swap
				const oldStart = clicked
				const oldEnd = startDate

				setStartDate(oldStart)
				setStartDay(format(oldStart, "dd"))
				setStartMonth(format(oldStart, "MM"))
				setStartYear(format(oldStart, "yyyy"))

				setEndDate(oldEnd)
				setEndDay(format(oldEnd, "dd"))
				setEndMonth(format(oldEnd, "MM"))
				setEndYear(format(oldEnd, "yyyy"))
			} else {
				setEndDate(clicked)
				setEndDay(format(clicked, "dd"))
				setEndMonth(format(clicked, "MM"))
				setEndYear(format(clicked, "yyyy"))
			}
			// Close after second pick
			setIsOpen(false)
			// Call onCalendarToggle callback when calendar is closed after selection
			if (onCalendarToggle) {
				onCalendarToggle(false)
			}
		}
	}

	const toggleCalendar = () => {
		if (!isOpen) {
			// If opening, jump to startDate's month
			if (startDate) {
				setCurrentMonth(startOfMonth(startDate))
			} else {
				setCurrentMonth(startOfMonth(today))
			}
		}
		const newIsOpen = !isOpen

		setIsOpen(newIsOpen)

		// Call onCalendarToggle prop if provided
		if (onCalendarToggle) {
			onCalendarToggle(newIsOpen)
		}
	}

	useEffect(() => {
		if (!isOpen || !propertyId) {
			return
		}

		const rangeStart = startOfMonth(currentMonth)
		const rangeEnd = lastDayOfMonth(addMonths(currentMonth, finalMonthsToShow - 1))
		fetchVisibleCacheEntries(propertyId, rangeStart, rangeEnd)
	}, [isOpen, currentMonth, propertyId, finalMonthsToShow])

	const monthList = getMonthList()

	/** Called only when user presses "Search" */
	const handleSearch = () => {
		if (onSearch) {
			// Create dates that will be consistent regardless of server timezone
			// We want: July 14 at 14:00 and July 17 at 09:00 regardless of timezone

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

			onSearch(arrivalUTC || null, departureUTC || null, guests, apartments, propertyName.trim() || undefined)
		}

		// Trigger property list filtering by dispatching a custom event
		// This will notify any components listening for filter changes
		window.dispatchEvent(
			new CustomEvent("propertySearchTriggered", {
				detail: {
					startDate,
					endDate,
					guests,
					apartments,
					propertyName: propertyName.trim(),
				},
			}),
		)
	}

	// Color schemes based on theme
	const colors = {
		light: {
			bg: "bg-white",
			text: "text-gray-800",
			border: "border-gray-300",
			hover: "hover:bg-gray-100",
			input: "bg-white",
			button: "bg-[#cc9678] hover:bg-[#b8856a]",
			buttonText: "text-white",
			calendarDay: "text-gray-700",
			calendarDaySelected: "bg-[#cc9678] text-white",
			calendarDayInRange: "bg-[#cc9678]/20",
			calendarDayDisabled: "text-gray-400 bg-gray-50",
			calendarBg: "bg-white",
			calendarBorder: "border-gray-200",
			calendarShadow: "shadow-lg",
			calendarText: "text-gray-800",
			calendarHeaderBg: "bg-gray-50",
			calendarDayHover: "hover:bg-[#cc9678]/10",
		},
		dark: {
			bg: "bg-gray-800",
			text: "text-gray-200",
			border: "border-gray-700",
			hover: "hover:bg-gray-700",
			input: "bg-gray-700",
			button: "bg-[#cc9678] hover:bg-[#b8856a]",
			buttonText: "text-white",
			calendarDay: "text-gray-200",
			calendarDaySelected: "bg-[#cc9678] text-white",
			calendarDayInRange: "bg-[#cc9678]/30",
			calendarDayDisabled: "text-gray-600 bg-gray-800",
			calendarBg: "bg-gray-800",
			calendarBorder: "border-gray-700",
			calendarShadow: "shadow-lg shadow-gray-900/50",
			calendarText: "text-gray-200",
			calendarHeaderBg: "bg-gray-900",
			calendarDayHover: "hover:bg-[#cc9678]/20",
		},
	}

	// Use current theme colors
	const c = colors["light"]

	return (
		<Paper elevation={1}>
			<div className="w-full pb-5">
				{/* Combined Logo, Title, Language & Theme Selector */}
				<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
					{/* Logo and Title */}
					<div className="flex items-center space-x-1">
						<a
							href="https://pms.cyberwealth.pro"
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity">
							<Image src={Logo} alt="Simplevent Logo" className="h-6 sm:h-8 w-auto" />
							<span className={`font-semibold text-xs sm:text-sm ${c.text}`}>{t("systemTitle") + " v 1.2.4"}</span>
						</a>
						<LocaleSwitcher />
					</div>
				</div>
				{/* START & END Rows - Modified for smaller screens */}
				<div className="flex flex-col gap-4">
					{/* Dates row - always horizontal on all screen sizes */}
					<div className="flex flex-row items-end justify-center gap-4">
						{/* START */}
						<div className="flex flex-col flex-1">
							<label className={`font-semibold mb-2 flex justify-center ${c.text}`}>{t("startDate")}</label>
							<button
								onClick={toggleCalendar}
								className={`w-full p-3 border ${c.border} ${c.input} ${c.text} rounded-md text-center hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors`}
								type="button">
								{startDay && startMonth && startYear ? `${startDay}/${startMonth}/${startYear}` : t("selectDate")}
							</button>
						</div>

						{/* END */}
						<div className="flex flex-col flex-1">
							<label className={`font-semibold mb-2  flex justify-center ${c.text}`}>{t("endDate")}</label>
							<button
								onClick={toggleCalendar}
								className={`w-full p-3 border ${c.border} ${c.input} ${c.text} rounded-md text-center hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors`}
								type="button">
								{endDay && endMonth && endYear ? `${endDay}/${endMonth}/${endYear}` : t("selectDate")}
							</button>
						</div>
					</div>

					{/* Guests & Apartments row */}
					<div className="flex flex-row items-end justify-center gap-4">
						<div className="flex flex-col">
							<label className={`font-semibold mb-2 ${c.text}`}>{t("guests")}</label>
							<div className="flex items-center">
								<button
									onClick={() => setGuests(Math.max(1, guests - 1))}
									className={`px-2 py-1 border ${c.border} ${c.input} ${c.text} rounded-l-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400`}
									type="button">
									-
								</button>
								<input
									type="number"
									className={`w-12 sm:w-16 border-t border-b ${c.border} ${c.input} ${c.text} p-1 text-center focus:outline-none focus:ring-2 focus:ring-blue-400`}
									value={guests}
									onFocus={handleFocusSelectAll}
									onChange={(e) => {
										const val = parseInt(e.target.value, 10)
										setGuests(Number.isNaN(val) ? 1 : val)
									}}
									min={1}
								/>
								<button
									onClick={() => setGuests(guests + 1)}
									className={`px-2 py-1 border ${c.border} ${c.input} ${c.text} rounded-r-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400`}
									type="button">
									+
								</button>
							</div>
						</div>

						{/* Apartments */}
						<div className="flex flex-col">
							<label className={`font-semibold mb-2 ${c.text}`}>{t("apartments")}</label>
							<div className="flex items-center">
								<div className="flex items-center mr-2">
									<HouseIcon className="w-5 h-5 text-gray-500" />
								</div>
								<button
									onClick={() => setApartments(Math.max(1, apartments - 1))}
									className={`px-2 py-1 border ${c.border} ${c.input} ${c.text} rounded-l-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400`}
									type="button">
									-
								</button>
								<input
									type="number"
									className={`w-12 sm:w-16 border-t border-b ${c.border} ${c.input} ${c.text} p-1 text-center focus:outline-none focus:ring-2 focus:ring-blue-400`}
									value={apartments}
									onFocus={handleFocusSelectAll}
									onChange={(e) => {
										const val = parseInt(e.target.value, 10)
										setApartments(Number.isNaN(val) ? 1 : val)
									}}
									min={1}
								/>
								<button
									onClick={() => setApartments(apartments + 1)}
									className={`px-2 py-1 border ${c.border} ${c.input} ${c.text} rounded-r-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400`}
									type="button">
									+
								</button>
							</div>
						</div>
						<button
							onClick={toggleCalendar}
							className={`inline-flex items-center px-3 py-1 border ${c.border} ${c.bg} ${c.hover} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${c.text}`}>
							<CalendarMonthIcon className="mr-2" fontSize="small" />
						</button>
					</div>
				</div>
				{/* Property Name Filter */}
				<div className="flex flex-col mt-4">
					{/* <label className={`font-semibold mb-2 ${c.text}`}>{t("propertyName")}</label> */}
					<input
						type="text"
						className={`w-full border ${c.border} ${c.input} ${c.text} rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400`}
						value={propertyName}
						onChange={(e) => setPropertyName(e.target.value)}
						placeholder={t("propertyName")}
					/>
				</div>
				{/* Guests Input + Search Button */}
				<div className="flex flex-row items-center gap-4 sm:gap-6 mt-6">
					<div className="flex-1">
						<FilterButtonSearch dictionary={dictionary || defaultFilterDictionary} className="w-full" />
					</div>
					<div className="flex-1">
						<button
							onClick={handleSearch}
							className={`w-full ${c.button} ${c.buttonText} px-4 py-2 rounded-md shadow-sm focus:ring-2 focus:ring-blue-400`}>
							{t("search")}
						</button>
					</div>
				</div>
			</div>
			{/* Popup */}
			{isOpen && (
				<div
					ref={calendarRef}
					className={`
						fixed
						left-1/2 
						top-1/2
						-translate-x-1/2 
						-translate-y-1/2
						z-50 
						w-[95vw]
						max-w-[1200px]
						${c.calendarBg}
						${c.calendarBorder} 
						border 
						rounded-lg 
						${c.calendarShadow}
						flex
						flex-col
						max-h-[90vh]
						overflow-auto
					`}
					style={{ height: "fit-content" }}>
					{/* Calendar Navigation */}
					<button
						onClick={() => {
							setIsOpen(false)
							if (onCalendarToggle) onCalendarToggle(false)
						}}
						className={`top-2 right-2 p-2 rounded-md ${c.text} bg-white border ${c.border} hover:bg-gray-100 transition-colors duration-200 shadow-sm justify-end w-full flex`}>
						<CloseIcon />
					</button>
					<div className={`sticky top-0 p-4 ${c.calendarHeaderBg} border-b ${c.calendarBorder} z-10`}>
						<div className="flex justify-between items-center">
							<button onClick={handlePrevMonth} className={`p-2 rounded-md ${c.text} ${c.calendarDayHover} transition-colors duration-200`}>
								{t("prev")}
							</button>
							<button onClick={handleNextMonth} className={`p-2 rounded-md ${c.text} ${c.calendarDayHover} transition-colors duration-200`}>
								{t("next")}
							</button>
						</div>
					</div>

					{/* Calendar Grid */}
					<div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-min">
						{monthList.map((monthDate, idx) => {
							const days = getCalendarMatrix(monthDate)
							const monthLabel = `${monthsArr[monthDate.getMonth()]} ${monthDate.getFullYear()}`

							return (
								<div key={idx} className="min-w-[250px]">
									<div className={`text-center font-semibold mb-2 ${c.calendarText}`}>{monthLabel}</div>
									<div className={`grid grid-cols-7 text-center text-sm ${c.text} mb-1`}>
										{weekdaysArr.map((day) => (
											<div key={day} className="p-1">
												{day}
											</div>
										))}
									</div>
									<div className="grid grid-cols-7 gap-1">
										{days.map((date, i) => {
											if (!date) return <div key={i} className="p-2" />

											const disabled = isBefore(date, today)
											const isStart = isSameDay(date, startDate)
											const isEnd = endDate && isSameDay(date, endDate)
											const inRange = endDate && isAfter(date, startDate) && isBefore(date, endDate)
											const dateKey = format(date, "yyyy-MM-dd")
											const cacheEntry = cacheEntryMap.get(dateKey)
											const isSoldOut = !disabled && cacheEntry?.quantity === 0
											const hasAvailableQuantity = !disabled && cacheEntry?.quantity != null && cacheEntry.quantity > 0
											return (
												<button
													key={i}
													disabled={disabled || isSoldOut}
													onClick={() => handleDateClick(date)}
													className={clsx(
														"p-2 rounded-md transition-colors duration-200",
														isSoldOut || disabled ? c.calendarDayDisabled : c.calendarText,
														!disabled && !isSoldOut && c.calendarDayHover,
														(isStart || isEnd) && c.calendarDaySelected,
														inRange && c.calendarDayInRange,
														hasAvailableQuantity && "border-2 border-emerald-400",
														isSoldOut && "cursor-not-allowed",
													)}>
													<div className="flex flex-col items-center gap-[2px]">
														<span className={clsx(isSoldOut ? "text-gray-300" : "")}>{format(date, "d")}</span>
														{cacheEntry?.price != null && !disabled && (
															<>
																<span
																	className={clsx(
																		"text-sm font-semibold leading-none",
																		hasAvailableQuantity ? "text-green-600" : "text-gray-300",
																	)}>
																	{Math.round(cacheEntry.price)}
																</span>
																<span
																	className={clsx(
																		"text-[10px] uppercase tracking-[0.15em]",
																		hasAvailableQuantity ? "text-green-600" : "text-gray-300",
																	)}>
																	PLN
																</span>
															</>
														)}
														{/* {cacheEntry?.dirty && <span className="text-[10px] text-red-500">dirty</span>} */}
													</div>
												</button>
											)
										})}
									</div>
								</div>
							)
						})}
					</div>
				</div>
			)}
		</Paper>
	)
}

export default DateRangePicker
