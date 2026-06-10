/** @format */

import { ReservationForProperty } from "@/app/[lang]/components/re/PropertyList"
import { DiscountData } from "@/utilities/functions/pricing/discountPricing"
import {
	// User,
	// UserData,
	// Property,
	// Place,
	// EventType,
	Notification,
} from "@/types"

export enum Actions {
	SET_USER = "SET_USER",
	SET_USER_DATA = "SET_USER_DATA",
	SET_THEME = "SET_THEME",
	SET_LANG = "SET_LANG",
	SET_OPEN = "SET_OPEN",
	SET_EVENT = "SET_EVENT",
	SET_PROPERTY = "SET_PROPERTY",
	SET_PLACE = "SET_PLACE",
	SET_RESERVATION_STEP = "SET_RESERVATION_STEP",
	SET_SELECTED_PROPERTIES_TO_RENT = "SET_SELECTED_PROPERTIES_TO_RENT",
	SET_NOTIFICATION = "SET_NOTIFICATION",
	SET_SERVICES = "SET_SERVICES",
	SET_POPERTIES_FOR_TEMPLATES = "SET_POPERTIES_FOR_TEMPLATES",
	SET_FILTERS = "SET_FILTERS",
}

// export const setUserAction = (payload: any) => ({
// 	type: Actions.SET_USER,
// 	payload,
// })

// export const setUserDataAction = (payload: any) => ({
// 	type: Actions.SET_USER_DATA,
// 	payload,
// })

// export const setThemeAction = (payload: any) => ({
// 	type: Actions.SET_THEME,
// 	payload,
// })

// export const setLanguageAction = (payload: any) => ({
// 	type: Actions.SET_LANG,
// 	payload,
// })

// export const setEventFormOpen = (payload: any) => ({
// 	type: Actions.SET_OPEN,
// 	payload,
// })

// export const setPropertyAction = (payload: any) => ({
// 	type: Actions.SET_PROPERTY,
// 	payload,
// })

// export const setPlaceAction = (payload: any) => ({
// 	type: Actions.SET_PLACE,
// 	payload,
// })

export const setReservationStepAction = (payload: string) => ({
	type: Actions.SET_RESERVATION_STEP,
	payload,
})

export const setSelectedPropertiesToRent = (payload: ReservationForProperty[] | []) => ({
	type: Actions.SET_SELECTED_PROPERTIES_TO_RENT,
	payload,
})

export interface ServicesPayload {
	reservations: ReservationForProperty[]
	totalPrice: number
	totalPriceOnline: number
	remainingGuests: number
	parkingTotal: number
	petsTotal?: number
	breakfastTotal?: number
	babyCribTotal?: number
	babyBedLinenTotal?: number
	cleaningFee?: number
	cityTax?: number
	paymentOption?: "30" | "100"
	discountData?: DiscountData | null
	discountTotal?: number
	currentTotalPrice?: number
	parsedRemarks?: unknown
	notes?: string
}

export const setServices = (payload: ServicesPayload) => ({
	type: Actions.SET_SERVICES,
	payload,
})

export const setNotification = (payload: Notification) => ({
	type: Actions.SET_NOTIFICATION,
	payload,
})

// export const setPropertyForTemplatesAction = (payload: any) => ({
// 	type: Actions.SET_POPERTIES_FOR_TEMPLATES,
// 	payload,
// })

// export const setEvent = (payload: any) => {
// 	const action = {
// 		type: Actions.SET_EVENT,
// 		payload: {
// 			...payload,
// 		},
// 	}

// 	if (payload?.startDate) {
// 		action.payload.startDate = payload.startDate.toISOString()
// 	}

// 	if (payload?.endDate) {
// 		action.payload.endDate = payload.endDate.toISOString()
// 	}

// 	if (payload?.date) {
// 		action.payload.date = payload.date.toISOString()
// 	}

// 	return action
// }

// export const setFilters = (payload: any) => ({
// 	type: Actions.SET_FILTERS,
// 	payload,
// })
