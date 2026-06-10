/** @format */

"use client"

import React, { useState, useEffect, useRef, useMemo } from "react"
import Image from "next/image"
import { Dictionary } from "../../types/dictionary"
import { Locale } from "../../i18n-config"
import { Property } from "@/types"
import SearchBar from "./components/SearchBar"
import ModernApartmentTile from "./components/ModernApartmentTile"
import { sendGAEvent } from "@next/third-parties/google"
import ModernNav from "../homepage/components/ModernNav"
import Footer from "../homepage/components/Footer"
import { getApartamentyPageText } from "./seo"

type ApartamentyPageClientProps = {
	dictionary: Dictionary
	lang: Locale
	dateRange: string | null
	initialLocation?: string
}

// Snapshot type for advanced filters coming from rev13 FilterButtonSearch (stored in localStorage)
type AdvancedFiltersSnapshot = {
	selectedFilters: string[]
	selectedPlaces: number[]
	apartmentSizeRange: { min: number; max: number }
	personCapacityRange: { min: number; max: number }
	lastMinuteOnly: boolean
}

export default function ApartamentyPageClient({ dictionary: _dictionary, lang, dateRange, initialLocation }: ApartamentyPageClientProps) {
	const [properties, setProperties] = useState<Property[]>([])
	const [loading, setLoading] = useState(true)
	const [filterLocation, setFilterLocation] = useState(initialLocation || "")
	const [filterGuests, setFilterGuests] = useState("")
	const [filterSearchName, setFilterSearchName] = useState("")
	const [filterDateRange, setFilterDateRange] = useState<{ start: Date | null; end: Date | null } | null>(null)
	const [searchedDateRange, setSearchedDateRange] = useState<{ start: Date | null; end: Date | null } | null>(null)
	const [availablePropertyIds, setAvailablePropertyIds] = useState<Set<number>>(new Set())
	const [propertyPriceSums, setPropertyPriceSums] = useState<Record<number, number>>({})
	const [places, setPlaces] = useState<{ id: number; name: string; location: string }[]>([])
	const [searchTrigger, setSearchTrigger] = useState(0)
	// Advanced filter snapshot state (populated on explicit search click or initial load, mirroring date behavior)
	const [searchedAdvancedFilters, setSearchedAdvancedFilters] = useState<AdvancedFiltersSnapshot | null>(null)
	const [advancedFilterTick, setAdvancedFilterTick] = useState(0)
	const filterDateRangeRef = useRef(filterDateRange)

	const propertiesInitialized = useRef(false)
	const pageLocation = initialLocation === "zakopane" || initialLocation === "koscielisko" ? initialLocation : undefined
	const pageText = useMemo(() => getApartamentyPageText(lang, pageLocation), [lang, pageLocation])

	// Parse dateRange from URL params
	const parseDateRange = (range: string | null): { start: Date | null; end: Date | null } | null => {
		if (!range) return null

		const [startStr, endStr] = range.split("_")
		if (!startStr || !endStr) return null

		const start = new Date(startStr)
		const end = new Date(endStr)

		// Validate dates
		const today = new Date()
		today.setHours(0, 0, 0, 0)

		if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
			return null
		}

		return { start, end }
	}

	const normalizeText = (value: string) =>
		value
			.normalize("NFD")
			.replace(/[\u0300-\u036f]/g, "")
			.normalize("NFC")
			.toLowerCase()

	// Helper to read current advanced filters from localStorage (managed by rev13 FilterButtonSearch)
	const getCurrentAdvancedFilters = (): AdvancedFiltersSnapshot | null => {
		if (typeof window === "undefined") return null
		try {
			return {
				selectedFilters: JSON.parse(localStorage.getItem("propertyFilters") || "[]"),
				selectedPlaces: JSON.parse(localStorage.getItem("propertyPlaces") || "[]"),
				apartmentSizeRange: JSON.parse(localStorage.getItem("apartmentSizeRange") || '{"min":0,"max":150}'),
				personCapacityRange: JSON.parse(localStorage.getItem("personCapacityRange") || '{"min":1,"max":8}'),
				lastMinuteOnly: JSON.parse(localStorage.getItem("lastMinuteOnly") || "false"),
			}
		} catch {
			return null
		}
	}

	const handleFilterChange = ({ location, guests, searchName }: { location: string; guests: string; searchName: string }) => {
		setFilterLocation(location)
		setFilterGuests(guests)
		setFilterSearchName(searchName)
		if (!filterDateRange?.start || !filterDateRange?.end) {
			setSearchedDateRange(null)
		}
		// Snapshot current advanced filters (from rev13 FilterButtonSearch LS) so they only apply after explicit search click (like dates)
		const currentAdv = getCurrentAdvancedFilters()
		setSearchedAdvancedFilters(currentAdv)
		// Trigger availability re-check when search filters change
		setSearchTrigger((prev) => prev + 1)
	}

	// Set date range filter when dateRange prop changes
	useEffect(() => {
		const parsedRange = parseDateRange(dateRange)
		setFilterDateRange(parsedRange)
		if (!parsedRange) {
			setSearchedDateRange(null)
			setAvailablePropertyIds(new Set())
			setPropertyPriceSums({})
		}
	}, [dateRange])

	useEffect(() => {
		filterDateRangeRef.current = filterDateRange
	}, [filterDateRange])

	// Listen for filter changes from rev13 FilterButtonSearch (via localStorage + custom events)
	useEffect(() => {
		const handleStorageChange = (e: CustomEvent) => {
			const key = e.detail?.key
			if (["propertyFilters", "propertyPlaces", "apartmentSizeRange", "personCapacityRange", "lastMinuteOnly"].includes(key)) {
				setAdvancedFilterTick((t) => t + 1)
			}
		}
		window.addEventListener("localStorageChange", handleStorageChange as EventListener)
		return () => window.removeEventListener("localStorageChange", handleStorageChange as EventListener)
	}, [])

	// Check availability for date range filtering (only when search is clicked)
	useEffect(() => {
		const checkAvailability = async () => {
			const currentFilterDateRange = filterDateRangeRef.current
			if (!currentFilterDateRange?.start || !currentFilterDateRange?.end || properties.length === 0) {
				setAvailablePropertyIds(new Set())
				return
			}

			try {
				const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mountainapartments.pl"
				// Format dates in local timezone instead of UTC
				const startDateStr = currentFilterDateRange.start.toLocaleDateString("sv-SE") // YYYY-MM-DD format
				const endDateStr = currentFilterDateRange.end.toLocaleDateString("sv-SE") // YYYY-MM-DD format
				const propertyIds = properties.map((p) => p.id)

				// Use batch API to check availability for all properties at once
				const response = await fetch(`${baseUrl}/api/properties/availability`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						startDate: startDateStr,
						endDate: endDateStr,
						propertyIds,
					}),
				})

				if (response.ok) {
					const data = await response.json()
					const availableIds = new Set<number>((data.availablePropertyIds as number[]) || [])
					setAvailablePropertyIds(availableIds)
					setSearchedDateRange(currentFilterDateRange)

					// After availability is known, fetch per-property NoBeds cache entries to compute total prices for the range
					try {
						const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mountainapartments.pl"
						const startDateStr = currentFilterDateRange.start.toLocaleDateString("sv-SE")
						const endDateStr = currentFilterDateRange.end.toLocaleDateString("sv-SE")
						const sums: Record<number, number> = {}
						const fetches = propertyIds
							.filter((id) => availableIds.has(id))
							.map(async (propId) => {
								const property = properties.find((p) => p.id === propId)
								if (!property || !property.room_id) return
								try {
									const resp = await fetch(`${baseUrl}/api/nobeds-cache/entries?id=${propId}&startDate=${startDateStr}&endDate=${endDateStr}`)
									if (!resp.ok) return
									const d = await resp.json()
									const entries: { price?: number | string }[] = d.entries || []
									const total = entries.reduce((acc: number, cur) => acc + (Number(cur.price) || 0), 0)
									sums[propId] = total
								} catch (e) {
									console.error("Error fetching nobeds entries for property", propId, e)
								}
							})
						await Promise.all(fetches)
						setPropertyPriceSums(sums)
					} catch (err) {
						console.error("Error computing property price sums:", err)
					}
				} else {
					console.error("Failed to check properties availability")
					// If API call fails, show all properties
					setAvailablePropertyIds(new Set(properties.map((p) => p.id)))
				}
			} catch (error) {
				console.error("Error checking availability:", error)
				// If there's an error, show all properties
				setAvailablePropertyIds(new Set(properties.map((p) => p.id)))
			}
		}

		checkAvailability()
	}, [properties, searchTrigger])

	const filteredProperties = useMemo(() => {
		return properties.filter((property) => {
			let locationMatch = true
			let guestsMatch = true
			let nameMatch = true
			let dateRangeMatch = true

			if (filterLocation) {
				const normalizedFilter = normalizeText(filterLocation)
				const cityKeys = ["zakopane", "koscielisko"]
				if (cityKeys.includes(filterLocation.toLowerCase())) {
					// Filter by city
					const normalizedCity = normalizeText(property.city?.name || "")
					locationMatch = normalizedCity === normalizedFilter
				} else {
					// Filter by place
					const normalizedPlace = normalizeText(property.place?.name || "")
					locationMatch = normalizedPlace === normalizedFilter
				}
			}

			if (filterGuests) {
				const guestsCount = filterGuests === "6+" ? 6 : parseInt(filterGuests, 10)
				if (!Number.isNaN(guestsCount)) {
					guestsMatch = property.minOccupancy <= guestsCount && property.maxOccupancy >= guestsCount
				}
			}

			if (filterSearchName.trim()) {
				nameMatch = property.name.toUpperCase().includes(filterSearchName.trim().toUpperCase())
			}

			// Advanced filters from rev13 FilterButtonSearch (via LS snapshot at last search click)
			// Only applied after explicit search (mirrors date stale behavior)
			let advancedMatch = true
			if (searchedAdvancedFilters) {
				const adv = searchedAdvancedFilters
				if (adv.lastMinuteOnly && !property.lastMinuteOfferActive) {
					advancedMatch = false
				}
				if (advancedMatch && adv.apartmentSizeRange && (adv.apartmentSizeRange.min > 0 || adv.apartmentSizeRange.max < 150)) {
					const sz = (property as unknown as { size?: number }).size || 0
					if (sz < adv.apartmentSizeRange.min || sz > adv.apartmentSizeRange.max) {
						advancedMatch = false
					}
				}
				if (advancedMatch && adv.personCapacityRange && (adv.personCapacityRange.min > 1 || adv.personCapacityRange.max < 8)) {
					const cap = property.maxOccupancy || 0
					if (cap < adv.personCapacityRange.min || cap > adv.personCapacityRange.max) {
						advancedMatch = false
					}
				}
				if (advancedMatch && adv.selectedPlaces && adv.selectedPlaces.length > 0) {
					const pid = property.place?.id
					if (pid == null || !adv.selectedPlaces.includes(pid)) {
						advancedMatch = false
					}
				}
				if (advancedMatch && adv.selectedFilters && adv.selectedFilters.length > 0) {
					const propF = property.filters || []
					if (!adv.selectedFilters.every((f: string) => propF.includes(f))) {
						advancedMatch = false
					}
				}
			}

			// Apply date availability filtering only after an explicit search has produced results for a date range
			if (searchedDateRange?.start && searchedDateRange?.end) {
				dateRangeMatch = availablePropertyIds.size > 0 ? availablePropertyIds.has(property.id) : false
			}

			return locationMatch && guestsMatch && nameMatch && dateRangeMatch && advancedMatch
		})
	}, [properties, filterLocation, filterGuests, filterSearchName, searchedDateRange, availablePropertyIds, searchedAdvancedFilters])

	const isSearchResultStale = Boolean(
		filterDateRange?.start &&
		filterDateRange?.end &&
		(!searchedDateRange?.start ||
			!searchedDateRange?.end ||
			searchedDateRange.start?.toISOString() !== filterDateRange.start?.toISOString() ||
			searchedDateRange.end?.toISOString() !== filterDateRange.end?.toISOString()),
	)

	const isFilterStale = useMemo(() => {
		void advancedFilterTick // force re-computation when advanced filter tick changes (from FilterButtonSearch localStorage updates for size/capacity/lastMinute/etc.)
		const current = getCurrentAdvancedFilters()
		if (!searchedAdvancedFilters || !current) return false
		return JSON.stringify(current) !== JSON.stringify(searchedAdvancedFilters)
	}, [searchedAdvancedFilters, advancedFilterTick])

	// Fetch properties
	useEffect(() => {
		sendGAEvent("event", "apartments_page_opened", {
			event_category: "engagement",
			event_label: "apartments_page_opened",
			page_location: typeof window !== "undefined" ? window.location.href : "",
		})
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
				let fetchedProperties = data.properties || []

				// Apply daily rotation to the properties as they come from the API
				if (fetchedProperties.length > 0) {
					// Separate last-minute offers from regular properties
					const lastMinuteOffers = fetchedProperties.filter((p: Property) => p.lastMinuteOfferActive)
					const regularProperties = fetchedProperties.filter((p: Property) => !p.lastMinuteOfferActive)

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
						fetchedProperties = [...lastMinuteOffers, ...rotatedRegular]
					} else {
						// If all properties are last-minute offers, just keep them as is
						fetchedProperties = lastMinuteOffers
					}
				}

				setProperties(fetchedProperties)

				// Extract unique places
				const uniquePlaces = Array.from(
					new Map((fetchedProperties as Property[]).filter((p) => p.place?.id && p.place).map((p: Property) => [p.place!.id, p.place!])).values(),
				) as { id: number; name: string; location: string }[]
				setPlaces(uniquePlaces)
			} catch (error) {
				console.error("Error fetching properties:", error)
				propertiesInitialized.current = false
			} finally {
				setLoading(false)
			}
		}

		fetchProperties()
	}, [])

	return (
		<div className="h-screen">
			{/* Top half: Background image */}
			<ModernNav dictionary={_dictionary} lang={lang} />
			<div className="relative h-1/3 overflow-hidden ">
				<Image
					src="/images/tlo.jpg"
					alt="Mountain Apartments"
					fill
					className="object-cover"
					quality={70}
					placeholder="blur"
					blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z"
					sizes="100vw"
					priority
				/>
				{/* Dark overlay */}
				<div className="absolute inset-0 bg-black/40" />
			</div>

			{/* Bottom half: Content */}
			<div className="bg-white flex flex-col px-0 sm:px-8 pt-1 min-h-screen">
				<div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
					<h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">{pageText.heading}</h1>
					<p className="mt-3 text-lg md:text-xl text-slate-600 max-w-3xl">{pageText.subtitle}</p>
				</div>
				{/* Search bar */}
				<SearchBar
					dictionary={_dictionary}
					color="#1D2430"
					dateRange={dateRange}
					places={places}
					onFilterChange={handleFilterChange}
					initialLocation={initialLocation}
				/>
				{/* Results summary */}
				<div className="flex justify-center text-center mt-4 mb-4 rounded-2xl border border-slate-200 bg-slate-50 px-2 py-3 text-xl text-slate-700 uppercase">
					<div className="font-semibold text-slate-900">
						{isFilterStale
							? "Wybrano nowe filtry, wyszukaj ponownie"
							: isSearchResultStale
								? "Wykryto zmianę dat, wyszukaj ponownie"
								: (_dictionary?.apartments?.searchResults || "Znaleziono apartamentów: {{total}} ").replace(
										"{{total}}",
										filteredProperties.length.toString(),
									)}
					</div>
				</div>
				{/* Properties Grid */}
				<div className="flex-1 py-8">
					{loading ? (
						<div className="flex justify-center items-center py-24">
							<div className="relative">
								<div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
								<div className="absolute inset-0 flex items-center justify-center">
									<div className="w-8 h-8 bg-blue-500 rounded-full animate-pulse"></div>
								</div>
							</div>
						</div>
					) : filteredProperties.length === 0 ? (
						<div className="text-center py-24">
							<div className="w-24 h-24 mx-auto mb-6 bg-slate-100 rounded-full flex items-center justify-center">
								<svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
								</svg>
							</div>
							<h3 className="text-2xl font-bold text-slate-800 mb-2">{_dictionary.apartments.noApartmentsFound}</h3>
							<p className="text-slate-600">{_dictionary.apartments.tryAdjustingSearch}</p>
						</div>
					) : (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 px-0 sm:px-7 lg:px-9 w-full">
							{filteredProperties.map((property) => (
								<div key={property.id} className="transition-all duration-700 ease-out translate-y-0 opacity-100 scale-100">
									<ModernApartmentTile
										property={property}
										dictionary={_dictionary}
										lang={lang}
										mainPage={false}
										priceForRange={propertyPriceSums[property.id]}
										disableAddToBasket={isSearchResultStale || isFilterStale}
									/>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
			<Footer lang={lang} />
		</div>
	)
}
