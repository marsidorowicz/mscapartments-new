/** @format */

import BasketPageClient from "./BasketPageClient"
import { getDictionary } from "../../dictionaries"
import { Locale } from "../../i18n-config"

type RezerwacjaProps = {
	params: Promise<{
		lang: Locale
	}>
}

export const metadata = {
	title: "Rezerwacja",
	description: "Rezerwacja koszyka i formularz rezerwacyjny",
}

export default async function RezerwacjaPage({ params }: RezerwacjaProps) {
	const { lang } = await params
	const dictionary = await getDictionary(lang)
	return <BasketPageClient lang={lang} dictionary={dictionary} />
}
