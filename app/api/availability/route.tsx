/** @format */

import prisma from "@/prisma/prisma"
import { Availability, AvailabilityGetRequestType } from "@/types"
import axios from "axios"
import { format, parseISO, startOfDay } from "date-fns"
import { NextRequest, NextResponse } from "next/server"
import dotenv from "dotenv"
dotenv.config()

interface RequestBody {
	availability: Availability
}

const NOBEDS_API: string | undefined = process.env.NOBEDS_API_KEY

export async function POST(req: NextRequest) {
	const { availability }: RequestBody = await req.json()
	try {
		if (!availability) {
			return NextResponse.json({ status: "unauthorised" })
		}
		if (!NOBEDS_API) {
			return NextResponse.json({ status: "no api key" })
		}

		// Check if the new date range overlaps with any existing ones
		const overlappingAvailability = await prisma.availability.findFirst({
			where: {
				AND: [
					{ propertyId: availability.propertyId },
					{
						OR: [
							{
								AND: [
									{ startDate: { lt: availability.endDate } },
									{
										startDate: {
											gte: availability.startDate,
										},
									},
								],
							},
							{
								AND: [{ endDate: { lte: availability.endDate } }, { endDate: { gt: availability.startDate } }],
							},
							{
								AND: [
									{
										startDate: {
											lt: availability.startDate,
										},
									},
									{ endDate: { gt: availability.endDate } },
								],
							},
						],
					},
				],
			},
		})

		if (overlappingAvailability && availability?.id !== overlappingAvailability?.id) {
			return NextResponse.json({
				error: "The date range overlaps with an existing availability.",
			})
		}

		// If no overlap, proceed with creating or updating the availability
		let handledAvailability
		if (availability.id) {
			handledAvailability = await prisma.availability.update({
				where: { id: availability.id },
				data: {
					isOpen: availability.isOpen,
					price: availability.price,
					minStay: availability?.minStay,
					maxStay: availability?.maxStay,
					discountPercentage: availability.discountPercentage,
					discountDaysBeforeArrival: availability.discountDaysBeforeArrival,
					propertyId: availability.propertyId,
					roomId: availability.room_id,
					endDate: availability.endDate,
					startDate: availability.startDate,
					quantity: availability.quantity,
					weekPrices: {
						upsert: {
							create: {
								mondayPrice: availability?.weekPrices?.mondayPrice,
								tuesdayPrice: availability?.weekPrices?.tuesdayPrice,
								wednesdayPrice: availability?.weekPrices?.wednesdayPrice,
								thursdayPrice: availability?.weekPrices?.thursdayPrice,
								fridayPrice: availability?.weekPrices?.fridayPrice,
								saturdayPrice: availability?.weekPrices?.saturdayPrice,
								sundayPrice: availability?.weekPrices?.sundayPrice,
							},
							update: {
								mondayPrice: availability?.weekPrices?.mondayPrice,
								tuesdayPrice: availability?.weekPrices?.tuesdayPrice,
								wednesdayPrice: availability?.weekPrices?.wednesdayPrice,
								thursdayPrice: availability?.weekPrices?.thursdayPrice,
								fridayPrice: availability?.weekPrices?.fridayPrice,
								saturdayPrice: availability?.weekPrices?.saturdayPrice,
								sundayPrice: availability?.weekPrices?.sundayPrice,
							},
						},
					},
				},
			})
		} else {
			handledAvailability = await prisma.availability.create({
				data: {
					isOpen: availability.isOpen,
					price: availability.price,
					minStay: availability?.minStay,
					maxStay: availability?.maxStay,
					discountPercentage: availability.discountPercentage,
					discountDaysBeforeArrival: availability.discountDaysBeforeArrival,
					propertyId: availability.propertyId,
					roomId: availability.room_id || availability.roomId,
					endDate: availability.endDate,
					startDate: availability.startDate,
					quantity: availability.quantity,
					userId: availability?.userId?.toString() || "null",
					weekPrices: {
						create: {
							mondayPrice: availability?.weekPrices?.mondayPrice,
							tuesdayPrice: availability?.weekPrices?.tuesdayPrice,
							wednesdayPrice: availability?.weekPrices?.wednesdayPrice,
							thursdayPrice: availability?.weekPrices?.thursdayPrice,
							fridayPrice: availability?.weekPrices?.fridayPrice,
							saturdayPrice: availability?.weekPrices?.saturdayPrice,
							sundayPrice: availability?.weekPrices?.sundayPrice,
						},
					},
				},
			})
		}

		return NextResponse.json({
			data: { handledAvailability },
		})
	} catch (error: unknown) {
		if (error instanceof Error) {
			return NextResponse.json({ error: "cannot update availability" })
		} else {
			return NextResponse.json({ error: "cannot update availability" })
		}
	} finally {
		await prisma.$disconnect()
	}
}

export async function GET(req: NextRequest) {
	const url = new URL(req.url)
	const requestDataParam = url.searchParams.get("data")
	console.log("start")

	if (!requestDataParam) {
		return NextResponse.json({
			status: "error",
			message: "Missing query parameters",
		})
	}

	const requestData: AvailabilityGetRequestType = JSON.parse(requestDataParam)

	function resetHours(dateToReset: string) {
		const date = parseISO(dateToReset)
		const startOfDate = startOfDay(date)
		const newDateString = format(startOfDate, "yyyy-MM-dd'T'HH:mm:ss")
		return newDateString
	}

	const { fromdate, todate, room_id } = requestData

	if (!fromdate || !todate || !room_id) {
		return NextResponse.json({ error: "Missing query parameters" })
	}

	try {
		const formattedFromDate = resetHours(fromdate)
		const formattedToDate = resetHours(todate)

		const options = {
			method: "GET",
			url: `https://api.nobeds.com/api/Availability/${NOBEDS_API}`,
			params: {
				room_id,
				fromdate: formattedFromDate,
				todate: formattedToDate,
			},
			headers: { accept: "application/json" },
		}

		try {
			const response = await axios.request(options)

			if (response?.status === 200 && response?.data) {
				return NextResponse.json({ data: response?.data })
			} else {
				return NextResponse.json({ error: "cannot fetch availability" })
			}
		} catch (error) {
			console.log(error)

			return NextResponse.json({
				error: "cannot fetch availability",
				message: "Unknown error",
			})
		}
	} catch (error: unknown) {
		if (error instanceof Error) {
			return NextResponse.json({ error: "error", message: error.message })
		} else {
			return NextResponse.json({
				error: "error",
				message: "Unknown error",
			})
		}
	}
}
