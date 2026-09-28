/** @format */

/** @type {import('next-sitemap').IConfig} */
module.exports = {
	siteUrl: process.env.NEXT_PUBLIC_BASE_URL || "https://mscapartments.pl",
	generateRobotsTxt: true,
	generateIndexSitemap: true,

	// Multi-language configuration
	locales: ["en", "pl", "it"],
	defaultLocale: "pl",

	// Transform function to handle [lang] routes
	transform: async (config, path) => {
		// Extract locale from path
		const localeMatch = path.match(/^\/([a-z]{2})(?:\/|$)/)
		const locale = localeMatch ? localeMatch[1] : "pl"

		// Skip API routes and internal paths
		if (path.includes("/api/") || path.includes("/_next/") || path.includes("/admin/")) {
			return null
		}

		return {
			loc: path,
			changefreq: config.changefreq,
			priority: getPriority(path, locale),
			lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
			alternateRefs: getAlternateRefs(path, locale),
		}
	},

	// Additional paths to include
	additionalPaths: async () => {
		const result = []

		try {
			// Fetch properties to generate sitemap URLs
			const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mscapartments.pl"
			const response = await fetch(`${baseUrl}/api/properties/mountain?userId=clok0rd6f0000kkdgyf1pd0t3`)
			const data = await response.json()

			if (data.properties) {
				const locales = ["en", "pl", "it"]

				data.properties.forEach((property) => {
					// Resolve the slug for every locale (fallback to generated slug from name)
					const slugByLocale = {}
					locales.forEach((locale) => {
						let slug = null
						if (property.slugs && typeof property.slugs === "object") {
							slug = property.slugs[locale] || null
						}
						if (!slug && property.name) {
							// Generate slug from name using the same logic as the app,
							// so sitemap/hreflang URLs point to the final (non-redirecting) address
							slug = generateSlug(property.name)
						}
						slugByLocale[locale] = slug
					})

					// Build absolute hreflang references for this apartment
					const alternateRefs = locales
						.filter((locale) => slugByLocale[locale])
						.map((locale) => ({
							href: `${baseUrl}/${locale}/apartamenty/${slugByLocale[locale]}`,
							hreflang: locale,
							hrefIsAbsolute: true,
						}))
					if (slugByLocale.pl) {
						alternateRefs.push({
							href: `${baseUrl}/pl/apartamenty/${slugByLocale.pl}`,
							hreflang: "x-default",
							hrefIsAbsolute: true,
						})
					}

					locales.forEach((locale) => {
						const slug = slugByLocale[locale]
						if (slug) {
							result.push({
								loc: `/${locale}/apartamenty/${slug}`,
								changefreq: "weekly",
								priority: 0.9,
								lastmod: new Date().toISOString(),
								alternateRefs,
							})
						}
					})
				})
			}
		} catch (error) {
			console.error("Error fetching properties for sitemap:", error)
		}

		return result
	},

	// Exclude certain patterns
	exclude: ["/api/*", "/admin/*", "/_next/*", "/404", "/500", "/login*", "/payment-*", "/reservation/*", "/property/*"],

	// Robots.txt configuration
	robotsTxtOptions: {
		policies: [
			{
				userAgent: "*",
				allow: "/",
				disallow: ["/api/", "/admin/", "/_next/", "/login"],
			},
		],
		additionalSitemaps: [`${process.env.NEXT_PUBLIC_BASE_URL || "https://mscapartments.pl"}/server-sitemap.xml`],
	},
}

/**
 * Get priority based on path and locale
 */
function getPriority(path, locale) {
	// Homepage gets highest priority
	if (path === `/${locale}` || path === `/${locale}/`) {
		return 1.0
	}

	// Property pages get high priority
	if (path.includes(`/${locale}/apartamenty/`)) {
		return 0.9
	}

	// Other pages get medium priority
	if (path.includes(`/${locale}/`)) {
		return 0.7
	}

	return 0.5
}

/**
 * Generate alternate language references
 */
function getAlternateRefs(path, currentLocale) {
	const locales = ["en", "pl", "it"]
	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mscapartments.pl"

	// Remove current locale prefix to get the base path (handles "/xx" and "/xx/...")
	let suffix = path.replace(new RegExp(`^/${currentLocale}(?=/|$)`), "")
	if (suffix === "/") suffix = ""

	const refs = locales.map((locale) => ({
		href: `${baseUrl}/${locale}${suffix}`,
		hreflang: locale,
		hrefIsAbsolute: true,
	}))

	// Default language fallback for search engines
	refs.push({
		href: `${baseUrl}/pl${suffix}`,
		hreflang: "x-default",
		hrefIsAbsolute: true,
	})

	return refs
}

/**
 * Generates a URL-friendly slug from text.
 * Kept identical to `utilities/functions/propertyUrl.ts` (generateSlug)
 * so sitemap URLs match the addresses served by the app.
 */
function generateSlug(text) {
	const polishChars = {
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
