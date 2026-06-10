/** @format */

import { differenceInDays, format } from "date-fns"
import React, { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "@/state/store"
import { setServices, setNotification } from "@/state/action-creators"
import defaultImg from "@/public/images/apartment-default-small.jpg"
import { resetHours } from "@/utilities/functions/calendar"
import { ReservationForProperty } from "./PropertyList"
import {
	Box,
	Container,
	IconButton,
	Paper,
	Typography,
	createTheme,
	ThemeProvider,
	Collapse,
	TextField,
	Button,
	Checkbox,
	Radio,
	RadioGroup,
	FormControlLabel,
} from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import RemoveIcon from "@mui/icons-material/Remove"
import { getPersonAdjustedPrice, hasPersonBasedPricing } from "@/utilities/functions/pricing/personBasedPricing"
import { calculateDiscountedPrice, DiscountData } from "@/utilities/functions/pricing/discountPricing"
import { JsonValue } from "@prisma/client/runtime/library"
import { ExtendedData } from "@/types"
import { formatCurrency } from "@/utilities/functions/payments/currencyFormat"

interface PersonBasedPricing {
	id: number
	propertyId: number
	basePersonCount: number
	adjustments: JsonValue
	createdAt: Date
	updatedAt: Date
}

interface PropertyWithPricing {
	personBasedPricings?: PersonBasedPricing[]
}

interface ITranslation {
	summary: string
	podsuma: string
	stay: string
	length: string
	additionalServices: string
	parking: string
	garage: string
	guestsAssigned: string
	cleaning: string
	localTax: string
	total: string
	free: string
	cleaningDiscount: string
	payment_option: string
	thirty_percent_upfront: string
	hundred_percent_upfront: string
	non_refundable_offer: string
	option_cost: string
	priceBreakdown: string
	basePrice: string
	offerDiscount: string
	offerApplied: string
	cleaningFee: string
	cityTax: string
	pets: string
	breakfast: string
	breakfastNote: string
	babyCrib: string
	babyBedLinen: string
	discountCode: {
		title: string
		label: string
		placeholder: string
		apply: string
		priceBreakdown: string
		basePrice: string
		offerDiscount: string
		offerApplied: string
		discount: string
		cleaningFee: string
		cityTax: string
		parking: string
		pets: string
		breakfast: string
		babyCrib: string
		babyBedLinen: string
		total: string
		errors: {
			requiredFields: string
			invalidCode: string
			codeUsed: string
			notValidForProperty: string
			validationFailed: string
		}
	}
}

const translations: Record<"en" | "pl" | "it" | "de", ITranslation> = {
	en: {
		summary: "Summary",
		podsuma: "Summary",
		stay: "Stay",
		length: "Length",
		additionalServices: "Additional Services",
		parking: "Parking",
		garage: "Garage",
		guestsAssigned: "Guests Assigned",
		cleaning: "Reservation fee",
		localTax: "Local Tax",
		total: "Total",
		free: "FREE",
		cleaningDiscount: "Long stay discount applied",
		payment_option: "Payment Option",
		thirty_percent_upfront: "30% upfront",
		hundred_percent_upfront: "100% upfront",
		non_refundable_offer: "Non-refundable offer",
		option_cost: "option cost + 5%",
		priceBreakdown: "Price Breakdown",
		basePrice: "Base Price",
		offerDiscount: "Offer Discount",
		offerApplied: "Offer discount applied",
		cleaningFee: "Service Fee",
		cityTax: "City Tax",
		pets: "Pets",
		breakfast: "Breakfast",
		breakfastNote: "Please specify in the notes how many breakfasts on which days you need",
		babyCrib: "Baby Crib",
		babyBedLinen: "Baby Bed Linen",
		discountCode: {
			title: "Discount Code",
			label: "Enter discount code",
			placeholder: "SUMMER2024",
			apply: "Apply",
			priceBreakdown: "Price Breakdown",
			basePrice: "Base Price",
			offerDiscount: "Offer Discount",
			offerApplied: "Discount code applied",
			discount: "Discount",
			cleaningFee: "Service Fee",
			cityTax: "City Tax",
			parking: "Parking",
			pets: "Pets",
			breakfast: "Breakfast",
			babyCrib: "Baby Crib",
			babyBedLinen: "Baby Bed Linen",
			total: "Total",
			errors: {
				requiredFields: "Code and property information are required",
				invalidCode: "Invalid discount code",
				codeUsed: "Code already used",
				notValidForProperty: "Code not valid for this property",
				validationFailed: "Failed to validate discount code",
			},
		},
	},
	pl: {
		summary: "Podsumowanie",
		podsuma: "Podsuma",
		stay: "Pobyt",
		length: "Długość",
		additionalServices: "Dodatkowe usługi",
		parking: "Parking",
		garage: "Garaż",
		guestsAssigned: "Przypisani goście",
		cleaning: "Opłata rezerwacyjna",
		localTax: "Opłata miejscowa",
		total: "Razem",
		free: "ZA DARMO",
		cleaningDiscount: "Zniżka za długi pobyt",
		payment_option: "Opcja płatności",
		thirty_percent_upfront: "30% przedpłaty - zadatek",
		hundred_percent_upfront: "100% zapłaty",
		non_refundable_offer: "oferta bezzwrotna",
		option_cost: "koszt opcji + 5%",
		priceBreakdown: "Podsumowanie",
		basePrice: "Cena podstawowa",
		offerDiscount: "Zniżka oferty",
		offerApplied: "Zastosowano zniżkę z oferty",
		cleaningFee: "Opłata Rezerwacyjna",
		cityTax: "Podatek miejski",
		pets: "Zwierzęta",
		breakfast: "Śniadanie",
		breakfastNote: "Proszę wpisać w uwagach, ile śniadań w jakie dni Państwo potrzebują",
		babyCrib: "Łóżeczko dla dziecka",
		babyBedLinen: "Pościel dla dziecka",
		discountCode: {
			title: "Kod rabatowy",
			label: "Wprowadź kod rabatowy",
			placeholder: "SUMMER2024",
			apply: "Zastosuj",
			priceBreakdown: "Podsumowanie",
			basePrice: "Cena podstawowa",
			offerDiscount: "Rabat z oferty",
			offerApplied: "Zastosowano rabat z kodu",
			discount: "Rabat",
			cleaningFee: "Opłata rezerwacyjna",
			cityTax: "Podatek miejski",
			parking: "Parking",
			pets: "Zwierzęta",
			breakfast: "Śniadanie",
			babyCrib: "Łóżeczko dla dziecka",
			babyBedLinen: "Pościel dla dziecka",
			total: "Razem",
			errors: {
				requiredFields: "Kod i informacje o nieruchomości są wymagane",
				invalidCode: "Nieprawidłowy kod rabatowy",
				codeUsed: "Kod został już wykorzystany",
				notValidForProperty: "Kod nie jest ważny dla tej nieruchomości",
				validationFailed: "Nie udało się zweryfikować kodu rabatowego",
			},
		},
	},
	it: {
		summary: "Riepilogo",
		podsuma: "Riepilogo",
		stay: "Soggiorno",
		length: "Durata",
		additionalServices: "Servizi Aggiuntivi",
		parking: "Parcheggio",
		garage: "Garage",
		guestsAssigned: "Ospiti Assegnati",
		cleaning: "Tariffa di riservazione",
		localTax: "Tassa di Soggiorno",
		total: "Totale",
		free: "GRATIS",
		cleaningDiscount: "Sconto applicato per soggiorno lungo",
		payment_option: "Opzione di pagamento",
		thirty_percent_upfront: "30% anticipo",
		hundred_percent_upfront: "100% anticipo",
		non_refundable_offer: "Offerta non rimborsabile",
		option_cost: "costo opzione + 5%",
		priceBreakdown: "Suddivisione prezzi",
		basePrice: "Prezzo base",
		offerDiscount: "Sconto offerta",
		offerApplied: "Sconto offerta applicato",
		cleaningFee: "Tariffa di servizio",
		cityTax: "Tassa comunale",
		pets: "Animali",
		breakfast: "Colazione",
		breakfastNote: "Si prega di specificare nelle note quanti colazioni in quali giorni sono necessari",
		babyCrib: "Culla per bambino",
		babyBedLinen: "Biancheria da letto per bambino",
		discountCode: {
			title: "Codice sconto",
			label: "Inserisci codice sconto",
			placeholder: "SUMMER2024",
			apply: "Applica",
			priceBreakdown: "Suddivisione prezzi",
			basePrice: "Prezzo base",
			offerDiscount: "Sconto offerta",
			offerApplied: "Codice sconto applicato",
			discount: "Sconto",
			cleaningFee: "Tariffa di servizio",
			cityTax: "Tassa comunale",
			parking: "Parcheggio",
			pets: "Animali",
			breakfast: "Colazione",
			babyCrib: "Culla per bambino",
			babyBedLinen: "Biancheria da letto per bambino",
			total: "Totale",
			errors: {
				requiredFields: "Codice e informazioni proprietà richieste",
				invalidCode: "Codice sconto non valido",
				codeUsed: "Codice già utilizzato",
				notValidForProperty: "Codice non valido per questa proprietà",
				validationFailed: "Impossibile convalidare codice sconto",
			},
		},
	},
	de: {
		summary: "Zusammenfassung",
		podsuma: "Zusammenfassung",
		stay: "Aufenthalt",
		length: "Dauer",
		additionalServices: "Zusätzliche Dienstleistungen",
		parking: "Parken",
		garage: "Garage",
		guestsAssigned: "Zugewiesene Gäste",
		cleaning: "Servicegebühr",
		localTax: "Ortstaxe",
		total: "Gesamt",
		free: "KOSTENLOS",
		cleaningDiscount: "Rabatt für längeren Aufenthalt angewendet",
		payment_option: "Zahlungsoption",
		thirty_percent_upfront: "30% im Voraus",
		hundred_percent_upfront: "100% im Voraus",
		non_refundable_offer: "Nicht erstattbare Offerte",
		option_cost: "Optionskosten + 5%",
		priceBreakdown: "Preisaufteilung",
		basePrice: "Grundpreis",
		offerDiscount: "Angebotsrabatt",
		offerApplied: "Angebotsrabatt angewendet",
		cleaningFee: "Servicegebühr",
		cityTax: "Stadtsteuer",
		pets: "Haustiere",
		breakfast: "Frühstück",
		breakfastNote: "Bitte geben Sie in den Notizen an, wie viele Frühstücke an welchen Tagen Sie benötigen",
		babyCrib: "Babybett",
		babyBedLinen: "Babybettwäsche",
		discountCode: {
			title: "Rabattcode",
			label: "Rabattcode eingeben",
			placeholder: "SUMMER2024",
			apply: "Anwenden",
			priceBreakdown: "Preisaufschlüsselung",
			basePrice: "Grundpreis",
			offerDiscount: "Angebotsrabatt",
			offerApplied: "Rabattcode angewendet",
			discount: "Rabatt",
			cleaningFee: "Servicegebühr",
			cityTax: "Stadtsteuer",
			parking: "Parkplatz",
			pets: "Haustiere",
			breakfast: "Frühstück",
			babyCrib: "Babybett",
			babyBedLinen: "Babybettwäsche",
			total: "Gesamt",
			errors: {
				requiredFields: "Code und Immobilieninformationen sind erforderlich",
				invalidCode: "Ungültiger Rabattcode",
				codeUsed: "Code bereits verwendet",
				notValidForProperty: "Code nicht gültig für diese Immobilie",
				validationFailed: "Rabattcode konnte nicht validiert werden",
			},
		},
	},
}

import { OfferData } from "./ReservationForm"

type Props = {
	arrivalDate: Date
	departureDate: Date
	guests: number
	theme?: "light" | "dark"
	locale: "en" | "pl" | "it" | "de"
	offerData?: OfferData
}

const AdditionalServices: React.FC<Props> = ({ arrivalDate, departureDate, guests, theme = "light", locale, offerData }) => {
	const dispatch = useDispatch()

	const t = (key: string): string => {
		const keys = key.split(".")
		let value: unknown = translations[locale]
		for (const k of keys) {
			const obj = value as Record<string, unknown>
			value = obj?.[k]
		}
		return value as string
	}

	const servicesState = useSelector((state: RootState) => state.root.services)
	const roomsSelected: ReservationForProperty[] = useSelector((state: RootState) => state.root.propertiesSelectedToRent)
	const [reservationsWithParking, setReservationsWithParking] = useState<ReservationForProperty[]>([])
	const [totalPrice, setTotalPrice] = useState(0)
	const [parkingTotal, setParkingTotal] = useState(0)
	const [petsTotal, setPetsTotal] = useState(0)
	const [breakfastTotal, setBreakfastTotal] = useState(0)
	const [babyCribTotal, setBabyCribTotal] = useState(0)
	const [babyBedLinenTotal, setBabyBedLinenTotal] = useState(0)
	const [totalPriceOnline, setTotalPriceOnline] = useState(0)
	const [remainingGuests, setRemainingGuests] = useState(guests)
	const [paymentOption, setPaymentOption] = useState<"30" | "100">("100")
	const [totalCleaningFee, setTotalCleaningFee] = useState(0)
	const [totalCityTax, setTotalCityTax] = useState(0)

	const MAX_BABY_CRIB = 2
	const [discountCode, setDiscountCode] = useState("")
	const [discountData, setDiscountData] = useState<DiscountData | null>(null)
	const [discountCodeExpanded, setDiscountCodeExpanded] = useState(false)
	const [validatingCode, setValidatingCode] = useState(false)
	const [discountTotal, setDiscountTotal] = useState(0)
	const [currentTotalPrice, setCurrentTotalPrice] = useState(0)
	const numberOfNights = differenceInDays(resetHours(departureDate), resetHours(arrivalDate))

	const prevGuestsAssignedRef = useRef(0)
	const prevReservationsRef = useRef<ReservationForProperty[]>([])
	const processedRef = useRef(false)
	const syncingFromServicesRef = useRef(false)
	const lastSyncedServicesReservationsRef = useRef<ReservationForProperty[] | null>(null)

	const haveSameReservationIds = (current?: ReservationForProperty[] | null, next?: ReservationForProperty[]) => {
		if (!current || !next) return false
		if (current.length !== next.length) return false
		const currentIds = current.map((item) => String(item.id)).sort()
		const nextIds = next.map((item) => String(item.id)).sort()
		return currentIds.every((id, index) => id === nextIds[index])
	}

	const calculateTotalPrice = useCallback(
		(propertiesArr: ReservationForProperty[]) => {
			const servicesTotal = propertiesArr.reduce((acc, prop) => {
				const parkingPrice = prop.parkingFee || 0
				return (
					acc +
					(prop.parkingQuantity || 0) * parkingPrice +
					(prop.petsQuantity || 0) * ((prop.extended as ExtendedData)?.petFee || 0) +
					(prop.breakfastQuantity || 0) * ((prop.extended as ExtendedData)?.breakfastFee || 0) +
					(prop.babyCribQuantity || 0) * ((prop.extended as ExtendedData)?.babyCribFee || 0) +
					(prop.babyBedLinen ? (prop.babyCribQuantity || 0) * 50 : 0)
				)
			}, 0)
			const parkingTotal = propertiesArr.reduce((acc, prop) => {
				const parkingPrice = prop.parkingFee || 0
				return acc + (prop.parkingQuantity * parkingPrice || 0)
			}, 0)

			const petsTotal = propertiesArr.reduce((acc, prop) => acc + (prop.petsQuantity || 0) * ((prop.extended as ExtendedData)?.petFee || 0), 0)

			const breakfastTotal = propertiesArr.reduce(
				(acc, prop) => acc + (prop.breakfastQuantity || 0) * ((prop.extended as ExtendedData)?.breakfastFee || 0),
				0,
			)

			const babyCribTotal = propertiesArr.reduce(
				(acc, prop) => acc + (prop.babyCribQuantity || 0) * ((prop.extended as ExtendedData)?.babyCribFee || 0),
				0,
			)

			const babyBedLinenTotal = propertiesArr.reduce((acc, prop) => acc + (prop.babyBedLinen ? (prop.babyCribQuantity || 0) * 50 : 0), 0)

			// Calculate aggregated cleaning fee, city tax, and base price separately
			let totalCleaningFee = 0
			let totalCityTax = 0
			let totalBasePrice = 0

			propertiesArr.forEach((prop) => {
				let cleaningFee = prop.cleaningFee || 0

				if (prop.cleaningFeeDays && numberOfNights >= prop.cleaningFeeDays) {
					cleaningFee = 0
				}

				// Always include the property base price in total calculation
				const propertyBasePrice = prop.totalPrice || 0

				// Apply person-based pricing adjustment if configured
				const adjustedBasePrice = hasPersonBasedPricing(prop as PropertyWithPricing)
					? getPersonAdjustedPrice(prop as PropertyWithPricing, prop.guestsAssigned || guests, propertyBasePrice)
					: propertyBasePrice

				// Accumulate base price, cleaning fee and city tax separately
				totalBasePrice += adjustedBasePrice
				totalCleaningFee += cleaningFee
				const guestsAssignedForTax = prop.guestsAssigned || 0
				totalCityTax += (prop.localTax || 0) * guestsAssignedForTax * numberOfNights
			})

			// Apply offer discounts
			let offerDiscountTotal = 0
			if (offerData && offerData.offerProperties) {
				propertiesArr.forEach((prop) => {
					const offerProperty = offerData.offerProperties.find((op) => op.property.id === prop.id)
					if (offerProperty) {
						// Use the offer's discount amount directly
						offerDiscountTotal += offerProperty.originalPrice - offerProperty.price
					}
				})
			}

			// Apply discount code if available (only to base price)
			let discountTotal = 0
			if (discountData) {
				// Only apply discount to base price after offer discounts
				const basePriceAfterOffer = totalBasePrice - offerDiscountTotal
				const priceBreakdown = calculateDiscountedPrice(basePriceAfterOffer, 0, 0, discountData)
				discountTotal = priceBreakdown.discountAmount
			}

			// Calculate total: base price + cleaning + city tax + services - offer discounts - code discounts
			const currentTotalPrice = totalBasePrice + totalCleaningFee + totalCityTax + servicesTotal - offerDiscountTotal - discountTotal

			setDiscountTotal(discountTotal)
			setCurrentTotalPrice(currentTotalPrice)

			const finalTotalPrice = currentTotalPrice

			setTotalPrice(finalTotalPrice)
			setParkingTotal(parkingTotal)
			setPetsTotal(petsTotal)
			setBreakfastTotal(breakfastTotal)
			setBabyCribTotal(babyCribTotal)
			setBabyBedLinenTotal(babyBedLinenTotal)

			setTotalCleaningFee(totalCleaningFee)
			setTotalCityTax(totalCityTax)

			let calculatedOnlineTotal = 0
			if (paymentOption === "30") {
				// For 30% upfront, online payment is 30% of total price (including 5% increase)
				calculatedOnlineTotal = currentTotalPrice * 1.05 * 0.3
			} else {
				// For 100% upfront, calculate based on properties that support online payment
				propertiesArr.forEach((prop) => {
					if (prop.paymentsOn) {
						const basePriceForOnline = prop.totalPrice || 0

						// Apply person-based pricing adjustment for online payment calculation
						const adjustedBasePriceForOnline = hasPersonBasedPricing(prop as PropertyWithPricing)
							? getPersonAdjustedPrice(prop as PropertyWithPricing, prop.guestsAssigned || guests, basePriceForOnline)
							: basePriceForOnline

						let cleaningFeeForOnline = prop.cleaningFee || 0
						if (prop.cleaningFeeDays && numberOfNights >= prop.cleaningFeeDays) {
							cleaningFeeForOnline = 0
						}

						const parkingPriceForOnline = prop.parkingFee || 0
						const guestsAssignedForOnlineTax = prop.guestsAssigned || 0
						const cityTaxForOnline = (prop.localTax || 0) * guestsAssignedForOnlineTax * numberOfNights
						const parkingQuantityForOnline = prop.parkingQuantity || 0
						const petsQuantityForOnline = prop.petsQuantity || 0
						const breakfastQuantityForOnline = prop.breakfastQuantity || 0
						const babyCribQuantityForOnline = prop.babyCribQuantity || 0
						const babyBedLinenForOnline = prop.babyBedLinen ? babyCribQuantityForOnline * 50 : 0
						const servicesForOnlineProp =
							parkingQuantityForOnline * parkingPriceForOnline +
							cityTaxForOnline +
							petsQuantityForOnline * ((prop.extended as ExtendedData)?.petFee || 0) +
							breakfastQuantityForOnline * ((prop.extended as ExtendedData)?.breakfastFee || 0) +
							babyCribQuantityForOnline * ((prop.extended as ExtendedData)?.babyCribFee || 0) +
							babyBedLinenForOnline

						// Apply offer discount for online payment calculation
						let offerDiscountForOnline = 0
						if (offerData && offerData.offerProperties) {
							const offerProperty = offerData.offerProperties.find((op) => op.property.id === prop.id)
							if (offerProperty) {
								offerDiscountForOnline = offerProperty.originalPrice - offerProperty.price
							}
						}

						calculatedOnlineTotal += adjustedBasePriceForOnline + cleaningFeeForOnline + servicesForOnlineProp - offerDiscountForOnline
					}
				})
			}

			// Apply discount code proportionally to online total
			if (discountData && currentTotalPrice > 0) {
				const onlineProportion = calculatedOnlineTotal / currentTotalPrice
				calculatedOnlineTotal -= discountTotal * onlineProportion
			}

			setTotalPriceOnline(calculatedOnlineTotal)
		},
		[numberOfNights, guests, paymentOption, offerData, discountData],
	)

	const handleQuantityChange = useCallback(
		(index: number, change: number) => {
			setReservationsWithParking((prevReservations) => {
				const updatedReservations = prevReservations.map((reservation, i) => {
					if (i === index) {
						// Use the original parkingQuantity as the max (from initial reservation)
						const maxParking = roomsSelected[i]?.parkingQuantity ?? 10
						return {
							...reservation,
							parkingQuantity: Math.max(0, Math.min(reservation.parkingQuantity + change, maxParking)),
						}
					}
					return reservation
				})
				calculateTotalPrice(updatedReservations)
				return updatedReservations
			})
		},
		[calculateTotalPrice, roomsSelected],
	)

	const handlePetsQuantityChange = useCallback(
		(index: number, change: number) => {
			setReservationsWithParking((prevReservations) => {
				const updatedReservations = prevReservations.map((reservation, i) => {
					if (i === index) {
						// Use the original petsMax as the max (from initial reservation)
						const maxPets = (roomsSelected[i]?.extended as ExtendedData)?.petsMax ?? 10
						const newPetsQuantity = Math.max(0, Math.min(reservation.petsQuantity + change, maxPets))
						const petFee = (roomsSelected[i]?.extended as ExtendedData)?.petFee || 0
						return {
							...reservation,
							petsQuantity: newPetsQuantity,
							petsPrice: newPetsQuantity * petFee,
						}
					}
					return reservation
				})

				calculateTotalPrice(updatedReservations)
				return updatedReservations
			})
		},
		[calculateTotalPrice, roomsSelected],
	)

	const handleBreakfastQuantityChange = useCallback(
		(index: number, change: number) => {
			setReservationsWithParking((prevReservations) => {
				const updatedReservations = prevReservations.map((reservation, i) => {
					if (i === index) {
						// Breakfast can be up to the number of guests assigned times number of nights
						const maxBreakfast = (reservation.guestsAssigned || 0) * numberOfNights
						return {
							...reservation,
							breakfastQuantity: Math.max(0, Math.min(reservation.breakfastQuantity + change, maxBreakfast)),
						}
					}
					return reservation
				})

				calculateTotalPrice(updatedReservations)
				return updatedReservations
			})
		},
		[calculateTotalPrice, numberOfNights],
	)

	const handleBabyCribQuantityChange = useCallback(
		(index: number, change: number) => {
			setReservationsWithParking((prevReservations) => {
				const updatedReservations = prevReservations.map((reservation, i) => {
					if (i === index) {
						// Baby crib can be 0 to MAX_BABY_CRIB
						return {
							...reservation,
							babyCribQuantity: Math.min(MAX_BABY_CRIB, Math.max(0, reservation.babyCribQuantity + change)),
						}
					}
					return reservation
				})

				calculateTotalPrice(updatedReservations)
				return updatedReservations
			})
		},
		[calculateTotalPrice],
	)

	const handleBabyBedLinenChange = useCallback(
		(index: number, checked: boolean) => {
			setReservationsWithParking((prevReservations) => {
				const updatedReservations = prevReservations.map((reservation, i) => {
					if (i === index) {
						return {
							...reservation,
							babyBedLinen: checked,
							babyBedLinenQuantity: checked ? reservation.babyCribQuantity || 0 : 0,
						}
					}
					return reservation
				})

				calculateTotalPrice(updatedReservations)
				return updatedReservations
			})
		},
		[calculateTotalPrice],
	)

	const validateDiscountCode = async (code: string) => {
		if (!code.trim()) {
			setDiscountData(null)
			return
		}

		setValidatingCode(true)
		try {
			// Get property IDs from selected properties
			const selectedPropertyIds = reservationsWithParking.map((property) => property.id)

			const response = await fetch("/api/discount-codes/validate", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					code: code.toUpperCase(),
					propertyIds: selectedPropertyIds,
					checkInDate: arrivalDate?.toISOString(),
					checkOutDate: departureDate?.toISOString(),
				}),
			})

			const data = await response.json()

			if (data.valid) {
				setDiscountData({
					discountType: data.discountType,
					discountValue: data.discountValue,
					campaignId: data.campaignId,
					codeId: data.codeId,
				})
			} else {
				setDiscountData(null)
				// Map API error messages to translated dictionary keys
				let errorMessage = t("discountCode.errors.invalidCode")
				if (data.error) {
					if (data.error.includes("Code already used")) {
						errorMessage = t("discountCode.errors.codeUsed")
					} else if (data.error.includes("Code not valid for this property")) {
						errorMessage = t("discountCode.errors.notValidForProperty")
					} else if (data.error.includes("Code and propertyId") || data.error.includes("Code and propertyId(s) are required")) {
						errorMessage = t("discountCode.errors.requiredFields")
					} else if (data.error.includes("Failed to validate discount code")) {
						errorMessage = t("discountCode.errors.validationFailed")
					}
				}
				dispatch(
					setNotification({
						severity: "error",
						message: errorMessage,
						open: true,
					}),
				)
			}
		} catch (error) {
			console.error("Error validating discount code:", error)
			setDiscountData(null)
			dispatch(
				setNotification({
					severity: "error",
					message: "Failed to validate discount code",
					open: true,
				}),
			)
		} finally {
			setValidatingCode(false)
		}
	}

	const handleGuestsAssignedChange = useCallback(
		(index: number, change: number) => {
			setReservationsWithParking((prevReservations) => {
				const updatedReservations = prevReservations.map((property, i) => {
					if (i === index) {
						// Use the original maxOccupancy as the max (from initial reservation)
						const maxOccupancy = roomsSelected[i]?.maxOccupancy ?? property.maxOccupancy ?? 10
						const currentGuests = property.guestsAssigned || 0
						const newGuestsAssigned = Math.max(0, Math.min(currentGuests + change, maxOccupancy))

						// Additional check: don't allow assigning more guests than the total requested guests
						const currentTotalAssigned = prevReservations.reduce((acc, res, idx) => {
							if (idx === i) {
								return acc + newGuestsAssigned
							}
							return acc + (res.guestsAssigned || 0)
						}, 0)

						const finalGuestsAssigned = currentTotalAssigned > guests ? currentGuests : newGuestsAssigned

						const localTaxSum = (property.localTax || 0) * numberOfNights * finalGuestsAssigned
						return {
							...property,
							guestsAssigned: finalGuestsAssigned,
							localTaxSum: localTaxSum,
						}
					}
					return property
				})
				calculateTotalPrice(updatedReservations)
				return updatedReservations
			})
		},
		[calculateTotalPrice, numberOfNights, roomsSelected, guests],
	)

	useEffect(() => {
		if (!servicesState.reservations?.length) return
		if (haveSameReservationIds(lastSyncedServicesReservationsRef.current, servicesState.reservations)) return

		syncingFromServicesRef.current = true
		setReservationsWithParking(servicesState.reservations)
		setTotalPrice(servicesState.totalPrice)
		lastSyncedServicesReservationsRef.current = servicesState.reservations
	}, [servicesState?.reservations, servicesState?.totalPrice])

	useEffect(() => {
		if (servicesState.reservations?.length > 0) return
		if (arrivalDate && departureDate && roomsSelected.length > 0 && reservationsWithParking.length === 0) {
			let remainingGuestsToAssign = guests
			const initialReservationsWithParking = roomsSelected.map((property) => {
				const guestsToAssign = Math.min(property.maxOccupancy, remainingGuestsToAssign)
				remainingGuestsToAssign -= guestsToAssign

				return {
					...property,
					localTaxSum: (property.localTax || 0) * numberOfNights * guestsToAssign,
					guestsAssigned: guestsToAssign,
					parkingQuantity: 0,
				}
			})

			setReservationsWithParking(initialReservationsWithParking)
			calculateTotalPrice(initialReservationsWithParking)
			processedRef.current = true
		}
	}, [roomsSelected, servicesState?.reservations, arrivalDate, departureDate, guests, numberOfNights, calculateTotalPrice, reservationsWithParking.length])

	useEffect(() => {
		const currentTotalGuestsAssigned = reservationsWithParking.reduce((acc, reservation) => acc + (reservation.guestsAssigned || 0), 0)

		if (currentTotalGuestsAssigned !== prevGuestsAssignedRef.current) {
			const remaining = guests - currentTotalGuestsAssigned
			setRemainingGuests(remaining)
			prevGuestsAssignedRef.current = currentTotalGuestsAssigned
		}

		// Dispatch logic should run if the effect is triggered by changes in its dependencies (reservationsWithParking, totalPrice, totalPriceOnline)
		const reservationsString = JSON.stringify(reservationsWithParking)
		const prevReservationsString = JSON.stringify(prevReservationsRef.current)

		// We dispatch if reservations have changed string-wise, or if not, we still dispatch current prices
		// because totalPrice or totalPriceOnline (effect dependencies) might have changed.
		if (syncingFromServicesRef.current) {
			syncingFromServicesRef.current = false
			prevReservationsRef.current = reservationsWithParking
			return
		}

		if (reservationsString !== prevReservationsString) {
			// Calculate total breakfast quantity for parsedRemarks and notes
			const totalBreakfastQuantity = reservationsWithParking.reduce((acc, prop) => acc + (prop.breakfastQuantity || 0), 0)
			const totalPetsQuantity = reservationsWithParking.reduce((acc, prop) => acc + (prop.petsQuantity || 0), 0)
			const totalBabyCribQuantity = reservationsWithParking.reduce((acc, prop) => acc + (prop.babyCribQuantity || 0), 0)
			let breakfastNotes = ""
			let petsNotes = ""
			let babyCribNotes = ""

			if (totalBreakfastQuantity > 0) {
				const breakfastTotalPrice = reservationsWithParking.reduce(
					(acc, prop) => acc + (prop.breakfastQuantity || 0) * ((prop.extended as ExtendedData)?.breakfastFee || 0),
					0,
				)
				breakfastNotes = `Śniadanie: ${totalBreakfastQuantity} porcji, Razem: ${formatCurrency(breakfastTotalPrice, reservationsWithParking[0]?.currency || "PLN")}`
			}

			if (totalPetsQuantity > 0) {
				const petsTotalPrice = reservationsWithParking.reduce(
					(acc, prop) => acc + (prop.petsQuantity || 0) * ((prop.extended as ExtendedData)?.petFee || 0),
					0,
				)
				petsNotes = `Zwierzęta: ${totalPetsQuantity} sztuk, Razem: ${formatCurrency(petsTotalPrice, reservationsWithParking[0]?.currency || "PLN")}`
			}

			if (totalBabyCribQuantity > 0) {
				const babyCribTotalPrice = reservationsWithParking.reduce(
					(acc, prop) => acc + (prop.babyCribQuantity || 0) * ((prop.extended as ExtendedData)?.babyCribFee || 100),
					0,
				)
				const totalBabyBedLinenQuantity = reservationsWithParking.reduce((acc, prop) => acc + (prop.babyBedLinen ? prop.babyCribQuantity || 0 : 0), 0)
				const babyBedLinenTotalPrice = totalBabyBedLinenQuantity * 50
				babyCribNotes = `Łóżeczka dla dzieci: ${totalBabyCribQuantity} sztuk, Razem: ${formatCurrency(babyCribTotalPrice, reservationsWithParking[0]?.currency || "PLN")}`
				if (totalBabyBedLinenQuantity > 0) {
					babyCribNotes += `, Pościel dla dzieci: ${totalBabyBedLinenQuantity} kompletów, Razem: ${formatCurrency(babyBedLinenTotalPrice, reservationsWithParking[0]?.currency || "PLN")}`
				}
			}

			// Combine all notes
			const combinedNotes = [breakfastNotes, petsNotes, babyCribNotes].filter((note) => note).join("\n")

			dispatch(
				setServices({
					reservations: [...reservationsWithParking],
					totalPrice: paymentOption === "30" ? totalPrice * 1.05 : totalPrice,
					totalPriceOnline,
					remainingGuests,
					parkingTotal,
					cleaningFee: totalCleaningFee,
					cityTax: totalCityTax,
					petsTotal,
					breakfastTotal,
					babyCribTotal,
					babyBedLinenTotal,
					paymentOption,
					discountData,
					discountTotal,
					currentTotalPrice,
					parsedRemarks: {
						...(totalBreakfastQuantity > 0 ? { withBreakfast: true } : {}),
						...(totalPetsQuantity > 0 ? { withPets: true } : {}),
						...(totalBabyCribQuantity > 0 ? { extraBedRequested: true } : {}),
					},
					notes: combinedNotes,
				}),
			)
			prevReservationsRef.current = reservationsWithParking
		} else {
			// If reservations string is the same, but the effect is running, it means totalPrice or totalPriceOnline likely changed.
			// Dispatch current prices with the (string-wise) unchanged reservations.
			const totalBreakfastQuantity = reservationsWithParking.reduce((acc, prop) => acc + (prop.breakfastQuantity || 0), 0)
			const totalPetsQuantity = reservationsWithParking.reduce((acc, prop) => acc + (prop.petsQuantity || 0), 0)
			const totalBabyCribQuantity = reservationsWithParking.reduce((acc, prop) => acc + (prop.babyCribQuantity || 0), 0)
			let breakfastNotes = ""
			let petsNotes = ""
			let babyCribNotes = ""

			if (totalBreakfastQuantity > 0) {
				const breakfastTotalPrice = reservationsWithParking.reduce(
					(acc, prop) => acc + (prop.breakfastQuantity || 0) * ((prop.extended as ExtendedData)?.breakfastFee || 0),
					0,
				)
				breakfastNotes = `Śniadanie: ${totalBreakfastQuantity} porcji, Razem: ${formatCurrency(breakfastTotalPrice, reservationsWithParking[0]?.currency || "PLN")}`
			}

			if (totalPetsQuantity > 0) {
				const petsTotalPrice = reservationsWithParking.reduce(
					(acc, prop) => acc + (prop.petsQuantity || 0) * ((prop.extended as ExtendedData)?.petFee || 0),
					0,
				)
				petsNotes = `Zwierzęta: ${totalPetsQuantity} sztuk, Razem: ${formatCurrency(petsTotalPrice, reservationsWithParking[0]?.currency || "PLN")}`
			}

			if (totalBabyCribQuantity > 0) {
				const babyCribTotalPrice = reservationsWithParking.reduce(
					(acc, prop) => acc + (prop.babyCribQuantity || 0) * ((prop.extended as ExtendedData)?.babyCribFee || 100),
					0,
				)
				const totalBabyBedLinenQuantity = reservationsWithParking.reduce((acc, prop) => acc + (prop.babyBedLinen ? prop.babyCribQuantity || 0 : 0), 0)
				const babyBedLinenTotalPrice = totalBabyBedLinenQuantity * 50
				babyCribNotes = `Łóżeczka dla dzieci: ${totalBabyCribQuantity} sztuk, Razem: ${formatCurrency(babyCribTotalPrice, reservationsWithParking[0]?.currency || "PLN")}`
				if (totalBabyBedLinenQuantity > 0) {
					babyCribNotes += `, Pościel dla dzieci: ${totalBabyBedLinenQuantity} kompletów, Razem: ${formatCurrency(babyBedLinenTotalPrice, reservationsWithParking[0]?.currency || "PLN")}`
				}
			}

			// Combine all notes
			const combinedNotes = [breakfastNotes, petsNotes, babyCribNotes].filter((note) => note).join("\n")

			dispatch(
				setServices({
					reservations: [...prevReservationsRef.current], // Or [...reservationsWithParking], as they are string-equal
					totalPrice: paymentOption === "30" ? totalPrice * 1.05 : totalPrice,
					totalPriceOnline,
					remainingGuests,
					parkingTotal,
					cleaningFee: totalCleaningFee,
					cityTax: totalCityTax,
					petsTotal,
					breakfastTotal,
					babyCribTotal,
					babyBedLinenTotal,
					paymentOption,
					discountData,
					discountTotal,
					currentTotalPrice,
					parsedRemarks: {
						...(totalBreakfastQuantity > 0 ? { withBreakfast: true } : {}),
						...(totalPetsQuantity > 0 ? { withPets: true } : {}),
						...(totalBabyCribQuantity > 0 ? { extraBedRequested: true } : {}),
					},
					notes: combinedNotes,
				}),
			)
		}
	}, [
		reservationsWithParking,
		totalPrice,
		totalPriceOnline,
		guests,
		remainingGuests,
		parkingTotal,
		dispatch,
		paymentOption,
		totalCleaningFee,
		totalCityTax,
		petsTotal,
		breakfastTotal,
		babyCribTotal,
		babyBedLinenTotal,
		discountData,
		discountTotal,
		currentTotalPrice,
	])

	// Separate effect to handle payment option changes
	useEffect(() => {
		// Recalculate prices when payment option changes
		calculateTotalPrice(reservationsWithParking)
		dispatch(
			setServices({
				reservations: [...reservationsWithParking],
				totalPrice: paymentOption === "30" ? totalPrice * 1.05 : totalPrice,
				totalPriceOnline,
				remainingGuests,
				parkingTotal,
				cleaningFee: totalCleaningFee,
				cityTax: totalCityTax,
				petsTotal,
				breakfastTotal,
				babyCribTotal,
				babyBedLinenTotal,
				paymentOption,
				discountData,
				discountTotal,
				currentTotalPrice,
			}),
		)
	}, [
		paymentOption,
		calculateTotalPrice,
		reservationsWithParking,
		totalPrice,
		totalPriceOnline,
		remainingGuests,
		parkingTotal,
		dispatch,
		totalCleaningFee,
		totalCityTax,
		petsTotal,
		breakfastTotal,
		babyCribTotal,
		babyBedLinenTotal,
		discountData,
		discountTotal,
		currentTotalPrice,
	])

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

	const getPropertyTotal = (property: ReservationForProperty) => {
		const cleaningFee = property.cleaningFeeDays && numberOfNights >= property.cleaningFeeDays ? 0 : property.cleaningFee || 0
		const parkingTotal = (property.parkingQuantity || 0) * (property.parkingFee || 0)
		const petsTotal = (property.petsQuantity || 0) * ((property.extended as ExtendedData)?.petFee || 0)
		const breakfastTotal = (property.breakfastQuantity || 0) * ((property.extended as ExtendedData)?.breakfastFee || 0)
		const babyCribTotal = (property.babyCribQuantity || 0) * ((property.extended as ExtendedData)?.babyCribFee || 0)
		const babyBedLinenTotal = property.babyBedLinen ? (property.babyCribQuantity || 0) * 50 : 0
		return (
			(property.totalPrice || 0) +
			cleaningFee +
			(property.localTaxSum || 0) +
			parkingTotal +
			petsTotal +
			breakfastTotal +
			babyCribTotal +
			babyBedLinenTotal
		)
	}

	if (!departureDate || !arrivalDate) return null

	return (
		<ThemeProvider theme={muiTheme}>
			<Container
				maxWidth="lg"
				disableGutters
				sx={{
					paddingLeft: "0px !important",
					paddingRight: "0px !important",
				}}>
				<Paper sx={{ p: 0, my: 0 }}>
					<Box
						sx={{
							borderBottom: 1,
							borderColor: "divider",
							pb: 2,
							mb: 2,
						}}>
						<Typography variant="h5" component="h2" fontWeight="bold" align="center">
							{t("summary")}
						</Typography>
					</Box>

					<Typography variant="h6" sx={{ py: 2 }}>
						{t("stay") + ": "}
						{arrivalDate && format(arrivalDate, "yyyy-MM-dd")} ➜ {departureDate && format(departureDate, "yyyy-MM-dd")}
					</Typography>

					<Typography variant="body1" sx={{ mb: 2 }}>
						{t("numberOfNights") || "Liczba nocy"}: {numberOfNights}
					</Typography>

					{reservationsWithParking.map((property: ReservationForProperty, index) => {
						// Always provide a valid src for Image
						const image = property?.images && property?.images[0]
						let imagePath: string

						if (typeof image === "string") {
							imagePath = image
						} else {
							imagePath = image?.path || "/images/apartment-default-small.jpg"
						}

						// Normalize the path
						const normalizedPath = imagePath.replace(/\\/g, "/").replace(/^(?!\/)/, "/")

						const validImageUrl = property?.images && property.images.length !== 0 ? normalizedPath : defaultImg

						return (
							<Box
								key={property.id}
								sx={{
									p: 0,
									my: 0,
									display: "flex",
									flexDirection: "column",
									gap: 2,
								}}>
								<Box
									sx={{
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										width: "100%",
									}}>
									<Image
										src={validImageUrl}
										alt={property.location || "Property"}
										style={{
											objectFit: "cover",
											borderRadius: "8px",
										}}
										width={150}
										height={150}
									/>
								</Box>

								<Box sx={{ width: "100%" }}>
									{/* <Box sx={{}}>
										<Typography variant="h6" align="center">
											{t("additionalServices")}
										</Typography>
									</Box> */}

									<Typography variant="h6" sx={{ mb: 2 }}>
										{property?.name} - {property?.location} -{" "}
										{hasPersonBasedPricing(property as PropertyWithPricing)
											? formatCurrency(
													getPersonAdjustedPrice(property as PropertyWithPricing, guests, property.totalPrice),
													property.currency || "PLN",
												)
											: formatCurrency(property.totalPrice, property.currency || "PLN")}
									</Typography>

									<Box
										sx={{
											display: "flex",
											flexDirection: { xs: "column", sm: "row" },
											justifyContent: { xs: "flex-start", sm: "space-between" },
											alignItems: { xs: "flex-start", sm: "center" },
											mb: 2,
										}}>
										<Typography sx={{ mr: { sm: 4 } }}>
											{property.filters.includes("PRIVATE_GARAGE") ? t("garage") : t("parking")}
										</Typography>
										<Box
											sx={{
												display: "flex",
												alignItems: "center",
												justifyContent: { xs: "space-between", sm: "flex-start" },
												gap: { xs: 0, sm: 2 },
												mt: { xs: 1, sm: 0 },
												width: { xs: "100%", sm: "auto" },
											}}>
											<Typography>{formatCurrency(property.parkingFee || 0, property.currency || "PLN")}</Typography>
											<Box
												sx={{
													display: "flex",
													alignItems: "center",
													gap: 1,
												}}>
												<IconButton
													onClick={() => handleQuantityChange(index, -1)}
													size="small"
													sx={{
														bgcolor: "action.hover",
													}}>
													<RemoveIcon />
												</IconButton>
												<Typography
													sx={{
														width: 32,
														textAlign: "center",
													}}>
													{property.parkingQuantity}
												</Typography>
												<IconButton
													onClick={() => handleQuantityChange(index, 1)}
													size="small"
													sx={{
														bgcolor: "action.hover",
													}}>
													<AddIcon />
												</IconButton>
											</Box>
										</Box>
									</Box>

									<Box
										sx={{
											display: "flex",
											flexDirection: { xs: "column", sm: "row" },
											justifyContent: { xs: "flex-start", sm: "space-between" },
											alignItems: { xs: "flex-start", sm: "center" },
											mb: 2,
										}}>
										<Typography>{t("guestsAssigned")}</Typography>
										<Box
											sx={{
												display: "flex",
												alignItems: "center",
												gap: 1,
												mt: { xs: 1, sm: 0 },
											}}>
											<IconButton
												onClick={() => handleGuestsAssignedChange(index, -1)}
												size="small"
												sx={{
													bgcolor: "action.hover",
												}}>
												<RemoveIcon />
											</IconButton>
											<Typography
												sx={{
													width: 32,
													textAlign: "center",
												}}>
												{property.guestsAssigned}
											</Typography>
											<IconButton
												onClick={() => handleGuestsAssignedChange(index, 1)}
												size="small"
												sx={{
													bgcolor: "action.hover",
												}}>
												<AddIcon />
											</IconButton>
										</Box>
									</Box>

									{/* Pets */}
									{(property.extended as ExtendedData)?.petsAllowed !== false ? (
										<Box
											sx={{
												display: "flex",
												flexDirection: { xs: "column", sm: "row" },
												justifyContent: { xs: "flex-start", sm: "space-between" },
												alignItems: { xs: "flex-start", sm: "center" },
												mb: 2,
											}}>
											<Typography sx={{ mr: { sm: 4 } }}>{t("pets")}</Typography>
											<Box
												sx={{
													display: "flex",
													alignItems: "center",
													justifyContent: { xs: "space-between", sm: "flex-start" },
													gap: { xs: 0, sm: 2 },
													mt: { xs: 1, sm: 0 },
													width: { xs: "100%", sm: "auto" },
												}}>
												<Typography>
													{formatCurrency((property.extended as ExtendedData)?.petFee || 0, property.currency || "PLN")}
												</Typography>
												<Box
													sx={{
														display: "flex",
														alignItems: "center",
														gap: 1,
													}}>
													<IconButton
														onClick={() => handlePetsQuantityChange(index, -1)}
														size="small"
														sx={{
															bgcolor: "action.hover",
														}}>
														<RemoveIcon />
													</IconButton>
													<Typography
														sx={{
															width: 32,
															textAlign: "center",
														}}>
														{property.petsQuantity || 0}
													</Typography>
													<IconButton
														onClick={() => handlePetsQuantityChange(index, 1)}
														size="small"
														sx={{
															bgcolor: "action.hover",
														}}>
														<AddIcon />
													</IconButton>
												</Box>
											</Box>
										</Box>
									) : (
										<Typography sx={{ color: "error.main", fontStyle: "italic", mb: 2 }}>
											{t("petsNotAllowed") || "Zwierzęta nie są akceptowane w tym obiekcie"}
										</Typography>
									)}
									{(property.extended as ExtendedData)?.breakfastAllowed !== false ? (
										<Box
											sx={{
												display: "flex",
												flexDirection: { xs: "column", sm: "row" },
												justifyContent: { xs: "flex-start", sm: "space-between" },
												alignItems: { xs: "flex-start", sm: "center" },
												mb: 2,
											}}>
											<Typography sx={{ mr: { sm: 4 } }}>{t("breakfast")}</Typography>
											<Box
												sx={{
													display: "flex",
													alignItems: "center",
													justifyContent: { xs: "space-between", sm: "flex-start" },
													gap: { xs: 0, sm: 2 },
													mt: { xs: 1, sm: 0 },
													width: { xs: "100%", sm: "auto" },
												}}>
												<Typography>
													{formatCurrency((property.extended as ExtendedData)?.breakfastFee || 0, property.currency || "PLN")}
												</Typography>
												<Box
													sx={{
														display: "flex",
														alignItems: "center",
														gap: 1,
													}}>
													<IconButton
														onClick={() => handleBreakfastQuantityChange(index, -1)}
														size="small"
														sx={{
															bgcolor: "action.hover",
														}}>
														<RemoveIcon />
													</IconButton>
													<Typography
														sx={{
															width: 32,
															textAlign: "center",
														}}>
														{property.breakfastQuantity || 0}
													</Typography>
													<IconButton
														onClick={() => handleBreakfastQuantityChange(index, 1)}
														size="small"
														sx={{
															bgcolor: "action.hover",
														}}>
														<AddIcon />
													</IconButton>
												</Box>
											</Box>
										</Box>
									) : (
										<Typography sx={{ color: "error.main", fontStyle: "italic", mb: 2 }}>
											{t("breakfast")}: {t("breakfastNotAllowed") || "Śniadanie nie jest dostępne w tym obiekcie"}
										</Typography>
									)}
									{property.breakfastQuantity > 0 && (
										<Typography
											variant="body2"
											sx={{
												color: "error.main",
												fontSize: "0.875rem",
												mt: 1,
												mb: 2,
												fontStyle: "italic",
											}}>
											{t("breakfastNote")}
										</Typography>
									)}
									{/* Baby Crib */}
									{(property.extended as ExtendedData)?.babyCribAllowed !== false && (
										<Box
											sx={{
												display: "flex",
												flexDirection: { xs: "column", sm: "row" },
												justifyContent: { xs: "flex-start", sm: "space-between" },
												alignItems: { xs: "flex-start", sm: "center" },
												mb: 2,
											}}>
											<Typography sx={{ mr: { sm: 4 } }}>{t("babyCrib")}</Typography>
											<Box
												sx={{
													display: "flex",
													alignItems: "center",
													justifyContent: { xs: "space-between", sm: "flex-start" },
													gap: { xs: 0, sm: 2 },
													mt: { xs: 1, sm: 0 },
													width: { xs: "100%", sm: "auto" },
												}}>
												<Typography>
													{formatCurrency((property.extended as ExtendedData)?.babyCribFee || 100, property.currency || "PLN")}
												</Typography>
												<Box
													sx={{
														display: "flex",
														alignItems: "center",
														gap: 1,
													}}>
													<IconButton
														onClick={() => handleBabyCribQuantityChange(index, -1)}
														size="small"
														sx={{
															bgcolor: "action.hover",
														}}>
														<RemoveIcon />
													</IconButton>
													<Typography
														sx={{
															width: 32,
															textAlign: "center",
														}}>
														{property.babyCribQuantity || 0}
													</Typography>
													<IconButton
														onClick={() => handleBabyCribQuantityChange(index, 1)}
														size="small"
														sx={{
															bgcolor: "action.hover",
														}}>
														<AddIcon />
													</IconButton>
												</Box>
											</Box>
										</Box>
									)}

									{/* Baby Bed Linen */}
									{(property.babyCribQuantity || 0) > 0 && (
										<Box
											sx={{
												display: "flex",
												flexDirection: { xs: "column", sm: "row" },
												justifyContent: { xs: "flex-start", sm: "space-between" },
												alignItems: { xs: "flex-start", sm: "center" },
												mb: 2,
											}}>
											<Typography sx={{ mr: { sm: 4 } }}>{t("babyBedLinen")}</Typography>
											<Box
												sx={{
													display: "flex",
													alignItems: "center",
													justifyContent: { xs: "space-between", sm: "flex-start" },
													gap: { xs: 0, sm: 2 },
													mt: { xs: 1, sm: 0 },
													width: { xs: "100%", sm: "auto" },
												}}>
												<Typography>{formatCurrency(50, property.currency || "PLN")}</Typography>
												<Checkbox
													checked={property.babyBedLinen || false}
													onChange={(e) => handleBabyBedLinenChange(index, e.target.checked)}
													sx={{
														p: 0,
													}}
												/>
											</Box>
										</Box>
									)}

									<Typography variant="body1" sx={{ mt: 2 }}>
										{t("cleaning")}:{" "}
										{property.cleaningFeeDays && numberOfNights >= property.cleaningFeeDays ? (
											<>
												<span
													style={{
														textDecoration: "line-through",
													}}>
													{formatCurrency(property.cleaningFee, property.currency || "PLN")}
												</span>
												<span
													style={{
														color: "#10b981",
														fontWeight: "bold",
													}}>
													{t("free")}
												</span>{" "}
												<Typography
													component="span"
													variant="caption"
													color="primary"
													sx={{
														fontStyle: "italic",
													}}>
													({t("cleaningDiscount")})
												</Typography>
											</>
										) : (
											formatCurrency(property.cleaningFee, property.currency || "PLN")
										)}
									</Typography>

									<Typography variant="body1" sx={{ mt: 2 }}>
										{t("localTax")}: {formatCurrency(property.localTaxSum, property.currency || "PLN")}
									</Typography>
								</Box>

								<Box sx={{ mt: 4, textAlign: "right" }}>
									<Typography variant="h6" fontWeight="bold">
										{t("podsuma")} {formatCurrency(getPropertyTotal(property), property.currency || "PLN")}
										{paymentOption === "30" && (
											<span style={{ marginLeft: "10px", color: "#22c55e" }}>
												(+{formatCurrency(getPropertyTotal(property) * 0.05, property.currency || "PLN")}) ({t("option_cost")})
											</span>
										)}
									</Typography>
									{paymentOption === "30" && (
										<Typography variant="body2" sx={{ mt: 1, color: "#22c55e" }}>
											{t("total")} {formatCurrency(getPropertyTotal(property) * 1.05, property.currency || "PLN")}
										</Typography>
									)}
								</Box>
							</Box>
						)
					})}
					{reservationsWithParking.length > 1 && (
						<Box sx={{ mt: 4, textAlign: "right" }}>
							<Typography variant="h6" fontWeight="bold">
								{t("total")} {formatCurrency(totalPrice, reservationsWithParking[0]?.currency || "PLN")}
								{paymentOption === "30" && (
									<span style={{ marginLeft: "10px", color: "#22c55e" }}>
										(+{formatCurrency(totalPrice * 1.05, reservationsWithParking[0]?.currency || "PLN")}) ({t("option_cost")})
									</span>
								)}
							</Typography>
							{paymentOption === "30" && (
								<Typography variant="body2" sx={{ mt: 1, color: "#22c55e" }}>
									{t("total")} {formatCurrency(totalPrice * 1.05, reservationsWithParking[0]?.currency || "PLN")}
								</Typography>
							)}
						</Box>
					)}
					{/* Discount Code - Hidden when using offer link */}
					{!offerData && (
						<Box sx={{ mt: 4, mb: 2 }}>
							<Box
								onClick={() => setDiscountCodeExpanded(!discountCodeExpanded)}
								sx={{
									display: "flex",
									alignItems: "center",
									cursor: "pointer",
									p: 1,
									borderRadius: 1,
									"&:hover": {
										backgroundColor: "grey.100",
									},
								}}>
								<Typography
									sx={{
										fontSize: "1.125rem",
										fontWeight: "bold",
										color: "black",
										flex: 1,
									}}>
									{discountData ? `✅ ${t("discountCode.title")}` : t("discountCode.title")}
								</Typography>
								{discountCodeExpanded ? <RemoveIcon sx={{ color: "black" }} /> : <AddIcon sx={{ color: "black" }} />}
							</Box>
							<Collapse in={discountCodeExpanded} timeout="auto" unmountOnExit>
								<Box sx={{ mt: 2, p: 3, bgcolor: "grey.50", borderRadius: 2, border: 1, borderColor: "grey.200" }}>
									<Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
										{t("discountCode.title")}
									</Typography>
									<Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
										<TextField
											label={t("discountCode.label")}
											placeholder={t("discountCode.placeholder")}
											value={discountCode}
											onChange={(e) => setDiscountCode(e.target.value)}
											size="small"
											sx={{ flex: 1 }}
											disabled={validatingCode}
										/>
										<Button
											variant="contained"
											onClick={() => validateDiscountCode(discountCode)}
											disabled={!discountCode.trim() || validatingCode}
											sx={{ minWidth: "100px" }}>
											{validatingCode ? "..." : t("discountCode.apply")}
										</Button>
									</Box>
									{discountData && (
										<Box sx={{ mt: 2, p: 2, bgcolor: "green.50", borderRadius: 1, border: 1, borderColor: "green.200" }}>
											<Typography variant="body2" color="green.700" fontWeight="medium">
												{t("discountCode.offerApplied")}
											</Typography>
										</Box>
									)}
								</Box>
							</Collapse>
						</Box>
					)}
					{/* Payment Options */}
					<Box sx={{ mt: 4, mb: 2 }}>
						<Typography variant="h6" sx={{ mb: 2 }}>
							{t("payment_option")}
						</Typography>
						<RadioGroup
							value={paymentOption}
							onChange={(e) => setPaymentOption(e.target.value as "30" | "100")}
							sx={{ display: "flex", flexDirection: "row", gap: 3 }}>
							<FormControlLabel value="30" control={<Radio />} label={t("thirty_percent_upfront")} />
							<FormControlLabel value="100" control={<Radio />} label={t("hundred_percent_upfront")} />
						</RadioGroup>
						<Typography variant="body2" sx={{ mt: 1, fontStyle: "italic", color: "text.secondary" }}>
							{t("non_refundable_offer")}
						</Typography>
					</Box>

					{/* Price Breakdown */}
					{/* {(() => {
						// Calculate base price from individual properties
						const basePrice = reservationsWithParking.reduce((sum, prop) => {
							const propertyBasePrice = prop.totalPrice || 0
							const adjustedBasePrice = hasPersonBasedPricing(prop as PropertyWithPricing)
								? getPersonAdjustedPrice(prop as PropertyWithPricing, prop.guestsAssigned || guests, propertyBasePrice)
								: propertyBasePrice
							return sum + adjustedBasePrice
						}, 0)

						// Calculate offer discount total
						let totalOfferDiscount = 0
						if (offerData && offerData.offerProperties) {
							reservationsWithParking.forEach((prop) => {
								const offerProperty = offerData.offerProperties.find((op) => op.property.id === prop.id)
								if (offerProperty) {
									const discountAmount = offerProperty.originalPrice - offerProperty.price
									totalOfferDiscount += discountAmount
								}
							})
						}

						// Calculate discount code discount
						let discountCodeDiscount = 0
						if (discountData) {
							const basePriceAfterOffer = basePrice - totalOfferDiscount
							if (discountData.discountType === "PERCENTAGE") {
								discountCodeDiscount = (basePriceAfterOffer * discountData.discountValue) / 100
							} else {
								discountCodeDiscount = discountData.discountValue
							}
						}

						const totalDiscount = totalOfferDiscount + discountCodeDiscount

						return totalPrice > 0 ? (
							<Box sx={{ mt: 4, mb: 2, p: 3, bgcolor: "grey.50", borderRadius: 2, border: 1, borderColor: "grey.200" }}>
								<Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
									{t("priceBreakdown")}
								</Typography>
								<Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
									<Box sx={{ display: "flex", justifyContent: "space-between" }}>
										<Typography variant="body1">{t("basePrice")}:</Typography>
										<Typography variant="body1" fontWeight="medium">
											{totalDiscount > 0 ? (
												<>
													<span style={{ textDecoration: "line-through", marginRight: "8px", color: "#9ca3af" }}>
														{formatCurrency(basePrice, reservationsWithParking[0]?.currency || "PLN")}
													</span>
													<span style={{ color: "#10b981", fontWeight: "bold" }}>
														{formatCurrency(basePrice - totalDiscount, reservationsWithParking[0]?.currency || "PLN")}
													</span>
												</>
											) : (
												formatCurrency(basePrice, reservationsWithParking[0]?.currency || "PLN")
											)}
										</Typography>
									</Box>
									{totalOfferDiscount > 0 && (
										<Box sx={{ mt: 1, p: 1, bgcolor: "green.50", borderRadius: 1, border: 1, borderColor: "green.200" }}>
											<Typography variant="body2" sx={{ color: "#10b981", fontWeight: "medium" }}>
												{t("offerApplied")}
											</Typography>
										</Box>
									)}
									<Box sx={{ display: "flex", justifyContent: "space-between" }}>
										<Typography variant="body1">{t("cleaningFee")}:</Typography>
										<Typography variant="body1" fontWeight="medium">
											{formatCurrency(totalCleaningFee, reservationsWithParking[0]?.currency || "PLN")}
										</Typography>
									</Box>
									<Box sx={{ display: "flex", justifyContent: "space-between" }}>
										<Typography variant="body1">{t("cityTax")}:</Typography>
										<Typography variant="body1" fontWeight="medium">
											{formatCurrency(totalCityTax, reservationsWithParking[0]?.currency || "PLN")}
										</Typography>
									</Box>
									{parkingTotal > 0 && (
										<Box sx={{ display: "flex", justifyContent: "space-between" }}>
											<Typography variant="body1">{t("parking")}:</Typography>
											<Typography variant="body1" fontWeight="medium">
												{formatCurrency(parkingTotal, reservationsWithParking[0]?.currency || "PLN")}
											</Typography>
										</Box>
									)}
									{petsTotal > 0 && (
										<Box sx={{ display: "flex", justifyContent: "space-between" }}>
											<Typography variant="body1">{t("pets")}:</Typography>
											<Typography variant="body1" fontWeight="medium">
												{formatCurrency(petsTotal, reservationsWithParking[0]?.currency || "PLN")}
											</Typography>
										</Box>
									)}
									{breakfastTotal > 0 && (
										<Box sx={{ display: "flex", justifyContent: "space-between" }}>
											<Typography variant="body1">{t("breakfast")}:</Typography>
											<Typography variant="body1" fontWeight="medium">
												{formatCurrency(breakfastTotal, reservationsWithParking[0]?.currency || "PLN")}
											</Typography>
										</Box>
									)}
									{babyCribTotal > 0 && (
										<Box sx={{ display: "flex", justifyContent: "space-between" }}>
											<Typography variant="body1">{t("babyCrib")}:</Typography>
											<Typography variant="body1" fontWeight="medium">
												{formatCurrency(babyCribTotal, reservationsWithParking[0]?.currency || "PLN")}
											</Typography>
										</Box>
									)}
									{babyBedLinenTotal > 0 && (
										<Box sx={{ display: "flex", justifyContent: "space-between" }}>
											<Typography variant="body1">{t("babyBedLinen")}:</Typography>
											<Typography variant="body1" fontWeight="medium">
												{formatCurrency(babyBedLinenTotal, reservationsWithParking[0]?.currency || "PLN")}
											</Typography>
										</Box>
									)}
								</Box>
							</Box>
						) : null
					})()} */}
					{/* xxx
					<Box sx={{ mt: 4, textAlign: "right" }}>
						<Typography variant="h6" fontWeight="bold">
							{t("total")} {formatCurrency(getPropertyTotal(property), property.currency || "PLN")}
							{paymentOption === "30" && (
								<span style={{ marginLeft: "10px", color: "#22c55e" }}>
									(+{formatCurrency(totalPrice * 0.05, reservationsWithParking[0]?.currency || "PLN")}) ({t("option_cost")})
								</span>
							)}
						</Typography>
						{paymentOption === "30" && (
							<Typography variant="body2" sx={{ mt: 1, color: "#22c55e" }}>
								{t("total")} {formatCurrency(totalPrice * 1.05, reservationsWithParking[0]?.currency || "PLN")}
							</Typography>
						)}
					</Box> */}

					{/* Mobile Sticky Total Bar */}
					<Box
						sx={{
							display: { xs: "block", sm: "none" },
							position: "fixed",
							bottom: 0,
							left: 0,
							right: 0,
							backgroundColor: "white",
							borderTop: 1,
							borderColor: "divider",
							boxShadow: 3,
							p: 2,
							zIndex: 1000,
						}}>
						<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
							<Typography variant="h6" fontWeight="bold">
								{t("total")}
							</Typography>
							<Typography variant="h6" fontWeight="bold" color="black">
								{formatCurrency(totalPrice, reservationsWithParking[0]?.currency || "PLN")}
								{paymentOption === "30" && (
									<span style={{ marginLeft: "8px", color: "#22c55e", fontSize: "0.875rem" }}>
										(+{formatCurrency(totalPrice * 0.05, reservationsWithParking[0]?.currency || "PLN")})
									</span>
								)}
							</Typography>
						</Box>
						{paymentOption === "30" && (
							<Typography variant="body2" sx={{ mt: 1, color: "black", textAlign: "right" }}>
								{t("total")} {formatCurrency(totalPrice * 1.05, reservationsWithParking[0]?.currency || "PLN")}
							</Typography>
						)}
					</Box>
				</Paper>
			</Container>
		</ThemeProvider>
	)
}

export default AdditionalServices
