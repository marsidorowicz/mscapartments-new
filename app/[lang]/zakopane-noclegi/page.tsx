/** @format */

import { Locale } from "@/app/i18n-config"
import { getDictionary } from "../../dictionaries"
import ZakopaneRoomsClient from "./ZakopaneRoomsClient"
import type { Metadata } from "next"

interface ZakopaneRoomsPageProps {
	params: Promise<{
		lang: Locale
	}>
}

export async function generateMetadata({ params }: ZakopaneRoomsPageProps): Promise<Metadata> {
	const { lang } = await params
	const dictionary = await getDictionary(lang)

	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mountainapartments.pl"
	const currentUrl = `${baseUrl}/${lang}/zakopane-noclegi`

	return {
		title: `${dictionary.zakopaneRooms?.title || "Zakopane Noclegi"} - ${dictionary.title}`,
		description: dictionary.zakopaneRooms?.heroSubtitle || "Comfortable accommodation in the heart of the Tatra Mountains",
		keywords: ["Zakopane", "noclegi", "apartamenty", "Tatry", "góry", "wypoczynek", "zakwaterowanie", "Kościelisko", "Tatry"].join(", "),
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
				en: `${baseUrl}/en/zakopane-noclegi`,
				pl: `${baseUrl}/pl/zakopane-noclegi`,
				de: `${baseUrl}/de/zakopane-noclegi`,
				es: `${baseUrl}/es/zakopane-noclegi`,
			},
		},
		openGraph: {
			title: `${dictionary.zakopaneRooms?.title || "Zakopane Noclegi"} - ${dictionary.title}`,
			description: dictionary.zakopaneRooms?.heroSubtitle || "Comfortable accommodation in the heart of the Tatra Mountains",
			url: currentUrl,
			siteName: "Mountain Apartments",
			images: [
				{
					url: `${baseUrl}/images/zakopane-rooms-hero.jpg`,
					width: 1200,
					height: 630,
					alt: "Zakopane accommodation - Mountain Apartments",
				},
			],
			locale: lang,
			type: "website",
		},
		twitter: {
			card: "summary_large_image",
			title: `${dictionary.zakopaneRooms?.title || "Zakopane Noclegi"} - ${dictionary.title}`,
			description: dictionary.zakopaneRooms?.heroSubtitle || "Comfortable accommodation in the heart of the Tatra Mountains",
			images: [`${baseUrl}/images/zakopane-rooms-hero.jpg`],
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

export default async function ZakopaneRoomsPage({ params }: ZakopaneRoomsPageProps) {
	const { lang } = await params
	const dictionary = await getDictionary(lang)

	return <ZakopaneRoomsClient dictionary={dictionary} lang={lang} />
}
