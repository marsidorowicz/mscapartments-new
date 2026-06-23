/** @format */

"use client"

import Link from "next/link"
import { useEffect, useMemo, useState, type FormEvent } from "react"
import { useDispatch } from "react-redux"
import { useRouter } from "next/navigation"
import HomeIcon from "@mui/icons-material/Home"
import { useLocalStorageNew } from "@/utilities/hooks/useLocalStorage"
import { type Event } from "@/types"
import { upsertEventDb } from "@/utilities/functions/calendar"
import { NotificationComponent } from "@/app/[lang]/components/rev13/Notification"
import { setNotification } from "@/state/action-creators"
import ReservationForm, { type ReservationFormData } from "./components/ReservationForm"
import { BasketItemCard } from "./components/BasketItemCard"
import { BasketSidebarSummary } from "./components/BasketSidebarSummary"
import { ReservationConfirmationModal } from "./components/ReservationConfirmationModal"
import { ReservationProgressDialog, type ReservationProgressState } from "./components/ReservationProgressDialog"
import {
	type BasketItem,
	type ItemState,
	type PriceChange,
	translations,
	localeMap,
	parseDateRange,
	fetchCurrentNoBedsCachePrice,
	buildInitialState,
	buildEventFromItem,
	createServicesFromProperty,
	getExtendedFee,
	getServiceQuantity,
	differenceInDays,
	format,
} from "./functions/basketHelpers"
import { DiscountData } from "@/utilities/functions/pricing/discountPricing"
import type { PublicOfferData } from "@/types"

type UpsertEventResponse = {
	success: boolean | string
	error?: string | null
	eventSaved?: {
		id: string | number
		propertyId: string | number
		accessToken: string
	}
	data?: unknown | null
}

