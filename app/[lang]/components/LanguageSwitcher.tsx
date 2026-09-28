/** @format */

"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { allLocales, type AnyLocale } from "@/app/i18n-config"

const LOCALES: { code: AnyLocale; label: string }[] = [
	{ code: "pl", label: "PL" },
	{ code: "en", label: "EN" },
	{ code: "it", label: "IT" },
	{ code: "de", label: "DE" },
	{ code: "es", label: "ES" },
]

/**
 * Compact language dropdown identical to the one in the homepage navbar.
 * Renders the current locale code (e.g. "PL") with a caret and a dropdown
 * listing every reachable locale.
 */
export default function LanguageSwitcher({ lang, className = "" }: { lang: string; className?: string }) {
	const pathname = usePathname()
	const searchParams = useSearchParams()
	const [isOpen, setIsOpen] = useState(false)
	const containerRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				setIsOpen(false)
			}
		}

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside)
		}

		return () => document.removeEventListener("mousedown", handleClickOutside)
	}, [isOpen])

	const getLangUrl = (newLang: string) => {
		const segments = (pathname || `/${lang}`).split("/").filter(Boolean)
		if (segments.length > 0) {
			segments[0] = newLang
		}
		const query = searchParams?.toString()
		return `/${segments.join("/")}${query ? `?${query}` : ""}`
	}

	const currentLabel = allLocales.includes(lang as AnyLocale) ? lang.toUpperCase() : "PL"

	return (
		<div className={`relative flex-shrink-0 ${className}`} ref={containerRef}>
			<button
				type="button"
				onClick={() => setIsOpen((open) => !open)}
				aria-haspopup="true"
				aria-expanded={isOpen}
				className="flex items-center space-x-1 px-2 py-1 text-sm font-medium text-gray-700 hover:text-[#7a4a35] transition-colors duration-200">
				<span className="text-blue-600">{currentLabel}</span>
				<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
				</svg>
			</button>

			{isOpen && (
				<div
					className="absolute right-0 top-full mt-1 z-[99999] min-w-[80px] bg-white border border-gray-200 rounded-md shadow-lg"
					onMouseLeave={() => setIsOpen(false)}>
					<div className="py-1">
						{LOCALES.map(({ code, label }) => (
							<Link
								key={code}
								href={getLangUrl(code)}
								className={`block px-3 py-2 text-sm transition-colors duration-200 ${
									lang === code ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:bg-gray-50 hover:text-[#7a4a35]"
								}`}
								onClick={() => setIsOpen(false)}>
								{label}
							</Link>
						))}
					</div>
				</div>
			)}
		</div>
	)
}
