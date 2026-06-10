/** @format */

import { Locale } from "../../../i18n-config"
import Image from "next/image"
import SocialMedia from "./SocialMedia"

type FooterProps = {
	lang: Locale
}

type FooterTranslations = {
	companyName: string
	companyDescription: string
	phone: string
	officeAndReservations: string
	businessHours: string
	email: string
	quickLinksTitle: string
	home: string
	apartments: string
	apartmentsZakopane: string
	apartmentsKoscielisko: string
	offers: string
	contact: string
	about: string
	locationTitle: string
	location: string
	region: string
	copyright: string
	privacy: string
	terms: string
	cookies: string
}

const footerTranslations: Record<Locale, FooterTranslations> = {
	pl: {
		companyName: "Mountain Apartments",
		companyDescription: "Oferujemy komfortowe apartamenty w Zakopanem i Kościelisku. Twój wymarzony pobyt w sercu Tatr zaczyna się u nas.",
		phone: "+48 511 000 660",
		officeAndReservations: "biuro i rezerwacje",
		businessHours: "Godziny pracy: Pon - Pt 8:00 - 20:00\nSo, Ndz i Święta 9:00 - 17:00",
		email: "biuro@mountainapartments.pl",
		quickLinksTitle: "Szybkie linki",
		home: "Strona główna",
		apartments: "Apartamenty",
		apartmentsZakopane: "Apartamenty Zakopane",
		apartmentsKoscielisko: "Apartamenty Kościelisko",
		offers: "Oferty",
		contact: "Kontakt",
		about: "O nas",
		locationTitle: "Lokalizacja",
		location: "Zakopane i Kościelisko",
		region: "Województwo małopolskie",
		copyright: `© ${new Date().getFullYear()} Mountain Apartments. Wszelkie prawa zastrzeżone.`,
		privacy: "Polityka prywatności",
		terms: "Regulamin",
		cookies: "Cookies",
	},
	en: {
		companyName: "Mountain Apartments",
		companyDescription: "We offer comfortable apartments in Zakopane and Kościelisko. Your perfect stay in the heart of the Tatras begins with us.",
		phone: "+48 511 000 660",
		officeAndReservations: "Office and Reservations",
		businessHours: "Business hours: Mon - Fri 8:00 - 20:00\nSat, Sun and Holidays 9:00 - 17:00",
		email: "biuro@mountainapartments.pl",
		quickLinksTitle: "Quick Links",
		home: "Home",
		apartments: "Apartments",
		apartmentsZakopane: "Zakopane Apartments",
		apartmentsKoscielisko: "Kościelisko Apartments",
		offers: "Offers",
		contact: "Contact",
		about: "About Us",
		locationTitle: "Location",
		location: "Zakopane and Kościelisko",
		region: "Lesser Poland Voivodeship",
		copyright: `© ${new Date().getFullYear()} Mountain Apartments. All rights reserved.`,
		privacy: "Privacy Policy",
		terms: "Terms of Service",
		cookies: "Cookies",
	},
	de: {
		companyName: "Mountain Apartments",
		companyDescription: "Wir bieten komfortable Apartments in Zakopane und Kościelisko. Ihr Traumaufenthalt im Herzen der Tatra beginnt bei uns.",
		phone: "+48 511 000 660",
		officeAndReservations: "Büro und Reservierungen",
		businessHours: "Öffnungszeiten: Mo - Fr 8:00 - 20:00\nSa, So und Feiertage 9:00 - 17:00",
		email: "biuro@mountainapartments.pl",
		quickLinksTitle: "Schnelllinks",
		home: "Startseite",
		apartments: "Apartments",
		apartmentsZakopane: "Apartments Zakopane",
		apartmentsKoscielisko: "Apartments Kościelisko",
		offers: "Angebote",
		contact: "Kontakt",
		about: "Über uns",
		locationTitle: "Standort",
		location: "Zakopane und Kościelisko",
		region: "Woiwodschaft Kleinpolen",
		copyright: `© ${new Date().getFullYear()} Mountain Apartments. Alle Rechte vorbehalten.`,
		privacy: "Datenschutz",
		terms: "AGB",
		cookies: "Cookies",
	},
	es: {
		companyName: "Mountain Apartments",
		companyDescription: "Ofrecemos apartamentos cómodos en Zakopane y Kościelisko. Tu estancia soñada en el corazón de los Tatras comienza con nosotros.",
		phone: "+48 511 000 660",
		officeAndReservations: "Oficina y Reservas",
		businessHours: "Horario de atención: Lun - Vie 8:00 - 20:00\nSáb, Dom y Festivos 9:00 - 17:00",
		email: "biuro@mountainapartments.pl",
		quickLinksTitle: "Enlaces Rápidos",
		home: "Inicio",
		apartments: "Apartamentos",
		apartmentsZakopane: "Apartamentos Zakopane",
		apartmentsKoscielisko: "Apartamentos Kościelisko",
		offers: "Ofertas",
		contact: "Contacto",
		about: "Sobre Nosotros",
		locationTitle: "Ubicación",
		location: "Zakopane y Kościelisko",
		region: "Voivodato de Pequeña Polonia",
		copyright: `© ${new Date().getFullYear()} Mountain Apartments. Todos los derechos reservados.`,
		privacy: "Política de Privacidad",
		terms: "Términos y Condiciones",
		cookies: "Cookies",
	},
}

