/** @format */

import Image from "next/image"
import React, { useState, useMemo, useEffect, useRef } from "react"
import { Property } from "@/types"
import { Dictionary } from "../../../types/dictionary"
import { Locale } from "../../../i18n-config"
import { buildPropertyUrl } from "@/utilities/functions/propertyUrl"
import Link from "next/link"
import PeopleIcon from "@mui/icons-material/People"
import BedIcon from "@mui/icons-material/Bed"
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import ShoppingBasketIcon from "@mui/icons-material/ShoppingBasket"
import { useRouter, useSearchParams } from "next/navigation"
import { useLocalStorageNew } from "@/utilities/hooks/useLocalStorage"

type BasketItem = {
	id: string | number
	name: string
	location?: string
	totalPrice: number
	currency?: string
	dateRange?: string | null
}

type ModernApartmentTileProps = {
	property: Property
	dictionary: Dictionary
	lang: Locale
	mainPage?: boolean
	priceForRange?: number
	disableAddToBasket?: boolean
}

export default function ModernApartmentTile({ property, dictionary, lang, mainPage, priceForRange, disableAddToBasket = false }: ModernApartmentTileProps) {
	const router = useRouter()
	const searchParams = useSearchParams()
	const dateRangeParam = searchParams.get("dateRange")
	const [currentImageIndex, setCurrentImageIndex] = useState(0)
	const [isHovered, setIsHovered] = useState(false)
	const [isHoverEnabled, setIsHoverEnabled] = useState(false)
	const [basketItems, setBasketItems] = useLocalStorageNew<BasketItem[]>("rootBasket", [])
	const isInBasket = basketItems.some((item) => item.id?.toString() === property.id?.toString())
	const isMainPage = mainPage ?? false

	useEffect(() => {
		if (typeof window === "undefined") return

		const mediaQuery = window.matchMedia("(hover: hover)")
		const updateHoverEnabled = () => setIsHoverEnabled(mediaQuery.matches)

		updateHoverEnabled()
		mediaQuery.addEventListener("change", updateHoverEnabled)

		return () => mediaQuery.removeEventListener("change", updateHoverEnabled)
	}, [])

	const propertyUrl = useMemo(() => buildPropertyUrl(property.id, property.name, lang, property.slugs), [property.id, property.name, lang, property.slugs])
	const propertyUrlWithDateRange = useMemo(
		() => (dateRangeParam ? `${propertyUrl}&dateRange=${encodeURIComponent(dateRangeParam)}` : propertyUrl),
		[dateRangeParam, propertyUrl],
	)

	// Get valid images with proper validation
	const validImages =
		property.images?.filter(
			(img) => img.path && img.path !== "undefined" && img.path !== "/undefined" && img.path !== "" && !img.path.includes("undefined"),
		) || []

	const [imageErrors, setImageErrors] = useState<Set<number>>(new Set())

	const [touchStart, setTouchStart] = useState<number | null>(null)
	const [isSwiping, setIsSwiping] = useState(false)
	const [isDragging, setIsDragging] = useState(false)
	const [dragStartX, setDragStartX] = useState<number | null>(null)
	const [justDragged, setJustDragged] = useState(false)
	const [dragOffset, setDragOffset] = useState(0)
	const containerRef = useRef<HTMLAnchorElement>(null)

	const [isDateDialogOpen, setIsDateDialogOpen] = useState(false)
	const dialogRef = useRef<HTMLDivElement | null>(null)

	const imageContainerClassName = `relative overflow-hidden flex-shrink-0 w-full h-[280px] ${isMainPage ? "md:h-[364px]" : ""}`

	useEffect(() => {
		if (!isDragging) return

		const handleMouseMoveGlobal = () => {
			// no visual drag for tile
		}

		const handleMouseUpGlobal = (e: MouseEvent) => {
			if (dragStartX === null) return
			const deltaX = Math.abs(dragStartX - e.clientX)
			if (deltaX > 50) {
				setCurrentImageIndex((prev) =>
					dragStartX > e.clientX ? (prev === validImages.length - 1 ? 0 : prev + 1) : prev === 0 ? validImages.length - 1 : prev - 1,
				)
				setJustDragged(true)
			} else {
				setJustDragged(false)
			}
			setDragStartX(null)
			setIsDragging(false)
		}

		document.addEventListener("mousemove", handleMouseMoveGlobal)
		document.addEventListener("mouseup", handleMouseUpGlobal)

		return () => {
			document.removeEventListener("mousemove", handleMouseMoveGlobal)
			document.removeEventListener("mouseup", handleMouseUpGlobal)
		}
	}, [isDragging, dragStartX, validImages.length])

	const getImageSrc = (index: number): string => {
		if (imageErrors.has(index)) {
			return "/images/apartment-default-small.jpg"
		}

		if (!validImages || validImages.length === 0) {
			return "/images/apartment-default-small.jpg"
		}
		const image = validImages[index]
		let imagePath: string

		if (typeof image === "string") {
			imagePath = image
		} else {
			imagePath = image.path
		}

		// Normalize the path for Next.js Image component
		const normalizedPath = imagePath.replace(/\\/g, "/").replace(/^(?!\/)/, "/")

		return normalizedPath
	}

	const handleImageError = (index: number) => {
		setImageErrors((prev) => new Set([...prev, index]))
	}

	const handlePreviousImage = (e: React.MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()
		if (!validImages) return
		setCurrentImageIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1))
	}

	const handleNextImage = (e: React.MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()
		if (!validImages) return
		setCurrentImageIndex((prev) => (prev === validImages.length - 1 ? 0 : prev + 1))
	}

	const handleTouchStart = (e: React.TouchEvent) => {
		setTouchStart(e.touches[0].clientX)
		setIsDragging(true)
		setDragOffset(0)
	}

	const handleTouchMove = (e: React.TouchEvent) => {
		if (touchStart === null) return
		const deltaX = touchStart - e.touches[0].clientX
		setDragOffset(deltaX)
	}

	const handleTouchEnd = (e: React.TouchEvent) => {
		if (touchStart === null) return
		const deltaX = touchStart - e.changedTouches[0].clientX
		if (Math.abs(deltaX) > 50) {
			setCurrentImageIndex((prev) => (deltaX > 0 ? (prev === validImages.length - 1 ? 0 : prev + 1) : prev === 0 ? validImages.length - 1 : prev - 1))
			setJustDragged(true)
		} else {
			setJustDragged(false)
		}
		setDragOffset(0)
		setTouchStart(null)
		setIsDragging(false)
	}

	const handleMouseDown = (e: React.MouseEvent) => {
		e.preventDefault()
		setDragStartX(e.clientX)
		setIsDragging(true)
	}

	// Calculate pricing
	const minPrice = (property as Property & { extended?: { minPrice?: number } }).extended?.minPrice ?? 0
	const basePrice =
		property.lastMinuteOfferActive && minPrice > 0 && property.lastMinuteDiscountPercentage && property.lastMinuteDiscountPercentage > 0
			? minPrice / (1 - property.lastMinuteDiscountPercentage / 100)
			: minPrice
	const finalPrice = Math.max(minPrice, basePrice * (1 - (property.lastMinuteDiscountPercentage || 0) / 100))
	const hasPrice = minPrice > 0

	const handleAddToBasket = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation()
		e.preventDefault()
		if (isInBasket) {
			if (typeof window !== "undefined") {
				window.dispatchEvent(new Event("open-basket"))
			}
			return
		}
		if (!dateRangeParam) {
			setIsDateDialogOpen(true)
			return
		}

		const item: BasketItem = {
			id: property.id,
			name: property.name,
			location: property.location,
			totalPrice: priceForRange && priceForRange > 0 ? priceForRange : finalPrice,
			dateRange: dateRangeParam,
			currency: "PLN",
		}

		setBasketItems((prev) => {
			if (prev.some((existing) => existing.id === item.id)) {
				return prev
			}
			return [...prev, item]
		})
	}

	// Format price
	const formatPrice = (price: number) => {
		return new Intl.NumberFormat("pl-PL", {
			style: "currency",
			currency: "PLN",
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(price)
	}

	const hasImages = validImages && validImages.length > 0

	// Price section JSX prepared to avoid nested ternaries in JSX
	let priceSectionContent: React.ReactNode = null
	if (!hasPrice) {
		priceSectionContent = <span className={`text-sm ${isHovered ? "text-white" : "text-gray-600"}`}>/ {dictionary.apartments.priceOnRequest}</span>
	} else if (priceForRange && priceForRange > 0) {
		priceSectionContent = (
			<div className="flex items-center gap-2">
				<span className={`text-xs ${isHovered ? "text-white" : "text-gray-600"}`}>{dictionary.apartments.totalPrice}</span>
				<span className={`text-xl font-bold ${isHovered ? "text-green-400" : "text-green-600"}`}>{formatPrice(priceForRange)}</span>
				<span className={`text-sm ${isHovered ? "text-white" : "text-gray-600"}`}> {dictionary.apartments.basketItemPerStay}</span>
				<span className={`text-sm ${isHovered ? "text-white" : "text-gray-500"}`}>+ {dictionary.apartments.additionalFees}</span>
			</div>
		)
	} else if (property.lastMinuteOfferActive) {
		priceSectionContent = (
			<div className="flex items-center gap-2">
				<span className={`text-xs ${isHovered ? "text-white" : "text-gray-600"}`}>{dictionary.apartments.from}</span>
				<span className={`text-xl font-bold ${isHovered ? "text-green-400" : "text-green-600"}`}>{formatPrice(finalPrice)}</span>
				<span className={`text-sm ${isHovered ? "text-white line-through" : "text-gray-500 line-through"}`}>{formatPrice(basePrice)}</span>
				<span className={`text-sm ${isHovered ? "text-white" : "text-gray-600"}`}>/ {dictionary.apartments.night}</span>
				<span className={`text-sm ${isHovered ? "text-white" : "text-gray-500"}`}>+ {dictionary.apartments.additionalFees}</span>
			</div>
		)
	} else {
		priceSectionContent = (
			<div className="flex items-center gap-2">
				<span className={`text-xs ${isHovered ? "text-white" : "text-gray-600"}`}>{dictionary.apartments.from}</span>
				<span className={`text-xl font-bold ${isHovered ? "text-green-400" : "text-green-600"}`}>{formatPrice(finalPrice)}</span>
				<span className={`text-sm ${isHovered ? "text-white" : "text-gray-600"}`}>/ {dictionary.apartments.night}</span>
				<span className={`text-sm ${isHovered ? "text-white" : "text-gray-500"}`}>+ {dictionary.apartments.additionalFees}</span>
			</div>
		)
	}

	return (
		<div
			className={`bg-white rounded-lg shadow-md transition-shadow duration-300 overflow-hidden flex flex-col w-full h-auto min-h-0 scale-90 sm:scale-95 md:scale-100 cursor-pointer ${isHoverEnabled ? "hover:shadow-lg" : ""}`}>
			{/* Image - Responsive height */}
			<div className={imageContainerClassName}>
				<Link
					href={propertyUrlWithDateRange}
					className="block w-full h-full"
					ref={containerRef}
					onTouchStart={handleTouchStart}
					onTouchMove={handleTouchMove}
					onTouchEnd={handleTouchEnd}
					onMouseDown={handleMouseDown}
					onClick={(e) => {
						if (isSwiping || isDragging || justDragged) e.preventDefault()
						setIsSwiping(false)
						setIsDragging(false)
						setJustDragged(false)
					}}>
					<div className="relative w-full h-full overflow-hidden">
						<div
							className={`flex w-full h-full transition-transform duration-300 ease-out ${isDragging ? "" : ""}`}
							style={{ transform: `translateX(calc(-${currentImageIndex * 100}% + ${dragOffset}px))` }}>
							{validImages.map((_, index) => (
								<div key={index} className="flex-shrink-0 w-full h-full relative">
									<Image
										src={getImageSrc(index)}
										alt={`${property.name} image ${index + 1}`}
										fill
										className="object-cover"
										sizes="(max-width: 640px) 100vw, (max-width: 768px) 90vw, (max-width: 1024px) 70vw, 480px"
										onError={() => handleImageError(index)}
										quality={50}
										placeholder="blur"
										blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z"
									/>
								</div>
							))}
						</div>
					</div>
				</Link>

				{/* Image Navigation */}
				{hasImages && validImages.length > 1 && (
					<>
						<button
							onClick={handlePreviousImage}
							className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-all z-20"
							aria-label="Previous image">
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
							</svg>
						</button>
						<button
							onClick={handleNextImage}
							className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-all z-20"
							aria-label="Next image">
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
							</svg>
						</button>
						{/* Image Dots */}
						<div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1 z-20">
							{validImages.map((_, index) => (
								<button
									key={index}
									onClick={(e) => {
										e.preventDefault()
										e.stopPropagation()
										setCurrentImageIndex(index)
									}}
									className={`w-2 h-2 rounded-full transition-all ${currentImageIndex === index ? "bg-white" : "bg-white/50"}`}
									aria-label={`View image ${index + 1}`}
								/>
							))}
						</div>
					</>
				)}

				{/* Last Minute Badge - Top Left */}
				{!isMainPage && property.lastMinuteOfferActive && (
					<div className="absolute top-3 left-3 z-20 bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">LAST MINUTE</div>
				)}

				{/* Property Type Badge - Top Right */}
				{!isMainPage && (
					<div className="absolute top-3 right-3 z-10 bg-[#1D2430] text-white px-3 py-1 rounded-lg text-sm font-semibold">
						{dictionary.apartments.propertyTypes[property.type.toUpperCase() as keyof typeof dictionary.apartments.propertyTypes] || property.type}
					</div>
				)}
			</div>

			{/* Content - Responsive height */}
			<div
				className={`pt-3 pb-3 px-4 sm:px-6 flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 min-h-[200px] ${isHoverEnabled ? (isMainPage ? "hover:bg-white" : "hover:bg-gray-800") : ""}`}
				onMouseEnter={() => isHoverEnabled && setIsHovered(true)}
				onMouseLeave={() => isHoverEnabled && setIsHovered(false)}
				onClick={() => router.push(propertyUrlWithDateRange)}>
				{/* Title and Property Info */}
				<div
					className={`flex flex-col ${isMainPage ? "items-center justify-center text-center" : "justify-start"} gap-1 mb-2 mt-2 relative min-h-[102px]`}>
					<h3
						className={`text-xl font-bold ${isHovered && !isMainPage ? "text-white" : "text-gray-800"} ${isMainPage ? "text-center md:text-2xl" : "text-left"} leading-tight`}>
						{isMainPage ? property?.name?.toUpperCase() : `${property?.place?.name?.toUpperCase()}, ${property?.name}`}
					</h3>
					{!isMainPage && <p className={`text-md font-medium ${isHovered ? "text-white" : "text-gray-600"} text-left`}>{property.location}</p>}
				</div>

				{/* Amenities */}
				{/* {property.filters && property.filters.length > 0 && (
					<div className="mb-2">
						<div
							className={`${
								showAllAmenities
									? "max-h-20 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100"
									: "overflow-hidden"
							}`}>
							<div className={`flex gap-1 ${showAllAmenities ? "flex-wrap" : ""}`}>
								{property.filters.map((filter) => (
									<span
										key={filter}
										className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs leading-tight whitespace-nowrap"
										title={dictionary.filters.filters[filter] || filter.replace(/_/g, " ").toLowerCase()}>
										{dictionary.filters.filters[filter] || filter.replace(/_/g, " ").toLowerCase()}
									</span>
								))}
							</div>
						</div>
						{property.filters.length > 0 && (
							<button
								onClick={(e) => {
									e.preventDefault()
									e.stopPropagation()
									setShowAllAmenities(!showAllAmenities)
								}}
								className="mt-1 px-1.5 py-0.5 bg-[#e4d9c7] hover:bg-[#d4a88a] text-[#a3745c] rounded text-xs cursor-pointer transition-colors">
								{showAllAmenities ? dictionary.apartments.showLess : dictionary.apartments.moreAmenities}
							</button>
						)}
					</div>
				)} */}

				{/* Divider */}
				<div className="border-t border-gray-900 my-3"></div>

				{/* Pricing and Additional Info */}
				<div className="flex flex-col gap-2 pt-1 border-t border-gray-100 ">
					{/* Occupancy, Beds, Size and Basket */}
					<div className={`flex ${isMainPage ? "justify-center" : "justify-between"} gap-3 items-start`}>
						<div className="flex flex-wrap gap-3 items-start">
							{/* Occupancy Badge */}
							<div
								className={`${isHovered && !isMainPage ? "bg-gray-800 text-white" : "bg-white/90 text-gray-800"} flex items-center gap-2 relative group `}>
								<PeopleIcon className={`w-4 h-4 ${isHovered && !isMainPage ? "text-white" : "text-gray-600"}`} />
								<span className="font-semibold text-md">{property.maxOccupancy}</span>
								{/* Tooltip */}
								<div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
									{property.minOccupancy}-{property.maxOccupancy} {dictionary.apartments.guests}
								</div>
							</div>

							{/* Beds Badge */}
							<div
								className={`${isHovered && !isMainPage ? "bg-gray-800 text-white" : "bg-white/90 text-gray-800"} flex items-center gap-1 relative group`}>
								<BedIcon className={`w-4 h-4 ${isHovered && !isMainPage ? "text-white" : "text-gray-600"}`} />
								<span className="font-semibold text-md">{property.numSingleBeds + property.numDoubleBeds}</span>
								{/* Tooltip */}
								{(property.numSingleBeds > 0 || property.numDoubleBeds > 0) && (
									<div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
										{property.numSingleBeds > 0 && property.numDoubleBeds > 0 ? (
											<>
												{property.numSingleBeds} {dictionary.apartments.singleBeds}, {property.numDoubleBeds}{" "}
												{dictionary.apartments.doubleBeds}
											</>
										) : property.numSingleBeds > 0 ? (
											<>
												{property.numSingleBeds} {dictionary.apartments.singleBeds}
											</>
										) : (
											<>
												{property.numDoubleBeds} {dictionary.apartments.doubleBeds}
											</>
										)}
									</div>
								)}
							</div>

							{/* Size Badge */}
							{property.size && (
								<div
									className={`${isHovered && !isMainPage ? "bg-gray-800 text-white" : "bg-white/90 text-gray-800"} rounded-lg text-md font-semibold flex items-center gap-1`}>
									<svg
										className={`w-4 h-4 ${isHovered && !isMainPage ? "text-white" : "text-gray-600"}`}
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
										/>
									</svg>
									<div> {property.size}m²</div>
								</div>
							)}
						</div>
						{!isMainPage && (isInBasket || !disableAddToBasket) && (
							<button
								onClick={handleAddToBasket}
								className={`self-start inline-flex items-center gap-2 rounded-full border border-transparent bg-white text-gray-700 transition-colors duration-200 px-3 py-2 shadow-sm ${isHoverEnabled ? "hover:bg-gray-100" : ""}`}>
								{isInBasket ? (
									<>
										<CheckCircleIcon className="h-4 w-4 text-green-600" />
										<ShoppingBasketIcon className="h-4 w-4 text-gray-700" />
									</>
								) : (
									<AddShoppingCartIcon className="h-4 w-4" />
								)}
							</button>
						)}
					</div>

					{/* Price Section */}
					{!isMainPage && <div>{priceSectionContent}</div>}
					{/* Zobacz szczegóły Button - isolated container with margin */}
					<div className="flex-1 relative overflow-hidden" style={{ isolation: "isolate" }}>
						<Link href={propertyUrlWithDateRange} className="block w-full h-full">
							<span
								className={`item__btn site-btn site-btn--secondary wa-primary-background-color text-lg antialiased font-normal text-inherit box-border relative py-3 px-9 border border-transparent outline-none cursor-pointer transition duration-300 ease-in-out leading-normal w-full pr-4 pl-4 text-center font-raleway h-full flex items-center justify-center ${
									isMainPage
										? "bg-[#1D2430] text-white" + (isHoverEnabled ? " hover:bg-[#221c18]" : "")
										: "bg-[#1D2430]" + (isHoverEnabled ? " hover:bg-[#353f50]" : "")
								}`}>
								<span className={isMainPage ? "!text-[#D6B08A] text-2xl font-bold" : "text-inherit"}>
									{isMainPage ? dictionary.apartments.view : dictionary.apartments.viewDetails}
								</span>
							</span>
						</Link>
					</div>
				</div>
			</div>
			{isDateDialogOpen && (
				<>
					<div className="fixed inset-0 z-40 bg-black/40" onClick={() => setIsDateDialogOpen(false)} />
					<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
						<div ref={dialogRef} className="bg-white rounded-lg shadow-lg max-w-sm w-full p-4">
							<div className="flex items-start gap-3">
								<div className="flex-1">
									<h3 className="text-lg font-semibold">{dictionary.apartments?.basketTitle || "Info"}</h3>
									<p className="text-sm text-gray-600 mt-1">
										{dictionary.apartments?.dateRangeRequired || "Please enter a stay period and check availability"}
									</p>
								</div>
								<button onClick={() => setIsDateDialogOpen(false)} className="text-gray-500 hover:text-gray-700">
									✕
								</button>
							</div>
							<div className="mt-4 flex justify-end gap-2">
								<Link href={propertyUrl} className="px-3 py-2 bg-[#cc9678] text-white rounded">
									{dictionary.apartments?.viewDetails || "View"}
								</Link>
								<button onClick={() => setIsDateDialogOpen(false)} className="px-3 py-2 border rounded">
									Close
								</button>
							</div>
						</div>
					</div>
				</>
			)}
		</div>
	)
}
