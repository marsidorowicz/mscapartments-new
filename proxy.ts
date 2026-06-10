/** @format */

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { i18n } from "./app/i18n-config"

export const config = {
	matcher: [
		// Skip all internal paths (_next)
		// Only run the middleware for the root path or paths that don't have a locale prefix
		"/((?!_next|api|.*\\..*).*)",
	],
}
export default async function proxy(req: NextRequest) {
	const pathname = req.nextUrl.pathname

	// Check if there is any supported locale in the pathname
	const pathnameIsMissingLocale = i18n.locales.every((locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`)
	// Redirect if there is no locale
	if (pathnameIsMissingLocale) {
		const locale = "pl"

		// e.g. incoming request is /products?token=abc
		// The new URL is now /pl/products?token=abc (preserving query parameters)
		const newUrl = new URL(`/${locale}${pathname.startsWith("/") ? "" : "/"}${pathname}`, req.url)
		// Preserve query parameters from the original request
		newUrl.search = req.nextUrl.search

		return NextResponse.redirect(newUrl)
	}
}
