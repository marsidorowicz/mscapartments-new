/** @format */

"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CircularProgress, Typography, Button, Alert } from "@mui/material"
import { Event, Payment, Place, Property } from "@prisma/client"
import { formatCurrency } from "@/utilities/functions/payments/currencyFormat"
import { format } from "date-fns"
import { FiservPaymentHPP } from "@/app/[lang]/components/rev13/FiservPaymentHPP"
import Logo from "@/app/[lang]/components/Logo"
import type { Dictionary } from "@/app/types/dictionary"
import { EmailTemplate, EventExtendedData } from "@/types"
import { v4 as uuidv4 } from "uuid"

interface PropertyExtended extends Property {
	place: Place
	emailTemplates: EmailTemplate[] | null
}

interface ReservationDetails extends Event {
	place: Place
	property: PropertyExtended | null
	payments: Payment[]
	localTax: number | null | undefined
}

interface ReservationPageProps {
	dictionary: {
		reservation: Dictionary["reservation"]
		paymentStatus: Dictionary["paymentSuccess"]["status"]
	}
}

export default function ReservationPage({ dictionary }: ReservationPageProps) {
	const params = useParams()
	const searchParams = useSearchParams()
	const eventId = params.eventId as string
	const propertyId = params.propertyId as string
	const locale = params.lang as string
	const token = searchParams.get("token")

	const [reservation, setReservation] = useState<ReservationDetails | null>(null)
	const [loading, setLoading] = useState<boolean>(true)
	const [error, setError] = useState<string | null>(null)
	const [retryAfter, setRetryAfter] = useState<number | null>(null)
	const [countdown, setCountdown] = useState<number | null>(null)
	const [isPaymentExpanded, setIsPaymentExpanded] = useState(true)
	const [isInstructionsExpanded, setIsInstructionsExpanded] = useState(false)
	const [isSettingsExpanded, setIsSettingsExpanded] = useState(false)
	const [orderId, setOrderId] = useState<string | null>(null)
	const [paymentOption, setPaymentOption] = useState<"30" | "100">("100")

	// Function to parse numbers with comma or dot decimal separators
	const parseNumber = (value: string | number | null | undefined): number => {
		if (value === null || value === undefined) return 0
		const stringValue = String(value).replace(",", ".")
		return parseFloat(stringValue) || 0
	}

	const totalPrice = (reservation?.price || 0) + (reservation?.cityTax || 0) + (reservation?.extraFees || 0) || 0
	const depositAmount = parseNumber(reservation?.deposit)
	const reservationPrice = parseNumber(reservation?.price)
	const hasExistingDeposit = depositAmount >= reservationPrice * 0.1
	const shouldPreviewMarkup = paymentOption === "30" && !hasExistingDeposit
	const previewTotalPrice = shouldPreviewMarkup ? totalPrice + reservationPrice * 0.05 : totalPrice
	const remainingToPay = Math.max(0, previewTotalPrice - depositAmount).toFixed(2)
	const selectedChargeTotal =
		paymentOption === "30" ? (hasExistingDeposit ? (reservationPrice * 0.3).toFixed(2) : (reservationPrice * 0.315).toFixed(2)) : remainingToPay

	// Countdown timer effect
	useEffect(() => {
		if (retryAfter && retryAfter > 0) {
			setCountdown(retryAfter)
			const timer = setInterval(() => {
				setCountdown((prev) => {
					if (prev && prev > 1) {
						return prev - 1
					} else {
						// Timer finished, clear error and allow retry
						setError(null)
						setRetryAfter(null)
						return null
					}
				})
			}, 1000)
			return () => clearInterval(timer)
		}
	}, [retryAfter])

	// Function to translate payment status
	const getPaymentStatusTranslation = useCallback(
		(status: string): string => {
			if (!status) return ""
			const upperStatus = status.toUpperCase()

			// Use dictionary for status translations
			if (upperStatus === "COMPLETED" || upperStatus === "FAILED" || upperStatus === "PENDING") {
				return dictionary.paymentStatus[upperStatus as keyof typeof dictionary.paymentStatus] || status
			}

			// Return the original status if no translation found
			return status
		},
		[dictionary],
	)

	// Function to create new payment record and set orderId
	const createNewPaymentRecord = async () => {
		const generatedOrderId = uuidv4()
		try {
			// Create payment record
			const paymentResponse = await fetch("/api/payment/initiate", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					orderId: generatedOrderId,
					eventId: parseInt(eventId),
					chargeTotal: selectedChargeTotal,
					currency: "PLN",
					locale: locale,
					paymentOption,
					paymentType: paymentOption === "30" ? (hasExistingDeposit ? "DEPOSIT_30_NO_MARKUP" : "DEPOSIT_30_MARKUP") : "FULL",
				}),
			})

			if (paymentResponse.ok) {
				setOrderId(generatedOrderId)
				console.log("New payment record created for orderId:", generatedOrderId)
			} else {
				console.error("Failed to create payment record:", await paymentResponse.text())
				// Still set the orderId even if creation failed, so user can try again
				setOrderId(generatedOrderId)
			}
		} catch (paymentError) {
			console.error("Error creating payment record:", paymentError)
			// Still set the orderId even if creation failed
			setOrderId(generatedOrderId)
		}
	}

	// Define fetchReservationDetails function
	const fetchReservationDetails = useCallback(async () => {
		if (!eventId || !propertyId) return
		setLoading(true)
		setError(null)
		setRetryAfter(null)

		// Check if token is missing and show alert
		if (!token) {
			console.warn("No access token provided")
			setError(dictionary.reservation.accessDenied)
			setLoading(false)
			return // Don't proceed with the API request if token is missing
		}

		try {
			// Include the token in the API request
			const url = `/api/event/${eventId}?propertyId=${propertyId}&token=${encodeURIComponent(token)}`
			const response = await fetch(url)

			if (response.ok) {
				const data = await response.json()
				if (data) {
					setReservation(data)
					// Don't automatically set orderId from existing payments
					// Only set orderId when user clicks the refresh button
				} else {
					setError(dictionary.reservation.notFound)
				}
			} else {
				const errorData = await response.json()

				// Handle rate limiting with specific wait time message
				if (response.status === 429) {
					const retryAfterSeconds = errorData.retryAfter || response.headers.get("Retry-After")
					const waitTimeMinutes = retryAfterSeconds ? Math.ceil(retryAfterSeconds / 60) : 30

					setRetryAfter(retryAfterSeconds)
					const rateLimitMessage = `${dictionary.reservation.rateLimited} ${dictionary.reservation.pleaseWaitMinutes.replace(
						"{{minutes}}",
						waitTimeMinutes.toString(),
					)}`
					setError(rateLimitMessage)
				} else {
					// Map server errors to translated messages
					let translatedError = errorData.error || dictionary.reservation.fetchError

					// Check for common server error messages and translate them
					if (errorData.error) {
						if (errorData.error.includes("Invalid or expired token") || errorData.error.includes("Access denied: Invalid")) {
							translatedError = dictionary.reservation.invalidToken
						} else if (errorData.error.includes("requires authentication") || errorData.error.includes("This reservation requires")) {
							translatedError = dictionary.reservation.authenticationRequired
						} else if (errorData.error.includes("not found") || errorData.error.includes("Reservation not found")) {
							translatedError = dictionary.reservation.notFound
						}
					}

					setError(translatedError)
				}

				console.error("Failed to fetch reservation details:", response.statusText)
			}
		} catch (err) {
			console.error("Error fetching reservation details:", err)
			setError(dictionary.reservation.fetchError)
		} finally {
			setLoading(false)
		}
	}, [eventId, propertyId, token, dictionary.reservation])

	useEffect(() => {
		fetchReservationDetails()
	}, [fetchReservationDetails])

	if (!eventId || !propertyId) return <>No data</>
	if (loading) {
		return (
			<div className="flex justify-center items-center min-h-[80vh] bg-gray-50 dark:bg-gray-900">
				<div className="flex flex-col items-center space-y-4">
					<CircularProgress className="text-blue-600 dark:text-blue-400" size={48} />
					<Typography variant="h6" className="text-gray-900 dark:text-gray-100 font-medium">
						{dictionary.reservation.loading}
					</Typography>
				</div>
			</div>
		)
	}
	if (error) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4">
				<div className="w-full max-w-md">
					<Alert
						severity={retryAfter ? "warning" : "error"}
						className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg"
						sx={{
							"& .MuiAlert-icon": {
								color: "rgb(220 38 38)", // red-600
							},
							"& .MuiAlert-message": {
								width: "100%",
							},
						}}>
						<Typography variant="h6" className="text-red-800 dark:text-red-200 font-semibold mb-2">
							{error}
						</Typography>
						{countdown && countdown > 0 && (
							<Typography variant="body2" className="text-red-700 dark:text-red-300">
								{countdown > 60
									? `${Math.floor(countdown / 60)}:${(countdown % 60).toString().padStart(2, "0")} ${dictionary.reservation.minutesRemaining}`
									: `${countdown} ${dictionary.reservation.secondsRemaining}`}
							</Typography>
						)}
					</Alert>

					<div className="flex flex-col space-y-3">
						{!countdown && (
							<Button
								variant="contained"
								onClick={fetchReservationDetails}
								className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium py-3 rounded-lg transition-colors"
								sx={{
									textTransform: "none",
									boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
									"&:hover": {
										boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
									},
								}}>
								{dictionary.reservation.tryAgain}
							</Button>
						)}
						<Link href={`/${locale}`} passHref>
							<Button
								variant="outlined"
								className="w-full border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium py-3 rounded-lg transition-colors"
								sx={{
									textTransform: "none",
								}}>
								{dictionary.reservation.goHome}
							</Button>
						</Link>
					</div>
				</div>
			</div>
		)
	}
	if (!reservation) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4">
				<div className="text-center">
					<Typography variant="h5" className="text-gray-900 dark:text-gray-100 mb-6 font-semibold">
						{dictionary.reservation.noDetails}
					</Typography>{" "}
					<Link href={`/${locale}`} passHref>
						<Button
							variant="contained"
							className="!bg-[#cc9678] hover:!bg-[#a6755a] text-white font-medium px-8 py-3 rounded-lg transition-colors"
							sx={{
								textTransform: "none",
								boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
								"&:hover": {
									boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
								},
							}}>
							{dictionary.reservation.goHome}
						</Button>
					</Link>
				</div>
			</div>
		)
	}

	const paid = reservation?.paid

	const startDateStr = format(new Date(reservation.startDate), "dd.MM.yyyy")
	const checkinTime = reservation.property?.checkinInstructionTime || "00:00"
	const adjustedStartDate = `${startDateStr}, ${checkinTime}`

	const endDateStr = format(new Date(reservation.endDate), "dd.MM.yyyy")
	const checkoutTime = reservation.property?.checkoutInstructionTime || "00:00"
	const adjustedEndDate = `${endDateStr}, ${checkoutTime}`

	const instructionPaidTemplate = reservation.property?.emailTemplates?.find((emailTemplate: EmailTemplate) => emailTemplate.type === "instructionPaid")

	const checkinDateTime = (() => {
		if (!reservation?.startDate) return null
		const date = new Date(reservation.startDate)
		const [hoursStr, minutesStr] = checkinTime.split(":")
		const hours = Number(hoursStr)
		const minutes = Number(minutesStr)
		if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return date
		date.setHours(hours, minutes, 0, 0)
		return date
	})()

	const instructionPaidVisible = Boolean(paid && checkinDateTime && new Date() > checkinDateTime && instructionPaidTemplate)

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4 py-8">
			<div className="max-w-4xl mx-auto">
				<div className="flex justify-center mb-6">
					<Logo />
				</div>
				<Typography variant="h3" component="h1" className="text-gray-900 dark:text-gray-100 text-center mb-8 font-bold">
					{dictionary.reservation.title}
				</Typography>

				<Card className="bg-white dark:bg-gray-800 shadow-xl dark:shadow-2xl border-0 dark:border dark:border-gray-700 rounded-2xl overflow-hidden">
					<CardContent className="p-8">
						{/* Header Section */}
						<div className="mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
							<Typography variant="h5" className="text-gray-900 dark:text-gray-100 font-semibold mb-2">
								{dictionary.reservation.eventDetails}
							</Typography>
							<Typography
								variant="body2"
								className="text-gray-600 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-md inline-block">
								ID: {eventId}
							</Typography>
						</div>
						{/* Event Details Grid */}
						<div className="grid md:grid-cols-2 gap-6 mb-8">
							<div className="space-y-4">
								<div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
									<Typography className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
										{dictionary.reservation.eventName}
									</Typography>
									<Typography className="text-gray-900 dark:text-gray-100 font-semibold">
										{reservation.name || dictionary.reservation.notAvailable}
									</Typography>
								</div>

								<div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
									<Typography className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
										{dictionary.reservation.placeName}
									</Typography>
									<Typography className="text-gray-900 dark:text-gray-100 font-semibold">
										{reservation.property?.location || dictionary.reservation.notAvailable}
										<br />
										{reservation.property?.place?.name.toUpperCase() || dictionary.reservation.notAvailable}
									</Typography>
								</div>

								<div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
									<Typography className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
										{reservation?.property?.type === "apartment" ? dictionary.reservation.apartment : dictionary.reservation.propertyName}
									</Typography>
									<Typography className="text-gray-900 dark:text-gray-100 font-semibold">
										{reservation.property?.name || dictionary.reservation.notAvailable}
									</Typography>
								</div>
							</div>

							<div className="space-y-4">
								<div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
									<Typography className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
										{dictionary.reservation.startDate}
									</Typography>
									<Typography className="text-gray-900 dark:text-gray-100 font-semibold">{adjustedStartDate}</Typography>
								</div>

								<div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
									<Typography className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
										{dictionary.reservation.endDate}
									</Typography>
									<Typography className="text-gray-900 dark:text-gray-100 font-semibold">{adjustedEndDate}</Typography>
								</div>

								<div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
									<Typography className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
										{dictionary.reservation.guests}
									</Typography>
									<Typography className="text-gray-900 dark:text-gray-100 font-semibold">{reservation.amountOfPeople} </Typography>
								</div>
							</div>
						</div>
						{/* Instructions Section */}
						{reservation?.property?.emailTemplates?.[0] && (
							<div className="border-t border-gray-200 dark:border-gray-700 pt-8 mb-8">
								<Typography
									variant="h5"
									className="text-gray-900 dark:text-gray-100 font-semibold mb-6 cursor-pointer"
									onClick={() => setIsInstructionsExpanded(!isInstructionsExpanded)}
									sx={{ cursor: "pointer" }}>
									{isInstructionsExpanded ? "▼" : "▶"} {dictionary.reservation.instructions}
								</Typography>
								{isInstructionsExpanded && (
									<div className="space-y-4">
										<div className="grid md:grid-cols-2 gap-4">
											<div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
												<Typography className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
													{dictionary.reservation.checkInTime}
												</Typography>
												<Typography className="text-gray-900 dark:text-gray-100 font-semibold">
													{reservation.property?.checkinInstructionTime || dictionary.reservation.notAvailable}
												</Typography>
											</div>
											<div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
												<Typography className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
													{dictionary.reservation.checkOutTime}
												</Typography>
												<Typography className="text-gray-900 dark:text-gray-100 font-semibold">
													{reservation.property?.checkoutInstructionTime || dictionary.reservation.notAvailable}
												</Typography>
											</div>
										</div>
										{reservation.property?.emailTemplates?.find((template: EmailTemplate) => template.type === "instruction") && (
											<div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
												<Typography className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
													{dictionary.reservation.additionalInstructions}
												</Typography>
												<Typography className="text-gray-900 dark:text-gray-100 whitespace-pre-line">
													{reservation.property.emailTemplates.find(
														(emailTemplate: EmailTemplate) => emailTemplate.type === "instruction",
													)?.body || ""}
												</Typography>
											</div>
										)}
										{instructionPaidVisible && instructionPaidTemplate && (
											<div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
												<Typography className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
													{dictionary.reservation.additionalInstructions}
												</Typography>
												<Typography className="text-gray-900 dark:text-gray-100 whitespace-pre-line">
													{instructionPaidTemplate.body || ""}
												</Typography>
											</div>
										)}
									</div>
								)}
							</div>
						)}
						{/* Payment Section */}
						<div className="border-t border-gray-200 dark:border-gray-700 pt-8">
							<Typography
								variant="h5"
								className="text-gray-900 dark:text-gray-100 font-semibold mb-6 cursor-pointer"
								onClick={() => setIsPaymentExpanded(!isPaymentExpanded)}
								sx={{ cursor: "pointer" }}>
								{isPaymentExpanded ? "▼" : "▶"} {dictionary.reservation.paymentDetails}
							</Typography>
							{isPaymentExpanded && (
								<>
									<div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
										<Typography className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
											{dictionary.reservation.totalPrice}
										</Typography>
										<Typography className="text-gray-900 dark:text-gray-100 font-semibold">
											{formatCurrency(String(previewTotalPrice), reservation.payments?.[0]?.currency || "PLN")}{" "}
										</Typography>
										{shouldPreviewMarkup && (
											<Typography className="text-xs text-green-600 dark:text-green-400 mt-1">
												{dictionary.reservation.depositMarkupNote}
											</Typography>
										)}
									</div>
									<div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
										<Typography className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
											{dictionary.reservation.rentalPrice}
										</Typography>
										<Typography className="text-gray-900 dark:text-gray-100 font-semibold">
											{formatCurrency(String(reservation.price || 0), reservation.payments?.[0]?.currency || "PLN")}{" "}
										</Typography>
									</div>
									<div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
										<Typography className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
											{dictionary.reservation.deposit}
										</Typography>
										<Typography className="text-gray-900 dark:text-gray-100 font-semibold">
											{formatCurrency(String(reservation.deposit || 0), reservation.payments?.[0]?.currency || "PLN")}{" "}
										</Typography>
									</div>

									<div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
										<Typography className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
											{dictionary.reservation.localTax}
										</Typography>
										<Typography className="text-gray-900 dark:text-gray-100 font-semibold">
											{formatCurrency(String(reservation.cityTax || 0), reservation.payments?.[0]?.currency || "PLN")}{" "}
										</Typography>
									</div>
									<div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
										<Typography className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
											{dictionary.reservation.remainingToPay}
										</Typography>
										<Typography className="text-gray-900 dark:text-gray-100 font-semibold">
											{formatCurrency(String(remainingToPay), reservation.payments?.[0]?.currency || "PLN")}{" "}
										</Typography>
									</div>
									{reservation.payments && reservation.payments.length > 0 && !paid && (
										<div className="space-y-4">
											<Typography variant="h6" className="text-gray-900 dark:text-gray-100 font-semibold">
												{dictionary.reservation.paymentHistory}
											</Typography>
											{reservation.payments.map((paymentItem, index) => (
												<div
													key={paymentItem.id}
													className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
													<div className="flex justify-between items-center mb-4">
														<Typography variant="subtitle1" className="text-gray-900 dark:text-gray-100 font-semibold">
															{dictionary.reservation.paymentNumber.replace("{{number}}", (index + 1).toString())}
														</Typography>
														<span
															className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
																paymentItem.status === "COMPLETED"
																	? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
																	: paymentItem.status === "PENDING"
																		? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300"
																		: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
															}`}>
															{getPaymentStatusTranslation(paymentItem.status)}
														</span>
													</div>
													<div className="grid md:grid-cols-2 gap-4 mb-4">
														<div>
															<Typography className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
																{dictionary.reservation.paymentId}
															</Typography>
															<Typography className="text-gray-900 dark:text-gray-100 font-mono font-semibold">
																{paymentItem.orderId}
															</Typography>
														</div>

														{paymentItem.chargeTotal && (
															<div>
																<Typography className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
																	{dictionary.reservation.amount}
																</Typography>
																<Typography className="text-gray-900 dark:text-gray-100 font-bold text-lg">
																	{formatCurrency(String(paymentItem.chargeTotal), paymentItem.currency)}
																</Typography>
															</div>
														)}
													</div>

													<div className="grid md:grid-cols-2 gap-4">
														<div>
															<Typography className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
																{dictionary.reservation.initiatedDate}
															</Typography>
															<Typography className="text-gray-900 dark:text-gray-100 font-semibold">
																{paymentItem.initiatedAt ? new Date(paymentItem.initiatedAt).toLocaleString() : "N/A"}
															</Typography>
														</div>

														{paymentItem.paymentDate && (
															<div>
																<Typography className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
																	{dictionary.reservation.paymentDate}
																</Typography>
																<Typography className="text-gray-900 dark:text-gray-100 font-semibold">
																	{new Date(paymentItem.paymentDate).toLocaleString()}
																</Typography>
															</div>
														)}
													</div>
												</div>
											))}
										</div>
									)}

									{totalPrice &&
										totalPrice !== 0 &&
										parseNumber(reservation.deposit) < previewTotalPrice &&
										reservation?.property?.paymentsOn === true && (
											<div className="mt-6 pt-4 border-t border-blue-200 dark:border-blue-700">
												{!orderId ? (
													<div className="mb-4 space-y-4">
														<div>
															<Typography variant="body1" className="text-gray-900 dark:text-gray-100 font-semibold mb-2">
																30% / 100%
															</Typography>
															<div className="grid gap-3 sm:grid-cols-2">
																<label className="flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 cursor-pointer">
																	<input
																		type="radio"
																		name="paymentOption"
																		value="100"
																		checked={paymentOption === "100"}
																		onChange={() => setPaymentOption("100")}
																		className="h-4 w-4 accent-[#cc9678]"
																	/>
																	<span>{dictionary.reservation.totalPrice} (100%)</span>
																</label>
																<label className="flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 cursor-pointer">
																	<input
																		type="radio"
																		name="paymentOption"
																		value="30"
																		checked={paymentOption === "30"}
																		onChange={() => setPaymentOption("30")}
																		className="h-4 w-4 accent-[#cc9678]"
																	/>
																	<span>{dictionary.reservation.deposit} (30%)</span>
																</label>
															</div>
														</div>
														<Typography variant="body2" className="text-gray-600 dark:text-gray-400">
															{paymentOption === "30"
																? hasExistingDeposit
																	? `${dictionary.reservation.deposit}: ${formatCurrency(selectedChargeTotal, reservation.payments?.[0]?.currency || "PLN")}`
																	: `${dictionary.reservation.deposit}: ${formatCurrency(selectedChargeTotal, reservation.payments?.[0]?.currency || "PLN")} ${dictionary.reservation.depositMarkupSuffix}`
																: `${dictionary.reservation.remainingToPay}: ${formatCurrency(selectedChargeTotal, reservation.payments?.[0]?.currency || "PLN")}`}
														</Typography>
														<Button variant="outlined" color="primary" onClick={createNewPaymentRecord} className="w-full">
															{!reservation.payments || reservation.payments.length === 0
																? dictionary.reservation.payNow
																: dictionary.reservation.createPayment}
														</Button>
													</div>
												) : (
													<div className="mb-4 flex gap-2">
														<Button variant="outlined" color="primary" size="small" onClick={createNewPaymentRecord}>
															{dictionary.reservation.refreshOrderId || "Refresh Order ID"}
														</Button>
														<Typography variant="body2" className="text-gray-600 dark:text-gray-400 self-center">
															{dictionary.reservation.orderIdLabel} {orderId.slice(0, 8)}...
														</Typography>
													</div>
												)}
												{orderId && (
													<FiservPaymentHPP
														chargeTotal={selectedChargeTotal}
														eventId={parseInt(eventId)}
														locale={"pl"}
														oid={orderId}
														paymentOptions={false}
														forceNewOrderId={false}
													/>
												)}
											</div>
										)}
								</>
							)}
						</div>{" "}
						{/* Settings Section */}
						{reservation.extended &&
							typeof reservation.extended === "object" &&
							!Array.isArray(reservation.extended) &&
							"newsletter" in reservation.extended &&
							(reservation.extended as EventExtendedData).newsletter &&
							(reservation.extended as EventExtendedData).newsletter!.accepted === false && (
								<div className="border-t border-gray-200 dark:border-gray-700 pt-8">
									<Typography
										variant="h5"
										className="text-gray-900 dark:text-gray-100 font-semibold mb-6 cursor-pointer"
										onClick={() => setIsSettingsExpanded(!isSettingsExpanded)}
										sx={{ cursor: "pointer" }}>
										{isSettingsExpanded ? "▼" : "▶"} Settings
									</Typography>
									{isSettingsExpanded && (
										<div className="space-y-4">
											<div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
												<Typography className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
													Newsletter Accepted
												</Typography>
												<Typography className="text-gray-900 dark:text-gray-100 font-semibold">
													{(reservation.extended as EventExtendedData)?.newsletter?.accepted ? "Yes" : "No"}
												</Typography>
											</div>
											<div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
												<Typography className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
													Newsletter Signup Date
												</Typography>
												<Typography className="text-gray-900 dark:text-gray-100 font-semibold">
													{(() => {
														const dateStr = (reservation.extended as EventExtendedData)?.newsletter?.date
														return dateStr ? new Date(dateStr).toLocaleDateString() : dictionary.reservation.notAvailable
													})()}
												</Typography>
											</div>
											<div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
												<Typography className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Newsletter Email</Typography>
												<Typography className="text-gray-900 dark:text-gray-100 font-semibold">
													{(reservation.extended as EventExtendedData)?.newsletter?.email || dictionary.reservation.notAvailable}
												</Typography>
											</div>
											<div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
												<Typography className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Newsletter Bonus</Typography>
												<Typography className="text-gray-900 dark:text-gray-100 font-semibold">
													{(reservation.extended as EventExtendedData)?.newsletter?.bonus || dictionary.reservation.notAvailable}
												</Typography>
											</div>
										</div>
									)}
								</div>
							)}
						{/* Footer */}
						<div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
							<Link href={`/${locale}`} passHref>
								<Button
									variant="contained"
									className="w-full !bg-[#cc9678] hover:!bg-[#a6755a] text-white font-semibold py-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02]"
									sx={{
										textTransform: "none",
										boxShadow: "0 10px 25px -5px rgba(204, 150, 120, 0.5)",
										"&:hover": {
											boxShadow: "0 20px 40px -10px rgba(204, 150, 120, 0.6)",
										},
									}}>
									{dictionary.reservation.goHome}
								</Button>
							</Link>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
