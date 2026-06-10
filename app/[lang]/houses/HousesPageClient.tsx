/** @format */

"use client"

import { Property } from "@/types"
import { Dictionary } from "../../types/dictionary"
import { Locale } from "../../i18n-config"
import ModernApartmentTile from "../homepage/components/ModernApartmentTile"
import ModernNav from "../homepage/components/ModernNav"

type HousesPageClientProps = {
	properties: Property[]
	dictionary: Dictionary
	lang: Locale
}

export default function HousesPageClient({ properties, dictionary, lang }: HousesPageClientProps) {
	return (
		<div className="min-h-screen bg-white">
			{/* Modern Navigation */}
			<ModernNav dictionary={dictionary} lang={lang} />

			{/* Main Content */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Header */}
				<div className="mb-8 text-center">
					<h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3 drop-shadow-sm">{dictionary.houses?.title || "Houses"}</h1>
					<p className="text-xl text-gray-700 drop-shadow-sm">{dictionary.houses?.subtitle || "Beautiful houses in the mountains"}</p>
					{properties.length > 0 && (
						<p className="text-lg text-gray-600 mt-2">{dictionary.houses?.availableCount.replace("{{count}}", properties.length.toString())}</p>
					)}
				</div>

				{/* Properties Section */}
				<div>
					{properties.length === 0 ? (
						<div className="text-center py-12">
							<p className="text-gray-500 text-lg">{dictionary.houses?.noHousesAvailable || "No houses are currently available."}</p>
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
							{properties.map((property) => (
								<div key={property.id} className="transform hover:scale-105 transition-transform duration-300">
									<ModernApartmentTile property={property} dictionary={dictionary} lang={lang} />
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
