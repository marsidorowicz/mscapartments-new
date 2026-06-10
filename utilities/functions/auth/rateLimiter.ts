/** @format */

/**
 * Simple in-memory rate limiter implementation to protect against brute force attacks
 * For production use, consider using Redis or a similar solution for distributed setups
 */

// Rate limit configuration
const MAX_VALID_ATTEMPTS = 10 // Maximum number of valid attempts per window
const MAX_INVALID_ATTEMPTS = 2 // Maximum number of invalid attempts per window
const WINDOW_MS = 15 * 60 * 1000 // 15 minutes window
const BLOCK_DURATION_MS = 30 * 60 * 1000 // 30 minutes block duration

// Type definitions
interface RateLimitRecord {
	validAttempts: number
	invalidAttempts: number
	firstAttempt: number
	blocked: boolean
	blockedUntil?: number
	blockReason?: "INVALID_LIMIT" | "VALID_LIMIT"
}

// Track attempts by IP and optional identifier (e.g. eventId)
const attemptRecords = new Map<string, RateLimitRecord>()

/**
 * Cleanup function to remove old records (call periodically or on startup)
 */
export function cleanupRateLimiter(): void {
	const now = Date.now()
	for (const [key, record] of attemptRecords.entries()) {
		// Remove expired blocks
		if (
			record.blocked &&
			record.blockedUntil &&
			record.blockedUntil < now
		) {
			attemptRecords.delete(key)
			continue
		}

		// Remove old records
		if (now - record.firstAttempt > WINDOW_MS) {
			attemptRecords.delete(key)
		}
	}
}

/**
 * Checks if a request is allowed or should be rate limited
 *
 * @param ip - Client IP address
 * @param identifier - Optional identifier (e.g. eventId) to make the rate limiting more specific
 * @param isSuccessful - Whether the current attempt was successful
 * @returns An object indicating if the request is allowed and details if blocked
 */
export function checkRateLimit(
	ip: string,
	identifier: string = "",
	isSuccessful?: boolean
): {
	allowed: boolean
	remainingValidAttempts?: number
	remainingInvalidAttempts?: number
	blockedUntil?: Date
	retryAfterSeconds?: number
	blockReason?: string
} {
	const now = Date.now()
	const key = `${ip}:${identifier}`

	// Get or create record
	const record = attemptRecords.get(key) || {
		validAttempts: 0,
		invalidAttempts: 0,
		firstAttempt: now,
		blocked: false,
	}

	// Check if already blocked
	if (record.blocked) {
		if (record.blockedUntil && record.blockedUntil < now) {
			// Block expired, reset the record
			attemptRecords.delete(key)
			// If this is a new request, handle it
			if (isSuccessful !== undefined) {
				const newRecord = {
					validAttempts: isSuccessful ? 1 : 0,
					invalidAttempts: isSuccessful ? 0 : 1,
					firstAttempt: now,
					blocked: false,
				}
				attemptRecords.set(key, newRecord)

				return {
					allowed: true,
					remainingValidAttempts:
						MAX_VALID_ATTEMPTS - newRecord.validAttempts,
					remainingInvalidAttempts:
						MAX_INVALID_ATTEMPTS - newRecord.invalidAttempts,
				}
			}
		}

		// Still blocked
		return {
			allowed: false,
			blockedUntil: record.blockedUntil
				? new Date(record.blockedUntil)
				: undefined,
			retryAfterSeconds: record.blockedUntil
				? Math.ceil((record.blockedUntil - now) / 1000)
				: undefined,
			blockReason: record.blockReason,
		}
	}

	// Reset window if it expired
	if (now - record.firstAttempt > WINDOW_MS) {
		record.validAttempts = 0
		record.invalidAttempts = 0
		record.firstAttempt = now
	}

	// If this is just a check (no attempt being made)
	if (isSuccessful === undefined) {
		return {
			allowed: true,
			remainingValidAttempts: MAX_VALID_ATTEMPTS - record.validAttempts,
			remainingInvalidAttempts:
				MAX_INVALID_ATTEMPTS - record.invalidAttempts,
		}
	}

	// Increment appropriate counter based on success/failure
	if (isSuccessful) {
		record.validAttempts += 1

		// Check if valid attempts limit exceeded
		if (record.validAttempts >= MAX_VALID_ATTEMPTS) {
			record.blocked = true
			record.blockedUntil = now + BLOCK_DURATION_MS
			record.blockReason = "VALID_LIMIT"
			attemptRecords.set(key, record)

			return {
				allowed: false,
				blockedUntil: new Date(record.blockedUntil),
				retryAfterSeconds: Math.ceil(BLOCK_DURATION_MS / 1000),
				blockReason: "Too many requests - valid limit exceeded",
			}
		}
	} else {
		record.invalidAttempts += 1

		// Check if invalid attempts limit exceeded
		if (record.invalidAttempts >= MAX_INVALID_ATTEMPTS) {
			record.blocked = true
			record.blockedUntil = now + BLOCK_DURATION_MS
			record.blockReason = "INVALID_LIMIT"
			attemptRecords.set(key, record)

			return {
				allowed: false,
				blockedUntil: new Date(record.blockedUntil),
				retryAfterSeconds: Math.ceil(BLOCK_DURATION_MS / 1000),
				blockReason:
					"Too many failed attempts - invalid limit exceeded",
			}
		}
	}

	// Update record and allow the request
	attemptRecords.set(key, record)
	return {
		allowed: true,
		remainingValidAttempts: MAX_VALID_ATTEMPTS - record.validAttempts,
		remainingInvalidAttempts: MAX_INVALID_ATTEMPTS - record.invalidAttempts,
	}
}

/**
 * Setup a periodic cleanup task (call this on server startup)
 * @returns A timeout ID that can be used to clear the interval
 */
export function setupRateLimiterCleanup(): NodeJS.Timeout {
	// Clean up every 5 minutes
	return setInterval(cleanupRateLimiter, 5 * 60 * 1000)
}

// Perform initial cleanup
cleanupRateLimiter()
