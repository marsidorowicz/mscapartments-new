/** @format */

import prisma from "../../prisma/prisma"
import { CreateEventEntry } from "../types"

/**
 * Creates a new event entry for user notifications.
 * This function handles the creation of notification entries that appear in the user's event bell.
 *
 * @param entry - The event entry data to create. Either userIds or propertyId must be provided.
 * @returns Promise resolving to the created event entry record with user relations
 * @throws Error if the database operation fails or neither userIds nor propertyId is provided
 *
 * @example
 * ```typescript
 * // Single user
 * const newEntry = await createEventEntry({
 *   type: EventEntryType.NEW_BOOKING,
 *   title: "New Booking Received",
 *   message: "A new booking has been made",
 *   data: { propertyName: "Villa Roma", startDate: "2024-01-15" },
 *   userIds: "123"
 * });
 *
 * // Multiple users
 * const newEntry = await createEventEntry({
 *   type: EventEntryType.EVENT_ADDED,
 *   title: "Event Added",
 *   data: { propertyName: "Villa Roma" },
 *   userIds: ["123", "456", "789"]
 * });
 *
 * // Automatic user discovery by property
 * const newEntry = await createEventEntry({
 *   type: EventEntryType.EVENT_ADDED,
 *   title: "Event Added",
 *   data: { propertyName: "Villa Roma" },
 *   propertyId: 42
 * });
 * ```
 */
export async function createEventEntry(entry: CreateEventEntry) {
	try {
		// Determine target user IDs
		let userIds: string[]

		if (entry.userIds) {
			// Use provided user IDs
			userIds = Array.isArray(entry.userIds) ? entry.userIds : [entry.userIds]
		} else if (entry.propertyId) {
			// Find all users with MANAGER or ADMIN permissions for this property
			const usersWithPropertyPermissions = await prisma.user.findMany({
				where: {
					Permission: {
						some: {
							propertyId: entry.propertyId,
							type: {
								in: ["MANAGER", "ADMIN"],
							},
						},
					},
				},
				select: { id: true },
			})

			// Find all users with ADMIN role globally
			const adminUsers = await prisma.user.findMany({
				where: {
					role: "ADMIN",
				},
				select: { id: true },
			})

			// Combine both lists and remove duplicates
			const allTargetUserIds = new Set([...usersWithPropertyPermissions.map((u) => u.id), ...adminUsers.map((u) => u.id)])

			userIds = Array.from(allTargetUserIds)
		} else {
			throw new Error("Either userIds or propertyId must be provided")
		}

		if (userIds.length === 0) {
			console.warn("No target users found for event entry, skipping creation")
			return null
		}

		// Create the event entry
		const createdEntry = await prisma.eventEntry.create({
			data: {
				type: entry.type,
				title: entry.title,
				message: entry.message,
				data: entry.data,
			},
		})

		// Create the user relations
		const userRelations = userIds.map((userId) => ({
			eventEntryId: createdEntry.id,
			userId,
			relationType: "target" as const, // The users who should see this notification
		}))

		await prisma.eventEntryUser.createMany({
			data: userRelations,
		})

		return createdEntry
	} catch (error) {
		console.error("Failed to create event entry:", error)
		throw new Error("Unable to create event entry")
	}
}
