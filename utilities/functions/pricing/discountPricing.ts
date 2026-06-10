/** @format */

export interface DiscountData {
	discountType: 'PERCENTAGE' | 'FIXED_AMOUNT'
	discountValue: number
	campaignId: string
	codeId: string
}

export interface PriceBreakdown {
	originalBasePrice: number
	discountedBasePrice: number
	discountAmount: number
	cleaningFee: number
	cityTax: number
	finalPrice: number
}

/**
 * Calculate discounted pricing where only base price gets discounted
 * Cleaning fee and city tax remain unchanged
 */
export function calculateDiscountedPrice(
	basePrice: number,
	cleaningFee: number,
	cityTax: number,
	discountData?: DiscountData | null
): PriceBreakdown {
	let discountedBasePrice = basePrice
	let discountAmount = 0

	if (discountData) {
		if (discountData.discountType === 'PERCENTAGE') {
			discountAmount = basePrice * (discountData.discountValue / 100)
			discountedBasePrice = basePrice - discountAmount
		} else {
			// FIXED_AMOUNT
			discountAmount = Math.min(discountData.discountValue, basePrice)
			discountedBasePrice = basePrice - discountAmount
		}
	}

	const finalPrice = discountedBasePrice + cleaningFee + cityTax

	return {
		originalBasePrice: basePrice,
		discountedBasePrice,
		discountAmount,
		cleaningFee,
		cityTax,
		finalPrice
	}
}

/**
 * Validate discount code format (basic client-side validation)
 */
export function isValidDiscountCodeFormat(code: string): boolean {
	if (!code || typeof code !== 'string') return false

	// Remove spaces and convert to uppercase for validation
	const cleanCode = code.trim().toUpperCase()

	// Basic validation: alphanumeric, hyphens, underscores, 3-20 characters
	const codeRegex = /^[A-Z0-9_-]{3,20}$/

	return codeRegex.test(cleanCode)
}