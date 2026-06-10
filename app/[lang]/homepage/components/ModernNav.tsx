/** @format */

"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Dictionary } from "../../../types/dictionary"
import { Locale } from "../../../i18n-config"
// import BookNowButton from "../../components/BookNowButton"
import ReservationBasket from "./ReservationBasket"
import { useLocalStorageNew } from "@/utilities/hooks/useLocalStorage"
import ShoppingBasketIcon from "@mui/icons-material/ShoppingBasket"
import { generateSlug } from "@/utilities/functions/propertyUrl"

type BasketItem = {
	id: string | number
	name: string
	totalPrice?: number
	currency?: string
}

type ModernNavProps = {
	dictionary: Dictionary
	lang: Locale
}

export default function ModernNav({ dictionary, lang }: ModernNavProps) {
	const [isMenuOpen, setIsMenuOpen] = useState(false)
	const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false)
	const [isBuildingsDropdownOpen, setIsBuildingsDropdownOpen] = useState(false)
	const [isBasketOpen, setIsBasketOpen] = useState(false)
	const dropdownRef = useRef<HTMLDivElement>(null)
	const buildingsDropdownRef = useRef<HTMLDivElement>(null)
	const menuRef = useRef<HTMLDivElement>(null)
	const [canScrollLeft, setCanScrollLeft] = useState(false)
	const [canScrollRight, setCanScrollRight] = useState(false)
	const pathname = usePathname()

	const [basketItems, setBasketItems] = useLocalStorageNew<BasketItem[]>("rootBasket", [])
	const [itemStates, setItemStates] = useLocalStorageNew<Record<string, any>>("rootBasketStates", {})

	const handleRemoveBasketItem = (item: BasketItem) => {
		setBasketItems((prev) => prev.filter((existing) => existing.id !== item.id))
		setItemStates((prev) => {
			const next = { ...prev }
			delete next[item.id.toString()]
			return next
		})
	}

	useEffect(() => {
		const openBasket = () => setIsBasketOpen(true)
		window.addEventListener("open-basket", openBasket)
		return () => window.removeEventListener("open-basket", openBasket)
	}, [])
	const [placesData, setPlacesData] = useState<
		Array<{
			name: string
			id: number
			location: string
		}>
	>([])

	// Helper function to generate language-specific URL
	const getLangUrl = (newLang: string) => {
		const pathSegments = pathname.split("/").filter(Boolean)
		if (pathSegments.length > 0) {
			pathSegments[0] = newLang
		}
		return "/" + pathSegments.join("/")
	}

	// Close language dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsLangDropdownOpen(false)
			}
			if (buildingsDropdownRef.current && !buildingsDropdownRef.current.contains(event.target as Node)) {
				setIsBuildingsDropdownOpen(false)
			}
		}

		if (isLangDropdownOpen || isBuildingsDropdownOpen) {
			document.addEventListener("click", handleClickOutside)
		}

		return () => {
			document.removeEventListener("click", handleClickOutside)
		}
	}, [isLangDropdownOpen, isBuildingsDropdownOpen])

	// Fetch places from database
	useEffect(() => {
		const fetchPlaces = async () => {
			try {
				const response = await fetch("/api/properties/places")
				if (response.ok) {
					const data = await response.json()
					if (data.success && data.places) {
						setPlacesData(data.places)
					}
				}
			} catch (error) {
				console.error("Failed to fetch places:", error)
				// Fallback to mock data if API fails
				setPlacesData([
					{ id: 1, name: "Zakopane", location: "Poland" },
					{ id: 2, name: "Kraków", location: "Poland" },
					{ id: 3, name: "Warsaw", location: "Poland" },
				])
			}
		}

		fetchPlaces()
	}, [])

	// Close language dropdown when mobile menu opens
	useEffect(() => {
		if (isMenuOpen) {
			setIsLangDropdownOpen(false)
			setIsBuildingsDropdownOpen(false)
		}
	}, [isMenuOpen])

	// Check scroll state
	const checkScrollState = () => {
		const menuElement = menuRef.current
		if (menuElement) {
			const scrollLeft = Math.round(menuElement.scrollLeft)
			const maxScroll = Math.round(menuElement.scrollWidth - menuElement.clientWidth)
			// On medium screens, allow some tolerance for the "leftmost" position
			const isAtLeft = window.innerWidth >= 768 && window.innerWidth < 1024 ? scrollLeft <= 10 : scrollLeft <= 0
			const canScrollLeftVal = !isAtLeft
			const canScrollRightVal = scrollLeft < maxScroll - 1
			setCanScrollLeft(canScrollLeftVal)
			setCanScrollRight(canScrollRightVal)
		}
	}

	// Scroll functions
	const scrollLeft = () => {
		const menuElement = menuRef.current
		if (menuElement) {
			menuElement.scrollBy({ left: -0.9 * menuElement.clientWidth, behavior: "smooth" })
			setTimeout(() => checkScrollState(), 300)
		}
	}

	const scrollRight = () => {
		const menuElement = menuRef.current
		if (menuElement) {
			menuElement.scrollBy({ left: 0.9 * menuElement.clientWidth, behavior: "smooth" })
			setTimeout(() => checkScrollState(), 300)
		}
	}

	// Add scroll event listener
	useEffect(() => {
		const menuElement = menuRef.current
		if (menuElement) {
			// Ensure menu starts scrolled to the left
			const ensureLeftScroll = () => {
				menuElement.scrollLeft = 0
			}
			ensureLeftScroll()

			const handleScroll = () => {
				// Close dropdowns immediately on scroll
				setIsBuildingsDropdownOpen(false)
				setIsLangDropdownOpen(false)
				checkScrollState()
			}
			menuElement.addEventListener("scroll", handleScroll)

			// Also ensure left scroll after a short delay in case content loads later
			setTimeout(ensureLeftScroll, 100)
			setTimeout(ensureLeftScroll, 500)

			checkScrollState() // Initial check
			return () => menuElement.removeEventListener("scroll", handleScroll)
		}
	}, [placesData]) // Add placesData as dependency to re-run when data loads

	return (
		<>
			{/* Navigation matching mountainapartments.pl */}
			<nav className="sticky top-0 bg-white shadow-sm w-full z-50">
				<div className="w-full">
					<div className="flex items-center h-16 px-2 lg:pl-8 relative gap-0 md:gap-2 justify-center">
						{/* Logo */}
						<Link href={`/${lang}/`} className="flex items-center flex-shrink-0">
							<Image src="/images/logo-nowe.png" alt="Mountain Apartments" width={172} height={64} className="h-16 w-auto" priority />
						</Link>

						{/* Left Arrow - Fixed position right from logo */}
						{canScrollLeft && (
							<button
								onClick={scrollLeft}
								className="flex-shrink-0 bg-white hover:bg-gray-50 border-2 border-gray-300 rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110 z-50 ml-2"
								aria-label="Scroll left">
								<svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
								</svg>
							</button>
						)}

						{/* Desktop Menu */}
						<div></div>
						<div
							className={`hidden md:flex items-center relative overflow-x-auto scrollbar-hide min-w-0 max-w-full ${!canScrollLeft ? "ml-8" : ""}`}
							ref={menuRef}>
							{" "}
							{/* Menu Container */}
							<div className="flex items-center space-x-6 flex-shrink-0">
								<Link
									href={`/${lang}/apartamenty`}
									className="text-gray-700 hover:text-[#7a4a35] font-medium transition-colors duration-200 whitespace-nowrap flex-shrink-0">
									{dictionary.navigation?.apartments || "Apartamenty"}
								</Link>

								{/* Apartment Buildings - Dropdown */}
								<div className="relative flex-shrink-0" ref={buildingsDropdownRef}>
									<button
										onClick={() => setIsBuildingsDropdownOpen(!isBuildingsDropdownOpen)}
										className="flex items-center space-x-1 text-gray-700 hover:text-[#7a4a35] font-medium transition-colors duration-200 whitespace-nowrap">
										<span>{dictionary.navigation?.apartmentBuildings || "Apartamentowce"}</span>
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
										</svg>
									</button>
								</div>

								<Link
									href={`/${lang}/houses`}
									className="text-gray-700 hover:text-[#7a4a35] font-medium transition-colors duration-200 whitespace-nowrap flex-shrink-0">
									{dictionary.navigation?.houses || "Domki"}
								</Link>

								<Link
									href={`/${lang}/offers`}
									className="text-gray-700 hover:text-[#7a4a35] font-medium transition-colors duration-200 whitespace-nowrap flex-shrink-0">
									{dictionary.navigation?.offers || "Oferty"}
								</Link>

								<Link
									href={`/${lang}/zakopane-noclegi`}
									className="text-gray-700 hover:text-[#7a4a35] font-medium transition-colors duration-200 whitespace-nowrap flex-shrink-0">
									{dictionary.navigation?.zakopaneRooms || "Przewodnik"}
								</Link>

								<Link
									href="/join-us.pdf"
									target="_blank"
									className="text-gray-700 hover:text-[#7a4a35] font-medium transition-colors duration-200 whitespace-nowrap flex-shrink-0">
									{dictionary.navigation?.joinUs || "Oferta Współpracy"}
								</Link>

								<Link
									href={`/${lang}/o-nas`}
									className="text-gray-700 hover:text-[#7a4a35] font-medium transition-colors duration-200 whitespace-nowrap flex-shrink-0">
									{dictionary.navigation?.aboutUs || "O nas"}
								</Link>

								{/* Phone Number */}
								<div className="flex items-center space-x-2 text-gray-600 flex-shrink-0">
									<a
										href={`tel:${dictionary.contactForm?.officePhone || "+48 511 000 660"}`}
										className="font-semibold text-gray-800 hover:text-[#7a4a35] transition-colors duration-200">
										{dictionary.contactForm?.officePhone || "+48 511 000 660"}
									</a>
								</div>

								{/* Language Switcher - Compact */}
								<div className="relative flex-shrink-0" ref={dropdownRef}>
									<button
										onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
										className="flex items-center space-x-1 px-2 py-1 text-sm font-medium text-gray-700 hover:text-[#7a4a35] transition-colors duration-200">
										<span className="text-blue-600">{lang.toUpperCase()}</span>
										<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
										</svg>
									</button>
								</div>

								{/* Reservation Basket Button */}
								<button
									onClick={() => setIsBasketOpen(true)}
									className="relative flex items-center space-x-2 px-3 py-1 text-sm font-medium text-gray-700 hover:text-[#7a4a35] transition-colors duration-200">
									<ShoppingBasketIcon className="h-5 w-5" />
									{basketItems.length > 0 && (
										<span className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-[#cc9678] px-2 text-[0.65rem] font-semibold text-white">
											{basketItems.length}
										</span>
									)}
								</button>

								{/* Book Now Button */}
								{/* <BookNowButton
									bookNowText={dictionary.apartments?.bookNow || "Zarezerwuj"}
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
									className="!bg-[#cc9678] !hover:bg-[#7a4a35] !text-white !shadow-lg !rounded-md font-semibold py-2 px-4 transition-colors duration-200 !border-0 !outline-none flex-shrink-0 mr-4"
								/> */}
								{/* Spacer for scroll calculation */}
								<div className="w-[10px] flex-shrink-0"></div>
							</div>
						</div>

						{/* Scroll Right Arrow - At right edge of nav */}
						{canScrollRight && (
							<button
								onClick={scrollRight}
								className="absolute right-4 top-1/2 -translate-y-1/2 bg-white hover:bg-gray-50 border-2 border-gray-300 rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110 z-50 flex-shrink-0"
								aria-label="Scroll right">
								<svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
								</svg>
							</button>
						)}

						{/* Mobile Phone Info - Hidden on desktop */}
						<div className="md:hidden flex flex-col items-center text-center flex-1 mx-4">
							<span className="text-xs text-gray-600">{dictionary.contactForm?.subtitle2 || "Biuro i Rezerwacje"}</span>
							<a
								href={`tel:${dictionary.contactForm?.officePhone || "+48 511 000 660"}`}
								className="text-sm font-semibold text-gray-800 hover:text-blue-600 transition-colors duration-200">
								{dictionary.contactForm?.officePhone || "+48 511 000 660"}
							</a>
						</div>

						{/* Mobile Menu Button */}
						<button
							onClick={() => setIsMenuOpen(!isMenuOpen)}
							className="md:hidden p-2 rounded-md text-gray-700 hover:text-[#7a4a35] flex-shrink-0">
							<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								{isMenuOpen ? (
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								) : (
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
								)}
							</svg>
						</button>
					</div>

					{/* Apartment Buildings Dropdown - Inside nav for proper positioning */}
					{isBuildingsDropdownOpen && (
						<div
							className="hidden md:block absolute bg-white border border-gray-200 rounded-md shadow-lg z-[99999] min-w-[200px] max-w-[200px] overflow-hidden"
							style={{
								top: "100%",
								left: (() => {
									if (!buildingsDropdownRef.current) return "0px"
									const navRect = buildingsDropdownRef.current.closest("nav")?.getBoundingClientRect()
									const buttonRect = buildingsDropdownRef.current.getBoundingClientRect()
									return navRect ? buttonRect.left - navRect.left + "px" : "0px"
								})(),
							}}
							onMouseLeave={() => setIsBuildingsDropdownOpen(false)}>
							<div className="py-1">
								{placesData.length > 0 ? (
									placesData.map((place) => {
										if (place?.name === "KOŚCIELISKO") return null
										return (
											<Link
												key={place.id}
												href={`/${lang}/place/${generateSlug(place.name)}`}
												className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#7a4a35] transition-colors duration-200"
												onClick={() => setIsBuildingsDropdownOpen(false)}>
												{place.name.toUpperCase()}
											</Link>
										)
									})
								) : (
									<div className="px-4 py-2 text-sm text-gray-500">Loading places...</div>
								)}
							</div>
						</div>
					)}

					{/* Language Dropdown - Inside nav for proper positioning */}
					{isLangDropdownOpen && (
						<div
							className="hidden md:block absolute bg-white border border-gray-200 rounded-md shadow-lg z-[99999] min-w-[80px]"
							style={{
								top: "100%",
								left: (() => {
									if (!dropdownRef.current) return "0px"
									const navRect = dropdownRef.current.closest("nav")?.getBoundingClientRect()
									const buttonRect = dropdownRef.current.getBoundingClientRect()
									return navRect ? buttonRect.left - navRect.left + "px" : "0px"
								})(),
							}}
							onMouseLeave={() => setIsLangDropdownOpen(false)}>
							<div className="py-1">
								{[
									{ code: "pl", label: "PL" },
									{ code: "en", label: "EN" },
									{ code: "de", label: "DE" },
									{ code: "es", label: "ES" },
								].map(({ code, label }) => (
									<Link
										key={code}
										href={getLangUrl(code)}
										className={`block px-3 py-2 text-sm transition-colors duration-200 ${lang === code ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:bg-gray-50 hover:text-[#7a4a35]"}`}
										onClick={() => setIsLangDropdownOpen(false)}>
										{label}
									</Link>
								))}
							</div>
						</div>
					)}
				</div>
			</nav>
			{isMenuOpen && (
				<div className="md:hidden bg-white border-b border-gray-100 overflow-x-auto scrollbar-hide">
					<div className="px-4 py-2 space-y-2 w-max min-w-full">
						<Link
							href={`/${lang}/apartamenty`}
							className="block py-2 text-gray-700 hover:text-[#7a4a35] font-medium"
							onClick={() => setIsMenuOpen(false)}>
							{dictionary.navigation?.apartments || "Apartamenty"}
						</Link>

						{/* Apartment Buildings - Mobile Dropdown */}
						<div className="relative">
							<button
								onClick={() => setIsBuildingsDropdownOpen(!isBuildingsDropdownOpen)}
								className="flex items-center justify-between w-full py-2 text-gray-700 hover:text-[#7a4a35] font-medium">
								<span>{dictionary.navigation?.apartmentBuildings || "Apartamentowce"}</span>
								<svg
									className={`w-4 h-4 transition-transform duration-200 ${isBuildingsDropdownOpen ? "rotate-180" : ""}`}
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
								</svg>
							</button>

							{/* Mobile Dropdown */}
							{isBuildingsDropdownOpen && (
								<div className="ml-4 mt-1 space-y-1">
									{placesData.map((place) => {
										if (place?.name === "KOŚCIELISKO") return null
										return (
											<button
												key={place.id + place.name}
												className="block py-2 pl-4 text-sm text-gray-600 hover:text-[#7a4a35] transition-colors duration-200 text-left cursor-pointer"
												onClick={() => {
													window.location.href = `/${lang}/place/${generateSlug(place.name)}`
													setTimeout(() => {
														// setIsMenuOpen(false)
														// setIsBuildingsDropdownOpen(false)
													}, 0)
												}}>
												{place.name.toUpperCase()}
											</button>
										)
									})}
								</div>
							)}
						</div>

						<Link
							href={`/${lang}/houses`}
							className="block py-2 text-gray-700 hover:text-[#7a4a35] font-medium"
							onClick={() => setIsMenuOpen(false)}>
							{dictionary.navigation?.houses || "Domki"}
						</Link>

						<Link
							href={`/${lang}/offers`}
							className="block py-2 text-gray-700 hover:text-[#7a4a35] font-medium"
							onClick={() => setIsMenuOpen(false)}>
							{dictionary.navigation?.offers || "Oferty"}
						</Link>

						<Link
							href={`/${lang}/zakopane-noclegi`}
							className="block py-2 text-gray-700 hover:text-[#7a4a35] font-medium"
							onClick={() => setIsMenuOpen(false)}>
							{dictionary.navigation?.zakopaneRooms || "Przewodnik"}
						</Link>

						<Link
							href="/join-us.pdf"
							target="_blank"
							className="block py-2 text-gray-700 hover:text-[#7a4a35] font-medium"
							onClick={() => setIsMenuOpen(false)}>
							{dictionary.navigation?.joinUs || "Oferta Współpracy"}
						</Link>

						<Link
							href={`/${lang}/o-nas`}
							className="block py-2 text-gray-700 hover:text-[#7a4a35] font-medium"
							onClick={() => setIsMenuOpen(false)}>
							{dictionary.navigation?.aboutUs || "O nas"}
						</Link>

						<button
							onClick={() => {
								setIsBasketOpen(true)
								setIsMenuOpen(false)
							}}
							className="relative flex items-center justify-between w-full px-3 py-1 text-sm font-medium text-gray-700 hover:text-[#7a4a35] transition-colors duration-200">
							<ShoppingBasketIcon className="h-5 w-5" />
							<span>{dictionary.apartments?.basketTitle || "Basket"}</span>
							{basketItems.length > 0 && (
								<span className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-[#cc9678] px-2 text-[0.65rem] font-semibold text-white">
									{basketItems.length}
								</span>
							)}
						</button>

						{/* Phone Number - Mobile */}
						<div className="flex items-center justify-center space-x-2 py-3 border-t border-gray-100 mt-2">
							<span className="text-sm text-gray-600">{dictionary.contactForm?.subtitle2 || "Biuro i Rezerwacje"}</span>
							<a
								href={`tel:${dictionary.contactForm?.officePhone || "+48 511 000 660"}`}
								className="font-semibold text-gray-800 hover:text-[#7a4a35] transition-colors duration-200">
								{dictionary.contactForm?.officePhone || "+48 511 000 660"}
							</a>
						</div>

						{/* Language Switcher - Mobile */}
						<div className="flex items-center justify-center space-x-3 py-3 border-t border-gray-100 mt-2">
							{[
								{ code: "pl", label: "PL" },
								{ code: "en", label: "EN" },
								{ code: "de", label: "DE" },
								{ code: "es", label: "ES" },
							].map(({ code, label }) => (
								<Link
									key={code}
									href={getLangUrl(code)}
									className={`px-3 py-1 text-sm font-medium transition-colors duration-200 rounded ${lang === code ? "text-blue-600 bg-blue-50 border border-blue-200" : "text-gray-500 hover:text-[#7a4a35] hover:bg-gray-50"}`}
									onClick={() => setIsMenuOpen(false)}>
									{label}
								</Link>
							))}
						</div>

						{/* <div className="pt-2 border-t border-gray-100">
							<BookNowButton
								bookNowText={dictionary.apartments?.bookNow || "Zarezerwuj"}
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
								className="!bg-[#cc9678] !hover:bg-[#7a4a35] !text-white !shadow-lg !rounded-md font-semibold py-3 px-4 w-full transition-colors duration-200 !border-0 !outline-none"
							/>
						</div> */}
					</div>
				</div>
			)}
			<ReservationBasket
				open={isBasketOpen}
				onClose={() => setIsBasketOpen(false)}
				items={basketItems}
				onRemove={handleRemoveBasketItem}
				dictionary={dictionary}
			/>
		</>
	)
}
