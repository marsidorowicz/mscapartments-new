/** @format */

import type { Metadata } from "next"
import { getDictionary } from "../../dictionaries"
import PaymentSuccessPage from "./components/PaymentSuccessPage"
import { Suspense } from "react"

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
	const { lang } = await params
	const dictionary = await getDictionary(lang)

	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mountainapartments.com"
	const currentUrl = `${baseUrl}/${lang}/payment-success`

	return {
		title: `${dictionary.paymentSuccess.success.heading} - ${dictionary.title}`,
		description: dictionary.paymentSuccess.success.description,
		metadataBase: new URL(baseUrl),
		alternates: {
			canonical: currentUrl,
			languages: {
				en: `${baseUrl}/en/payment-success`,
				pl: `${baseUrl}/pl/payment-success`,
				de: `${baseUrl}/de/payment-success`,
				es: `${baseUrl}/es/payment-success`,
			},
		},
		robots: {
			index: false, // Payment success pages shouldn't be indexed
			follow: false,
		},
	}
}

export default async function PaymentSuccess({ params }: { params: Promise<{ lang: string }> }) {
	const { lang } = await params
	const dictionary = await getDictionary(lang)

	return (
		<Suspense fallback={<div>Loading...</div>}>
			<PaymentSuccessPage dictionary={dictionary.paymentSuccess} />
		</Suspense>
	)
}
