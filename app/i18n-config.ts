/** @format */

// Active/supported locales. German (de) and Spanish (es) are intentionally
// excluded from the active set for now (their dictionary files are kept for
// later re-enabling), so the sitemap/hreflang only advertise locales that have
// DB slugs.
export const locales = ["en", "pl", "it"] as const

// Locales that are no longer advertised but whose pages/dictionaries must stay
// reachable (e.g. the routing middleware must not re-prefix /de or /es).
export const retainedLocales = ["de", "es"] as const

// Every locale prefix the app can resolve at runtime.
export const allLocales = [...locales, ...retainedLocales] as const

export const i18n = {
	defaultLocale: "pl",
	locales: locales,
} as const

export type Locale = (typeof i18n)["locales"][number]

// Any locale the app can render/rout to (active + retained).
export type AnyLocale = (typeof allLocales)[number]
