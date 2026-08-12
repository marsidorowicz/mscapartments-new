import prisma from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
	const email = req.nextUrl.searchParams.get("email")

	if (!email) {
		return NextResponse.json({ error: "Email is required" }, { status: 400 })
	}

	try {
		const events = await prisma.event.findMany({
			where: { email },
			orderBy: { startDate: "desc" },
			include: { property: { select: { name: true } } },
		})

		const mapped = events.map((e) => ({
			id: e.id,
			startDate: e.startDate,
			endDate: e.endDate,
			price: e.price,
			deposit: e.deposit,
			propertyName: e.property.name,
		}))

		return NextResponse.json({ events: mapped })
	} catch (error) {
		console.error("Error fetching events by email:", error)
		return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 })
	}
}
