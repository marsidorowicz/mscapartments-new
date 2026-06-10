/** @format */

import { NextRequest, NextResponse } from "next/server"
import CryptoJS from "crypto-js"

export async function POST(req: NextRequest) {
	const body = await req.json()

	// List of gateway-specified fields in the same pattern/order as hardcoded form
	const fiservFields = [
		"assignToken",
		"authenticateTransaction",
		"chargetotal",
		"checkoutoption",
		"currency",
		"hash_algorithm",
		"oid",
		"paymentMethod",
		"responseFailURL",
		"responseSuccessURL",
		"storename",
		"timezone",
		"transactionNotificationURL",
		"txndatetime",
		"txntype",
		"unscheduledCredentialOnFileType",
		"tokenType", // Added tokenType
	]

	// Build params object from request body, using only the above fields
	const params = fiservFields.reduce((acc, key) => {
		if (body[key] !== undefined && body[key] !== "") {
			acc[key] = body[key]
		}
		return acc
	}, {} as Record<string, string>)

	// Sort by parameter name (ASCII order, uppercase before lowercase)
	const sorted = Object.entries(params).sort(([a], [b]) => a.localeCompare(b))
	const stringToExtendedHash = sorted.map(([, v]) => v).join("|")

	const sharedSecret = process.env.FISERV_SHARED_SECRET
	if (!sharedSecret) {
		return NextResponse.json({ error: "Missing Fiserv secret key" }, { status: 500 })
	}

	const hashExtended = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(stringToExtendedHash, sharedSecret))

	return NextResponse.json({ hashExtended })
}
