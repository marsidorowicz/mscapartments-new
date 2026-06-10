/** @format */

"use client"

import { Dictionary } from "../../../types/dictionary"
import { Locale } from "../../../i18n-config"
import Link from "next/link"
import Image from "next/image"

type ModernLocationsSectionProps = {
	dictionary: Dictionary
	lang: Locale
}

export default function ModernLocationsSection({ dictionary, lang }: ModernLocationsSectionProps) {
	const locations = dictionary.home.locationsSection?.locations || [
		{
			id: 1,
			name: "Apartamentowiec Centrum",
			description: "Luksusowe apartamenty w samym centrum Zakopanego. Blisko Krupówek i głównych atrakcji turystycznych.",
			image: "/images/zakopane-rooms/centrum.jpg",
			features: ["Centrum miasta", "Blisko Krupówek", "Parking", "WiFi"],
			apartments: 12,
		},
		{
			id: 2,
			name: "Apartamentowiec Gubałówka",
			description: "Nowoczesne apartamenty z widokiem na Gubałówkę. Idealne dla rodzin i grup przyjaciół.",
			image: "/images/zakopane-rooms/gubalowka.jpg",
			features: ["Widok na góry", "Balkon", "Parking", "Ogród"],
			apartments: 8,
		},
		{
			id: 3,
			name: "Apartamentowiec Kościelisko",
			description: "Spokojne apartamenty w Kościelisku. Blisko szlaków turystycznych i tras narciarskich.",
			image: "/images/zakopane-rooms/koscielisko.jpg",
			features: ["Spokójna okolica", "Blisko tras", "Parking", "Taras"],
			apartments: 15,
		},
	]

	return (
		<div className="py-16 bg-gray-50">
			<div className="container mx-auto px-4">
				<div className="text-center mb-12">
					<h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">{dictionary.home.locationsSection?.title}</h2>
					<p className="text-lg text-gray-600 max-w-2xl mx-auto">{dictionary.home.locationsSection?.subtitle}</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					{locations.map((location) => (
						<div key={location.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
							{/* Image */}
							<div className="relative aspect-[4/3] overflow-hidden">
								<Image src={location.image} alt={location.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
								{/* Apartments count badge */}
								<div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
									{location.apartments} {dictionary.home.locationsSection?.apartments}
								</div>
							</div>

							{/* Content */}
							<div className="p-6">
								<h3 className="text-xl font-semibold text-gray-800 mb-3">{location.name}</h3>
								<p className="text-gray-600 mb-4 leading-relaxed">{location.description}</p>

								{/* Features */}
								<div className="flex flex-wrap gap-2 mb-4">
									{location.features.map((feature, index) => (
										<span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full">
											{feature}
										</span>
									))}
								</div>

								{/* View Button */}
								<Link href={`/${lang}/zakopane-noclegi`} className="inline-block w-full text-center bg-[#cc9678] hover:bg-[#a6755a] text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200">
									{dictionary.home.locationsSection?.viewApartments}
								</Link>
							</div>
						</div>
					))}
				</div>

				{/* Call to Action */}
				<div className="text-center mt-12">
					<Link href={`/${lang}/zakopane-noclegi`} className="inline-flex items-center gap-2 bg-[#cc9678] hover:bg-[#a6755a] text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors duration-200">
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
						</svg>
						{dictionary.home.locationsSection?.viewAllApartments}
					</Link>
				</div>
			</div>
		</div>
	)
}
