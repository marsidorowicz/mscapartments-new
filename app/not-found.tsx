/** @format */

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { en, pl, de, es } from "./dictionaries"
import { Locale } from "./i18n-config"

export default function NotFound() {
	const pathname = usePathname()
	const lang = (pathname.split("/")[1] as Locale) || "pl"
	const dictionaries = { en, pl, de, es }
	const dictionary = dictionaries[lang] || dictionaries.pl

	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
			<div className="text-center">
				<h1 className="text-9xl font-bold text-blue-600 mb-4">404</h1>
				<p className="text-2xl text-gray-600 mb-8">{dictionary.paymentSuccess.common.pageNotFound}</p>
				<Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg">
					{dictionary.paymentSuccess.common.backToHome}
				</Link>
			</div>
		</div>
	)
}
