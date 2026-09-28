/** @format */

import { allLocales } from "../i18n-config"
import "../globals.css"

export async function generateStaticParams() {
	return allLocales.map((locale) => ({ lang: locale }))
}

export default async function LocaleLayout({ children }: { children: React.ReactNode }) {
	return <div>{children}</div>
}
