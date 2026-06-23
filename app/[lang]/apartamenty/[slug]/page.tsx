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

type SearchParams = {
	[id: string]: string | string[] | undefined
}

async function fetchPropertyById(id: string) {
	try {
		const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mscapartments.pl"
		const response = await fetch(`${baseUrl}/api/properties/mountain/${id}`, {
			cache: "no-store",
		})

		if (!response.ok) {
			return null
		}

		const data = await response.json()
		return data.property || null
	} catch (error) {
		console.error("Error fetching property by id:", error)
		return null
	}
}

async function fetchPropertyBySlug(slug: string, lang: string) {
	try {
		const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mscapartments.pl"
		const response = await fetch(`${baseUrl}/api/properties/by-slug/${lang}/${slug}`, {
			cache: "no-store",
		})

		if (!response.ok) {
			return null
		}

		const data = await response.json()
		return data.property || null
	} catch (error) {
		console.error("Error fetching property by slug:", error)
		return null
	}
}

function getNumericId(searchParams: SearchParams) {
	const idValue = searchParams.id
	if (typeof idValue === "string" && /^[0-9]+$/.test(idValue)) {
		return idValue
	}
	return null
}

async function getProperty(slug: string, lang: string, searchParams: SearchParams) {
	const id = getNumericId(searchParams)

	if (id) {
		const propertyById = await fetchPropertyById(id)
		if (propertyById) {
			return propertyById
		}
	}

	if (/^[0-9]+$/.test(slug)) {
		const propertyById = await fetchPropertyById(slug)
		if (propertyById) {
			return propertyById
		}
	}

	return await fetchPropertyBySlug(slug, lang)
}

export default async function PropertyPage({ params, searchParams }: { params: Promise<Params>; searchParams: Promise<SearchParams> }) {
	const { lang, slug } = await params
	const searchParamsResolved = await searchParams
	const dictionary = await getDictionary(lang)

	const property = await getProperty(slug, lang, searchParamsResolved)

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
		const query = new URLSearchParams()
		Object.entries(searchParamsResolved).forEach(([key, value]) => {
			if (typeof value === "string") {
				query.set(key, value)
			} else if (Array.isArray(value)) {
				value.forEach((item) => query.append(key, item))
			}
		})
		const queryString = query.toString()
		redirect(`/${lang}/apartamenty/${expectedSlug}${queryString ? `?${queryString}` : ""}`)
	}

	return (
		<>
			<ApartmentSchema property={property} lang={lang} />
			<PropertyDetails property={property} dictionary={dictionary} lang={lang} />
		</>
	)
}

// Generate metadata for the page
export async function generateMetadata({ params, searchParams }: { params: Promise<Params>; searchParams: Promise<SearchParams> }) {
	const { slug, lang } = await params
	const searchParamsResolved = await searchParams
	const property = await getProperty(slug, lang, searchParamsResolved)

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

	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mscapartments.pl"
	const currentUrl = `${baseUrl}/${lang}/apartamenty/${expectedSlug || slug}`

	const title = property.name || "Property"
	const description = property.htmlDetails
		? property.htmlDetails.replace(/<[^>]*>/g, "").substring(0, 160)
		: `Book ${property.name} in ${property.place?.name}`

	return {
		title: `${title} - MSC Apartments`,
		description,
		openGraph: {
			title: `${title} - MSC Apartments`,
			description,
			url: currentUrl,
			images: property.images?.length > 0 ? [{ url: property.images[0].path }] : [],
			type: "website",
		},
		twitter: {
			card: "summary_large_image",
			title: `${title} - MSC Apartments`,
			description,
			images: property.images?.length > 0 ? [property.images[0].path] : [],
		},
		alternates: {
			canonical: currentUrl,
		},
	}
}
