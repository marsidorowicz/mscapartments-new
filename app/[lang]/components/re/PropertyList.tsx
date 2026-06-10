/** @format */
"use client"
import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "@/state/store"
import { setSelectedPropertiesToRent, setServices, setNotification } from "@/state/action-creators"
import { Box, Paper, Typography, createTheme, ThemeProvider, Button, Modal, Backdrop } from "@mui/material"
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
import { sendGAEvent } from "@next/third-parties/google"

const fallbackSrc = "/images/default-property.jpg"

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
		<Box sx={{ mt: 1 }}>
			<Box
				sx={{
					display: "flex",
					flexWrap: "wrap",
					gap: 0.5,
					alignItems: "center",
					// Ensure consistent height to prevent layout shifts
					minHeight: "32px",
				}}>
				{visibleFilters.map((filter, index) => (
					<Typography
						key={index}
						variant="body2"
						sx={{
							bgcolor: "#cc9678",
							color: "white",
							px: 1,
							py: 0.5,
							borderRadius: 1,
							fontSize: "0.75rem",
							whiteSpace: "nowrap",
						}}>
						{getFilterTranslation(filter)}
					</Typography>
				))}
				{shouldShowExpandButton && (
					<Button
						size="small"
						onClick={() => setExpanded(!expanded)}
						sx={{
							minWidth: "auto",
							p: 0.5,
							fontSize: "0.75rem",
							color: "#cc9678",
							textTransform: "none",
							"&:hover": {
								color: "#b8856a",
							},
						}}
						startIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}>
						{expanded ? t("showLess") : `+${hiddenCount} ${t("moreFilters")}`}
					</Button>
				)}
			</Box>
		</Box>
	)
}

