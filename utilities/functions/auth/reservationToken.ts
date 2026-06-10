/** @format */

import { generateSecureToken } from "./magicLink"
import { format, setMinutes, setHours } from "date-fns"

/**
 * Generates an access token for a reservation event
 * @returns A secure random token for accessing reservation details
 */
export function generateReservationAccessToken(): string {
	return generateSecureToken()
}

/**
 * Formats a date with the specified check-in or check-out hour
 *
 * @param date - The date to format
 * @param hour - The hour to set (24hr format)
 * @returns A date object with the specified hour
 */
export function formatEventDate(date: Date | string, hour: number): Date {
	return setMinutes(setHours(new Date(date), hour), 0)
}

/**
 * Gets check-in/check-out hour from property settings or uses fallback
 *
 * @param timeStr - Time string from property settings (format: "HH:MM")
 * @param fallback - Fallback hour if timeStr is invalid
 * @returns The hour as a number
 */
export function getPropertyHour(timeStr: string | undefined, fallback: number): number {
	if (!timeStr) return fallback
	const h = parseInt(timeStr.split(":")[0], 10)
	return isNaN(h) ? fallback : h
}

/**
 * Determines if a token needs to be regenerated based on date changes
 * 
 * @param existingToken - The existing access token
 * @param existingExpiryDate - The existing token expiry date
 * @param newExpiryDate - The new expiry date (typically matches event end date)
 * @param hoursThreshold - Hours threshold before expiration to trigger regeneration (not used if dates haven't changed)
 * @returns Whether the token needs to be regenerated
 */
export function tokenNeedsRegeneration(
	existingToken: string | null | undefined,
	existingExpiryDate: Date | null | undefined,
	newExpiryDate: Date,
	hoursThreshold: number = 48
): boolean {
	// If no token exists, it needs to be generated
	if (!existingToken) return true

	// If no expiry date exists, it needs to be generated
	if (!existingExpiryDate) return true

	// If dates are different, it needs to be regenerated
	const datesChanged = format(new Date(existingExpiryDate), "yyyy-MM-dd") !== format(new Date(newExpiryDate), "yyyy-MM-dd")

	// Only regenerate token if dates have changed
	return datesChanged;
}

/**
 * Updates an existing event with an access token and expiry date
 *
 * @param prisma - The Prisma Client instance
 * @param eventId - The ID of the event to update
 * @param expiryDate - The date when the token should expire (defaults to the event end date)
 * @returns The updated event object with token information
 */
export async function addAccessTokenToEvent(prisma: any, eventId: number, expiryDate?: Date): Promise<any> {
	if (!eventId) {
		throw new Error("Event ID is required to add access token")
	}

	const accessToken = generateReservationAccessToken()

	try {
		const updatedEvent = await prisma.event.update({
			where: { id: eventId },
			data: {
				accessToken,
				accessTokenExpiry: expiryDate || undefined,
			},
		})

		return updatedEvent
	} catch (error) {
		console.error("Error adding access token to event:", error)
		throw error
	}
}
