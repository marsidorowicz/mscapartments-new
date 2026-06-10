/** @format */

export const enum LANGUAGES {
	PL = "pl",
	EN = "en",
	IT = "it",
}

export const enum API_CALLS {
	TTLOCK_GET_LOCK_LIST = "/api/ttlock/getLockList",
	TTLOCK_GET_ACCESS_TOKEN = "/api/ttlock/getAccessToken",
	TTLOCK_ADD_CREDENTIALS = "/api/ttlock/addTTLockCredentials",
	TTLOCK_GET_CUSTOM_PASSCODE = "/api/ttlock/getCustomPasscode",
	TTLOCK_GET_PASSCODE = "/api/ttlock/getPasscode",
	TTLOCK_DEL_PASSCODE = "/api/ttlock/delPasscode",
	TTLOCK_GET_ALL_PASSCODES = "/api/ttlock/getPasscodes",
	TTLOCK_GET_EKEYS = "/api/ttlock/getEKeys",
	ADD_EVENT = "/api/saveEvent",
	DEL_EVENT = "/api/delEvent",
}
