/** @format */

/** @type {import('next-sitemap').IConfig} */
module.exports = {
	siteUrl: process.env.NEXT_PUBLIC_BASE_URL || "https://mountainapartments.pl",
	generateRobotsTxt: true,
	generateIndexSitemap: true,

	// Multi-language configuration
	locales: ["en", "pl", "de", "es"],
	defaultLocale: "pl",

	// Transform function to handle [lang] routes
	transform: async (config, path) => {
		// Extract locale from path
		const localeMatch = path.match(/^\/([a-z]{2})\//)
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
			const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mountainapartments.pl"
			const response = await fetch(`${baseUrl}/api/properties/mountain?userId=clok0rd6f0000kkdgyf1pd0t3`)
			const data = await response.json()

			if (data.properties) {
				const locales = ["en", "pl", "de", "es"]

				data.properties.forEach((property) => {
					locales.forEach((locale) => {
						let slug = null
						if (property.slugs && typeof property.slugs === "object") {
							slug = property.slugs[locale] || null
						}
						if (!slug && property.name) {
							// Generate slug from name if not available
							slug = property.name
								.toLowerCase()
								.replace(/[^a-z0-9\s-]/g, "")
								.replace(/\s+/g, "-")
								.replace(/-+/g, "-")
						}

						if (slug) {
							result.push({
								loc: `/${locale}/apartamenty/${slug}`,
								changefreq: "weekly",
								priority: 0.9,
								lastmod: new Date().toISOString(),
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
		additionalSitemaps: [`${process.env.NEXT_PUBLIC_BASE_URL || "https://mountainapartments.pl"}/server-sitemap.xml`],
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
	const locales = ["en", "pl", "de", "es"]
	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mountainapartments.pl"

	// Remove current locale prefix to get the base path
	const basePath = path.replace(new RegExp(`^/${currentLocale}`), "") || "/"

	return locales.map((locale) => ({
		href: `${baseUrl}/${locale}${basePath}`,
		hreflang: locale,
	}))
}
