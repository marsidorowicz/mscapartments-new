/** @format */

"use client"

import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { sendGAEvent } from "@next/third-parties/google"
import ReservationEngine from "./re/ReservationEngine"
import SearchIcon from "@mui/icons-material/Search"
import type { Dictionary } from "../../types/dictionary"

type BookNowButtonProps = {
	propertyId?: number
	propertyName?: string
	bookNowText: string
	booking: {
		title: string
		description: string
		checkIn: string
		checkOut: string
		guests: string
		continue: string
		close: string
		propertyNotAvailable?: string
		suggestAlternatives?: string
		noPropertiesAvailable?: string
		automaticallySelected?: string
	}
	className?: string
	dictionary: Dictionary
}

export default function BookNowButton({ propertyId, propertyName, bookNowText, booking, className, dictionary }: BookNowButtonProps) {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const savedScrollPosition = useRef<number>(0)

	// Prevent scrolling and navigation when modal is open
	useEffect(() => {
		const handleScroll = (e: Event) => {
			if (isModalOpen) {
				// Only prevent scrolling if the target is not inside the modal content
				const target = e.target as Element
				const modalContent = document.querySelector(".reservation-engine-modal-content")

				if (modalContent && modalContent.contains(target)) {
					// Allow scrolling within modal content
					return true
				}

				e.preventDefault()
				e.stopPropagation()
				return false
			}
			return true
		}

		const handleKeyDown = (e: KeyboardEvent) => {
			if (isModalOpen && (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "Tab")) {
				// Only prevent arrow key navigation if not inside modal content
				const target = e.target as Element
				const modalContent = document.querySelector(".reservation-engine-modal-content")

				if (modalContent && modalContent.contains(target)) {
					// Allow keyboard navigation within modal content
					return
				}

				e.preventDefault()
				e.stopPropagation()
			}
		}
		if (isModalOpen) {
			// Save current scroll position before locking
			savedScrollPosition.current = window.scrollY

			// Lock body scroll position
			document.body.style.position = "fixed"
			document.body.style.top = `-${savedScrollPosition.current}px`
			document.body.style.left = "0"
			document.body.style.right = "0"
			document.body.style.bottom = "0"
			document.body.style.width = "100%"

			// Only prevent wheel/touch events on desktop or for specific navigation
			if (window.innerWidth >= 768) {
				document.addEventListener("wheel", handleScroll, {
					passive: false,
				})
			}
			document.addEventListener("keydown", handleKeyDown)

			// Hide all navigation elements
			document.querySelectorAll('[aria-label*="Navigate to"]').forEach((el) => {
				;(el as HTMLElement).style.visibility = "hidden"
			})
			// Hide LocaleSwitcher when modal is open
			const localeSwitcher = document.getElementById("locale-switcher")
			if (localeSwitcher) {
				localeSwitcher.style.visibility = "hidden"
			}
		} else {
			// Restore scroll position - use requestAnimationFrame to ensure it happens after DOM updates
			const scrollY = savedScrollPosition.current

			// Reset body styles
			document.body.style.position = ""
			document.body.style.top = ""
			document.body.style.left = ""
			document.body.style.right = ""
			document.body.style.bottom = ""
			document.body.style.width = ""

			// Restore scroll position after a slight delay to ensure DOM is ready
			requestAnimationFrame(() => {
				window.scrollTo(0, scrollY)
			})

			// Remove event listeners
			document.removeEventListener("wheel", handleScroll)
			document.removeEventListener("keydown", handleKeyDown)

			// Show navigation elements again
			document.querySelectorAll('[aria-label*="Navigate to"]').forEach((el) => {
				;(el as HTMLElement).style.visibility = "visible"
			})
			// Show LocaleSwitcher when modal is closed
			const localeSwitcher = document.getElementById("locale-switcher")
			if (localeSwitcher) {
				localeSwitcher.style.visibility = "visible"
			}
		} // Cleanup on unmount
		return () => {
			document.removeEventListener("wheel", handleScroll)
			document.removeEventListener("keydown", handleKeyDown)

			if (isModalOpen) {
				const scrollY = savedScrollPosition.current
				document.body.style.position = ""
				document.body.style.top = ""
				document.body.style.left = ""
				document.body.style.right = ""
				document.body.style.bottom = ""
				document.body.style.width = ""
				window.scrollTo(0, scrollY)

				// Show navigation elements again
				document.querySelectorAll('[aria-label*="Navigate to"]').forEach((el) => {
					;(el as HTMLElement).style.visibility = "visible"
				})
				// Show LocaleSwitcher again
				const localeSwitcher = document.getElementById("locale-switcher")
				if (localeSwitcher) {
					localeSwitcher.style.visibility = "visible"
				}
			}
		}
	}, [isModalOpen])

	return (
		<>
			<button
				onClick={() => {
					// Send Google Analytics event
					sendGAEvent("event", "book_now_click", {
						event_category: "engagement",
						event_label: propertyName || "book_now_button",
						property_id: propertyId,
						page_location: typeof window !== "undefined" ? window.location.href : "",
					})
					setIsModalOpen(true)
				}}
				className={
					className
						? `${className} flex items-center justify-center`
						: "group relative flex items-center justify-center space-x-2 overflow-hidden rounded-lg bg-gradient-to-r from-[#cc9678] via-[#b8856a] to-[#a3745c] px-8 py-3 text-lg font-semibold text-white shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl hover:from-[#b8856a] hover:via-[#a3745c] hover:to-[#8e634e] focus:outline-none focus:ring-4 focus:ring-[#d4a88a] focus:ring-opacity-50"
				}>
				<span className="relative z-10 tracking-wide drop-shadow-sm">{bookNowText}</span>
				<SearchIcon className="relative z-10 w-5 h-5 text-white flex-shrink-0 ml-2" />
				{/* Subtle shine effect */}
				<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
			</button>
			{isModalOpen && (
				<BookNowModal
					propertyId={propertyId}
					propertyName={propertyName}
					booking={booking}
					isOpen={isModalOpen}
					onClose={() => setIsModalOpen(false)}
					dictionary={dictionary}
				/>
			)}
		</>
	)
}

interface BookNowModalProps {
	propertyId?: number
	propertyName?: string
	booking: BookNowButtonProps["booking"]
	isOpen: boolean
	onClose: () => void
	dictionary: Dictionary
}

function BookNowModal({ propertyId, propertyName, booking, onClose, dictionary }: BookNowModalProps) {
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
	if (!mounted) return null

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
						width: "100%",
						height: "100%",
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
						<h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 md:mb-8 text-center text-white">{booking.title}</h2>
						<ReservationEngine
							id={"clok0rd6f0000kkdgyf1pd0t3"}
							propertyId={propertyId}
							propertyName={propertyName}
							booking={booking}
							filterDictionary={dictionary.filters}
							dictionary={dictionary}
							onThemeChange={() => ({})}
						/>
					</div>
				</div>
			</div>
		</>
	)

	// Render the modal using portal to document.body to avoid parent container interference
	return createPortal(modalContent, document.body)
}
