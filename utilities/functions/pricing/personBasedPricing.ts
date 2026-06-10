/** @format */

import { JsonValue } from "@prisma/client/runtime/library"

export interface PersonBasedPricing {
	id: number
	propertyId: number
	basePersonCount: number
	adjustments: JsonValue
	createdAt: Date
	updatedAt: Date
}

interface ParsedAdjustments {
	[personCount: string]: {
		enabled: boolean
		percent: number
		user?: string
	}
}

/**
 * Parse adjustments from JsonValue to typed object
 */
function parseAdjustments(adjustments: JsonValue): ParsedAdjustments {
	if (typeof adjustments === "object" && adjustments !== null && !Array.isArray(adjustments)) {
		return adjustments as ParsedAdjustments
	}
	return {}
}

/**
 * Calculate price adjustment based on person count using PersonBasedPricing configuration
 * @param basePrice - The base price before person-based adjustment
 * @param personCount - Number of persons for the booking
 * @param personBasedPricing - PersonBasedPricing configuration for the property
 * @returns Adjusted price based on person count
 */
export function calculatePersonBasedPrice(basePrice: number, personCount: number, personBasedPricing?: PersonBasedPricing | null): number {
	// If no person-based pricing configuration, return base price
	if (!personBasedPricing) {
		return basePrice
	}

	const { basePersonCount, adjustments } = personBasedPricing

	// Parse adjustments from JsonValue
	const parsedAdjustments = parseAdjustments(adjustments)

	// If person count matches base person count, no adjustment needed
	if (personCount === basePersonCount) {
		return basePrice
	}

	// Check if there's an adjustment for this specific person count
	const personCountStr = personCount.toString()
	const adjustment = parsedAdjustments[personCountStr]

	if (adjustment && adjustment.enabled) {
		// Apply percentage adjustment - limit to reasonable range to prevent insane calculations
		const clampedPercent = Math.max(-50, Math.min(adjustment.percent, 500)) // -50% to +500%
		const adjustmentFactor = clampedPercent / 100

		// If person count is less than base, typically it's a discount (positive percent means discount)
		// If person count is more than base, typically it's a surcharge (positive percent means surcharge)
		if (personCount < basePersonCount) {
			// Discount scenario - reduce price
			return basePrice * (1 - adjustmentFactor)
		} else {
			// Surcharge scenario - increase price
			return basePrice * (1 + adjustmentFactor)
		}
	}

	// If no specific adjustment found, return base price
	return basePrice
}

/**
 * Get the adjusted price for a property based on person count
 * @param property - Property object with personBasedPricings array
 * @param personCount - Number of persons for the booking
 * @param basePrice - Base price to adjust
 * @returns Adjusted price or original price if no person-based pricing configured
 */
export function getPersonAdjustedPrice(
	property: {
		personBasedPricings?: PersonBasedPricing[]
	},
	personCount: number,
	basePrice: number
): number {
	// Get the first (and typically only) person-based pricing configuration
	const personBasedPricing = property.personBasedPricings?.[0]

	return calculatePersonBasedPrice(basePrice, personCount, personBasedPricing)
}

/**
 * Check if a property has person-based pricing configured
 * @param property - Property object
 * @returns True if property has person-based pricing configuration
 */
export function hasPersonBasedPricing(property: { personBasedPricings?: PersonBasedPricing[] }): boolean {
	return Array.isArray(property.personBasedPricings) && property.personBasedPricings.length > 0
}
