/** @format */

import prisma from "@/prisma/prisma"
import { Event } from "@/types"

/**
 * Checks if there are any overlapping events for a given event's date range
 * @param event The event to check for overlaps
 * @param excludeEventId Optional ID of an event to exclude from the overlap check (useful for updates)
 * @returns The overlapping event if found, otherwise null
 */
export async function checkOverlappingEvent(
	event: Event,
	excludeEventId?: number
) {
	if (
		!event?.placeId ||
		!event?.propertyId ||
		!event?.startDate ||
		!event?.endDate
	) {
		return null
	}

	return await prisma.event.findFirst({
		where: {
			AND: [
				{ placeId: event.placeId },
				{ propertyId: event.propertyId },
				{
					OR: [
						{
							AND: [
								{ startDate: { lt: event.endDate } },
								{ startDate: { gte: event.startDate } },
							],
						},
						{
							AND: [
								{ endDate: { lte: event.endDate } },
								{ endDate: { gt: event.startDate } },
							],
						},
						{
							AND: [
								{ startDate: { lt: event.startDate } },
								{ endDate: { gt: event.endDate } },
							],
						},
					],
				},
				// Exclude the current event if we're updating
				...(excludeEventId ? [{ NOT: { id: excludeEventId } }] : []),
			],
		},
	})
}
