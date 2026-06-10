/** @format */

import { getServerSideSitemap } from "next-sitemap"
import { PrismaClient } from "@prisma/client"
import { generateSlug } from "@/utilities/functions/propertyUrl"

export async function GET() {
	const prisma = new PrismaClient()

	try {
		// Fetch all active properties from database
		const properties = await prisma.property.findMany({
			where: {
				state: "active",
				brand: "MOUNTAIN",
				id: { not: 53 }, // Exclude property 53
			},
			select: {
				id: true,
				name: true,
				slugs: true,
			},
		})

		const baseUrl =
			process.env.NEXT_PUBLIC_BASE_URL || "https://mountainapartments.pl"
		const locales = ["en", "pl", "de", "es"]

		const fields = []

		// Generate sitemap entries for each property in each language
		for (const property of properties) {
			for (const locale of locales) {
				let slug = ""

				// Try to get language-specific slug, fallback to generated slug
				if (
					property.slugs &&
					typeof property.slugs === "object" &&
					!Array.isArray(property.slugs) &&
					locale in property.slugs
				) {
					slug = (property.slugs as Record<string, string>)[locale]
				} else {
					// Generate slug from property name if not available
					slug = generateSlug(property.name)
				}

				const url = `${baseUrl}/${locale}/property/${property.id}${
					slug ? `-${slug}` : ""
				}`

				fields.push({
					loc: url,
					lastmod: new Date().toISOString(),
					changefreq: "weekly" as const,
					priority: 0.9,
				})
			}
		}

		return getServerSideSitemap(fields)
	} catch (error) {
		console.error("Error generating server sitemap:", error)

		// Return empty sitemap on error
		return getServerSideSitemap([])
	} finally {
		await prisma.$disconnect()
	}
}
