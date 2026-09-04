/** @format */

import { NextRequest, NextResponse } from "next/server"
import { sendMailMSC } from "@/utilities/functions/templates"
import prisma from "@/prisma/prisma"

export async function POST(req: NextRequest) {
	try {
		const { name, email, phone, message } = await req.json()
		if (!name || !email || !message) {
			return NextResponse.json({ error: "Wypełnij wymagane pola." }, { status: 400 })
		}
		await sendMailMSC({
			to: "apartamentymsc@gmail.com",
			subject: `Zapytanie ze strony MSC Apartments`,
			html: `<b>Imię i nazwisko:</b> ${name}<br/><b>Email:</b> ${email}<br/><b>Telefon:</b> ${phone || "-"}<br/><b>Wiadomość:</b><br/>${message}`,
		})

		// Save the guest message to the DB. Contact info is embedded in the
		// message body so it can be scraped later to reply to the guest.
		try {
			await prisma.message.create({
				data: {
					rid: 0,
					hotel_id: 0,
					message_id: crypto.randomUUID(),
					referral: "www-msc",
					message: `Email: ${email}\nTelefon: ${phone || "-"}\n\n${message}`,
					userName: name,
					receivedTimestamp: new Date(),
					isRead: false,
				},
			})
		} catch (dbError) {
			console.error("Error saving contact message to DB:", dbError)
		}

		return NextResponse.json({ ok: true })
	} catch (e) {
		console.log("Error in contact form submission:", e)

		return NextResponse.json({ error: "Błąd serwera. Spróbuj ponownie później." }, { status: 500 })
	}
}
