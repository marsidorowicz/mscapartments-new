/** @format */

/**
 * Generates a URL-friendly slug from text
 */
export function generateSlug(text: string): string {
	// Polish character mapping
	const polishChars: Record<string, string> = {
		ą: "a",
		ć: "c",
		ę: "e",
		ł: "l",
		ń: "n",
		ó: "o",
		ś: "s",
		ź: "z",
		ż: "z",
		Ą: "a",
		Ć: "c",
		Ę: "e",
		Ł: "l",
		Ń: "n",
		Ó: "o",
		Ś: "s",
		Ź: "z",
		Ż: "z",
	}

	return text
		.toLowerCase()
		.split("")
		.map((char) => polishChars[char] || char)
		.join("")
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9\s-]/g, "")
		.trim()
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
}

/**
 * Builds a property URL with language-specific slug
 * @param propertyId - The property ID
 * @param propertyName - The property name (fallback if slugs not available)
 * @param lang - The current language
 * @param slugs - Optional slugs object from property.slugs
 * @returns The formatted URL path
 */
export function buildPropertyUrl(propertyId: number | string, propertyName: string, lang: string, slugs?: Record<string, string> | null): string {
	let slug: string | null = null

	// Try to get slug from the slugs object
	if (slugs && typeof slugs === "object") {
		slug = slugs[lang] || null
	}

	// Fallback: generate slug from property name
	if (!slug && propertyName) {
		slug = generateSlug(propertyName)
	}

	// Return URL with or without slug and append propertyId query
	const query = `?id=${encodeURIComponent(propertyId.toString())}`
	if (slug) {
		return `/${lang}/apartamenty/${slug}${query}`
	}
	return `/${lang}/apartamenty/${propertyId}${query}`
}

/**
 * Extracts the property ID from an id-slug parameter
 */
export function extractIdFromSlug(idSlug: string): string {
	const match = idSlug.match(/^(\d+)/)
	return match ? match[1] : idSlug
}

/**
 * Extracts the slug portion from an id-slug parameter
 */
export function extractSlug(idSlug: string): string | null {
	const match = idSlug.match(/^\d+-(.+)$/)
	return match ? match[1] : null
}
