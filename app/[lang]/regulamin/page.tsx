/** @format */

import { getDictionary } from "../../dictionaries"
import { Locale } from "../../i18n-config"
import RegulaminPageClient from "./RegulaminPageClient"
import type { Metadata } from "next"

type PageProps = {
	params: Promise<{ lang: Locale }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { lang } = await params
	const dictionary = await getDictionary(lang)

	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mountainapartments.pl"
	const currentUrl = `${baseUrl}/${lang}/regulamin`

	return {
		title: `${dictionary.navigation.regulamin} - ${dictionary.title}`,
		description: "Regulamin Mountain Apartments - przeczytaj warunki rezerwacji, płatności i pobytu w naszych apartamentach w Zakopanem i Kościelisku.",
		keywords: [dictionary.navigation.regulamin, "Mountain Apartments", "regulamin", "warunki rezerwacji", "płatności", "pobyt"].join(", "),
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
				en: `${baseUrl}/en/regulamin`,
				pl: `${baseUrl}/pl/regulamin`,
				de: `${baseUrl}/de/regulamin`,
				es: `${baseUrl}/es/regulamin`,
			},
		},
		openGraph: {
			title: `${dictionary.navigation.regulamin} - ${dictionary.title}`,
			description: "Regulamin Mountain Apartments - przeczytaj warunki rezerwacji, płatności i pobytu w naszych apartamentach w Zakopanem i Kościelisku.",
			url: currentUrl,
			siteName: "Mountain Apartments",
			images: [
				{
					url: `${baseUrl}/images/terms-conditions.jpg`,
					width: 1200,
					height: 630,
					alt: "Terms and Conditions - Mountain Apartments",
				},
			],
			locale: lang,
			type: "website",
		},
		twitter: {
			card: "summary_large_image",
			title: `${dictionary.navigation.regulamin} - ${dictionary.title}`,
			description: "Regulamin Mountain Apartments - przeczytaj warunki rezerwacji, płatności i pobytu w naszych apartamentach w Zakopanem i Kościelisku.",
			images: [`${baseUrl}/images/terms-conditions.jpg`],
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

export default async function RegulaminPage({ params }: PageProps) {
	const { lang } = await params
	const dictionary = await getDictionary(lang)

	return <RegulaminPageClient dictionary={dictionary} lang={lang} />
}
