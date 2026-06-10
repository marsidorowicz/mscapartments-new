/** @format */

import { i18n } from "../i18n-config"
import "../globals.css"

export async function generateStaticParams() {
	return i18n.locales.map((locale) => ({ lang: locale }))
}

export default async function LocaleLayout({ children }: { children: React.ReactNode }) {
	return <div>{children}</div>
}
