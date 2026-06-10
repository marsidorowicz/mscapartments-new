/** @format */

"use client"

import React, { useEffect, useState } from "react"
import Image from "next/image"
import type { Dictionary } from "@/app/types/dictionary"
import { Locale } from "@/app/i18n-config"
import ModernNav from "../homepage/components/ModernNav"
import Link from "next/link"
import Footer from "../homepage/components/Footer"

interface ZakopaneRoomsClientProps {
	dictionary: Dictionary
	lang: Locale
}

const ZakopaneRoomsClient: React.FC<ZakopaneRoomsClientProps> = ({ dictionary, lang }) => {
	const zakopane = dictionary.zakopaneRooms || {
		title: "Zakopane Rooms",
		subtitle: "Comfortable accommodations in the heart of the Tatra Mountains",
		heroTitle: "Experience Zakopane",
		heroSubtitle: "Where mountains meet comfort",
		aboutTitle: "About Our Zakopane Accommodations",
		featuresTitle: "What We Offer",
		galleryTitle: "Photo Gallery",
		activitiesTitle: "Activities & Attractions",
		bookingTitle: "Ready to Book Your Stay?",
		bookingSubtitle: "Contact us today to reserve your perfect Zakopane accommodation",
		contactButton: "Contact Us",
		callButton: "Call",
		features: [
			"Stunning views of the Tatra Mountains",
			"Traditional highland architecture",
			"Modern amenities and comfort",
			"Close to ski slopes and hiking trails",
			"Walking distance to Krupówki Street",
			"Free Wi-Fi and parking",
			"24/7 customer support",
			"Breakfast options available",
		],
		activities: {
			winter: {
				title: "Winter Sports",
				description: "Enjoy skiing and snowboarding on world-class slopes. Equipment rental and lessons available nearby.",
			},
			hiking: {
				title: "Mountain Hiking",
				description: "Explore scenic trails in the Tatra National Park. Routes for all experience levels available.",
			},
			culture: {
				title: "Local Culture",
				description: "Experience traditional highland culture, local cuisine, and authentic regional crafts.",
			},
		},
	}
	// Get current locale from pathname
	const [showButton, setShowButton] = useState(false)
	const { home } = dictionary || { home: null }

	useEffect(() => {
		setShowButton(true)

		return () => {}
	}, [])

	return (
		<div className="min-h-screen bg-gray-50 w-full">
			<ModernNav dictionary={dictionary} lang={lang} />

			{/* Main Content */}
			<div className="pt-20 px-4 md:px-8 lg:px-16">
				<div className="w-full h-full">
					{/* Header */}
					<div className="text-center py-12">
						<h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">{zakopane.title}</h1>
						<p className="text-lg text-gray-600 max-w-3xl mx-auto">{zakopane.subtitle}</p>
					</div>

					{/* Hero Image Section */}
					<div className="relative h-96 md:h-[500px] rounded-xl overflow-hidden mb-12 shadow-2xl">
						<Image src="/images/bg.webp" alt="Zakopane Mountain View" fill className="object-cover" priority />
						<div className="absolute inset-0 bg-black/30 flex items-center justify-center">
							<div className="text-center text-white">
								<h2 className="text-3xl md:text-4xl font-bold mb-4">{zakopane.heroTitle}</h2>
								<p className="text-xl">{zakopane.heroSubtitle}</p>
							</div>
						</div>
					</div>

					{/* Animated Book Now Button */}
					<div
						className={`mb-8 transition-all duration-1000 ease-out ${showButton ? "translate-y-0 opacity-100 scale-100" : "translate-y-16 opacity-0 scale-75"}`}>
						<div className="transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 ease-out flex items-center justify-center">
							<Link href={`/${lang}/apartamenty`} className="bg-[#1D2430] text-white px-8 py-3 rounded-lg font-semibold">
								{home.hero.bookNow || "Book Now"}
							</Link>
						</div>
					</div>

					<div className="w-full p-6 bg-white shadow-md rounded-lg text-gray-800 mb-10">
						<h1 className="text-3xl font-bold mb-4">{`Zakopane noclegi – jak wybrać idealne miejsce na wypoczynek w górach?`}</h1>

						<p className="mb-4">{`Z artykułu dowiesz się:`}</p>
						<ul className="list-disc list-inside mb-6 space-y-1">
							<li>{`Czy da się znaleźć tanie noclegi w Zakopanem?`}</li>
							<li>{`Jakie są najtańsze noclegi w Zakopanem?`}</li>
							<li>{`Pokoje w Zakopanem – na co warto zwrócić uwagę?`}</li>
						</ul>

						<p className="mb-6">{`Zakopane to prawdziwa perła Tatr. Jest odwiedzane przez turystów przez cały rok. To miejsce, w którym można odpocząć, ale też aktywnie spędzić czas na szlakach górskich czy stokach narciarskich.`}</p>

						<p className="mb-6">
							{`By wyjazd był naprawdę udany, ważny jest wybór odpowiedniego noclegu. Z tego artykułu dowiesz się, na co zwrócić uwagę, szukając `}
							<span className="font-semibold">{`"Zakopane noclegi"`}</span>
							{` oraz jakie opcje warto rozważyć w trakcie urlopu w Zakopanem.`}
						</p>

						<h2 className="text-xl font-semibold mb-2">{`Spis treści:`}</h2>
						<ul className="list-decimal list-inside space-y-1">
							<li>{`Atrakcje w Zakopanem – dlaczego warto wybrać się do Zakopanego?`}</li>
							<li>{`Jaki jest najlepszy dojazd do Zakopanego?`}</li>
							<li>{`Rodzaje noclegów – Zakopane i okolice`}</li>
							<li>{`Jak znaleźć nocleg w Zakopanem? Lokalizacja – klucz do udanego wypoczynku`}</li>
							<li>{`Zakopane noclegi. Jakie są ceny noclegów w Zakopanem?`}</li>
							<li>{`Jak znaleźć nocleg w Zakopanem? Na co zwrócić uwagę, rezerwując pewny nocleg w Zakopanem?`}</li>
							<li>{`Zakopane noclegi last minute – czy warto?`}</li>
							<li>{`Najlepsze mieszkania do wynajęcia w Zakopanem według typu podróży`}</li>
							<li>{`Zakopane noclegi w hotelach – podsumowanie`}</li>
						</ul>
					</div>

					<div className="w-full p-6 bg-white shadow-md rounded-lg text-gray-800 mb-10">
						<div className="flex flex-col md:flex-row justify-between">
							<div className="w-full md:w-1/2 p-3">
								<div className="relative w-full h-64 md:h-full mb-6 md:mb-0 rounded-lg overflow-hidden">
									<Image src="/images/zakopane-rooms/1.webp" alt="Aqua Park Zakopane for families" fill className="object-cover" />
								</div>
							</div>
							<div className="w-full md:w-1/2 p-3">
								<h2 className="text-2xl font-bold mb-4">{`1. Atrakcje w Zakopanem – dlaczego warto wybrać się do Zakopanego?`}</h2>

								<p className="mb-4">{`Co oferuje Zakopane? Poniżej najważniejsze atrakcje, które przyciągają turystów do Zakopanego.`}</p>

								<h3 className="text-xl font-semibold mt-6 mb-2">{`Krupówki. Czy warto spędzić czas na Krupówkach?`}</h3>
								<p className="mb-4">{`Krupówki to główny deptak Zakopanego pełen restauracji, sklepów i regionalnych straganów. Idealne miejsce na spacer, zakup pamiątek i spróbowanie lokalnych przysmaków.`}</p>

								<h3 className="text-xl font-semibold mt-6 mb-2">{`Kasprowy Wierch`}</h3>
								<p className="mb-4">{`Popularny szczyt, na który można wjechać kolejką linową. Z wierzchołka rozciąga się zapierający dech w piersiach widok na Tatry. W zimie to także raj dla narciarzy.`}</p>

								<h3 className="text-xl font-semibold mt-6 mb-2">{`Morskie Oko`}</h3>
								<p className="mb-4">{`Morskie Oko to jedno z piękniejszych jezior Tatr. Szlak do Morskiego Oka jest stosunkowo łatwy i przyciąga turystów o każdej porze roku.`}</p>

								<h3 className="text-xl font-semibold mt-6 mb-2">{`Gubałówka. Czy warto się wybrać na Gubałówkę?`}</h3>
								<p>{`Gubałówka to popularne wzgórze, na które można wjechać kolejką szynową. Na szczycie znajduje się taras widokowy z widokiem na Zakopane i Tatry oraz liczne atrakcje turystyczne.`}</p>
							</div>
						</div>
					</div>

					<div className="w-full p-6 mb-10 bg-white shadow-md rounded-lg text-gray-800">
						<h2 className="text-2xl font-bold mb-4">{`Atrakcje w Zakopanem`}</h2>

						<h3 className="text-xl font-semibold mt-6 mb-2">{`Dolina Kościeliska`}</h3>
						<p className="mb-4">{`Dolina Kościeliska to malownicza dolina, idealna na dłuższy spacer lub wędrówkę. Po drodze można odwiedzić jaskinie, takie jak Jaskinia Mroźna, oraz podziwiać piękno tatrzańskiej przyrody.`}</p>

						<h3 className="text-xl font-semibold mt-6 mb-2">{`Termy Chochołowskie`}</h3>
						<p className="mb-4">{`Termy Chochołowskie to kompleks basenów termalnych niedaleko Zakopanego. Doskonałe miejsce na relaks w gorących wodach z widokiem na góry, z basenami, saunami i strefą SPA.`}</p>

						<h3 className="text-xl font-semibold mt-6 mb-2">{`Wielka Krokiew`}</h3>
						<p className="mb-4">{`Wielka Krokiew to skocznia narciarska, na której odbywają się zawody Pucharu Świata. Można ją zwiedzać, a w sezonie zimowym odbywają się tam zawody, które przyciągają fanów sportów zimowych.`}</p>

						<h3 className="text-xl font-semibold mt-6 mb-2">{`Dolina Pięciu Stawów`}</h3>
						<p className="mb-4">{`To piękna i bardziej wymagająca trasa prowadząca do doliny z pięcioma jeziorami. Cudowny cel dla bardziej doświadczonych turystów, którzy szukają spokoju i bliskości przyrody.`}</p>

						<h3 className="text-xl font-semibold mt-6 mb-2">{`Muzeum Tatrzańskie (Zakopane centrum)`}</h3>
						<p className="mb-4">{`Muzeum Tatrzańskie znajduje się w centrum Zakopanego i prezentuje historię regionu, kulturę górali oraz lokalną przyrodę. Warto je odwiedzić, by lepiej poznać dziedzictwo Tatr i Podhala.`}</p>

						<h3 className="text-xl font-semibold mt-6 mb-2">{`Aqua Park Zakopane (Zakopane dla dzieci)`}</h3>
						<p className="mb-4">{`Rodzinna atrakcja z basenami i zjeżdżalniami, saunami oraz widokiem na góry. Doskonała opcja na relaks po górskich wędrówkach.`}</p>

						<h3 className="text-xl font-semibold mt-6 mb-2">{`Willa Koliba`}</h3>
						<p>{`Pierwszy dom wybudowany w stylu zakopiańskim, zaprojektowany przez Stanisława Witkiewicza. Dziś mieści się tu muzeum stylu zakopiańskiego.`}</p>
					</div>
					<div className="flex mx-auto h-64 md:h-[784px] px-4 md:px-16">
						<div className="relative w-full h-full m-2 rounded-lg overflow-hidden">
							<Image src="/images/zakopane-rooms/2.webp" alt="Aqua Park Zakopane for families" fill className="object-cover" />
						</div>
					</div>

					<div className="w-full p-6 mb-10 bg-white shadow-md rounded-lg text-gray-800">
						<h2 className="text-2xl font-bold mb-4">{`2. Jaki jest najlepszy dojazd do Zakopanego?`}</h2>

						<p className="mb-4">{`Do Zakopanego można dojechać na kilka sposobów. Wybór zależy od miejsca wyjazdu, preferencji i dostępnych środków transportu. Jaki jest najlepszy dojazd do Zakopanego? By się dowiedzieć, czytaj dalej.`}</p>

						<h3 className="text-xl font-semibold mt-6 mb-2">{`Samochodem`}</h3>
						<p className="mb-2">{`Trasa z Krakowa (około 100 km): najpopularniejsza trasa prowadzi drogą krajową nr 7 (Zakopianka). Podróż trwa zazwyczaj 1,5-2 godziny, ale w okresach szczytowych (wakacje, długie weekendy, sezon narciarski) czas dojazdu może się wydłużyć przez korki, szczególnie na odcinkach Zakopianki w okolicach Rabki oraz na wjeździe do Zakopanego.`}</p>
						<p className="mb-2">{`Trasa alternatywna: można wybrać trasę przez Rabkę i Nowy Targ. Część tej trasy to nowa droga ekspresowa, co pozwala ominąć część zakorkowanej Zakopianki.`}</p>
						<p className="mb-2">{`Zalety: własny samochód daje swobodę poruszania się po okolicy i łatwy dostęp do miejsc poza centrum Zakopanego.`}</p>
						<p className="mb-4">{`Wady: możliwość stania w korkach, zwłaszcza w weekendy i w sezonie turystycznym, oraz trudności ze znalezieniem parkingu w centrum Zakopanego.`}</p>

						<h3 className="text-xl font-semibold mt-6 mb-2">{`Pociągiem`}</h3>
						<p className="mb-2">{`Bezpośrednie połączenie z Krakowa: pociągi kursują regularnie między Krakowem a Zakopanem. Czas przejazdu to około 3-4 godziny.`}</p>
						<p className="mb-2">{`Pociągi z innych miast: istnieją również bezpośrednie połączenia z Warszawy, Katowic i Gdyni. PKP Intercity oferuje sezonowe połączenia w sezonie zimowym i letnim. Dzięki temu można dotrzeć do Zakopanego bez przesiadek.`}</p>
						<p className="mb-2">{`Zalety: brak problemów z korkami. W sezonie letnim i zimowym uruchamiane są dodatkowe składy.`}</p>
						<p className="mb-4">{`Wady: czas przejazdu pociągiem może być dłuższy niż czas przejazdu samochodem. Dodatkowo stacja kolejowa znajduje się nieco dalej od centrum Zakopanego, co wymaga dodatkowego transportu.`}</p>

						<h3 className="text-xl font-semibold mt-6 mb-2">{`Autobusem lub busem`}</h3>
						<p className="mb-2">{`Z Krakowa do Zakopanego: busy i autobusy kursują z Dworca MDA w Krakowie. Dojazd zajmuje średnio 2-2,5 godziny. Wspomniane pojazdy kursują regularnie przez cały dzień, zwłaszcza w sezonie.`}</p>
						<p className="mb-2">{`Z innych miast: istnieją bezpośrednie połączenia z innych dużych miast, takich jak Warszawa, Katowice czy Wrocław, obsługiwane przez prywatnych przewoźników.`}</p>
						<p className="mb-2">{`Zalety: dogodne godziny odjazdów i większa liczba połączeń, niż w przypadku pociągów.`}</p>
						<p className="mb-4">{`Wady: podobnie jak w przypadku przejazdu samochodem, autobusy i busy mogą stać w korkach, szczególnie na Zakopiance.`}</p>

						<h3 className="text-xl font-semibold mt-6 mb-2">{`Samolotem + transfer`}</h3>
						<p className="mb-2">{`Lotnisko w Krakowie-Balicach (KRK): najbliższe międzynarodowe lotnisko znajduje się w Krakowie. Stamtąd można dojechać do Zakopanego pociągiem lub autobusem.`}</p>
						<p className="mb-2">{`Transfer lotniskowy: wiele firm oferuje prywatne transfery lotniskowe z Krakowa do Zakopanego. Transfer zajmuje około 1,5-2 godziny.`}</p>
						<p className="mb-2">{`Zalety: szybki dojazd do Krakowa z innych miast Polski i Europy, a także wygodny transfer bezpośrednio do miejsca docelowego.`}</p>
						<p className="mb-4">{`Wady: kosztowne rozwiązanie, zwłaszcza w przypadku prywatnego transferu.`}</p>

						<h3 className="text-xl font-semibold mt-6 mb-2">{`Podróż z wycieczką zorganizowaną`}</h3>
						<p className="mb-2">{`Jeśli celem jest przede wszystkim pobyt w Zakopanem lub Tatrach, warto rozważyć zorganizowaną wycieczkę autokarową. Wielu przewoźników oferuje jednodniowe wyjazdy do Zakopanego lub weekendowe pakiety turystyczne.`}</p>
						<p className="mb-2">{`Zalety: zorganizowany transport, często z przewodnikiem.`}</p>
						<p>{`Wady: ograniczenia czasowe i mniejsza elastyczność w trakcie zwiedzania Zakopanego.`}</p>
					</div>

					<div className="w-full p-6 mb-10 bg-white shadow-md rounded-lg text-gray-800">
						<div className="flex flex-col md:flex-row justify-between">
							<div className="w-full md:w-1/2 p-3 order-2 md:order-1">
								<h2 className="text-2xl font-bold mb-4">{`3. Rodzaje noclegów – Zakopane i okolice`}</h2>

								<p className="mb-4">{`Co oferuje Zakopane osobom szukającym noclegu? Zakopane oferuje szeroki wachlarz opcji noclegowych, od luksusowych hoteli blisko centrum po klimatyczne pensjonaty i domki w górach. Poniżej najpopularniejsze typy noclegów.`}</p>

								<h3 className="text-xl font-semibold mt-6 mb-2">{`Hotele i pensjonaty Zakopane`}</h3>
								<p className="mb-4">{`Idealne dla osób, które cenią wygodę i dodatkowe udogodnienia, takie jak spa, basen, czy restauracja na miejscu.`}</p>

								<h3 className="text-xl font-semibold mt-6 mb-2">{`Apartamenty Zakopane / Zakopane kwatery prywatne / wille Zakopane / domy gościnne Zakopane`}</h3>
								<p className="mb-4">{`Apartamenty Zakopane to świetny wybór dla tych, którzy szukają prywatności i wypoczynku w Zakopanem, zwłaszcza dla rodzin lub grup znajomych.`}</p>

								<h3 className="text-xl font-semibold mt-6 mb-2">{`Domki w górach`}</h3>
								<p className="mb-4">{`Doskonała opcja dla tych, którzy pragną bliskości natury i górskiego klimatu.`}</p>

								<h3 className="text-xl font-semibold mt-6 mb-2">{`Schroniska górskie blisko szlaków turystycznych`}</h3>
								<p>{`Dla miłośników pieszych wędrówek, którzy chcą nocować blisko szlaków turystycznych czy blisko stoków narciarskich.`}</p>
							</div>
							<div className="w-full md:w-1/2 p-3 order-1 md:order-2">
								<div className="relative w-full h-64 md:h-full rounded-lg overflow-hidden">
									<Image src="/images/zakopane-rooms/3.webp" alt="Aqua Park Zakopane for families" fill className="object-cover" />
								</div>
							</div>
						</div>
					</div>

					<div className="w-full p-6 mb-10 bg-white shadow-md rounded-lg text-gray-800">
						<div className="flex flex-col md:flex-row justify-between">
							<div className="w-full md:w-1/2 p-3">
								<div className="relative w-full h-64 md:h-full mb-6 md:mb-0 rounded-lg overflow-hidden">
									<Image src="/images/zakopane-rooms/4.webp" alt="Aqua Park Zakopane for families" fill className="object-cover" />
								</div>
							</div>
							<div className="w-full md:w-1/2 p-3">
								<h2 className="text-2xl font-bold mb-4">{`4. Jak znaleźć nocleg w Zakopanem?`}</h2>
								<p className="mb-4">{`Zakopane to rozległa miejscowość, dlatego warto dobrze przemyśleć miejsce noclegu.`}</p>
								<p className="mb-4">{`Szukając "Zakopane noclegi", warto zastanowić się, czy preferujemy nocleg blisko centrum, gdzie można skorzystać z atrakcji kulturalnych i rozrywkowych, czy może bardziej interesują nas okolice szlaków turystycznych.`}</p>
								<h3 className="text-xl font-semibold mt-6 mb-2">{`Zakopane centrum`}</h3>
								<p className="mb-4">{`Jeśli cenisz bliskość atrakcji turystycznych, takich jak Krupówki, lepiej szukać noclegu w centrum Zakopanego. Zakwaterowanie w tej okolicy sprawdzi się również dla tych, którzy lubią korzystać z restauracji i kawiarni.`}</p>
								<h3 className="text-xl font-semibold mt-6 mb-2">{`Okolice Gubałówki`}</h3>
								<p className="mb-4">{`Świetna opcja dla tych, którzy chcą być blisko stoków narciarskich oraz podziwiać panoramę Tatr.`}</p>
								<h3 className="text-xl font-semibold mt-6 mb-2">{`Kościelisko lub Poronin`}</h3>
								<p>{`Idealne dla osób szukających ciszy i spokoju, ale wciąż w niedalekiej odległości od Zakopanego.`}</p>
							</div>
						</div>
					</div>

					<div className="w-full p-6 mb-10 bg-white shadow-md rounded-lg text-gray-800">
						<div className="flex flex-col md:flex-row justify-between">
							<div className="w-full md:w-1/2 p-3 order-2 md:order-1">
								<h2 className="text-2xl font-bold mb-4">{`5. Zakopane noclegi. Jakie są ceny noclegów w Zakopanem?`}</h2>

								<ul className="list-disc list-inside space-y-4">
									<li>{`Noclegi budżetowe – ceny zaczynają się już od około 60–100 zł za osobę za noc w hostelach, schroniskach lub kwaterach prywatnych poza centrum.`}</li>
									<li>{`Pensjonaty i domy gościnne – średni koszt to około 150–250 zł za pokój dwuosobowy, często z opcją śniadania w cenie.`}</li>
									<li>{`Apartamenty – ceny wahają się od 200 do 500 zł za noc w zależności od lokalizacji, standardu i liczby osób. Im bliżej Krupówek, tym drożej.`}</li>
									<li>{`Hotele 3- i 4-gwiazdkowe – koszt noclegu to zazwyczaj 300–600 zł za pokój, z dostępem do spa, restauracji i innych udogodnień.`}</li>
									<li>{`Domki góralskie i luksusowe wille – ceny mogą sięgać nawet 800–1500 zł za noc, szczególnie w sezonie zimowym i wakacyjnym.`}</li>
								</ul>
							</div>
							<div className="w-full md:w-1/2 p-3 order-1 md:order-2">
								<div className="relative w-full h-64 md:h-full rounded-lg overflow-hidden">
									<Image src="/images/zakopane-rooms/5.webp" alt="Aqua Park Zakopane for families" fill className="object-cover" />
								</div>
							</div>
						</div>
					</div>

					<div className="w-full p-6 mb-10 bg-white shadow-md rounded-lg text-gray-800">
						<div className="flex flex-col md:flex-row justify-between">
							<div className="w-full md:w-1/2 p-3">
								<div className="relative w-full h-64 md:h-full mb-6 md:mb-0 rounded-lg overflow-hidden">
									<Image src="/images/zakopane-rooms/6.webp" alt="Aqua Park Zakopane for families" fill className="object-cover" />
								</div>
							</div>
							<div className="w-full md:w-1/2 p-3">
								<h2 className="text-2xl font-bold mb-4">{`6. Na co zwrócić uwagę, rezerwując nocleg w Zakopanem?`}</h2>

								<ul className="list-disc list-inside space-y-4">
									<li>{`Opinie gości – sprawdzenie opinii na stronach rezerwacyjnych to jeden z najlepszych sposobów, by dowiedzieć się, czego można się spodziewać.`}</li>
									<li>{`Warunki rezerwacji – przed dokonaniem rezerwacji warto upewnić się, jakie są zasady anulowania rezerwacji i ewentualne dodatkowe opłaty.`}</li>
									<li>{`Dodatkowe udogodnienia – jeśli zależy nam na konkretnej usłudze, np. śniadaniach, dostępie do spa czy parkingu, warto sprawdzić, czy obiekt to oferuje.`}</li>
									<li>{`Dostępność dla rodzin i zwierząt – nie wszystkie obiekty akceptują zwierzęta, a niektóre mogą być bardziej przystosowane do pobytu osób dorosłych z dziećmi.`}</li>
								</ul>
							</div>
						</div>
					</div>

					<div className="w-full p-6 mb-10 bg-white shadow-md rounded-lg text-gray-800">
						<h2 className="text-2xl font-bold mb-4">{`7. Zakopane noclegi last minute – czy warto?`}</h2>

						<ul className="list-disc list-inside space-y-4">
							<li>{`Oferty last minute mogą być atrakcyjne cenowo – wiele obiektów obniża ceny, by zapełnić wolne miejsca tuż przed terminem.`}</li>
							<li>{`Najlepsze okazje pojawiają się poza sezonem – wiosną i jesienią można znaleźć komfortowe noclegi w niższych cenach.`}</li>
							<li>{`W sezonie zimowym i letnim dostępność może być ograniczona – warto rezerwować z wyprzedzeniem, jeśli zależy nam na konkretnym standardzie lub lokalizacji.`}</li>
							<li>{`Rezerwacje last minute sprawdzą się dla osób elastycznych – jeśli nie przeszkadza Ci zmienność planów i jesteś otwarty na różne opcje.`}</li>
							<li>{`Warto korzystać z aplikacji i stron rezerwacyjnych – wiele z nich oferuje filtry „last minute” oraz powiadomienia o zniżkach.`}</li>
						</ul>
					</div>

					<div className="w-full p-6 mb-10 bg-white shadow-md rounded-lg text-gray-800">
						<h2 className="text-2xl font-bold mb-4">{`8. Najlepsze mieszkania do wynajęcia w Zakopanem według typu podróży`}</h2>

						<ul className="list-disc list-inside space-y-4">
							<li>{`Dla rodzin – pensjonaty i apartamenty z aneksem kuchennym, które umożliwiają przygotowanie posiłków.`}</li>
							<li>{`Dla par – romantyczne domki z widokiem na góry lub hotele z luksusowym spa.`}</li>
							<li>{`Dla grup znajomych – wynajem większego apartamentu lub domku.`}</li>
							<li>{`Dla turystów aktywnych – schroniska górskie lub noclegi w pobliżu popularnych szlaków i stoków narciarskich.`}</li>
						</ul>
					</div>

					<div className="w-full p-6 mb-10 bg-white shadow-md rounded-lg text-gray-800">
						<h2 className="text-2xl font-bold mb-4">{`9. Zakopane noclegi w Apartamentowach`}</h2>

						<p className="mb-4">{`Zakopane to miejsce, które ma wiele do zaoferowania. Dobrze wybrany nocleg sprawi, że czas spędzony w tej magicznej górskiej miejscowości będzie niezapomniany.`}</p>

						<p>{`Niezależnie od tego, czy szukasz luksusu czy prostoty, w Zakopanem znajdziesz noclegi, które spełnią Twoje oczekiwania.`}</p>
					</div>

					{/* Contact/Booking Section */}
					<div className="bg-white rounded-xl p-8 text-center mb-16">
						<h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">{zakopane.bookingTitle}</h3>
						<p className="text-lg text-gray-600 mb-6">{zakopane.bookingSubtitle}</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<button
								onClick={() => {
									const element = document.getElementById("contact")
									if (element) {
										element.scrollIntoView({
											behavior: "smooth",
											block: "start",
										})
									} else {
										// Navigate back to home and then scroll to contact
										window.location.href = `/${lang}/contact`
									}
								}}
								className="px-8 py-3 bg-[#1D2430] text-white rounded-lg transition-colors font-semibold">
								{zakopane.contactButton}
							</button>
							<a
								href={`tel:${dictionary.contactForm.officePhone}`}
								className="px-8 py-3 border-2 border-[#1D2430] text-[#1D2430] rounded-lg  transition-colors font-semibold">
								{zakopane.callButton}: {dictionary.contactForm.officePhone}
							</a>
						</div>
					</div>
				</div>
			</div>
			{/* Footer */}
			<Footer lang={lang} />
		</div>
	)
}

export default ZakopaneRoomsClient
