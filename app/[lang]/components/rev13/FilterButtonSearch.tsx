/** @format */

"use client"

import { useState, useEffect, useRef } from "react"
import { PropertyFilterType, Place } from "@/types"
import { Dictionary } from "../../../types/dictionary"
import { Slider } from "@mui/material"
import { NEXT_PUBLIC_API_BASE_URL } from "@/types"

type FilterButtonProps = {
	dictionary: Dictionary["filters"]
	className?: string
	color?: string
}

// Helper function for Polish pluralization
const getPolishFilterText = (count: number, dictionary: Dictionary["filters"]) => {
	if (count === 1) {
		return `${count} ${dictionary.filterSingular} ${dictionary.selectedSingular || dictionary.selected}`
	} else if (count >= 2 && count <= 4) {
		return `${count} ${dictionary.filterFew || dictionary.filterPlural} ${dictionary.selectedFew || dictionary.selected}`
	} else {
		return `${count} ${dictionary.filterMany || dictionary.filterPlural} ${dictionary.selectedMany || dictionary.selected}`
	}
}

// Helper function for other languages
const getFilterText = (count: number, dictionary: Dictionary["filters"]) => {
	// Check if Polish forms are available (indicating Polish language)
	if (dictionary.filterFew || dictionary.selectedSingular) {
		return getPolishFilterText(count, dictionary)
	}

	// Default behavior for other languages
	const filterWord = count === 1 ? dictionary.filterSingular : dictionary.filterPlural
	return `${count} ${filterWord} ${dictionary.selected}`
}

// State management for filters
const useFilterStore = () => {
	const [selectedFilters, setSelectedFilters] = useState<PropertyFilterType[]>([])
	const [selectedPlaces, setSelectedPlaces] = useState<number[]>([])
	const [apartmentSizeRange, setApartmentSizeRange] = useState<{
		min: number
		max: number
	}>({ min: 0, max: 150 })
	const [personCapacityRange, setPersonCapacityRange] = useState<{
		min: number
		max: number
	}>({ min: 1, max: 8 })
	const [lastMinuteOnly, setLastMinuteOnly] = useState(false)
	const [isInitialized, setIsInitialized] = useState(false)

	// Load filters from localStorage on mount
	useEffect(() => {
		// Ensure we're on the client side
		if (typeof window !== "undefined") {
			setIsInitialized(true)
		}
	}, [])

	// Save filters to localStorage whenever they change (but only after initialization)
	useEffect(() => {
		if (isInitialized) {
			localStorage.setItem("propertyFilters", JSON.stringify(selectedFilters))
			// Dispatch custom event for same-tab communication
			window.dispatchEvent(
				new CustomEvent("localStorageChange", {
					detail: { key: "propertyFilters", value: selectedFilters },
				}),
			)
		}
	}, [selectedFilters, isInitialized])

	// Save places to localStorage whenever they change (but only after initialization)
	useEffect(() => {
		if (isInitialized) {
			localStorage.setItem("propertyPlaces", JSON.stringify(selectedPlaces))
			// Dispatch custom event for same-tab communication
			window.dispatchEvent(
				new CustomEvent("localStorageChange", {
					detail: { key: "propertyPlaces", value: selectedPlaces },
				}),
			)
		}
	}, [selectedPlaces, isInitialized])

	// Save apartment size range to localStorage
	useEffect(() => {
		if (isInitialized) {
			localStorage.setItem("apartmentSizeRange", JSON.stringify(apartmentSizeRange))
			// Dispatch custom event for same-tab communication
			window.dispatchEvent(
				new CustomEvent("localStorageChange", {
					detail: {
						key: "apartmentSizeRange",
						value: apartmentSizeRange,
					},
				}),
			)
		}
	}, [apartmentSizeRange, isInitialized])

	// Save person capacity range to localStorage
	useEffect(() => {
		if (isInitialized) {
			localStorage.setItem("personCapacityRange", JSON.stringify(personCapacityRange))
			// Dispatch custom event for same-tab communication
			window.dispatchEvent(
				new CustomEvent("localStorageChange", {
					detail: {
						key: "personCapacityRange",
						value: personCapacityRange,
					},
				}),
			)
		}
	}, [personCapacityRange, isInitialized])

	// Save last minute filter to localStorage
	useEffect(() => {
		if (isInitialized) {
			localStorage.setItem("lastMinuteOnly", JSON.stringify(lastMinuteOnly))
			// Dispatch custom event for same-tab communication
			window.dispatchEvent(
				new CustomEvent("localStorageChange", {
					detail: {
						key: "lastMinuteOnly",
						value: lastMinuteOnly,
					},
				}),
			)
		}
	}, [lastMinuteOnly, isInitialized])
	const toggleFilter = (filter: PropertyFilterType) => {
		setSelectedFilters((prev) => {
			if (prev.includes(filter)) {
				return prev.filter((f) => f !== filter)
			} else {
				return [...prev, filter]
			}
		})
	}

	const togglePlace = (placeId: number) => {
		setSelectedPlaces((prev) => {
			if (prev.includes(placeId)) {
				return prev.filter((id) => id !== placeId)
			} else {
				return [...prev, placeId]
			}
		})
	}

	const updateApartmentSizeRange = (min: number, max: number) => {
		setApartmentSizeRange({ min, max })
	}

	const updatePersonCapacityRange = (min: number, max: number) => {
		setPersonCapacityRange({ min, max })
	}

	const toggleLastMinuteOnly = () => {
		setLastMinuteOnly((prev) => !prev)
	}

	const unselectAll = () => {
		setSelectedFilters([])
		setSelectedPlaces([])
		setApartmentSizeRange({ min: 0, max: 150 })
		setPersonCapacityRange({ min: 1, max: 8 })
		setLastMinuteOnly(false)
	}

	// Get total active filter count
	const getActiveFilterCount = () => {
		let count = selectedFilters.length + selectedPlaces.length

		// Add size range filter if not default
		if (apartmentSizeRange.min > 0 || apartmentSizeRange.max < 150) {
			count++
		}

		// Add capacity range filter if not default
		if (personCapacityRange.min > 1 || personCapacityRange.max < 8) {
			count++
		}

		// Add last minute filter if active
		if (lastMinuteOnly) {
			count++
		}

		return count
	}

	return {
		selectedFilters,
		selectedPlaces,
		apartmentSizeRange,
		personCapacityRange,
		lastMinuteOnly,
		toggleFilter,
		togglePlace,
		updateApartmentSizeRange,
		updatePersonCapacityRange,
		toggleLastMinuteOnly,
		unselectAll,
		getActiveFilterCount,
	}
}

