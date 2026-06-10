/** @format */

"use client"

import { useState } from "react"
import Image from "next/image"
import { Place, Property } from "@/types"
import { Dictionary } from "../../../../types/dictionary"
import { Locale } from "../../../../i18n-config"
import ModernNav from "../../../homepage/components/ModernNav"
import PlaceMap from "./PlaceMap"
import ModernApartmentTile from "@/app/[lang]/apartamenty/components/ModernApartmentTile"

type PlaceDetailsProps = {
	place: Place
	properties: Property[]
	dictionary: Dictionary
	lang: Locale
}

export default function PlaceDetails({ place, properties, dictionary, lang }: PlaceDetailsProps) {
	const [currentImageIndex, setCurrentImageIndex] = useState(0)

	// Get images from place or use fallback
	const buildingImages =
		place.images && place.images.length > 0
			? place.images
					.sort((a, b) => (a.order || 0) - (b.order || 0)) // Sort by order field
					.map((img) => (img.path.startsWith("/") ? img.path : `/${img.path}`))
			: ["/images/default-property.jpg"]

	const handlePreviousImage = () => {
		setCurrentImageIndex((prev) => (prev === 0 ? buildingImages.length - 1 : prev - 1))
	}

	const handleNextImage = () => {
		setCurrentImageIndex((prev) => (prev === buildingImages.length - 1 ? 0 : prev + 1))
	}

	return (
		<div className="min-h-screen relative pb-10">
			{/* Beautiful Background */}
			<div className="absolute inset-0">
				{/* Gradient Background */}
				<div className="absolute inset-0 bg-white"></div>

				{/* Subtle Pattern Overlay */}
				<div className="absolute inset-0 bg-white/20 backdrop-blur-[1px]"></div>
			</div>

			{/* Content */}
			<div className="relative z-10">
				{/* Modern Navigation */}
				<ModernNav dictionary={dictionary} lang={lang} />

				{/* Main Content */}
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					{/* Header */}
					<div className="mb-8 text-center">
						<h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3 drop-shadow-sm">{place.name}</h1>
						<p className="text-xl text-gray-700 drop-shadow-sm">{place.location}</p>
						<p className="text-lg text-gray-600 mt-2">
							{dictionary.placeDetails?.availableApartmentsCount.replace("{{count}}", properties.length.toString())}
						</p>
					</div>

					{/* Full Width Main Image */}
					<div className="mb-12">
						<div className="relative h-96 md:h-[600px] bg-gray-200 rounded-2xl overflow-hidden shadow-xl">
							<Image
								src={buildingImages[currentImageIndex]}
								alt={`${place.name} apartment building`}
								fill
								className="object-cover"
								sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1400px"
							/>

							{/* Image Navigation */}
							{buildingImages.length > 1 && (
								<>
									<button
										onClick={handlePreviousImage}
										className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition-all shadow-lg">
										<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
										</svg>
									</button>
									<button
										onClick={handleNextImage}
										className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition-all shadow-lg">
										<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
										</svg>
									</button>
								</>
							)}

							{/* Image Counter */}
							{buildingImages.length > 1 && (
								<div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
									{currentImageIndex + 1} / {buildingImages.length}
								</div>
							)}
						</div>
					</div>

					{/* Description Section */}
					<div className="mb-12">
						<div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/40">
							{/* <h2 className="text-3xl font-bold text-gray-900 mb-6">{dictionary.placeDetails?.aboutPlace.replace("{{placeName}}", place.name)}</h2> */}
							<div className="prose prose-lg max-w-none text-gray-700">
								{/* <p className="mb-4">{dictionary.placeDetails?.welcomeDescription.replace("{{placeName}}", place.name).replace("{{location}}", place.location)}</p> */}
								<div className="mb-4" dangerouslySetInnerHTML={{ __html: place.description || "" }} />
								{/* <p>{dictionary.placeDetails?.selectionDescription.replace("{{count}}", properties.length.toString())}</p> */}
							</div>
						</div>
					</div>

					{/* Map Section */}
					<div className="mb-12">
						<PlaceMap place={place} dictionary={dictionary} />
					</div>

					{/* Properties Section */}
					<div>
						<h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
							{dictionary.placeDetails?.availableApartments.replace("{{placeName}}", place.name)}
						</h2>

						{properties.length === 0 ? (
							<div className="text-center py-12">
								<p className="text-gray-500 text-lg">{dictionary.placeDetails?.noApartmentsAvailable}</p>
							</div>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
								{properties.map((property) => (
									<div key={property.id} className="transform hover:scale-105 transition-transform duration-300 shadow-xl">
										<ModernApartmentTile property={property} dictionary={dictionary} lang={lang} />
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}
