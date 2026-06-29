/** @format */

import Image from "next/image"
import { useState } from "react"
import { Property } from "@/types"
import { Dictionary } from "../../../types/dictionary"
import { Locale } from "../../../i18n-config"
import BookNowButton from "../../components/BookNowButton"
import { buildPropertyUrl } from "@/utilities/functions/propertyUrl"
import Link from "next/link"

type ModernApartmentTileProps = {
	property: Property
	dictionary: Dictionary
	lang: Locale
}

export default function ModernApartmentTile({ property, dictionary, lang }: ModernApartmentTileProps) {
	const [currentImageIndex, setCurrentImageIndex] = useState(0)
	const [showAllAmenities, setShowAllAmenities] = useState(false)

	// Track detected image orientation per index so we can letterbox vertical photos
	const [imageOrientations, setImageOrientations] = useState<Record<number, "portrait" | "landscape">>({})

	// Get valid images with proper validation
	const validImages =
		property.images?.filter(
			(img) => img.path && img.path !== "undefined" && img.path !== "/undefined" && img.path !== "" && !img.path.includes("undefined"),
		) || []

	const [imageErrors, setImageErrors] = useState<Set<number>>(new Set())

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

	// Calculate pricing
	const minPrice = (property as Property & { extended?: { minPrice?: number } }).extended?.minPrice ?? 0
	const basePrice =
		property.lastMinuteOfferActive && minPrice > 0 && property.lastMinuteDiscountPercentage && property.lastMinuteDiscountPercentage > 0
			? minPrice / (1 - property.lastMinuteDiscountPercentage / 100)
			: minPrice
	const finalPrice = Math.max(minPrice, basePrice * (1 - (property.lastMinuteDiscountPercentage || 0) / 100))
	const hasPrice = minPrice > 0

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

	return (
		<div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col w-full h-auto min-h-[680px] scale-90 sm:scale-95 md:scale-100">
			{/* Image - Responsive height */}
			<div className="relative overflow-hidden flex-shrink-0 w-full h-64 sm:h-72 md:h-80 lg:h-96 xl:h-[400px]">
				<Link
					href={buildPropertyUrl(property.id, property.name, lang, property.slugs)}
					className={`block w-full h-full ${imageOrientations[currentImageIndex] === "portrait" ? "bg-black" : ""}`}>
					<Image
						src={getImageSrc(currentImageIndex)}
						alt={property.name}
						fill
						className={imageOrientations[currentImageIndex] === "portrait" ? "object-contain" : "object-cover"}
						sizes="(max-width: 640px) 100vw, (max-width: 768px) 90vw, (max-width: 1024px) 70vw, 480px"
						onError={() => handleImageError(currentImageIndex)}
						onLoad={(e) => {
							const target = e.currentTarget as HTMLImageElement
							if (target.naturalWidth && target.naturalHeight) {
								const isPort = target.naturalHeight > target.naturalWidth
								const newOrientation: "portrait" | "landscape" = isPort ? "portrait" : "landscape"
								if (imageOrientations[currentImageIndex] !== newOrientation) {
									setImageOrientations((prev) => ({
										...prev,
										[currentImageIndex]: newOrientation,
									}))
								}
							}
						}}
						quality={50}
						placeholder="blur"
						blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z"
					/>
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
				{property.lastMinuteOfferActive && (
					<div className="absolute top-3 left-3 z-20 bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">LAST MINUTE</div>
				)}

				{/* Property Type Badge - Top Right */}
				<div className="absolute top-3 right-3 z-10 bg-[#cc9678] text-white px-3 py-1 rounded-lg text-sm font-semibold">
					{dictionary.apartments.propertyTypes[property.type.toUpperCase() as keyof typeof dictionary.apartments.propertyTypes] || property.type}
				</div>

				{/* Size Badge - Bottom Right */}
				{property.size && (
					<div className="absolute bottom-3 right-3 z-10 bg-white/90 text-gray-800 px-3 py-1 rounded-lg text-sm font-semibold flex items-center gap-1 border border-gray-200 shadow-sm">
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
							/>
						</svg>
						{property.size}m²
					</div>
				)}

				{/* Occupancy and Beds - Bottom Left */}
				<div className="absolute bottom-3 left-3 z-10 flex items-center gap-3 text-sm">
					<div className="bg-white/90 text-gray-800 px-2 py-1 rounded-lg flex items-center gap-1 border border-gray-200 shadow-sm relative group">
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
							/>
						</svg>
						<span className="font-semibold">
							{property.minOccupancy}-{property.maxOccupancy}
						</span>
						{/* Tooltip */}
						<div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
							{property.minOccupancy}-{property.maxOccupancy} {dictionary.apartments.guests}
						</div>
					</div>
					<div className="bg-white/90 text-gray-800 px-2 py-1 rounded-lg flex items-center gap-1 border border-gray-200 shadow-sm relative group">
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
							/>
						</svg>
						<span className="font-semibold">{property.numSingleBeds + property.numDoubleBeds}</span>
						{/* Tooltip */}
						{(property.numSingleBeds > 0 || property.numDoubleBeds > 0) && (
							<div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
								{property.numSingleBeds > 0 && property.numDoubleBeds > 0 ? (
									<>
										{property.numSingleBeds} {dictionary.apartments.singleBeds}, {property.numDoubleBeds} {dictionary.apartments.doubleBeds}
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
				</div>
			</div>

			{/* Content - Responsive height */}
			<div className="pt-3 pb-6 px-4 sm:px-6 flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 flex-grow min-h-[280px]">
				{/* Title and Property Info */}
				<div className="flex flex-col items-center justify-center gap-1 mb-2 relative">
					<h3 className="text-xl font-bold text-gray-800 text-center leading-tight">{property.name}</h3>
					{property.place?.name && <p className="text-sm font-medium text-gray-600 text-center">{property.place.name}</p>}
					<div className="absolute right-0 top-1/2 transform -translate-y-1/2">
						<div className="relative group">
							<svg className="w-5 h-5 text-gray-500 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
								/>
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
							</svg>
							{/* Tooltip with smart positioning */}
							<div
								className="absolute top-1/2 transform -translate-y-1/2 px-2 py-1 bg-gray-800 text-white text-sm rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-lg"
								style={{
									right: "100%",
									marginRight: "8px",
									maxWidth: "200px",
									wordWrap: "break-word",
									whiteSpace: "normal",
								}}>
								{property.location}
								{/* Arrow pointer */}
								<div className="absolute top-1/2 left-full transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-gray-800 border-t-2 border-t-transparent border-b-2 border-b-transparent"></div>
							</div>
						</div>
					</div>
				</div>

				{/* Amenities */}
				{property.filters && property.filters.length > 0 && (
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
				)}

				{/* Spacer to push pricing to bottom */}
				<div className="flex-grow"></div>

				{/* Pricing and Additional Info */}
				<div className="flex flex-col gap-2 pt-2 border-t border-gray-100 mt-auto">
					{/* Price Section */}
					<div>
						{hasPrice ? (
							property.lastMinuteOfferActive ? (
								<div className="flex items-center gap-2">
									<span className="text-xs text-gray-600">{dictionary.apartments.from}</span>
									<span className="text-xl font-bold text-green-600">{formatPrice(finalPrice)}</span>
									<span className="text-sm text-gray-500 line-through">{formatPrice(basePrice)}</span>
									<span className="text-sm text-gray-600">/ {dictionary.apartments.night}</span>
								</div>
							) : (
								<div className="flex items-center gap-2">
									<span className="text-xs text-gray-600">{dictionary.apartments.from}</span>
									<span className="text-xl font-bold text-gray-800">{formatPrice(basePrice)}</span>
									<span className="text-sm text-gray-600">/ {dictionary.apartments.night}</span>
								</div>
							)
						) : (
							<span className="text-lg font-bold text-gray-500">{dictionary.apartments.priceOnRequest}</span>
						)}
					</div>

					{/* Additional Info */}
					<div className="text-xs text-gray-500 space-y-1">
						<div className="flex justify-between">
							<span>{dictionary.apartments.serviceFee}:</span>
							<span>{property.cleaningFee} PLN</span>
						</div>
						{property.parkingQuantity > 0 && (
							<div className="flex justify-between">
								<span>{property.filters.includes("PRIVATE_GARAGE") ? dictionary.apartments.garageFee : dictionary.apartments.parkingFee}:</span>
								<span>
									{property.parkingFee === 0 ? dictionary.apartments.free : `${property.parkingFee}/${dictionary.apartments.night} PLN`}
								</span>
							</div>
						)}
					</div>
					{/* Buttons - Both in one row with proper spacing */}
					<div className="flex flex-col sm:flex-row gap-4">
						{/* Zobacz szczegóły Button - isolated container with margin */}
						<div className="flex-1 relative overflow-hidden" style={{ isolation: "isolate" }}>
							<Link href={buildPropertyUrl(property.id, property.name, lang, property.slugs)} className="block w-full h-full">
								<span className="item__btn site-btn site-btn--secondary wa-primary-background-color text-lg antialiased font-normal text-inherit box-border relative py-3.5 px-9 border border-transparent outline-none cursor-pointer transition duration-300 ease-in-out leading-normal w-full pr-4 pl-4 text-center bg-[#cc9678] hover:bg-[#a6755a] font-raleway h-full flex items-center justify-center">
									<span className="text">{dictionary.apartments.viewDetails}</span>
								</span>
							</Link>
						</div>

						{/* Book Button - isolated container with margin */}
						<div className="flex-1 relative overflow-hidden" style={{ isolation: "isolate" }}>
							<div className="w-full h-full">
								<BookNowButton
									propertyId={property.id}
									propertyName={property.name}
									bookNowText={dictionary.apartments?.bookNow || "Book"}
									booking={{
										title: "Book Now",
										description: "",
										checkIn: "",
										checkOut: "",
										guests: "",
										continue: "",
										close: "",
									}}
									dictionary={dictionary}
									className="item__btn site-btn site-btn--secondary wa-primary-background-color text-lg antialiased font-normal text-inherit box-border relative py-3.5 px-9 border border-transparent outline-none cursor-pointer transition duration-300 ease-in-out leading-normal pr-4 pl-4 text-center bg-[#cc9678] hover:bg-[#a6755a] font-raleway w-full h-full flex items-center justify-center"
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
