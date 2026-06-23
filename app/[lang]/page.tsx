/** @format */

import type { Metadata } from "next"
import { getDictionary } from "../dictionaries"
import { Locale } from "../i18n-config"
import HomepagePageClient from "./homepage/HomepagePageClient"
import { Suspense } from "react"

type PageProps = {
	params: Promise<{ lang: Locale }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { lang } = await params
	const dictionary = await getDictionary(lang)

	// Add safety checks for dictionary properties
	const title = dictionary?.title || "MSC Apartments"
	const description = dictionary?.description || "Comfortable mountain accommodation"
	const keywords = dictionary?.keywords || []

	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mscapartments.pl"
	const currentUrl = `${baseUrl}/${lang}` // Changed from /homepage to root
	return {
		title,
		description,
		keywords: Array.isArray(keywords) ? keywords.join(", ") : "",
		authors: [
			{
				name: "MSC Apartments",
				url: "https://mscapartments.pl",
			},
			{
				name: "Mariusz Sidorowicz",
				url: "https://cyberwealth.pro",
			},
		],
		creator: "MSC Apartments",
		publisher: "MSC Apartments",
		formatDetection: {
			email: false,
			address: false,
			telephone: false,
		},
		metadataBase: new URL(baseUrl),
		alternates: {
			canonical: currentUrl,
			languages: {
				en: `${baseUrl}/en`,
				pl: `${baseUrl}/pl`,
				de: `${baseUrl}/de`,
				es: `${baseUrl}/es`,
			},
		},
		openGraph: {
			title,
			description,
			url: currentUrl,
			siteName: "MSC Apartments",
			images: [
				{
					url: `${baseUrl}/images/bg.webp`,
					width: 1200,
					height: 630,
					alt: "MSC Apartments - Comfortable Mountain Accommodation",
				},
			],
			locale: lang,
			type: "website",
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: [`${baseUrl}/images/bg.webp`],
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

export default async function HomePage({ params }: PageProps) {
	const { lang } = await params
	const dictionary = await getDictionary(lang)

	return (
		<Suspense fallback={<div>Wczytywanie...</div>}>
			<HomepagePageClient dictionary={dictionary} lang={lang} />
		</Suspense>
	)
}
