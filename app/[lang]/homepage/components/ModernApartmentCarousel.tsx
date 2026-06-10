/** @format */

"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Property, PropertyFilterType } from "@/types"
import { Dictionary } from "../../../types/dictionary"
import { Locale } from "../../../i18n-config"
import { Tooltip } from "@mui/material"
import ModernApartmentTile from "../../apartamenty/components/ModernApartmentTile"

type ModernApartmentCarouselProps = {
	dictionary: Dictionary
	lang: Locale
}

export default function ModernApartmentCarousel({ dictionary, lang }: ModernApartmentCarouselProps) {
	const [allProperties, setAllProperties] = useState<Property[]>([])
	const [filteredProperties, setFilteredProperties] = useState<Property[]>([])
	const [loading, setLoading] = useState(true)
	const [currentView, setCurrentView] = useState<"grid" | "slider">("slider")
	const [selectedFilters, setSelectedFilters] = useState<PropertyFilterType[]>([])
	const [selectedPlaces, setSelectedPlaces] = useState<number[]>([])
	const [currentSlide, setCurrentSlide] = useState(0)
	const [searchTerm, setSearchTerm] = useState("")
	const [isSearchExpanded, setIsSearchExpanded] = useState(false)
	const [touchStartX, setTouchStartX] = useState<number | null>(null)
	const [touchEndX, setTouchEndX] = useState<number | null>(null)
	const propertiesInitialized = useRef(false)
	const scrollPositionRef = useRef<number>(0)
	const [isSettingsOpen, setIsSettingsOpen] = useState(false)

	// Filter and sort properties
	const sortAndFilterProperties = useCallback((properties: Property[], filters: PropertyFilterType[], places: number[], search: string) => {
		let filtered = properties

		// Search filter - filter by property name
		if (search.trim()) {
			filtered = filtered.filter((property) => property.name.toLowerCase().includes(search.toLowerCase()))
		}

		// Amenity filters
		if (filters.length > 0) {
			filtered = filtered.filter((property) => filters.every((filter) => property.filters && property.filters.includes(filter)))
		}

		// Place filters
		if (places.length > 0) {
			filtered = filtered.filter((property) => places.includes(property.placeId) || places.includes(property.place?.id || 0))
		}

		// For filtered results, sort by last minute offers first, then maintain the rotated order
		return filtered.sort((a, b) => {
			if (a.lastMinuteOfferActive && !b.lastMinuteOfferActive) return -1
			if (!a.lastMinuteOfferActive && b.lastMinuteOfferActive) return 1
			// Instead of alphabetical sorting, maintain the current order (which should be rotated)
			return 0
		})
	}, [])

	// Load filters from localStorage
	useEffect(() => {
		const savedFilters = localStorage.getItem("propertyFilters")
		const savedPlaces = localStorage.getItem("propertyPlaces")

		if (savedFilters) {
			try {
				setSelectedFilters(JSON.parse(savedFilters))
			} catch (error) {
				console.error("Error parsing saved filters:", error)
			}
		}

		if (savedPlaces) {
			try {
				setSelectedPlaces(JSON.parse(savedPlaces))
			} catch (error) {
				console.error("Error parsing saved places:", error)
			}
		}
	}, [])

	// Apply filters
	useEffect(() => {
		// If no filters are applied, use the pre-sorted and rotated properties
		if (selectedFilters.length === 0 && selectedPlaces.length === 0 && !searchTerm.trim()) {
			setFilteredProperties(allProperties)
		} else {
			const filtered = sortAndFilterProperties(allProperties, selectedFilters, selectedPlaces, searchTerm)
			setFilteredProperties(filtered)
		}
	}, [allProperties, selectedFilters, selectedPlaces, searchTerm, sortAndFilterProperties])

	// Maintain scroll position when filtered properties change
	useEffect(() => {
		if (scrollPositionRef.current > 0) {
			const timer = setTimeout(() => {
				window.scrollTo(0, scrollPositionRef.current)
			}, 10)
			return () => clearTimeout(timer)
		}
	}, [filteredProperties])

	// Listen for localStorage changes
	useEffect(() => {
		const handleStorageChange = () => {
			const savedFilters = localStorage.getItem("propertyFilters")
			const savedPlaces = localStorage.getItem("propertyPlaces")

			if (savedFilters) {
				try {
					setSelectedFilters(JSON.parse(savedFilters))
				} catch (error) {
					console.error("Error parsing filters:", error)
				}
			}

			if (savedPlaces) {
				try {
					setSelectedPlaces(JSON.parse(savedPlaces))
				} catch (error) {
					console.error("Error parsing places:", error)
				}
			}
		}

		window.addEventListener("storage", handleStorageChange)
		window.addEventListener("localStorageChange", handleStorageChange)

		return () => {
			window.removeEventListener("storage", handleStorageChange)
			window.removeEventListener("localStorageChange", handleStorageChange)
		}
	}, [])

	// Fetch properties
	useEffect(() => {
		if (propertiesInitialized.current) return

		propertiesInitialized.current = true

		const fetchProperties = async () => {
			try {
				setLoading(true)
				const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mountainapartments.pl"
				const response = await fetch(`${baseUrl}/api/properties/mountain?userId=clok0rd6f0000kkdgyf1pd0t3`)

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`)
				}

				const data = await response.json()
				let properties = data.properties || []

				// Apply daily rotation to the properties as they come from the API
				if (properties.length > 0) {
					// Separate last-minute offers from regular properties
					const lastMinuteOffers = properties.filter((p: Property) => p.lastMinuteOfferActive)
					const regularProperties = properties.filter((p: Property) => !p.lastMinuteOfferActive)

					// Apply daily rotation only to regular properties
					if (regularProperties.length > 0) {
						const now = new Date()
						const start = new Date(now.getFullYear(), 0, 0)
						const diff = now.getTime() - start.getTime()
						const oneDay = 1000 * 60 * 60 * 24
						const dayOfYear = Math.floor(diff / oneDay)
						const shift = dayOfYear % regularProperties.length
						const rotatedRegular = [...regularProperties.slice(shift), ...regularProperties.slice(0, shift)]
						// Combine last-minute offers first, then rotated regular properties
						properties = [...lastMinuteOffers, ...rotatedRegular]
					} else {
						// If all properties are last-minute offers, just keep them as is
						properties = lastMinuteOffers
					}
				}

				setAllProperties(properties)
			} catch (error) {
				console.error("Error fetching properties:", error)
				propertiesInitialized.current = false
			} finally {
				setLoading(false)
			}
		}

		fetchProperties()
	}, [])

	// Handle view change
	const handleViewChange = useCallback((view: "grid" | "slider") => {
		setCurrentView(view)
		setIsSettingsOpen(false) // Close dialog after selection
	}, [])

	// Handle search
	const handleSearchToggle = () => {
		setIsSearchExpanded(!isSearchExpanded)
		if (!isSearchExpanded) {
			// Focus the input when expanding (works for both mobile and desktop)
			setTimeout(() => {
				const input = document.getElementById("property-search-input")
				if (input) input.focus()
			}, 100)
		}
	}

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		// Save current scroll position before state change
		scrollPositionRef.current = window.scrollY

		// Temporarily disable smooth scrolling to prevent unwanted scroll behavior
		document.documentElement.style.scrollBehavior = "auto"

		setSearchTerm(e.target.value)

		// Restore scroll position after a brief delay to allow DOM updates
		setTimeout(() => {
			window.scrollTo(0, scrollPositionRef.current)
			// Restore smooth scrolling
			document.documentElement.style.scrollBehavior = "smooth"
		}, 0)
	}

	const clearSearch = () => {
		// Save current scroll position before state change
		scrollPositionRef.current = window.scrollY

		// Temporarily disable smooth scrolling
		document.documentElement.style.scrollBehavior = "auto"

		setSearchTerm("")
		setIsSearchExpanded(false)

		// Restore scroll position after a brief delay
		setTimeout(() => {
			window.scrollTo(0, scrollPositionRef.current)
			// Restore smooth scrolling
			document.documentElement.style.scrollBehavior = "smooth"
		}, 0)
	}

	// Slider navigation functions

	// Calculate how many cards can fit in the container
	const maxSlide = Math.max(0, filteredProperties.length - 1)

	const scrollToIndex = useCallback((index: number) => {
		if (sliderContainerRef.current) {
			// Get actual card width based on screen size to match CSS classes
			const getCardWidth = () => {
				if (window.innerWidth >= 768) return 576 // md:w-[576px]
				if (window.innerWidth >= 640) return 480 // sm:w-[480px]
				return 384 // w-[384px]
			}
			const cardWidth = getCardWidth()
			const gap = window.innerWidth >= 640 ? 24 : 16 // Match gap from CSS
			const paddingLeft = window.innerWidth >= 640 ? 32 : 16 // Match px-4 (16px) and sm:px-8 (32px)
			const containerWidth = sliderContainerRef.current.clientWidth

			// Calculate position to center the item in the container
			const itemCenter = cardWidth / 2
			const containerCenter = containerWidth / 2
			const baseScrollLeft = index * (cardWidth + gap)
			const scrollLeft = baseScrollLeft - containerCenter + itemCenter + paddingLeft

			sliderContainerRef.current.scrollTo({
				left: Math.max(0, scrollLeft), // Ensure we don't scroll past the start
				behavior: "smooth",
			})
		}
	}, [])

	const nextSlide = () => {
		const newIndex = Math.min(currentSlide + 1, maxSlide)
		setCurrentSlide(newIndex)
		scrollToIndex(newIndex)
	}

	const prevSlide = () => {
		const newIndex = Math.max(currentSlide - 1, 0)
		setCurrentSlide(newIndex)
		scrollToIndex(newIndex)
	}

	const goToSlide = (slideIndex: number) => {
		setCurrentSlide(slideIndex)
		scrollToIndex(slideIndex)
	}

	// Handle touch events for swipe gestures
	const handleTouchStart = (e: React.TouchEvent) => {
		setTouchStartX(e.touches[0].clientX)
		setTouchEndX(null)
	}

	const handleTouchMove = (e: React.TouchEvent) => {
		setTouchEndX(e.touches[0].clientX)
	}

	const handleTouchEnd = () => {
		if (!touchStartX || !touchEndX) return

		const distance = touchStartX - touchEndX
		const isLeftSwipe = distance > 50
		const isRightSwipe = distance < -50

		if (isLeftSwipe && currentSlide < maxSlide) {
			// Swipe left - go to next
			nextSlide()
		} else if (isRightSwipe && currentSlide > 0) {
			// Swipe right - go to previous
			prevSlide()
		}

		setTouchStartX(null)
		setTouchEndX(null)
	}

	// Handle scroll events to update current slide
	const handleScroll = useCallback(() => {
		if (sliderContainerRef.current) {
			const container = sliderContainerRef.current
			const scrollLeft = container.scrollLeft
			// Get actual card width based on screen size to match CSS classes
			const getCardWidth = () => {
				if (window.innerWidth >= 768) return 576 // md:w-[576px]
				if (window.innerWidth >= 640) return 480 // sm:w-[480px]
				return 384 // w-[384px]
			}
			const cardWidth = getCardWidth()
			const gap = window.innerWidth >= 640 ? 24 : 16
			const paddingLeft = window.innerWidth >= 640 ? 32 : 16
			const containerWidth = container.clientWidth

			// Account for centering offset
			const itemCenter = cardWidth / 2
			const containerCenter = containerWidth / 2
			const centeringOffset = containerCenter - itemCenter - paddingLeft

			// Calculate which slide is currently most visible
			const adjustedScrollLeft = scrollLeft - centeringOffset
			const slideWidth = cardWidth + gap
			const newSlide = Math.round(adjustedScrollLeft / slideWidth)
			const clampedSlide = Math.max(0, Math.min(newSlide, maxSlide))

			if (clampedSlide !== currentSlide) {
				setCurrentSlide(clampedSlide)
			}
		}
	}, [currentSlide, maxSlide])

	// Container ref to measure width
	const sliderContainerRef = useRef<HTMLDivElement>(null)

	// Add scroll and touch event listeners
	useEffect(() => {
		const slider = sliderContainerRef.current
		if (slider) {
			slider.addEventListener("scroll", handleScroll)
			return () => slider.removeEventListener("scroll", handleScroll)
		}
	}, [handleScroll])

	// Cleanup scroll behavior on unmount
	useEffect(() => {
		return () => {
			document.documentElement.style.scrollBehavior = "smooth"
		}
	}, [])

	// Initialize scroll position to center first item
	useEffect(() => {
		if (filteredProperties.length > 0 && sliderContainerRef.current) {
			// Small delay to ensure DOM is ready
			const timer = setTimeout(() => {
				scrollToIndex(0)
			}, 100)
			return () => clearTimeout(timer)
		}
	}, [filteredProperties.length, scrollToIndex])

	if (loading) {
		return (
			<div className="flex justify-center items-center py-24">
				<div className="relative">
					<div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
					<div className="absolute inset-0 flex items-center justify-center">
						<div className="w-8 h-8 bg-blue-500 rounded-full animate-pulse"></div>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="w-full px-0">
			{/* Search and Controls */}
			<div className="mb-8 transition-all duration-1000 ease-out translate-y-0 opacity-100 w-full relative min-h-[80px] flex flex-col items-center justify-center px-4 gap-4">
				{/* Centered Text */}
				<h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 text-center max-w-full sm:max-w-2xl md:max-w-xs lg:max-w-xl">
					{dictionary.apartments.carouselHeader}
				</h2>

				{/* Mobile: Expanded Search Field (top line when expanded) */}
				{isSearchExpanded && (
					<div className="w-full max-w-md sm:hidden">
						<div className="relative">
							<input
								id="property-search-input"
								type="text"
								value={searchTerm}
								onChange={handleSearchChange}
								placeholder={dictionary.apartments.searchPlaceholder || "Search by property name..."}
								className="w-full px-4 py-2 pr-10 bg-white border-2 border-gray-200 rounded-xl shadow-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900 text-sm"
								autoFocus
							/>
							{searchTerm && (
								<button
									onClick={clearSearch}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
									</svg>
								</button>
							)}
						</div>
					</div>
				)}

				{/* View Toggle and Search Controls */}
				<div className="flex items-center justify-center gap-3 w-full sm:justify-end sm:absolute sm:top-1/2 sm:right-4 sm:-translate-y-1/2 sm:z-10">
					{/* Desktop: Search Input - expands from right to left */}
					<div
						className={`hidden sm:block transition-all duration-300 ease-in-out overflow-hidden ${
							isSearchExpanded ? "w-64 opacity-100" : "w-0 opacity-0"
						}`}>
						<div className="relative">
							<input
								id="property-search-input"
								type="text"
								value={searchTerm}
								onChange={handleSearchChange}
								placeholder={dictionary.apartments.searchPlaceholder || "Search by property name..."}
								className="w-full px-4 py-2 pr-10 bg-white border-2 border-gray-200 rounded-xl shadow-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900 text-sm"
							/>
							{searchTerm && (
								<button
									onClick={clearSearch}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
									</svg>
								</button>
							)}
						</div>
					</div>

					{/* Search Icon Button */}
					<Tooltip title={isSearchExpanded ? dictionary.apartments.closeSearchTooltip : dictionary.apartments.searchTooltip}>
						<button
							onClick={handleSearchToggle}
							className={`inline-flex items-center justify-center w-12 h-12 bg-white rounded-xl shadow-lg border-2 border-gray-200 transition-all duration-300 hover:scale-105 ${
								isSearchExpanded ? "bg-blue-50 border-blue-300" : "hover:bg-gray-50"
							}`}>
							<svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
							</svg>
						</button>
					</Tooltip>

					{/* Settings Button */}
					<Tooltip title={dictionary.apartments.settingsTooltip}>
						<button
							onClick={() => setIsSettingsOpen(true)}
							className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-2xl shadow-lg border-2 border-gray-200 hover:shadow-xl transition-all duration-300 hover:scale-105">
							<svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
								/>
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
							</svg>
						</button>
					</Tooltip>
				</div>
			</div>

			{/* Properties Display */}
			{filteredProperties.length === 0 ? (
				<div key="no-results" className="text-center py-24">
					<div className="w-24 h-24 mx-auto mb-6 bg-slate-100 rounded-full flex items-center justify-center">
						<svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
						</svg>
					</div>
					<h3 className="text-2xl font-bold text-slate-800 mb-2">
						{dictionary.apartments?.noResults?.split(" ")[0] + " " + dictionary.navigation?.apartments?.replace("Apartamenty", "apartamentów") ||
							"No apartments found"}
					</h3>
					<p className="text-slate-600 mb-6">{dictionary.filters?.subtitle || "Try adjusting your search or filters"}</p>
				</div>
			) : (
				<div key="results" className="transition-all duration-1000 ease-out delay-300 translate-y-0 opacity-100">
					{currentView === "grid" ? (
						// Grid View
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 px-4 sm:px-6 lg:px-8 w-full">
							{filteredProperties.map((property) => (
								<div key={property.id} className="transition-all duration-700 ease-out translate-y-0 opacity-100 scale-100">
									<ModernApartmentTile property={property} dictionary={dictionary} lang={lang} mainPage />
								</div>
							))}
						</div>
					) : (
						// Horizontal Slider Carousel with Navigation
						<div className="relative w-full overflow-hidden">
							{/* Navigation Arrows */}
							{filteredProperties.length > 1 && (
								<>
									<button
										onClick={prevSlide}
										className="absolute left-2 top-1/2 -translate-y-1/2 z-50 bg-white hover:bg-gray-50 shadow-xl rounded-full p-3 transition-all duration-200 border border-gray-200 hover:scale-110">
										<svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
										</svg>
									</button>
									<button
										onClick={nextSlide}
										className="absolute right-2 top-1/2 -translate-y-1/2 z-50 bg-white hover:bg-gray-50 shadow-xl rounded-full p-3 transition-all duration-200 border border-gray-200 hover:scale-110">
										<svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
										</svg>
									</button>
								</>
							)}

							{/* Slider Container */}
							<div
								ref={sliderContainerRef}
								className="flex flex-nowrap overflow-x-auto scrollbar-hide gap-4 sm:gap-6 py-2 px-4 sm:px-8 min-h-[600px] sm:min-h-[680px] lg:min-h-[720px] items-start"
								onTouchStart={handleTouchStart}
								onTouchMove={handleTouchMove}
								onTouchEnd={handleTouchEnd}>
								{filteredProperties.map((property) => (
									<div key={property.id} className="flex-shrink-0 w-[384px] sm:w-[480px] md:w-[576px] flex justify-center">
										<ModernApartmentTile property={property} dictionary={dictionary} lang={lang} mainPage />
									</div>
								))}
							</div>

							{/* Dots Navigation */}
							{filteredProperties.length > 1 && (
								<div className="flex justify-center mt-6 gap-2">
									{Array.from({ length: maxSlide + 1 }, (_, index) => (
										<button
											key={index}
											onClick={() => goToSlide(index)}
											className={`w-3 h-3 rounded-full transition-all duration-200 ${
												index === currentSlide ? "bg-[#1D2430] scale-110" : "bg-gray-300 hover:bg-gray-400"
											}`}
										/>
									))}
								</div>
							)}

							{/* Info text */}
							{/* <div className="text-center mt-4">
								<p className="text-sm text-gray-500">
									{filteredProperties.length > 1
										? `${currentSlide + 1} ${lang === "pl" ? "z" : lang === "de" ? "von" : lang === "es" ? "de" : "of"} ${
												filteredProperties.length
											} ${
												lang === "pl" ? "apartamentów" : lang === "de" ? "Apartments" : lang === "es" ? "Apartamentos" : "apartments"
											} • ${
												lang === "pl"
													? "Użyj strzałek lub kliknij kropki"
													: lang === "de"
														? "Verwende Pfeile oder klicke Punkte"
														: lang === "es"
															? "Usa flechas o haz clic en puntos"
															: "Use arrows or click dots"
											}`
										: `${lang === "pl" ? "Zobacz" : lang === "de" ? "Sieh" : lang === "es" ? "Ver" : "View"} ${filteredProperties.length} ${
												lang === "pl" ? "apartament" : lang === "de" ? "Apartment" : lang === "es" ? "Apartamento" : "apartment"
											}`}
								</p>
							</div> */}
						</div>
					)}
				</div>
			)}

			{/* Settings Dialog */}
			{isSettingsOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={() => setIsSettingsOpen(false)}>
					<div className="bg-white rounded-2xl p-6 shadow-xl max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-lg font-semibold text-gray-900">
								{lang === "pl" ? "Tryb widoku" : lang === "de" ? "Ansichtsmodus" : lang === "es" ? "Modo de vista" : "View Mode"}
							</h3>
							<button onClick={() => setIsSettingsOpen(false)} className="text-gray-400 hover:text-gray-600">
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>
						{/* View Toggle */}
						<div className="inline-flex items-center gap-2 bg-white rounded-2xl p-2 shadow-lg border-2 border-gray-200">
							<Tooltip title={dictionary.apartments.gridViewTooltip}>
								<button
									type="button"
									onClick={() => handleViewChange("grid")}
									className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${currentView === "grid" ? "bg-blue-500 text-white shadow-md" : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"}`}>
									<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
										/>
									</svg>
								</button>
							</Tooltip>
							<Tooltip title={dictionary.apartments.sliderViewTooltip}>
								<button
									type="button"
									onMouseDown={(e) => e.preventDefault()}
									onClick={() => handleViewChange("slider")}
									className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${currentView === "slider" ? "bg-blue-500 text-white shadow-md" : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"}`}>
									<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 6v12M12 6v12M16 6v12" />
									</svg>
								</button>
							</Tooltip>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
