/** @format */

import { notFound } from "next/navigation"
import { getDictionary } from "../../../dictionaries"
import PlaceDetails from "./components/PlaceDetails"
import { Place, Property } from "@/types"
import { generateSlug } from "@/utilities/functions/propertyUrl"
import { Locale } from "../../../i18n-config"

// Force dynamic rendering since this page fetches data that can't be statically generated
export const dynamic = "force-dynamic"

type Params = {
	lang: Locale
	"place-name": string
}

// Fetch place data and its properties
async function getPlaceData(placeName: string) {
	try {
		const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mscapartments.pl"
		// First get the place info
		const placesResponse = await fetch(`${baseUrl}/api/properties/places`, {
			cache: "no-store",
		})

		if (!placesResponse.ok) {
			throw new Error("Failed to fetch places")
		}

		const placesData = await placesResponse.json()
		const places = placesData.places || []

		// Find the place by name (case insensitive, normalized)
		const normalizedPlaceName = generateSlug(placeName)
		const place = places.find((p: Place) => generateSlug(p.name) === normalizedPlaceName)

		if (!place) {
			return null
		}

		// Get properties for this place
		const propertiesResponse = await fetch(`${baseUrl}/api/properties/mountain?userId=clok0rd6f0000kkdgyf1pd0t3`, {
			cache: "no-store",
		})

		if (!propertiesResponse.ok) {
			throw new Error("Failed to fetch properties")
		}

		const propertiesData = await propertiesResponse.json()
		const allProperties = propertiesData.properties || []

		// Filter properties that belong to this place
		const placeProperties = allProperties.filter((property: Property) => property.placeId === place.id)

		return {
			place,
			properties: placeProperties,
		}
	} catch (error) {
		console.error("Error fetching place data:", error)
		return null
	}
}

export default async function PlacePage({ params }: { params: Promise<Params> }) {
	const { lang, "place-name": placeName } = await params
	const dictionary = await getDictionary(lang)

	const placeData = await getPlaceData(placeName)

	if (!placeData) {
		notFound()
	}

	return <PlaceDetails place={placeData.place} properties={placeData.properties} dictionary={dictionary} lang={lang} />
}

// Generate metadata for the page
export async function generateMetadata({ params }: { params: Promise<Params> }) {
	const { "place-name": placeName, lang } = await params
	const dictionary = await getDictionary(lang)
	const placeData = await getPlaceData(placeName)

	if (!placeData) {
		return {
			title: dictionary.placeDetails?.metadata.placeNotFound,
			description: dictionary.placeDetails?.metadata.placeNotFoundDescription,
		}
	}

	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mscapartments.pl"
	const currentUrl = `${baseUrl}/${lang}/place/${generateSlug(placeData.place.name)}`

	const title = dictionary.placeDetails?.metadata.title.replace("{{placeName}}", placeData.place.name)
	const description = dictionary.placeDetails?.metadata.description
		.replace("{{placeName}}", placeData.place.name)
		.replace("{{location}}", placeData.place.location)
		.replace("{{count}}", placeData.properties.length.toString())

	const keywords = dictionary.placeDetails?.metadata.keywords
		.map((keyword) => keyword.replace("{{placeName}}", placeData.place.name).replace("{{location}}", placeData.place.location))
		.join(", ")

	return {
		title,
		description,
		keywords,
		author: "MSC Apartments - created by Mariusz Sidorowicz, cyberwealth.pro",
		creator: "MSC Apartments",
		publisher: "MSC Apartments",
		metadataBase: new URL(baseUrl),
		alternates: {
			canonical: currentUrl,
		},
		openGraph: {
			title,
			description,
			url: currentUrl,
			siteName: "MSC Apartments",
			images: [
				{
					url: `${baseUrl}/images/apartment-building-default.jpg`,
					width: 1200,
					height: 630,
					alt: `${placeData.place.name} - MSC Apartments`,
				},
			],
			locale: lang,
			type: "website",
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: [`${baseUrl}/images/apartment-building-default.jpg`],
		},
		robots: {
			index: true,
			follow: true,
			googleBot: {
				index: true,
				follow: true,
				"max-video-preview": -1,
				"max-image-preview": "large",
				"max-snippet": -1,
			},
		},
	}
}
