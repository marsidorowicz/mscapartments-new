/** @format */

import React, { FunctionComponent } from "react"
import Alert from "@mui/material/Alert"
import Snackbar from "@mui/material/Snackbar"
import { RootState } from "@/state/store"
import { useDispatch, useSelector } from "react-redux"
import { setNotification } from "@/state/action-creators"
import { Notification } from "@/types"

const NotificationComponent: FunctionComponent = () => {
	const dispatch = useDispatch()
	const state = useSelector((state: RootState) => state.root)
	const notification: Notification = state?.notification
	const open = notification?.open
	const vertical = notification?.vertical
	const horizontal = notification?.horizontal
	const message = notification?.message
	const severity = notification?.severity
	const time = notification?.time
	const variant = notification?.variant

	const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
		if (reason === "clickaway") {
			return
		}
		const updatedNotification = { ...notification, open: false }
		dispatch(setNotification(updatedNotification))
	}

	return (
		<Snackbar
			anchorOrigin={{
				vertical: vertical ?? "bottom",
				horizontal: horizontal ?? "right",
			}}
			open={open}
			autoHideDuration={time ?? 10000}
			onClose={handleClose}>
			<Alert onClose={(e) => handleClose(e, "alert_close")} severity={severity} variant={variant ?? "filled"}>
				{message}
			</Alert>
		</Snackbar>
	)
}

export { NotificationComponent }
