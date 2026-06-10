/** @format */

import { Locale } from "@/app/i18n-config"
import { getDictionary } from "../../dictionaries"
import OffersPageServer from "./OffersPageServer"
import type { Metadata } from "next"

interface OffersPageProps {
	params: Promise<{
		lang: Locale
	}>
}

export async function generateMetadata({ params }: OffersPageProps): Promise<Metadata> {
	const { lang } = await params
	const dictionary = await getDictionary(lang)

	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mountainapartments.pl"
	const currentUrl = `${baseUrl}/${lang}/offers`

	return {
		title: `${dictionary.navigation.offers} - ${dictionary.title}`,
		description: dictionary.offersPage?.subtitle || "Discover our special offers and exclusive promotions for mountain accommodation",
		keywords: [dictionary.navigation.offers, "special offers", "promotions", "mountain accommodation", "discounts", "Zakopane", "Kościelisko"].join(", "),
		authors: [
			{
				name: "Mountain Apartments",
				url: "https://mountainapartments.pl",
			},
		],
		creator: "Mountain Apartments",
		publisher: "Mountain Apartments",
		metadataBase: new URL(baseUrl),
		alternates: {
			canonical: currentUrl,
			languages: {
				en: `${baseUrl}/en/offers`,
				pl: `${baseUrl}/pl/offers`,
				de: `${baseUrl}/de/offers`,
				es: `${baseUrl}/es/offers`,
			},
		},
		openGraph: {
			title: `${dictionary.navigation.offers} - ${dictionary.title}`,
			description: dictionary.offersPage?.subtitle || "Discover our special offers and exclusive promotions for mountain accommodation",
			url: currentUrl,
			siteName: "Mountain Apartments",
			images: [
				{
					url: `${baseUrl}/images/special-offers.jpg`,
					width: 1200,
					height: 630,
					alt: `${dictionary.navigation.offers} - Mountain Apartments`,
				},
			],
			locale: lang,
			type: "website",
		},
		twitter: {
			card: "summary_large_image",
			title: `${dictionary.navigation.offers} - ${dictionary.title}`,
			description: dictionary.offersPage?.subtitle || "Discover our special offers and exclusive promotions for mountain accommodation",
			images: [`${baseUrl}/images/special-offers.jpg`],
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

export default async function OffersPage({ params }: OffersPageProps) {
	const { lang } = await params
	const dictionary = await getDictionary(lang)

	return <OffersPageServer dictionary={dictionary} lang={lang} />
}
