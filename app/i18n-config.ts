/** @format */

export const locales = ["en", "pl", "de", "es"] as const

export const i18n = {
	defaultLocale: "pl",
	locales: locales,
} as const

export type Locale = (typeof i18n)["locales"][number]
