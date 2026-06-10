/** @format */

import BasketPageClient from "./BasketPageClient"
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
	return <BasketPageClient lang={lang} />
}
