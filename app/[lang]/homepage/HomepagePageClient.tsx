/** @format */

"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { Dictionary } from "../../types/dictionary"
import { Locale } from "../../i18n-config"
import { PublicOfferData, OfferProperty, Property } from "../../../types"
import ModernNav from "./components/ModernNav"
import ModernHeroSection from "./components/ModernHeroSection"
import ModernApartmentCarousel from "./components/ModernApartmentCarousel"
import Footer from "./components/Footer"
import OfferBookingModal from "./components/OfferBookingModal"
import AISearchWidget, { type AiSearchAction } from "@marsidorowicz/simplevent-sdk"
import ModernApartmentTile from "../apartamenty/components/ModernApartmentTile"

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

	// Properties + AI-driven results (same logic as /apartamenty)
	const [properties, setProperties] = useState<Property[]>([])
	const [propertiesInitialized, setPropertiesInitialized] = useState(false)
	const [aiPropertyIds, setAiPropertyIds] = useState<Set<number> | null>(null)
	const [aiPriceSums, setAiPriceSums] = useState<Record<number, number> | null>(null)
	const [aiSortBy, setAiSortBy] = useState<"price_asc" | "default">("default")

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

	// Fetch properties (same rotation logic as /apartamenty and carousel)
	useEffect(() => {
		if (propertiesInitialized) return
		setPropertiesInitialized(true)

		const fetchProperties = async () => {
			try {
				const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mscapartments.pl"
				const response = await fetch(`${baseUrl}/api/properties/mountain?userId=clok0rd6f0000kkdgyf1pd0t3`)

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`)
				}

				const data = await response.json()
				let fetchedProperties: Property[] = data.properties || []

				if (fetchedProperties.length > 0) {
					const lastMinuteOffers = fetchedProperties.filter(p => p.lastMinuteOfferActive)
					const regularProperties = fetchedProperties.filter(p => !p.lastMinuteOfferActive)

					if (regularProperties.length > 0) {
						const now = new Date()
						const start = new Date(now.getFullYear(), 0, 0)
						const diff = now.getTime() - start.getTime()
						const oneDay = 1000 * 60 * 60 * 24
						const dayOfYear = Math.floor(diff / oneDay)
						const shift = dayOfYear % regularProperties.length
						const rotatedRegular = [...regularProperties.slice(shift), ...regularProperties.slice(0, shift)]
						fetchedProperties = [...lastMinuteOffers, ...rotatedRegular]
					} else {
						fetchedProperties = lastMinuteOffers
					}
				}

				setProperties(fetchedProperties)
			} catch (error) {
				console.error("Error fetching properties:", error)
				setPropertiesInitialized(false)
			}
		}

		fetchProperties()
	}, [propertiesInitialized])

	// Apply an AI assistant search result to the tile list
	const handleApplyAiSearch = useCallback((action: AiSearchAction) => {
		if (action.propertyIds && action.propertyIds.length > 0) {
			setAiPropertyIds(new Set(action.propertyIds))
		} else {
			setAiPropertyIds(null)
		}
		if (action.priceSums) {
			setAiPriceSums(action.priceSums)
		} else {
			setAiPriceSums(null)
		}
		setAiSortBy(action.sortBy || "default")
	}, [])

	const aiResults = useMemo(() => {
		if (!aiPropertyIds) return null
		const result = properties.filter(p => aiPropertyIds.has(p.id))
		if (aiSortBy === "price_asc" && aiPriceSums) {
			return [...result].sort((a, b) => {
				const pa = aiPriceSums[a.id] ?? Number.MAX_SAFE_INTEGER
				const pb = aiPriceSums[b.id] ?? Number.MAX_SAFE_INTEGER
				return pa - pb
			})
		}
		return result
	}, [properties, aiPropertyIds, aiPriceSums, aiSortBy])

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

			{/* AI booking assistant */}
			<AISearchWidget
				lang={lang}
				labels={{
					assistantName: dictionary.apartamenty.aiAssistantName,
					placeholder: dictionary.apartamenty.aiSearchPlaceholder || dictionary.apartamenty.searchByNamePlaceholder,
					resultsNote: dictionary.apartamenty.aiSearchResultsNote,
				}}
				onApplyAiSearch={handleApplyAiSearch}
			/>

			{/* AI search results - same tiles and design as /apartamenty */}
			{aiResults !== null && (
				<div className="bg-white py-8">
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 px-0 sm:px-7 lg:px-9 w-full">
						{aiResults.map(property => (
							<div key={property.id} className="transition-all duration-700 ease-out translate-y-0 opacity-100 scale-100">
								<ModernApartmentTile
									property={property}
									dictionary={dictionary}
									lang={lang}
									mainPage={false}
									priceForRange={aiPriceSums?.[property.id]}
								/>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Apartment Carousel Section - hidden while AI results are shown */}
			{aiResults === null && (
				<div id="apartments" className="py-4 bg-white">
					<div className="container mx-auto px-4">
						<ModernApartmentCarousel dictionary={dictionary} lang={lang} />
					</div>
				</div>
			)}

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