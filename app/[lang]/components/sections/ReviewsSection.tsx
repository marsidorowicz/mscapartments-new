/** @format */

"use client"

import { useEffect, useState } from "react"

interface Review {
	id: number
	rating: string
	content: string
	author: string
	platform: string
}

interface ReviewsSectionProps {
	reviews: {
		title: string
		reviews: readonly Review[]
	}
}

export default function ReviewsSection({ reviews }: ReviewsSectionProps) {
	const [currentIndex, setCurrentIndex] = useState(0)
	const [isAutoPlaying, setIsAutoPlaying] = useState(true)

	// Auto-slide functionality
	useEffect(() => {
		if (!isAutoPlaying) return

		const interval = setInterval(() => {
			setCurrentIndex((prevIndex) =>
				prevIndex === reviews.reviews.length - 1 ? 0 : prevIndex + 1
			)
		}, 4000) // Change slide every 4 seconds

		return () => clearInterval(interval)
	}, [isAutoPlaying, reviews.reviews.length])

	const goToSlide = (index: number) => {
		setCurrentIndex(index)
		setIsAutoPlaying(false)
		// Resume auto-play after 10 seconds of inactivity
		setTimeout(() => setIsAutoPlaying(true), 10000)
	}

	const goToPrevious = () => {
		const newIndex =
			currentIndex === 0 ? reviews.reviews.length - 1 : currentIndex - 1
		goToSlide(newIndex)
	}

	const goToNext = () => {
		const newIndex =
			currentIndex === reviews.reviews.length - 1 ? 0 : currentIndex + 1
		goToSlide(newIndex)
	}

	return (
		<div className="z-10 relative container mx-auto px-4 h-full flex items-center">
			<div className="w-full max-w-4xl mx-auto">
				<h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-8 md:mb-12 text-gray-800">
					{reviews.title}
				</h2>

				{/* Reviews Slider Container */}
				<div className="relative">
					{/* Slider Content */}
					<div className="overflow-hidden rounded-lg bg-white shadow-xl">
						<div
							className="flex transition-transform duration-500 ease-in-out"
							style={{
								transform: `translateX(-${
									currentIndex * 100
								}%)`,
							}}
						>
							{reviews.reviews.map((review) => (
								<div
									key={review.id}
									className="w-full flex-shrink-0 p-6 md:p-8 lg:p-12"
								>
									{/* Rating */}
									<div className="text-center mb-6">
										<div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">
											{review.rating}
										</div>
										<div className="flex justify-center mb-4">
											{[...Array(5)].map((_, i) => (
												<svg
													key={i}
													className="w-6 h-6 text-yellow-400 fill-current"
													viewBox="0 0 24 24"
												>
													<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
												</svg>
											))}
										</div>
									</div>

									{/* Review Content */}
									<blockquote className="text-lg md:text-xl text-gray-700 text-center mb-6 leading-relaxed">
										&ldquo;{review.content}&rdquo;
									</blockquote>

									{/* Author and Platform */}
									<div className="text-center">
										<div className="font-semibold text-gray-800 text-lg mb-1">
											{review.author}
										</div>
										<div className="text-blue-600 font-medium">
											{review.platform}
										</div>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Navigation Arrows */}
					<button
						onClick={goToPrevious}
						className="absolute left-4 top-1/2 -translate-y-1/2 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-800 w-12 h-12 rounded-full shadow-lg transition-all duration-200 flex items-center justify-center z-10"
						aria-label="Previous review"
					>
						<svg
							className="w-6 h-6"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M15 19l-7-7 7-7"
							/>
						</svg>
					</button>

					<button
						onClick={goToNext}
						className="absolute right-4 top-1/2 -translate-y-1/2 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-800 w-12 h-12 rounded-full shadow-lg transition-all duration-200 flex items-center justify-center z-10"
						aria-label="Next review"
					>
						<svg
							className="w-6 h-6"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M9 5l7 7-7 7"
							/>
						</svg>
					</button>

					{/* Dots Indicator */}
					<div className="flex justify-center mt-6 space-x-2">
						{reviews.reviews.map((_, index) => (
							<button
								key={index}
								onClick={() => goToSlide(index)}
								className={`w-3 h-3 rounded-full transition-all duration-200 ${
									index === currentIndex
										? "bg-blue-600 scale-110"
										: "bg-gray-300 hover:bg-gray-400"
								}`}
								aria-label={`Go to review ${index + 1}`}
							/>
						))}
					</div>

					{/* Auto-play indicator */}
					<div className="flex justify-center mt-4">
						<button
							onClick={() => setIsAutoPlaying(!isAutoPlaying)}
							className={`text-sm px-3 py-1 rounded-full transition-colors ${
								isAutoPlaying
									? "bg-blue-100 text-blue-600"
									: "bg-gray-100 text-gray-600"
							}`}
							aria-label={
								isAutoPlaying
									? "Pause slideshow"
									: "Play slideshow"
							}
						>
							{isAutoPlaying ? "⏸️ Auto" : "▶️ Auto"}
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}
