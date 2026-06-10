/** @format */

"use client"

import { ScrollIndicator, Section } from "../Section"
import BookNowButton from "../BookNowButton"
import TopBar from "../TopBar"
import type { Dictionary } from "../../../types/dictionary"
import { useEffect, useState } from "react"
import Logo from "../Logo"
import LogoOrly from "../LogoOrly"

interface Offer {
	id: string
	title: string
	shortDescription: string
	fullContent: string
	color: string
	icon: string
}

type HeroProps = {
	home: {
		hero: {
			title: string
			subtitle: string
			features?: readonly string[]
			bookNow?: string
		}
		booking?: {
			title: string
			description: string
			checkIn: string
			checkOut: string
			guests: string
			continue: string
			close: string
		}
	}
	currentSection: string
	dictionary: Dictionary
}

// Component for animated letter splits
const AnimatedText = ({ text, delay = 0 }: { text: string; delay?: number }) => {
	const [isVisible, setIsVisible] = useState(false)

	useEffect(() => {
		const timer = setTimeout(() => setIsVisible(true), delay)
		return () => clearTimeout(timer)
	}, [delay])

	return (
		<span className="inline-block">
			{text.split("").map((char, index) => (
				<span
					key={index}
					className={`inline-block transition-all duration-700 ease-out transform ${
						isVisible ? "translate-y-0 opacity-100 rotate-0" : "translate-y-16 opacity-0 rotate-12"
					}`}
					style={{
						transitionDelay: `${delay + index * 80}ms`,
					}}>
					{char === " " ? "\u00A0" : char}
				</span>
			))}
		</span>
	)
}

// Component for word-by-word animation
const AnimatedWords = ({ text, delay = 0 }: { text: string; delay?: number }) => {
	const [isVisible, setIsVisible] = useState(false)

	useEffect(() => {
		const timer = setTimeout(() => setIsVisible(true), delay)
		return () => clearTimeout(timer)
	}, [delay])

	return (
		<span>
			{text.split(" ").map((word, index) => (
				<span
					key={index}
					className={`inline-block mr-2 transition-all duration-800 ease-out ${isVisible ? "translate-y-0 opacity-100 blur-none" : "translate-y-8 opacity-0 "}`}
					style={{
						transitionDelay: `${delay + index * 120}ms`,
					}}>
					{word}
				</span>
			))}
		</span>
	)
}

