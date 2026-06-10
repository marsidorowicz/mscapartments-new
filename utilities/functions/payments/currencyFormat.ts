/** @format */

// Currency numeric codes mapping to their ISO codes
const currencyCodeMap: Record<string, string> = {
	"985": "PLN",
	"978": "EUR",
	"840": "USD",
	"826": "GBP",
	"203": "CZK",
	"348": "HUF",
	"756": "CHF",
	"124": "CAD",
	"643": "RUB",
	"980": "UAH",
	// Add more currency codes as needed
}

/**
 * Convert a numeric currency code to its ISO code format
 * @param code The numeric currency code (e.g., '985')
 * @returns The ISO currency code (e.g., 'PLN')
 */
export const getIsoCurrencyCode = (code: string | null | undefined): string => {
	if (!code) return "PLN" // Default to PLN if no code provided
	return currencyCodeMap[code] || code // Return the mapped code or the original if no mapping exists
}

/**
 * Format an amount and currency for display
 * @param amount The amount to display
 * @param currencyCode The currency code (numeric or ISO)
 * @returns Formatted string with amount and currency
 */
export const formatCurrency = (amount: number | string | null | undefined, currencyCode: string | null | undefined): string => {
	if (amount === null || amount === undefined) return "0.00 PLN"

	// Convert amount to a number if it's a string
	const numAmount = typeof amount === "string" ? parseFloat(amount.replace(",", ".")) : amount

	// Get the ISO currency code
	const currency = getIsoCurrencyCode(currencyCode)

	// Format the amount with 2 decimal places
	return `${numAmount.toFixed(2)} ${currency}`
}
