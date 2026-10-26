import type { Metadata } from "next"
import { getDictionary } from "@/app/dictionaries"
import { Locale } from "@/app/i18n-config"
import DashboardClient from "./DashboardClient"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
	robots: {
		index: false,
		follow: false,
	},
}

export default async function DashboardPage({ params }: { params: Promise<{ lang: string }> }) {
	const { lang } = await params
	const dictionary = await getDictionary(lang)

	return <DashboardClient dictionary={dictionary} lang={lang as Locale} />
}
