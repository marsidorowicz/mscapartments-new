/** @format */

import { NextRequest, NextResponse } from "next/server"
import { sendMailSDC } from "@/utilities/functions/templates"

export async function POST(req: NextRequest) {
	try {
		const { name, email, phone, message } = await req.json()
		if (!name || !email || !message) {
			return NextResponse.json({ error: "Wypełnij wymagane pola." }, { status: 400 })
		}
		await sendMailSDC({
			to: "apartamentymsc@gmail.com",
			subject: `Zapytanie ze strony MSC Apartments`,
			html: `<b>Imię i nazwisko:</b> ${name}<br/><b>Email:</b> ${email}<br/><b>Telefon:</b> ${phone || "-"}<br/><b>Wiadomość:</b><br/>${message}`,
		})
		return NextResponse.json({ ok: true })
	} catch (e) {
		console.log("Error in contact form submission:", e)

		return NextResponse.json({ error: "Błąd serwera. Spróbuj ponownie później." }, { status: 500 })
	}
}