export default function BasketPageClient({ lang = "pl" }: { lang?: string }) {
	const router = useRouter()
	const dispatch = useDispatch()
	const [basketItems, setBasketItems] = useLocalStorageNew<BasketItem[]>("rootBasket", [])
	const [itemStates, setItemStates] = useLocalStorageNew<Record<string, ItemState>>("rootBasketStates", {})

	// Offer and Discount state
	const [offerData, setOfferData] = useState<(PublicOfferData & { propertyId?: number; propertyName?: string }) | null>(null)
	const [offerAutoFilled, setOfferAutoFilled] = useState(false)
	const [discountData, setDiscountData] = useState<DiscountData | null>(null)
	const [discountCode, setDiscountCode] = useState("")
	const [discountCodeExpanded, setDiscountCodeExpanded] = useState(false)
	const [validatingCode, setValidatingCode] = useState(false)

	const [reservationFormValues, setReservationFormValues] = useState<ReservationFormData>({
		name: "",
		phone: "",
		email: "",
		remarks: "",
		acceptTerms: false,
		newsletter: false,
		invoice: false,
		companyName: "",
		streetAddress: "",
		postalCode: "",
		invoiceCountry: "",
		taxNumber: "",
	})
	const [isValidating, setIsValidating] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [validationError, setValidationError] = useState<string | null>(null)
	const [progressState, setProgressState] = useState<ReservationProgressState>({
		isOpen: false,
		availabilityStatus: "idle",
		priceStatus: "idle",
		reservationStatus: "idle",
		errorMsg: null,
		paymentLinks: [],
		priceNote: null,
	})
	const [reservationConfirmation, setReservationConfirmation] = useState<{
		events: Event[]
		priceChanges: PriceChange[]
	} | null>(null)
	const localeCode = localeMap[lang] || localeMap.pl
	const t = translations[lang as keyof typeof translations] || translations.pl

	useEffect(() => {
		if (typeof window === "undefined") return
		const params = new URLSearchParams(window.location.search)
		const fromOffer = params.get("fromOffer")
		const offerId = params.get("offer")
		const propertyId = params.get("propertyId")
		const discountParam = params.get("discountCode")

		if (fromOffer === "true" && propertyId) {
			setBasketItems((prev) => prev.filter((item) => item.id.toString() !== propertyId))
			setItemStates((prev) => {
				const next = { ...prev }
				delete next[propertyId]
				return next
			})
		}

		if (fromOffer === "true" && offerId) {
			fetch(`/api/public/offer/${offerId}`)
				.then((res) => (res.ok ? res.json() : null))
				.then((data) => {
					if (data) setOfferData(data)
				})
				.catch(console.error)
		}
		if (discountParam) {
			setDiscountCode(discountParam)
			validateDiscountCodeFn(discountParam)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	// Auto-fill basket from offer. Always apply once when offerData arrives.
	useEffect(() => {
		if (offerData && !offerAutoFilled && basketItems.length === 0) {
			const newBasketItems: BasketItem[] = offerData.offerProperties.map((op) => {
				let dateRangeStr = null
				if (offerData.startDate && offerData.endDate) {
					dateRangeStr = `${offerData.startDate.split("T")[0]}_${offerData.endDate.split("T")[0]}`
				}
				return {
					id: op.property.id,
					name: op.property.name,
					location: op.property.location || op.property.place?.name || "",
					dateRange: dateRangeStr,
					totalPrice: op.price,
					offerGrossPrice: op.price,
					offerGrossOriginalPrice: op.originalPrice ?? op.price,
					offerBase: undefined,
					offerBaseAdjusted: false,
					fromOffer: true,
					currency: offerData.currency || "PLN",
				}
			})

			const newStates: Record<string, ItemState> = {}
			offerData.offerProperties.forEach((op) => {
				newStates[op.property.id] = {
					guests: offerData.guests || 1,
					expanded: true,
					maxOccupancy: op.property.maxOccupancy || 99,
					services: [],
				}
			})

			setBasketItems(newBasketItems)
			setItemStates((prev) => ({ ...prev, ...newStates }))
			setOfferAutoFilled(true)
		}
	}, [offerData, offerAutoFilled, basketItems.length, setBasketItems, setItemStates])

	const validateDiscountCodeFn = async (code: string) => {
		if (!code.trim() || basketItems.length === 0 || basketItems.some((item) => item.fromOffer)) {
			setDiscountData(null)
			return
		}
		setValidatingCode(true)
		try {
			const selectedPropertyIds = basketItems.map((item) => Number(item.id))
			const firstRange = parseDateRange(basketItems[0]?.dateRange)
			const response = await fetch("/api/discount-codes/validate", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					code: code.toUpperCase(),
					propertyIds: selectedPropertyIds,
					checkInDate: firstRange?.start.toISOString(),
					checkOutDate: firstRange?.end.toISOString(),
				}),
			})
			const data = await response.json()
			if (response.ok && data?.valid) {
				setDiscountData({
					discountType: data.discountType,
					discountValue: data.discountValue,
					campaignId: data.campaignId,
					codeId: data.codeId,
				})
				setValidationError(null)
			} else {
				setDiscountData(null)
				const rawError = data?.error || "Invalid discount code"
				const translatedError = rawError.includes("Code already used") ? t.discountCodeUsed || rawError : rawError
				dispatch(
					setNotification({
						open: true,
						severity: "error",
						message: translatedError,
						time: 10000,
						variant: "filled",
					}),
				)
				setValidationError(translatedError)
			}
		} catch {
			setDiscountData(null)
			dispatch(
				setNotification({
					open: true,
					severity: "error",
					message: t.validationError || "Invalid discount code",
					time: 10000,
					variant: "filled",
				}),
			)
		} finally {
			setValidatingCode(false)
		}
	}

	const handleReservationFormChange = (nextValues: ReservationFormData) => {
		setReservationFormValues(nextValues)
	}

	const verifyOffer = async () => {
		if (!offerData?.offerId) return false
		try {
			const response = await fetch(`/api/public/offer/${offerData.offerId}`)
			if (!response.ok) return false
			const data = await response.json()
			if (data?.offerId) {
				setOfferData(data)
				return true
			}
			return false
		} catch (error) {
			console.error("Error verifying offer:", error)
			return false
		}
	}

	const buildReservationEvents = async () => {
		if (!basketItems.length) {
			return {
				events: [] as Event[],
				priceChanges: [] as PriceChange[],
				error: t.validationError,
			}
		}

		const events: Event[] = []
		const priceChanges: PriceChange[] = []

		for (const item of basketItems) {
			const state = itemStates[item.id.toString()]
			if (!state || !state.property) {
				return { events: [], priceChanges: [], error: t.validationError }
			}

			const property = state.property
			const range = parseDateRange(item.dateRange)
			if (!range) {
				return { events: [], priceChanges: [], error: t.validationError }
			}

			if (property.maxOccupancy > 0 && state.guests > property.maxOccupancy) {
				return {
					events: [],
					priceChanges: [],
					error: `${property.name} - ${t.cantFit || "Kwatera nie może pomieścić tylu gości"}`,
				}
			}

			let currentBasePrice = item.totalPrice ?? 0
			if (property.room_id) {
				const result = await fetchCurrentNoBedsCachePrice(property.id, range.start, range.end)
				if (!result.available) {
					let errorDetail = result.error || t.noAvailability || "Brak dostępności"
					if (result.alternatives && result.alternatives.length > 0) {
						errorDetail = `Brak pełnej dostępności w wybranych dniach, ale mamy wolne terminy:\n`
						result.alternatives.forEach((alt) => {
							errorDetail += `\n• ${format(new Date(alt.start), "dd.MM.yyyy")} - ${format(new Date(alt.end), "dd.MM.yyyy")}, za ${alt.price} PLN`
						})
					}
					return {
						events: [],
						priceChanges: [],
						error: `${item.name} - ${errorDetail}`,
					}
				}
				currentBasePrice = result.totalPrice
			}

			let discountedBaseFromOffer = currentBasePrice
			let offerOwnerPriceDiscount = 0
			if (offerData && offerData.offerProperties) {
				const offerProperty = offerData.offerProperties.find((op) => op.property.id === Number(item.id))
				if (offerProperty) {
					const offerGrossDiscount = Math.max(0, (offerProperty.originalPrice ?? offerProperty.price ?? 0) - (offerProperty.price ?? 0))
					discountedBaseFromOffer = Math.max(0, currentBasePrice - offerGrossDiscount)
					offerOwnerPriceDiscount = offerGrossDiscount
				}
			}

			let finalBasePrice = discountedBaseFromOffer
			let totalDiscountApplied = offerOwnerPriceDiscount
			let discountCodeAmount = 0
			if (discountData) {
				if (discountData.discountType === "PERCENTAGE") {
					const codeDiscount = finalBasePrice * (discountData.discountValue / 100)
					finalBasePrice = Math.max(0, finalBasePrice - codeDiscount)
					totalDiscountApplied += codeDiscount
					discountCodeAmount = codeDiscount
				} else {
					const proportion = basketSummary.stayTotal > 0 ? discountedBaseFromOffer / basketSummary.stayTotal : 0
					const codeDiscount = discountData.discountValue * proportion
					finalBasePrice = Math.max(0, finalBasePrice - codeDiscount)
					totalDiscountApplied += codeDiscount
					discountCodeAmount = codeDiscount
				}
			}

			const eventPayload = buildEventFromItem(item, state, reservationFormValues, finalBasePrice)
			if (!eventPayload) {
				return { events: [], priceChanges: [], error: t.validationError }
			}

			if (!eventPayload.extended) eventPayload.extended = {}
			if (totalDiscountApplied > 0) {
				;(eventPayload.extended as Record<string, unknown>).ownerPriceDiscount = totalDiscountApplied
			}
			if (discountData) {
				;(eventPayload.extended as Record<string, unknown>).discountCodeApplied = true
				;(eventPayload.extended as Record<string, unknown>).discountCodeId = discountData.codeId
				;(eventPayload.extended as Record<string, unknown>).discountCampaignId = discountData.campaignId
				;(eventPayload.extended as Record<string, unknown>).discountCodeDiscount = discountCodeAmount
				;(eventPayload.extended as Record<string, unknown>).originalBasePrice = currentBasePrice
			}

			// Keep ownerPrice aligned with the discounted base price for stay when an offer is applied
			if (finalBasePrice >= 0) {
				eventPayload.ownerPrice = finalBasePrice
			}

			// append offer & discount data to event
			if (offerData?.offerId) {
				eventPayload.sourceDescription = `Offer: ${offerData.offerId}`
				;(eventPayload.extended as Record<string, unknown>).offerId = offerData.offerId
			}
			if (discountData?.codeId) {
				eventPayload.sourceDescription = eventPayload.sourceDescription
					? `${eventPayload.sourceDescription}, Discount: ${discountCode}`
					: `Discount: ${discountCode}`
			}

			events.push(eventPayload)

			const cleaningFee = property.cleaningFee ?? 0
			const parkingFee = property.parkingFee ?? 0
			const cityTaxPerNight = property.localTax ?? 0
			const nights = Math.max(1, differenceInDays(range.end, range.start))
			const localTaxSum = cityTaxPerNight * nights
			const breakfastQuantity = getServiceQuantity(state.services, "breakfast")
			const petsQuantity = getServiceQuantity(state.services, "pets")
			const babyCribQuantity = getServiceQuantity(state.services, "babyCrib")
			const babyBedLinenQuantity = getServiceQuantity(state.services, "babyBedLinen")
			const parkingQuantity = getServiceQuantity(state.services, "parking")
			const breakfastFee = getExtendedFee(property.extended, "breakfastFee", 0)
			const petFee = getExtendedFee(property.extended, "petFee", 0)
			const babyCribFee = getExtendedFee(property.extended, "babyCribFee", 100)
			const additionalServicesCost =
				breakfastQuantity * breakfastFee +
				petsQuantity * petFee +
				babyCribQuantity * babyCribFee +
				(babyBedLinenQuantity > 0 ? babyCribQuantity * 50 : 0)
			const parkingCost = parkingQuantity * parkingFee

			const previousBasePrice = item.totalPrice ?? currentBasePrice
			const previousTotalPrice = previousBasePrice + cleaningFee + parkingCost + additionalServicesCost + localTaxSum
			const currentTotalPrice = currentBasePrice + cleaningFee + parkingCost + additionalServicesCost + localTaxSum

			if (Math.abs(previousBasePrice - currentBasePrice) > 0.01) {
				priceChanges.push({
					item,
					previousBasePrice,
					currentBasePrice,
					previousTotalPrice,
					currentTotalPrice,
				})
			}
		}

		return { events, priceChanges, error: undefined }
	}

	const submitReservationEvents = async (events: Event[]) => {
		setIsSubmitting(true)
		setValidationError(null)
		try {
			const defaultUserId = "clok0rd6f0000kkdgyf1pd0t3"
			const responses: UpsertEventResponse[] = await Promise.all(
				events.map((eventPayload, index) =>
					upsertEventDb({
						event: eventPayload,
						id: defaultUserId,
						source: "msc",
						offerId: index === 0 ? offerData?.offerId : undefined,
					}),
				),
			)

			const failedResponses = responses.filter((response) => !response.success)
			if (failedResponses.length > 0) {
				setValidationError(t.validationError || "Wystąpił błąd podczas zapisywania rezerwacji.")
				setProgressState((p) => ({
					...p,
					reservationStatus: "error",
					errorMsg: t.validationError || "Wystąpił błąd podczas zapisywania rezerwacji.",
					priceNote: null,
				}))
				console.error("Some reservation events failed:", failedResponses)
				return
			}

			if (discountData?.codeId && discountData?.campaignId) {
				try {
					await Promise.all(
						responses.map(async (response, index) => {
							if (!response.success || !response.eventSaved?.id) return
							const eventPayload = events[index]
							const extended = eventPayload.extended as Record<string, unknown> | undefined
							const discountAmount = extended?.discountCodeDiscount as number | undefined
							const originalBasePrice = extended?.originalBasePrice as number | undefined
							const finalPrice = eventPayload.price ?? 0

							if (!discountAmount || originalBasePrice === undefined) return

							await fetch("/api/discount-codes/apply", {
								method: "POST",
								headers: { "Content-Type": "application/json" },
								body: JSON.stringify({
									codeId: discountData.codeId,
									campaignId: discountData.campaignId,
									eventId: response.eventSaved.id,
									userId: defaultUserId,
									originalPrice: originalBasePrice,
									discountAmount,
									finalPrice,
									guestEmail: reservationFormValues.email,
									guestName: reservationFormValues.name,
								}),
							})
						}),
					)
				} catch (discountError) {
					console.error("Error applying discount code to reservation events:", discountError)
				}
			}

			const successfulResponses = responses.filter((r) => r.success && r.eventSaved)
			const paymentLinks: string[] = []
			if (successfulResponses.length > 0 && basketSummary.onlineTotal > 0) {
				successfulResponses.forEach((r) => {
					const ev = r.eventSaved
					if (ev?.id && ev?.propertyId && ev?.accessToken) {
						// pattern: pl/reservation/19844/57?token=7640a2...
						paymentLinks.push(`/${lang}/reservation/${ev.id}/${ev.propertyId}?token=${ev.accessToken}`)
					}
				})
			}

			setProgressState((p) => ({ ...p, reservationStatus: "success", paymentLinks, paymentLink: paymentLinks[0] ?? null, priceNote: null }))
			setReservationConfirmation(null)
			setBasketItems([]) // Clear basket on successful reservation
		} catch (error) {
			console.error("Error submitting reservation:", error)
			setProgressState((p) => ({ ...p, reservationStatus: "error", errorMsg: "Wystąpił nieoczekiwany błąd.", priceNote: null }))
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleReservationFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()

		if (!reservationFormValues.name.trim() || !reservationFormValues.phone.trim() || !reservationFormValues.email.trim()) {
			console.warn("Reservation form is missing required fields")
			return
		}
		if (reservationFormValues.invoice) {
			if (
				!reservationFormValues.companyName.trim() ||
				!reservationFormValues.streetAddress.trim() ||
				!reservationFormValues.postalCode.trim() ||
				!reservationFormValues.invoiceCountry.trim() ||
				!reservationFormValues.taxNumber.trim()
			) {
				console.warn("Reservation form is missing required invoice fields")
				return
			}
		}

		setValidationError(null)
		setIsValidating(true)
		setProgressState({
			isOpen: true,
			availabilityStatus: "loading",
			priceStatus: "idle",
			reservationStatus: "idle",
			errorMsg: null,
			paymentLinks: [],
			priceNote: null,
		})

		try {
			const validationResult = await buildReservationEvents()

			if (validationResult.error) {
				setValidationError(validationResult.error)
				setProgressState((p) => ({ ...p, availabilityStatus: "error", errorMsg: validationResult.error ?? "Błąd" }))
				return
			}

			setProgressState((p) => ({ ...p, availabilityStatus: "success", priceStatus: "loading" }))
			await new Promise((r) => setTimeout(r, 600)) // smooth visual transition

			if (validationResult.priceChanges.length > 0) {
				const priceChangesFromOfferItemsOnly =
					validationResult.priceChanges.length > 0 &&
					validationResult.priceChanges.every((change) => {
						const item = basketItems.find((i) => i.id.toString() === change.item.id.toString())
						return item?.fromOffer === true
					})

				if (offerData?.offerId && priceChangesFromOfferItemsOnly) {
					setProgressState((p) => ({
						...p,
						priceStatus: "loading",
						priceNote: t.checkingOfferDiscount,
					}))

					const offerVerified = await verifyOffer()
					if (offerVerified) {
						setProgressState((p) => ({
							...p,
							priceStatus: "success",
							priceNote: t.offerDiscountVerified,
						}))
						await new Promise((r) => setTimeout(r, 600))
						setProgressState((p) => ({ ...p, reservationStatus: "loading" }))
						await submitReservationEvents(validationResult.events)
						return
					}
				}

				setReservationConfirmation({
					events: validationResult.events,
					priceChanges: validationResult.priceChanges,
				})
				setProgressState((p) => ({ ...p, isOpen: false, priceStatus: "error", priceNote: null }))
				return
			}

			setProgressState((p) => ({ ...p, priceStatus: "success", reservationStatus: "loading" }))
			await new Promise((r) => setTimeout(r, 600)) // smooth visual transition

			await submitReservationEvents(validationResult.events)
		} finally {
			setIsValidating(false)
		}
	}

	const confirmReservation = async () => {
		if (!reservationConfirmation) return
		setValidationError(null)
		setProgressState({
			isOpen: true,
			availabilityStatus: "success",
			priceStatus: "success",
			reservationStatus: "loading",
			errorMsg: null,
		})
		await submitReservationEvents(reservationConfirmation.events)
	}

	const cancelReservationConfirmation = () => {
		setReservationConfirmation(null)
		setValidationError(null)
	}

	useEffect(() => {
		if (!basketItems || basketItems.length === 0) return
		const firstDateRange = basketItems[0]?.dateRange
		if (!firstDateRange) return

		if (typeof window === "undefined") return
		const params = new URLSearchParams(window.location.search)
		const current = params.get("dateRange")
		if (current === firstDateRange) return

		params.set("dateRange", firstDateRange)
		const newUrl = `${window.location.pathname}?${params.toString()}`
		router.replace(newUrl)
	}, [basketItems, router])

	useEffect(() => {
		if (typeof window === "undefined") return
		setItemStates((prev) => {
			const next: Record<string, ItemState> = { ...prev }
			let hasChanges = false
			basketItems.forEach((item) => {
				const key = item.id.toString()
				if (!next[key]) {
					let storedItem = undefined
					try {
						const raw = window.localStorage.getItem("rootBasketStates")
						if (raw) {
							const parsed = JSON.parse(raw)
							if (parsed[key]) storedItem = parsed[key]
						}
					} catch {}
					if (storedItem) {
						next[key] = storedItem
						hasChanges = true
					} else {
						next[key] = buildInitialState(item, prev[key])
						hasChanges = true
					}
				}
			})
			// Cleanup orphaned states
			let isHydrated = true
			try {
				const rawBasket = window.localStorage.getItem("rootBasket")
				if (rawBasket) {
					const parsedBasket = JSON.parse(rawBasket)
					if (Array.isArray(parsedBasket) && parsedBasket.length > 0 && basketItems.length === 0) {
						// Hydration hasn't completed yet (basketItems is empty but local storage isn't)
						isHydrated = false
					}
				}
			} catch {}

			if (isHydrated) {
				const validKeys = basketItems.map((i) => i.id.toString())
				Object.keys(next).forEach((k) => {
					if (!validKeys.includes(k)) {
						delete next[k]
						hasChanges = true
					}
				})
			}
			return hasChanges ? next : prev
		})
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [basketItems])

	useEffect(() => {
		if (!basketItems.length) return

		const loadPropertyDetails = async () => {
			const promises = basketItems.map(async (item) => {
				const id = item.id.toString()
				try {
					const response = await fetch(`/api/properties/mountain/${id}`)
					if (!response.ok) return { id, data: null }
					const json = await response.json()
					return { id, data: json.property }
				} catch {
					return { id, data: null }
				}
			})

			const results = await Promise.all(promises)
			setItemStates((prev) => {
				const next = { ...prev }
				let hasUpdates = false
				results.forEach((result) => {
					if (!result.data) return

					const key = result.id
					const existing = next[key]

					if (existing?.property) return

					next[key] = {
						...existing,
						maxOccupancy: result.data.maxOccupancy || existing?.maxOccupancy || 1,
						parkingQuantity: result.data.parkingQuantity ?? existing?.parkingQuantity ?? 0,
						petsMax: result.data.extended?.petsMax ?? existing?.petsMax ?? 0,
						propertyName: result.data.name || existing?.propertyName,
						breakfastAllowed: result.data.extended?.breakfastAllowed ?? existing?.breakfastAllowed,
						petsAllowed: result.data.extended?.petsAllowed ?? existing?.petsAllowed,
						babyCribAllowed: result.data.extended?.babyCribAllowed ?? existing?.babyCribAllowed,
						placeName: result.data.place?.name || existing?.placeName,
						property: result.data,
						services: createServicesFromProperty(existing?.services, result.data),
					}
					hasUpdates = true
				})
				return hasUpdates ? next : prev
			})

			setBasketItems((prev) => {
				const updated = prev.map((item) => {
					const result = results.find((r) => r.id === item.id.toString())
					if (!result?.data || item.fromOffer !== true) {
						return item
					}

					const cleaningFee = result.data.cleaningFee ?? 0
					const offerBase = Math.max(0, (item.offerGrossOriginalPrice ?? item.offerGrossPrice ?? 0) - cleaningFee)
					const discountedBase = Math.max(0, (item.offerGrossPrice ?? 0) - cleaningFee)

					const shouldUpdate = item.offerBase !== offerBase || item.totalPrice !== discountedBase || item.offerBaseAdjusted !== true

					if (!shouldUpdate) {
						return item
					}

					return {
						...item,
						totalPrice: discountedBase,
						offerBase: offerBase,
						offerBaseAdjusted: true,
					}
				})
				return updated
			})
		}

		loadPropertyDetails()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [basketItems])

	const updateGuests = (itemId: string, value: number) => {
		setItemStates((prev) => {
			const existing = prev[itemId]
			if (!existing) return prev
			const guests = Math.max(1, Math.min(existing.maxOccupancy, value))

			// Recalculate caps for services based on new guests count
			const updatedServices = existing.services.map((service) => {
				const maxQuantity = getMaxQuantity(itemId, service.id, { ...existing, guests })
				let quantity = service.quantity
				if (maxQuantity !== undefined && quantity > maxQuantity) {
					quantity = maxQuantity
				}
				return { ...service, quantity, selected: quantity > 0 }
			})

			return { ...prev, [itemId]: { ...existing, guests, services: updatedServices } }
		})
	}

	const toggleServiceSelected = (itemId: string, serviceId: string) => {
		if (serviceId === "cleaning") return
		setItemStates((prev) => {
			const existing = prev[itemId]
			if (!existing) return prev
			return {
				...prev,
				[itemId]: {
					...existing,
					services: existing.services.map((service) => {
						if (service.id === serviceId) {
							const newSelected = !service.selected
							return {
								...service,
								selected: newSelected,
								quantity: newSelected ? 1 : 0,
							}
						}
						return service
					}),
				},
			}
		})
	}

	const getMaxQuantity = (itemId: string, serviceId: string, itemState: ItemState) => {
		if (serviceId === "parking") return itemState.parkingQuantity ?? 0
		if (serviceId === "pets") return itemState.petsMax ?? 10
		if (serviceId === "babyCrib" || serviceId === "babyBedLinen") return 2
		if (serviceId === "breakfast") {
			const item = basketItems.find((i) => i.id.toString() === itemId)
			let nights = 1
			if (item) {
				const range = parseDateRange(item.dateRange)
				if (range) nights = Math.max(1, differenceInDays(range.end, range.start))
			}
			return (itemState.guests ?? 1) * nights
		}
		return undefined
	}

	const setServiceQuantity = (itemId: string, serviceId: string, value: number) => {
		setItemStates((prev) => {
			const state = prev[itemId]
			if (!state) return prev

			const idx = state.services.findIndex((s) => s.id === serviceId)
			if (idx === -1) return prev

			const maxQuantity = getMaxQuantity(itemId, serviceId, state)
			let safeValue = value
			if (maxQuantity !== undefined) {
				safeValue = Math.min(maxQuantity, Math.max(0, value))
			} else {
				safeValue = Math.max(0, value)
			}

			const newCtx = [...state.services]
			newCtx[idx] = { ...newCtx[idx], quantity: safeValue, selected: safeValue > 0 }

			return { ...prev, [itemId]: { ...state, services: newCtx } }
		})
	}

	const changeServiceQuantity = (itemId: string, serviceId: string, delta: number) => {
		if (serviceId === "cleaning") return
		setItemStates((prev) => {
			const existing = prev[itemId]
			if (!existing) return prev
			return {
				...prev,
				[itemId]: {
					...existing,
					services: existing.services.map((service) => {
						if (service.id !== serviceId) return service
						const maxQuantity = getMaxQuantity(itemId, service.id, existing)
						let quantity = service.quantity + delta
						if (quantity <= 0) {
							return { ...service, quantity: 0, selected: false }
						}
						if (maxQuantity !== undefined) {
							quantity = Math.min(maxQuantity, quantity)
						}
						return { ...service, quantity, selected: true }
					}),
				},
			}
		})
	}

	const toggleExpanded = (itemId: string) => {
		setItemStates((prev) => {
			const existing = prev[itemId]
			if (!existing) return prev
			return {
				...prev,
				[itemId]: { ...existing, expanded: !existing.expanded },
			}
		})
	}

	const removeFromBasket = (itemId: string | number) => {
		setBasketItems((prev) => prev.filter((item) => item.id.toString() !== itemId.toString()))
		setItemStates((prev) => {
			const next = { ...prev }
			delete next[itemId.toString()]
			return next
		})
	}

	const missingFieldsList = useMemo(() => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const formTranslations: Record<string, any> = {
			pl: {
				name: "Imię i nazwisko",
				phone: "Telefon",
				email: "Email",
				company_name: "Nazwa firmy",
				street_address: "Ulica i numer",
				postal_code: "Kod pocztowy",
				country: "Kraj",
				tax_number: "NIP",
				acceptTerms: "Akceptuję regulamin",
				remarks: "Uwagi",
				missingData: "Wypełnij brakujące dane w formularzu:",
			},
			en: {
				name: "Name",
				phone: "Phone",
				email: "Email",
				company_name: "Company Name",
				street_address: "Street Address",
				postal_code: "Postal Code",
				country: "Country",
				tax_number: "Tax Number",
				acceptTerms: "I accept the terms and conditions",
				remarks: "Remarks",
				missingData: "Please fill in missing form data:",
			},
			de: {
				name: "Name",
				phone: "Telefon",
				email: "Email",
				company_name: "Firmenname",
				street_address: "Straße und Hausnummer",
				postal_code: "Postleitzahl",
				country: "Land",
				tax_number: "Steuernummer",
				acceptTerms: "Ich akzeptiere die allgemeinen Geschäftsbedingungen",
				remarks: "Bemerkungen",
				missingData: "Bitte füllen Sie die fehlenden Formulardaten aus:",
			},
			es: {
				name: "Nombre",
				phone: "Teléfono",
				email: "Correo electrónico",
				company_name: "Nombre de la empresa",
				street_address: "Dirección",
				postal_code: "Código postal",
				country: "País",
				tax_number: "NIF/NIE",
				acceptTerms: "Acepto los términos y condiciones",
				remarks: "Comentarios",
				missingData: "Por favor, complete los datos faltantes del formulario:",
			},
		}
		const ft = formTranslations[lang] || formTranslations.pl
		const list: string[] = []

		if (!reservationFormValues.name.trim()) list.push(ft.name)
		if (!reservationFormValues.phone.trim()) list.push(ft.phone)
		if (!reservationFormValues.email.trim()) list.push(ft.email)
		if (!reservationFormValues.acceptTerms) list.push(ft.acceptTerms)
		if (reservationFormValues.invoice) {
			if (!reservationFormValues.companyName.trim()) list.push(ft.company_name)
			if (!reservationFormValues.streetAddress.trim()) list.push(ft.street_address)
			if (!reservationFormValues.postalCode.trim()) list.push(ft.postal_code)
			if (!reservationFormValues.invoiceCountry.trim()) list.push(ft.country)
			if (!reservationFormValues.taxNumber.trim()) list.push(ft.tax_number)
		}
		const isRemarksRequired = Object.values(itemStates).some((state) => state.services?.some((s) => s.id === "breakfast" && s.quantity > 0))
		if (isRemarksRequired && !reservationFormValues.remarks.trim()) list.push(ft.remarks)

		return { list, text: ft.missingData }
	}, [reservationFormValues, itemStates, lang])

	const isFormMissingFields = missingFieldsList.list.length > 0

	const basketSummary = useMemo(() => {
		let totalOfferDiscount = 0

		const itemDetails = basketItems.map((item) => {
			const state = itemStates[item.id.toString()]
			const serviceTotal =
				state?.services.reduce((sum, service) => {
					if (!service.selected) return sum
					return sum + service.price * service.quantity
				}, 0) ?? 0
			const basePrice = item.offerBase ?? item.totalPrice ?? 0

			const range = parseDateRange(item.dateRange)
			const nights = range ? Math.max(1, differenceInDays(range.end, range.start)) : 1
			const localTax = state?.property ? (state.property.localTax ?? 0) * nights * (state.guests ?? 1) : 0

			let offerDiscountAmount = 0
			if (item.offerBase !== undefined) {
				offerDiscountAmount = Math.max(0, item.offerBase - (item.totalPrice ?? 0))
			}
			totalOfferDiscount += offerDiscountAmount
			return {
				item,
				serviceTotal,
				basePrice,
				localTax,
				offerDiscountAmount,
				total: Math.max(0, basePrice - offerDiscountAmount) + serviceTotal + localTax,
				guests: state?.guests ?? 1,
				paymentsOn: state?.property?.paymentsOn ?? false,
			}
		})

		const stayTotal = itemDetails.reduce((sum, next) => sum + next.basePrice, 0)
		const serviceTotal = itemDetails.reduce((sum, next) => sum + next.serviceTotal, 0)
		const localTaxTotal = itemDetails.reduce((sum, next) => sum + next.localTax, 0)
		const baseTotal = itemDetails.reduce((sum, next) => sum + Math.max(0, next.basePrice - next.offerDiscountAmount), 0)

		let discountCodeDiscount = 0
		if (discountData) {
			if (discountData.discountType === "PERCENTAGE") {
				discountCodeDiscount = baseTotal * (discountData.discountValue / 100)
			} else {
				discountCodeDiscount = Math.min(discountData.discountValue, baseTotal)
			}
		}

		const fullTotal = Math.max(0, baseTotal - discountCodeDiscount) + serviceTotal + localTaxTotal

		let onlineTotalRaw = 0
		let manualTotalRaw = 0
		itemDetails.forEach((next) => {
			const itemBase = Math.max(0, next.basePrice - next.offerDiscountAmount)
			const proportion = baseTotal > 0 ? itemBase / baseTotal : 0
			const itemDiscount = discountCodeDiscount * proportion
			const itemFinal = Math.max(0, itemBase - itemDiscount) + next.serviceTotal + next.localTax
			if (next.paymentsOn) {
				onlineTotalRaw += itemFinal
			} else {
				manualTotalRaw += itemFinal
			}
		})

		return {
			stayTotal,
			serviceTotal,
			localTaxTotal,
			offerDiscountTotal: totalOfferDiscount,
			discountCodeDiscount,
			fullTotal,
			onlineTotal: onlineTotalRaw,
			manualTotal: manualTotalRaw,
			totalGuests: itemDetails.reduce((sum, next) => sum + next.guests, 0),
			itemDetails,
		}
	}, [basketItems, itemStates, discountData])

	const firstRange = parseDateRange(basketItems[0]?.dateRange)
	const sameRange = basketItems.every((item) => item.dateRange === basketItems[0]?.dateRange)
	const apartmentSelectionHref = `/${lang}/apartamenty${basketItems[0]?.dateRange ? `?dateRange=${encodeURIComponent(basketItems[0].dateRange)}` : ""}`

	return (
		<div className="min-h-screen bg-gray-50 pt-[100px] sm:pt-6 pb-[120px] sm:pb-6 px-2 sm:px-3 lg:px-5">
			<div className="mx-auto max-w-full">
				<div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
					<div className="order-2 sm:order-1 mt-2 sm:mt-0 pt-4 sm:pt-0">
						<h1 className="text-3xl font-semibold text-gray-900">{t.reservationSummary}</h1>
						<p className="mt-2 max-w-2xl text-sm text-gray-600">{t.moreInfo}</p>
					</div>
					<div className="fixed top-0 left-0 right-0 z-50 order-1 sm:order-2 flex w-full items-center gap-2 bg-white sm:bg-gray-50 py-3 px-4 sm:static sm:w-auto sm:py-0 sm:px-0 sm:justify-end shadow-sm sm:shadow-none">
						<Link
							href={`/${lang}`}
							aria-label={t.backHome}
							className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-transparent bg-[#1D2430] text-white transition hover:bg-[#a6755a]">
							<HomeIcon className="h-6 w-6" aria-hidden="true" />
						</Link>
						<Link
							href={apartmentSelectionHref}
							className="inline-flex w-full items-center justify-center rounded-lg border border-transparent bg-gray-200 px-4 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-300">
							{t.apartmentSelectionLabel}
						</Link>
					</div>
				</div>

				<div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
					<div className="space-y-5">
						{basketItems.length === 0 ? (
							<div className="rounded-xl bg-white px-2 py-5 sm:px-5 shadow-sm shadow-gray-200">
								<p className="text-sm text-gray-700">{t.noneInBasket}</p>
							</div>
						) : (
							<div className="space-y-5">
								{basketItems.map((item) => {
									const state = itemStates[item.id.toString()]
									if (!state) return null
									return (
										<BasketItemCard
											key={item.id.toString()}
											item={item}
											state={state}
											lang={lang}
											localeCode={localeCode}
											t={t}
											onRemove={() => removeFromBasket(item.id)}
											onToggleExpanded={() => toggleExpanded(item.id.toString())}
											onUpdateGuests={(value) => updateGuests(item.id.toString(), value)}
											onToggleServiceSelected={(serviceId) => toggleServiceSelected(item.id.toString(), serviceId)}
											onChangeServiceQuantity={(serviceId, delta) => changeServiceQuantity(item.id.toString(), serviceId, delta)}
											onSetServiceQuantity={(serviceId, value) => setServiceQuantity(item.id.toString(), serviceId, value)}
										/>
									)
								})}
							</div>
						)}

						<div className="rounded-xl bg-white px-2 py-1 sm:px-4 shadow-sm shadow-gray-200">
							<div className="mt-6">
								{validationError ? (
									<div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{validationError}</div>
								) : null}
								<ReservationForm
									isRemarksRequired={Object.values(itemStates).some((state) =>
										state.services?.some((s) => s.id === "breakfast" && s.quantity > 0),
									)}
									lang={lang}
									values={reservationFormValues}
									onChange={handleReservationFormChange}
									onSubmit={handleReservationFormSubmit}
									isSubmitting={isSubmitting || isValidating}
									disabled={isSubmitting || isValidating}
								/>
							</div>
						</div>
					</div>

					<BasketSidebarSummary
						basketItems={basketItems}
						basketSummary={{
							...basketSummary,
							offerDiscountTotal: basketSummary.offerDiscountTotal,
							discountCodeDiscount: basketSummary.discountCodeDiscount,
						}}
						t={t}
						localeCode={localeCode}
						firstRange={firstRange}
						sameRange={sameRange}
						discountCode={discountCode}
						setDiscountCode={setDiscountCode}
						validatingCode={validatingCode}
						validateDiscountCodeFn={validateDiscountCodeFn}
						discountData={discountData}
						discountCodeExpanded={discountCodeExpanded}
						setDiscountCodeExpanded={setDiscountCodeExpanded}
						offerData={offerData}
					/>
				</div>
			</div>
			<ReservationConfirmationModal
				reservationConfirmation={reservationConfirmation}
				t={t}
				isSubmitting={isSubmitting}
				confirmReservation={confirmReservation}
				cancelReservationConfirmation={cancelReservationConfirmation}
			/>
			<ReservationProgressDialog lang={lang} state={progressState} onClose={() => setProgressState((p) => ({ ...p, isOpen: false }))} />
			<NotificationComponent />

			{/* Mobile sticky bottom bar */}
			<div className="fixed bottom-0 left-0 right-0 z-50 flex flex-col border-t border-gray-200 bg-white p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] sm:hidden pb-safe">
				<div className="flex items-center justify-between mb-1">
					<div className="flex flex-col">
						<span className="text-xs font-medium text-gray-500">{t.total || "Razem"}</span>
						<span className="text-xl font-bold text-gray-900">{basketSummary.fullTotal.toFixed(2)} zł</span>
					</div>
					<button
						type="submit"
						form="reservation-form"
						disabled={isSubmitting || isValidating || basketItems.length === 0 || isFormMissingFields}
						className="min-w-[140px] rounded-xl bg-[#cc9678] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#a6755a] disabled:opacity-50 disabled:cursor-not-allowed">
						{isSubmitting ? (t.submit || "Rezerwuj") + "..." : t.submit || "Rezerwuj"}
					</button>
				</div>
				{isFormMissingFields && basketItems.length > 0 && (
					<div className="text-[10px] text-red-500 font-medium leading-tight pt-1">
						* {missingFieldsList.text} <span className="font-semibold">{missingFieldsList.list.join(", ")}</span>
					</div>
				)}
			</div>
		</div>
	)
}