const PropertyList = ({
	properties,
	guests,
	numberOfNights,
	theme = "light",
	locale = "pl",
	selectedFilters = [],
	matchingFiltersLabel = "Properties Matching Your Filters",
	otherPropertiesLabel = "Other Available Properties",
	filterTranslations = {},
}: {
	properties: ReservationForProperty[] | null
	guests: number
	numberOfNights: number
	theme?: "light" | "dark"
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
		dispatch(setSelectedPropertiesToRent([]))

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

	const handleSelectProperty = (property: ReservationForProperty) => {
		const isPropertySelected = propertiesSelected.some((selectedProperty: ReservationForProperty) => selectedProperty.id === property.id)

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
			// Send Google Analytics event for property selection
			sendGAEvent("event", "property_select", {
				event_category: "engagement",
				event_label: property.name || "property",
				property_id: property.id,
				property_name: property.name,
				property_location: property.location,
				guests: guests,
				nights: numberOfNights,
				page_location: typeof window !== "undefined" ? window.location.href : "",
			})

			// If the property is not already in the array, add it
			dispatch(
				setSelectedPropertiesToRent([...propertiesSelected, property].filter((prop, index, arr) => arr.findIndex((p) => p.id === prop.id) === index)),
			)
		}
	}

	// Create MUI theme based on passed theme prop - memoize to prevent unnecessary recreations
	const muiTheme = React.useMemo(
		() =>
			createTheme({
				palette: {
					mode: theme as "light" | "dark",
					primary: {
						main: "#3b82f6",
					},
					background: {
						default: theme === "light" ? "#ffffff" : "#1f2937",
						paper: theme === "light" ? "#ffffff" : "#374151",
					},
					text: {
						primary: theme === "light" ? "#1f2937" : "#f3f4f6",
						secondary: theme === "light" ? "#4b5563" : "#9ca3af",
					},
					divider: theme === "light" ? "#e5e7eb" : "#374151",
				},
			}),
		[theme], // Only recreate when theme changes
	)

	const renderProperty = (property: ReservationForProperty) => {
		if (!property?.id) return null
		// const imageAvailable =
		// 	property?.imageUrl !== "undefined" &&
		// 	property?.imageUrl !== "/undefined"
		// const imageUrl = imageAvailable ? property.imageUrl : defaultImg
		const maxOccupancy = property.maxOccupancy || 0
		const isPropertySelected = propertiesSelected.some((selectedProperty: ReservationForProperty) => selectedProperty.id === property.id)

		const stayPeriodNotValid = property?.minStay > numberOfNights || property?.maxStay < numberOfNights

		const countryName = property?.city?.country?.name
		const cityName = property?.city?.name

		return (
			<Paper
				key={property?.id}
				sx={{
					display: "flex",
					flexDirection: { xs: "column", sm: "row" },
					mb: 1, // Reduced from 2 to 1
					p: 1, // Reduced from 2 to 1
					alignItems: "flex-start",
					justifyContent: "space-between",
					borderRadius: 1,
					border: 1,
					borderColor: "divider",
				}}
				elevation={1}>
				<Box
					sx={{
						display: "flex",
						flexDirection: { xs: "column", sm: "row" },
						m: 1,
						width: "100%",
					}}>
					<Box
						sx={{
							flexShrink: 0, // Prevent image container from shrinking
							mb: { xs: 2, sm: 0 },
							ml: { sm: 3 },
							mr: { sm: 3 },
						}}>
						<ImageCarousel images={property.images} propertyName={property.name} />
					</Box>
					<Box
						sx={{
							flex: 1, // Take remaining space
							display: "flex",
							flexDirection: "column",
							gap: 1,
							minWidth: 0, // Allow flex item to shrink if needed
						}}>
						<Box
							sx={{
								display: "flex",
								flexDirection: { xs: "column", sm: "row" },
								alignItems: { xs: "center", sm: "center" },
								gap: 1,
							}}>
							<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
								<Typography variant="h6" component="p">
									{property?.name}
								</Typography>
								<Typography variant="body2" color="text.secondary">
									{property?.size + " m2"}
								</Typography>
							</Box>
							<Typography variant="body2" color="text.secondary">
								{property?.location}
							</Typography>
						</Box>
						<Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
							<Box
								sx={{
									display: "flex",
									alignItems: "center",
									color: "#cc9678",
								}}>
								<Typography variant="body1" sx={{ fontWeight: "bold" }}>
									{t("guestsLabel")} {property?.minOccupancy} - {maxOccupancy}
								</Typography>
								<PersonIcon sx={{ ml: 1 }} />
							</Box>
							<Box
								sx={{
									display: "flex",
									alignItems: "center",
									color: "#cc9678",
								}}>
								<Typography variant="body1" sx={{ fontWeight: "bold" }}>
									{t("minStayLabel")}: {property?.minStay}
								</Typography>
								<NightsStayIcon sx={{ ml: 1 }} />
							</Box>
						</Box>
						<Typography variant="body2" color="text.secondary">
							{countryName && `${t("country")}: ${t(countryName as keyof ITranslation)}`}
							{cityName && countryName && " / "}
							{cityName && `${t("city")}: ${cityName}`}
						</Typography>{" "}
						<CollapsibleFilters filters={property.filters || []} getFilterTranslation={getFilterTranslation} t={t} maxVisibleFilters={3} />
						{guests > maxOccupancy && (
							<Typography variant="body2" color="error">
								{t("tooSmall")}
							</Typography>
						)}
						{stayPeriodNotValid && (
							<Typography variant="body2" color="error">
								{t("minmaxNotValid")}
							</Typography>
						)}
					</Box>
				</Box>
				<Box
					sx={{
						display: { xs: "none", sm: "flex" },
						gap: 1,
						flexWrap: "wrap",
					}}>
					<Typography variant="body2" sx={{ color: "#666", fontSize: "0.8rem" }}>
						{t("payment30Percent")}
					</Typography>
					<Typography variant="body2" sx={{ color: "#666", fontSize: "0.8rem" }}>
						|
					</Typography>
					<Typography variant="body2" sx={{ color: "#666", fontSize: "0.8rem" }}>
						{t("payment100Percent")}
					</Typography>
				</Box>
				<Box
					sx={{
						width: { xs: "100%", sm: "auto" },
						mt: { xs: 1, sm: 0 },
						display: "flex",
						flexDirection: "column",
						alignItems: "flex-end",
						gap: 1,
					}}>
					<Typography variant="h6" sx={{ color: "#cc9678" }}>
						{formatCurrency(property?.totalPrice || 0, property.currency || "PLN")}
					</Typography>
					<Button
						variant="contained"
						size="small"
						onClick={() => handleSelectProperty(property)}
						sx={{
							width: { xs: "100%", sm: "auto" },
							minWidth: "auto",
							px: 2,
							py: 1,
							fontSize: "0.875rem",
							fontWeight: "bold",
							textTransform: "none",
							borderRadius: 1,
							animation: !isPropertySelected ? "blink 2s infinite" : "none",
							"@keyframes blink": {
								"0%": { opacity: 1 },
								"50%": { opacity: 0.6 },
								"100%": { opacity: 1 },
							},
							...(isPropertySelected
								? {
										backgroundColor: "#cc9678", // brown color for deselect
										color: "white",
										"&:hover": {
											backgroundColor: "#b8856a", // darker brown on hover
										},
									}
								: {
										backgroundColor: "#22c55e", // green color for select
										color: "white",
										"&:hover": {
											backgroundColor: "#16a34a", // darker green on hover
											animation: "none", // Stop blinking on hover
										},
									}),
						}}>
						{isPropertySelected ? t("deselect") : t("select")}
					</Button>
				</Box>
			</Paper>
		)
	}

	if (!propertiesToDisplay) return null

	return (
		<ThemeProvider theme={muiTheme}>
			<div className="p-1 overflow-auto">
				{matchingProperties.length > 0 && (
					<>
						<Typography variant="h6" sx={{ mb: 2 }} color="text.secondary">
							{matchingFiltersLabel}
						</Typography>
						{matchingProperties.map(renderProperty)}
					</>
				)}
				{otherProperties.length > 0 && (
					<>
						<Typography variant="h6" sx={{ mb: 2 }} color="text.secondary">
							{otherPropertiesLabel}
						</Typography>
						{otherProperties.map(renderProperty)}
					</>
				)}
			</div>
		</ThemeProvider>
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
			<Box
				sx={{
					position: "relative",
					width: { xs: "100%", sm: 240 },
					height: { xs: 180, sm: 180 },
					overflow: "hidden",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				}}>
				<Image
					src={fallbackSrc}
					alt={propertyName}
					fill={true}
					style={{
						objectFit: "contain",
						borderRadius: "8px",
						backgroundColor: "#f3f4f6",
					}}
					sizes="(max-width: 600px) 100vw, 240px"
				/>
			</Box>
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
			<Box sx={{ position: "relative", width: { xs: "100%", sm: 240 }, height: { xs: 180, sm: 180 } }}>
				<Box
					onClick={handleImageClick}
					sx={{
						cursor: "pointer",
						position: "relative",
						width: "100%",
						height: "100%",
					}}>
					{" "}
					<Image
						src={imageUrl}
						alt={`${propertyName} - Image ${currentImageIndex + 1}`}
						fill={true}
						style={{
							objectFit: "contain",
							borderRadius: "8px",
							backgroundColor: "#f3f4f6",
						}}
						sizes="(max-width: 600px) 100vw, 240px"
						priority={currentImageIndex === 0}
					/>
				</Box>
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
					<Box
						sx={{
							position: "absolute",
							bottom: 8,
							left: "50%",
							transform: "translateX(-50%)",
							display: "flex",
							gap: 0.5,
						}}>
						{validImages.map((_, index) => (
							<Box
								key={index}
								onClick={(e) => handleDotClick(index, e)}
								sx={{
									width: 8,
									height: 8,
									borderRadius: "50%",
									bgcolor: index === currentImageIndex ? "white" : "rgba(255, 255, 255, 0.5)",
									cursor: "pointer",
									transition: "background-color 0.2s",
									"&:hover": {
										bgcolor: "white",
									},
								}}
							/>
						))}
					</Box>
				)}
				{/* Image counter */}
				{validImages.length > 1 && (
					<Box
						sx={{
							position: "absolute",
							top: 8,
							right: 8,
							bgcolor: "rgba(0, 0, 0, 0.6)",
							color: "white",
							px: 1,
							py: 0.5,
							borderRadius: 1,
							fontSize: "0.75rem",
						}}>
						{currentImageIndex + 1}/{validImages.length}
					</Box>
				)}
			</Box>
			{/* Fullscreen Modal */}{" "}
			<Modal
				open={isFullscreen}
				onClose={handleCloseFullscreen}
				closeAfterTransition
				slots={{ backdrop: Backdrop }}
				slotProps={{
					backdrop: {
						timeout: 500,
						sx: {
							bgcolor: "rgba(0, 0, 0, 0.8)",
							backdropFilter: "blur(8px) contrast(0.8) brightness(0.6)",
							WebkitBackdropFilter: "blur(8px) contrast(0.8) brightness(0.6)",
						},
					},
				}}>
				<Box
					sx={{
						position: "absolute",
						top: "50%",
						left: "50%",
						transform: "translate(-50%, -50%)",
						width: "90vw",
						height: "90vh",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						outline: "none",
					}}>
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
					<Box
						sx={{
							position: "relative",
							maxWidth: "100%",
							maxHeight: "100%",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
						}}>
						{" "}
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
					</Box>

					{/* Fullscreen image counter */}
					{validImages.length > 1 && (
						<Box
							sx={{
								position: "absolute",
								bottom: 20,
								left: "50%",
								transform: "translateX(-50%)",
								bgcolor: "rgba(0, 0, 0, 0.6)",
								color: "white",
								px: 2,
								py: 1,
								borderRadius: 2,
								fontSize: "1rem",
							}}>
							{currentImageIndex + 1} / {validImages.length}
						</Box>
					)}

					{/* Fullscreen dots - only show if 10 or fewer images */}
					{validImages.length > 1 && validImages.length <= 10 && (
						<Box
							sx={{
								position: "absolute",
								bottom: 60,
								left: "50%",
								transform: "translateX(-50%)",
								display: "flex",
								gap: 1,
							}}>
							{validImages.map((_, index) => (
								<Box
									key={index}
									onClick={(e) => handleDotClick(index, e)}
									sx={{
										width: 12,
										height: 12,
										borderRadius: "50%",
										bgcolor: index === currentImageIndex ? "white" : "rgba(255, 255, 255, 0.5)",
										cursor: "pointer",
										transition: "background-color 0.2s",
										"&:hover": {
											bgcolor: "white",
										},
									}}
								/>
							))}
						</Box>
					)}
				</Box>
			</Modal>
		</>
	)
}

export default PropertyList
