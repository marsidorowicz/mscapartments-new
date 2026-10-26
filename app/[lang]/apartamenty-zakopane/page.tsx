/** @format */

import type { Metadata } from "next"
import { getDictionary } from "../../dictionaries"
import { Locale } from "../../i18n-config"
import ApartamentyPageClient from "../apartamenty/ApartamentyPageClient"
import { getApartamentyPageText, getApartamentyJsonLd } from "../apartamenty/seo"

type PageProps = {
	params: Promise<{ lang: Locale }>
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { lang } = await params

	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mscapartments.pl"
	const currentUrl = `${baseUrl}/${lang}/apartamenty-zakopane`
	const pageText = getApartamentyPageText(lang, "zakopane")

	return {
		title: pageText.title,
		description: pageText.description,
		keywords: pageText.keywords.join(", "),
		authors: [
			{
				name: "MSC Apartments",
				url: "https://mscapartments.pl",
			},
		],
		creator: "MSC Apartments",
		publisher: "MSC Apartments",
		metadataBase: new URL(baseUrl),
		alternates: {
			canonical: currentUrl,
			languages: {
				en: `${baseUrl}/en/apartamenty-zakopane`,
				pl: `${baseUrl}/pl/apartamenty-zakopane`,
				it: `${baseUrl}/it/apartamenty-zakopane`,
				"x-default": `${baseUrl}/pl/apartamenty-zakopane`,
			},
		},
		openGraph: {
			title: pageText.title,
			description: pageText.description,
			url: currentUrl,
			siteName: "MSC Apartments",
			images: [
				{
					url: `${baseUrl}/images/tlo.jpg`,
					width: 1200,
					height: 630,
					alt: "Apartamenty w Zakopanem - MSC Apartments",
				},
			],
			locale: lang,
			type: "website",
		},
		twitter: {
			card: "summary_large_image",
			title: pageText.title,
			description: pageText.description,
			images: [`${baseUrl}/images/tlo.jpg`],
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

export default async function ApartamentyZakopanePage({ params, searchParams }: PageProps) {
	const { lang } = await params
	const dictionary = await getDictionary(lang)
	const searchParamsResolved = await searchParams
	const dateRange = typeof searchParamsResolved.dateRange === "string" ? searchParamsResolved.dateRange : null

	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mscapartments.pl"
	const currentUrl = `${baseUrl}/${lang}/apartamenty-zakopane`
	const jsonLd = getApartamentyJsonLd(lang, "zakopane", baseUrl, currentUrl)

	return (
		<>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} suppressHydrationWarning />
			<ApartamentyPageClient dictionary={dictionary} lang={lang} dateRange={dateRange} initialLocation="zakopane" />
		</>
	)
}