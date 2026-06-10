/** @format */

"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { Dictionary } from "../../../types/dictionary"
import { Locale } from "../../../i18n-config"
import { PublicOfferData } from "../../../../types"
import ReservationEngine from "../../components/re/ReservationEngine"

type OfferBookingModalProps = {
	offerData: PublicOfferData & {
		propertyId?: number
		propertyName?: string
	}
	isOpen: boolean
	onClose: () => void
	dictionary: Dictionary
	lang: Locale
}

export default function OfferBookingModal({ offerData, isOpen, onClose, dictionary, lang }: OfferBookingModalProps) {
	const [animationState, setAnimationState] = useState<"entering" | "entered" | "exiting">("entering")
	const [mounted, setMounted] = useState(false)

	// Handle modal closing with animation
	const handleClose = () => {
		setAnimationState("exiting")
		setTimeout(() => {
			onClose()
		}, 300) // Reduced animation duration for faster response
	}

	// Set animation to entered after component mounts
	useEffect(() => {
		setMounted(true)
		const timer = setTimeout(() => {
			setAnimationState("entered")
		}, 50)
		return () => clearTimeout(timer)
	}, [])

	// Don't render on server
	if (!mounted || !isOpen || !offerData) return null

	const modalContent = (
		<>
			{/* Hidden overlay to block navigation dots and other background elements */}
			<div
				className="fixed z-[100]"
				style={{
					position: "fixed",
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					pointerEvents: "all",
					cursor: "default",
				}}
			/>

			<div
				className={`fixed z-[100] transition-opacity duration-300 ${animationState === "entering" ? "opacity-0" : animationState === "exiting" ? "opacity-0" : "opacity-100"}`}
				style={{
					position: "fixed",
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					width: "100vw",
					height: "100vh",
					margin: 0,
					padding: 0,
					transform: "none",
					transformOrigin: "initial",
				}}>
				<div
					className="absolute bg-[#e4d9c7]/95"
					onClick={handleClose}
					style={{
						position: "absolute",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						width: "100%",
						height: "100%",
					}}></div>
				<div
					className="absolute bg-gradient-to-r from-[#f5f0eb] via-[#e4d9c7] to-[#d4a88a] p-4 md:p-8 overflow-auto reservation-engine-modal-content"
					style={{
						position: "absolute",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						display: "flex",
						flexDirection: "column",
						justifyContent: "flex-start",
						alignItems: "center",
						paddingTop: "2rem",
					}}>
					<button
						onClick={handleClose}
						className="absolute top-4 right-4 text-gray-100 hover:text-gray-200 z-10 bg-black bg-opacity-20 rounded-full p-2"
						style={{
							position: "absolute",
							top: "1rem",
							right: "1rem",
							zIndex: 10,
						}}>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round">
							<line x1="18" y1="6" x2="6" y2="18"></line>
							<line x1="6" y1="6" x2="18" y2="18"></line>
						</svg>
					</button>

					<div className="w-full max-w-6xl mx-auto overflow-y-auto" style={{ paddingBottom: "2rem" }}>
						<h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 md:mb-8 text-center text-white">
							{dictionary.home.booking?.title || "Book Your Stay"}
						</h2>
						<ReservationEngine
							id="clok0rd6f0000kkdgyf1pd0t3"
							propertyId={offerData?.propertyId}
							propertyName={offerData?.propertyName}
							filterDictionary={dictionary.filters}
							dictionary={dictionary}
							offerData={offerData}
							onThemeChange={() => ({})}
							initialLocale={lang}
						/>
					</div>
				</div>
			</div>
		</>
	)

	// Render the modal using portal to document.body to avoid parent container interference
	return createPortal(modalContent, document.body)
}
