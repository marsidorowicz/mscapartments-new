/** @format */

import { getDictionary } from "../../dictionaries"

import ContactPageClient from "./ContactPageClient"
import type { Metadata } from "next"

// Server component: fetches dictionary and passes to client
const ContactPage = async ({ params }: { params: Promise<{ lang: string }> }) => {
	const { lang } = await params
	const dictionary = await getDictionary(lang)
	return <ContactPageClient dictionary={dictionary} lang={lang as "pl" | "en" | "de" | "es"} />
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
	const { lang } = await params
	const dictionary = await getDictionary(lang)

	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mountainapartments.pl"
	const currentUrl = `${baseUrl}/${lang}/contact`

	return {
		title: `${dictionary.navigation.contact} - ${dictionary.title}`,
		description:
			dictionary.contactForm?.subtitle || "Contact Mountain Apartments for reservations and inquiries about accommodation in Zakopane and Kościelisko",
		keywords: [dictionary.navigation.contact, "Mountain Apartments", "Zakopane", "Kościelisko", "rezerwacje", "noclegi", "kontakt"].join(", "),
		authors: [
			{
				name: "Mountain Apartments",
				url: "https://mountainapartments.pl",
			},
		],
		creator: "Mountain Apartments",
		publisher: "Mountain Apartments",
		metadataBase: new URL(baseUrl),
		alternates: {
			canonical: currentUrl,
			languages: {
				en: `${baseUrl}/en/contact`,
				pl: `${baseUrl}/pl/contact`,
				de: `${baseUrl}/de/contact`,
				es: `${baseUrl}/es/contact`,
			},
		},
		openGraph: {
			title: `${dictionary.navigation.contact} - ${dictionary.title}`,
			description:
				dictionary.contactForm?.subtitle ||
				"Contact Mountain Apartments for reservations and inquiries about accommodation in Zakopane and Kościelisko",
			url: currentUrl,
			siteName: "Mountain Apartments",
			images: [
				{
					url: `${baseUrl}/images/contact-hero.jpg`,
					width: 1200,
					height: 630,
					alt: "Contact Mountain Apartments",
				},
			],
			locale: lang,
			type: "website",
		},
		twitter: {
			card: "summary_large_image",
			title: `${dictionary.navigation.contact} - ${dictionary.title}`,
			description:
				dictionary.contactForm?.subtitle ||
				"Contact Mountain Apartments for reservations and inquiries about accommodation in Zakopane and Kościelisko",
			images: [`${baseUrl}/images/contact-hero.jpg`],
		},
		robots: {
			index: true,
			follow: true,
			googleBot: {
				index: true,
				follow: true,
				"max-video-preview": -1,
				"max-image-preview": "large",
				"max-snippet": -1,
			},
		},
	}
}

export default ContactPage
