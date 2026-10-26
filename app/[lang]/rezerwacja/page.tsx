/** @format */

import type { Metadata } from "next"
import BasketPageClient from "./BasketPageClient"
import { getDictionary } from "../../dictionaries"
import { Locale } from "../../i18n-config"

type RezerwacjaProps = {
	params: Promise<{
		lang: Locale
	}>
}

export async function generateMetadata({ params }: RezerwacjaProps): Promise<Metadata> {
	const { lang } = await params
	const dictionary = await getDictionary(lang)

	return {
		title: `${dictionary.apartments?.basketTitle || "Rezerwacja"} | MSC Apartments`,
		description: "Rezerwacja koszyka i formularz rezerwacyjny",
		robots: {
			index: false,
			follow: false,
		},
	}
}

export default async function RezerwacjaPage({ params }: RezerwacjaProps) {
	const { lang } = await params
	const dictionary = await getDictionary(lang)
	return <BasketPageClient lang={lang} dictionary={dictionary} />
}
