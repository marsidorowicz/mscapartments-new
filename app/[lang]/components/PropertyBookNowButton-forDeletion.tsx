/** @format */

"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"

type PropertyBookNowButtonProps = {
	bookNowText: string
	booking: {
		title: string
		description: string
		checkIn: string
		checkOut: string
		guests: string
		continue: string
		close: string
	}
	propertyId: number
	propertyName?: string
	className?: string
}

export default function PropertyBookNowButton({
	bookNowText,
	booking,
	propertyId,
	propertyName,
	className,
}: PropertyBookNowButtonProps) {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [checkInDate, setCheckInDate] = useState("")
	const [checkOutDate, setCheckOutDate] = useState("")
	const [guests, setGuests] = useState(2)

	// Prevent scrolling when modal is open
	useEffect(() => {
		if (isModalOpen) {
			// Lock body scroll
			document.body.style.overflow = "hidden"
			document.body.style.position = "fixed"
			document.body.style.top = `-${window.scrollY}px`
			document.body.style.left = "0"
			document.body.style.right = "0"
		} else {
			// Restore scroll
			const scrollY = parseInt(document.body.style.top || "0", 10) * -1
			document.body.style.overflow = ""
			document.body.style.position = ""
			document.body.style.top = ""
			document.body.style.left = ""
			document.body.style.right = ""
			window.scrollTo(0, scrollY)
		}

		// Cleanup on unmount
		return () => {
			document.body.style.overflow = ""
			document.body.style.position = ""
			document.body.style.top = ""
			document.body.style.left = ""
			document.body.style.right = ""
		}
	}, [isModalOpen])

	// Handle escape key
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape" && isModalOpen) {
				setIsModalOpen(false)
			}
		}

		if (isModalOpen) {
			document.addEventListener("keydown", handleKeyDown)
		}

		return () => {
			document.removeEventListener("keydown", handleKeyDown)
		}
	}, [isModalOpen])

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		// TODO: Implement booking logic with propertyId, checkInDate, checkOutDate, guests
		console.log("Booking submission:", {
			propertyId,
			propertyName,
			checkInDate,
			checkOutDate,
			guests,
		})
		// For now, just close the modal
		setIsModalOpen(false)
	}

	return (
		<>
			{" "}
			<button
				onClick={() => setIsModalOpen(true)}
				className={`group relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 px-8 py-4 text-lg font-semibold text-white shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-2xl hover:from-amber-500 hover:via-yellow-600 hover:to-amber-700 focus:outline-none focus:ring-4 focus:ring-amber-300 focus:ring-opacity-50 ${
					className || ""
				}`}
			>
				{" "}
				<span className="relative z-10 tracking-wide drop-shadow-sm">
					{bookNowText}
				</span>
				{/* Subtle shine effect */}
				<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out"></div>
			</button>
			{/* Full Screen Modal */}
			{isModalOpen &&
				typeof document !== "undefined" &&
				createPortal(
					<div className="fixed inset-0 z-[9999] overflow-y-auto">
						{/* Background Overlay */}
						<div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

						{/* Modal Content */}
						<div className="relative min-h-screen flex items-center justify-center p-4">
							<div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-auto">
								{/* Header */}
								<div className="bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 p-6 rounded-t-2xl">
									<div className="flex items-center justify-between">
										<div>
											<h2 className="text-2xl font-bold text-white">
												{booking.title}
											</h2>
											{propertyName && (
												<p className="text-amber-100 mt-1">
													{propertyName}
												</p>
											)}
										</div>
										<button
											onClick={() =>
												setIsModalOpen(false)
											}
											className="text-white hover:text-amber-200 transition-colors p-2"
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
													d="M6 18L18 6M6 6l12 12"
												/>
											</svg>
										</button>
									</div>
									<p className="text-amber-100 mt-3">
										{booking.description}
									</p>
								</div>

								{/* Form Content */}
								<form
									onSubmit={handleSubmit}
									className="p-6 space-y-6"
								>
									{/* Property ID (hidden, for future use) */}
									<input type="hidden" value={propertyId} />
									{/* Date Selection */}
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												{booking.checkIn}
											</label>
											<input
												type="date"
												value={checkInDate}
												onChange={(e) =>
													setCheckInDate(
														e.target.value
													)
												}
												className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
												required
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												{booking.checkOut}
											</label>
											<input
												type="date"
												value={checkOutDate}
												onChange={(e) =>
													setCheckOutDate(
														e.target.value
													)
												}
												className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
												required
											/>
										</div>
									</div>
									{/* Guests Selection */}
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											{booking.guests}
										</label>
										<select
											value={guests}
											onChange={(e) =>
												setGuests(
													parseInt(e.target.value)
												)
											}
											className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
										>
											{[
												1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
											].map((num) => (
												<option key={num} value={num}>
													{num}{" "}
													{num === 1
														? "Guest"
														: "Guests"}
												</option>
											))}
										</select>
									</div>
									{/* Property Info Display */}
									<div className="bg-gray-50 rounded-lg p-4">
										<h3 className="font-semibold text-gray-800 mb-2">
											Booking Summary
										</h3>
										<div className="space-y-1 text-sm text-gray-600">
											{propertyName && (
												<p>
													<span className="font-medium">
														Property:
													</span>{" "}
													{propertyName}
												</p>
											)}
											<p>
												<span className="font-medium">
													Property ID:
												</span>{" "}
												{propertyId}
											</p>
											{checkInDate && checkOutDate && (
												<p>
													<span className="font-medium">
														Dates:
													</span>{" "}
													{checkInDate} to{" "}
													{checkOutDate}
												</p>
											)}
											<p>
												<span className="font-medium">
													Guests:
												</span>{" "}
												{guests}
											</p>
										</div>
									</div>
									{/* Action Buttons */}
									<div className="flex flex-col sm:flex-row gap-3 pt-4">
										<button
											type="button"
											onClick={() =>
												setIsModalOpen(false)
											}
											className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
										>
											{booking.close}
										</button>
										<button
											type="submit"
											className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 text-white rounded-lg hover:from-amber-500 hover:via-yellow-600 hover:to-amber-700 transition-all duration-200 font-semibold shadow-lg"
										>
											{booking.continue}
										</button>
									</div>{" "}
								</form>
							</div>
						</div>
					</div>,
					document.body
				)}
		</>
	)
}