// Filter groups for better organization
const getFilterGroups = () => {
	return {
		views: [PropertyFilterType.MOUNTAIN_VIEW],
		amenities: [
			// Combined amenities and facilities into one "Udogodnienia" group
			PropertyFilterType.WIFI,
			PropertyFilterType.PARKING,
			PropertyFilterType.KITCHEN,
			PropertyFilterType.KITCHENETTE,
			PropertyFilterType.BALCONY,
			PropertyFilterType.TERRACE,
			PropertyFilterType.GARDEN,
			PropertyFilterType.TV,
			PropertyFilterType.AIR_CONDITIONING,
			PropertyFilterType.HEATING,
			PropertyFilterType.FIREPLACE,
			PropertyFilterType.ELECTRIC_FIREPLACE,
			PropertyFilterType.CABLE_CHANNELS,
			PropertyFilterType.SAUNA,
			PropertyFilterType.SWIMMING_POOL,
			PropertyFilterType.JACUZZI,
			PropertyFilterType.FITNESS_ROOM,
			PropertyFilterType.PLAYGROUND,
			PropertyFilterType.PLAYROOM,
			PropertyFilterType.BBQ,
			PropertyFilterType.ELEVATOR,
			PropertyFilterType.LOUNGE_AREA,
		],
		accessibility: [PropertyFilterType.WHEELCHAIR_ACCESSIBLE, PropertyFilterType.PET_FRIENDLY, PropertyFilterType.GROUND_FLOOR],
		appliances: [
			PropertyFilterType.WASHING_MACHINE,
			PropertyFilterType.DISHWASHER,
			PropertyFilterType.MICROWAVE,
			PropertyFilterType.REFRIGERATOR,
			PropertyFilterType.OVEN,
			PropertyFilterType.COOKTOP,
			PropertyFilterType.COFFEE_MACHINE,
			PropertyFilterType.ELECTRIC_KETTLE,
			PropertyFilterType.TOASTER,
			PropertyFilterType.FREEZER,
			PropertyFilterType.VACUUM_CLEANER,
		],
		bathroom: [
			PropertyFilterType.BATHROOM_WITH_BATHTUB,
			PropertyFilterType.BATHROOM_WITH_SHOWER,
			PropertyFilterType.HAIR_DRYER,
			PropertyFilterType.TOWELS,
			PropertyFilterType.TOILET,
		],
		storage: [PropertyFilterType.WARDROBE, PropertyFilterType.SAFE, PropertyFilterType.PRIVATE_GARAGE],
		kitchen: [PropertyFilterType.KITCHEN_UTENSILS, PropertyFilterType.COFFEE_TEA_SET],
		bedroom: [PropertyFilterType.UPSTAIRS_BEDROOM, PropertyFilterType.MEZZANINE, PropertyFilterType.BUNK_BED],
		other: [PropertyFilterType.IRON_IRONING_BOARD, PropertyFilterType.DESK, PropertyFilterType.PLAYSTATION],
	}
}

