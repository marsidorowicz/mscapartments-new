/** @format */

import prisma from "../../prisma/prisma"
import { format, subDays, eachDayOfInterval } from "date-fns"

// Format date consistently
function toCacheDate(date: Date) {
	return `${format(date, "yyyy-MM-dd")}T00:00:00`
}

// Get all dates excluding checkout day
function getStayDates(startDate: string, endDate: string) {
	const start = new Date(startDate)
	const end = new Date(endDate)
	return eachDayOfInterval({ start, end: subDays(end, 1) })
}

// ------------------------------
// CHECK AVAILABILITY
// ------------------------------
export async function checkInternalAvailability(room_id: number, startDate: string, endDate: string) {
	const dates = getStayDates(startDate, endDate)

	for (const date of dates) {
		const dateStr = toCacheDate(date)

		const entry = await prisma.noBedsCache.findFirst({
			where: { room_id, date: dateStr },
			select: { quantity: true },
		})

		if (!entry || (entry.quantity ?? 0) <= 0) return false
	}

	return true
}

// ------------------------------
// UNIFIED QUANTITY ADJUSTMENT
// delta = +1 (restore) or -1 (reduce)
// ------------------------------
async function adjustQuantity(room_id: number, dateStr: string, delta: number, propertyId?: number) {
	// Get property (roomQuantity + id)
	const property = propertyId
		? await prisma.property.findUnique({
				where: { id: propertyId },
				select: { roomQuantity: true, id: true },
			})
		: await prisma.property.findFirst({
				where: { room_id },
				select: { roomQuantity: true, id: true },
			})

	if (!property) throw new Error(`Property not found for room_id ${room_id}`)

	const roomQuantity = property.roomQuantity

	// Try atomic update first
	if (delta < 0) {
		// Decrement only if quantity > 0
		const updated = await prisma.noBedsCache.updateMany({
			where: {
				room_id,
				date: dateStr,
				quantity: { gt: 0 },
			},
			data: {
				quantity: { decrement: 1 },
				dirty: true,
			},
		})

		if (updated.count > 0) return // success
	}

	if (delta > 0) {
		// Increment only if quantity < roomQuantity
		const updated = await prisma.noBedsCache.updateMany({
			where: {
				room_id,
				date: dateStr,
				quantity: { lt: roomQuantity },
			},
			data: {
				quantity: { increment: 1 },
				dirty: true,
			},
		})

		if (updated.count > 0) return // success
	}

	// If no entry exists → create one
	const existing = await prisma.noBedsCache.findFirst({
		where: { room_id, date: dateStr },
		select: { id: true },
	})

	if (!existing) {
		const initialQuantity = delta < 0 ? Math.max(0, roomQuantity - 1) : Math.min(1, roomQuantity)

		if (initialQuantity > 0) {
			await prisma.noBedsCache.create({
				data: {
					room_id,
					date: dateStr,
					quantity: initialQuantity,
					propertyId: property.id,
					raw: {},
					updatedAt: new Date().toISOString(),
					dirty: true,
				},
			})
		}

		return
	}

	// If entry exists but atomic update failed → no change needed
	return
}

// ------------------------------
// REDUCE QUANTITY FOR DATE RANGE
// ------------------------------
export async function reduceCacheQuantity(room_id: number, startDate: string, endDate: string) {
	const dates = getStayDates(startDate, endDate)

	for (const date of dates) {
		const dateStr = toCacheDate(date)
		await adjustQuantity(room_id, dateStr, -1)
	}
}

// ------------------------------
// RESTORE QUANTITY FOR DATE RANGE
// ------------------------------
export async function restoreCacheQuantity(room_id: number, startDate: string, endDate: string, propertyId: number) {
	const dates = getStayDates(startDate, endDate)

	for (const date of dates) {
		const dateStr = toCacheDate(date)
		await adjustQuantity(room_id, dateStr, +1, propertyId)
	}
}

// ------------------------------
// REDUCE QUANTITY FOR SINGLE DATE
// ------------------------------
export async function reduceCacheQuantityForDate(room_id: number, dateStr: string) {
	await adjustQuantity(room_id, `${dateStr}T00:00:00`, -1)
}

// ------------------------------
// RESTORE QUANTITY FOR SINGLE DATE
// ------------------------------
export async function restoreCacheQuantityForDate(room_id: number, dateStr: string, propertyId: number) {
	await adjustQuantity(room_id, `${dateStr}T00:00:00`, +1, propertyId)
}

// ------------------------------
// GET CACHE ENTRIES FOR RANGE
// ------------------------------
export async function getCacheEntriesForDateRange(room_id: number, startDate: string, endDate: string) {
	const dates = getStayDates(startDate, endDate)
	const dateStrings = dates.map(toCacheDate)

	return prisma.noBedsCache.findMany({
		where: {
			room_id,
			date: { in: dateStrings },
		},
	})
}
