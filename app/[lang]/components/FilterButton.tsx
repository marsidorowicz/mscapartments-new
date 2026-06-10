/** @format */

"use client"

import { useState, useEffect, useRef } from "react"
import { PropertyFilterType, Place } from "@/types"
import { Dictionary } from "../../types/dictionary"
import axios from "axios"
import { NEXT_PUBLIC_API_BASE_URL } from "@/types"

type FilterButtonProps = {
	dictionary: Dictionary["filters"]
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
	const [isInitialized, setIsInitialized] = useState(false)

	// Load filters from localStorage on mount
	useEffect(() => {
		// Ensure we're on the client side
		if (typeof window !== "undefined") {
			const savedFilters = localStorage.getItem("propertyFilters")
			const savedPlaces = localStorage.getItem("propertyPlaces")

			if (savedFilters) {
				try {
					const parsed = JSON.parse(savedFilters)
					if (Array.isArray(parsed)) {
						setSelectedFilters(parsed)
					}
				} catch (error) {
					console.error("Error parsing saved filters:", error)
				}
			}

			if (savedPlaces) {
				try {
					const parsed = JSON.parse(savedPlaces)
					if (Array.isArray(parsed)) {
						setSelectedPlaces(parsed)
					}
				} catch (error) {
					console.error("Error parsing saved places:", error)
				}
			}

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

	const unselectAll = () => {
		setSelectedFilters([])
		setSelectedPlaces([])
	}

	return {
		selectedFilters,
		selectedPlaces,
		toggleFilter,
		togglePlace,
		unselectAll,
	}
}

// Filter groups for better organization
const getFilterGroups = () => {
	return {
		views: [PropertyFilterType.MOUNTAIN_VIEW],
		amenities: [
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
		],
		facilities: [
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

export default function FilterButton({ dictionary }: FilterButtonProps) {
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [places, setPlaces] = useState<Place[]>([])
	const placesInitialized = useRef(false)
	const dialogContentRef = useRef<HTMLDivElement>(null)
	const { selectedFilters, selectedPlaces, toggleFilter, togglePlace, unselectAll } = useFilterStore()

	useEffect(() => {
		if (placesInitialized.current) {
			return
		}

		placesInitialized.current = true

		const fetchPlaces = async () => {
			try {
				const response = await axios.get(`${NEXT_PUBLIC_API_BASE_URL}/properties/places?userId=clok0rd6f0000kkdgyf1pd0t3`)

				if (response.data.success) {
					setPlaces(response.data.places || [])
				}
			} catch (error) {
				console.error("Error fetching places:", error)
				// Reset the flag on error so it can retry
				placesInitialized.current = false
			}
		}

		fetchPlaces()

		return () => {
			console.log("FilterButton: fetchPlaces useEffect cleanup")
		}
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
					{places.map((place) => (
						<label
							key={place.id}
							className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all min-h-[60px] ${
								selectedPlaces.includes(place.id || 0)
									? "border-amber-500 bg-amber-50 text-amber-800"
									: "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
							}`}>
							<input
								type="checkbox"
								checked={selectedPlaces.includes(place.id || 0)}
								onChange={() => togglePlace(place.id || 0)}
								className="sr-only"
							/>{" "}
							<div
								className={`w-4 h-4 rounded border mr-3 flex items-center justify-center flex-shrink-0 ${
									selectedPlaces.includes(place.id || 0) ? "bg-amber-500 border-amber-500" : "border-gray-300 bg-white"
								}`}>
								{selectedPlaces.includes(place.id || 0) && (
									<svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
										<path
											fillRule="evenodd"
											d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
											clipRule="evenodd"
										/>
									</svg>
								)}
							</div>{" "}
							<span className="text-sm font-medium leading-tight text-gray-900">{place.name}</span>
						</label>
					))}
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
							className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all min-h-[60px] ${
								selectedFilters.includes(filter)
									? "border-amber-500 bg-amber-50 text-amber-800"
									: "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
							}`}>
							<input type="checkbox" checked={selectedFilters.includes(filter)} onChange={() => toggleFilter(filter)} className="sr-only" />{" "}
							<div
								className={`w-4 h-4 rounded border mr-3 flex items-center justify-center flex-shrink-0 ${
									selectedFilters.includes(filter) ? "bg-amber-500 border-amber-500" : "border-gray-300 bg-white"
								}`}>
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
			<div className={`fixed bottom-4 right-4 z-50 transition-all duration-300 `}>
				<button
					onClick={() => setIsDialogOpen(true)}
					className="bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 hover:from-amber-500 hover:via-yellow-600 hover:to-amber-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-105 relative"
					aria-label={dictionary.title}>
					{/* Filter icon */}
					<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"
						/>
					</svg>
					{/* Selected filters count badge */}
					{selectedFilters.length + selectedPlaces.length > 0 && (
						<div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
							{selectedFilters.length + selectedPlaces.length}
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
								<div className="text-sm text-gray-600">{getFilterText(selectedFilters.length + selectedPlaces.length, dictionary)}</div>
								{selectedFilters.length + selectedPlaces.length > 0 && (
									<button onClick={unselectAll} className="px-4 py-2 text-amber-600 hover:text-amber-700 font-medium transition-colors">
										{dictionary.unselectAll}
									</button>
								)}
							</div>{" "}
							{/* Filter Groups */}
							<div className="space-y-6">
								{renderPlacesGroup()}
								{renderFilterGroup("views", dictionary.views)}
								{renderFilterGroup("amenities", dictionary.amenities)}
								{renderFilterGroup("facilities", dictionary.facilities)}
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
								className="w-full bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 hover:from-amber-500 hover:via-yellow-600 hover:to-amber-700 text-white py-3 px-6 rounded-lg font-medium transition-all duration-300">
								{dictionary.close}
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	)
}
