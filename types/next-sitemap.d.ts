/** @format */

// next-sitemap ships types under dist/@types but its package.json "exports" map
// doesn't expose them to TypeScript under moduleResolution "bundler". Declare the
// bits we use so type-checking (and `next build`) resolves cleanly.
declare module "next-sitemap" {
	export interface ISitemapField {
		loc: string
		lastmod?: string
		changefreq?: string
		priority?: number
		alternateRefs?: Array<{ hreflang: string; href: string }>
	}

	export function getServerSideSitemap(fields: ISitemapField[]): Response
	export function getServerSideSitemapIndex(fields: Array<{ loc: string; lastmod?: string }>): Response
}
