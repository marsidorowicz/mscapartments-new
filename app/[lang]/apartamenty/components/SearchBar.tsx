/** @format */

"use client"

import React, { useState, useEffect, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Button, TextField, Popover, MenuList, MenuItem as MuiMenuItem, Box, useMediaQuery, useTheme } from "@mui/material"
import SearchIcon from "@mui/icons-material/Search"
import { KeyboardArrowDown as ArrowDownIcon } from "@mui/icons-material"
import { Dictionary } from "../../../types/dictionary"
import BookingHeader from "../../components/BookingHeader"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { Actions } from "@/state/action-creators"
import { RootState } from "@/state/store"
import FilterButtonSearch from "../../components/rev13/FilterButtonSearch"

type SearchFilters = {
	location: string
	guests: string
	searchName: string
}

type SearchBarProps = {
	dictionary: Dictionary
	color?: string
	dateRange?: string | null
	places?: { id: number; name: string; location: string }[]
	onFilterChange?: (filters: SearchFilters) => void
	initialLocation?: string
}

export default function SearchBar({ dictionary: _dictionary, color = "#1976d2", dateRange, places = [], onFilterChange, initialLocation }: SearchBarProps) {
	const router = useRouter()
	const searchParams = useSearchParams()

	const params = useParams() as { lang?: string }
	const theme = useTheme()
	const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
	// Parse dateRange from URL params
	const parseDateRange = (range: string | null): { start: Date | null; end: Date | null } => {
		if (!range) return { start: null, end: null }

		const [startStr, endStr] = range.split("_")
		if (!startStr || !endStr) return { start: null, end: null }

		const start = new Date(startStr)
		const end = new Date(endStr)

		// Validate dates
		const today = new Date()
		today.setHours(0, 0, 0, 0)

		if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
			return { start: null, end: null }
		}

		return { start, end }
	}

	const filtersFromStore = useSelector((state: RootState) => state.root.filters)
	const effectiveDateRange = useMemo(() => {
		if (dateRange) return dateRange
		if (filtersFromStore?.startDate && filtersFromStore?.endDate) return `${filtersFromStore.startDate}_${filtersFromStore.endDate}`
		return null
	}, [dateRange, filtersFromStore?.startDate, filtersFromStore?.endDate])

	const { start: initialStart, end: initialEnd } = useMemo(() => parseDateRange(effectiveDateRange), [effectiveDateRange])
	const dispatch = useDispatch()

	const [guests, setGuests] = useState("") // Default to no selection (shows DOWOLNA)
	const [bedrooms, setBedrooms] = useState("") // Default to no selection (shows DOWOLNA)
	const [location, setLocation] = useState(initialLocation || "") // Default to no selection (shows DOWOLNA)
	const [searchName, setSearchName] = useState("")

	useEffect(() => {
		// Reset to defaults when there's no dateRange prop (user navigated to apartments page without parameters)
		if (!dateRange) {
			dispatch({
				type: Actions.SET_FILTERS,
				payload: {
					byCreatedAt: false,
				},
			})
			// Reset local state to defaults (empty = shows DOWOLNA)
			setGuests("")
			setBedrooms("")
			setLocation(initialLocation || "")
			setSearchName("")
		} else if (initialStart && initialEnd) {
			const startStr = initialStart.toISOString().split("T")[0]
			const endStr = initialEnd.toISOString().split("T")[0]
			dispatch({
				type: Actions.SET_FILTERS,
				payload: {
					byCreatedAt: false,
					startDate: startStr,
					endDate: endStr,
				},
			})
		}
	}, [dispatch, dateRange, initialStart, initialEnd, initialLocation])

	// Only update URL with stored filters if we have a dateRange prop (user came with dateRange in URL)
	// Don't automatically restore stored filters when navigating to apartments page without parameters
	useEffect(() => {
		const storedRange = filtersFromStore?.startDate && filtersFromStore?.endDate ? `${filtersFromStore.startDate}_${filtersFromStore.endDate}` : null
		const currentRange = searchParams.get("dateRange")

		if (dateRange && storedRange && currentRange !== storedRange) {
			const lang = params.lang || "pl"
			const newSearchParams = new URLSearchParams(Array.from(searchParams.entries()))
			newSearchParams.set("dateRange", storedRange)
			router.replace(`/${lang}/apartamenty?${newSearchParams.toString()}`)
		}
	}, [dateRange, filtersFromStore?.startDate, filtersFromStore?.endDate, searchParams, params.lang, router])

	const locationOptions = useMemo(
		() => [
			{ key: "", label: _dictionary?.apartamenty?.anyLabel || "DOWOLNA" },
			{ key: "zakopane", label: _dictionary.apartamenty.locations.zakopane },
			{ key: "koscielisko", label: _dictionary.apartamenty.locations.koscielisko },
			...places.map((p) => ({ key: p.name, label: p.name })),
		],
		[places, _dictionary.apartamenty.locations, _dictionary?.apartamenty?.anyLabel],
	)

	const maxLocationLabelWordWidth = useMemo(() => {
		if (typeof document === "undefined") return 0
		const canvas = document.createElement("canvas")
		const ctx = canvas.getContext("2d")
		if (!ctx) return 0
		ctx.font = "1rem Arial, sans-serif"
		let maxWidth = 0
		locationOptions.forEach((option) => {
			option.label.split(" ").forEach((word) => {
				const width = Math.ceil(ctx.measureText(word).width)
				if (width > maxWidth) maxWidth = width
			})
		})
		return maxWidth
	}, [locationOptions])

	const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)
	const selectedLocationLabel = location
		? _dictionary.apartamenty.locations[location as keyof typeof _dictionary.apartamenty.locations] || capitalize(location)
		: _dictionary?.apartamenty?.anyLabel || "DOWOLNA"

	const displayLocationLabel = isMobile && selectedLocationLabel.length > 10 ? selectedLocationLabel.substring(0, 10) + "..." : selectedLocationLabel

	// Dropdown states
	const [guestsAnchorEl, setGuestsAnchorEl] = useState<HTMLButtonElement | null>(null)
	const [bedroomsAnchorEl, setBedroomsAnchorEl] = useState<HTMLButtonElement | null>(null)
	const [locationAnchorEl, setLocationAnchorEl] = useState<HTMLButtonElement | null>(null)

	const handleSearch = () => {
		onFilterChange?.({ location, guests, searchName })
	}

	// Custom select handlers
	const handleGuestsButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setGuestsAnchorEl(event.currentTarget)
	}

	const handleBedroomsButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setBedroomsAnchorEl(event.currentTarget)
	}

	const handleLocationButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setLocationAnchorEl(event.currentTarget)
	}

	const handleGuestsSelect = (value: string) => {
		setGuests(value)
		setGuestsAnchorEl(null)
	}

	const handleBedroomsSelect = (value: string) => {
		setBedrooms(value)
		setBedroomsAnchorEl(null)
	}

	const handleLocationSelect = (value: string) => {
		setLocation(value)
		setLocationAnchorEl(null)
	}

	const handleCloseDropdowns = () => {
		setGuestsAnchorEl(null)
		setBedroomsAnchorEl(null)
		setLocationAnchorEl(null)
	}

	return (
		<div className=" flex w-full items-center justify-center bg-gray-100 border-b px-4 p-2">
			<div className="w-full max-w-6xl">
				{/* Responsive layout with paired elements on smaller screens */}
				<div className="flex flex-col gap-2 xl:flex-row xl:gap-2">
					{/* Row 1: Date Range Picker and Guests */}
					<div className="flex flex-col md:flex-row gap-2 flex-1">
						<div className="flex-1 min-w-0">
							<BookingHeader color={color} initialDateRange={dateRange} showPriceFrom={false} showBookButton={false} />
						</div>
						<div className="flex-1 min-w-0">
							<Button
								variant="outlined"
								onClick={handleGuestsButtonClick}
								sx={{
									width: "100%",
									display: "flex",
									flexDirection: "column",
									alignItems: "center",
									textTransform: "none",
									padding: "12px 16px",
									minHeight: { xs: "90.8px" },
									border: "2px solid",
									borderColor: color,
									"&:hover": {
										borderColor: color,
									},
								}}>
								<Box
									sx={{
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										width: "100%",
										fontSize: "1rem",
										color: "text.secondary",
										mb: 0.5,
									}}>
									{_dictionary.apartamenty.guestsLabel}
									<ArrowDownIcon sx={{ fontSize: "1rem", ml: 0.5 }} />
								</Box>
								<Box sx={{ fontSize: "1.1rem", fontWeight: "bold", color: color }}>
									{guests || _dictionary?.apartamenty?.anyLabel || "DOWOLNE"}
								</Box>
							</Button>

							<Popover
								open={Boolean(guestsAnchorEl)}
								anchorEl={guestsAnchorEl}
								onClose={handleCloseDropdowns}
								anchorOrigin={{
									vertical: "bottom",
									horizontal: "left",
								}}
								transformOrigin={{
									vertical: "top",
									horizontal: "left",
								}}
								slotProps={{ paper: { sx: { width: guestsAnchorEl?.clientWidth } } }}>
								<MenuList>
									<MuiMenuItem
										key="any"
										onClick={() => handleGuestsSelect("")}
										selected={guests === ""}
										sx={{ color: guests === "" ? color : "inherit" }}>
										{_dictionary?.apartamenty?.anyLabel || "DOWOLNA"}
									</MuiMenuItem>
									{[1, 2, 3, 4, 5, "6+"].map((value) => (
										<MuiMenuItem
											key={value}
											onClick={() => handleGuestsSelect(value.toString())}
											selected={guests === value.toString()}
											sx={{ color: guests === value.toString() ? color : "inherit" }}>
											{" "}
											{value}{" "}
										</MuiMenuItem>
									))}{" "}
								</MenuList>
							</Popover>
						</div>
					</div>

					{/* Row 2: Bedrooms and Location */}
					<div className="flex gap-2 xl:flex-1">
						<div className="hidden min-w-0">
							<Button
								variant="outlined"
								onClick={handleBedroomsButtonClick}
								sx={{
									width: "100%",
									display: "flex",
									flexDirection: "column",
									alignItems: "center",
									textTransform: "none",
									padding: "12px 16px",
									minHeight: { xs: "90.8px" },
									border: "2px solid",
									borderColor: color,
									"&:hover": {
										borderColor: color,
									},
								}}>
								<Box
									sx={{
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										width: "100%",
										fontSize: "1rem",
										color: "text.secondary",
										mb: 0.5,
									}}>
									{_dictionary.apartamenty.bedroomsLabel}
									<ArrowDownIcon sx={{ fontSize: "1rem", ml: 0.5 }} />
								</Box>
								<Box sx={{ fontSize: "1.1rem", fontWeight: "bold", color: color }}>
									{bedrooms || _dictionary?.apartamenty?.anyLabel || "DOWOLNE"}
								</Box>
							</Button>

							<Popover
								open={Boolean(bedroomsAnchorEl)}
								anchorEl={bedroomsAnchorEl}
								onClose={handleCloseDropdowns}
								anchorOrigin={{
									vertical: "bottom",
									horizontal: "left",
								}}
								transformOrigin={{
									vertical: "top",
									horizontal: "left",
								}}
								slotProps={{ paper: { sx: { width: bedroomsAnchorEl?.clientWidth } } }}>
								<MenuList>
									<MuiMenuItem
										key="any"
										onClick={() => handleBedroomsSelect("")}
										selected={bedrooms === ""}
										sx={{ color: bedrooms === "" ? color : "inherit" }}>
										{_dictionary?.apartamenty?.anyLabel || "DOWOLNA"}
									</MuiMenuItem>
									{[1, 2, 3, "4+"].map((value) => (
										<MuiMenuItem
											key={value}
											onClick={() => handleBedroomsSelect(value.toString())}
											selected={bedrooms === value.toString()}
											sx={{ color: bedrooms === value.toString() ? color : "inherit" }}>
											{value}
										</MuiMenuItem>
									))}
								</MenuList>
							</Popover>
						</div>
						<div className="flex-1 min-w-0">
							<Button
								variant="outlined"
								onClick={handleLocationButtonClick}
								sx={{
									width: "100%",
									display: "flex",
									flexDirection: "column",
									alignItems: "center",
									textTransform: "none",
									padding: "12px 16px",
									minHeight: { xs: "90.8px" },
									border: "2px solid",
									borderColor: color,
									"&:hover": {
										borderColor: color,
									},
								}}>
								<Box
									sx={{
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										width: "100%",
										fontSize: "1rem",
										color: "text.secondary",
										mb: 0.5,
									}}>
									{_dictionary.apartamenty.locationLabel}
									<ArrowDownIcon sx={{ fontSize: "1rem", ml: 0.5 }} />
								</Box>
								<Box
									sx={{
										fontSize: "1.1rem",
										fontWeight: "bold",
										color: color,
										wordBreak: "break-word",
										textAlign: "center",
									}}>
									{displayLocationLabel}
								</Box>
							</Button>

							<Popover
								open={Boolean(locationAnchorEl)}
								{...(isMobile
									? {
											anchorReference: "anchorPosition",
											anchorPosition: { top: locationAnchorEl?.getBoundingClientRect().bottom || 0, left: 0 },
										}
									: {
											anchorEl: locationAnchorEl,
										})}
								onClose={handleCloseDropdowns}
								anchorOrigin={{
									vertical: "bottom",
									horizontal: "left",
								}}
								transformOrigin={{
									vertical: "top",
									horizontal: "left",
								}}
								slotProps={{
									paper: {
										sx: { minWidth: isMobile ? "100vw" : Math.max(locationAnchorEl?.clientWidth ?? 0, maxLocationLabelWordWidth + 48) },
									},
								}}>
								<MenuList>
									{" "}
									{locationOptions.map((option) => (
										<MuiMenuItem
											key={option.key}
											onClick={() => handleLocationSelect(option.key)}
											sx={{ fontSize: { xs: "1rem", sm: "1rem" }, whiteSpace: "normal" }}>
											{" "}
											{option.label}{" "}
										</MuiMenuItem>
									))}{" "}
								</MenuList>
							</Popover>
						</div>
					</div>

					{/* Row 3: Search by name (full width) */}
					<div className="w-full xl:flex-1 h-full">
						<TextField
							label={_dictionary.apartamenty.searchByNameLabel}
							value={searchName}
							onChange={(e) => setSearchName(e.target.value)}
							placeholder={_dictionary.apartamenty.searchByNamePlaceholder}
							sx={{
								width: "100%",
								"& .MuiOutlinedInput-root": {
									border: "2px solid",
									borderColor: color,
									color: color,
									borderRadius: 1,
									padding: "12px 16px",
									height: "90px",
									boxSizing: "border-box",
									display: "flex",
									flexDirection: "column",
									alignItems: "center",
									"&:hover": {
										borderColor: color,
									},
									"&.Mui-focused": {
										borderColor: color,
									},
								},
								"& .MuiInputLabel-root": {
									fontSize: "1.2rem",
									color: color,
									textAlign: "center",
									display: "flex",
									justifyContent: "center",
									transform: "translate(16px, 31px) scale(1)",
									"&.Mui-focused, &.MuiFormLabel-filled": {
										transform: "translate(16px, -9px) scale(0.75)",
									},
								},
								"& .MuiOutlinedInput-input, & .MuiInputBase-input": {
									padding: 0,
									fontSize: "1.2rem",
									fontWeight: "bold",
									color: color,
									height: "100%",
									width: "100%",
									textAlign: "center",
									display: "flex",
									alignItems: "center",
									"&::placeholder": {
										fontSize: "1.2rem",
										opacity: 0.7,
									},
								},
							}}
						/>
					</div>

					{/* Row 4: Search button (full width) */}
					<div className="sm:flex sm:flex-row sx flex felx-col space-x-2 justify-center">
						<div className="w-full xl:w-32 xl:flex-shrink-0">
							<Button
								variant="contained"
								onClick={handleSearch}
								sx={{
									width: "100%",
									height: "90px",
									display: "flex",
									flexDirection: "column",
									alignItems: "center",
									textTransform: "none",
									padding: "12px 16px",
									backgroundColor: color,
									"&:hover": {
										backgroundColor: color,
									},
								}}>
								<Box
									sx={{
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										width: "100%",
										fontSize: "0.8rem",
										color: "white",
										mb: 0.5,
									}}>
									<SearchIcon sx={{ fontSize: { xs: "2rem", lg: "2rem" }, mr: { xs: 0.5, lg: 0 } }} />
									<Box sx={{ fontSize: { xs: "1rem", sm: "1.5rem", md: "2rem", lg: "3rem" }, display: { xs: "block", lg: "none" } }}>
										{_dictionary.apartamenty.checkAvailability}
									</Box>
								</Box>
							</Button>
						</div>
						<div className="w-full xl:w-auto flex items-center">
							<FilterButtonSearch dictionary={_dictionary.filters} className="w-full xl:w-auto" color={color} />
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
