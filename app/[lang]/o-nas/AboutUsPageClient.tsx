/** @format */

"use client"

import { useState, useEffect } from "react"
import ModernNav from "../homepage/components/ModernNav"
import type { Dictionary } from "@/app/types/dictionary"
import type { Locale } from "../../i18n-config"
import Footer from "../homepage/components/Footer"

interface AboutUsPageClientProps {
	dictionary: Dictionary
	lang?: Locale
}

export default function AboutUsPageClient({ dictionary, lang = "pl" }: AboutUsPageClientProps) {
	const [mounted, setMounted] = useState(false)
	const [locale, setLocale] = useState<string>("en")

	// Get current locale from URL
	useEffect(() => {
		if (typeof window !== "undefined") {
			const match = window.location.pathname.match(/^\/?([a-z]{2})(\/|$)/)
			if (match && match[1]) {
				setLocale(match[1])
			}
		}
	}, [])

	useEffect(() => {
		setMounted(true)
	}, [])

	if (!mounted) {
		return null
	}

	return (
		<div className="min-h-screen bg-[#f5f0eb]">
			{/* Modern Navigation */}
			<ModernNav dictionary={dictionary} lang={lang} />

			{/* Main Content */}
			<main className="pt-24 pb-16">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
					{/* Hero Section with Quote */}
					<div className="text-center mb-16">
						<div className="relative">
							<h1 className="text-4xl md:text-6xl font-bold bg-black bg-clip-text text-transparent mb-8 leading-tight">
								{`Ponad 13 lat doświadczenia,
								
								tysiące niezapomnianych pobytów`}
							</h1>
						</div>
					</div>

					{/* Main Content Sections */}
					<div className="space-y-12">
						{/* Introduction */}
						<section className="bg-white rounded-2xl shadow-lg p-8 md:p-12 border border-gray-100">
							<div className="prose prose-lg max-w-none">
								<p className="text-xl leading-relaxed text-gray-700 mb-6 font-medium">
									{`MSC Apartments to `}
									<span className="text-[#cc9678] font-semibold">{`wyjątkowe miejsce`}</span>
									{`, w którym łączymy pasję do gór z wieloletnim
									doświadczeniem w branży turystycznej. Od ponad 13 lat zajmujemy się profesjonalnym zarządzaniem apartamentami w`}{" "}
									<span className="text-[#b8856a] font-semibold">{`sercu Tatr`}</span>
									{`, tworząc przestrzeń, w której nasi Goście mogą w pełni
									cieszyć się wypoczynkiem, nie martwiąc się o żadne szczegóły.`}
								</p>
							</div>
						</section>

						{/* Philosophy */}
						<section className="bg-[#f5f0eb] rounded-2xl shadow-lg p-8 md:p-12 border border-[#cc9678]/20">
							<h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 text-center">{`Nasza Filozofia`}</h2>
							<div className="prose prose-lg max-w-none">
								<p className="text-lg leading-relaxed text-gray-700 mb-6">
									{`Naszą filozofią jest `}
									<span className="bg-[#cc9678]/20 px-2 py-1 rounded font-medium">
										{`połączenie wygody prywatnego apartamentu z troską i opieką`}
									</span>
									{`, jaką daje profesjonalna obsługa.`}
								</p>
								<p className="text-lg leading-relaxed text-gray-700">
									{`Szczególne miejsce w naszej działalności zajmują`} <span className="text-[#cc9678] font-semibold">{`Rezydentki`}</span>{" "}
									{`-
									osoby, które z zaangażowaniem towarzyszą naszym Gościom od pierwszego kontaktu na miejscu aż po moment wyjazdu. To właśnie
									one witają Państwa przy zakwaterowaniu, pomagają odnaleźć się w nowym miejscu, chętnie dzielą się wiedzą o atrakcjach
									okolicy i dbają, aby każdy dzień spędzony w naszych apartamentach był komfortowy i niezapomniany.`}
								</p>
							</div>
						</section>

						{/* Experience */}
						<section className="bg-white rounded-2xl shadow-lg p-8 md:p-12 border border-gray-100">
							<h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 text-center">{`Doświadczenie i Jakość`}</h2>
							<div className="grid md:grid-cols-2 gap-8 items-center">
								<div className="space-y-6">
									<div className="bg-[#f5f0eb] rounded-xl p-6 border border-[#cc9678]/20">
										<h3 className="text-xl font-semibold text-[#cc9678] mb-3">{`Ponad dekada doświadczenia`}</h3>
										<p className="text-gray-700">
											{`W zarządzaniu nieruchomościami turystycznymi pozwoliła nam stworzyć ofertę, która odpowiada na potrzeby różnych
											typów Gości.`}
										</p>
									</div>
									<div className="bg-[#f5f0eb] rounded-xl p-6 border border-[#cc9678]/20">
										<h3 className="text-xl font-semibold text-[#cc9678]  mb-3">{`Dla każdego`}</h3>
										<p className="text-gray-700">
											{`Nasze apartamenty idealne są zarówno dla rodzin z dziećmi, par szukających romantycznego wypoczynku, jak i osób
											aktywnych, pragnących odkrywać górskie szlaki.`}
										</p>
									</div>
								</div>
								<div className="bg-[#f5f0eb] rounded-xl p-6 border-2 border-[#cc9678]/20">
									<h3 className="text-2xl font-bold text-[#cc9678] mb-4">{`Nasze Standardy`}</h3>
									<ul className="space-y-3 text-gray-700">
										<li className="flex items-center">
											<div className="w-2 h-2 bg-[#cc9678] rounded-full mr-3"></div>
											{`Domowa atmosfera`}
										</li>
										<li className="flex items-center">
											<div className="w-2 h-2 bg-[#cc9678] rounded-full mr-3"></div>
											{`Wysoki standard wyposażenia`}
										</li>
										<li className="flex items-center">
											<div className="w-2 h-2 bg-[#cc9678] rounded-full mr-3"></div>
											{`Swoboda i prywatność`}
										</li>
										<li className="flex items-center">
											<div className="w-2 h-2 bg-[#cc9678] rounded-full mr-3"></div>
											{`Wygoda i styl`}
										</li>
									</ul>
								</div>
							</div>
						</section>

						{/* More Than Just Accommodation */}
						<section className="bg-[#f5f0eb] rounded-2xl shadow-lg p-8 md:p-12 border border-[#cc9678]/20">
							<h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 text-center">{`Więcej niż Nocleg`}</h2>
							<div className="prose prose-lg max-w-none">
								<p className="text-lg leading-relaxed text-gray-700 mb-6">
									{`Chcemy, aby pobyt u nas był`}
									<span className="bg-[#cc9678]/20 px-2 py-1 rounded font-medium">{`czymś więcej niż tylko noclegiem`}</span>
									{`. Dlatego oprócz
											komfortowych apartamentów proponujemy także bogatą ofertę atrakcji i wycieczek, które pozwalają jeszcze lepiej poznać uroki
											regionu.`}
								</p>
								<p className="text-lg leading-relaxed text-gray-700">
									{`W każdym apartamencie przygotowaliśmy dla naszych Gości `}
									<span className="text-[#cc9678] font-semibold">
										{`szczegółowe informacje o najciekawszych propozycjach spędzania wolnego czasu`}
									</span>
									{`
									– od spacerów i wypraw górskich, przez lokalne wydarzenia, aż po zorganizowane wycieczki, które możemy pomóc zaplanować.`}
								</p>
							</div>
						</section>

						{/* Call to Action */}
						<section className="bg-[#f5f0eb] rounded-2xl shadow-lg p-8 md:p-12 text-black text-center">
							<h2 className="text-3xl md:text-4xl font-bold mb-6">{`Dołącz Do Nas`}</h2>
							<p className="text-xl leading-relaxed mb-8 opacity-90">
								{`Zapraszamy do odkrywania gór razem z nami i dołączenia do grona Gości, którzy już od lat doceniają nasze`}{" "}
								<span className="font-semibold">{`zaangażowanie, profesjonalizm i ciepłą, rodzinną atmosferę`}</span>.
							</p>
							<div className="flex flex-col sm:flex-row gap-4 justify-center">
								<button
									onClick={() => {
										if (typeof window !== "undefined") {
											window.location.href = `/${window.location.pathname.split("/")[1] || "pl"}/contact`
										}
									}}
									className="bg-white text-black font-semibold py-4 px-8 rounded-xl hover:bg-gray-100 transition-colors duration-300 shadow-lg">
									{`Skontaktuj się z nami`}
								</button>
								<button
									onClick={() => {
										window.open(`/${locale}/#apartmenty`, "_self")
									}}
									className="border-2 border-black text-black font-semibold py-4 px-8 rounded-xl hover:bg-white hover:text-black transition-colors duration-300">
									{`Zobacz nasze apartamenty`}
								</button>
							</div>
						</section>
					</div>
				</div>
			</main>
			{/* Footer */}
			<Footer lang={lang} />
		</div>
	)
}
