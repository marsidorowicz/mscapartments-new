/** @format */

import type { Metadata } from "next"
import { getDictionary } from "../../../../dictionaries"
import ReservationPage from "./components/ReservationPage"

export async function generateMetadata({
	params,
}: {
	params: Promise<{ lang: string; eventId: string; propertyId: string }>
}): Promise<Metadata> {
	const { lang } = await params
	const dictionary = await getDictionary(lang)
	const baseUrl =
		process.env.NEXT_PUBLIC_BASE_URL || "https://mountainapartments.com"

	return {
		title: `${dictionary.reservation.title} - ${dictionary.title}`,
		description: dictionary.reservation.title,
		metadataBase: new URL(baseUrl),
		// Don't set canonical URL for reservation pages since they include query parameters
		// alternates: {
		// 	canonical: currentUrl,
		// },
		robots: {
			index: false, // Reservation pages shouldn't be indexed
			follow: false,
		},
	}
}

export default async function Reservation({
	params,
}: {
	params: Promise<{ lang: string; eventId: string; propertyId: string }>
}) {
	const { lang } = await params
	const dictionary = await getDictionary(lang)

	return (
		<ReservationPage
			dictionary={{
				reservation: dictionary.reservation,
				paymentStatus: dictionary.paymentSuccess.status,
			}}
		/>
	)
}
