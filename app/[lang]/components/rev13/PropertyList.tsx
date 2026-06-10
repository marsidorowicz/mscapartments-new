/** @format */
"use client"
import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "@/state/store"
import { setSelectedPropertiesToRent, setServices, setNotification } from "@/state/action-creators"
import { Property } from "@/types"
import Image from "next/image"
import PersonIcon from "@mui/icons-material/Person"
import NightsStayIcon from "@mui/icons-material/NightsStay"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import ExpandLessIcon from "@mui/icons-material/ExpandLess"
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos"
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos"
import CloseIcon from "@mui/icons-material/Close"
import { IconButton } from "@mui/material"
import { formatCurrency } from "@/utilities/functions/payments/currencyFormat"
import { ExtendedData } from "@/types"

const fallbackSrc = "/images/apartment-default-small.jpg"

interface ITranslation {
	tooSmall: string
	minmaxNotValid: string
	city: string
	country: string
	POLAND: string
	ITALY: string
	showLess: string
	moreFilters: string
	select: string
	deselect: string
	payment30Percent: string
	payment100Percent: string
	minStayLabel: string
	guestsLabel: string
	noPropertiesData: string
	noPropertiesAvailable: string
}

const translations: Record<"en" | "pl" | "it" | "de" | "es", ITranslation> = {
	en: {
		tooSmall: "Property is too small for this number of guests",
		minmaxNotValid: "Stay period is not valid for this property",
		city: "City",
		country: "Country",
		POLAND: "Poland",
		ITALY: "Italy",
		showLess: "Show less",
		moreFilters: "more",
		select: "select",
		deselect: "deselect",
		payment30Percent: "30% upfront",
		payment100Percent: "100% upfront",
		minStayLabel: "Min. stay length",
		guestsLabel: "Guests:",
		noPropertiesData: "No properties data available. Please perform a search first.",
		noPropertiesAvailable: "No properties available for your search. Please try different dates or adjust your filters.",
	},
	pl: {
		tooSmall: "Obiekt jest za mały dla tej liczby gości",
		minmaxNotValid: "Okres pobytu jest nieprawidłowy dla tego obiektu",
		city: "Miasto",
		country: "Kraj",
		POLAND: "Polska",
		ITALY: "Włochy",
		showLess: "Pokaż mniej",
		moreFilters: "więcej",
		select: "wybierz",
		deselect: "odznacz",
		payment30Percent: "30% z góry",
		payment100Percent: "100% z góry",
		minStayLabel: "Min. długość pobytu",
		guestsLabel: "Ilość osób:",
		noPropertiesData: "Brak danych o nieruchomościach. Proszę najpierw wykonać wyszukiwanie.",
		noPropertiesAvailable: "Brak dostępnych nieruchomości dla Twojego wyszukiwania. Spróbuj innych dat lub dostosuj filtry.",
	},
	it: {
		tooSmall: "La proprietà è troppo piccola per questo numero di ospiti",
		minmaxNotValid: "Il periodo di soggiorno non è valido per questa proprietà",
		city: "Città",
		country: "Paese",
		POLAND: "Polonia",
		ITALY: "Italia",
		showLess: "Mostra meno",
		moreFilters: "altro",
		select: "seleziona",
		deselect: "deseleziona",
		payment30Percent: "30% anticipo",
		payment100Percent: "100% anticipo",
		minStayLabel: "Min. durata soggiorno",
		guestsLabel: "Ospiti:",
		noPropertiesData: "Nessun dato sulle proprietà disponibile. Esegui prima una ricerca.",
		noPropertiesAvailable: "Nessuna proprietà disponibile per la tua ricerca. Prova date diverse o regola i filtri.",
	},
	de: {
		tooSmall: "Die Unterkunft ist für diese Gästeanzahl zu klein",
		minmaxNotValid: "Der Aufenthaltszeitraum ist für diese Unterkunft nicht gültig",
		city: "Stadt",
		country: "Land",
		POLAND: "Polen",
		ITALY: "Italien",
		showLess: "Weniger anzeigen",
		moreFilters: "mehr",
		select: "auswählen",
		deselect: "abwählen",
		payment30Percent: "30% Anzahlung",
		payment100Percent: "100% Anzahlung",
		minStayLabel: "Min. Aufenthaltsdauer",
		guestsLabel: "Gäste:",
		noPropertiesData: "Keine Immobilien-Daten verfügbar. Bitte führen Sie zuerst eine Suche durch.",
		noPropertiesAvailable: "Keine Immobilien für Ihre Suche verfügbar. Bitte versuchen Sie andere Daten oder passen Sie Ihre Filter an.",
	},
	es: {
		tooSmall: "La propiedad es demasiado pequeña para este número de huéspedes",
		minmaxNotValid: "El período de estancia no es válido para esta propiedad",
		city: "Ciudad",
		country: "País",
		POLAND: "Polonia",
		ITALY: "Italia",
		showLess: "Mostrar menos",
		moreFilters: "más",
		select: "seleccionar",
		deselect: "deseleccionar",
		payment30Percent: "30% anticipo",
		payment100Percent: "100% anticipo",
		minStayLabel: "Min. duración de la estancia",
		guestsLabel: "Huéspedes:",
		noPropertiesData: "No hay datos de propiedades disponibles. Realice una búsqueda primero.",
		noPropertiesAvailable: "No hay propiedades disponibles para su búsqueda. Intente fechas diferentes o ajuste sus filtros.",
	},
}

