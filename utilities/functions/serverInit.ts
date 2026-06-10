/** @format */

import { setupRateLimiterCleanup } from "./auth/rateLimiter"

// This file contains initializations for server utilities

// Set up the rate limiter cleanup process
let cleanupInterval: NodeJS.Timeout | undefined

export function initServerUtilities() {
	// Start periodic cleanup for the rate limiter
	if (typeof cleanupInterval === "undefined") {
		cleanupInterval = setupRateLimiterCleanup()
		console.log("Rate limiter cleanup process initialized")
	}
}

// Clean up resources when the server is shutting down
export function cleanupServerUtilities() {
	if (cleanupInterval) {
		clearInterval(cleanupInterval)
		cleanupInterval = undefined
		console.log("Rate limiter cleanup process terminated")
	}
}
