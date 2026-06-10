/** @format */

"use client"

import { useState } from "react"
import Image from "next/image"
import { ApartmentsDictionary } from "../../types/dictionary"
import { Property } from "@/types"
type ApartmentCardProps = {
	property: Property
	className?: string
	onViewDetails?: (property: Property) => void
	isMatching?: boolean // Whether this property matches current filters
	dictionary: {
		apartments: ApartmentsDictionary
		filters: {
			filters: Record<string, string>
			matching: string
		}
	}
}

export default function ApartmentCard({ property, className = "", onViewDetails, isMatching = false, dictionary }: ApartmentCardProps) {
	const [currentImageIndex, setCurrentImageIndex] = useState(0)
	const [showAllAmenities, setShowAllAmenities] = useState(false)
	const [imageErrors, setImageErrors] = useState<Set<number>>(new Set())

	// Helper function to get image source
	const getImageSrc = (index: number): string => {
		if (!property.images || property.images.length === 0) {
			return "/images/apartment-default-small.jpg" // fallback image
		}
		if (imageErrors.has(index)) {
			return "/images/apartment-default-small.jpg"
		}
		const image = property.images[index]
		let imagePath: string

		if (typeof image === "string") {
			imagePath = image
		} else {
			imagePath = image.path
		}

		// Normalize the path for Next.js Image component
		// Convert backslashes to forward slashes and ensure leading slash
		const normalizedPath = imagePath.replace(/\\/g, "/").replace(/^(?!\/)/, "/")

		return normalizedPath
	}

	const handleImageError = (index: number) => {
		setImageErrors((prev) => new Set(prev).add(index))
	}

	const handlePreviousImage = (e: React.MouseEvent) => {
		e.stopPropagation()
		if (!property.images) return
		setCurrentImageIndex((prev) => (prev === 0 ? property.images!.length - 1 : prev - 1))
	}

	const handleNextImage = (e: React.MouseEvent) => {
		e.stopPropagation()
		if (!property.images) return
		setCurrentImageIndex((prev) => (prev === property.images!.length - 1 ? 0 : prev + 1))
	}
	const handleViewDetails = () => {
		if (onViewDetails) {
			onViewDetails(property)
		} else {
			// Direct navigation as fallback - extract language from current path
			const currentLang = window.location.pathname.split("/")[1] || "en"
			window.location.href = `/${currentLang}/property/${property.id}`
		}
	}
	// Calculate pricing
	const minPrice = (property as Property & { extended?: { minPrice?: number } }).extended?.minPrice ?? 0
	const basePrice = property.lastMinuteOfferActive && minPrice > 0 && property.lastMinuteDiscountPercentage && property.lastMinuteDiscountPercentage > 0 ? minPrice / (1 - property.lastMinuteDiscountPercentage / 100) : minPrice
	const finalPrice = Math.max(minPrice, basePrice * (1 - (property.lastMinuteDiscountPercentage || 0) / 100))
	const hasPrice = minPrice > 0
	const hasImages = property.images && property.images.length > 0

	// Generate class names based on matching status
	const cardClasses = `flex-none w-[95%] bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-[450px] sm:h-[500px] md:h-[600px] ${className} ${isMatching ? "ring-2 ring-amber-400 shadow-amber-200 border-amber-300" : ""}`

	return (
		<div className={cardClasses} style={{ scrollSnapAlign: "start" }}>
			{/* Image Carousel */}
			<div className="relative h-32 sm:h-40 md:h-48 overflow-hidden flex-shrink-0">
				<Image src={getImageSrc(currentImageIndex)} alt={property.name} fill className="object-cover" onError={() => handleImageError(currentImageIndex)} sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 320px" />
				{/* Image Navigation */}
				{hasImages && property.images!.length > 1 && (
					<>
						<button onClick={handlePreviousImage} className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-all z-20" aria-label="Previous image">
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
							</svg>
						</button>
						<button onClick={handleNextImage} className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-all z-20" aria-label="Next image">
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
							</svg>
						</button>
						{/* Image Dots */}
						<div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1 z-20">
							{hasImages &&
								property.images!.map((_, index) => (
									<button
										key={index}
										onClick={(e) => {
											e.stopPropagation()
											setCurrentImageIndex(index)
										}}
										className={`w-2 h-2 rounded-full transition-all ${currentImageIndex === index ? "bg-white" : "bg-white/50"}`}
										aria-label={`View image ${index + 1}`}
									/>
								))}
						</div>
					</>
				)}{" "}
				{/* Last Minute Offer Badge */}
				{property.lastMinuteOfferActive && (
					<div className="absolute top-2 left-2 bg-[#cc9678] text-white px-2 py-1 rounded text-xs font-bold">
						{" -"}
						{property.lastMinuteDiscountPercentage}%
					</div>
				)}
				{/* Matching Filters Badge */}
				{isMatching && <div className={`absolute ${property.lastMinuteOfferActive ? "top-10" : "top-2"} left-2 bg-[#b8856a] text-white px-2 py-1 rounded text-xs font-bold shadow-lg`}>✓ {dictionary.filters.matching}</div>} {/* Property Type Badge and Size */}
				<div className="absolute top-2 right-2 flex flex-col gap-1">
					<div className="bg-[#cc9678] text-white px-2 py-1 rounded text-xs font-semibold">{dictionary.apartments.propertyTypes[property.type.toUpperCase() as keyof typeof dictionary.apartments.propertyTypes] || property.type}</div>
					{/* Size Badge */}
					{property.size && <div className="bg-[#a3745c] text-white px-2 py-1 rounded text-xs font-semibold">{property.size} m²</div>}
				</div>
			</div>
			{/* Card Content */}
			<div className="p-3 sm:p-4 flex flex-col flex-grow cursor-pointer" onClick={handleViewDetails}>
				<div className="flex-grow">
					<h4 className="text-base sm:text-lg font-bold mb-2 text-gray-800 truncate">{property.name}</h4>
					<p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 truncate">{property.location}</p>
					<p className="text-xs sm:text-sm text-black mb-2 sm:mb-3 truncate uppercase">{property.place?.name}</p>
					{/* Occupancy Info */}
					<div className="flex items-center gap-2 sm:gap-4 mb-2 sm:mb-3 text-xs sm:text-sm text-gray-600 flex-wrap">
						<span className="flex items-center gap-1">
							<svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
								<path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
							</svg>
							<span className="whitespace-nowrap">
								{property.minOccupancy}-{property.maxOccupancy}
								{dictionary.apartments.guests}
							</span>
						</span>
						<span className="flex items-center gap-1 relative group">
							<svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
								<path d="M20 9V6c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v3c-1.1 0-2 .9-2 2v5h1.33L4 19h1l.67-3h12.67L19 19h1l.67-3H22v-5c0-1.1-.9-2-2-2zM18 7v2H6V7h12zM6 11h12v3H6v-3z" />
							</svg>
							{property.numSingleBeds + property.numDoubleBeds}
							{dictionary.apartments.beds}
							{/* Tooltip */}
							{(property.numSingleBeds > 0 || property.numDoubleBeds > 0) && (
								<div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
									{property.numSingleBeds > 0 && property.numDoubleBeds > 0 ? (
										<>
											{property.numSingleBeds}
											{dictionary.apartments.singleBeds},{property.numDoubleBeds}
											{dictionary.apartments.doubleBeds}
										</>
									) : property.numSingleBeds > 0 ? (
										<>
											{property.numSingleBeds}
											{dictionary.apartments.singleBeds}
										</>
									) : (
										<>
											{property.numDoubleBeds}
											{dictionary.apartments.doubleBeds}
										</>
									)}{" "}
								</div>
							)}
						</span>
					</div>{" "}
					{/* Amenities */}
					<div className="mb-3">
						<div className={`${showAllAmenities ? "max-h-28 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100" : ""}`}>
							<div className="flex flex-wrap gap-1">
								{(showAllAmenities ? property.filters : property.filters.slice(0, 3)).map((filter) => (
									<span key={filter} className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-100 text-gray-600 rounded text-xs leading-tight truncate max-w-[120px]" title={dictionary.filters.filters[filter] || filter.replace(/_/g, " ").toLowerCase()}>
										{dictionary.filters.filters[filter] || filter.replace(/_/g, " ").toLowerCase()}
									</span>
								))}
							</div>
						</div>
						{property.filters.length > 3 && (
							<button
								onClick={(e) => {
									e.stopPropagation()
									setShowAllAmenities(!showAllAmenities)
								}}
								className="mt-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-[#e4d9c7] hover:bg-[#d4a88a] text-[#a3745c] rounded text-xs cursor-pointer transition-colors flex-shrink-0 w-full text-center">
								{showAllAmenities ? dictionary.apartments.showLess : `+${property.filters.length - 3} ${dictionary.apartments.moreAmenities}`}
							</button>
						)}
					</div>
				</div>
				{/* Pricing and Action - This section will be pinned to bottom */}
				<div className="flex-shrink-0">
					{/* Price Section - Full Width */}
					<div className="mb-3">
						<div className="flex min-w-0">
							{hasPrice ? (
								property.lastMinuteOfferActive ? (
									<div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
										<span className="text-xs sm:text-sm text-gray-600 mr-1">{dictionary?.apartments?.from || "from"}</span>
										<span className="text-base sm:text-lg font-bold text-green-600">PLN {finalPrice.toFixed(0)}</span>
										<span className="text-xs sm:text-sm text-gray-500 line-through">PLN {basePrice.toFixed(0)}</span>
									</div>
								) : (
									<div className="flex items-center gap-1 sm:gap-2 mb-2">
										<span className="text-xs sm:text-sm text-gray-600">{dictionary?.apartments?.from || "from"}</span>
										<span className="text-base sm:text-lg font-bold text-gray-800">PLN {basePrice.toFixed(0)}</span>
									</div>
								)
							) : (
								<span className="text-base sm:text-lg font-bold text-gray-500 block mb-2">{dictionary?.apartments?.priceOnRequest || "Price on request"}</span>
							)}
							{hasPrice && <span className="text-xs sm:text-sm text-gray-500 block pl-1">/ {dictionary?.apartments?.night || "night"}</span>}
						</div>
					</div>
					{/* Action Button - Full Width */}
					<button onClick={handleViewDetails} className="w-full bg-[#cc9678] hover:bg-[#b8856a] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
						{dictionary?.apartments?.viewDetails || "View Details"}
					</button>
					{/* Additional Info */}{" "}
					<div className="pt-3 border-t border-gray-200 text-xs text-gray-500 space-y-1">
						<div className="truncate">
							<span className="font-medium"> {dictionary?.apartments?.serviceFee || "Service Fee"}:</span>
							<span className="ml-1">{property.cleaningFee} PLN</span>
						</div>{" "}
						{property.parkingQuantity > 0 && (
							<div className={`truncate ${property.parkingFee === 0 ? "text-green-500 font-semibold" : ""}`}>
								<span className="font-medium">{property.filters.includes("PRIVATE_GARAGE") ? dictionary?.apartments?.garageFee || "Garage" : dictionary?.apartments?.parkingFee || "Parking"}:</span>
								<span className="ml-1">{property.parkingFee === 0 ? dictionary?.apartments?.free || "Free" : `${property.parkingFee}/${dictionary?.apartments?.night || "night"} PLN`}</span>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}
