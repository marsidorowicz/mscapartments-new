/** @format */

import { redirect } from "next/navigation"
import { generateSlug } from "@/utilities/functions/propertyUrl"

// Force dynamic rendering since this page fetches data that can't be statically generated
export const dynamic = "force-dynamic"

type Params = {
	lang: string
	id: string
}

// Fetch property data
async function getProperty(id: string) {
	try {
		const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mscapartments.pl"
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
	const { lang, id } = await params

	const property = await getProperty(id)

	if (!property) {
		redirect("/")
	}

	// Get the correct slug for this language
	let slug: string | null = null
	if (property.slugs && typeof property.slugs === "object") {
		slug = property.slugs[lang as keyof typeof property.slugs] || null
	}

	// If no slug exists in database, generate one from property name
	if (!slug && property.name) {
		slug = generateSlug(property.name)
	}

	// Redirect to the new URL format with slug
	redirect(`/${lang}/property/${id}${slug ? `-${slug}` : ""}`)
}
