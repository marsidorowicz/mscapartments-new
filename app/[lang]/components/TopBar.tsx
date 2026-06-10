/** @format */

"use client"

import React, { useState, useEffect } from "react"
import type { Dictionary } from "@/app/types/dictionary"
import MobileMenu from "./MobileMenu"

import { generateSlug } from "@/utilities/functions/propertyUrl"
import HomeIcon from "@mui/icons-material/Home"

interface TopBarProps {
	dictionary: Dictionary
}

const TopBar: React.FC<TopBarProps> = ({ dictionary }) => {
	const [locale, setLocale] = useState<string>("en")
	const [expandedDesktopMenu, setExpandedDesktopMenu] = useState<string | null>(null)
	const [isHydrated, setIsHydrated] = useState(false)
	const [placesData, setPlacesData] = useState<
		Array<{
			name: string
			id: number
			location: string
		}>
	>([])

	// Handle hydration
	useEffect(() => {
		setIsHydrated(true)
	}, [])

	// Get current locale from URL
	useEffect(() => {
		if (!isHydrated) return

		if (typeof window !== "undefined") {
			const match = window.location.pathname.match(/^\/?([a-z]{2})(\/|$)/)
			if (match && match[1]) {
				setLocale(match[1])
			}
		}
	}, [isHydrated])

	// Fetch places from database
	useEffect(() => {
		const fetchPlaces = async () => {
			try {
				const response = await fetch("/api/properties/places")
				if (response.ok) {
					const data = await response.json()
					if (data.success && data.places) {
						setPlacesData(data.places)
					}
				}
			} catch (error) {
				console.error("Failed to fetch places:", error)
				// Fallback to mock data if API fails
				setPlacesData([
					{ id: 1, name: "Zakopane", location: "Poland" },
					{ id: 2, name: "Kraków", location: "Poland" },
					{ id: 3, name: "Warsaw", location: "Poland" },
				])
			}
		}

		fetchPlaces()
	}, [])

	const scrollToSection = (sectionId: string) => {
		if (isHydrated && typeof window !== "undefined") {
			const element = document.getElementById(sectionId)
			if (element) {
				element.scrollIntoView({
					behavior: "smooth",
					block: "start",
				})
			}
		}
	}

	const scrollToContactSection = () => {
		scrollToSection("contact")
	}

	return (
		<>
			{/* Mobile Menu */}
			<MobileMenu dictionary={dictionary} />

			{/* Main TopBar Container */}
			<div className="fixed top-0 left-0 w-full bg-white opacity-70 shadow-lg z-50 transition-opacity duration-300 hover:opacity-100">
				{/* Desktop Navigation Bar */}

				<div className="hidden md:block bg-white/95 backdrop-blur-sm border-b border-gray-200 relative z-50">
					<div className="w-full px-4 sm:px-6 lg:px-8">
						<div className="flex justify-between items-center py-3 ">
							{/* Logo for Desktop */}
							<div
								onClick={() => {
									if (isHydrated) {
										window.open(`/${locale}`, "_self")
									}
								}}
								className="hidden flex-shrink-0 transform transition-transform duration-300 hover:scale-105 md:block"></div>

							{/* Navigation Items */}
							<nav className="flex items-center space-x-2 lg:space-x-6 flex-1 justify-center">
								<div
									onClick={() => {
										if (isHydrated) {
											window.open(`/${locale}`, "_self")
										}
									}}
									className="flex text-gray-700 hover:text-amber-600 ">
									<HomeIcon />
								</div>
								{/* Apartments */}
								<button
									onClick={() => {
										if (isHydrated) {
											window.open(`/${locale}/#apartments`, "_self")
										}
									}}
									className="text-gray-700 hover:text-amber-600 px-2 lg:px-3 py-2 rounded-md font-medium transition-colors h-10 flex items-center whitespace-nowrap"
									style={{
										fontSize: "clamp(0.875rem, 1.2vw, 1.25rem)",
									}}>
									{dictionary.navigation.apartments}
								</button>

								{/* Apartment Buildings - Dropdown */}
								<div className="relative flex items-center" onMouseEnter={() => setExpandedDesktopMenu("buildings")} onMouseLeave={() => setExpandedDesktopMenu(null)}>
									<button
										className="text-gray-700 hover:text-amber-600 px-2 lg:px-3 py-2 rounded-md font-medium transition-colors flex items-center h-10 whitespace-nowrap"
										style={{
											fontSize: "clamp(0.875rem, 1.2vw, 1.25rem)",
										}}>
										{dictionary.navigation.apartmentBuildings}
										<svg className="ml-1 h-4 w-4 lg:h-5 lg:w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
											<path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
										</svg>
									</button>

									{/* Dropdown Menu */}
									{expandedDesktopMenu === "buildings" && (
										<div className="absolute left-0 top-full w-64 lg:w-72 bg-white border border-gray-200 rounded-md shadow-xl z-[9999]">
											<div className="py-2">
												{placesData.map((place) => {
													if (place?.name === "KOŚCIELISKO") return null
													return (
														<button
															key={place.id}
															onClick={() => {
																const placeSlug = generateSlug(place.name)
																window.open(`/${locale}/place/${placeSlug}`, "_self")
																setExpandedDesktopMenu(null)
															}}
															className="block w-full text-left px-4 lg:px-6 py-2 text-gray-700 hover:bg-amber-50 hover:text-amber-800 transition-colors"
															style={{
																fontSize: "clamp(0.875rem, 1.2vw, 1.25rem)",
															}}>
															{place.name.toUpperCase()}
														</button>
													)
												})}
											</div>
										</div>
									)}
								</div>

								{/* Offers */}
								<button
									onClick={() => {
										if (isHydrated) {
											window.open(`/${locale}/offers`, "_self")
										}
									}}
									className="text-gray-700 hover:text-amber-600 px-2 lg:px-3 py-2 rounded-md font-medium transition-colors h-10 flex items-center whitespace-nowrap"
									style={{
										fontSize: "clamp(0.875rem, 1.2vw, 1.25rem)",
									}}>
									{dictionary.navigation.offers}
								</button>

								{/* Zakopane Rooms */}
								<button
									onClick={() => {
										if (isHydrated) {
											window.open(`/${locale}/zakopane-noclegi`, "_self")
										}
									}}
									className="text-gray-700 hover:text-amber-600 px-2 lg:px-3 py-2 rounded-md font-medium transition-colors h-10 flex items-center whitespace-nowrap"
									style={{
										fontSize: "clamp(0.875rem, 1.2vw, 1.25rem)",
									}}>
									{dictionary.navigation.zakopaneRooms}
								</button>

								{/* Join Us */}
								<button
									onClick={() => {
										if (isHydrated) {
											window.open("/join-us.pdf", "_blank")
										}
									}}
									className="text-gray-700 hover:text-amber-600 px-2 lg:px-3 py-2 rounded-md font-medium transition-colors h-10 flex items-center whitespace-nowrap"
									style={{
										fontSize: "clamp(0.875rem, 1.2vw, 1.25rem)",
									}}>
									{dictionary.navigation.joinUs}
								</button>

								{/* About Us */}
								<button
									onClick={() => {
										if (isHydrated) {
											window.open(`/${locale}/o-nas`, "_self")
										}
									}}
									className="text-gray-700 hover:text-amber-600 px-2 lg:px-3 py-2 rounded-md font-medium transition-colors h-10 flex items-center whitespace-nowrap"
									style={{
										fontSize: "clamp(0.875rem, 1.2vw, 1.25rem)",
									}}>
									{dictionary.navigation.aboutUs}
								</button>

								{/* Regulamin */}
								<button
									onClick={() => {
										if (isHydrated) {
											window.open(`/${locale}/regulamin`, "_self")
										}
									}}
									className="text-gray-700 hover:text-amber-600 px-2 lg:px-3 py-2 rounded-md font-medium transition-colors h-10 flex items-center whitespace-nowrap"
									style={{
										fontSize: "clamp(0.875rem, 1.2vw, 1.25rem)",
									}}>
									{dictionary.navigation.regulamin}
								</button>
							</nav>

							{/* Contact Info and Button */}
							<div className="flex items-center cursor-pointer flex-shrink-0 space-x-2 lg:space-x-4" onClick={scrollToContactSection}>
								<div
									className="text-gray-600 whitespace-nowrap"
									style={{
										fontSize: "clamp(0.875rem, 1.2vw, 1.25rem)",
									}}>
									{dictionary.contactForm.subtitle2}
								</div>
								<div
									className="font-semibold text-gray-800 whitespace-nowrap"
									style={{
										fontSize: "clamp(0.875rem, 1.2vw, 1.25rem)",
									}}>
									tel: {dictionary.contactForm.officePhone}
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Mobile Navigation Bar */}
				<div className="md:hidden bg-white border-b border-gray-200">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="flex justify-end items-center py-3">
							{/* Contact Info and Button */}
							<button
								onClick={() => {
									if (isHydrated) {
										window.open(`/${locale}`, "_self")
									}
								}}
								className="flex text-gray-700 hover:text-amber-600 border-none bg-transparent p-1 cursor-pointer"
								aria-label="Go to home page">
								<HomeIcon />
							</button>
							<div className="flex items-center cursor-pointer space-x-2" onClick={scrollToContactSection}>
								<div className="text-xs text-gray-600 whitespace-nowrap">{dictionary.contactForm.subtitle2}</div>
								<div className="text-xs font-semibold text-gray-800 whitespace-nowrap">tel: {dictionary.contactForm.officePhone}</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}

export default TopBar
