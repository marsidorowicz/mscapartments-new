/** @format */

"use client"

import { Dictionary } from "../../../types/dictionary"
import { Locale } from "../../../i18n-config"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { activeOffers } from "../../../../lib/activeOffers"

type ModernOffersSectionProps = {
	dictionary: Dictionary
	lang: Locale
}

type LocalFeature = {
	id: string
	image: string
	text: {
		pl: string
		en: string
		de: string
		es: string
	}
}

function FeatureCard({ feature, lang }: { feature: LocalFeature; lang: string }) {
	const [isLoaded, setIsLoaded] = useState(false)
	return (
		<div className="flex flex-col items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
			<div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
				<Image
					src={feature.image}
					alt={feature.text[lang as keyof typeof feature.text] || feature.text.en}
					fill
					sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
					className={`object-cover transition-opacity duration-700 ease-in-out ${isLoaded ? "opacity-100" : "opacity-0"}`}
					quality={70}
					onLoad={() => setIsLoaded(true)}
				/>
				{!isLoaded && <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>}
			</div>
			<h4 className="text-gray-800 font-semibold text-center text-lg mt-2">{feature.text[lang as keyof typeof feature.text] || feature.text.en}</h4>
		</div>
	)
}

export default function ModernOffersSection({ dictionary, lang }: ModernOffersSectionProps) {
	const localFeatures: LocalFeature[] = [
		{
			id: "view",
			image: "/images/features/view.webp",
			text: {
				pl: "Widok na Tatry",
				en: "View of the Tatra Mountains",
				de: "Blick auf die Hohe Tatra",
				es: "Vistas a los montes Tatras",
			},
		},
		{
			id: "breakfast",
			image: "/images/features/breakfast.webp",
			text: {
				pl: "Śniadania pod drzwi",
				en: "Breakfast delivered to your door",
				de: "Frühstück an die Tür geliefert",
				es: "Desayuno a la puerta",
			},
		},
		{
			id: "spa",
			image: "/images/features/spa.webp",
			text: {
				pl: "Strefa SPA",
				en: "SPA zones",
				de: "SPA-Bereiche",
				es: "Zonas de SPA",
			},
		},
		{
			id: "fireplace",
			image: "/images/features/fireplace.webp",
			text: {
				pl: "Kominek w apartamencie",
				en: "Fireplace in the apartment",
				de: "Kamin im Apartment",
				es: "Chimenea en el apartamento",
			},
		},
		{
			id: "location",
			image: "/images/features/location.webp",
			text: {
				pl: "Najlepsze lokalizacje",
				en: "Best locations",
				de: "Beste Standorte",
				es: "Las mejores ubicaciones",
			},
		},
	]

	const [currentSlide, setCurrentSlide] = useState(0)
	const [isAutoPlaying, setIsAutoPlaying] = useState(true)
	const [isExpanded, setIsExpanded] = useState(false)

	const nextSlide = () => {
		const newIndex = (currentSlide + 1) % activeOffers.length
		goToSlide(newIndex)
	}

	const prevSlide = () => {
		const newIndex = (currentSlide - 1 + activeOffers.length) % activeOffers.length
		goToSlide(newIndex)
	}

	const goToSlide = (index: number) => {
		setCurrentSlide(index)
		setIsAutoPlaying(false)
		// Resume auto-play after 10 seconds of inactivity
		setTimeout(() => setIsAutoPlaying(true), 10000)
	}

	// Auto-slide functionality
	useEffect(() => {
		if (!isAutoPlaying) return

		const interval = setInterval(() => {
			setCurrentSlide((prev) => (prev + 1) % activeOffers.length)
		}, 4000) // Change slide every 4 seconds

		return () => clearInterval(interval)
	}, [isAutoPlaying])

	const currentOffer = activeOffers[currentSlide]

	const offerDescription = currentOffer.description[lang as keyof typeof currentOffer.description] || currentOffer.description.en
	const isTruncated = offerDescription.length > 50
	const displayedOfferDescription = isTruncated && !isExpanded ? `${offerDescription.slice(0, 100).trimEnd()}...` : offerDescription
	const toggleLabel = isExpanded ? dictionary.home.offersSection?.collapse || "Collapse" : dictionary.home.offersSection?.expand || "Expand"

	return (
		<div className="py-16 bg-white w-full">
			<div className="container mx-auto px-4">
				{/* Active Offers Slider */}
				<div className="text-center mb-12">
					<div className="relative  mx-auto">
						{/* Slider Content */}
						<div className="bg-[#1D2430] rounded-xl p-8 text-white h-[300px] md:h-[180px] overflow-y-auto overflow-x-hidden">
							<h2 className="text-2xl md:text-3xl font-bold mb-2 text-[#CDA07B]">
								{currentOffer.title[lang as keyof typeof currentOffer.title] || currentOffer.title.en}
							</h2>
							<button
								type="button"
								onClick={() => {
									if (!isTruncated) return
									const nextExpanded = !isExpanded
									setIsExpanded(nextExpanded)
									setIsAutoPlaying(!nextExpanded)
								}}
								className={`text-left text-lg mb-4 ml-10 mr-10 opacity-90 ${isTruncated ? "cursor-pointer" : "cursor-default"}`}>
								{displayedOfferDescription}
								{isTruncated && <span className="ml-2 text-sm font-semibold underline">{toggleLabel}</span>}
							</button>
							<div className="text-sm font-medium mb-4">
								{currentOffer.isAlwaysValid
									? dictionary.offersPage?.alwaysValid || "Always valid"
									: `${dictionary.offersPage?.validUntil || "Valid until"} ${currentOffer.validUntil}`}
							</div>
						</div>

						{/* Navigation Arrows */}
						{activeOffers.length > 1 && (
							<>
								<button
									onClick={prevSlide}
									className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-gray-50 shadow-xl rounded-full p-3 transition-all duration-200 border border-gray-200">
									<svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
									</svg>
								</button>
								<button
									onClick={nextSlide}
									className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-gray-50 shadow-xl rounded-full p-3 transition-all duration-200 border border-gray-200">
									<svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
									</svg>
								</button>
							</>
						)}

						{/* Dots Navigation */}
						{activeOffers.length > 1 && (
							<div className="flex justify-center mt-6 gap-2">
								{activeOffers.map((_, index) => (
									<button
										key={index}
										onClick={() => goToSlide(index)}
										className={`w-3 h-3 rounded-full transition-all duration-200 ${
											index === currentSlide ? "bg-[#1D2430]" : "bg-gray-300 hover:bg-gray-400"
										}`}
									/>
								))}
							</div>
						)}

						{/* Auto-play indicator */}
						{/* {activeOffers.length > 1 && (
							<div className="flex justify-center mt-4">
								<button
									onClick={() => setIsAutoPlaying(!isAutoPlaying)}
									className={`text-sm px-3 py-1 rounded-full transition-colors ${
										isAutoPlaying ? "bg-[#cc9678] text-white" : "bg-gray-100 text-gray-600"
									}`}
									aria-label={isAutoPlaying ? "Pause slideshow" : "Play slideshow"}>
									{isAutoPlaying ? "⏸️ Auto" : "▶️ Auto"}
								</button>
							</div>
						)} */}
					</div>
				</div>

				{/* Special Offers Button */}
				{/* <div className="flex justify-center mb-16">
					<Link
						href={`/${lang}/offers`}
						className="bg-[#cc9678] hover:bg-[#7a4a35] text-white shadow-lg rounded-md text-lg font-semibold py-3 px-8 transition-colors duration-200 border-0 outline-none">
						{dictionary.home.hero.specialOffers || dictionary.navigation.offers || "Special Offers"}
					</Link>
				</div> */}

				{/* Features Section */}
				<div className="bg-gray-50 rounded-xl p-8">
					<div className="text-center mb-8">
						<h3 className="text-2xl font-bold text-gray-800 mb-3">
							{dictionary.home.offersSection?.featuresTitle || "Co oferujemy naszym gościom"}
						</h3>
						<p className="text-gray-600">
							{dictionary.home.offersSection?.featuresSubtitle || "Wszystkie nasze apartamenty wyposażone są w najwyższej jakości udogodnienia"}
						</p>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
						{localFeatures.map((feature) => (
							<FeatureCard key={feature.id} feature={feature} lang={lang} />
						))}
					</div>
				</div>

				{/* Bottom CTA */}
				<div className="text-center mt-12">
					<div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
						<Link
							href={`/${lang}/offers`}
							className="w-full sm:w-auto bg-[#1D2430] hover:bg-[#353f50] text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors duration-200 text-center">
							{dictionary.home.offersSection?.viewAllOffers || "Zobacz wszystkie oferty"}
						</Link>
						<Link
							href={`/${lang}/contact`}
							className="w-full sm:w-auto border-2 border-[#1D2430] text-[#1D2430] hover:bg-[#CDA07B] hover:text-white px-8 py-3 rounded-lg text-lg font-semibold transition-all duration-200 text-center">
							{dictionary.home.offersSection?.contactUs || "Skontaktuj się z nami"}
						</Link>
					</div>
				</div>
			</div>
		</div>
	)
}
