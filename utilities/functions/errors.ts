/** @format */

export const logError = (
	operation: string,
	error: any,
	context?: Record<string, any>
) => {
	const errorMessage = error instanceof Error ? error.message : String(error)
	console.error(`Error during ${operation}:`, {
		error: errorMessage,
		...(context && { context }),
		timestamp: new Date().toISOString(),
	})
	return errorMessage
}

export const OPERATION_TYPES = {
	NOBEDS_BLOCK: "NOBEDS_BLOCK",
	NOBEDS_RELEASE: "NOBEDS_RELEASE",
	EVENT_DELETE: "EVENT_DELETE",
	EVENT_UPDATE: "EVENT_UPDATE",
	EVENT_CREATE: "EVENT_CREATE",
	ROLLBACK: "ROLLBACK",
} as const
