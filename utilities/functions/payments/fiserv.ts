/** @format */

import crypto from "crypto"

// Types for Fiserv requests
export interface FiservPaymentRequest {
	apiKey?: string
	merchantId?: string
	amount: number
	currency: string
	orderId?: string
	[key: string]: any // Allow for other properties
}

// Function to generate a UUID for Client-Request-Id
export function generateRequestId(): string {
	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000)
			.toString(16)
			.substring(1)
	}
	return s4() + s4() + s4() + s4() + s4() + s4() + s4() + s4()
}

/**
 * Generate HMAC signature for Fiserv API request according to their documentation
 * @param payload - The request payload to sign
 * @param apiKey - The API key for Fiserv
 * @param secretKey - The secret key for HMAC generation
 * @param clientRequestId - Client request ID (UUID)
 * @param timestamp - Current timestamp in milliseconds
 * @returns Object with generated headers and values
 */
export function generateFiservHmacHeaders(
	payload: any,
	apiKey: string,
	secretKey: string,
	clientRequestId?: string,
	timestamp?: number
): Record<string, string | number> {
	// Use provided values or generate new ones
	const requestId = clientRequestId || generateRequestId()
	const ts = timestamp || new Date().getTime()

	// Convert payload to string if it's not already a string
	const requestBody = typeof payload === "string" ? payload : JSON.stringify(payload)

	// Create raw signature string exactly as Fiserv requires
	const rawSignature = apiKey + requestId + ts + requestBody

	// Generate HMAC signature using SHA-256 and Base64 encoding
	const hmac = crypto.createHmac("sha256", secretKey)
	hmac.update(rawSignature)
	const computedHmac = hmac.digest("base64")

	// Return all required headers
	return {
		"Content-Type": "application/json",
		"Client-Request-Id": requestId,
		"Api-Key": apiKey,
		Timestamp: ts,
		"Auth-Token-Type": "HMAC",
		Authorization: computedHmac,
	}
}

/**
 * Validate the HMAC signature from Fiserv webhook or response
 */
export function validateFiservSignature(
	payload: any,
	headers: {
		"Client-Request-Id"?: string
		"Api-Key"?: string
		Timestamp?: string
		Authorization?: string
	},
	secretKey: string
): boolean {
	// Extract required values from headers
	const apiKey = headers["Api-Key"]
	const clientRequestId = headers["Client-Request-Id"]
	const timestamp = headers["Timestamp"]
	const receivedSignature = headers["Authorization"]

	if (!apiKey || !clientRequestId || !timestamp || !receivedSignature) {
		return false
	}

	// Convert payload to string if it's not already
	const requestBody = typeof payload === "string" ? payload : JSON.stringify(payload)

	// Recreate the raw signature
	const rawSignature = apiKey + clientRequestId + timestamp + requestBody

	// Generate HMAC signature for comparison
	const hmac = crypto.createHmac("sha256", secretKey)
	hmac.update(rawSignature)
	const computedHmac = hmac.digest("base64")

	// Use a constant-time comparison to prevent timing attacks
	try {
		return crypto.timingSafeEqual(new Uint8Array(Buffer.from(computedHmac)), new Uint8Array(Buffer.from(receivedSignature)))
	} catch (error) {
		console.error("Error comparing signatures:", error)
		return false
	}
}

// Environment check to ensure we're not exposing secrets
export function getFiservCredentials() {
	const apiKey = process.env.FISERV_API_KEY
	const secretKey = process.env.FISERV_SECRET_KEY
	const merchantId = process.env.FISERV_MERCHANT_ID

	if (!apiKey || !secretKey || !merchantId) {
		throw new Error("Missing Fiserv credentials in environment variables")
	}

	return { apiKey, secretKey, merchantId }
}
