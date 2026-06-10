/** @format */

"use client"

import { useEffect, useState, useRef } from "react"
import dynamic from "next/dynamic"
import Script from "next/script"
import LocaleSwitcher from "./LocaleSwitcher"
const ContactSection = dynamic(() => import("./sections/ContactSection"), {
	loading: () => <SectionLoader />,
	ssr: false,
})

// Lazy load section components - load eagerly but render conditionally
const HeroSection = dynamic(() => import("./sections/HeroSection"), {
	loading: () => <SectionLoader />,
	ssr: false,
})

const CarouselSection = dynamic(() => import("./sections/CarouselSection"), {
	loading: () => <SectionLoader />,
	ssr: false,
})

// const FeaturesSection = dynamic(() => import("./sections/FeaturesSection"), {
// 	loading: () => <SectionLoader />,
// 	ssr: false,
// })

const ReviewsSection = dynamic(() => import("./sections/ReviewsSection"), {
	loading: () => <SectionLoader />,
	ssr: false,
})

// Loading placeholder for sections
const SectionLoader = () => (
	<div className="h-screen w-full flex items-center justify-center">
		<div className="animate-pulse flex space-x-4">
			<div className="flex-1 space-y-6 py-1">
				<div className="h-2 bg-slate-200 rounded"></div>
				<div className="space-y-3">
					<div className="grid grid-cols-3 gap-4">
						<div className="h-2 bg-slate-200 rounded col-span-2"></div>
						<div className="h-2 bg-slate-200 rounded col-span-1"></div>
					</div>
					<div className="h-2 bg-slate-200 rounded"></div>
				</div>
			</div>
		</div>
	</div>
)

import type { Dictionary } from "../../types/dictionary"
type HomePageProps = {
	dictionary: Dictionary
}

