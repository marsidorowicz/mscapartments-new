/** @format */

"use client"

import Image from "next/image"
import Link from "next/link"

import { Dictionary } from "../../../types/dictionary"
import { Locale } from "../../../i18n-config"
import { useEffect, useState } from "react"
// import LogoOrly from "../../components/LogoOrly"
import SocialMedia from "./SocialMedia"

type ModernHeroSectionProps = {
	dictionary: Dictionary
	lang: Locale
}

// Component for animated letter splits
const AnimatedText = ({ text, delay = 0 }: { text: string; delay?: number }) => {
	const [isVisible, setIsVisible] = useState(false)

	useEffect(() => {
		const timer = setTimeout(() => setIsVisible(true), delay)
		return () => clearTimeout(timer)
	}, [delay])

	return (
		<span className="inline">
			{text.split(" ").map((word, wordIndex) => (
				<span key={wordIndex} className="inline-block mr-2">
					{word.split("").map((char, charIndex) => (
						<span
							key={charIndex}
							className={`inline-block transition-all duration-700 ease-out text-[#D6B08A] transform ${isVisible ? "translate-y-0 opacity-100 rotate-0" : "translate-y-16 opacity-0 rotate-12"}`}
							style={{
								transitionDelay: `${delay + (wordIndex * word.length + charIndex) * 80}ms`,
							}}>
							{char}
						</span>
					))}
				</span>
			))}
		</span>
	)
}

// Component for word-by-word animation
const AnimatedWords = ({ text, delay = 0 }: { text: string; delay?: number }) => {
	const [isVisible, setIsVisible] = useState(false)

	useEffect(() => {
		const timer = setTimeout(() => setIsVisible(true), delay)
		return () => clearTimeout(timer)
	}, [delay])

	return (
		<span className="flex">
			<div
				className={`inline-block mr-2 whitespace-nowrap transition-all duration-800 ease-out ${isVisible ? "translate-y-0 opacity-100 blur-none" : "translate-y-8 opacity-0 blur-sm"}`}>
				•
			</div>
			{text.split(" ").map((word, index) => (
				<span
					key={index}
					className={`inline-block mr-2 whitespace-nowrap transition-all duration-800 ease-out ${isVisible ? "translate-y-0 opacity-100 blur-none" : "translate-y-8 opacity-0 blur-sm"}`}
					style={{
						transitionDelay: `${delay + index * 120}ms`,
					}}>
					{word}
				</span>
			))}
		</span>
	)
}

export default function ModernHeroSection({ dictionary, lang }: ModernHeroSectionProps) {
	const [showButtons, setShowButtons] = useState(false)

	useEffect(() => {
		// Trigger button animation after text animations
		const timer = setTimeout(() => setShowButtons(true), 2200)
		return () => clearTimeout(timer)
	}, [])
	return (
		<div className="relative bg-white">
			{/* Hero Image Background */}
			<div className="relative h-[700px] md:h-[800px] lg:h-[900px] overflow-hidden">
				<Image
					src="/images/tlo.jpg"
					alt="Mountain landscape background"
					fill
					className="object-cover"
					quality={70}
					placeholder="blur"
					blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z"
					sizes="100vw"
					priority
				/>
				{/* Dark overlay */}
				<div className="absolute inset-0 bg-black/40" />

				{/* Social Media - Top Right */}
				<div className="absolute top-4 right-4 z-20">
					<SocialMedia />
				</div>

				{/* Hero Content */}
				<div className="relative z-10 h-full flex items-center pt-16 md:pt-0">
					<div className="container mx-auto px-4 text-center text-white">
						{/* Animated Welcome Text */}
						{/* <div className="w-full flex justify-center items-center gap-4 mb-4 px-4">
							<LogoOrly />
						</div> */}
						<div className="mb-1 md:mb-6 overflow-hidden">
							<h2 className="text-3xl md:text-6xl font-bold drop-shadow-2xl bg-slate-600 bg-opacity-30 px-6 py-3 rounded-xl inline-block backdrop-blur-sm border border-white border-opacity-20">
								<AnimatedText text="Mountain Apartments" delay={200} />
							</h2>
						</div>

						{/* Animated Main Title */}
						<div className="mb-1 md:mb-6 overflow-hidden pb-3 pt-2">
							<h1 className="text-2xl md:text-3xl lg:text-6xl font-bold drop-shadow-lg">
								{dictionary.home.hero.HeroTitle1 || dictionary.home.hero.heroTitle || "Choose an Apartment for Your Stay"}
							</h1>
						</div>

						{/* Key Features */}
						<div className="flex flex-wrap justify-center items-center gap-6 md:gap-12 mb-8 text-lg md:text-xl">
							{(dictionary.home.hero.features || ["Komfortowe Apartamenty", "Zakopane i Kościelisko", "Śniadania"]).map((feature, index) => (
								<div key={index} className="flex items-center gap-2">
									<span>
										<AnimatedWords text={feature} delay={1400 + index * 200} />
									</span>
								</div>
							))}
						</div>

						{/* CTA Buttons */}
						<div
							className={`flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-1000 ease-out ${showButtons ? "translate-y-0 opacity-100 scale-100" : "translate-y-16 opacity-0 scale-75"}`}>
							<Link
								href={`/${lang}/apartamenty`}
								className="!bg-[#1D2430] hover:scale-105 !text-white !shadow-lg !rounded-md text-lg font-semibold py-3 px-8 transition-colors duration-200 !border-2 border-black !outline-none opacity-100 hover:opacity-100 ">
								{dictionary.home.hero.bookNow || "SPRAWDŹ DOSTĘPNOŚĆ"}
							</Link>
							{/* <Link href={`/${lang}/offers`} className="!bg-[#cc9678] !hover:bg-[#7a4a35] !text-white !shadow-lg !rounded-md text-lg font-semibold py-3 px-8 transition-colors duration-200 !border-0 !outline-none">
								{dictionary.home.hero.specialOffers || dictionary.navigation.offers || "Special Offers"}
							</Link> */}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
