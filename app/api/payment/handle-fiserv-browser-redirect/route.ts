/** @format */

// app/api/payment/handle-fiserv-browser-redirect/route.ts
import { NextRequest, NextResponse } from "next/server"
import CryptoJS from "crypto-js" // ADDED for hash verification
import prisma from "@/prisma/prisma"
import { Prisma } from "@prisma/client"
import { addAccessTokenToEvent } from "@/utilities/functions/auth/reservationToken"
import { createEventEntry } from "@/utilities/functions/eventEntry"
import { EventEntryType } from "@/utilities/types"

// Type for payment metadata
interface PaymentMetadata {
	verifiedBy?: string
	verifiedAt?: string
	fiservRedirectData?: Record<string, string>
	finalStatusReason?: string
	providerMessage?: string
	lastVerifiedAt?: string
	[key: string]: unknown
}

const NEXT_PUBLIC_FISERV_STORENAME = process.env.NEXT_PUBLIC_FISERV_STORENAME || "7673847615"

// Constants adapted from verify/route.ts
const FISERV_APPROVED_STATUSES: string[] = ["APPROVED", "AKCEPTACJA"]
const FISERV_WAITING_STATUSES: string[] = ["PENDING", "OCZEKIWANIE"]
const REQUIRED_REDIRECT_PARAMS: string[] = ["oid", "status"] // Fields expected in the redirect

function verifyRedirectHash(params: URLSearchParams, secret: string, receivedHash: string | null): boolean {
	if (!secret) {
		console.error("Shared secret is not provided or empty. Cannot perform hash verification.")
		return false
	}

	if (!receivedHash) {
		console.error("Received hash is missing. Cannot perform hash verification.")
		return false
	}

	// Standard response_hash uses a specific set of fields in a specific order:
	// approval_code|chargetotal|currency|txndatetime|storename

	const approvalCode = params.get("approval_code")
	const chargeTotal = params.get("chargetotal") // Corrected variable name
	const currency = params.get("currency")
	// This txndatetime should be the one Fiserv echoes back from your original request.
	const txnDatetime = params.get("txndatetime")

	// IMPORTANT: The storename used in the original transaction.
	// This value is from your FiservPaymentHPP.tsx and fiserv-hash/route.ts.
	// Consider moving this to an environment variable (e.g., process.env.FISERV_STORENAME)
	const storename = NEXT_PUBLIC_FISERV_STORENAME

	// Log the values being used for the hash components
	console.log("[verifyRedirectHash] Components for standard hash:", {
		approvalCode,
		chargeTotal,
		currency,
		txnDatetime,
		storename,
	})

	// Check if all required parameters for the hash are present and not null/empty
	if (!approvalCode || !chargeTotal || !currency || !txnDatetime || !storename) {
		console.error(
			"[verifyRedirectHash] Missing one or more required parameters from redirect for standard hash. Ensure approval_code, chargetotal, currency, txndatetime are present in redirect, and storename is configured.",
		)
		return false
	}

	const stringToHash = [
		approvalCode,
		chargeTotal, // Corrected variable name
		currency,
		txnDatetime,
		storename,
	].join("|")

	console.log("[verifyRedirectHash] String to hash (standard):", stringToHash)

	try {
		// Use the secret (hex string) directly, consistent with app/api/fiserv-hash/route.ts
		const calculatedHash = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(stringToHash, secret))

		console.log("[verifyRedirectHash] Calculated Hash (standard):", calculatedHash)
		console.log("[verifyRedirectHash] Received Hash:", receivedHash)

		return calculatedHash === receivedHash
	} catch (e) {
		console.error("Error during hash calculation/verification (CryptoJS - standard):", e)
		return false
	}
}

