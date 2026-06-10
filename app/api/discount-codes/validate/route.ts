/** @format */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "../../../../lib/prisma"

interface CampaignConditions {
	validFrom?: string
	validTo?: string
	blackoutDates?: string[]
	minimumStay?: number
	maximumStay?: number
	validHoursStart?: string
	validHoursEnd?: string
	validDaysOfWeek?: number[]
	validMonths?: number[]
	maxUsesPerDay?: number
	maxUsesPerUser?: number
}

export async function POST(request: NextRequest) {
	try {
		const { code, propertyId, propertyIds, checkInDate, checkOutDate, userId } = await request.json()

		// Support both single propertyId and array of propertyIds for backward compatibility
		const propertiesToCheck = propertyIds || (propertyId ? [propertyId] : [])

		if (!code || propertiesToCheck.length === 0) {
			return NextResponse.json(
				{ error: "Code and propertyId(s) are required" },
				{ status: 400 }
			)
		}

		const campaignCode = await prisma.campaignCode.findUnique({
			where: { code: code.toUpperCase() },
			include: { campaign: true }
		})

		if (!campaignCode || !campaignCode.campaign.isActive) {
			return NextResponse.json({ error: "Invalid discount code" }, { status: 400 })
		}

		// NOTE: Current date validation removed - validity periods now only control booking dates, not redemption timing
		// Users can redeem codes anytime as long as the booking dates are within the validity period

		if (campaignCode.campaign.campaignType === 'SINGLE_USE' && campaignCode.isUsed) {
			return NextResponse.json({ error: "Code already used" }, { status: 400 })
		}

		if (campaignCode.campaign.propertyIds.length > 0 &&
		    !propertiesToCheck.some((id: number) => campaignCode.campaign.propertyIds.includes(id))) {
			return NextResponse.json({ error: "Code not valid for this property" }, { status: 400 })
		}

		// Event Date Validation: Check if event dates are completely within campaign validity period (when bookings can be made)
		if (checkInDate && checkOutDate) {
			const eventStart = new Date(checkInDate)
			const eventEnd = new Date(checkOutDate)

			if (campaignCode.campaign.startDate) {
				const campaignStart = new Date(campaignCode.campaign.startDate)
				campaignStart.setHours(0, 0, 0, 0)

				if (eventStart < campaignStart) {
					return NextResponse.json({
						error: `Booking start date must be on or after ${campaignStart.toISOString().split('T')[0]}`
					}, { status: 400 })
				}
			}

			if (campaignCode.campaign.endDate) {
				const campaignEnd = new Date(campaignCode.campaign.endDate)
				campaignEnd.setHours(23, 59, 59, 999)

				if (eventEnd > campaignEnd) {
					return NextResponse.json({
						error: `Booking end date must be on or before ${campaignEnd.toISOString().split('T')[0]}`
					}, { status: 400 })
				}
			}
		}

		// Additional conditions validation from JSON field (for backward compatibility)
		if (checkInDate && checkOutDate && campaignCode.campaign.conditions) {
			const conditions = campaignCode.campaign.conditions as CampaignConditions

			// Parse dates
			const checkIn = new Date(checkInDate)
			const checkOut = new Date(checkOutDate)
			const validFrom = conditions.validFrom ? new Date(conditions.validFrom) : null
			const validTo = conditions.validTo ? new Date(conditions.validTo) : null

			// Validate date range exists
			if (validFrom && validTo) {
				// Convert all dates to YYYY-MM-DD string format for consistent comparison
				const formatDate = (date: Date) => date.toISOString().split('T')[0]

				const checkInStr = formatDate(checkIn)
				const checkOutStr = formatDate(checkOut)
				const validFromStr = formatDate(validFrom)
				const validToStr = formatDate(validTo)

				// Check if the entire booking period is within the validity range
				// Booking is valid if: checkIn >= validFrom AND checkOut <= validTo
				if (checkInStr < validFromStr || checkOutStr > validToStr) {
					return NextResponse.json({
						error: `Discount code is only valid for dates between ${validFromStr} and ${validToStr}`
					}, { status: 400 })
				}

				// For more complex validation (checking each day), we can still do it if needed
				// But for most cases, range checking is sufficient and more efficient
				// Uncomment below if you need to check each individual day:

				/*
				// Check if ALL dates of the event are within the validity range
				const eventDates: string[] = []
				const currentDate = new Date(checkIn)

				// Generate all dates from check-in to check-out (inclusive) as strings
				while (currentDate <= checkOut) {
					eventDates.push(formatDate(currentDate))
					currentDate.setDate(currentDate.getDate() + 1)
				}

				// Check if all event dates are within campaign validity range
				const allDatesValid = eventDates.every(eventDate =>
					eventDate >= validFromStr && eventDate <= validToStr
				)

				if (!allDatesValid) {
					return NextResponse.json({
						error: `Discount code is only valid for dates between ${validFromStr} and ${validToStr}`
					}, { status: 400 })
				}
				*/

				// Check blackout dates if specified
				if (conditions.blackoutDates && Array.isArray(conditions.blackoutDates)) {
					const eventDates: string[] = []
					const currentDate = new Date(checkIn)

					// Generate all booking dates as strings
					while (currentDate <= checkOut) {
						eventDates.push(formatDate(currentDate))
						currentDate.setDate(currentDate.getDate() + 1)
					}

					// Convert blackout dates to same format
					const blackoutDateStrs = conditions.blackoutDates.map((date: string) =>
						new Date(date).toISOString().split('T')[0]
					)

					const hasBlackoutDate = eventDates.some(eventDate =>
						blackoutDateStrs.includes(eventDate)
					)

					if (hasBlackoutDate) {
						return NextResponse.json({
							error: "Discount code is not valid for selected dates due to blackout periods"
						}, { status: 400 })
					}
				}

				// Check minimum stay requirement if specified
				if (conditions.minimumStay) {
					const stayLength = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
					if (stayLength < conditions.minimumStay) {
						return NextResponse.json({
							error: `Minimum stay requirement is ${conditions.minimumStay} nights for this discount code`
						}, { status: 400 })
					}
				}

				// Check maximum stay requirement if specified
				if (conditions.maximumStay) {
					const stayLength = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
					if (stayLength > conditions.maximumStay) {
						return NextResponse.json({
							error: `Maximum stay limit is ${conditions.maximumStay} nights for this discount code`
						}, { status: 400 })
					}
				}
			}

			// Time-based validation
			const now = new Date()

			// Check valid hours of day (e.g., codes only valid between 9 AM - 5 PM)
			if (conditions.validHoursStart !== undefined && conditions.validHoursEnd !== undefined) {
				const currentHour = now.getHours()
				const startHour = parseInt(conditions.validHoursStart)
				const endHour = parseInt(conditions.validHoursEnd)

				if (currentHour < startHour || currentHour >= endHour) {
					return NextResponse.json({
						error: `Discount code is only valid between ${startHour}:00 and ${endHour}:00`
					}, { status: 400 })
				}
			}

			// Check valid days of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
			if (conditions.validDaysOfWeek && Array.isArray(conditions.validDaysOfWeek)) {
				const currentDayOfWeek = now.getDay() // 0 = Sunday, 1 = Monday, etc.

				if (!conditions.validDaysOfWeek.includes(currentDayOfWeek)) {
					const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
					const validDayNames = conditions.validDaysOfWeek.map((day: number) => dayNames[day]).join(', ')

					return NextResponse.json({
						error: `Discount code is only valid on: ${validDayNames}`
					}, { status: 400 })
				}
			}

			// Check valid months (0 = January, 1 = February, ..., 11 = December)
			if (conditions.validMonths && Array.isArray(conditions.validMonths)) {
				const currentMonth = now.getMonth() // 0 = January, 1 = February, etc.

				if (!conditions.validMonths.includes(currentMonth)) {
					const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
									  'July', 'August', 'September', 'October', 'November', 'December']
					const validMonthNames = conditions.validMonths.map((month: number) => monthNames[month]).join(', ')

					return NextResponse.json({
						error: `Discount code is only valid in: ${validMonthNames}`
					}, { status: 400 })
				}
			}

			// Check maximum uses per day
			if (conditions.maxUsesPerDay) {
				const today = new Date()
				today.setHours(0, 0, 0, 0)
				const tomorrow = new Date(today)
				tomorrow.setDate(tomorrow.getDate() + 1)

				const todayUses = await prisma.campaignUsage.count({
					where: {
						campaignId: campaignCode.campaignId,
						appliedAt: {
							gte: today,
							lt: tomorrow
						}
					}
				})

				if (todayUses >= conditions.maxUsesPerDay) {
					return NextResponse.json({
						error: `Discount code has reached maximum uses (${conditions.maxUsesPerDay}) for today`
					}, { status: 400 })
				}
			}

			// Check maximum uses per user
			if (conditions.maxUsesPerUser && userId) {
				const userUses = await prisma.campaignUsage.count({
					where: {
						campaignId: campaignCode.campaignId,
						userId: userId
					}
				})

				if (userUses >= conditions.maxUsesPerUser) {
					return NextResponse.json({
						error: `You have reached the maximum uses (${conditions.maxUsesPerUser}) for this discount code`
					}, { status: 400 })
				}
			}
		}

		return NextResponse.json({
			valid: true,
			discountType: campaignCode.campaign.discountType,
			discountValue: campaignCode.campaign.discountValue,
			campaignType: campaignCode.campaign.campaignType,
			campaignId: campaignCode.campaignId,
			codeId: campaignCode.id
		})
	} catch (error) {
		console.error("Error validating discount code:", error)
		return NextResponse.json(
			{ error: "Failed to validate discount code" },
			{ status: 500 }
		)
	}
}