export default function HomePage({ dictionary }: HomePageProps) {
	// Prevent hydration mismatch for client-only features
	const [mounted, setMounted] = useState(false)
	useEffect(() => {
		setMounted(true)
	}, [])
	// Get current locale from URL (client side only)
	const [locale, setLocale] = useState<string>("en")
	useEffect(() => {
		if (typeof window !== "undefined") {
			// Expecting path like /en, /pl, /de, /es, ...
			const match = window.location.pathname.match(/^\/?([a-z]{2})(\/|$)/)
			if (match && match[1]) {
				setLocale(match[1])
			}
		}
	}, [])
	// Cookie bar state
	const [cookieAccepted, setCookieAccepted] = useState<boolean>(() => {
		if (typeof window !== "undefined") {
			return localStorage.getItem("cookieAccepted") === "true"
		}
		return false
	})

	useEffect(() => {
		if (typeof window === "undefined") return
		if (cookieAccepted) {
			localStorage.setItem("cookieAccepted", "true")
		}
	}, [cookieAccepted])

	const handleAcceptCookies = () => {
		setCookieAccepted(true)
	}

	const handleDeclineCookies = () => {
		setCookieAccepted(true) // Still hide bar, but you may want to handle differently
	}
	const [currentSection, setCurrentSection] = useState<string>("hero")
	// Section refs for intersection observer
	const heroRef = useRef<HTMLDivElement>(null)
	const aboutRef = useRef<HTMLDivElement>(null)
	// const featuresRef = useRef<HTMLDivElement>(null)
	const reviewsRef = useRef<HTMLDivElement>(null)
	const contactRef = useRef<HTMLDivElement>(null)
	// Section content loading states - keep sections mounted but control content loading
	const [heroLoaded] = useState(true) // Hero loads immediately
	const [aboutLoaded, setAboutLoaded] = useState(false)
	// const [featuresLoaded, setFeaturesLoaded] = useState(false)
	const [reviewsLoaded, setReviewsLoaded] = useState(false)
	const [contactLoaded, setContactLoaded] = useState(false)

	// Structured data for SEO
	const structuredData = {
		"@context": "https://schema.org",
		"@type": "LodgingBusiness",
		name: dictionary?.title || "Mountain Apartments",
		description: dictionary?.description || "Comfortable mountain accommodation",
		url: typeof window !== "undefined" ? (window as Window).location.origin : "",
		logo: typeof window !== "undefined" ? `${(window as Window).location.origin}/images/logo.png` : "",
		image: [
			typeof window !== "undefined" ? `${(window as Window).location.origin}/images/bg.webp` : "",
			typeof window !== "undefined" ? `${(window as Window).location.origin}/images/apartment-default-small.jpg` : "",
		],
		address: {
			"@type": "PostalAddress",
			addressLocality: "Mountain Region",
			addressCountry: "Country",
		},
		geo: {
			"@type": "GeoCoordinates",
			latitude: "49.2827",
			longitude: "20.0792",
		},
		amenityFeature: [
			{
				"@type": "LocationFeatureSpecification",
				name: "Mountain Views",
				value: true,
			},
			{
				"@type": "LocationFeatureSpecification",
				name: "WiFi",
				value: true,
			},
			{
				"@type": "LocationFeatureSpecification",
				name: "Parking",
				value: true,
			},
		],
		checkinTime: "15:00",
		checkoutTime: "11:00",
		petsAllowed: false,
	}
	useEffect(() => {
		const savedScrollPosition = sessionStorage.getItem("homeScrollPosition")
		const savedSection = sessionStorage.getItem("homeCurrentSection")

		if (savedScrollPosition || savedSection) {
			// Pre-load all sections immediately
			setAboutLoaded(true)
			// setFeaturesLoaded(true)
			setReviewsLoaded(true)
			setContactLoaded(true)

			// Wait for next tick to ensure state updates are processed
			const restorePosition = (attempt = 1) => {
				const maxAttempts = 15 // Increased attempts
				const delay = Math.min(attempt * 150, 1000) // Cap delay at 1 second

				setTimeout(() => {
					// Try section-based restoration first if we have a saved section
					if (savedSection && savedSection !== "hero") {
						const sectionElement = document.getElementById(savedSection)
						if (sectionElement) {
							// Use scrollIntoView with snap-friendly options
							sectionElement.scrollIntoView({
								behavior: "instant",
								block: "start",
								inline: "nearest",
							})

							// Verify we actually scrolled to the right place
							setTimeout(() => {
								const rect = sectionElement.getBoundingClientRect()
								if (Math.abs(rect.top) < 50) {
									// Within 50px of top
									// Clear saved data
									sessionStorage.removeItem("homeScrollPosition")
									sessionStorage.removeItem("homeCurrentSection")
									console.log(`Successfully restored to section: ${savedSection}`)
									return
								} else if (attempt < maxAttempts) {
									// Try again if we didn't land in the right place
									restorePosition(attempt + 1)
								}
							}, 50)
							return
						}
					}

					// Fallback to scroll position restoration
					if (savedScrollPosition) {
						const scrollY = parseInt(savedScrollPosition, 10)
						const documentHeight = document.documentElement.scrollHeight
						const windowHeight = window.innerHeight
						const maxScrollY = documentHeight - windowHeight

						// Only scroll if the position is valid and document is tall enough
						if (scrollY <= maxScrollY && documentHeight > windowHeight) {
							// Temporarily disable scroll snap for programmatic scrolling
							const scrollContainer = document.querySelector(".snap-y")
							if (scrollContainer) {
								;(scrollContainer as HTMLElement).style.scrollSnapType = "none"
							}

							window.scrollTo({
								top: scrollY,
								behavior: "instant",
							})

							// Re-enable scroll snap after a short delay
							setTimeout(() => {
								if (scrollContainer) {
									;(scrollContainer as HTMLElement).style.scrollSnapType = "y mandatory"
								}
								sessionStorage.removeItem("homeScrollPosition")
								sessionStorage.removeItem("homeCurrentSection")
								console.log(`Restored to position: ${scrollY}`)
							}, 100)
							return
						}
					}

					// If restoration failed and we haven't reached max attempts, try again
					if (attempt < maxAttempts) {
						restorePosition(attempt + 1)
					} else {
						// Give up and clear the saved data
						sessionStorage.removeItem("homeScrollPosition")
						sessionStorage.removeItem("homeCurrentSection")
						console.log("Failed to restore scroll position after maximum attempts")
					}
				}, delay)
			}

			// Start restoration with a small initial delay to ensure DOM is ready
			setTimeout(() => restorePosition(), 100)
		}
	}, [])

	// Simplified effect for section tracking
	useEffect(() => {
		// Simple intersection observers only for loading sections
		const observerOptions = {
			root: null,
			rootMargin: "-20% 0px -20% 0px",
			threshold: 0.5,
		}

		const heroObserver = new IntersectionObserver((entries) => {
			const entry = entries[0]
			if (entry?.isIntersecting && entry.target.id) {
				setCurrentSection(entry.target.id)
			}
		}, observerOptions)

		const aboutObserver = new IntersectionObserver((entries) => {
			const entry = entries[0]
			if (entry?.isIntersecting) {
				setAboutLoaded(true)
				if (entry.target.id) {
					setCurrentSection(entry.target.id)
				}
			}
		}, observerOptions)

		// const featuresObserver = new IntersectionObserver((entries) => {
		// 	const entry = entries[0]
		// 	if (entry?.isIntersecting) {
		// 		setFeaturesLoaded(true)
		// 		if (entry.target.id) {
		// 			setCurrentSection(entry.target.id)
		// 		}
		// 	}
		// }, observerOptions)

		const reviewsObserver = new IntersectionObserver((entries) => {
			const entry = entries[0]
			if (entry?.isIntersecting) {
				setReviewsLoaded(true)
				if (entry.target.id) {
					setCurrentSection(entry.target.id)
				}
			}
		}, observerOptions)

		const contactObserver = new IntersectionObserver((entries) => {
			const entry = entries[0]
			if (entry?.isIntersecting) {
				setContactLoaded(true)
				if (entry.target.id) {
					setCurrentSection(entry.target.id)
				}
			}
		}, observerOptions)

		// Observe sections
		if (heroRef.current) heroObserver.observe(heroRef.current)
		if (aboutRef.current) aboutObserver.observe(aboutRef.current)
		// if (featuresRef.current) featuresObserver.observe(featuresRef.current)
		if (reviewsRef.current) reviewsObserver.observe(reviewsRef.current)
		if (contactRef.current) contactObserver.observe(contactRef.current)

		return () => {
			heroObserver.disconnect()
			aboutObserver.disconnect()
			// featuresObserver.disconnect()
			reviewsObserver.disconnect()
			contactObserver.disconnect()
		}
	}, [])
	const { home } = dictionary || {}
	const { contactForm } = dictionary || {}

	// Early return if dictionary is not available
	if (!dictionary || !home) {
		return (
			<div className="h-screen w-full flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
					<p className="mt-4 text-gray-600">Loading...</p>
				</div>
			</div>
		)
	}

	return (
		<>
			{/* Structured Data for SEO */}
			<Script
				id="structured-data"
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(structuredData),
				}}
			/>
			<div className="snap-y snap-mandatory overflow-y-scroll h-screen w-full">
				{/* Cookie Bar (client-only) */}
				{mounted && !cookieAccepted && dictionary.cookieBar && (
					<div className="fixed bottom-0 left-0 w-full z-50 bg-gray-900 text-white px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-2 shadow-lg animate-fadeIn">
						<span className="text-sm">
							{dictionary.cookieBar.text}
							<a href={`/${locale}/privacy`} className="underline hover:text-blue-300 ml-1" target="_blank" rel="noopener noreferrer">
								{dictionary.cookieBar.privacy}
							</a>
						</span>
						<div className="flex gap-2 mt-2 md:mt-0">
							<button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded transition" onClick={handleAcceptCookies}>
								{dictionary.cookieBar.accept}
							</button>
							<button className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-1 rounded transition" onClick={handleDeclineCookies}>
								{dictionary.cookieBar.decline}
							</button>
						</div>
					</div>
				)}
				{/* LocaleSwitcher with fixed positioning - smooth fade transition (client-only) */}
				{mounted && (
					<div id="locale-switcher" className="">
						<div className={`transition-opacity duration-300 ${currentSection === "hero" ? "opacity-100" : "opacity-0 pointer-events-none"}`}></div>
					</div>
				)}

				{/* Hero Section with background image */}

				<main>
					<section
						ref={heroRef}
						id="hero"
						className="snap-start h-screen w-full flex items-center justify-center relative"
						tabIndex={0}
						aria-label="Hero section">
						{heroLoaded ? (
							<HeroSection home={home} currentSection={currentSection} dictionary={dictionary} />
						) : (
							<div className="z-10 relative container mx-auto px-4">
								<SectionLoader />
							</div>
						)}
					</section>{" "}
					{/* About Section */}
					<section
						ref={aboutRef}
						id="apartments"
						className="snap-start h-screen w-full flex items-center justify-center relative bg-white text-gray-800"
						tabIndex={0}
						aria-label="About our apartments">
						{aboutLoaded ? (
							<CarouselSection
								dictionary={{
									apartments: dictionary.apartments,
									filters: dictionary.filters,
								}}
							/>
						) : (
							<div className="z-10 relative container mx-auto px-4">
								<SectionLoader />
							</div>
						)}
					</section>
					{/* Features Section */}
					{/* <section
						ref={featuresRef}
						id="features"
						className="snap-start h-screen w-full flex items-center justify-center relative bg-gray-100 text-gray-800"
						tabIndex={0}
						aria-label="Apartment features"
					>
						{featuresLoaded ? (
							<FeaturesSection home={home} />
						) : (
							<div className="z-10 relative container mx-auto px-4">
								<SectionLoader />
							</div>
						)}
					</section> */}
					{/* Reviews Section */}
					<section
						ref={reviewsRef}
						id="reviews"
						className="snap-start h-screen w-full flex items-center justify-center relative bg-blue-50 text-gray-800"
						tabIndex={0}
						aria-label="Guest reviews">
						{reviewsLoaded ? (
							<ReviewsSection reviews={home.reviews} />
						) : (
							<div className="z-10 relative container mx-auto px-4">
								<SectionLoader />
							</div>
						)}
					</section>
					{/* Contact Section as last section */}
					<section
						ref={contactRef}
						id="contact"
						className="snap-start h-screen w-full flex items-center justify-center relative bg-white text-gray-800"
						tabIndex={0}
						aria-label="Contact section">
						{contactLoaded && contactForm ? (
							<ContactSection
								dictionary={{
									contactForm: contactForm,
								}}
							/>
						) : (
							<div className="z-10 relative container mx-auto px-4">
								<SectionLoader />
							</div>
						)}
					</section>
				</main>
				<LocaleSwitcher />
			</div>
		</>
	)
}