async function handler(request: NextRequest) {
	const { searchParams: initialSearchParams } = new URL(request.url)

	const allReceivedParams = new URLSearchParams(initialSearchParams.toString())

	let postBodyForLogging: Record<string, string> = {}

	if (request.method === "POST") {
		try {
			const formData = await request.formData()
			postBodyForLogging = {}
			formData.forEach((value, key) => {
				if (typeof value === "string") {
					allReceivedParams.set(key, value) // POST params override GET params
					postBodyForLogging[key] = value // Populate for logging
				}
			})
		} catch (error) {
			console.error("Error parsing form data in Fiserv browser redirect POST:", error)
			// Decide how to handle this - maybe redirect to fail page
		}
	}

	console.log("postBodyForLogging", postBodyForLogging)

	// Extract key parameters for logic and logging
	const oid = allReceivedParams.get("oid")
	const fiservStatusFromRedirect = allReceivedParams.get("status")
	const eventId = allReceivedParams.get("eventId") // Keep eventId for forwarding
	const locale = allReceivedParams.get("locale") || "pl"
	const receivedHash = allReceivedParams.get("response_hash") // Or whatever Fiserv calls it

	const isHashVerified = verifyRedirectHash(allReceivedParams, process.env.FISERV_SHARED_SECRET || "", receivedHash)
	console.log(`[Redirect Route] Hash verification result: ${isHashVerified}`)

	let isDbUpdateSuccess = false
	let finalPaymentStatusForRedirect: string | null = null

	if (!isHashVerified) {
		// Hash verification failed - Log this attempt if needed, but don't update payment
		// Consider creating a generic log entry if oid is present, without linking to specific payment fields if they might be tampered
		console.warn(`[Redirect Route] Hash verification failed for OID: ${oid || "N/A"}. Params: ${JSON.stringify(Object.fromEntries(allReceivedParams))}`)
	} else if (!oid || !fiservStatusFromRedirect) {
		console.warn("[Redirect Route] Missing oid or status in redirect params.")
	} else {
		let missingField = null
		for (const field of REQUIRED_REDIRECT_PARAMS) {
			if (!allReceivedParams.has(field) || !allReceivedParams.get(field)) {
				missingField = field
				break
			}
		}

		if (missingField) {
			console.warn(`[Redirect Route] Missing required redirect parameter: ${missingField}`)
		} else {
			try {
				const existingPayment = await prisma.payment.findUnique({
					where: { orderId: oid },
				})

				if (!existingPayment) {
					console.warn(`[Redirect Route] Payment not found for orderId: ${oid}`)
				} else if (
					existingPayment.status === "COMPLETED" &&
					existingPayment.metadata &&
					typeof existingPayment.metadata === "object" &&
					(existingPayment.metadata as PaymentMetadata).verifiedBy === "BROWSER_REDIRECT"
				) {
					isDbUpdateSuccess = true
					finalPaymentStatusForRedirect = existingPayment.status
				} else if (existingPayment.status === "COMPLETED") {
					isDbUpdateSuccess = true // Consider it a success for redirect purposes
					finalPaymentStatusForRedirect = existingPayment.status
				} else {
					const upperCaseFiservStatus = fiservStatusFromRedirect.toUpperCase()
					const isSuccessfulPayment = FISERV_APPROVED_STATUSES.includes(upperCaseFiservStatus)
					const isPendingPayment = FISERV_WAITING_STATUSES.includes(upperCaseFiservStatus)
					const targetStatus = isSuccessfulPayment ? "COMPLETED" : isPendingPayment ? "PENDING" : "FAILED"
					finalPaymentStatusForRedirect = targetStatus

					const paymentUpdateData: Prisma.PaymentUpdateInput = {
						status: targetStatus,
						providerPaymentId:
							existingPayment.providerPaymentId || allReceivedParams.get("ipgTransactionId") || allReceivedParams.get("endpointTransactionId"),
						// Directly update Payment model with all relevant Fiserv fields
						failStatus: allReceivedParams.get("fail") === "true",
						hostedDataId: allReceivedParams.get("hosteddataid"),
						cardLastFourDigits: allReceivedParams.get("cardLastFourDigits"),
						transactionProcessedDate: allReceivedParams.get("txndate_processed"),
						cardBin: allReceivedParams.get("ccbin") || allReceivedParams.get("cardBin"),
						cardTimezone: allReceivedParams.get("timezone"),
						cardCountry: allReceivedParams.get("cccountry"),
						cardExpiryMonth: allReceivedParams.get("expmonth"),
						cardExpiryYear: allReceivedParams.get("expyear"),
						hashAlgorithm: allReceivedParams.get("hash_algorithm"),
						endpointTransactionId: allReceivedParams.get("endpointTransactionId"),
						providerCurrencyCode: allReceivedParams.get("currency"),
						processorResponseCode: allReceivedParams.get("processor_response_code"),
						chargeTotal: allReceivedParams.get("chargetotal"),
						terminalId: allReceivedParams.get("terminal_id"),
						approvalCode: allReceivedParams.get("approval_code"),
						hostedDataType: allReceivedParams.get("hostedDataType"),
						responseHash: receivedHash,
						responseCode3dSecure: allReceivedParams.get("response_code_3dsecure"),
						transactionNotificationURL: allReceivedParams.get("transactionNotificationURL"),
						schemeTransactionId: allReceivedParams.get("schemeTransactionId"),
						transactionTimestamp: allReceivedParams.get("tdate"),
						installmentsInterest: allReceivedParams.get("installments_interest") === "true",
						cardBrand: allReceivedParams.get("ccbrand"),
						fundingCardBin: allReceivedParams.get("fundingCardNumberBin"),
						referenceNumber: allReceivedParams.get("refnumber"),
						fundingCardLast4: allReceivedParams.get("fundingCardNumberLast4"),
						transactionType: allReceivedParams.get("txntype"),
						providerPaymentMethod: allReceivedParams.get("paymentMethod"),
						transactionDateTime: allReceivedParams.get("txndatetime"),
						maskedCardNumber: allReceivedParams.get("cardnumber"),
						providerStatus: fiservStatusFromRedirect,

						metadata: {
							...(typeof existingPayment.metadata === "object" && existingPayment.metadata !== null ? existingPayment.metadata : {}),
							fiservRedirectData: Object.fromEntries(allReceivedParams),
							finalStatusReason: fiservStatusFromRedirect,
							postBodyForLogging: postBodyForLogging,
							providerMessage: allReceivedParams.get("errorMessage") || allReceivedParams.get("message") || fiservStatusFromRedirect,
							lastVerifiedAt: new Date().toISOString(),
							...(targetStatus === "COMPLETED" && {
								verifiedBy: "BROWSER_REDIRECT",
							}),
							...(existingPayment.metadata &&
								typeof existingPayment.metadata === "object" &&
								!(existingPayment.metadata as PaymentMetadata).verifiedAt &&
								targetStatus === "COMPLETED" && {
									verifiedAt: new Date().toISOString(),
								}),
						},
					}
					console.log("paymentUpdateData", paymentUpdateData)

					if (targetStatus === "COMPLETED" && existingPayment.status !== "COMPLETED" && !existingPayment.paymentDate) {
						paymentUpdateData.paymentDate = new Date()
					}
					await prisma.payment.update({
						where: { id: existingPayment.id },
						data: paymentUpdateData,
					})

					if (eventId && finalPaymentStatusForRedirect === "COMPLETED") {
						const event = await prisma.event.findUnique({
							where: { id: parseInt(eventId) },
							select: {
								id: true,
								name: true,
								startDate: true,
								amountOfPeople: true,
								source: true,
								accessToken: true,
								endDate: true,
								price: true,
								cityTax: true,
								extraFees: true,
								deposit: true, // Add deposit to see current value
								property: {
									select: {
										name: true,
										id: true,
									},
								},
							},
						})

						if (event) {
							// Calculate total event amount for full payment
							// event.price includes: discounted base price + cleaning fee + parking/garage fees
							// event.cityTax is stored separately and needs to be added for full payment
							// event.extraFees includes: additional fees that may be paid separately
							const totalEventAmount = (event.price || 0) + (event.cityTax || 0)
							const paymentAmount = parseFloat((allReceivedParams.get("chargetotal") || "0").replace(",", "."))

							// Only mark as paid if this is a full online payment (payment covers price + city tax)
							const isFullPayment = paymentAmount >= totalEventAmount

							// Generate access token if not already present
							if (!event.accessToken) {
								try {
									await addAccessTokenToEvent(prisma, event.id, event.endDate)
									console.log(`[Redirect Route] Generated access token for event ${event.id}`)
								} catch (tokenError) {
									console.error(`[Redirect Route] Failed to generate access token for event ${event.id}:`, tokenError)
								}
							}

							// Calculate new deposit amount (accumulate if there are multiple payments)
							const currentDeposit = parseFloat((event.deposit || "0").replace(",", ".")) || 0
							const newDepositAmount = currentDeposit + paymentAmount
							const newDepositString = newDepositAmount.toFixed(2).replace(".", ",")

							console.log(
								`[Redirect Route] Updating event ${eventId} deposit: current=${event.deposit}, payment=${paymentAmount}, new=${newDepositString}, isFullPayment=${isFullPayment}`,
							)

							// Update event with payment information
							try {
								await prisma.event.update({
									where: { id: parseInt(eventId) },
									data: {
										paid: isFullPayment,
										paymentId: oid,
										deposit: newDepositString,
									},
								})

								// Create EventEntry notification for new calendar event
								try {
									await createEventEntry({
										type: EventEntryType.PAYMENT_RECEIVED,
										title: "Payment Received for Event",
										message: "", // Will be constructed on client side
										data: {
											eventType: "calendar_event",
											eventId: event.id,
											propertyName: event.property?.name,
											eventName: event.name,
											startDate: event.startDate,
											endDate: event.endDate,
											amountOfPeople: event.amountOfPeople,
											price: newDepositString,
											source: event.source || "msc",
											createdByUser: `${event.source || "System"}`,
											messageKey: "paymentReceivedMessage",
										},
										propertyId: event.property?.id || undefined,
									})
								} catch (eventEntryError) {
									console.error("Error creating EventEntry for new calendar event:", eventEntryError)
									// Don't fail the event creation if notification creation fails
								}
								console.log(`[Redirect Route] Successfully updated event ${eventId} with deposit: ${newDepositString}, paid: ${isFullPayment}`)
							} catch (eventUpdateError) {
								console.error(`[Redirect Route] Failed to update event ${eventId}:`, eventUpdateError)
							}

							// Send Telegram notification for successful payment
							try {
								const paymentAmount = parseFloat(allReceivedParams.get("chargetotal") || "0")
								const rawCurrency = allReceivedParams.get("currency") || "PLN"

								// Map numeric currency codes to alphabetic codes
								const currencyMap: Record<string, string> = {
									"985": "PLN", // Polish Złoty
									"978": "EUR", // Euro
									"840": "USD", // US Dollar
									"826": "GBP", // British Pound
									"203": "CZK", // Czech Koruna
									// Add more mappings as needed
								}

								const currency = currencyMap[rawCurrency] || rawCurrency
								const propertyName = event.property?.name || "Unknown Property"
								const telegramMessage = `💰 Płatność zrealizowana! Kwota: ${paymentAmount} ${currency}, Apartament: ${propertyName}, Rezerwacja: ${event.id}, OID: ${oid}, status: ${finalPaymentStatusForRedirect}`

								const telegramResponse = await fetch("http://localhost:4000/api/send-telegram", {
									method: "POST",
									headers: { "Content-Type": "application/json" },
									body: JSON.stringify({
										chatIds: ["1691373957"],
										message: telegramMessage,
										propertyName: "NOWA PŁATNOŚĆ",
									}),
								})

								if (!telegramResponse.ok) {
									console.error(`Telegram notification failed with status ${telegramResponse.status}`)
								} else {
									console.log(`Sent Telegram notification for successful payment: ${telegramMessage}`)
								}
							} catch (telegramError) {
								console.error(`Failed to send Telegram notification for payment:`, telegramError)
							}
						} else {
							console.warn(`[Redirect Route] Event ${eventId} not found for deposit update`)
						}
					}
					isDbUpdateSuccess = true
				}
			} catch (error: unknown) {
				isDbUpdateSuccess = false
				finalPaymentStatusForRedirect = "FAILED"
				console.error(`[Redirect Route] Error processing Fiserv redirect for orderId ${oid}:`, error)
			}
		}
	}

	let redirectPath
	let successForRedirectPath = false
	if (finalPaymentStatusForRedirect) {
		successForRedirectPath = finalPaymentStatusForRedirect === "COMPLETED"
	} else {
		successForRedirectPath =
			isHashVerified && !!oid && !!fiservStatusFromRedirect && FISERV_APPROVED_STATUSES.includes(fiservStatusFromRedirect.toUpperCase())
	}

	if (successForRedirectPath) {
		redirectPath = `/${locale}/payment-success`
	} else {
		redirectPath = `/${locale}/payment-fail`
	}

	const siteUrl = request.nextUrl.origin
	const redirectUrl = new URL(redirectPath, siteUrl)

	allReceivedParams.forEach((value, key) => {
		if (key.toLowerCase() !== "locale" || (request.method === "POST" && postBodyForLogging.hasOwnProperty(key))) {
			redirectUrl.searchParams.append(key, value)
		}
	})
	if (eventId && !allReceivedParams.has("eventId")) {
		redirectUrl.searchParams.append("eventId", eventId)
	}
	if (fiservStatusFromRedirect && FISERV_APPROVED_STATUSES.includes(fiservStatusFromRedirect.toUpperCase()) && !isDbUpdateSuccess && isHashVerified) {
		if (oid && fiservStatusFromRedirect) {
			redirectUrl.searchParams.append("db_update_failed", "true")
		}
	}

	return NextResponse.redirect(redirectUrl.toString(), 303)
}

export { handler as GET, handler as POST }
