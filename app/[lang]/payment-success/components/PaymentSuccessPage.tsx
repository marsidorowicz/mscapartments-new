/** @format */

"use client"
import React, { useState, useEffect, useCallback, useMemo } from "react"
import { useSearchParams, useParams } from "next/navigation"
import Link from "next/link"
import { formatCurrency } from "@/utilities/functions/payments/currencyFormat"
import { PaymentSuccessDictionary } from "@/app/types/dictionary"

// Define a type for payment status
type PaymentStatus = "COMPLETED" | "FAILED" | "PENDING" | string

// Define a type for the payment details
interface PaymentDetailsType {
	status: PaymentStatus
	chargeTotal: number | string // Can be either number or string from API
	amount: number | string // Can be either number or string from API
	currency: string
	approval_code?: string
	propertyId?: number | string // Can be either number or string from API
	accessToken?: string
	accessTokenExpiry?: string
	// Add other relevant fields from your API response if needed
}

type PaymentSuccessPageProps = {
	dictionary: PaymentSuccessDictionary
}

export default function PaymentSuccessPage({ dictionary }: PaymentSuccessPageProps) {
	const searchParams = useSearchParams()
	const params = useParams()
	const orderId = searchParams.get("oid")
	const eventId = searchParams.get("eventId")
	const locale = params.lang as string
	const [paymentDetails, setPaymentDetails] = useState<PaymentDetailsType | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState("")
	const [verifiedForDisplay, setVerifiedForDisplay] = useState(false)

	// Construct the reservation URL
	const reservationUrl = useMemo(() => {
		if (!eventId || !paymentDetails?.propertyId) return "#"

		const baseUrl = `/${locale}/reservation/${eventId}/${paymentDetails.propertyId}`
		const tokenParam = paymentDetails?.accessToken ? `?token=${encodeURIComponent(paymentDetails.accessToken)}` : ""

		return `${baseUrl}${tokenParam}`
	}, [eventId, paymentDetails?.propertyId, paymentDetails?.accessToken, locale])

	const getPaymentStatusTranslation = useCallback(
		(status: PaymentStatus): string => {
			if (!status) return ""
			const upperStatus = status.toUpperCase()

			if (upperStatus === "COMPLETED") {
				return dictionary.status.COMPLETED
			} else if (upperStatus === "FAILED") {
				return dictionary.status.FAILED
			} else if (upperStatus === "PENDING") {
				return dictionary.status.PENDING
			}

			// Fallback for unexpected status
			return dictionary.fail.description_unexpected_status
		},
		[dictionary],
	)

	useEffect(() => {
		const fetchPaymentData = async () => {
			setLoading(true)
			setError("")
			setPaymentDetails(null)
			setVerifiedForDisplay(false)

			if (!orderId) {
				setError(dictionary.fail.errors.internal)
				setLoading(false)
				return
			}

			try {
				console.log("PaymentSuccessPage: Fetching payment details for orderId:", orderId)
				const detailsResponse = await fetch(`/api/payment/details?oid=${orderId}`)
				if (detailsResponse.ok) {
					const data: PaymentDetailsType = await detailsResponse.json()
					setPaymentDetails(data)
					console.log("PaymentSuccessPage: Payment details fetched:", data)

					if (data.status === "COMPLETED") {
						setVerifiedForDisplay(true)
						setError("")
					} else {
						console.warn(`PaymentSuccessPage: Payment status is '${data.status}' for orderId: ${orderId}. This is unexpected on the success page.`)
						setError(dictionary.fail.description_unexpected_status)
						setVerifiedForDisplay(false)
					}
				} else {
					const errorData: { message?: string } = await detailsResponse.json().catch(() => ({}))
					console.error("PaymentSuccessPage: Failed to retrieve payment details:", detailsResponse.status, errorData)
					setError(errorData.message || dictionary.fail.errors.internal)
					setVerifiedForDisplay(false)
				}
			} catch (err: unknown) {
				console.error("PaymentSuccessPage: Error fetching payment details:", err)
				let errorMessage = dictionary.fail.errors.internal
				if (err instanceof Error) {
					errorMessage = err.message || errorMessage
				}
				setError(errorMessage)
				setVerifiedForDisplay(false)
			} finally {
				setLoading(false)
			}
		}

		fetchPaymentData()
	}, [orderId, dictionary, getPaymentStatusTranslation])
	return (
		<div className="container mx-auto px-4 py-8">
			<div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
				{loading ? (
					<div className="text-center">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100 mx-auto"></div>
						<p className="mt-4 text-gray-600 dark:text-gray-300">{dictionary.common.loadingDetails}</p>
					</div>
				) : error ? (
					<div className="text-center">
						<h1 className="text-3xl font-semibold text-red-600 dark:text-red-300 mb-4">{dictionary.fail.heading}</h1>
						<p className="text-gray-700 dark:text-gray-300 mb-6">{error}</p>{" "}
						{eventId && (
							<Link
								href={`/${locale}/event/${eventId}`}
								className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline">
								{dictionary.common.backToEvent}
							</Link>
						)}
					</div>
				) : verifiedForDisplay && paymentDetails ? (
					<>
						<h1 className="text-3xl font-semibold text-green-600 dark:text-green-400 mb-4 text-center">{dictionary.success.heading}</h1>
						<p className="text-gray-600 dark:text-gray-300 mb-6 text-center">{dictionary.success.description}</p>
						<div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-sm mb-6 border dark:border-gray-600">
							<h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">{dictionary.common.paymentDetails}</h2>
							<div className="space-y-2">
								<p className="text-gray-700 dark:text-gray-300">
									<strong className="text-gray-900 dark:text-gray-100">{dictionary.common.orderNumber}:</strong> {orderId}
								</p>{" "}
								<p className="text-gray-700 dark:text-gray-300">
									<strong className="text-gray-900 dark:text-gray-100">{dictionary.common.amount}:</strong>{" "}
									{formatCurrency(paymentDetails.chargeTotal, paymentDetails.currency)}
								</p>
								<p className="text-gray-700 dark:text-gray-300">
									<strong className="text-gray-900 dark:text-gray-100">{dictionary.common.status}:</strong>{" "}
									<span className="font-medium text-green-600 dark:text-green-400">{getPaymentStatusTranslation(paymentDetails.status)}</span>
								</p>{" "}
								{paymentDetails.approval_code && (
									<p className="text-gray-700 dark:text-gray-300">
										<strong className="text-gray-900 dark:text-gray-100">{dictionary.success.approvalCode}:</strong>{" "}
										{paymentDetails.approval_code}
									</p>
								)}
							</div>
						</div>{" "}
						{eventId && (
							<div className="text-center mt-8">
								<Link
									href={reservationUrl}
									className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition duration-150 ease-in-out">
									{dictionary.common.backToEvent}
								</Link>
								{!paymentDetails?.accessToken && (
									<p className="text-yellow-600 mt-2 text-sm">Warning: No access token found. You may need to request access.</p>
								)}
							</div>
						)}
					</>
				) : (
					<div className="bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 p-4 rounded-md mb-6 border border-red-200 dark:border-red-700">
						<h3 className="font-semibold mb-2 text-red-900 dark:text-red-100">{dictionary.fail.heading}</h3>
						<p className="text-red-700 dark:text-red-200">{dictionary.fail.verification_problem_generic}</p>
					</div>
				)}{" "}
				<div className="flex justify-center mt-8">
					<Link href={`/${locale}`} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline">
						{dictionary.common.backToHome}
					</Link>
				</div>
			</div>
		</div>
	)
}
