/** @format */

"use client"

import { useParams, useSearchParams } from "next/navigation"
import { ReservationDetails } from "@marsidorowicz/simplevent-sdk"
import { FiservPaymentHPP } from "@/app/[lang]/components/rev13/FiservPaymentHPP"
import Logo from "@/app/[lang]/components/Logo"
import type { Dictionary } from "@/app/types/dictionary"

interface ReservationPageProps {
	dictionary: {
		reservation: Dictionary["reservation"]
		paymentStatus: Dictionary["paymentSuccess"]["status"]
	}
}

/**
 * Thin host wrapper around the shared SDK `ReservationDetails` component.
 * The unified implementation lives in @marsidorowicz/simplevent-sdk; here we
 * only inject the MSC-specific pieces (dictionary, logo, Fiserv payment form).
 */
export default function ReservationPage({ dictionary }: ReservationPageProps) {
	const params = useParams()
	const searchParams = useSearchParams()

	const eventId = params.eventId as string
	const propertyId = params.propertyId as string
	const locale = params.lang as string

	return (
		<ReservationDetails
			eventId={eventId}
			propertyId={propertyId}
			locale={locale}
			token={searchParams.get("token")}
			dictionary={dictionary}
			logo={<Logo />}
			homeHref={`/${locale}`}
			renderPayment={({ chargeTotal, eventId: evId, oid }) => (
				<FiservPaymentHPP chargeTotal={chargeTotal} eventId={evId} locale="pl" oid={oid} paymentOptions={false} forceNewOrderId={false} />
			)}
		/>
	)
}
