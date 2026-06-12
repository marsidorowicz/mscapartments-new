/** @format */

import type { Metadata } from "next"
import { getDictionary } from "../../dictionaries"
import PaymentFailurePage from "./components/PaymentFailurePage"
import { Suspense } from "react"

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
	const { lang } = await params
	const dictionary = await getDictionary(lang)

	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mscapartments.pl"
	const currentUrl = `${baseUrl}/${lang}/payment-fail`

	return {
		title: `${dictionary.paymentSuccess.fail.heading} - ${dictionary.title}`,
		description: dictionary.paymentSuccess.fail.description,
		metadataBase: new URL(baseUrl),
		alternates: {
			canonical: currentUrl,
			languages: {
				en: `${baseUrl}/en/payment-fail`,
				pl: `${baseUrl}/pl/payment-fail`,
				de: `${baseUrl}/de/payment-fail`,
				es: `${baseUrl}/es/payment-fail`,
			},
		},
		robots: {
			index: false, // Payment failure pages shouldn't be indexed
			follow: false,
		},
	}
}

export default async function PaymentFail({ params }: { params: Promise<{ lang: string }> }) {
	const { lang } = await params
	const dictionary = await getDictionary(lang)

	return (
		<Suspense fallback={<div>Loading...</div>}>
			<PaymentFailurePage dictionary={dictionary.paymentSuccess} />
		</Suspense>
	)
}
