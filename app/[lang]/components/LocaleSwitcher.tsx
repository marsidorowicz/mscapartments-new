/** @format */

"use client"

import { usePathname, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useEffect, useState, useRef } from "react"
import { i18n } from "../../i18n-config"
import { Locale } from "../../i18n-config"

export default function LocaleSwitcher({}: { showAvatar?: boolean }) {
	const pathName = usePathname()
	const searchParams = useSearchParams()
	const [isOpen, setIsOpen] = useState(false)
	const [currentLocale, setCurrentLocale] = useState<Locale>(i18n.defaultLocale)
	const [isHydrated, setIsHydrated] = useState(false)
	const dropdownRef = useRef<HTMLDivElement>(null)

	// Handle hydration
	useEffect(() => {
		setIsHydrated(true)
	}, [])

	// Get current locale from URL on initial load
	useEffect(() => {
		if (!isHydrated) return

		const segments = pathName?.split("/")
		if (segments && segments.length > 1) {
			const urlLocale = segments[1] as Locale
			if (i18n.locales.includes(urlLocale)) {
				setCurrentLocale(urlLocale)
				// Save to localStorage for persistence
				if (typeof window !== "undefined") {
					localStorage.setItem("selectedLocale", urlLocale)
				}
			}
		} else {
			// Check localStorage for saved locale
			if (typeof window !== "undefined") {
				const savedLocale = localStorage.getItem("selectedLocale") as Locale
				if (savedLocale && i18n.locales.includes(savedLocale)) {
					setCurrentLocale(savedLocale)
				} else {
					// Default to the i18n defaultLocale
					setCurrentLocale(i18n.defaultLocale)
				}
			}
		}
	}, [pathName, isHydrated])

	// Handle click outside to close dropdown
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false)
			}
		}

		// Add event listener when dropdown is open
		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside)
		}

		// Clean up event listener
		return () => {
			document.removeEventListener("mousedown", handleClickOutside)
		}
	}, [isOpen])

	const redirectedPathName = (locale: string) => {
		if (!pathName) return "/"
		const segments = pathName.split("/")
		segments[1] = locale
		const query = searchParams?.toString()
		return `${segments.join("/")}${query ? `?${query}` : ""}`
	}

	const handleLocaleClick = (locale: Locale) => {
		if (locale === currentLocale) {
			// Toggle dropdown if clicking the current locale
			setIsOpen(!isOpen)
		} else {
			// Select new locale and close dropdown
			setCurrentLocale(locale)
			if (typeof window !== "undefined") {
				localStorage.setItem("selectedLocale", locale)
			}
			setIsOpen(false)
		}
	}
	// Function to get display name for each locale
	const getLocaleDisplayName = (locale: string): string => {
		const localeMap: Record<string, string> = {
			en: "English",
			pl: "Polski",
			de: "Deutsch",
			es: "Español",
		}
		return localeMap[locale] || locale
	}
	// Get shortened display for button
	const getLocaleShortDisplay = (locale: string): string => {
		return locale.toUpperCase()
	}

	return (
		<div className="flex space-x-1 fixed bottom-1 right-1">
			<div ref={dropdownRef} className={`flex flex-col gap-2 ${isOpen ? "p-2 bg-white/40 backdrop-blur-sm rounded-lg" : ""}`}>
				{isOpen ? (
					<div className="flex space-x-2">
						<div className="flex flex-col space-y-2">
							{
								// Show all locales when open

								i18n.locales.map((locale) => (
									<div className="flex justify-between space-x-2" key={locale}>
										<Link
											href={redirectedPathName(locale)}
											onClick={() => handleLocaleClick(locale)}
											className={`rounded-md border-2 ${
												locale === currentLocale ? "border-black bg-white/30 text-black" : "border-white text-white bg-black/30"
											} px-3 py-1.5 text-center transition-colors hover:bg-black/10`}>
											{getLocaleDisplayName(locale)}
										</Link>
									</div>
								))
							}
						</div>
					</div>
				) : (
					// Show only current locale when closed
					<div className="flex justify-between space-x-2">
						{isHydrated ? (
							<button
								onClick={() => setIsOpen(true)}
								className="rounded-md border-2 border-black bg-white/80 text-black px-3 py-1.5 min-w-[40px] text-center transition-colors hover:bg-white/50">
								{getLocaleShortDisplay(currentLocale)}
							</button>
						) : (
							<div className="rounded-md border-2 border-black bg-white/80 text-black px-3 py-1.5 min-w-[40px] text-center">
								{getLocaleShortDisplay(i18n.defaultLocale)}
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	)
}
