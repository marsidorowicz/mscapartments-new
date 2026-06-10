/** @format */

import prisma from "@/prisma/prisma"
import { format, subDays, eachDayOfInterval } from "date-fns"

// Helper function to check internal availability in NoBedsCache
export async function checkInternalAvailability(room_id: number, startDate: string, endDate: string) {
	const start = new Date(startDate)
	const end = new Date(endDate)

	// Get all dates in the range (excluding checkout day)
	const dates = eachDayOfInterval({ start, end: subDays(end, 1) })

	// Check availability for each date in NoBedsCache
	for (const date of dates) {
		const dateStr = `${format(date, "yyyy-MM-dd")}T00:00:00`

		const cacheEntry = await prisma.noBedsCache.findFirst({
			where: {
				room_id: room_id,
				date: dateStr,
			},
		})

		// If no cache entry or quantity is 0 or null, not available
		if (!cacheEntry || !cacheEntry.quantity || cacheEntry.quantity <= 0) {
			return false
		}
	}

	return true
}

// Helper function to reduce NoBedsCache quantity for booked dates
export async function reduceCacheQuantity(room_id: number, startDate: string, endDate: string) {
	const start = new Date(startDate)
	const end = new Date(endDate)

	// Get property to check roomQuantity limit
	const property = await prisma.property.findFirst({
		where: {
			room_id: room_id,
		},
		select: { roomQuantity: true, id: true },
	})

	if (!property) {
		throw new Error(`Property with room_id ${room_id} not found`)
	}

	// Get all dates in the range (excluding checkout day)
	const dates = eachDayOfInterval({ start, end: subDays(end, 1) })

	// Reduce quantity for each date
	for (const date of dates) {
		const dateStr = `${format(date, "yyyy-MM-dd")}T00:00:00`

		// Get current cache entry
		const cacheEntry = await prisma.noBedsCache.findFirst({
			where: {
				room_id: room_id,
				date: dateStr,
			},
		})

		if (cacheEntry) {
			// Update existing entry if quantity > 0
			if (cacheEntry.quantity && cacheEntry.quantity > 0) {
				await prisma.noBedsCache.updateMany({
					where: {
						room_id: room_id,
						date: dateStr,
						quantity: { gt: 0 },
					},
					data: {
						quantity: { decrement: 1 },
					},
				})
			}
		} else {
			// Create new entry with quantity = roomQuantity - 1 (since we're booking one)
			const initialQuantity = Math.max(0, property.roomQuantity - 1)
			if (initialQuantity >= 0) {
				await prisma.noBedsCache.create({
					data: {
						room_id: room_id,
						date: dateStr,
						quantity: initialQuantity,
						propertyId: property.id,
						raw: {},
						updatedAt: new Date().toISOString(),
						dirty: false,
					},
				})
			}
		}
	}
}

// Helper function to restore NoBedsCache quantity for a specific date
export async function restoreCacheQuantityForDate(room_id: number, dateStr: string, propertyId: number) {
	// Get property to check roomQuantity limit
	const property = await prisma.property.findUnique({
		where: { id: propertyId },
		select: { roomQuantity: true },
	})

	if (!property) {
		throw new Error(`Property with id ${propertyId} not found`)
	}

	const date = dateStr + "T00:00:00"

	// Get current quantity
	const cacheEntry = await prisma.noBedsCache.findFirst({
		where: {
			room_id: room_id,
			date: date,
		},
	})

	if (cacheEntry) {
		// Only increment if current quantity is less than roomQuantity
		const newQuantity = Math.min((cacheEntry.quantity || 0) + 1, property.roomQuantity)
		if (newQuantity > (cacheEntry.quantity || 0)) {
			await prisma.noBedsCache.updateMany({
				where: {
					room_id: room_id,
					date: date,
				},
				data: {
					quantity: newQuantity,
				},
			})
		}
	} else {
		// If no cache entry exists, create one with quantity 1 (capped at roomQuantity)
		const initialQuantity = Math.min(1, property.roomQuantity ?? 0)
		if (initialQuantity > 0) {
			await prisma.noBedsCache.create({
				data: {
					room_id: room_id,
					date: date,
					quantity: initialQuantity,
					propertyId: propertyId,
					raw: {},
					updatedAt: new Date().toISOString(),
					dirty: false,
				},
			})
		}
	}
}