export default function HeroSection({ home, currentSection, dictionary }: HeroProps) {
	const [showButton, setShowButton] = useState(false)
	const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null)
	const [isDialogOpen, setIsDialogOpen] = useState(false)

	useEffect(() => {
		// Trigger button animation after title and subtitle animations
		const timer = setTimeout(() => setShowButton(true), 1800)
		return () => clearTimeout(timer)
	}, [])

	const openOfferDialog = (offer: Offer) => {
		setSelectedOffer(offer)
		setIsDialogOpen(true)

		// Set last minute filter if this is the last minute offer
		if (offer.id === "last-minute-weekend") {
			localStorage.setItem("lastMinuteOnly", JSON.stringify(true))
			// Dispatch custom event to notify other components
			window.dispatchEvent(new Event("localStorageChange"))
		}
	}

	const getShortOfferText = (offerType: "breakfast" | "lastMinute") => {
		// Simple language detection based on dictionary content
		const isPolish = dictionary.offers.breakfastStay.title.includes("śniadaniem")
		const isSpanish = dictionary.offers.breakfastStay.title.includes("desayuno")
		const isGerman = dictionary.offers.breakfastStay.title.includes("Frühstück")

		if (offerType === "breakfast") {
			if (isPolish) return "Śniadanie"
			if (isSpanish) return "Desayuno"
			if (isGerman) return "Frühstück"
			return "Breakfast" // English default
		} else {
			if (isPolish) return "Last Minute"
			if (isSpanish) return "Último Minuto"
			if (isGerman) return "Last Minute"
			return "Last Minute" // English default
		}
	}

	const closeOfferDialog = () => {
		setIsDialogOpen(false)
		setSelectedOffer(null)
	}

	const breakfastOffer = {
		id: "breakfast-stay",
		title: dictionary.offers.breakfastStay.title,
		shortDescription: dictionary.offers.breakfastStay.shortDescription,
		fullContent: dictionary.offers.breakfastStay.fullContent,
		color: "from-amber-500 to-orange-600",
		icon: "🥐",
	}

	const lastMinuteOffer = {
		id: "last-minute-weekend",
		title: dictionary.offers.lastMinuteWeekend.title,
		shortDescription: dictionary.offers.lastMinuteWeekend.shortDescription,
		fullContent: dictionary.offers.lastMinuteWeekend.fullContent,
		color: "from-red-500 to-purple-600",
		icon: "⏰",
	}

	// Add null checks for home and home.hero
	if (!home || !home.hero) {
		return (
			<Section id="hero" bgImage="/images/tlo.jpg">
				<div className="text-center text-white">
					<h1 className="text-5xl md:text-7xl font-bold mb-6 drop-shadow-lg">
						<AnimatedText text="Mountain Apartments" delay={300} />
					</h1>
					<p className="text-xl md:text-2xl max-w-3xl mx-auto mb-8 drop-shadow-md">
						<AnimatedWords text="Loading..." delay={1000} />
					</p>
				</div>
			</Section>
		)
	}

	// Default booking details if not provided
	const booking = home.booking || {
		title: "Book Your Stay",
		description: "Please fill in the details below to book your mountain apartment.",
		checkIn: "Check-in Date",
		checkOut: "Check-out Date",
		guests: "Guests",
		continue: "Continue Booking",
		close: "Close",
	}
	return (
		<Section id="hero" bgImage="/images/bg.webp" className="min-h-screen flex flex-col justify-center items-center text-center px-4">
			{/* TopBar only visible when on hero section */}
			<div className="w-full flex justify-center sm:justify-start items-center gap-4 mb-4 px-4">
				<Logo />
				<LogoOrly />
			</div>
			{currentSection === "hero" && <TopBar dictionary={dictionary} />}
			<div className="text-center text-white relative">
				{/* Animated Title with letter splits */}
				<div className="mb-6 overflow-hidden">
					<h1 className="text-5xl md:text-7xl font-bold drop-shadow-2xl bg-slate-600 bg-opacity-30 px-6 py-3 rounded-xl inline-block border border-white border-opacity-20">
						<AnimatedWords text={home.hero.title} delay={400} />
					</h1>
				</div>

				{/* Animated Subtitle with word-by-word effect */}
				<div className="mb-10 overflow-hidden w-full px-4">
					<p className="text-xl md:text-2xl drop-shadow-xl bg-slate-600 bg-opacity-30 px-6 py-4 rounded-xl  border border-white border-opacity-10">
						<AnimatedWords text={home.hero.subtitle} delay={1200} />
					</p>
				</div>

				{/* Additional descriptive text */}
				<div className="mb-6 overflow-hidden w-full px-4">
					<p className="text-sm md:text-base text-white/90 drop-shadow-lg text-center whitespace-normal">{(home.hero.features || []).join(", ")}</p>
				</div>

				{/* Animated Book Now Button */}
				<div
					className={`mb-8 transition-all duration-1000 ease-out ${showButton ? "translate-y-0 opacity-100 scale-100" : "translate-y-16 opacity-0 scale-75"}`}>
					<div className="transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 ease-out">
						<BookNowButton bookNowText={home.hero.bookNow || "Book Now"} booking={booking} dictionary={dictionary} />
					</div>
				</div>

				{/* Special Offers Buttons */}
				<div
					className={`mb-8 transition-all duration-1000 ease-out ${showButton ? "translate-y-0 opacity-100 scale-100" : "translate-y-16 opacity-0 scale-75"}`}
					style={{ transitionDelay: "200ms" }}>
					<div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
						<button
							onClick={() => openOfferDialog(breakfastOffer)}
							className="flex-1 px-8 py-3 bg-gradient-to-r from-[#cc9678] via-[#b8856a] to-[#a3745c] text-white rounded-lg hover:from-[#b8856a] hover:via-[#a3745c] hover:to-[#8e634e] transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-lg backdrop-blur-sm border border-white border-opacity-20 text-xl font-semibold">
							<div className="flex items-center justify-center gap-2">
								<span className="font-semibold">{getShortOfferText("breakfast")}</span>
							</div>
						</button>
						<button
							onClick={() => openOfferDialog(lastMinuteOffer)}
							className="flex-1 px-8 py-3 bg-gradient-to-r from-[#cc9678] via-[#b8856a] to-[#a3745c] text-white rounded-lg hover:from-[#b8856a] hover:via-[#a3745c] hover:to-[#8e634e] transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-lg backdrop-blur-sm border border-white border-opacity-20 text-xl font-semibold">
							<div className="flex items-center justify-center gap-2">
								<span className="font-semibold">{getShortOfferText("lastMinute")}</span>
							</div>
						</button>
					</div>
				</div>

				{/* Animated Scroll Indicator */}
				{currentSection !== "contact" && (
					<div
						className={`transition-all duration-1000 ease-out transform ${showButton ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
						style={{ transitionDelay: "500ms" }}>
						<ScrollIndicator />
					</div>
				)}

				{/* Floating particles effect */}
				<div className="absolute inset-0 overflow-hidden pointer-events-none">
					{[...Array(6)].map((_, i) => (
						<div
							key={i}
							className={`absolute w-2 h-2 bg-white bg-opacity-20 rounded-full transition-all duration-1000 ${
								showButton ? "opacity-100 animate-bounce" : "opacity-0"
							}`}
							style={{
								left: `${20 + i * 12}%`,
								top: `${30 + (i % 3) * 15}%`,
								animationDelay: `${i * 0.3}s`,
								animationDuration: `${3 + i * 0.5}s`,
							}}
						/>
					))}
				</div>
			</div>

			{/* Offer Dialog/Modal */}
			{isDialogOpen && selectedOffer && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeOfferDialog}>
					<div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
						<div className={`bg-gradient-to-r ${selectedOffer.color} text-white p-6`}>
							<div className="flex justify-end items-center">
								<button onClick={closeOfferDialog} className="text-white hover:text-gray-200 text-2xl font-bold">
									×
								</button>
							</div>
							<h2 className="text-2xl font-bold mt-4">{selectedOffer.title}</h2>
						</div>
						<div className="p-6">
							<div className="whitespace-pre-line text-gray-700 leading-relaxed">{selectedOffer.fullContent}</div>
							<div className="mt-6 flex justify-end gap-3">
								<BookNowButton bookNowText={dictionary.apartments.bookNow || "Book Now"} booking={booking} dictionary={dictionary} />
							</div>
						</div>
					</div>
				</div>
			)}
		</Section>
	)
}
