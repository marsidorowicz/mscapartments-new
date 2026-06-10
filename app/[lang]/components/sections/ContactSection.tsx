/** @format */

import { useState } from "react"
import { Section } from "../Section"
type ContactSectionProps = {
	dictionary: {
		contactForm: {
			title: string
			subtitle: string
			officePhoneLabel: string
			officePhone: string
			officeEmailLabel: string
			officeEmail: string
			nameLabel: string
			emailLabel: string
			phoneLabel: string
			messageLabel: string
			requiredNote: string
			error: string
			success: string
			sending: string
			submitButton: string
			privacyPolicy: string
		}
	}
}

import { usePathname } from "next/navigation"
import Link from "next/link"

export default function ContactSection({ dictionary }: ContactSectionProps) {
	const { contactForm } = dictionary
	const [form, setForm] = useState({
		name: "",
		email: "",
		phone: "",
		message: "",
	})
	const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle")
	const [error, setError] = useState<string | null>(null)

	// Get current locale from pathname
	const pathname = usePathname()
	const lang = pathname?.split("/")[1] || "en"

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		setForm({ ...form, [e.target.name]: e.target.value })
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setStatus("sending")
		setError(null)
		try {
			const res = await fetch("/api/contact", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(form),
			})
			if (res.ok) {
				setStatus("success")
				setForm({ name: "", email: "", phone: "", message: "" })
			} else {
				setStatus("error")
				setError(contactForm.error ?? "Something went wrong.")
			}
		} catch {
			setStatus("error")
			setError(contactForm.error ?? "Something went wrong.")
		}
	}

	return (
		<Section id="contact" className="bg-gradient-to-br from-[#f5f0eb] via-[#e4d9c7] to-[#d4a88a]">
			<div className="flex flex-col items-center justify-start min-h-[80vh] pt-8">
				<div className="w-full max-w-xl rounded-2xl shadow-xl bg-white/90 p-2 md:p-4 border border-[#cc9678] backdrop-blur-md mb-8">
					<h2 className="text-3xl font-bold text-[#a3745c] mb-4 text-center">{contactForm.title}</h2>

					<form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
						<input
							type="text"
							name="name"
							value={form.name}
							onChange={handleChange}
							placeholder={contactForm.nameLabel}
							className="rounded-lg border border-[#cc9678] bg-white/80 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#cc9678]"
							required
						/>
						<input
							type="email"
							name="email"
							value={form.email}
							onChange={handleChange}
							placeholder={contactForm.emailLabel}
							className="rounded-lg border border-[#cc9678] bg-white/80 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#cc9678]"
							required
						/>
						<input
							type="tel"
							name="phone"
							value={form.phone}
							onChange={handleChange}
							placeholder={contactForm.phoneLabel}
							className="rounded-lg border border-[#cc9678] bg-white/80 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#cc9678]"
						/>
						<textarea
							name="message"
							value={form.message}
							onChange={handleChange}
							placeholder={contactForm.messageLabel}
							className="rounded-lg border border-[#cc9678] bg-white/80 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#cc9678] min-h-[120px]"
							required
						/>
						<button
							type="submit"
							className="bg-gradient-to-r from-[#cc9678] to-[#b8856a] text-white font-bold py-3 px-8 rounded-full shadow-lg hover:from-[#b8856a] hover:to-[#a3745c] transition-all duration-200 mt-2"
							disabled={status === "sending"}>
							{status === "sending" ? contactForm.sending : contactForm.submitButton}
						</button>
					</form>

					{status === "success" && <p className="mt-4 text-green-600 dark:text-green-400">{contactForm.success}</p>}
					{status === "error" && <p className="mt-4 text-red-600 dark:text-red-400">{error}</p>}
					<div className="mt-8 text-sm text-[#a3745c]">
						<p className="mb-2 text-[#a3745c] text-center">{contactForm.subtitle}</p>
						<div>
							<span className="font-semibold">{contactForm.officePhoneLabel}</span> {contactForm.officePhone}
						</div>
						<div>
							<span className="font-semibold">{contactForm.officeEmailLabel}</span> {contactForm.officeEmail}
						</div>
					</div>
				</div>
				{/* Footer */}
				<footer className="w-full max-w-xl text-center text-xs text-[#a3745c] pb-4">
					<Link href={`/${lang}/privacy`} className="underline hover:text-[#8f6350] transition-colors">
						{contactForm.privacyPolicy}
					</Link>
				</footer>
			</div>
		</Section>
	)
}
