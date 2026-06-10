/** @format */

import { en } from "./en"
import { pl } from "./pl"
import { de } from "./de"
import { es } from "./es"

const dictionaries = {
	en,
	pl,
	de,
	es,
}

export const getDictionary = async (locale: string) => {
	try {
		// Ensure locale is a valid string
		if (!locale || typeof locale !== "string") {
			return dictionaries.en
		}

		// Clean the locale to handle cases like 'en-US' -> 'en'
		const cleanLocale = locale.split("-")[0].toLowerCase()

		const dictionary = dictionaries[cleanLocale as keyof typeof dictionaries]
		// Fallback to English if the requested locale doesn't exist
		return dictionary || dictionaries.en
	} catch (error) {
		console.warn("Error loading dictionary for locale:", locale, error)
		return dictionaries.en
	}
}

export { en, pl, de, es }