export default function Footer({ lang }: FooterProps) {
	const footer = footerTranslations[lang] || footerTranslations.pl

	return (
		<footer className="bg-[#1D2430] text-white py-12">
			<div className="container mx-auto px-4">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
					{/* Company Info */}
					<div className="md:col-span-2">
						<div className="flex">
							<h3 className="text-xl font-bold mb-4 text-white">{footer.companyName || "Mountain Apartments"}</h3>

							{/* Logo */}
							<div className="block pl-3">
								<div className="flex items-center gap-4">
									<Image src="/images/logo-mountain-rf.png" alt="Mountain RF" width={120} height={40} className="h-10 w-auto" />
									<Image
										src="/images/orlyzlogomountain.jpg"
										alt="Orlyz Logo Mountain"
										width={120}
										height={40}
										quality={50}
										className="h-10 w-auto"
									/>
								</div>
							</div>
						</div>
						<p className="text-white mb-4 leading-relaxed">
							{footer.companyDescription ||
								"We offer comfortable apartments in the most beautiful locations in Zakopane and surroundings. Your perfect stay in the heart of the Tatras begins with us."}
						</p>
						<div className="flex flex-col gap-4">
							{/* First line: Phone and Office */}
							<div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4">
								<div className="flex items-center gap-2">
									<svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
										/>
									</svg>
									<a href={`tel:${footer.phone || "+48 511 000 660"}`} className="text-white hover:text-blue-400 transition-colors">
										{footer.phone || "+48 511 000 660"}
									</a>
									<div className="text-white text-sm ml-2">{footer.officeAndReservations || "Biuro i Rezerwacje"}</div>
								</div>
							</div>
							{/* Business Hours */}
							<div className="text-white text-sm whitespace-pre-line">
								{footer.businessHours || "Godziny pracy: Pon - Pt 8:00 - 20:00\nSo, Ndz i Święta 9:00 - 17:00"}
							</div>
							{/* Second line: Email */}
							<div className="flex items-center gap-2">
								<svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
									/>
								</svg>
								<a
									href={`mailto:${footer.email || "biuro@mountainapartments.pl"}`}
									className="text-white hover:text-blue-400 transition-colors">
									{footer.email || "biuro@mountainapartments.pl"}
								</a>
							</div>
						</div>
					</div>

					{/* Quick Links */}
					<div>
						<h4 className="text-lg font-semibold mb-4 text-white">{footer.quickLinksTitle || "Quick Links"}</h4>
						<ul className="space-y-2">
							<li>
								<a href={`/${lang}/`} className="text-white hover:text-blue-400 transition-colors">
									{footer.home || "Home"}
								</a>
							</li>
							<li>
								<a href={`/${lang}/apartamenty`} className="text-white hover:text-blue-400 transition-colors">
									{footer.apartments || "Apartments"}
								</a>
							</li>
							<li>
								<a href={`/${lang}/apartamenty-zakopane`} className="text-white hover:text-blue-400 transition-colors">
									{footer.apartmentsZakopane || "Zakopane"}
								</a>
							</li>
							<li>
								<a href={`/${lang}/apartamenty-koscielisko`} className="text-white hover:text-blue-400 transition-colors">
									{footer.apartmentsKoscielisko || "Kościelisko"}
								</a>
							</li>
							<li>
								<a href={`/${lang}/offers`} className="text-white hover:text-blue-400 transition-colors">
									{footer.offers || "Offers"}
								</a>
							</li>
							<li>
								<a href={`/${lang}/contact`} className="text-white hover:text-blue-400 transition-colors">
									{footer.contact || "Contact"}
								</a>
							</li>
							<li>
								<a href={`/${lang}/o-nas`} className="text-white hover:text-blue-400 transition-colors">
									{footer.about || "About Us"}
								</a>
							</li>
							<li>
								<a href={`/${lang}/regulamin`} className="text-white hover:text-blue-400 transition-colors">
									{footer.terms || "Regulamin"}
								</a>
							</li>
						</ul>
					</div>

					{/* Location & Social */}
					<div>
						<h4 className="text-lg font-semibold mb-4 text-white">{footer.locationTitle || "Location"}</h4>
						<div className="text-white space-y-2 mb-4">
							<p className="flex items-start gap-2">
								<svg className="w-4 h-4 text-white mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z"
									/>
								</svg>
								<span>
									{footer.location || "Zakopane and Kościelisko"}
									<br />
									{footer.region || "Lesser Poland Voivodeship"}
								</span>
							</p>
						</div>

						{/* Social Media */}
						<SocialMedia />
					</div>
				</div>

				{/* Bottom Bar */}
				<div className="border-t border-gray-700 mt-8 pt-8">
					<div className="flex flex-col md:flex-row justify-between items-center gap-4">
						<p className="text-white text-sm">
							{(footer.copyright || `© ${new Date().getFullYear()} Mountain Apartments. All rights reserved.`).replace(
								"{{year}}",
								new Date().getFullYear().toString(),
							)}
						</p>
						<div className="flex gap-6 text-sm">
							<a href={`/${lang}/privacy`} className="text-white hover:text-blue-400 transition-colors">
								{footer.privacy || "Privacy Policy"}
							</a>
							<a href={`/${lang}/regulamin`} className="text-white hover:text-blue-400 transition-colors">
								{footer.terms || "Terms of Service"}
							</a>
							<a href="#" className="text-white hover:text-blue-400 transition-colors">
								{footer.cookies || "Cookies"}
							</a>
						</div>
					</div>
				</div>
			</div>
		</footer>
	)
}
