/** @format */
"use client"
import React from "react"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import { useDispatch } from "react-redux"
import { setReservationStepAction } from "@/state/action-creators"
import { Button } from "@mui/material"

interface ITranslation {
	previous: string
}

const translations: Record<"en" | "pl" | "it" | "de", ITranslation> = {
	en: {
		previous: "Previous",
	},
	pl: {
		previous: "Wstecz",
	},
	it: {
		previous: "Precedente",
	},
	de: {
		previous: "Zurück",
	},
}

interface BackButtonProps {
	step: string
	text?: string
	locale: "en" | "pl" | "it" | "de"
}

function BackButton({ step, text, locale }: BackButtonProps) {
	const dispatch = useDispatch()

	const t = (key: keyof ITranslation): string => {
		return translations[locale][key]
	}

	return (
		<Button
			variant="contained"
			color="primary"
			onClick={() => dispatch(setReservationStepAction(step))}
			startIcon={<ArrowBackIcon />}
			sx={{
				minWidth: "120px",
				transition: "colors 0.2s",
				"&:hover": {
					backgroundColor: "primary.dark",
				},
			}}>
			{text || t("previous")}
		</Button>
	)
}

export default BackButton