// Helper function to reduce NoBedsCache quantity for a specific date
export async function reduceCacheQuantityForDate(room_id: number, dateStr: string) {
	// Get property to check roomQuantity limit
	const property = await prisma.property.findFirst({
		where: {
			room_id: room_id,
		},
		select: { roomQuantity: true, id: true },
	})

	if (!property) {
		throw new Error(`Property with room_id ${room_id} not found`)
	}

	const date = dateStr + "T00:00:00"

	// Get current cache entry
	const cacheEntry = await prisma.noBedsCache.findFirst({
		where: {
			room_id: room_id,
			date: date,
		},
	})

	if (cacheEntry) {
		// Update existing entry if quantity > 0
		if (cacheEntry.quantity && cacheEntry.quantity > 0) {
			await prisma.noBedsCache.updateMany({
				where: {
					room_id: room_id,
					date: date,
					quantity: { gt: 0 },
				},
				data: {
					quantity: { decrement: 1 },
				},
			})
		}
	} else {
		// Create new entry with quantity = roomQuantity - 1 (since we're booking one)
		const initialQuantity = Math.max(0, property.roomQuantity - 1)
		if (initialQuantity >= 0) {
			await prisma.noBedsCache.create({
				data: {
					room_id: room_id,
					date: date,
					quantity: initialQuantity,
					propertyId: property.id,
					raw: {},
					updatedAt: new Date().toISOString(),
					dirty: false,
				},
			})
		}
	}
}

// Helper function to restore NoBedsCache quantity for cancelled dates
export async function restoreCacheQuantity(room_id: number, startDate: string, endDate: string, propertyId: number) {
	const start = new Date(startDate)
	const end = new Date(endDate)

	// Get property to check roomQuantity limit
	const property = await prisma.property.findUnique({
		where: { id: propertyId },
		select: { roomQuantity: true },
	})

	if (!property) {
		throw new Error(`Property with id ${propertyId} not found`)
	}

	// Get all dates in the range (excluding checkout day)
	const dates = eachDayOfInterval({ start, end: subDays(end, 1) })

	// Restore quantity for each date, but don't exceed roomQuantity
	for (const date of dates) {
		const dateStr = `${format(date, "yyyy-MM-dd")}T00:00:00`

		// Get current quantity
		const cacheEntry = await prisma.noBedsCache.findFirst({
			where: {
				room_id: room_id,
				date: dateStr,
			},
		})

		if (cacheEntry) {
			// Only increment if current quantity is less than roomQuantity
			const newQuantity = Math.min((cacheEntry.quantity || 0) + 1, property.roomQuantity)
			if (newQuantity > (cacheEntry.quantity || 0)) {
				await prisma.noBedsCache.updateMany({
					where: {
						room_id: room_id,
						date: dateStr,
					},
					data: {
						quantity: newQuantity,
					},
				})
			}
		} else {
			// If no cache entry exists, create one with quantity 1 (capped at roomQuantity)
			const initialQuantity = Math.min(1, property.roomQuantity ?? 0)
			if (initialQuantity > 0) {
				await prisma.noBedsCache.create({
					data: {
						room_id: room_id,
						date: dateStr,
						quantity: initialQuantity,
						propertyId: propertyId,
						raw: {},
						updatedAt: new Date().toISOString(),
						dirty: false,
					},
				})
			}
		}
	}
}

// Helper function to mark NoBedsCache entries as dirty
export async function markCacheAsDirty(room_id: number, startDate: string, endDate: string) {
	const start = new Date(startDate)
	const end = new Date(endDate)

	// Get all dates in the range (excluding checkout day)
	const dates = eachDayOfInterval({ start, end: subDays(end, 1) })

	// Mark each date as dirty
	for (const date of dates) {
		const dateStr = `${format(date, "yyyy-MM-dd")}T00:00:00`

		await prisma.noBedsCache.updateMany({
			where: {
				room_id: room_id,
				date: dateStr,
			},
			data: {
				dirty: true,
			},
		})
	}
}

// Helper function to get NoBedsCache entries for a date range
export async function getCacheEntriesForDateRange(room_id: number, startDate: string, endDate: string) {
	const start = new Date(startDate)
	const end = new Date(endDate)

	// Get all dates in the range (excluding checkout day)
	const dates = eachDayOfInterval({ start, end: subDays(end, 1) })

	// Convert dates to the format used in the database
	const dateStrings = dates.map((date) => `${format(date, "yyyy-MM-dd")}T00:00:00`)

	// Get all cache entries for the date range in a single query
	const cacheEntries = await prisma.noBedsCache.findMany({
		where: {
			room_id: room_id,
			date: {
				in: dateStrings,
			},
		},
	})

	return cacheEntries
}
export async function getSimplifiedCacheEntriesForDateRange(room_id: number, startDate: string, endDate: string) {
	const start = new Date(startDate)
	const end = new Date(endDate)

	const dates = eachDayOfInterval({ start, end: subDays(end, 1) })
	const dateStrings = dates.map((date) => `${format(date, "yyyy-MM-dd")}T00:00:00`)

	return prisma.noBedsCache.findMany({
		where: {
			room_id: room_id,
			date: {
				in: dateStrings,
			},
		},
		select: {
			id: true,
			propertyId: true,
			room_id: true,
			rid: true,
			date: true,
			price: true,
			available: true,
			quantity: true,
			minStay: true,
			maxStay: true,
			dirty: true,
		},
	})
}
