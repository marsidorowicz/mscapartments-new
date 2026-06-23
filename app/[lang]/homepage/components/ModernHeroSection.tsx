/** @format */

"use client"

import Image from "next/image"
import Link from "next/link"

import { Dictionary } from "../../../types/dictionary"
import { Locale } from "../../../i18n-config"
import { useEffect, useState } from "react"

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
							className={`inline-block transition-all duration-700 ease-out text-white transform ${isVisible ? "translate-y-0 opacity-100 rotate-0" : "translate-y-16 opacity-0 rotate-12"}`}
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

export default function ModernHeroSection({ dictionary, lang }: ModernHeroSectionProps) {
	return (
		<div className="relative bg-white">
			{/* Hero Image Background */}
			<div className="relative h-[700px] md:h-[800px] lg:h-[900px] overflow-hidden">
				<Image src="/images/tlo.jpg" alt="Mountain landscape background" fill className="object-cover" quality={100} sizes="100vw" priority />
				{/* Dark overlay */}
				<div className="absolute inset-0 " />

				{/* Hero Content */}
				<div className="relative z-10 h-full flex items-center pt-16 md:pt-0">
					<div className="container mx-auto px-4 text-center text-white">
						{/* Animated Welcome Text */}
						{/* <div className="w-full flex justify-center items-center gap-4 mb-4 px-4">
							<LogoOrly />
						</div> */}
						<div className="mb-1 md:mb-6 overflow-hidden">
							<h1 className="text-3xl md:text-6xl font-bold drop-shadow-2xl bg-slate-600 bg-opacity-30 px-6 py-3 rounded-xl inline-block backdrop-blur-sm border border-white border-opacity-20">
								<AnimatedText text="MSC Apartments" delay={200} />
							</h1>
						</div>

						{/* Animated Main Title */}
						<div className="mb-1 md:mb-6 overflow-hidden pb-3 pt-2">
							<h2 className="text-xl md:text-2xl lg:text-4xl font-bold drop-shadow-lg">
								{dictionary.home.hero.HeroTitle1 || dictionary.home.hero.heroTitle || "Choose an Apartment for Your Stay"}
							</h2>
						</div>

						{/* Key Features */}
						{/* <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12 mb-8 text-lg md:text-xl">
							{(dictionary.home.hero.features || ["Komfortowe Apartamenty", "Zakopane i Kościelisko", "Śniadania"]).map((feature, index) => (
								<div key={index} className="flex items-center gap-2">
									<span>
										<AnimatedWords text={feature} delay={1400 + index * 200} />
									</span>
								</div>
							))}
						</div> */}

						{/* CTA Buttons */}
						<div className={`flex flex-col sm:flex-row items-center justify-center `}>
							<Link
								href={`/${lang}/apartamenty`}
								className="! hover:scale-105 !text-white bg-slate-600 bg-opacity-30  !shadow-lg !rounded-md text-lg font-semibold py-3 px-8 transition-colors duration-200 !border-2 border-black !outline-none hover:opacity-100 ">
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
