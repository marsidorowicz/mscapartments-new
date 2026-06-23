/** @format */
"use client"
import React from "react"
import ModernNav from "../homepage/components/ModernNav"
import { Section } from "../components/Section"
import { Locale } from "../../i18n-config"
import { Dictionary } from "../../types/dictionary"
import Footer from "../homepage/components/Footer"

interface ContactPageClientProps {
	dictionary: Dictionary
	lang: Locale
}

const ContactPageClient: React.FC<ContactPageClientProps> = ({ dictionary, lang }) => {
	const [form, setForm] = React.useState({
		name: "",
		email: "",
		phone: "",
		message: "",
	})
	const [status, setStatus] = React.useState<"idle" | "sending" | "success" | "error">("idle")
	const [error, setError] = React.useState<string | null>(null)

	// Get current locale from pathname - no longer needed since lang is passed as prop
	// const pathname = usePathname()
	// const lang = pathname?.split("/")[1] || "en"

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
				setError(dictionary.contactForm?.error ?? "Something went wrong.")
			}
		} catch {
			setStatus("error")
			setError(dictionary.contactForm?.error ?? "Something went wrong.")
		}
	}

	return (
		<>
			{/* Modern Navigation */}
			<ModernNav dictionary={dictionary} lang={lang} />

			<Section id="contact" className="bg-[#f5f0eb] ">
				<div className="flex flex-col items-center justify-start min-h-[80vh] pt-8 px-1">
					<div className="w-full max-w-xl rounded-2xl shadow-xl bg-white/90 p-2 md:p-4 border border-[#1D2430] backdrop-blur-md mb-8">
						<h2 className="text-3xl font-bold text-[#D6B08A] mb-4 text-center">{dictionary.contactForm?.title || "Contact Us"}</h2>

						<form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
							<input
								type="text"
								name="name"
								value={form.name}
								onChange={handleChange}
								placeholder={dictionary.contactForm?.nameLabel || "Full name *"}
								className="rounded-lg border border-[#1D2430] bg-white/80 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1D2430]"
								required
							/>
							<input
								type="email"
								name="email"
								value={form.email}
								onChange={handleChange}
								placeholder={dictionary.contactForm?.emailLabel || "Email address *"}
								className="rounded-lg border border-[#1D2430] bg-white/80 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1D2430]"
								required
							/>
							<input
								type="tel"
								name="phone"
								value={form.phone}
								onChange={handleChange}
								placeholder={dictionary.contactForm?.phoneLabel || "Phone number"}
								className="rounded-lg border border-[#1D2430] bg-white/80 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1D2430]"
							/>
							<textarea
								name="message"
								value={form.message}
								onChange={handleChange}
								placeholder={dictionary.contactForm?.messageLabel || "Message *"}
								className="rounded-lg border border-[#1D2430] bg-white/80 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1D2430] min-h-[120px]"
								required
							/>
							<button
								type="submit"
								className="bg-[#1D2430] text-white font-bold py-3 px-8 rounded-full shadow-lg hover:scale-105 transition-all duration-200 mt-2"
								disabled={status === "sending"}>
								{status === "sending"
									? dictionary.contactForm?.sending || "Sending..."
									: dictionary.contactForm?.submitButton || "Send inquiry"}
							</button>
						</form>

						{status === "success" && (
							<p className="mt-4 text-green-600 dark:text-green-400">
								{dictionary.contactForm?.success || "Thank you for contacting us! We will reply soon."}
							</p>
						)}
						{status === "error" && <p className="mt-4 text-red-600 dark:text-red-400">{error}</p>}
						<div className="mt-8 text-sm text-[#1D2430]">
							<p className="mb-2 text-[#1D2430] text-center">{dictionary.contactForm?.subtitle || ""}</p>
							<div>
								<span className="font-semibold">{dictionary.contactForm?.officePhoneLabel || "Phone number:"}</span>{" "}
								<a
									href={`tel:${dictionary.contactForm?.officePhone || "+48 515 857 609"}`}
									className="text-[#1D2430] hover:text-[#8f6350] underline transition-colors">
									{dictionary.contactForm?.officePhone || "+48 515 857 609"}
								</a>
							</div>
							<div>
								<span className="font-semibold">{dictionary.contactForm?.officeEmailLabel || "Email address:"}</span>{" "}
								<a
									href={`mailto:${dictionary.contactForm?.officeEmail || "apartamentymsc@gmail.com"}`}
									className="text-[#1D2430] hover:text-[#8f6350] underline transition-colors">
									{dictionary.contactForm?.officeEmail || "apartamentymsc@gmail.com"}
								</a>
							</div>
						</div>
					</div>
				</div>
			</Section>
			{/* Footer */}
			<Footer lang={lang} />
		</>
	)
}

export default ContactPageClient
