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
	const currentUrl = `${baseUrl}/${lang}/apartamenty-koscielisko`
	const pageText = getApartamentyPageText(lang, "koscielisko")

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
				en: `${baseUrl}/en/apartamenty-koscielisko`,
				pl: `${baseUrl}/pl/apartamenty-koscielisko`,
				it: `${baseUrl}/it/apartamenty-koscielisko`,
				"x-default": `${baseUrl}/pl/apartamenty-koscielisko`,
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
					alt: "Apartamenty w Kościelisku - MSC Apartments",
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

export default async function ApartamentyKoscieliskoPage({ params, searchParams }: PageProps) {
	const { lang } = await params
	const dictionary = await getDictionary(lang)
	const searchParamsResolved = await searchParams
	const dateRange = typeof searchParamsResolved.dateRange === "string" ? searchParamsResolved.dateRange : null

	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mscapartments.pl"
	const currentUrl = `${baseUrl}/${lang}/apartamenty-koscielisko`
	const jsonLd = getApartamentyJsonLd(lang, "koscielisko", baseUrl, currentUrl)

	return (
		<>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} suppressHydrationWarning />
			<ApartamentyPageClient dictionary={dictionary} lang={lang} dateRange={dateRange} initialLocation="koscielisko" />
		</>
	)
}
