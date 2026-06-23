/** @format */

import nodemailer from "nodemailer"

const transporterSDC = nodemailer.createTransport({
	host: "smtp.mscapartments.pl", // sprawdź dokładny adres w panelu SDC
	port: 465,
	secure: true,
	auth: {
		user: process.env.SDC_USER,
		pass: process.env.SDC_PASS,
	},
	tls: {
		// Do not fail on invalid certs
		rejectUnauthorized: false,
	},
})

interface SendMailOptions {
	to: string
	subject: string
	html: string
}

export async function sendMailSDC({ to, subject, html }: SendMailOptions) {
	if (!process.env.SDC_USER || !process.env.SDC_PASS) {
		console.log("Email service SDC is not configured.")
		return
	}
	return await transporterSDC.sendMail({
		from: process.env.SDC_USER,
		to,
		subject,
		html,
	})
}
