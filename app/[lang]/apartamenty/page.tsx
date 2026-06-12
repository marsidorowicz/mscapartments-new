/** @format */

import type { Metadata } from "next"
import { getDictionary } from "../../dictionaries"
import { Locale } from "../../i18n-config"
import ApartamentyPageClient from "./ApartamentyPageClient"
import { getApartamentyPageText } from "./seo"

type PageProps = {
	params: Promise<{ lang: Locale }>
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { lang } = await params
	const dictionary = await getDictionary(lang)

	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mscapartments.pl"
	const currentUrl = `${baseUrl}/${lang}/apartamenty`
	const pageText = getApartamentyPageText(lang)

	return {
		title: `${pageText.title} - ${dictionary.title}`,
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
				en: `${baseUrl}/en/apartamenty`,
				pl: `${baseUrl}/pl/apartamenty`,
				de: `${baseUrl}/de/apartamenty`,
				es: `${baseUrl}/es/apartamenty`,
			},
		},
	}
}

export default async function ApartamentyPage({ params, searchParams }: PageProps) {
	const { lang } = await params
	const dictionary = await getDictionary(lang)
	const searchParamsResolved = await searchParams
	const dateRange = typeof searchParamsResolved.dateRange === "string" ? searchParamsResolved.dateRange : null

	return <ApartamentyPageClient dictionary={dictionary} lang={lang} dateRange={dateRange} />
}
