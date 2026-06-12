/** @format */

import { getDictionary } from "../../dictionaries"
import { Locale } from "../../i18n-config"
import HousesPageClient from "./HousesPageClient"
import { Property } from "@/types"

// Force dynamic rendering since this page fetches data that can't be statically generated
export const dynamic = "force-dynamic"

type Params = {
	lang: Locale
}

// Fetch properties and filter to show only those with names in ["RAGGI", "TEST"]
async function getHousesData() {
	try {
		const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mscapartments.pl"
		const response = await fetch(`${baseUrl}/api/properties/mountain?userId=clok0rd6f0000kkdgyf1pd0t3`, {
			cache: "no-store",
		})

		if (!response.ok) {
			throw new Error("Failed to fetch properties")
		}

		const data = await response.json()
		const allProperties = data.properties || []

		// Filter properties to only those with names in ["BYSTRY", "KRYWAŃ"] (case-insensitive)
		const filteredProperties = allProperties.filter((property: Property) =>
			["BYSTRY", "KRYWAŃ"].some((filterName) => property.name.toUpperCase() === filterName.toUpperCase()),
		)

		return filteredProperties
	} catch (error) {
		console.error("Error fetching houses data:", error)
		return []
	}
}

export default async function HousesPage({ params }: { params: Promise<Params> }) {
	const { lang } = await params
	const dictionary = await getDictionary(lang)
	const properties = await getHousesData()

	return <HousesPageClient properties={properties} dictionary={dictionary} lang={lang} />
}

// Generate metadata for the page
export async function generateMetadata({ params }: { params: Promise<Params> }) {
	const { lang } = await params
	const dictionary = await getDictionary(lang)

	const title = dictionary.navigation?.houses || "Houses"
	const description = `Discover our beautiful houses in the mountains`

	return {
		title: `${title} - MSC Apartments`,
		description,
	}
}
