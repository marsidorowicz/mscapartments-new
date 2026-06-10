/** @format */

import { notFound, redirect } from "next/navigation"
import { getDictionary } from "../../../dictionaries"
import { generateSlug } from "@/utilities/functions/propertyUrl"
import { Locale } from "../../../i18n-config"
import ApartmentSchema from "../../../../components/ApartmentSchema"
import PropertyDetails from "../../property/room/[id]/components/PropertyDetails"

// Force dynamic rendering since this page fetches data that can't be statically generated
export const dynamic = "force-dynamic"

type Params = {
	lang: Locale
	slug: string
}

// Fetch property data by slug
async function getPropertyBySlug(slug: string, lang: string) {
	try {
		const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mountainapartments.pl"
		const response = await fetch(`${baseUrl}/api/properties/by-slug/${lang}/${slug}`, {
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
	const { lang, slug } = await params
	const dictionary = await getDictionary(lang)

	const property = await getPropertyBySlug(slug, lang)

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
	if (expectedSlug && slug !== expectedSlug) {
		redirect(`/${lang}/apartamenty/${expectedSlug}`)
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
	const { slug, lang } = await params
	const property = await getPropertyBySlug(slug, lang)

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
	const currentUrl = `${baseUrl}/${lang}/apartamenty/${expectedSlug || slug}`

	const title = property.name || "Property"
	const description = property.htmlDetails
		? property.htmlDetails.replace(/<[^>]*>/g, "").substring(0, 160)
		: `Book ${property.name} in ${property.place?.name}`

	return {
		title: `${title} - Mountain Apartments`,
		description,
		openGraph: {
			title: `${title} - Mountain Apartments`,
			description,
			url: currentUrl,
			images: property.images?.length > 0 ? [{ url: property.images[0].path }] : [],
			type: "website",
		},
		twitter: {
			card: "summary_large_image",
			title: `${title} - Mountain Apartments`,
			description,
			images: property.images?.length > 0 ? [property.images[0].path] : [],
		},
		alternates: {
			canonical: currentUrl,
		},
	}
}
