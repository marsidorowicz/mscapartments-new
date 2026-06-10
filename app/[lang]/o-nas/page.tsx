/** @format */

import { getDictionary } from "../../dictionaries"
import AboutUsPageClient from "./AboutUsPageClient"
import type { Metadata } from "next"
import type { Locale } from "../../i18n-config"

interface AboutUsPageProps {
	params: Promise<{
		lang: string
	}>
}

export async function generateMetadata({ params }: AboutUsPageProps): Promise<Metadata> {
	const { lang } = await params
	const dictionary = await getDictionary(lang)

	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mountainapartments.pl"
	const currentUrl = `${baseUrl}/${lang}/o-nas`

	return {
		title: `${dictionary.navigation.aboutUs} - ${dictionary.title}`,
		description:
			"Poznaj Mountain Apartments - ponad 10 lat doświadczenia w zarządzaniu apartamentami w sercu Tatr. Profesjonalna obsługa, komfortowe apartamenty i niezapomniane doświadczenia.",
		keywords: [dictionary.navigation.aboutUs, "Mountain Apartments", "o nas", "historia", "doświadczenie", "Tatry", "Zakopane"].join(", "),
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
				en: `${baseUrl}/en/o-nas`,
				pl: `${baseUrl}/pl/o-nas`,
				de: `${baseUrl}/de/o-nas`,
				es: `${baseUrl}/es/o-nas`,
			},
		},
		openGraph: {
			title: `${dictionary.navigation.aboutUs} - ${dictionary.title}`,
			description:
				"Poznaj Mountain Apartments - ponad 10 lat doświadczenia w zarządzaniu apartamentami w sercu Tatr. Profesjonalna obsługa, komfortowe apartamenty i niezapomniane doświadczenia.",
			url: currentUrl,
			siteName: "Mountain Apartments",
			images: [
				{
					url: `${baseUrl}/images/about-us.jpg`,
					width: 1200,
					height: 630,
					alt: "About Mountain Apartments",
				},
			],
			locale: lang,
			type: "website",
		},
		twitter: {
			card: "summary_large_image",
			title: `${dictionary.navigation.aboutUs} - ${dictionary.title}`,
			description:
				"Poznaj Mountain Apartments - ponad 10 lat doświadczenia w zarządzaniu apartamentami w sercu Tatr. Profesjonalna obsługa, komfortowe apartamenty i niezapomniane doświadczenia.",
			images: [`${baseUrl}/images/about-us.jpg`],
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

export default async function AboutUsPage({ params }: AboutUsPageProps) {
	const { lang } = await params
	const dictionary = await getDictionary(lang)

	return <AboutUsPageClient dictionary={dictionary} lang={lang as Locale} />
}
