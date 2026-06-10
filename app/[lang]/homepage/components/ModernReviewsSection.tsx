/** @format */

"use client"

import { Dictionary } from "../../../types/dictionary"
import { useState, useEffect } from "react"
// import BookNowButton from "../../components/BookNowButton"

type ModernReviewsSectionProps = {
	dictionary: Dictionary
}

export default function ModernReviewsSection({}: ModernReviewsSectionProps) {
	const [currentReview, setCurrentReview] = useState(0)
	const [isAutoPlaying, setIsAutoPlaying] = useState(true)
	const [showButtons, setShowButtons] = useState(false)

	useEffect(() => {
		// Trigger button animation after text animations
		const timer = setTimeout(() => setShowButtons(true), 2200)
		return () => clearTimeout(timer)
	}, [])

	const reviews = [
		{
			id: 1,
			name: "Anna Kowalska",
			location: "Warszawa",
			rating: 5,
			text: "Wspaniałe apartamenty! Bardzo czyste, dobrze wyposażone i w świetnej lokalizacji. Widok na Tatry zapierał dech w piersiach. Na pewno wrócimy!",
			avatar: "AK",
		},
		{
			id: 2,
			name: "Marek Nowak",
			location: "Kraków",
			rating: 5,
			text: "Idealne miejsce na zimowy wypoczynek. Apartament bardzo komfortowy, parking dostępny, a obsługa bardzo pomocna. Polecam wszystkim!",
			avatar: "MN",
		},
		{
			id: 3,
			name: "Joanna Wójcik",
			location: "Gdańsk",
			rating: 5,
			text: "Cudowny pobyt w Zakopanem! Apartament przekroczył nasze oczekiwania. Czysto, przestronnie i wszystko co potrzebne do komfortowego pobytu.",
			avatar: "JW",
		},
		{
			id: 4,
			name: "Piotr Zieliński",
			location: "Wrocław",
			rating: 5,
			text: "Fantastyczne miejsce! Apartament bardzo dobrze wyposażony, blisko centrum i głównych atrakcji. Obsługa na najwyższym poziomie.",
			avatar: "PZ",
		},
	]

	// Auto-slide functionality
	useEffect(() => {
		if (!isAutoPlaying) return

		const interval = setInterval(() => {
			setCurrentReview((prev) => (prev + 1) % reviews.length)
		}, 4000) // Change slide every 4 seconds

		return () => clearInterval(interval)
	}, [isAutoPlaying, reviews.length])

	const goToSlide = (index: number) => {
		setCurrentReview(index)
		setIsAutoPlaying(false)
		// Resume auto-play after 10 seconds of inactivity
		setTimeout(() => setIsAutoPlaying(true), 10000)
	}

	const nextReview = () => {
		const newIndex = (currentReview + 1) % reviews.length
		goToSlide(newIndex)
	}

	const prevReview = () => {
		const newIndex = (currentReview - 1 + reviews.length) % reviews.length
		goToSlide(newIndex)
	}

	const renderStars = (rating: number) => {
		return Array.from({ length: 5 }, (_, i) => (
			<svg key={i} className={`w-5 h-5 ${i < rating ? "text-yellow-400" : "text-gray-300"}`} fill="currentColor" viewBox="0 0 20 20">
				<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
			</svg>
		))
	}

	return (
		<div className="py-16 bg-gray-50">
			<div className="container mx-auto px-4">
				<div className="text-center mb-12">
					<h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">Opinie Naszych Gości</h2>
					<p className="text-lg text-gray-600 max-w-2xl mx-auto">Zobacz co mówią o nas nasi goście. Twoja opinia jest dla nas bardzo ważna!</p>
				</div>

				{/* Reviews Carousel */}
				<div className="max-w-4xl mx-auto">
					<div className="bg-white rounded-xl shadow-md p-8 mb-8">
						<div className="text-center mb-6">
							{/* Stars */}
							<div className="flex justify-center mb-4">{renderStars(reviews[currentReview].rating)}</div>

							{/* Review Text */}
							<blockquote className="text-lg text-gray-700 italic mb-6 leading-relaxed">&ldquo;{reviews[currentReview].text}&rdquo;</blockquote>

							{/* Author Info */}
							<div className="flex items-center justify-center gap-4">
								{/* Avatar */}
								<div className="w-12 h-12 bg-[#CDA07B] rounded-full flex items-center justify-center">
									<span className="text-white font-semibold text-sm">{reviews[currentReview].avatar}</span>
								</div>

								{/* Name and Location */}
								<div className="text-left">
									<div className="font-semibold text-gray-800">{reviews[currentReview].name.split(" ")[0]}</div>
									<div className="text-sm text-gray-600">{reviews[currentReview].location}</div>
								</div>
							</div>
						</div>
					</div>

					{/* Navigation */}
					<div className="flex items-center justify-center gap-4">
						<button onClick={prevReview} className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow duration-200">
							<svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
							</svg>
						</button>

						{/* Dots */}
						<div className="flex gap-2">
							{reviews.map((_, index) => (
								<button
									key={index}
									onClick={() => goToSlide(index)}
									className={`w-3 h-3 rounded-full transition-all duration-200 ${
										index === currentReview ? "bg-[#CDA07B]" : "bg-gray-300 hover:bg-gray-400"
									}`}
								/>
							))}
						</div>

						<button onClick={nextReview} className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow duration-200">
							<svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
							</svg>
						</button>
					</div>

					{/* Auto-play indicator */}
					{/* <div className="flex justify-center mt-4">
						<button
							onClick={() => setIsAutoPlaying(!isAutoPlaying)}
							className={`text-sm px-3 py-1 rounded-full transition-colors ${
								isAutoPlaying ? "bg-[#cc9678] text-white" : "bg-gray-100 text-gray-600"
							}`}
							aria-label={isAutoPlaying ? "Pause slideshow" : "Play slideshow"}>
							{isAutoPlaying ? "⏸️ Auto" : "▶️ Auto"}
						</button>
					</div> */}
				</div>

				{/* Stats Section */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
					<div className="text-center">
						<div className="text-3xl font-bold text-[#D6B08A] mb-2">4.9</div>
						<div className="text-sm text-gray-600">Średnia ocena</div>
						<div className="flex justify-center mt-1">{renderStars(5)}</div>
					</div>
					<div className="text-center">
						<div className="text-3xl font-bold text-[#D6B08A] mb-2">100000+</div>
						<div className="text-sm text-gray-600">Zadowolonych gości</div>
					</div>
					<div className="text-center">
						<div className="text-3xl font-bold text-[#D6B08A] mb-2">95%</div>
						<div className="text-sm text-gray-600">Poleca znajomym</div>
					</div>
					<div className="text-center">
						<div className="text-3xl font-bold text-[#D6B08A] mb-2">100%</div>
						<div className="text-sm text-gray-600">Wróciłoby ponownie</div>
					</div>
				</div>

				{/* CTA */}
				<div className="text-center mt-12">
					<p className="text-gray-600 mb-6">Dołącz do grona zadowolonych gości i zarezerwuj swój pobyt już dziś!</p>
					{/* CTA Buttons */}
					<div
						className={`flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-1000 ease-out ${showButtons ? "translate-y-0 opacity-100 scale-100" : "translate-y-16 opacity-0 scale-75"}`}>
						{/* <BookNowButton
							bookNowText={dictionary.home.hero.bookNow || "Book now"}
							booking={
								dictionary.home.booking || {
									title: "Book Your Stay",
									description: "Find and book your perfect accommodation",
									checkIn: "Check-in",
									checkOut: "Check-out",
									guests: "Guests",
									continue: "Continue",
									close: "Close",
								}
							}
							dictionary={dictionary}
							className="!bg-[#cc9678] !hover:bg-[#7a4a35] !text-white !shadow-lg !rounded-md text-lg font-semibold py-3 px-8 transition-colors duration-200 !border-0 !outline-none"
						/> */}
						{/* <Link href={`/${lang}/offers`} className="!bg-[#cc9678] !hover:bg-[#7a4a35] !text-white !shadow-lg !rounded-md text-lg font-semibold py-3 px-8 transition-colors duration-200 !border-0 !outline-none">
											{dictionary.home.hero.specialOffers || dictionary.navigation.offers || "Special Offers"}
										</Link> */}
					</div>
				</div>
			</div>
		</div>
	)
}
