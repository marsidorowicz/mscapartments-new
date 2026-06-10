/** @format */

import { notFound, redirect } from "next/navigation"
import { getDictionary } from "../../../dictionaries"
import PropertyDetails from "../room/[id]/components/PropertyDetails"
import { extractIdFromSlug, extractSlug, generateSlug } from "@/utilities/functions/propertyUrl"
import { Locale } from "../../../i18n-config"
import ApartmentSchema from "../../../../components/ApartmentSchema"

// Force dynamic rendering since this page fetches data that can't be statically generated
export const dynamic = "force-dynamic"

type Params = {
	lang: Locale
	"id-slug": string
}

// Fetch property data
async function getProperty(id: string) {
	try {
		const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mountainapartments.pl"
		const response = await fetch(`${baseUrl}/api/properties/mountain/${id}?userId=clok0rd6f0000kkdgyf1pd0t3`, {
			cache: "no-store",
		})

		if (!response.ok) {
			throw new Error("Failed to fetch property")
		}

		const data = await response.json()
		return data.property || null
	} catch (error) {
		console.error("Error fetching property:", error)
		return null
	}
}

export default async function PropertyPage({ params }: { params: Promise<Params> }) {
	const { lang, "id-slug": idSlug } = await params
	const dictionary = await getDictionary(lang)

	const id = extractIdFromSlug(idSlug)
	const currentSlug = extractSlug(idSlug)

	const property = await getProperty(id)

	if (!property) {
		notFound()
	}

	// Get the correct slug for this language
	let expectedSlug: string | null = null
	if (property.slugs && typeof property.slugs === "object") {
		expectedSlug = property.slugs[lang as keyof typeof property.slugs] || null
	}

	// If no slug exists in database, generate one from property name
	if (!expectedSlug && property.name) {
		expectedSlug = generateSlug(property.name)
	}

	// Redirect to correct URL if slug is missing or incorrect
	if (expectedSlug && currentSlug !== expectedSlug) {
		redirect(`/${lang}/property/${id}-${expectedSlug}`)
	}

	return (
		<>
			<ApartmentSchema property={property} lang={lang} />
			<PropertyDetails property={property} dictionary={dictionary} lang={lang} />
		</>
	)
}

// Generate metadata for the page
export async function generateMetadata({ params }: { params: Promise<Params> }) {
	const { "id-slug": idSlug, lang } = await params
	const id = extractIdFromSlug(idSlug)
	const property = await getProperty(id)

	if (!property) {
		return {
			title: "Property Not Found",
			description: "The requested property could not be found.",
		}
	}

	// Get the correct slug for this language
	let expectedSlug: string | null = null
	if (property.slugs && typeof property.slugs === "object") {
		expectedSlug = property.slugs[lang as keyof typeof property.slugs] || null
	}

	// If no slug exists, generate one from property name
	if (!expectedSlug && property.name) {
		expectedSlug = generateSlug(property.name)
	}

	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mountainapartments.pl"
	const currentUrl = `${baseUrl}/${lang}/property/${id}${expectedSlug ? `-${expectedSlug}` : ""}`

	// Get localized title from property.extended.title if available
	let title: string
	if (property.extended && typeof property.extended === "object" && property.extended.title) {
		// Try to get title in current language
		if (property.extended.title[lang]) {
			title = property.extended.title[lang]
		}
		// Fallback to English if current language not available
		else if (property.extended.title.en) {
			title = property.extended.title.en
		}
		// Final fallback to default format
		else {
			title = `${property.name} - Mountain Apartments`
		}
	} else {
		// Fallback to default format if extended.title doesn't exist
		title = `${property.name} - Mountain Apartments`
	}

	let description = property.htmlDetails
		? property.htmlDetails.replace(/<[^>]*>/g, "").substring(0, 160)
		: `Beautiful ${property.type} in ${property.location} for ${property.maxOccupancy} guests`

	if (property.extended && typeof property.extended === "object" && property.extended.description) {
		// Try to get description in current language
		if (property.extended.description[lang]) {
			description = property.extended.description[lang]
		}
		// Fallback to Polish if current language not available
		else if (property.extended.description.pl) {
			description = property.extended.description.pl
		} else {
			description = description
		}
	}

	// Get localized keywords from property.extended.keywords if available
	let keywords: string
	if (property.extended && typeof property.extended === "object" && property.extended.keywords) {
		// Try to get keywords in current language
		if (property.extended.keywords[lang]) {
			keywords = property.extended.keywords[lang]
		}
		// Fallback to English if current language not available
		else if (property.extended.keywords.en) {
			keywords = property.extended.keywords.en
		}
		// Final fallback to default keywords
		else {
			keywords = [property.name, property.type, property.location, "mountain apartment", "Comfortable accommodation", "vacation rental"].join(", ")
		}
	} else {
		// Fallback to default keywords if extended.keywords doesn't exist
		keywords = [property.name, property.type, property.location, "mountain apartment", "Comfortable accommodation", "vacation rental"].join(", ")
	}

	// Build alternate language URLs with their respective slugs
	const alternateLanguages: Record<string, string> = {}
	const languages = ["en", "pl", "de", "es"]

	languages.forEach((language) => {
		let langSlug: string | null = null
		if (property.slugs && typeof property.slugs === "object") {
			langSlug = property.slugs[language as keyof typeof property.slugs] || null
		}
		if (!langSlug && property.name) {
			langSlug = generateSlug(property.name)
		}
		alternateLanguages[language] = `${baseUrl}/${language}/property/${id}${langSlug ? `-${langSlug}` : ""}`
	})

	return {
		title,
		description,
		keywords,
		author: "Mountain Apartments - created by Mariusz Sidorowicz, cyberwealth.pro",

		creator: "Mountain Apartments",
		publisher: "Mountain Apartments",
		metadataBase: new URL(baseUrl),
		alternates: {
			canonical: currentUrl,
			languages: alternateLanguages,
		},
		openGraph: {
			title,
			description,
			url: currentUrl,
			siteName: "Mountain Apartments",
			images:
				property.images && property.images.length > 0
					? [
							{
								url: `${baseUrl}${property.images[0]}`,
								width: 1200,
								height: 630,
								alt: `${property.name} - Mountain Apartments`,
							},
						]
					: [
							{
								url: `${baseUrl}/images/apartment-default-small.jpg`,
								width: 1200,
								height: 630,
								alt: `${property.name} - Mountain Apartments`,
							},
						],
			locale: lang,
			type: "website",
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: property.images && property.images.length > 0 ? [`${baseUrl}${property.images[0]}`] : [`${baseUrl}/images/apartment-default-small.jpg`],
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
