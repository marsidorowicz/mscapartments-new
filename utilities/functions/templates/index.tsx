/** @format */

import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
	service: "gmail",
	port: 465,
	secure: true,
	auth: {
		user: process.env.GOOGLE_GMAIL_CLIENT_ID_AI,
		pass: process.env.GOOGLE_GMAIL_CLIENT_SECRET_AI,
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

export async function sendMailMSC({ to, subject, html }: SendMailOptions) {
	if (!process.env.GOOGLE_GMAIL_CLIENT_ID_AI || !process.env.GOOGLE_GMAIL_CLIENT_SECRET_AI) {
		console.log("Email service is not configured.")
	}
	return await transporter.sendMail({
		from: process.env.GOOGLE_GMAIL_CLIENT_ID,
		to,
		subject,
		html,
	})
}
