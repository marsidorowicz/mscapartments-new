/** @format */

"use client"

import React, { useState, useEffect } from "react"
import type { Dictionary } from "@/app/types/dictionary"

interface MobileMenuProps {
	dictionary: Dictionary
}

interface PlaceData {
	id: number
	name: string
	location: string
}

// SVG Icons as components
const MenuIcon = () => (
	<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
	</svg>
)

const XIcon = () => (
	<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-black">
		<path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
	</svg>
)

const ChevronDownIcon = ({ className }: { className?: string }) => (
	<svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
	</svg>
)

const MobileMenu: React.FC<MobileMenuProps> = ({ dictionary }) => {
	const [isOpen, setIsOpen] = useState(false)
	const [expandedSection, setExpandedSection] = useState<string | null>(null)
	const [locale, setLocale] = useState<string>("en")
	const [placesData, setPlacesData] = useState<PlaceData[]>([])

	// Get current locale from URL
	useEffect(() => {
		if (typeof window !== "undefined") {
			const match = window.location.pathname.match(/^\/?([a-z]{2})(\/|$)/)
			if (match && match[1]) {
				setLocale(match[1])
			}
		}
	}, [])

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
					{ id: 1, name: "ZAKOPANE", location: "Poland" },
					{ id: 2, name: "KRAKÓW", location: "Poland" },
					{ id: 3, name: "WARSAW", location: "Poland" },
				])
			}
		}

		fetchPlaces()
	}, [])

	const scrollToSection = (sectionId: string) => {
		if (typeof window !== "undefined") {
			const element = document.getElementById(sectionId)
			if (element) {
				element.scrollIntoView({
					behavior: "smooth",
					block: "start",
				})
				setIsOpen(false)
			}
		}
	}

	const scrollToContactSection = () => {
		scrollToSection("contact")
	}

	const handleToggleExpand = (section: string) => {
		setExpandedSection(expandedSection === section ? null : section)
	}

	const handleMenuToggle = () => {
		setIsOpen(!isOpen)
	}

	// Prevent body scroll when menu is open
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = "hidden"
		} else {
			document.body.style.overflow = "auto"
		}

		return () => {
			document.body.style.overflow = "auto"
		}
	}, [isOpen])

	return (
		<>
			{/* Menu Button */}
			<button
				onClick={handleMenuToggle}
				className="fixed top-3 left-3 z-[60] bg-white/90 backdrop-blur-sm rounded-md shadow-md hover:bg-amber-50 hover:shadow-lg active:bg-amber-100 transition-all duration-200 border border-gray-200 hover:border-amber-300 flex md:hidden"
				aria-label={dictionary.navigation.menu}
				style={{
					minWidth: "20px",
					minHeight: "20px",
					alignItems: "center",
					justifyContent: "center",
				}}>
				{isOpen ? (
					<div className="text-gray-700 hover:text-amber-600">
						<XIcon />
					</div>
				) : (
					<div className="text-gray-700 hover:text-amber-600">
						<MenuIcon />
					</div>
				)}
			</button>

			{/* Overlay */}
			{isOpen && <div className="fixed inset-0 bg-black/50 z-[55]" onClick={handleMenuToggle} />}

			{/* Mobile Menu */}
			<div
				className={`fixed top-0 left-0 h-full w-80 bg-white shadow-xl z-[70] transform transition-transform duration-300 ease-in-out ${
					isOpen ? "translate-x-0" : "-translate-x-full"
				}`}
				style={{ position: "fixed", zIndex: 9999 }}>
				<div className="flex flex-col h-full">
					{/* Header */}
					<div className="flex items-center justify-between p-4 border-b">
						<h2 className="text-lg font-semibold text-gray-800">{dictionary.navigation.menu}</h2>

						<button
							onClick={handleMenuToggle}
							className="p-1 rounded text-black-md hover:bg-gray-100 active:bg-gray-200 transition-all duration-200"
							aria-label={dictionary.navigation.close}>
							<XIcon />
						</button>
					</div>

					{/* Menu Items */}
					<div className="flex-1 overflow-y-auto py-4" style={{ pointerEvents: "auto", zIndex: 10000 }}>
						<nav className="space-y-2 px-4" style={{ pointerEvents: "auto" }}>
							{/* Apartments - Scroll to About Section */}
							<button
								onClick={() => {
									window.open(`/${locale}/#apartments`, "_self")
								}}
								className="w-full text-left p-3 rounded-lg hover:bg-amber-50 hover:text-amber-800 active:bg-amber-100 transition-all duration-200 border border-transparent hover:border-amber-200"
								style={{
									pointerEvents: "auto",
									zIndex: 10001,
									position: "relative",
								}}>
								<span className="font-medium text-gray-800 hover:text-amber-800 transition-colors">{dictionary.navigation.apartments}</span>
							</button>

							{/* Apartment Buildings - Expandable */}
							<div>
								<button
									onClick={() => {
										handleToggleExpand("buildings")
									}}
									className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-amber-50 hover:text-amber-800 active:bg-amber-100 transition-all duration-200 border border-transparent hover:border-amber-200"
									style={{
										pointerEvents: "auto",
										zIndex: 10001,
										position: "relative",
									}}>
									<span className="font-medium text-gray-800 hover:text-amber-800 transition-colors">
										{dictionary.navigation.apartmentBuildings}
									</span>
									<ChevronDownIcon
										className={`w-4 h-4 text-gray-600 hover:text-amber-600 transition-all duration-200 ${expandedSection === "buildings" ? "rotate-180" : ""}`}
									/>
								</button>
								{expandedSection === "buildings" && (
									<div className="ml-4 mt-2 space-y-2">
										{placesData.map((place) => (
											<button
												key={place.id}
												onClick={() => {
													// Navigate to place/location page - you can implement this based on your routing

													setIsOpen(false)
												}}
												className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-amber-800 hover:bg-amber-50 active:bg-amber-100 rounded transition-all duration-200 border border-transparent hover:border-amber-200">
												{place.name.toUpperCase()}
											</button>
										))}
									</div>
								)}
							</div>

							{/* Offers */}
							<button
								onClick={() => {
									window.open(`/${locale}/offers`, "_self")
									setIsOpen(false)
								}}
								className="w-full text-left p-3 rounded-lg hover:bg-amber-50 hover:text-amber-800 active:bg-amber-100 transition-all duration-200 border border-transparent hover:border-amber-200"
								style={{
									pointerEvents: "auto",
									zIndex: 10001,
									position: "relative",
								}}>
								<span className="font-medium text-gray-800 hover:text-amber-800 transition-colors">{dictionary.navigation.offers}</span>
							</button>

							{/* Zakopane Rooms */}
							<button
								onClick={() => {
									window.open(`/${locale}/zakopane-noclegi`, "_self")
									setIsOpen(false)
								}}
								className="w-full text-left p-3 rounded-lg hover:bg-amber-50 hover:text-amber-800 active:bg-amber-100 transition-all duration-200 border border-transparent hover:border-amber-200"
								style={{
									pointerEvents: "auto",
									zIndex: 10001,
									position: "relative",
								}}>
								<span className="font-medium text-gray-800 hover:text-amber-800 transition-colors">{dictionary.navigation.zakopaneRooms}</span>
							</button>

							{/* Join Us */}
							<button
								onClick={() => {
									// Open PDF file
									window.open("/join-us.pdf", "_blank")
									setIsOpen(false)
								}}
								className="w-full text-left p-3 rounded-lg hover:bg-amber-50 hover:text-amber-800 active:bg-amber-100 transition-all duration-200 border border-transparent hover:border-amber-200">
								<span className="font-medium text-gray-800 hover:text-amber-800 transition-colors">{dictionary.navigation.joinUs}</span>
							</button>

							{/* About Us */}
							<button
								onClick={() => {
									// Navigate to about us page
									window.open("/o-nas", "_self")
									setIsOpen(false)
								}}
								className="w-full text-left p-3 rounded-lg hover:bg-amber-50 hover:text-amber-800 active:bg-amber-100 transition-all duration-200 border border-transparent hover:border-amber-200">
								<span className="font-medium text-gray-800 hover:text-amber-800 transition-colors">{dictionary.navigation.aboutUs}</span>
							</button>

							{/* Regulamin */}
							<button
								onClick={() => {
									window.open(`/${locale}/regulamin`, "_self")
									setIsOpen(false)
								}}
								className="w-full text-left p-3 rounded-lg hover:bg-amber-50 hover:text-amber-800 active:bg-amber-100 transition-all duration-200 border border-transparent hover:border-amber-200">
								<span className="font-medium text-gray-800 hover:text-amber-800 transition-colors">{dictionary.navigation.regulamin}</span>
							</button>
						</nav>
					</div>

					{/* Contact Info at bottom */}
					<div className="border-t p-4 bg-gray-50">
						<button
							onClick={scrollToContactSection}
							className="w-full text-center p-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 active:bg-amber-800 transition-all duration-200 font-medium transform hover:scale-[1.02] active:scale-[0.98]">
							{dictionary.home.contact.contactButton}
						</button>
						<div className="text-center mt-2">
							<div className="text-sm text-gray-600">{dictionary.contactForm.subtitle}</div>
							<span className="text-lg font-bold text-gray-800">tel: {dictionary.contactForm.officePhone}</span>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}

export default MobileMenu
