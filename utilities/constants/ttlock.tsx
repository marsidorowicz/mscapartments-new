/** @format */

export const enum TTLOCK_API_CALLS {
	GET_LOCK_LIST = "https://euapi.ttlock.com/v3/lock/list",
	GET_ACCESS_TOKEN = "https://euapi.ttlock.com/oauth2/token",
	GET_EKEYS = "https://euapi.ttlock.com/v3/key/list",
	// GET_PASSCODES = "https://api.sciener.com/v3/keyboardPwd/get",
	GET_PASSCODE = "https://euapi.ttlock.com/v3/keyboardPwd/get",
	ADD_CUSTOM_PASSCODE = "https://euapi.ttlock.com/v3/keyboardPwd/add",
	DEL_PASSCODE = "https://euapi.ttlock.com/v3/keyboardPwd/delete",
	GET_ALL_PASSCODES = "https://euapi.ttlock.com/v3/lock/listKeyboardPwd",
}
