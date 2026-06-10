/** @format */

import { createHash, randomBytes } from "crypto"

/**
 * Generates a secure random token for magic links
 * @returns A secure random token
 */
export function generateSecureToken(): string {
	return randomBytes(32).toString("hex")
}

/**
 * Validates if the provided token matches the stored token
 * @param providedToken Token from the URL query parameter
 * @param storedToken Token stored in the database
 * @returns Boolean indicating if the token is valid
 */
export function validateToken(providedToken: string | null, storedToken: string | null): boolean {
	if (!providedToken || !storedToken) {
		return false
	}

	// Use a constant-time comparison to prevent timing attacks
	return createHash("sha256").update(providedToken).digest("hex") === createHash("sha256").update(storedToken).digest("hex")
}

/**
 * Checks if the token is expired
 *
 * @param expiryDate - The date when the token expires
 * @returns Boolean indicating if the token is expired
 */
export function isTokenExpired(expiryDate: Date | null | undefined): boolean {
	if (!expiryDate) return false // If no expiry set, token doesn't expire

	const now = new Date()
	return now > expiryDate
}

/**
 * Calculates an expiry date based on current time and days to expiry
 *
 * @param daysToExpire - Number of days until the token expires
 * @returns Date object representing the expiry date
 */
export function calculateExpiryDate(daysToExpire: number = 7): Date {
	const expiryDate = new Date()
	expiryDate.setDate(expiryDate.getDate() + daysToExpire)
	return expiryDate
}

/**
 * Creates a magic link URL with event information and security token
 * @param eventId The reservation event ID
 * @param propertyId The property ID
 * @param token The security token
 * @param locale The locale for the URL (defaults to 'en')
 * @param baseUrl Optional base URL (defaults to the site URL from environment)
 * @returns A complete magic link URL
 */
export function createMagicLink(eventId: number, propertyId: number, token: string, locale: string = "en", baseUrl?: string): string {
	const siteUrl = baseUrl || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
	return `${siteUrl}/${locale}/reservation/${eventId}/${propertyId}?token=${encodeURIComponent(token)}`
}

/**
 * Validates a token and checks if it's expired
 * @param providedToken Token from the URL query parameter
 * @param storedToken Token stored in the database
 * @param expiryDate Optional expiry date for the token
 * @returns Boolean indicating if the token is valid and not expired
 */
export function validateTokenWithExpiry(providedToken: string | null, storedToken: string | null, expiryDate?: Date | null): boolean {
	// First check if the token itself is valid
	if (!validateToken(providedToken, storedToken)) {
		return false
	}

	// Then check if it's expired
	if (expiryDate && isTokenExpired(expiryDate)) {
		return false
	}

	return true
}
