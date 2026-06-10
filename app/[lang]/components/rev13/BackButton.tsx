/** @format */
"use client"
// import React from "react"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import { useDispatch } from "react-redux"
import { setReservationStepAction } from "@/state/action-creators"
import { Button } from "@mui/material"

// interface ITranslation {
// 	previous: string
// }

// const translations: Record<"en" | "pl" | "it" | "de", ITranslation> = {
// 	en: {
// 		previous: "Previous",
// 	},
// 	pl: {
// 		previous: "Wstecz",
// 	},
// 	it: {
// 		previous: "Precedente",
// 	},
// 	de: {
// 		previous: "Zurück",
// 	},
// }

interface BackButtonProps {
	step: string
	text?: string
	locale: "en" | "pl" | "it" | "de"
	onBack?: () => void
}

function BackButton({ step, onBack }: BackButtonProps) {
	const dispatch = useDispatch()

	// const t = (key: keyof ITranslation): string => {
	// 	return translations[locale][key]
	// }

	return (
		<Button
			variant="contained"
			onClick={() => {
				onBack?.()
				dispatch(setReservationStepAction(step))
			}}
			startIcon={<ArrowBackIcon />}
			sx={{
				backgroundColor: "#cc9678",
				color: "#fff",
				// minWidth: "60px",
				justifyContent: "flex-center",
				transition: "colors 0.2s",
				"&:hover": {
					backgroundColor: "#cc9678",
				},
			}}></Button>
	)
}

export default BackButton
