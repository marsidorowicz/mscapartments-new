/** @format */

"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import ApartmentCard from "./ApartmentCard"
import { ApartmentsDictionary, Dictionary } from "../../types/dictionary"
import { Property, PropertyFilterType } from "@/types"
import FilterButtonSearch from "./re/FilterButtonSearch"

type ApartmentCarouselProps = {
	title?: string
	dictionary: {
		apartments: ApartmentsDictionary
		filters: Dictionary["filters"]
	}
}

export default function ApartmentCarousel({
	// title = "Available Apartments",
	dictionary,
}: ApartmentCarouselProps) {
	const [currentIndex, setCurrentIndex] = useState(0)
	const [allProperties, setAllProperties] = useState<Property[]>([]) // Store all fetched properties
	const [filteredProperties, setFilteredProperties] = useState<Property[]>([]) // Store filtered properties
	const [selectedFilters, setSelectedFilters] = useState<PropertyFilterType[]>([]) // Store current filters
	const [selectedPlaces, setSelectedPlaces] = useState<number[]>([]) // Store current place filters
	const [searchTerm, setSearchTerm] = useState<string>("") // Store name search term
	const [apartmentSizeRange, setApartmentSizeRange] = useState<{
		min: number
		max: number
	}>({ min: 0, max: 150 }) // Store apartment size range filter
	const [personCapacityRange, setPersonCapacityRange] = useState<{
		min: number
		max: number
	}>({ min: 1, max: 8 }) // Store person capacity range filter
	const [lastMinuteOnly, setLastMinuteOnly] = useState<boolean>(false) // Store last minute filter
	const [loading, setLoading] = useState(true)
	const [itemsPerView, setItemsPerView] = useState(1)
	const [cardsAnimated, setCardsAnimated] = useState(false) // Animation state for cards
	const [cardWidth, setCardWidth] = useState(320) // Dynamic card width
	const propertiesInitialized = useRef(false)
	const carouselRef = useRef<HTMLDivElement>(null)
	const router = useRouter()

	// Use filteredProperties for display and calculations
	const properties = filteredProperties
	const maxIndex = Math.max(0, properties.length - itemsPerView)

	// Sort and filter properties based on selected filters, places, search term, range filters, and last minute filter
	const sortAndFilterProperties = useCallback(
		(
			properties: Property[],
			filters: PropertyFilterType[],
			places: number[],
			searchTerm: string,
			sizeRange: { min: number; max: number },
			capacityRange: { min: number; max: number },
		) => {
			// First filter by search term
			let searchFiltered = properties
			if (searchTerm.trim()) {
				searchFiltered = properties.filter((property) => property.name.toLowerCase().includes(searchTerm.toLowerCase().trim()))
			}

			// Apply range filters
			let rangeFiltered = searchFiltered

			// Filter by apartment size (assuming property has a 'size' field)
			if (sizeRange.min > 0 || sizeRange.max < 150) {
				rangeFiltered = rangeFiltered.filter((property) => {
					const propertySize = property.size || 0
					return propertySize >= sizeRange.min && propertySize <= sizeRange.max
				})
			}

			// Filter by person capacity (property.maxOccupancy field)
			if (capacityRange.min > 1 || capacityRange.max < 8) {
				rangeFiltered = rangeFiltered.filter((property) => {
					const propertyCapacity = property.maxOccupancy || 0
					return propertyCapacity >= capacityRange.min && propertyCapacity <= capacityRange.max
				})
			}

			// Filter by last minute offers if specified - now shows all but prioritizes last minute
			// (removed filtering logic, will handle via sorting instead)

			// If no filters and places selected, return all range filtered properties with sorting
			if (filters.length === 0 && places.length === 0) {
				// Always sort last minute offers first
				return rangeFiltered.sort((a, b) => {
					// Properties with last minute offers should appear first
					if (a.lastMinuteOfferActive && !b.lastMinuteOfferActive) return -1
					if (!a.lastMinuteOfferActive && b.lastMinuteOfferActive) return 1
					return 0
				})
			}

			// Separate matching and non-matching properties from range filtered results
			const matchingProperties: Property[] = []
			const nonMatchingProperties: Property[] = []

			rangeFiltered.forEach((property) => {
				// Check if property has all the selected filters
				const hasAllFilters = filters.length === 0 || filters.every((filter) => property.filters && property.filters.includes(filter))
				// Check if property matches selected places
				const matchesPlace = places.length === 0 || places.includes(property.placeId) || places.includes(property.place?.id || 0)

				if (hasAllFilters && matchesPlace) {
					matchingProperties.push(property)
				} else {
					nonMatchingProperties.push(property)
				}
			})

			// Return all properties with matching ones first, then non-matching ones
			// Always sort last minute offers first
			const sortedMatching = matchingProperties.sort((a, b) => {
				// Properties with last minute offers should appear first
				if (a.lastMinuteOfferActive && !b.lastMinuteOfferActive) return -1
				if (!a.lastMinuteOfferActive && b.lastMinuteOfferActive) return 1
				return 0
			})
			const sortedNonMatching = nonMatchingProperties.sort((a, b) => {
				// Properties with last minute offers should appear first
				if (a.lastMinuteOfferActive && !b.lastMinuteOfferActive) return -1
				if (!a.lastMinuteOfferActive && b.lastMinuteOfferActive) return 1
				return 0
			})
			return [...sortedMatching, ...sortedNonMatching]
		},
		[],
	) // Check if a property matches all selected filters, places, range filters, and last minute filter
	const isPropertyMatching = useCallback(
		(property: Property) => {
			// If no filters are selected at all, no properties are "matching"
			if (
				selectedFilters.length === 0 &&
				selectedPlaces.length === 0 &&
				apartmentSizeRange.min <= 0 &&
				apartmentSizeRange.max >= 150 &&
				personCapacityRange.min <= 1 &&
				personCapacityRange.max >= 8 &&
				!lastMinuteOnly
			) {
				return false // No filters selected, so no properties are "matching"
			}

			// If only last minute filter is active, show "pasuje" for last minute properties
			if (
				selectedFilters.length === 0 &&
				selectedPlaces.length === 0 &&
				apartmentSizeRange.min <= 0 &&
				apartmentSizeRange.max >= 150 &&
				personCapacityRange.min <= 1 &&
				personCapacityRange.max >= 8 &&
				lastMinuteOnly
			) {
				return property.lastMinuteOfferActive === true
			}

			// Check if property matches selected filters (only when other filters are actually active)
			// If no other filters are active, don't show "pasuje" badges
			const hasActiveFilters =
				selectedFilters.length > 0 ||
				selectedPlaces.length > 0 ||
				apartmentSizeRange.min > 0 ||
				apartmentSizeRange.max < 150 ||
				personCapacityRange.min > 1 ||
				personCapacityRange.max < 8

			if (!hasActiveFilters) {
				return false
			}

			const hasAllFilters = selectedFilters.length === 0 || selectedFilters.every((filter) => property.filters && property.filters.includes(filter)) // Check if property matches selected places
			const matchesPlace = selectedPlaces.length === 0 || selectedPlaces.includes(property.placeId) || selectedPlaces.includes(property.place?.id || 0)

			// Check if property matches size range
			const matchesSizeRange =
				(apartmentSizeRange.min <= 0 && apartmentSizeRange.max >= 150) ||
				(property.size !== undefined && property.size >= apartmentSizeRange.min && property.size <= apartmentSizeRange.max)

			// Check if property matches capacity range
			const matchesCapacityRange =
				(personCapacityRange.min <= 1 && personCapacityRange.max >= 8) ||
				(property.maxOccupancy >= personCapacityRange.min && property.maxOccupancy <= personCapacityRange.max)

			// When last minute filter is active, also check if property has last minute offer
			const matchesLastMinute = !lastMinuteOnly || property.lastMinuteOfferActive === true

			const result = hasAllFilters && matchesPlace && matchesSizeRange && matchesCapacityRange && matchesLastMinute

			return result
		},
		[selectedFilters, selectedPlaces, apartmentSizeRange, personCapacityRange, lastMinuteOnly],
	) // Load filters, places, search term, range filters, and last minute filter from localStorage on mount
	useEffect(() => {
		const savedFilters = localStorage.getItem("propertyFilters")
		const savedPlaces = localStorage.getItem("propertyPlaces")
		const savedSearchTerm = localStorage.getItem("propertySearchTerm")
		const savedSizeRange = localStorage.getItem("apartmentSizeRange")
		const savedCapacityRange = localStorage.getItem("personCapacityRange")
		const savedLastMinuteOnly = localStorage.getItem("lastMinuteOnly")

		if (savedFilters) {
			try {
				const parsed = JSON.parse(savedFilters) as PropertyFilterType[]

				setSelectedFilters(parsed)
			} catch (error) {
				console.error("Error parsing saved filters:", error)
				setSelectedFilters([])
			}
		} else {
			setSelectedFilters([])
		}

		if (savedPlaces) {
			try {
				const parsed = JSON.parse(savedPlaces) as number[]

				setSelectedPlaces(parsed)
			} catch (error) {
				console.error("Error parsing saved places:", error)
				setSelectedPlaces([])
			}
		} else {
			setSelectedPlaces([])
		}

		if (savedSearchTerm) {
			try {
				const parsed = JSON.parse(savedSearchTerm) as string

				setSearchTerm(parsed)
			} catch (error) {
				console.error("Error parsing saved search term:", error)
				setSearchTerm("")
			}
		} else {
			setSearchTerm("")
		}

		if (savedSizeRange) {
			try {
				const parsed = JSON.parse(savedSizeRange) as {
					min: number
					max: number
				}
				setApartmentSizeRange(parsed)
			} catch (error) {
				console.error("Error parsing saved size range:", error)
				setApartmentSizeRange({ min: 0, max: 150 })
			}
		} else {
			setApartmentSizeRange({ min: 0, max: 150 })
		}

		if (savedCapacityRange) {
			try {
				const parsed = JSON.parse(savedCapacityRange) as {
					min: number
					max: number
				}
				setPersonCapacityRange(parsed)
			} catch (error) {
				console.error("Error parsing saved capacity range:", error)
				setPersonCapacityRange({ min: 1, max: 8 })
			}
		} else {
			setPersonCapacityRange({ min: 1, max: 8 })
		}

		if (savedLastMinuteOnly) {
			try {
				const parsed = JSON.parse(savedLastMinuteOnly) as boolean
				setLastMinuteOnly(parsed)
			} catch (error) {
				console.error("Error parsing saved last minute filter:", error)
				setLastMinuteOnly(false)
			}
		} else {
			setLastMinuteOnly(false)
		}
	}, []) // Run only once on mount	// Apply sorting and filtering whenever allProperties, selectedFilters, selectedPlaces, searchTerm, range filters, or last minute filter change
	useEffect(() => {
		const filtered = sortAndFilterProperties(allProperties, selectedFilters, selectedPlaces, searchTerm, apartmentSizeRange, personCapacityRange)

		setFilteredProperties(filtered)
		setCurrentIndex(0) // Reset to first slide when filters change
		setCardsAnimated(false) // Reset animation state for new filter results
	}, [allProperties, selectedFilters, selectedPlaces, searchTerm, apartmentSizeRange, personCapacityRange, lastMinuteOnly, sortAndFilterProperties])
	// Listen for localStorage changes from other sources
	useEffect(() => {
		const loadFiltersAndSearch = () => {
			const savedFilters = localStorage.getItem("propertyFilters")
			const savedPlaces = localStorage.getItem("propertyPlaces")
			const savedSearchTerm = localStorage.getItem("propertySearchTerm")
			const savedSizeRange = localStorage.getItem("apartmentSizeRange")
			const savedCapacityRange = localStorage.getItem("personCapacityRange")
			const savedLastMinuteOnly = localStorage.getItem("lastMinuteOnly")

			if (savedFilters) {
				try {
					const parsed = JSON.parse(savedFilters) as PropertyFilterType[]
					setSelectedFilters(parsed)
				} catch (error) {
					console.error("Error parsing saved filters:", error)
					setSelectedFilters([])
				}
			} else {
				setSelectedFilters([])
			}

			if (savedPlaces) {
				try {
					const parsed = JSON.parse(savedPlaces) as number[]
					setSelectedPlaces(parsed)
				} catch (error) {
					console.error("Error parsing saved places:", error)
					setSelectedPlaces([])
				}
			} else {
				setSelectedPlaces([])
			}

			if (savedSearchTerm) {
				try {
					const parsed = JSON.parse(savedSearchTerm) as string
					setSearchTerm(parsed)
				} catch (error) {
					console.error("Error parsing saved search term:", error)
					setSearchTerm("")
				}
			} else {
				setSearchTerm("")
			}

			if (savedSizeRange) {
				try {
					const parsed = JSON.parse(savedSizeRange) as {
						min: number
						max: number
					}
					setApartmentSizeRange(parsed)
				} catch (error) {
					console.error("Error parsing saved size range:", error)
					setApartmentSizeRange({ min: 0, max: 150 })
				}
			} else {
				setApartmentSizeRange({ min: 0, max: 150 })
			}

			if (savedCapacityRange) {
				try {
					const parsed = JSON.parse(savedCapacityRange) as {
						min: number
						max: number
					}
					setPersonCapacityRange(parsed)
				} catch (error) {
					console.error("Error parsing saved capacity range:", error)
					setPersonCapacityRange({ min: 1, max: 8 })
				}
			} else {
				setPersonCapacityRange({ min: 1, max: 8 })
			}

			if (savedLastMinuteOnly !== null) {
				try {
					const parsed = JSON.parse(savedLastMinuteOnly) as boolean
					setLastMinuteOnly(parsed)
				} catch (error) {
					console.error("Error parsing saved last minute only:", error)
					setLastMinuteOnly(false)
				}
			} else {
				setLastMinuteOnly(false)
			}
		}

		// Listen for localStorage changes (when FilterButton or search updates filters)
		const handleStorageChange = (e: StorageEvent) => {
			if (
				e.key === "propertyFilters" ||
				e.key === "propertyPlaces" ||
				e.key === "propertySearchTerm" ||
				e.key === "apartmentSizeRange" ||
				e.key === "personCapacityRange" ||
				e.key === "lastMinuteOnly"
			) {
				loadFiltersAndSearch()
			}
		}

		// Listen for localStorage changes from the same tab
		const handleCustomStorageChange = () => {
			loadFiltersAndSearch()
		}

		window.addEventListener("storage", handleStorageChange)
		window.addEventListener("localStorageChange", handleCustomStorageChange)

		return () => {
			window.removeEventListener("storage", handleStorageChange)
			window.removeEventListener("localStorageChange", handleCustomStorageChange)
		}
	}, [])

	// Handle search input change
	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newSearchTerm = e.target.value
		setSearchTerm(newSearchTerm)
		localStorage.setItem("propertySearchTerm", JSON.stringify(newSearchTerm))

		// Dispatch custom event to notify other components
		window.dispatchEvent(new Event("localStorageChange"))
	}

	// Handle clear search
	const handleClearSearch = () => {
		setSearchTerm("")
		localStorage.setItem("propertySearchTerm", JSON.stringify(""))

		// Dispatch custom event to notify other components
		window.dispatchEvent(new Event("localStorageChange"))
	}

	// Calculate how many cards fit in the viewport
	const calculateItemsPerView = useCallback(() => {
		if (carouselRef.current) {
			const containerWidth = carouselRef.current.offsetWidth
			const calculatedCardWidth = Math.min(containerWidth * 0.9, 320) // Responsive card width, max 320px
			const gap = window.innerWidth < 640 ? 16 : 24 // Smaller gap on mobile
			const minPadding = window.innerWidth < 640 ? 16 : 32 // Smaller padding on mobile

			setCardWidth(calculatedCardWidth)

			// Calculate how many full cards can fit
			const availableWidth = containerWidth - minPadding * 2
			const itemsCanFit = Math.floor((availableWidth + gap) / (calculatedCardWidth + gap))

			return Math.max(1, Math.min(itemsCanFit, filteredProperties.length))
		}
		return 1
	}, [filteredProperties.length])

	// Update items per view on resize
	useEffect(() => {
		const updateItemsPerView = () => {
			const newItemsPerView = calculateItemsPerView()
			setItemsPerView(newItemsPerView)
			// Reset to first slide when changing layout
			setCurrentIndex(0)
		}

		updateItemsPerView()
		window.addEventListener("resize", updateItemsPerView)
		return () => window.removeEventListener("resize", updateItemsPerView)
	}, [calculateItemsPerView]) // Fetch properties on component mount
	useEffect(() => {
		if (propertiesInitialized.current) {
			return
		}

		propertiesInitialized.current = true

		const fetchProperties = async () => {
			try {
				setLoading(true)
				const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mscapartments.pl"
				const response = await fetch(`${baseUrl}/api/properties/mountain?userId=clok0rd6f0000kkdgyf1pd0t3`)

				if (!response.ok) {
					throw new Error(`Failed to fetch properties: ${response.status}`)
				}

				const data = await response.json()
				const fetchedProperties = data.properties || []

				setAllProperties(fetchedProperties)
				// Note: filtering will be applied automatically by the separate useEffect that watches allProperties and selectedFilters
			} catch (error) {
				console.error("Error fetching properties:", error)
				// Reset the flag on error so it can retry
				propertiesInitialized.current = false
			} finally {
				setLoading(false)
			}
		}
		fetchProperties()

		return () => {}
	}, []) // Intentionally empty - we only want to fetch once on mount
	// Handle smooth scrolling with responsive layout
	const scrollToIndex = useCallback(
		(index: number) => {
			if (carouselRef.current) {
				const gap = window.innerWidth < 640 ? 16 : 24
				const containerWidth = carouselRef.current.offsetWidth

				// Calculate padding needed to center the view when showing multiple cards
				let scrollLeft = 0

				if (itemsPerView === 1) {
					// Single card: center it
					const padding = (containerWidth - cardWidth) / 2
					scrollLeft = index * (cardWidth + gap) - padding
				} else {
					// Multiple cards: show full cards aligned to left with some padding
					const padding = (containerWidth - (itemsPerView * cardWidth + (itemsPerView - 1) * gap)) / 2
					scrollLeft = index * (cardWidth + gap) - padding
				}

				carouselRef.current.scrollTo({
					left: Math.max(0, scrollLeft),
					behavior: "smooth",
				})
			}
		},
		[itemsPerView, cardWidth],
	)

	// Center the first card when properties are loaded
	useEffect(() => {
		if (filteredProperties.length > 0) {
			scrollToIndex(0)
			// Trigger card animations after a short delay
			const animationTimer = setTimeout(() => {
				setCardsAnimated(true)
			}, 300)
			return () => {
				clearTimeout(animationTimer)
			}
		} else {
			// If no properties, ensure animation state is reset
			setCardsAnimated(false)
		}
	}, [filteredProperties.length, itemsPerView, scrollToIndex, cardsAnimated])

	const handlePrevious = () => {
		const newIndex = Math.max(0, currentIndex - 1)
		setCurrentIndex(newIndex)
		scrollToIndex(newIndex)
	}
	const handleNext = () => {
		const newIndex = Math.min(maxIndex, currentIndex + 1)
		setCurrentIndex(newIndex)
		scrollToIndex(newIndex)
	} // Handle scroll events to update current index
	const handleScroll = useCallback(() => {
		if (carouselRef.current) {
			const container = carouselRef.current
			const cards = container.children

			if (cards.length === 0) return

			const containerLeft = container.scrollLeft
			const containerWidth = container.offsetWidth
			const gap = window.innerWidth < 640 ? 16 : 24

			// Calculate which card group is currently being shown
			let newIndex = 0

			if (itemsPerView === 1) {
				// Single card: find the card closest to center
				const containerCenter = containerLeft + containerWidth / 2
				let closestDistance = Infinity

				for (let i = 0; i < cards.length; i++) {
					const card = cards[i] as HTMLElement
					const cardCenter = card.offsetLeft + card.offsetWidth / 2
					const distance = Math.abs(containerCenter - cardCenter)

					if (distance < closestDistance) {
						closestDistance = distance
						newIndex = i
					}
				}
			} else {
				// Multiple cards: calculate index based on scroll position
				// Take into account the padding used in scrollToIndex
				const padding = (containerWidth - (itemsPerView * cardWidth + (itemsPerView - 1) * gap)) / 2
				const adjustedScrollLeft = containerLeft + padding

				// Calculate which "page" of cards we're viewing
				newIndex = Math.round(adjustedScrollLeft / (cardWidth + gap))

				// Ensure we don't exceed the maximum index
				newIndex = Math.max(0, Math.min(newIndex, maxIndex))
			}

			setCurrentIndex(newIndex)
		}
	}, [itemsPerView, maxIndex, cardWidth]) // Handle apartment selection
	const handleViewDetails = (property: Property) => {
		// Store current scroll position and section before navigation
		const scrollPosition = window.scrollY
		sessionStorage.setItem("homeScrollPosition", scrollPosition.toString())

		// Determine which section we're in based on actual section elements
		let currentSection = "hero"

		// Try to find the current section by checking which section is visible
		const sections = ["hero", "about", "features", "contact"]
		for (const sectionId of sections) {
			const sectionElement = document.getElementById(sectionId)
			if (sectionElement) {
				const rect = sectionElement.getBoundingClientRect()
				// If the section takes up most of the viewport (at least 50%), consider it current
				if (rect.top <= window.innerHeight * 0.5 && rect.bottom >= window.innerHeight * 0.5) {
					currentSection = sectionId
					break
				}
			}
		}

		// Fallback: calculate based on viewport heights if element detection fails
		if (currentSection === "hero" && scrollPosition > 0) {
			const viewportHeight = window.innerHeight
			const sectionIndex = Math.round(scrollPosition / viewportHeight)
			const sectionNames = ["hero", "about", "features", "contact"]
			currentSection = sectionNames[Math.min(sectionIndex, sectionNames.length - 1)] || "hero"
		}

		sessionStorage.setItem("homeCurrentSection", currentSection)

		// Navigate to property details page - extract language from current path
		const currentLang = window.location.pathname.split("/")[1] || "en"
		router.push(`/${currentLang}/property/${property.id}`)
	}
	useEffect(() => {
		const carousel = carouselRef.current
		if (carousel) {
			carousel.addEventListener("scroll", handleScroll)
			return () => carousel.removeEventListener("scroll", handleScroll)
		}
	}, [handleScroll])

	// Helper function to get search results text with proper interpolation
	const getSearchResultsText = () => {
		const totalProperties = allProperties.length
		const filteredCount = filteredProperties.length

		if (searchTerm.trim()) {
			if (filteredCount === 0) {
				return dictionary.apartments.noResults?.replace("{{searchTerm}}", searchTerm) || `No properties found matching '${searchTerm}'`
			}
			return (
				dictionary.apartments.searchResultsFiltered
					?.replace("{{filtered}}", filteredCount.toString())
					?.replace("{{total}}", totalProperties.toString())
					?.replace("{{searchTerm}}", searchTerm) || `Showing ${filteredCount} of ${totalProperties} properties matching '${searchTerm}'`
			)
		}

		return dictionary.apartments.searchResults?.replace("{{total}}", filteredCount.toString()) || `Showing ${filteredCount} properties`
	}

	return (
		<div className="w-full bg-[#e4d9c7] py-2 sm:py-3">
			{/* Search Results Text - moved to top */}
			{!loading && (
				<div className="text-center mb-4">
					<p className="text-sm text-gray-600">{getSearchResultsText()}</p>
					{searchTerm && (selectedFilters.length > 0 || selectedPlaces.length > 0) && (
						<p className="text-xs text-gray-500 mt-1">{dictionary.filters.matching} filters are highlighted</p>
					)}
				</div>
			)}

			{/* Search Input Section */}
			<div className="flex flex-col sm:flex-row w-full justify-center items-center gap-4 sm:gap-0">
				<div className="mb-4 sm:mb-6">
					<div className="relative max-w-md mx-auto">
						<div className="relative">
							<input
								type="text"
								value={searchTerm}
								onChange={handleSearchChange}
								placeholder={dictionary.apartments.searchPlaceholder || "Search by property name..."}
								className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#cc9678] focus:border-[#cc9678] focus:bg-white outline-none transition-all duration-200 shadow-sm"
							/>

							<div className="absolute inset-y-0 right-0 flex items-center pr-3">
								{searchTerm ? (
									<button
										onClick={handleClearSearch}
										className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
										title={dictionary.apartments.clearSearch || "Clear search"}>
										<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
										</svg>
									</button>
								) : (
									<svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
									</svg>
								)}
							</div>
						</div>
					</div>
				</div>
				<div id="locale-switcher" className="z-40">
					<FilterButtonSearch dictionary={dictionary.filters} />
				</div>
			</div>

			{loading ? (
				<div className="flex justify-center items-center h-48 sm:h-64">
					<div className="relative">
						<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#cc9678]"></div>
						<div className="absolute inset-0 flex items-center justify-center">
							<div className="text-[#cc9678] font-semibold animate-pulse">Loading...</div>
						</div>
					</div>
				</div>
			) : filteredProperties.length === 0 ? (
				<div className="text-center py-8 sm:py-12">
					<p className="text-gray-500 text-lg">{searchTerm ? getSearchResultsText() : "No properties found."}</p>
				</div>
			) : (
				<>
					{/* Carousel Container */}
					<div className="relative overflow-hidden bg-[#f5f0eb] rounded-lg p-4 sm:p-6">
						{/* Previous Button */}
						<button
							onClick={handlePrevious}
							disabled={currentIndex === 0}
							className={`absolute left-1 sm:left-2 top-1/2 transform -translate-y-1/2 z-30 bg-gradient-to-r from-[#cc9678] via-[#b8856a] to-[#a3745c] hover:from-[#b8856a] hover:via-[#a3745c] hover:to-[#8f6350] text-white shadow-lg rounded-full p-2 sm:p-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-700 ease-out ${
								cardsAnimated ? "translate-x-0 opacity-100 scale-100" : "-translate-x-full opacity-0 scale-75"
							}`}
							style={{ transitionDelay: "200ms" }}
							aria-label="Previous apartments">
							<svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
							</svg>
						</button>
						{/* Next Button */}
						<button
							onClick={handleNext}
							disabled={currentIndex >= maxIndex}
							className={`absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 z-30 bg-gradient-to-r from-[#cc9678] via-[#b8856a] to-[#a3745c] hover:from-[#b8856a] hover:via-[#a3745c] hover:to-[#8f6350] text-white shadow-lg rounded-full p-2 sm:p-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-700 ease-out ${
								cardsAnimated ? "translate-x-0 opacity-100 scale-100" : "translate-x-full opacity-0 scale-75"
							}`}
							style={{ transitionDelay: "200ms" }}
							aria-label="Next apartments">
							<svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
							</svg>
						</button>
						{/* Apartment Cards */}
						<div
							ref={carouselRef}
							className="flex overflow-x-auto scrollbar-hide gap-4 sm:gap-6 py-2 sm:py-4 snap-x snap-mandatory scroll-smooth px-2 sm:px-4"
							style={{
								scrollSnapType: "x mandatory",
								scrollbarWidth: "none",
								msOverflowStyle: "none",
							}}>
							{" "}
							{properties.map((property, index) => (
								<div
									key={property.id}
									className={`snap-center flex-none transition-all duration-700 ease-out ${cardsAnimated ? "translate-x-0 opacity-100 scale-100" : "translate-x-full opacity-0 scale-95"}`}
									style={{
										minWidth: `${cardWidth}px`,
										maxWidth: `${cardWidth}px`,
										transitionDelay: `${index * 150}ms`,
									}}>
									{" "}
									<ApartmentCard
										property={property}
										onViewDetails={handleViewDetails}
										isMatching={isPropertyMatching(property)}
										dictionary={dictionary}
									/>
								</div>
							))}
						</div>
						{/* Pagination Dots */}
						<div
							className={`flex justify-center mt-4 sm:mt-6 space-x-2 transition-all duration-700 ease-out ${cardsAnimated ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
							style={{ transitionDelay: "800ms" }}>
							{Array.from({ length: maxIndex + 1 }, (_, i) => (
								<button
									key={i}
									onClick={() => {
										setCurrentIndex(i)
										scrollToIndex(i)
									}}
									className={`w-3 h-3 rounded-full transition-all ${currentIndex === i ? "bg-[#cc9678]" : "bg-gray-300 hover:bg-gray-400"}`}
									aria-label={`Go to slide ${i + 1}`}
								/>
							))}
						</div>
					</div>
				</>
			)}
		</div>
	)
}
