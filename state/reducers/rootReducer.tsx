/** @format */

import { Place, Property, User, UserData, Notification } from "@/types"
import { ServicesPayload } from "@/state/action-creators"
import { ReservationForProperty } from "@/app/[lang]/components/re/PropertyList"

/** @format */

const initState: {
	user: User | null
	userData: UserData | null
	theme: "light" | "dark"
	lang: "en" | "pl"
	editOpen: boolean
	event: Event | null
	property: Property | null
	place: Place | null
	reservationStep: string
	propertiesSelectedToRent: [] | null
	services: ServicesPayload | null
	notification: Notification | null
	propertiesForTemplates: number[]
	filters: { byCreatedAt: false; startDate?: string | null; endDate?: string | null; totalPrice?: number | null }
	paymentInfo: {
		eventId: number | null
		amount: number
		provider?: string
		orderId?: string
	}
} = {
	user: null,
	userData: null,
	theme: "light",
	lang: "en",
	editOpen: false,
	event: null,
	property: null,
	place: null,
	reservationStep: "dateSelection",
	propertiesSelectedToRent: [],
	services: null,
	notification: null,
	propertiesForTemplates: [],
	filters: { byCreatedAt: false, startDate: null, endDate: null, totalPrice: null },
	paymentInfo: {
		eventId: null,
		amount: 0,
	},
}

export const rootReducer = (
	state = initState,
	action: any, // eslint-disable-line @typescript-eslint/no-explicit-any
) => {
	switch (action.type) {
		case "SET_USER":
			return {
				...state,
				user: action.payload,
			}
		case "SET_USER_DATA":
			return {
				...state,
				userData: action.payload,
			}
		case "SET_THEME":
			return {
				...state,
				theme: action.payload,
			}
		case "SET_LANG":
			return {
				...state,
				lang: action.payload,
			}
		case "SET_OPEN":
			return {
				...state,
				editOpen: action.payload,
			}
		case "SET_EVENT":
			return {
				...state,
				event: action.payload,
			}
		case "SET_PROPERTY":
			return {
				...state,
				property: action.payload,
			}
		case "SET_PLACE":
			return {
				...state,
				place: action.payload,
			}
		case "SET_RESERVATION_STEP":
			return {
				...state,
				reservationStep: action.payload,
			}
		case "SET_SELECTED_PROPERTIES_TO_RENT":
			return {
				...state,
				propertiesSelectedToRent: action.payload.filter(
					(property: ReservationForProperty, index: number, arr: ReservationForProperty[]) =>
						arr.findIndex((p: ReservationForProperty) => p.id === property.id || (p.name === property.name && p.location === property.location)) ===
						index,
				),
			}
		case "SET_NOTIFICATION":
			console.log("REDUCER SET_NOTIFICATION:", action.payload);
			return {
				...state,
				notification: action.payload,
			}
		case "SET_SERVICES":
			return {
				...state,
				services: action.payload,
			}
		case "SET_POPERTIES_FOR_TEMPLATES":
			return {
				...state,
				propertiesForTemplates: action.payload,
			}
		case "SET_FILTERS":
			return {
				...state,
				filters: action.payload,
			}
		case "SET_PAYMENT_INFO":
			return {
				...state,
				paymentInfo: action.payload,
			}
		default:
			return state
	}
}

export default rootReducer
