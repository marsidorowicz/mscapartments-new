/** @format */

import { Locale } from "../../i18n-config"

type ApartmentLocation = "zakopane" | "koscielisko" | undefined

type ApartmentPageText = {
	title: string
	description: string
	keywords: string[]
	heading: string
	subtitle: string
}

const apartmentPageTexts: Record<Locale, { default: ApartmentPageText; zakopane: ApartmentPageText; koscielisko: ApartmentPageText }> = {
	pl: {
		default: {
			title: "Apartamenty w Zakopanem i Kościelisku",
			description:
				"Szukasz apartamentów w górach? Sprawdź nasze oferty w Zakopanem i Kościelisku — apartamenty w górach, apartamenty Zakopane, apartamenty Kościelisko i apartamenty hotelowe Zakopane.",
			keywords: ["apartamenty w górach", "apartamenty Zakopane", "apartamenty Kościelisko", "apartamenty hotelowe Zakopane", "noclegi w górach"],
			heading: "Apartamenty w Zakopanem i Kościelisku",
			subtitle:
				"Znajdź komfortowe apartamenty w górach – Zakopane i Kościelisko. Apartamenty w górach i apartamenty hotelowe Zakopane  | Kościelisko w jednym miejscu.",
		},
		zakopane: {
			title: "Apartamenty Zakopanem",
			description:
				"Apartamenty w Zakopanem — komfortowe noclegi i apartamenty hotelowe w Zakopanem. Sprawdź oferty apartamentów w Zakopanem i apart hotel Zakopane.",
			keywords: ["apartamenty Zakopane", "apartamenty w górach Zakopane", "apart hotel Zakopane", "noclegi Zakopane", "noclegi w górach"],
			heading: "Apartamenty w Zakopanem",
			subtitle: "Szukasz apartamentów w górach w Zakopanem? Oferujemy wygodne noclegi blisko atrakcji i szlaków.",
		},
		koscielisko: {
			title: "Apartamenty w Kościelisku",
			description: "Apartamenty w Kościeliski — komfortowe noclegi w górach blisko tras turystycznych i narciarskich. Sprawdź apartamenty w Kościelisku.",
			keywords: ["apartamenty Kościelisko", "apartamenty w górach Kościelisko", "noclegi Kościelisko", "noclegi w górach", "apartamenty w górach"],
			heading: "Apartamenty w Kościelisku",
			subtitle: "Znajdź komfortowe apartamenty w górach w Kościelisku — blisko natury, szlaków i stoków narciarskich.",
		},
	},
	en: {
		default: {
			title: "Mountain apartments in Zakopane and Kościelisko",
			description:
				"Looking for mountain apartments in the Tatras? Browse our Zakopane and Kościelisko offers — mountain apartments, Zakopane apartments, Kościelisko apartments and mountain hotel apartments Zakopane.",
			keywords: ["mountain apartments", "Zakopane apartments", "Kościelisko apartments", "mountain hotel apartments Zakopane", "mountain accommodation"],
			heading: "Mountain apartments in Zakopane and Kościelisko",
			subtitle: "Find comfortable mountain apartments in Zakopane and Kościelisko — mountain apartments and mountain hotel apartments in one place.",
		},
		zakopane: {
			title: "Zakopane apartments",
			description:
				"Zakopane apartments — comfortable stays and mountain hotel apartments in Zakopane. Browse our Zakopane apartment offers and ski resort accommodation.",
			keywords: ["Zakopane apartments", "mountain apartments Zakopane", "apart hotel Zakopane", "Zakopane accommodation", "mountain accommodation"],
			heading: "Zakopane apartments",
			subtitle: "Looking for mountain apartments in Zakopane? Discover comfortable stays near the town center and the Tatras.",
		},
		koscielisko: {
			title: "Kościelisko apartments",
			description:
				"Kościelisko apartments — comfortable mountain stays close to hiking trails and ski slopes. Browse our Kościelisko apartments for the perfect mountain getaway.",
			keywords: ["Kościelisko apartments", "mountain apartments Kościelisko", "Kościelisko accommodation", "mountain accommodation", "Tatras apartments"],
			heading: "Kościelisko apartments",
			subtitle: "Discover comfortable mountain apartments in Kościelisko — ideal for hiking and winter stays.",
		},
	},
	de: {
		default: {
			title: "Bergapartments in Zakopane und Kościelisko",
			description:
				"Suchen Sie Bergapartments in den Tatra-Bergen? Entdecken Sie unsere Angebote in Zakopane und Kościelisko — Bergapartments, Zakopane Apartments, Kościelisko Apartments und Berghotel-Apartments Zakopane.",
			keywords: ["Bergapartments", "Zakopane Apartments", "Kościelisko Apartments", "Berghotel-Apartments Zakopane", "Bergunterkunft"],
			heading: "Bergapartments in Zakopane und Kościelisko",
			subtitle: "Finden Sie komfortable Bergapartments in Zakopane und Kościelisko — Bergapartments und Berghotel-Apartments an einem Ort.",
		},

		zakopane: {
			title: "Bergapartments Zakopane",
			description:
				"Bergapartments Zakopane — komfortable Unterkünfte und Berghotel-Apartments in Zakopane. Entdecken Sie Zakopane Apartments in den Bergen.",
			keywords: ["Zakopane Apartments", "Bergapartments Zakopane", "Apart Hotel Zakopane", "Unterkunft Zakopane", "Bergunterkunft"],
			heading: "Bergapartments Zakopane",
			subtitle: "Suchen Sie Bergapartments in Zakopane? Finden Sie komfortable Unterkünfte nahe der Tatra-Berge.",
		},
		koscielisko: {
			title: "Bergapartments Kościelisko",
			description: "Bergapartments Kościelisko — komfortable Bergunterkünfte nahe Wanderwegen und Skipisten. Entdecken Sie Apartments in Kościelisko.",
			keywords: ["Kościelisko Apartments", "Bergapartments Kościelisko", "Kościelisko Unterkunft", "Bergunterkunft", "Tatras Apartments"],
			heading: "Bergapartments Kościelisko",
			subtitle: "Entdecken Sie komfortable Bergapartments in Kościelisko — ideal für Wanderer und Wintersportler.",
		},
	},
	es: {
		default: {
			title: "Apartamentos en Zakopane y Kościelisko",
			description:
				"¿Buscas apartamentos en la montaña? Descubre nuestras ofertas en Zakopane y Kościelisko — apartamentos en la montaña, apartamentos Zakopane, apartamentos Kościelisko y apartamentos hoteleros Zakopane.",
			keywords: [
				"apartamentos en la montaña",
				"apartamentos Zakopane",
				"apartamentos Kościelisko",
				"apartamentos hoteleros Zakopane",
				"alojamiento en la montaña",
			],
			heading: "Apartamentos en Zakopane y Kościelisko",
			subtitle:
				"Encuentra cómodos apartamentos en la montaña — Zakopane y Kościelisko. Apartamentos en la montaña y apartamentos hoteleros Zakopane en un solo lugar.",
		},
		zakopane: {
			title: "Apartamentos Zakopane",
			description:
				"Apartamentos en Zakopane — alojamientos cómodos y apartamentos hoteleros en Zakopane. Descubre nuestras ofertas de apartamentos en Zakopane.",
			keywords: [
				"apartamentos Zakopane",
				"apartamentos en la montaña Zakopane",
				"apart hotel Zakopane",
				"alojamiento Zakopane",
				"alojamiento en la montaña",
			],
			heading: "Apartamentos Zakopane",
			subtitle: "Busca apartamentos en la montaña en Zakopane? Descubre alojamientos cómodos cerca de las montañas.",
		},
		koscielisko: {
			title: "Apartamentos en Kościelisko",
			description:
				"Apartamentos en Kościelisko — alojamientos cómodos cerca de senderos y pistas de esquí. Descubre nuestros apartamentos en Kościelisko.",
			keywords: [
				"apartamentos Kościelisko",
				"apartamentos en la montaña Kościelisko",
				"alojamiento Kościelisko",
				"alojamiento en la montaña",
				"apartamentos Tatras",
			],
			heading: "Apartamentos en Kościelisko",
			subtitle: "Encuentra cómodos apartamentos en Kościelisko — cerca de la naturaleza, senderos y pistas de esquí.",
		},
	},
}

export function getApartamentyPageText(lang: Locale, location?: ApartmentLocation): ApartmentPageText {
	const localeText = apartmentPageTexts[lang] || apartmentPageTexts.pl
	if (location === "zakopane") return localeText.zakopane
	if (location === "koscielisko") return localeText.koscielisko
	return localeText.default
}
