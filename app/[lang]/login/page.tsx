import { getDictionary } from "@/app/dictionaries"
import { Locale } from "@/app/i18n-config"
import LoginPageClient from "./LoginPageClient"

export const dynamic = "force-dynamic"

export default async function LoginPage({ params }: { params: Promise<{ lang: string }> }) {
	const { lang } = await params
	const dictionary = await getDictionary(lang)

	return <LoginPageClient dictionary={dictionary} lang={lang as Locale} />
}
