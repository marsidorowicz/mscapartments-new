/** @format */

"use client"
import { useState, useEffect } from "react"
import { useSearchParams, useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { formatCurrency } from "@/utilities/functions/payments/currencyFormat"
import { PaymentSuccessDictionary } from "@/app/types/dictionary"

// Define a type for payment status - can be shared or defined locally
type PaymentStatus = "COMPLETED" | "FAILED" | "PENDING" | string

// Define a type for the payment details
interface PaymentDetailsType {
	status: PaymentStatus
	amount: number
	currency: string
	createdAt: string // Assuming createdAt is a string date
	propertyId?: string
	accessToken?: string
	// Add other relevant fields from your API response if needed
}

type PaymentFailurePageProps = {
	dictionary: PaymentSuccessDictionary
}

export default function PaymentFailurePage({
	dictionary,
}: PaymentFailurePageProps) {
	const searchParams = useSearchParams()
	const router = useRouter()
	const params = useParams()
	const orderId = searchParams.get("oid")
	const errorCode = searchParams.get("error")
	const canRetry = searchParams.get("canRetry") === "true"
	const attemptNum = parseInt(searchParams.get("attempt") || "1")
	const eventId = searchParams.get("eventId")
	const locale = params.lang as string
	const [paymentDetails, setPaymentDetails] =
		useState<PaymentDetailsType | null>(null)
	const [loading, setLoading] = useState(true)
	const [errorMessage, setErrorMessage] = useState("")

	// Helper function to get payment status translation
	const getPaymentStatusTranslation = (status: string): string => {
		if (!status) return ""

		const statusUpperCase = status.toUpperCase()
		if (statusUpperCase === "COMPLETED") {
			return dictionary.status.COMPLETED
		} else if (statusUpperCase === "FAILED") {
			return dictionary.status.FAILED
		} else if (statusUpperCase === "PENDING") {
			return dictionary.status.PENDING
		}
		return status // fallback to original status if no translation
	}

	useEffect(() => {
		// Minimal validation - at least need order ID
		if (!orderId) {
			console.log("Missing order ID, redirecting to home")
			router.push(`/${locale}`)
			return
		}

		const fetchPaymentDetails = async () => {
			try {
				// Fetch payment details if available
				const response = await fetch(
					`/api/payment/details?oid=${orderId}`
				)

				if (response.ok) {
					const data = await response.json()
					setPaymentDetails(data)
				} else {
					const errorData = await response.json()
					setErrorMessage(
						errorData.error || "Could not retrieve payment details"
					)
				}
			} catch (err) {
				console.error("Error fetching payment details:", err)
				setErrorMessage(
					"An error occurred while fetching payment details"
				)
			} finally {
				setLoading(false)
			}
		}
		fetchPaymentDetails()
	}, [orderId, router, locale])

	// Map error codes to user-friendly messages
	const getErrorMessage = () => {
		if (!errorCode) return dictionary.fail.description

		// Map error codes to specific error messages
		switch (errorCode) {
			case "card_declined":
				return dictionary.fail.errors.card_declined
			case "processing_error":
				return dictionary.fail.errors.processing_error
			case "payment_failed":
				return dictionary.fail.errors.payment_failed
			case "invalid_response":
				return dictionary.fail.errors.invalid_response
			case "invalid_approval":
				return dictionary.fail.errors.invalid_approval
			case "missing_user":
				return dictionary.fail.errors.missing_user
			case "internal":
				return dictionary.fail.errors.internal
			default:
				return `${dictionary.fail.description} (${errorCode})`
		}
	}

	// Show appropriate retry message based on canRetry flag
	const getRetryMessage = () => {
		return canRetry ? dictionary.fail.canRetry : dictionary.fail.cannotRetry
	}
	// Handle the retry action
	const handleRetry = () => {
		// If we have an eventId, try to go back to the booking flow
		if (eventId) {
			router.push(`/${locale}/reservationEngine?eventId=${eventId}`)
		} else {
			// Otherwise just go back in browser history
			window.history.back()
		}
	}

	return (
		<div className="container mx-auto px-4 py-12 max-w-4xl">
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
				<div className="flex items-center mb-4">
					<div className="bg-red-100 dark:bg-red-900/30 rounded-full p-3 mr-4">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-8 w-8 text-red-500 dark:text-red-400"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</div>
					<h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
						{dictionary.fail.heading}
					</h1>
				</div>
				{loading ? (
					<div className="p-4">
						<div className="flex items-center justify-center mb-4">
							<div className="animate-spin h-8 w-8 border-4 border-blue-500 dark:border-blue-400 rounded-full border-t-transparent"></div>
						</div>
						<p className="text-center text-gray-600 dark:text-gray-300">
							{dictionary.common.paymentDetails}
						</p>
					</div>
				) : (
					<>
						<div className="bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 p-4 rounded-md mb-6 border border-red-200 dark:border-red-700">
							<h3 className="font-semibold mb-2 text-red-900 dark:text-red-100">
								{dictionary.fail.errorReason}
							</h3>
							<p className="text-red-700 dark:text-red-200">
								{getErrorMessage()}
							</p>
							{errorMessage && (
								<p className="mt-2 text-sm text-red-600 dark:text-red-300">
									{errorMessage}
								</p>
							)}
						</div>

						{paymentDetails && (
							<div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md mb-6 border dark:border-gray-600">
								<h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">
									{dictionary.common.paymentDetails}
								</h3>
								<div className="grid grid-cols-2 gap-2 text-sm">
									<div className="text-gray-600 dark:text-gray-400">
										{dictionary.fail.orderNumber}:
									</div>
									<div className="text-gray-800 dark:text-gray-200">
										{orderId}
									</div>

									<div className="text-gray-600 dark:text-gray-400">
										{dictionary.fail.amount}:
									</div>
									<div className="text-gray-800 dark:text-gray-200">
										{formatCurrency(
											paymentDetails.amount,
											paymentDetails.currency
										)}
									</div>

									<div className="text-gray-600 dark:text-gray-400">
										{dictionary.fail.date}:
									</div>
									<div className="text-gray-800 dark:text-gray-200">
										{new Date(
											paymentDetails.createdAt
										).toLocaleString()}
									</div>

									<div className="text-gray-600 dark:text-gray-400">
										{dictionary.fail.status}:
									</div>
									<div className="text-gray-800 dark:text-gray-200">
										{getPaymentStatusTranslation(
											paymentDetails.status
										)}
									</div>
								</div>
							</div>
						)}

						<div className="bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 p-4 rounded-md mb-6 border border-yellow-200 dark:border-yellow-700">
							<h3 className="font-semibold mb-2 text-yellow-900 dark:text-yellow-100">
								{dictionary.fail.nextSteps}
							</h3>
							<p className="text-yellow-700 dark:text-yellow-200">
								{getRetryMessage()}
							</p>
							{attemptNum > 1 && (
								<p className="mt-2 text-sm text-yellow-600 dark:text-yellow-300">
									{dictionary.fail.tryAgain} ({attemptNum}/3)
								</p>
							)}
						</div>
					</>
				)}{" "}
				<div className="flex justify-center space-x-4 flex-wrap gap-2">
					<Link
						href={`/${locale}`}
						className="bg-gray-600 hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition"
					>
						{dictionary.common.backToHome}
					</Link>
					{canRetry && (
						<button
							onClick={handleRetry}
							className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition"
						>
							{dictionary.fail.tryAgain}
						</button>
					)}
					<Link
						href={
							eventId && paymentDetails?.propertyId
								? `/${locale}/reservation/${eventId}/${
										paymentDetails.propertyId
								  }${
										paymentDetails.accessToken
											? `?token=${encodeURIComponent(
													paymentDetails.accessToken
											  )}`
											: ""
								  }`
								: `/${locale}`
						}
						className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md transition"
					>
						{dictionary.fail.returnToBooking}
					</Link>
				</div>
			</div>
		</div>
	)
}