export interface ReservationForProperty extends Property {
	selected: boolean
	filters: string[] // Add filters property
	totalPrice: number
	imageUrl: string
	guestsAssigned: number
	localTaxSum: number
	parkingQuantity: number
	location: string
	minStay: number
	maxStay: number
	currency?: string // Optional currency field
	petsQuantity: number
	petFee: number
	petsAllowed: boolean
	petsMax: number
	petsPrice: number
	breakfastQuantity: number
	breakfastFee: number
	breakfastAllowed: boolean
	babyCribQuantity: number
	babyCribFee: number
	babyCribAllowed: boolean
	babyBedLinen: boolean
	babyBedLinenQuantity: number
	// Availability-specific properties
	price: number
	available: boolean
}

// Component for collapsible filters
const CollapsibleFilters = ({
	filters,
	getFilterTranslation,
	t,
	maxVisibleFilters = 3,
}: {
	filters: string[]
	getFilterTranslation: (filter: string) => string
	t: (key: keyof ITranslation) => string
	maxVisibleFilters?: number
}) => {
	const [expanded, setExpanded] = useState(false)

	if (filters.length === 0) return null

	const shouldShowExpandButton = filters.length > maxVisibleFilters
	const visibleFilters = expanded ? filters : filters.slice(0, maxVisibleFilters)
	const hiddenCount = filters.length - maxVisibleFilters

	return (
		<div className="mt-2">
			<div className="flex flex-wrap gap-1 items-center min-h-8">
				{visibleFilters.map((filter, index) => (
					<span key={index} className="bg-[#cc9678] text-white px-2 py-1 rounded text-xs whitespace-nowrap">
						{getFilterTranslation(filter)}
					</span>
				))}
				{shouldShowExpandButton && (
					<button className="min-w-0 p-1 text-xs text-[#cc9678] normal-case hover:text-[#b8856a]" onClick={() => setExpanded(!expanded)}>
						{expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
						{expanded ? t("showLess") : `+${hiddenCount} ${t("moreFilters")}`}
					</button>
				)}
			</div>
		</div>
	)
}

const PropertyList = ({
	properties,
	guests,
	numberOfNights,
	locale = "pl",
	selectedFilters = [],
	matchingFiltersLabel = "Properties Matching Your Filters",
	otherPropertiesLabel = "Other Available Properties",
	filterTranslations = {},
}: {
	properties: ReservationForProperty[] | null
	guests: number
	numberOfNights: number
	locale?: "en" | "pl" | "it" | "de" | "es"
	selectedFilters?: string[]
	matchingFiltersLabel?: string
	otherPropertiesLabel?: string
	filterTranslations?: Record<string, string>
}) => {
	const dispatch = useDispatch()
	const [apartmentSizeRange, setApartmentSizeRange] = useState<{
		min: number
		max: number
	}>({ min: 0, max: 150 })
	const [personCapacityRange, setPersonCapacityRange] = useState<{
		min: number
		max: number
	}>({ min: 1, max: 8 })
	const [propertyNameFilter, setPropertyNameFilter] = useState<string>("")

	// Load range filters from localStorage
	useEffect(() => {
		if (typeof window !== "undefined") {
			const savedSizeRange = localStorage.getItem("apartmentSizeRange")
			const savedCapacityRange = localStorage.getItem("personCapacityRange")
			const savedPropertyNameFilter = localStorage.getItem("propertyNameFilter")

			if (savedSizeRange) {
				try {
					const parsed = JSON.parse(savedSizeRange)
					if (parsed && typeof parsed.min === "number" && typeof parsed.max === "number") {
						setApartmentSizeRange(parsed)
					}
				} catch {
					// Keep default values
				}
			}

			if (savedCapacityRange) {
				try {
					const parsed = JSON.parse(savedCapacityRange)
					if (parsed && typeof parsed.min === "number" && typeof parsed.max === "number") {
						setPersonCapacityRange(parsed)
					}
				} catch {
					// Keep default values
				}
			}

			if (savedPropertyNameFilter) {
				setPropertyNameFilter(savedPropertyNameFilter)
			}
		}
	}, [])

	// Listen for localStorage changes to update filters in real-time
	useEffect(() => {
		const handleStorageChange = (e: CustomEvent) => {
			if (e.detail.key === "propertyNameFilter") {
				setPropertyNameFilter(e.detail.value)
			}
		}

		window.addEventListener("localStorageChange", handleStorageChange as EventListener)
		return () => {
			window.removeEventListener("localStorageChange", handleStorageChange as EventListener)
		}
	}, [])

	const t = (key: keyof ITranslation): string => {
		return translations[locale][key]
	}

	const getFilterTranslation = (filter: string): string => {
		// Convert filter to lowercase and check if translation exists
		const translationKey = `filter-${filter.toLowerCase()}`
		return filterTranslations[translationKey] || filter
	}

	useEffect(() => {
		dispatch(
			setServices({
				reservations: [],
				totalPrice: 0,
				totalPriceOnline: 0,
				remainingGuests: 0,
				parkingTotal: 0,
				petsTotal: 0,
			}),
		)

		return () => {}
	}, [dispatch])
	const propertiesSelected: ReservationForProperty[] = useSelector((state: RootState) => state?.root?.propertiesSelectedToRent)

	const propertiesToDisplay = properties?.map((property) => {
		return {
			...property,
			id: property?.id,
			name: property?.name,
			location: property?.location,
			imageUrl: `${property?.images?.[0]?.path.replace(/\\/g, "/")}`,
			selected: property?.selected,
			filters: property?.filters || [],
			petsQuantity: 0,
			petFee: (property.extended as ExtendedData)?.petFee || 0,
			petsAllowed: (property.extended as ExtendedData)?.petsAllowed || false,
			petsMax: (property.extended as ExtendedData)?.petsMax || 0,
			breakfastQuantity: 0,
			breakfastFee: (property.extended as ExtendedData)?.breakfastFee || 0,
			breakfastAllowed: (property.extended as ExtendedData)?.breakfastAllowed || false,
			babyCribQuantity: 0,
			babyCribFee: (property.extended as ExtendedData)?.babyCribFee || 0,
			babyCribAllowed: (property.extended as ExtendedData)?.babyCribAllowed || false,
			babyBedLinen: false,
		}
	})

	// Group properties by whether they match filters AND meet stay requirements
	const { matchingProperties, otherProperties } = React.useMemo(() => {
		if (!propertiesToDisplay) {
			return {
				matchingProperties: [],
				otherProperties: [],
			}
		}

		return propertiesToDisplay.reduce(
			(result, property) => {
				// Check if property meets minStay/maxStay requirements
				const hasValidMinStay = !property?.minStay || property.minStay <= numberOfNights
				const hasValidMaxStay = !property?.maxStay || property.maxStay >= numberOfNights
				const stayPeriodValid = hasValidMinStay && hasValidMaxStay

				// Check if property can accommodate the guests
				const canAccommodateGuests = guests <= (property.maxOccupancy || 0)

				// Check if property has filters that match selected filters
				const hasAllSelectedFilters = selectedFilters.length === 0 || selectedFilters.every((filter) => property.filters?.includes(filter))

				// Check apartment size range filter
				const propertySize = property.size || 0
				const meetsApartmentSizeFilter = propertySize >= apartmentSizeRange.min && propertySize <= apartmentSizeRange.max

				// Check person capacity range filter
				const propertyMaxOccupancy = property.maxOccupancy || 0
				const meetsPersonCapacityFilter = propertyMaxOccupancy >= personCapacityRange.min && propertyMaxOccupancy <= personCapacityRange.max

				// Check property name filter (case-insensitive partial match)
				const propertyName = property.name || ""
				const meetsPropertyNameFilter = !propertyNameFilter.trim() || propertyName.toLowerCase().includes(propertyNameFilter.toLowerCase().trim())

				// Property is "matching" only if it meets ALL criteria:
				// 1. Stay period is valid
				// 2. Can accommodate guests
				// 3. Matches selected filters (or no filters selected)
				// 4. Meets apartment size range filter
				// 5. Meets person capacity range filter
				// 6. Matches property name filter (or no name filter)
				const meetsAllCriteria =
					stayPeriodValid &&
					canAccommodateGuests &&
					hasAllSelectedFilters &&
					meetsApartmentSizeFilter &&
					meetsPersonCapacityFilter &&
					meetsPropertyNameFilter

				if (meetsAllCriteria) {
					result.matchingProperties.push(property)
				} else {
					result.otherProperties.push(property)
				}

				return result
			},
			{
				matchingProperties: [] as ReservationForProperty[],
				otherProperties: [] as ReservationForProperty[],
			},
		)
	}, [propertiesToDisplay, selectedFilters, numberOfNights, guests, apartmentSizeRange, personCapacityRange, propertyNameFilter])

	if (!properties || properties.length === 0) {
		return <div className="p-4 text-center text-gray-500">{t("noPropertiesData")}</div>
	}

	if (matchingProperties.length === 0 && otherProperties.length === 0) {
		return <div className="p-4 text-center text-gray-500">{t("noPropertiesAvailable")}</div>
	}

	const handleSelectProperty = (property: ReservationForProperty) => {
		const isPropertySelected = propertiesSelected.some((selectedProperty: ReservationForProperty) => selectedProperty.id == property.id)

		// Check if property meets minStay/maxStay requirements
		const hasValidMinStay = !property?.minStay || property.minStay <= numberOfNights
		const hasValidMaxStay = !property?.maxStay || property.maxStay >= numberOfNights
		const stayPeriodValid = hasValidMinStay && hasValidMaxStay

		// Check if property can accommodate the guests
		const canAccommodateGuests = guests <= (property.maxOccupancy || 0)

		if (!stayPeriodValid) {
			// Show notification for minStay/maxStay violation
			dispatch(
				setNotification({
					severity: "error",
					message: t("minmaxNotValid"),
					open: true,
					horizontal: "center",
					vertical: "top",
				}),
			)
			return
		}

		if (!canAccommodateGuests) {
			// Show notification for guest capacity violation
			dispatch(
				setNotification({
					severity: "error",
					message: t("tooSmall"),
					open: true,
					horizontal: "center",
					vertical: "top",
				}),
			)
			return
		}

		if (isPropertySelected) {
			// If the property is already in the array, remove it
			const updatedProperties = propertiesSelected.filter((selectedProperty: ReservationForProperty) => selectedProperty.id !== property.id)
			dispatch(setSelectedPropertiesToRent(updatedProperties))
		} else {
			// If the property is not already in the array, add it
			dispatch(
				setSelectedPropertiesToRent([...propertiesSelected, property].filter((prop, index, arr) => arr.findIndex((p) => p.id === prop.id) === index)),
			)
		}
	}

	const renderProperty = (property: ReservationForProperty) => {
		if (!property?.id) return null
		// const imageAvailable =
		// 	property?.imageUrl !== "undefined" &&
		// 	property?.imageUrl !== "/undefined"
		// const imageUrl = imageAvailable ? property.imageUrl : defaultImg
		const maxOccupancy = property.maxOccupancy || 0
		const isPropertySelected = propertiesSelected.some((selectedProperty: ReservationForProperty) => selectedProperty.id === property.id)

		const stayPeriodNotValid =
			(property?.minStay && property.minStay > numberOfNights) || (property?.maxStay && property.maxStay > 0 && property.maxStay < numberOfNights)
		const guestCapacityNotValid = maxOccupancy > 0 && guests > maxOccupancy
		const isPropertySelectable = !stayPeriodNotValid && !guestCapacityNotValid

		const countryName = property?.city?.country?.name
		const cityName = property?.city?.name

		return (
			<div key={property?.id} className="flex flex-col mb-0 p-0 rounded border border-gray-300 shadow-sm">
				{/* Image section - full width on all screens */}
				<div className="flex-shrink-0 mb-2">
					<ImageCarousel images={property.images} propertyName={property.name} />
				</div>

				{/* Property details - full width on all screens */}
				<div className="flex flex-col gap-1 min-w-0 px-1 pb-1">
					<div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
						<div className="flex items-center gap-1">
							<p className="text-lg font-semibold text-black">{property?.name.toUpperCase() + ", "}</p>
							<p className="text-lg font-semibold text-black">{property?.place?.name.toUpperCase()}</p>
							{/* <span className="text-sm text-gray-600">{property?.size + " m2"}</span> */}
						</div>
					</div>
					<span className="text-sm text-gray-600">{property?.location}</span>

					<div className="flex flex-col sm:flex-row md:flex-col gap-1 sm:gap-2">
						<div className="flex items-center text-[#cc9678]">
							<span className="text-base font-bold">
								{t("guestsLabel")} {property?.minOccupancy} - {maxOccupancy}
							</span>
							<PersonIcon className="ml-1" />
						</div>
						<div className="flex items-center text-[#cc9678]">
							<span className="text-base font-bold">
								{t("minStayLabel")}: {property?.minStay}
							</span>
							<NightsStayIcon className="ml-1" />
						</div>
						<span className="text-sm text-gray-600">
							{countryName && `${t("country")}: ${t(countryName as keyof ITranslation)}`}
							{cityName && countryName && " / "}
							{cityName && `${t("city")}: ${cityName}`}
						</span>
					</div>
					<CollapsibleFilters filters={property.filters || []} getFilterTranslation={getFilterTranslation} t={t} maxVisibleFilters={3} />
					{guests > maxOccupancy && <span className="text-sm text-red-500">{t("tooSmall")}</span>}
					{stayPeriodNotValid && <span className="text-sm text-red-500">{t("minmaxNotValid")}</span>}

					{/* Price and Select Button - positioned at bottom on sm+ screens */}
					<div className="hidden sm:flex flex-row mt-2 pt-2 border-t border-gray-200 gap-2">
						<div className="flex-1 text-center">
							<span className="text-lg text-[#cc9678] font-semibold">
								{formatCurrency(property?.totalPrice || 0, property.currency || "PLN")}
							</span>
						</div>
						<div className="flex-1">
							<button
								disabled={!isPropertySelectable && !isPropertySelected}
								className={`w-full px-4 py-2 text-sm font-bold normal-case rounded ${
									isPropertySelectable || isPropertySelected
										? "bg-[#cc9678] text-white hover:bg-[#b8856a]"
										: "bg-gray-400 text-gray-200 cursor-not-allowed"
								} ${isPropertySelected ? "bg-[#cc9678] text-white hover:bg-[#b8856a]" : ""}`}
								onClick={() => handleSelectProperty(property)}>
								{isPropertySelected ? t("deselect") : isPropertySelectable ? t("select") : t("select")}
							</button>
						</div>
					</div>
				</div>

				{/* Price and Select Button - positioned on the side on small screens */}
				<div className="flex flex-col sm:flex-row sm:hidden items-start justify-between p-1">
					<div className="w-full sm:w-auto mt-1 sm:mt-0 flex flex-col items-end gap-1 sm:ml-4">
						<span className="text-lg text-[#cc9678]">{formatCurrency(property?.totalPrice || 0, property.currency || "PLN")}</span>
						<button
							disabled={!isPropertySelectable && !isPropertySelected}
							className={`w-full sm:w-auto min-w-0 px-4 py-2 text-sm font-bold normal-case rounded ${
								isPropertySelectable || isPropertySelected
									? "bg-[#cc9678] text-white hover:bg-[#b8856a]"
									: "bg-gray-400 text-gray-200 cursor-not-allowed"
							} ${isPropertySelected ? "bg-[#cc9678] text-white hover:bg-[#b8856a]" : ""}`}
							onClick={() => handleSelectProperty(property)}>
							{isPropertySelected ? t("deselect") : isPropertySelectable ? t("select") : t("select")}
						</button>
					</div>
				</div>
			</div>
		)
	}

	if (!propertiesToDisplay) return null

	return (
		<div className="p-1 overflow-auto">
			{matchingProperties.length > 0 && (
				<>
					<h6 className="text-lg font-semibold mb-4 text-gray-600">{matchingFiltersLabel}</h6>
					<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">{matchingProperties.map(renderProperty)}</div>
				</>
			)}
			{otherProperties.length > 0 && (
				<>
					<h6 className="text-lg font-semibold mb-4 text-gray-600">{otherPropertiesLabel}</h6>
					<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">{otherProperties.map(renderProperty)}</div>
				</>
			)}
		</div>
	)
}

// Component for image carousel
const ImageCarousel = ({ images, propertyName }: { images: Array<{ path: string; filename: string }> | undefined; propertyName: string }) => {
	const [currentImageIndex, setCurrentImageIndex] = useState(0)
	const [isFullscreen, setIsFullscreen] = useState(false)

	// Filter out invalid images and prepare image list
	const validImages = images?.filter((img) => img.path && img.path !== "undefined" && img.path !== "/undefined" && img.path !== "") || []

	// Keyboard navigation for fullscreen
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (!isFullscreen) return

			switch (e.key) {
				case "Escape":
					setIsFullscreen(false)
					break
				case "ArrowLeft":
					e.preventDefault()
					setCurrentImageIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1))
					break
				case "ArrowRight":
					e.preventDefault()
					setCurrentImageIndex((prev) => (prev === validImages.length - 1 ? 0 : prev + 1))
					break
			}
		}

		window.addEventListener("keydown", handleKeyDown)
		return () => window.removeEventListener("keydown", handleKeyDown)
	}, [isFullscreen, validImages.length])
	// If no valid images, show default
	if (validImages.length === 0) {
		return (
			<div className="relative w-full sm:w-60 md:w-80 h-36 sm:h-36 md:h-48 overflow-hidden flex items-center justify-center">
				<Image
					src={fallbackSrc}
					alt={propertyName}
					fill={true}
					style={{
						objectFit: "contain",
						borderRadius: "8px",
						backgroundColor: "#f3f4f6",
					}}
					sizes="(max-width: 600px) 100vw, (max-width: 768px) 240px, 320px"
				/>
			</div>
		)
	}

	const handlePrevious = (e: React.MouseEvent) => {
		e.stopPropagation()
		setCurrentImageIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1))
	}

	const handleNext = (e: React.MouseEvent) => {
		e.stopPropagation()
		setCurrentImageIndex((prev) => (prev === validImages.length - 1 ? 0 : prev + 1))
	}
	const handleDotClick = (index: number, e: React.MouseEvent) => {
		e.stopPropagation()
		setCurrentImageIndex(index)
	}

	const handleImageClick = (e: React.MouseEvent) => {
		e.stopPropagation()
		setIsFullscreen(true)
	}

	const handleCloseFullscreen = () => {
		setIsFullscreen(false)
	}

	const currentImage = validImages[currentImageIndex]
	let imageUrl = currentImage && currentImage.path ? currentImage.path.replace(/\\/g, "/") : ""
	// Always provide a valid src (string)
	if (!imageUrl || imageUrl === "undefined" || imageUrl === "/undefined") {
		imageUrl = fallbackSrc
	}

	return (
		<>
			<div className="relative w-full sm:w-60 md:w-80 h-36 sm:h-36 md:h-48">
				<div onClick={handleImageClick} className="cursor-pointer relative w-full h-full">
					<Image
						src={imageUrl}
						alt={`${propertyName} - Image ${currentImageIndex + 1}`}
						fill={true}
						style={{
							objectFit: "contain",
							borderRadius: "8px",
							backgroundColor: "#f3f4f6",
						}}
						sizes="(max-width: 600px) 100vw, (max-width: 768px) 240px, 320px"
						priority={currentImageIndex === 0}
					/>
				</div>
				{/* Navigation arrows - only show if more than 1 image */}
				{validImages.length > 1 && (
					<>
						<IconButton
							onClick={handlePrevious}
							sx={{
								position: "absolute",
								left: 4,
								top: "50%",
								transform: "translateY(-50%)",
								bgcolor: "rgba(0, 0, 0, 0.5)",
								color: "white",
								width: 24,
								height: 24,
								"&:hover": {
									bgcolor: "rgba(0, 0, 0, 0.7)",
								},
							}}>
							<ArrowBackIosIcon sx={{ fontSize: 14 }} />
						</IconButton>

						<IconButton
							onClick={handleNext}
							sx={{
								position: "absolute",
								right: 4,
								top: "50%",
								transform: "translateY(-50%)",
								bgcolor: "rgba(0, 0, 0, 0.5)",
								color: "white",
								width: 24,
								height: 24,
								"&:hover": {
									bgcolor: "rgba(0, 0, 0, 0.7)",
								},
							}}>
							<ArrowForwardIosIcon sx={{ fontSize: 14 }} />
						</IconButton>
					</>
				)}{" "}
				{/* Dot indicators - only show if more than 1 image and 10 or fewer images */}
				{validImages.length > 1 && validImages.length <= 10 && (
					<div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
						{validImages.map((_, index) => (
							<div
								key={index}
								onClick={(e) => handleDotClick(index, e)}
								className={`w-2 h-2 rounded-full cursor-pointer transition-colors ${index === currentImageIndex ? "bg-white" : "bg-white bg-opacity-50"} hover:bg-white`}
							/>
						))}
					</div>
				)}
				{/* Image counter */}
				{validImages.length > 1 && (
					<div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white px-1 py-0.5 rounded text-xs">
						{currentImageIndex + 1}/{validImages.length}
					</div>
				)}
			</div>
			{/* Fullscreen Modal */}
			{isFullscreen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm">
					{/* Close button */}
					<IconButton
						onClick={handleCloseFullscreen}
						sx={{
							position: "absolute",
							top: 20,
							right: 20,
							bgcolor: "rgba(0, 0, 0, 0.5)",
							color: "white",
							zIndex: 10,
							"&:hover": {
								bgcolor: "rgba(0, 0, 0, 0.7)",
							},
						}}>
						<CloseIcon />
					</IconButton>

					{/* Fullscreen image */}
					<div className="relative max-w-full max-h-full flex items-center justify-center">
						<Image
							src={imageUrl}
							alt={`${propertyName} - Image ${currentImageIndex + 1}`}
							style={{
								maxWidth: "100%",
								maxHeight: "100%",
								objectFit: "contain",
								borderRadius: "8px",
							}}
							width={800}
							height={600}
							sizes="90vw"
							priority
						/>
						{/* Fullscreen navigation arrows */}
						{validImages.length > 1 && (
							<>
								<IconButton
									onClick={handlePrevious}
									sx={{
										position: "absolute",
										left: -60,
										top: "50%",
										transform: "translateY(-50%)",
										bgcolor: "rgba(0, 0, 0, 0.5)",
										color: "white",
										width: 48,
										height: 48,
										"&:hover": {
											bgcolor: "rgba(0, 0, 0, 0.7)",
										},
									}}>
									<ArrowBackIosIcon />
								</IconButton>

								<IconButton
									onClick={handleNext}
									sx={{
										position: "absolute",
										right: -60,
										top: "50%",
										transform: "translateY(-50%)",
										bgcolor: "rgba(0, 0, 0, 0.5)",
										color: "white",
										width: 48,
										height: 48,
										"&:hover": {
											bgcolor: "rgba(0, 0, 0, 0.7)",
										},
									}}>
									<ArrowForwardIosIcon />
								</IconButton>
							</>
						)}
					</div>

					{/* Fullscreen image counter */}
					{validImages.length > 1 && (
						<div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-60 text-white px-4 py-2 rounded text-base">
							{currentImageIndex + 1} / {validImages.length}
						</div>
					)}

					{/* Fullscreen dots - only show if 10 or fewer images */}
					{validImages.length > 1 && validImages.length <= 10 && (
						<div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex gap-1">
							{validImages.map((_, index) => (
								<div
									key={index}
									onClick={(e) => handleDotClick(index, e)}
									className={`w-3 h-3 rounded-full cursor-pointer transition-colors ${index === currentImageIndex ? "bg-white" : "bg-white bg-opacity-50"} hover:bg-white`}
								/>
							))}
						</div>
					)}
				</div>
			)}
		</>
	)
}

export default PropertyList
