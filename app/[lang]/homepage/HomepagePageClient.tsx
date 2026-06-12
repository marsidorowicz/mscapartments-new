/** @format */

"use client"

import { useEffect, useState, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { Dictionary } from "../../types/dictionary"
import { Locale } from "../../i18n-config"
import { PublicOfferData, OfferProperty } from "../../../types"
import ModernNav from "./components/ModernNav"
import ModernHeroSection from "./components/ModernHeroSection"
import ModernApartmentCarousel from "./components/ModernApartmentCarousel"
import Footer from "./components/Footer"
import OfferBookingModal from "./components/OfferBookingModal"

type HomepagePageClientProps = {
	dictionary: Dictionary
	lang: Locale
}

export default function HomepagePageClient({ dictionary, lang }: HomepagePageClientProps) {
	const [mounted, setMounted] = useState(false)
	const [isOfferModalOpen, setIsOfferModalOpen] = useState(false)
	const [offerData, setOfferData] = useState<
		| (PublicOfferData & {
				propertyId?: number
				propertyName?: string
		  })
		| null
	>(null)
	const searchParams = useSearchParams()

	const fetchOfferData = useCallback(
		async (offerId: string) => {
			try {
				const response = await fetch(`/api/public/offer/${offerId}`)

				if (!response.ok) {
					console.error("Failed to fetch offer")
					return
				}

				const data = await response.json()

				const propertyIdParam = searchParams.get("propertyId")
				const propertyId = propertyIdParam ? parseInt(propertyIdParam, 10) : undefined

				const propertyName = propertyId ? data.offerProperties?.find((op: OfferProperty) => op.property.id === propertyId)?.property?.name : undefined

				setOfferData({
					...data,
					propertyId,
					propertyName,
				})

				setIsOfferModalOpen(true)
			} catch (error) {
				console.error("Error fetching offer:", error)
			}
		},
		[searchParams],
	)

	useEffect(() => {
		setMounted(true)

		// Check for offer parameters
		const fromOffer = searchParams.get("fromOffer")
		const offerId = searchParams.get("offer")

		if (fromOffer === "true" && offerId) {
			fetchOfferData(offerId)
		}

		return () => {}
	}, [searchParams, fetchOfferData])

	if (!mounted) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-white">
				<div className="text-center">
					<div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
					<p className="text-gray-600 font-medium">{dictionary.home.loading || "Loading..."}</p>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-white overflow-x-hidden">
			{/* Modern Navigation */}
			<ModernNav dictionary={dictionary} lang={lang} />

			{/* Hero Section with parallax */}
			<ModernHeroSection dictionary={dictionary} lang={lang} />

			{/* Apartment Carousel Section */}
			<div id="apartments" className="py-4 bg-[#F8F6F3]">
				<div className="container mx-auto px-4">
					<ModernApartmentCarousel dictionary={dictionary} lang={lang} />
				</div>
			</div>

			{/* Locations Section */}
			{/* <ModernLocationsSection dictionary={dictionary} lang={lang} /> */}

			{/* Offers Section */}
			{/* <ModernOffersSection dictionary={dictionary} lang={lang} /> */}

			{/* Reviews Section */}
			{/* <ModernReviewsSection dictionary={dictionary} /> */}

			{/* Footer */}
			<Footer lang={lang} />
			{isOfferModalOpen && offerData && (
				<OfferBookingModal
					offerData={offerData}
					isOpen={isOfferModalOpen}
					onClose={() => setIsOfferModalOpen(false)}
					dictionary={dictionary}
					lang={lang}
				/>
			)}
		</div>
	)
}
