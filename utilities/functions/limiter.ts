/** @format */

/**
 * Creates a concurrency limiter that queues async functions and limits the number of concurrent executions
 * @param maxConcurrent - Maximum number of concurrent operations (default: 10)
 * @param delayMs - Delay in milliseconds between starting new operations (default: 0)
 * @returns A function that wraps async operations to limit concurrency
 */
export function createLimiter(maxConcurrent = 10, delayMs = 0) {
	console.log(`Creating limiter with maxConcurrent: ${maxConcurrent}, delayMs: ${delayMs}`)
	let active = 0
	const queue: Array<{
		fn: () => Promise<unknown>
		resolve: (value: unknown) => void
		reject: (reason?: unknown) => void
	}> = []

	const runNext = () => {
		if (active >= maxConcurrent || queue.length === 0) return

		active++
		const { fn, resolve, reject } = queue.shift()!

		fn()
			.then(resolve)
			.catch(reject)
			.finally(() => {
				active--
				if (delayMs > 0) {
					setTimeout(runNext, delayMs)
				} else {
					runNext()
				}
			})
	}

	return function limit<T>(fn: () => Promise<T>): Promise<T> {
		return new Promise<T>((resolve, reject) => {
			queue.push({
				fn,
				resolve: resolve as (value: unknown) => void,
				reject: reject as (reason?: unknown) => void,
			})
			runNext()
		})
	}
}
