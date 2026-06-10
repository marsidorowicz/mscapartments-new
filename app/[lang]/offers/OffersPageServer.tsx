/** @format */

import React from "react"
import type { Dictionary } from "@/app/types/dictionary"
import { Locale } from "@/app/i18n-config"
import ModernNav from "../homepage/components/ModernNav"
import { activeOffers } from "../../../lib/activeOffers"
import OffersPageClient from "./OffersPageClient"
import Footer from "../homepage/components/Footer"

interface OffersPageServerProps {
	dictionary: Dictionary
	lang: Locale
}

const OffersPageServer: React.FC<OffersPageServerProps> = ({ dictionary, lang }) => {
	return (
		<div className="min-h-screen bg-white flex flex-col">
			<ModernNav dictionary={dictionary} lang={lang as Locale} />
			{/* Main Content */}
			<main className="flex-1 pt-24 px-4 md:px-8 lg:px-16 pb-16">
				<div className="max-w-6xl mx-auto">
					{/* Header */}
					<div className="text-center py-12">
						<h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">{dictionary.navigation.offers}</h1>
						<p className="text-lg text-gray-600 max-w-3xl mx-auto">{dictionary.offersPage.subtitle}</p>
					</div>

					{/* Active Offers Section */}
					<div className="mb-16">
						<h2 className="text-2xl md:text-3xl font-bold text-green-600 mb-8 text-center">{dictionary.offersPage.activeOffers}</h2>
						<div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8">
							{activeOffers.map((offer) => (
								<div key={offer.id} className="bg-white border-2 border-gray-100 rounded-xl shadow-lg overflow-hidden flex flex-col">
									<div className="p-6 text-gray-800 flex-1">
										{/* <div className="text-4xl mb-4">{offer.icon}</div> */}
										<h3 className="text-xl font-semibold mb-2">{offer.title[lang as keyof typeof offer.title] || offer.title.en}</h3>
										<p className="mb-4 text-gray-700">
											{offer.description[lang as keyof typeof offer.description] || offer.description.en}
										</p>
										<div className="text-sm font-medium text-green-600 mb-4">
											{offer.isAlwaysValid
												? dictionary.offersPage.alwaysValid
												: `${dictionary.offersPage.validUntil} ${offer.validUntil}`}
										</div>
									</div>
									<div className="p-6 pt-0 flex justify-center">
										<OffersPageClient dictionary={dictionary} lang={lang} />
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</main>
			{/* Footer */}
			<Footer lang={lang} />
		</div>
	)
}

export default OffersPageServer
