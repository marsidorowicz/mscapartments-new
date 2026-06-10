/** @format */
"use client"
import { useEffect, useState } from "react"
// Hook
export function useLocalStorage(key: string, initialValue: string) {
	// State to store our value
	const [storedValue, setStoredValue] = useState<string>(() => initialValue)

	useEffect(() => {
		if (typeof window === "undefined") return
		try {
			const item = window.localStorage.getItem(key)
			if (!item) return
			setStoredValue(JSON.parse(item))
		} catch {
			return
		}
	}, [key])

	// Return a wrapped version of useState's setter function that ...
	// ... persists the new value to localStorage.
	const setValue = (value: string | ((val: string) => string)) => {
		try {
			// Allow value to be a function so we have same API as useState
			const valueToStore = value instanceof Function ? value(storedValue) : value
			// Save state
			setStoredValue(valueToStore)
			// Save to local storage
			if (typeof window !== "undefined") {
				window.localStorage.setItem(key, JSON.stringify(valueToStore))
			}
		} catch {
			// A more advanced implementation would handle the error case
		}
	}
	return [storedValue, setValue]
}

export function useLocalStorageWithExpiry<T>(key: string, initialValue: T, expiry: string): [T, (value: T | ((val: T) => T)) => void] {
	// State to store our value
	const [storedValue, setStoredValue] = useState<T>(() => initialValue)

	useEffect(() => {
		if (typeof window === "undefined") return
		if (expiry !== "1d" && expiry !== "1w" && expiry !== "1h") {
			console.log("wrong time value, either 1d, 1w, or 1h must be passed")
			return
		}

		const now = new Date().getTime()

		try {
			const item = window.localStorage.getItem(key)
			if (!item) return
			const itemFromStr = JSON.parse(item)

			if (!itemFromStr?.expiry || !itemFromStr?.value) return
			if (now > itemFromStr?.expiry) {
				console.log("item in cache expired")
				window.localStorage.removeItem(key)
				return
			}
			const value: T = itemFromStr.value
			setStoredValue(value ? value : initialValue)
		} catch {
			return
		}
	}, [key, expiry, initialValue])

	// Return a wrapped version of useState's setter function that ...
	// ... persists the new value to localStorage.
	const setValue = (value: T | ((val: T) => T)) => {
		try {
			const now = new Date().getTime()
			let time: number

			if (expiry === "1d") {
				time = 1 * 24 * 60 * 60 * 1000
			} else if (expiry === "1w") {
				time = 7 * 1 * 24 * 60 * 60 * 1000
			} else if (expiry === "1h") {
				time = 1 * 60 * 60 * 1000
			} else {
				return
			}

			const itemWithExpiryValue = {
				value: value,
				expiry: now + time,
			}

			// Allow value to be a function so we have same API as useState
			if (value instanceof Function) {
				setStoredValue(value(storedValue))
			} else {
				setStoredValue(itemWithExpiryValue.value)
			}

			// Save to local storage
			if (typeof window !== "undefined") {
				window.localStorage.setItem(key, JSON.stringify(itemWithExpiryValue))
			}
		} catch {
			// A more advanced implementation would handle the error case
		}
	}
	return [storedValue, setValue]
}

export function useLocalStorageNew<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
	const [storedValue, setStoredValue] = useState<T>(() => initialValue)

	useEffect(() => {
		if (typeof window === "undefined") return
		try {
			const item = window.localStorage.getItem(key)
			if (!item) return
			const newValue = JSON.parse(item, dateReviver)
			setStoredValue(newValue)
		} catch {
			return
		}
	}, [key])

	const setValue = (value: T | ((val: T) => T)) => {
		try {
			if (typeof window === "undefined") {
				// Fallback if no window
				const nextValue = value instanceof Function ? value(storedValue) : value
				setStoredValue(nextValue)
				return
			}

			const item = window.localStorage.getItem(key)
			let prev = initialValue
			if (item) {
				try {
					prev = JSON.parse(item, dateReviver)
				} catch {}
			}

			const nextValue = value instanceof Function ? value(prev) : value
			const nextValueStr = JSON.stringify(nextValue, dateReplacer)

			if (nextValueStr !== item) {
				window.localStorage.setItem(key, nextValueStr)
				window.dispatchEvent(new CustomEvent("local-storage", { detail: { key } }))
				setStoredValue(nextValue)
			}
		} catch {}
	}

	// Add synchronization via the `storage` event and the custom `local-storage` event for same-window updates
	useEffect(() => {
		const handleStorageChange = (event: StorageEvent | Event) => {
			if (event instanceof StorageEvent) {
				if (event.key !== key || !event.newValue) {
					return
				}
				try {
					const newValue = JSON.parse(event.newValue, dateReviver)
					setStoredValue(newValue)
				} catch {}
				return
			}

			if (event.type === "local-storage") {
				if ("detail" in event && (event as CustomEvent).detail?.key !== key) {
					return
				}
				try {
					const item = window.localStorage.getItem(key)
					if (!item) return
					setStoredValue((prev) => {
						const prevStr = JSON.stringify(prev, dateReplacer)
						if (prevStr === item) return prev
						return JSON.parse(item, dateReviver)
					})
				} catch {}
			}
		}

		window.addEventListener("storage", handleStorageChange)
		window.addEventListener("local-storage", handleStorageChange)
		return () => {
			window.removeEventListener("storage", handleStorageChange)
			window.removeEventListener("local-storage", handleStorageChange)
		}
	}, [key])

	return [storedValue, setValue]
}

export function useLocalStorageSesializing<T>(key: string, initialValue: T) {
	// Deserialize stored JSON string back to object
	const readValue = () => {
		if (typeof window === "undefined") {
			return initialValue
		}
		try {
			const item = window.localStorage.getItem(key)
			return item ? (JSON.parse(item) as T) : initialValue
		} catch {
			return initialValue
		}
	}

	// State to store our value
	const [storedValue, setStoredValue] = useState<T>(readValue)

	// Update localStorage when state changes
	useEffect(() => {
		if (typeof window !== "undefined") {
			try {
				const serializedValue = JSON.stringify(storedValue)
				window.localStorage.setItem(key, serializedValue)
			} catch {
				// console.warn(`Error setting localStorage key “${key}”:`, error)
			}
		}
	}, [key, storedValue])

	return [storedValue, setStoredValue] as const
}

// Helper functions to handle Date objects in JSON
function dateReplacer(key: string, value: unknown) {
	if (value instanceof Date) {
		return value.toISOString()
	}
	return value
}

function dateReviver(key: string, value: unknown) {
	const dateFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/
	if (typeof value === "string" && dateFormat.test(value)) {
		return new Date(value)
	}
	return value
}
