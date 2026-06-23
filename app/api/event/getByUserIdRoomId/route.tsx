/** @format */

import prisma from "@/prisma/prisma"
import { PrismaUserRoomIdhRequestType } from "@/types"

import { subDays, differenceInDays } from "date-fns"
import { NextRequest, NextResponse } from "next/server"
import dotenv from "dotenv"
dotenv.config()

export async function POST(req: NextRequest) {
	const data = await req.json()
	const { roomId, room_id, userId, toDate }: PrismaUserRoomIdhRequestType = data

	if ((!roomId && !room_id) || !userId || !toDate) {
		return NextResponse.json({ error: "missing parameters" })
	}
	const user = await prisma.user.findUnique({
		where: { id: userId },
	})

	if (!user?.id) {
		return NextResponse.json({ error: "unauthorised" })
	}

	const property = await prisma.property.findFirst({
		where: {
			room_id: roomId || room_id,
		},
	})

	if (!property?.id) {
		return NextResponse.json({ error: "no property found" })
	}

	const daysDifference = differenceInDays(new Date(toDate), new Date()) + 1 || 120

	// Check if an event with the same properties already exists
	const events = await prisma.event.findMany({
		where: {
			AND: [
				{ room_id: roomId },
				{ propertyId: property?.id },
				{
					OR: [
						{
							AND: [
								{
									startDate: {
										gte: subDays(new Date(toDate), daysDifference + 30),
									},
								},
								{ endDate: { lte: new Date(toDate) } },
							],
						},
					],
				},
			],
		},
		select: {
			startDate: true,
			endDate: true,
		},
	})

	if (!events) {
		return NextResponse.json({ error: "no events in range", events: [] })
	} else {
		return NextResponse.json({ events })
	}
}