export default function FilterButtonSearch({ dictionary, className, color }: FilterButtonProps) {
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [places, setPlaces] = useState<Place[]>([])
	const placesInitialized = useRef(false)
	const dialogContentRef = useRef<HTMLDivElement>(null)
	const {
		selectedFilters,
		selectedPlaces,
		apartmentSizeRange,
		personCapacityRange,
		lastMinuteOnly,
		toggleFilter,
		togglePlace,
		updateApartmentSizeRange,
		updatePersonCapacityRange,
		toggleLastMinuteOnly,
		unselectAll,
		getActiveFilterCount,
	} = useFilterStore()

	useEffect(() => {
		if (placesInitialized.current) {
			return
		}

		placesInitialized.current = true

		const fetchPlaces = async () => {
			try {
				const response = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/properties/places?userId=clok0rd6f0000kkdgyf1pd0t3`)

				if (!response.ok) {
					throw new Error(`Failed to fetch places: ${response.status}`)
				}

				const data = await response.json()

				if (data.success) {
					setPlaces(data.places || [])
				}
			} catch (error) {
				console.error("Error fetching places:", error)
				// Reset the flag on error so it can retry
				placesInitialized.current = false
			}
		}

		fetchPlaces()

		return () => {}
	}, [])
	// Close dialog on escape key
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape" && isDialogOpen) {
				setIsDialogOpen(false)
			}
		}
		// Handle mouse wheel scrolling in dialog
		const handleWheel = (e: WheelEvent) => {
			if (dialogContentRef.current && isDialogOpen) {
				const target = e.target as HTMLElement
				const dialogContent = dialogContentRef.current

				// Check if the wheel event is happening within our dialog
				if (dialogContent.contains(target)) {
					// Allow natural scrolling within the dialog
					e.stopPropagation()

					// Ensure the scroll happens on the dialog content
					const scrollTop = dialogContent.scrollTop
					const scrollHeight = dialogContent.scrollHeight
					const clientHeight = dialogContent.clientHeight
					// Prevent scrolling beyond bounds
					if (e.deltaY > 0 && scrollTop + clientHeight >= scrollHeight) {
						e.preventDefault()
					} else if (e.deltaY < 0 && scrollTop <= 0) {
						e.preventDefault()
					}
				}
			}
		}

		document.addEventListener("keydown", handleEscape)
		const dialogElement = dialogContentRef.current
		if (isDialogOpen && dialogElement) {
			dialogElement.addEventListener("wheel", handleWheel, {
				passive: false,
			})
		}

		return () => {
			document.removeEventListener("keydown", handleEscape)
			if (dialogElement) {
				dialogElement.removeEventListener("wheel", handleWheel)
			}
		}
	}, [isDialogOpen])
	const filterGroups = getFilterGroups()

	const renderPlacesGroup = () => {
		if (places.length === 0) return null

		return (
			<div className="mb-6 z-40">
				<h3 className="text-lg font-semibold text-gray-900 mb-3">{dictionary.places}</h3>{" "}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
					{places
						.filter((place) => place.name.toUpperCase() !== "KOŚCIELISKO")
						.map((place) => (
							<label
								key={place.id}
								className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all min-h-[60px] ${selectedPlaces.includes(place.id || 0) ? "border-[#cc9678] bg-[#f5f0eb] text-[#cc9678]" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"}`}>
								<input
									type="checkbox"
									checked={selectedPlaces.includes(place.id || 0)}
									onChange={() => togglePlace(place.id || 0)}
									className="sr-only"
								/>{" "}
								<div
									className={`w-4 h-4 rounded border mr-3 flex items-center justify-center flex-shrink-0 ${selectedPlaces.includes(place.id || 0) ? "bg-[#cc9678] border-[#cc9678]" : "border-gray-300 bg-white"}`}>
									{selectedPlaces.includes(place.id || 0) && (
										<svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
											<path
												fillRule="evenodd"
												d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
												clipRule="evenodd"
											/>
										</svg>
									)}
								</div>
								<div className="flex flex-col">
									<span className="text-sm font-medium leading-tight text-gray-900">{place.name.toUpperCase()}</span>
									<span className="text-xs text-gray-500 leading-tight">{place.location}</span>
								</div>
							</label>
						))}
				</div>
			</div>
		)
	}

	const renderRangeFilter = (
		title: string,
		min: number,
		max: number,
		currentMin: number,
		currentMax: number,
		onUpdate: (min: number, max: number) => void,
		unit: string = "",
	) => {
		const handleSliderChange = (event: Event, newValue: number | number[]) => {
			if (Array.isArray(newValue)) {
				onUpdate(newValue[0], newValue[1])
			}
		}

		return (
			<div className="mb-6">
				<h3 className="text-lg font-semibold text-gray-900 mb-3">{title}</h3>
				<div className="p-4 border border-gray-200 rounded-lg">
					<div className="flex items-center justify-between mb-4">
						<span className="text-sm text-gray-600">
							{currentMin} {unit} - {currentMax} {unit}
						</span>
					</div>

					{/* MUI Range Slider */}
					<div className="px-3 py-4">
						<Slider
							value={[currentMin, currentMax]}
							onChange={handleSliderChange}
							valueLabelDisplay="auto"
							valueLabelFormat={(value) => `${value} ${unit}`}
							min={min}
							max={max}
							step={1}
							sx={{
								color: `${color || "#cc9678"}`, // #cc9678
								"& .MuiSlider-thumb": {
									backgroundColor: `${color || "#cc9678"}`,
									border: "2px solid #ffffff",
									width: 20,
									height: 20,
									"&:hover": {
										boxShadow: "0px 0px 0px 8px rgba(204, 152, 120, 0.16)",
									},
									"&.Mui-focusVisible": {
										boxShadow: "0px 0px 0px 8px rgba(204, 152, 120, 0.16)",
									},
								},
								"& .MuiSlider-track": {
									backgroundColor: `${color || "#cc9678"}`,
									border: "none",
									height: 8,
								},
								"& .MuiSlider-rail": {
									backgroundColor: `${color || "#e5e7eb"}`, // gray-200
									height: 8,
									opacity: 1,
								},
								"& .MuiSlider-valueLabel": {
									backgroundColor: `${color || "#374151"}`, // gray-700
									color: "#ffffff",
								},
							}}
						/>
					</div>

					{/* Value Labels */}
					<div className="flex justify-between text-xs text-gray-500">
						<span>
							{min} {unit}
						</span>
						<span>
							{max} {unit}
						</span>
					</div>
				</div>
			</div>
		)
	}

	const renderFilterGroup = (groupKey: keyof typeof filterGroups, groupTitle: string) => {
		const filters = filterGroups[groupKey]
		if (!filters || filters.length === 0) return null

		return (
			<div key={groupKey} className="mb-6">
				<h3 className="text-lg font-semibold text-gray-900 mb-3">{groupTitle}</h3>{" "}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
					{filters.map((filter) => (
						<label
							key={filter}
							className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all min-h-[60px] ${selectedFilters.includes(filter) ? "border-[#cc9678] bg-[#f5f0eb] text-[#cc9678]" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"}`}>
							<input type="checkbox" checked={selectedFilters.includes(filter)} onChange={() => toggleFilter(filter)} className="sr-only" />
							<div
								className={`w-4 h-4 rounded border mr-3 flex items-center justify-center flex-shrink-0 ${selectedFilters.includes(filter) ? "bg-[#cc9678] border-[#cc9678]" : "border-gray-300 bg-white"}`}>
								{selectedFilters.includes(filter) && (
									<svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
										<path
											fillRule="evenodd"
											d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
											clipRule="evenodd"
										/>
									</svg>
								)}
							</div>{" "}
							<span className="text-sm font-medium leading-tight text-gray-900">
								{dictionary.filters[filter] || filter.replace(/_/g, " ").toLowerCase()}
							</span>
						</label>
					))}
				</div>
			</div>
		)
	}
	return (
		<>
			{/* Filter Button - Fixed bottom right, only visible when AboutSection is visible */}
			<div className={`transition-all duration-300 h-full w-full`}>
				<button
					onClick={() => setIsDialogOpen(true)}
					className={`bg-[${color || "#cc9678"}] hover:bg-[${color || "#b8856a"}] text-white px-4 py-2 rounded-md shadow-sm focus:ring-2 focus:ring-blue-400 transition-all duration-300 relative h-[90px] ${className || ""}`}
					aria-label={dictionary.title}>
					{/* Filter icon */}
					{dictionary.title}
					{/* Selected filters count badge */}
					{getActiveFilterCount() > 0 && (
						<div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
							{getActiveFilterCount()}
						</div>
					)}
				</button>
			</div>
			{/* Full-screen Filter Dialog */}{" "}
			{isDialogOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center">
					{/* Backdrop */}
					<div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsDialogOpen(false)} />
					{/* Dialog Content */}{" "}
					<div
						ref={dialogContentRef}
						className="relative bg-white rounded-2xl shadow-2xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto"
						style={{
							scrollBehavior: "smooth",
							WebkitOverflowScrolling: "touch",
						}}
						tabIndex={-1}>
						{/* Header */}
						<div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
							<div className="flex items-center justify-between">
								<div>
									<h2 className="text-2xl font-bold text-gray-900">{dictionary.title}</h2>
									<p className="text-gray-600 mt-1">{dictionary.subtitle}</p>
								</div>
								<button
									onClick={() => setIsDialogOpen(false)}
									className="p-2 hover:bg-gray-100 rounded-full transition-colors"
									aria-label={dictionary.close}>
									<svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
									</svg>
								</button>
							</div>
						</div>{" "}
						{/* Filter Content */}
						<div className="p-6">
							{/* Action buttons */}
							<div className="flex justify-between items-center mb-6">
								<div className="text-sm text-gray-600">{getFilterText(getActiveFilterCount(), dictionary)}</div>
								{getActiveFilterCount() > 0 && (
									<button
										onClick={unselectAll}
										className={`px-4 py-2 text-[${color || "#cc9678"}] hover:text-[${color || "#b8856a"}] font-medium transition-colors`}>
										{dictionary.unselectAll}
									</button>
								)}
							</div>{" "}
							{/* Filter Groups */}
							<div className="space-y-6">
								{renderPlacesGroup()}

								{/* Range Filters */}
								{renderRangeFilter(
									dictionary.apartmentSize,
									0,
									150,
									apartmentSizeRange.min,
									apartmentSizeRange.max,
									updateApartmentSizeRange,
									"m²",
								)}

								{renderRangeFilter(
									dictionary.personCapacity,
									1,
									8,
									personCapacityRange.min,
									personCapacityRange.max,
									updatePersonCapacityRange,
									dictionary.personCapacityUnit,
								)}

								{/* Last Minute Filter */}
								<div className="mb-6">
									<h3 className="text-lg font-semibold text-gray-900 mb-3">{dictionary.lastMinute || "Oferty Last Minute"}</h3>
									<label
										className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all ${lastMinuteOnly ? `border-[${color || "#cc9678"}] bg-[${color || "#f5f0eb"}] text-[${color || "#cc9678"}]` : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"}`}>
										<input type="checkbox" checked={lastMinuteOnly} onChange={toggleLastMinuteOnly} className="sr-only" />
										<div
											className={`w-4 h-4 rounded border mr-3 flex items-center justify-center flex-shrink-0 ${lastMinuteOnly ? `bg-[${color || "#cc9678"}] border-[${color || "#cc9678"}]` : "border-gray-300 bg-white"}`}>
											{lastMinuteOnly && (
												<svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
													<path
														fillRule="evenodd"
														d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
														clipRule="evenodd"
													/>
												</svg>
											)}
										</div>
										<div className="flex-1">
											<span className="text-sm font-medium leading-tight text-gray-900 block">
												{dictionary.lastMinuteOnly || "Tylko oferty last minute"}
											</span>
											<span className="text-xs text-gray-500 block mt-1">
												{dictionary.lastMinuteDescription || "Pokaż tylko apartamenty z aktywną promocją last minute"}
											</span>
										</div>
									</label>
								</div>

								{renderFilterGroup("views", dictionary.views)}
								{renderFilterGroup("amenities", dictionary.amenities)}
								{renderFilterGroup("appliances", dictionary.appliances)}
								{renderFilterGroup("bathroom", dictionary.bathroom)}
								{renderFilterGroup("storage", dictionary.storage)}
								{renderFilterGroup("kitchen", dictionary.kitchen)}
								{renderFilterGroup("bedroom", dictionary.bedroom)}
								{renderFilterGroup("other", dictionary.other)}
								{renderFilterGroup("accessibility", dictionary.accessibility)}
							</div>
						</div>
						{/* Footer */}
						<div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-2xl border-t border-gray-200">
							<button
								onClick={() => setIsDialogOpen(false)}
								className={`w-full bg-[${color || "#cc9678"}] hover:bg-[${color || "#b8856a"}] text-white py-3 px-6 rounded-lg font-medium transition-all duration-300`}>
								{dictionary.close}
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	)
}
