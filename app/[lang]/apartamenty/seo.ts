/** @format */

import { Locale } from "../../i18n-config"

type ApartmentLocation = "zakopane" | "koscielisko" | undefined

export type ApartmentSeoSection = {
	heading: string
	paragraphs: string[]
}

export type ApartmentFaqItem = {
	question: string
	answer: string
}

export type ApartmentSeoContent = {
	intro: string[]
	sections: ApartmentSeoSection[]
	faqHeading: string
	faq: ApartmentFaqItem[]
}

type ApartmentPageText = {
	title: string
	description: string
	keywords: string[]
	heading: string
	subtitle: string
	content: ApartmentSeoContent | null
}

const apartmentPageTexts: Record<string, { default: ApartmentPageText; zakopane: ApartmentPageText; koscielisko: ApartmentPageText }> = {
	pl: {
		default: {
			title: "Apartamenty w Zakopanem i Kościelisku | MSC Apartments",
			description:
				"Komfortowe apartamenty w górach — Zakopane i Kościelisko w jednym miejscu. Ponad 50 obiektów z sauną, basenem i widokiem na Tatry. Rezerwuj bezpośrednio i płać mniej.",
			keywords: ["apartamenty w górach", "apartamenty Zakopane", "apartamenty Kościelisko", "apartamenty hotelowe Zakopane", "noclegi w górach"],
			heading: "Apartamenty w Zakopanem i Kościelisku",
			subtitle:
				"Znajdź komfortowe apartamenty w górach – Zakopane i Kościelisko. Apartamenty w górach i apartamenty hotelowe Zakopane  | Kościelisko w jednym miejscu.",
			content: null,
		},
		zakopane: {
			title: "Apartamenty Zakopane | Komfortowe Noclegi w Górach | MSC Apartments",
			description:
				"Komfortowe apartamenty w Zakopanem blisko Krupówek i szlaków tatrzańskich. Sauna, jacuzzi, parking i widoki na Giewont. Rezerwuj bezpośrednio i płać mniej.",
			keywords: ["apartamenty Zakopane", "apartamenty w górach Zakopane", "apart hotel Zakopane", "noclegi Zakopane", "noclegi w górach"],
			heading: "Apartamenty w Zakopanem",
			subtitle: "Szukasz apartamentów w górach w Zakopanem? Oferujemy wygodne noclegi blisko atrakcji i szlaków.",
			content: {
				intro: [
					"Szukasz apartamentu w Zakopanem, który łączy bliskość Krupówek z ciszą i widokiem na Tatry? W portfolio MSC Apartments znajdziesz ponad 50 apartamentów rozsianych po całym mieście — od stu metrów od deptaka Krupówki, przez okolice ul. Jagiellońskiej i dworca PKP, po spokojniejsze rejony przy Kuźnicach, Dolinie Strążyskiej czy Krzeptówkach. Każdy obiekt prowadzimy osobiście, dlatego rezerwując noclegi w Zakopanem bezpośrednio u nas, zyskujesz wsparcie lokalnego zespołu i uczciwą cenę bez narzutów platform rezerwacyjnych.",
					"Niezależnie od tego, czy planujesz ferie na stokach Kasprowego Wierchu, weekend na szlaku do Morskiego Oka, czy sylwestra w sercu góralskiego kurortu — nasze apartamenty w Zakopanem pomogą Ci znaleźć idealną bazę. Poniżej znajdziesz konkretne informacje o lokalizacjach, udogodnieniach i odpowiedzi na najczęstsze pytania.",
				],
				sections: [
					{
						heading: "Dlaczego warto wybrać apartamenty w Zakopanem od MSC Apartments?",
						paragraphs: [
							"Zakopane to stolica polskich Tatr — miasto, w którym góralska tradycja spotyka się z nowoczesną turystyką. Wybierając nasze noclegi w Zakopanem, stawiasz na sprawdzone, czyste i w pełni wyposażone obiekty, które na bieżąco przygotowujemy dla gości. W części apartamentów czeka sauna, jacuzzi lub basen, dostęp do WiFi, aneks kuchenny i parking. Kilka obiektów oferuje panoramiczny widok na Giewont — najbardziej rozpoznawalny szczyt polskich Tatr.",
						],
					},
					{
						heading: "Jakie udogodnienia znajdziesz w naszych apartamentach?",
						paragraphs: [
							"Nasze apartamenty w górach przygotowujemy tak, by przypominały dom, a nie tylko bazę noclegową. Do dyspozycji gości są: sauna i jacuzzi (w wybranych obiektach), basen kryty, grill i ogród, plac zabaw oraz pokój fitness — szczególnie cenione przez rodziny z dziećmi. W kuchni czeka kompletne wyposażenie: lodówka, płyta grzewcza, zmywarka, ekspres do kawy i akcesoria, a w łazience ręczniki i suszarka. Na potrzeby turystów pieszych i narciarzy zapewniamy miejsca na narty i rowery oraz parking, w części obiektów prywatny garaż.",
						],
					},
					{
						heading: "W jakich częściach Zakopanego znajdują się nasze apartamenty?",
						paragraphs: [
							"Największą zaletą naszej oferty jest różnorodność lokalizacji. Kilka apartamentów znajduje się dosłownie 100 metrów od Krupówek — idealna baza na wieczorne spacery po deptaku. Obiekty przy ul. Jagiellońskiej zapewniają krótki dojazd do dworca PKP, Term Zakopiańskich i Wielkiej Krokwi. Apartamenty przy ul. Chałubińskiego łączą widok na Giewont z bliskością Kuźnic, skąd wyrusza kolejka linowa na Kasprowy Wierch. Z kolei spokojniejsze lokalizacje przy ul. Bogdańskiego prowadzą w stronę Doliny Strążyskiej i szlaków w głąb Tatrzańskiego Parku Narodowego.",
						],
					},
					{
						heading: "Apartamenty blisko atrakcji — szlaki, kolejka, termy",
						paragraphs: [
							"Zakopane to brama do największych atrakcji Podhala. Z Kuźnic wjedziesz kolejką na Kasprowy Wierch, spod Doliny Strążyskiej w ok. 2–3 godziny podejdziesz na Giewont, a na Morskie Oko najlepiej wybrać się wcześnie rano. Po dniu w górach czekają Termy Zakopiańskie, skocznia na Wielkiej Krokwi albo kolorowe Krupówki. Nasze apartamenty w Zakopanem dopasujemy do Twoich planów — tak, by każda atrakcja była na wyciągnięcie ręki.",
						],
					},
					{
						heading: "Dlaczego warto rezerwować noclegi w Zakopanem bezpośrednio u nas?",
						paragraphs: [
							"Rezerwując bezpośrednio przez naszą stronę, pomijasz prowizje portali pośredniczących — dlatego często zapłacisz mniej niż w tych samych terminach na dużych platformach. Dostajesz też bezpośredni kontakt z opiekunem obiektu, elastyczne ustalenia dotyczące zameldowania i wymeldowania oraz szybką pomoc w trakcie pobytu. Dostępność i ceny sprawdzisz online w kilka minut — bez telefonów i formularzy.",
						],
					},
				],
				faqHeading: "Najczęściej zadawane pytania",
				faq: [
					{
						question: "Ile osób może zamieszkać w apartamencie w Zakopanem?",
						answer:
							"Nasze apartamenty w Zakopanem mieszczą od 2 do 8 osób. W ofercie są przytulne studia dla par, apartamenty z jedną lub dwiema sypialniami oraz komfortowe obiekty z antresolą dla większych rodzin.",
					},
					{
						question: "Czy w apartamentach w Zakopanem jest parking?",
						answer:
							"Tak. Większość obiektów ma bezpłatny parking przy budynku, a w części dostępny jest prywatny garaż. Informację o parkingu i jego cenie znajdziesz w opisie każdego apartamentu.",
					},
					{
						question: "Czy można przyjechać do apartamentu z psem?",
						answer:
							"Do wybranych obiektów można przyjechać ze zwierzętami — część apartamentów jest pet-friendly (za dopłatą). Użyj filtra „dla zwierząt”, aby wyświetlić tylko oferty, do których wpuszczamy czworonogi.",
					},
					{
						question: "Jak daleko od Krupówek znajdują się apartamenty?",
						answer:
							"Od dosłownie 100 metrów od deptaka (apartament Pod Tatrami) po spokojniejsze lokalizacje przy Kuźnicach, Dolinie Strążyskiej i Krzeptówkach. Możesz wybrać bazę idealnie pod swój plan urlopu.",
					},
					{
						question: "Jak zarezerwować nocleg w Zakopanem online?",
						answer:
							"Ustaw daty i liczbę gości w wyszukiwarce na górze tej strony, przejrzyj dostępne apartamenty i potwierdź rezerwację. Cały proces odbywa się online, bez prowizji portali pośredniczących.",
					},
					{
						question: "Czy apartamenty mają widok na góry?",
						answer:
							"Tak. Wiele obiektów oferuje panoramiczny widok na Tatry, w tym na Giewont. Wystarczy wybrać filtr „widok na góry”, aby zobaczyć tylko takie apartamenty.",
					},
				],
			},
		},
		koscielisko: {
			title: "Apartamenty Kościelisko | Noclegi w Górach | MSC Apartments",
			description:
				"Apartamenty w Kościelisku pod Tatrami — blisko wyciągów Butorowy i Szymoszkowa oraz szlaków górskich. Sauna, jacuzzi, plac zabaw. Zarezerwuj nocleg bezpośrednio.",
			keywords: ["apartamenty Kościelisko", "apartamenty w górach Kościelisko", "noclegi Kościelisko", "noclegi w górach", "apartamenty w górach"],
			heading: "Apartamenty w Kościelisku",
			subtitle: "Znajdź komfortowe apartamenty w górach w Kościelisku — blisko natury, szlaków i stoków narciarskich.",
			content: {
				intro: [
					"Koscielisko to jedna z najpiękniejszych tatrzańskich wiosek — spokojniejsza alternatywa dla tłocznego centrum Zakopanego, a jednocześnie tylko kilka kilometrów od Krupówek. W ofercie MSC Apartments znajdziesz komfortowe apartamenty w Kościelisku przy ul. Butorowy oraz w części Szymoszkowa — z widokiem na Giewont, saunami, basenami i placami zabaw.",
					"Noclegi w Kościelisku świetnie sprawdzają się u narciarzy (tuż obok wyciągów Butorowy i Szymoszkowa), rodzin z dziećmi oraz wszystkich, którzy szukają górskiej ciszy blisko natury. Na wyciągnięcie ręki masz też Dolinę Kościeliską i szlaki w głąb Tatrzańskiego Parku Narodowego.",
				],
				sections: [
					{
						heading: "Apartamenty w Kościelisku — z dala od zgiełku, blisko gór",
						paragraphs: [
							"Koscielisko łączy to, co w górach najcenniejsze: malownicze widoki na Tatry, góralskie klimaty i ciszę, której brakuje w samym centrum kurortu. Nasze apartamenty w Kościelisku to w większości kameralne budynki z ogrodem lub tarasem, w których na gości czekają sauna, jacuzzi, a w części obiektów także basen. To miejsce, w którym po całym dniu zwiedzania naprawdę odpoczniesz.",
						],
					},
					{
						heading: "Noclegi blisko nart i szlaków — Butorowy, Szymoszkowa, Dolina Kościeliska",
						paragraphs: [
							"Wyciąg Butorowy i kompleks Szymoszkowa to jedne z popularniejszych miejsc narciarskich pod Giewontem — pierwsze trasy zjazdowe znajdziesz tuż przy naszych apartamentach. Latem te same zbocza zamieniają się w widokowe trasy spacerowe i rowerowe. W stronę Doliny Kościeliskiej wyruszysz bezpośrednio z wioski, a do wejść na szlaki TPN masz najwyżej kilkanaście minut drogi.",
						],
					},
					{
						heading: "Apartamenty w Kościelisku dla całej rodziny",
						paragraphs: [
							"RoDziny z dziećmi docenią place zabaw i pokoje fitness znajdujące się przy wielu obiektach, a także przestronne apartamenty z dwiema sypialniami i aneksem kuchennym. Część apartamentów w Kościelisku przyjmuje gości ze zwierzętami. Dzięki temu kolacje możecie przygotować sami, a wieczór spędzić przy grillu w ogrodzie.",
						],
					},
					{
						heading: "Dlaczego warto rezerwować noclegi w górach bezpośrednio u nas?",
						paragraphs: [
							"Rezerwacja bezpośrednia to niższa cena (bez prowizji portali), bezpośredni kontakt z opiekunem obiektu i elastyczne godziny zameldowania. Dostępność sprawdzisz na bieżąco w wyszukiwarce, a potwierdzenie przyjdzie od razu na Twój e-mail.",
						],
					},
				],
				faqHeading: "Najczęściej zadawane pytania",
				faq: [
					{
						question: "Jak daleko od centrum Zakopanego są apartamenty w Kościelisku?",
						answer:
							"To kilka kilometrów — dojazd samochodem zajmuje około 10 minut. Krupówki i Termy Zakopiańskie są więc łatwo dostępne, a wieczorami masz ciszę z dala od deptaka.",
					},
					{
						question: "Czy apartamenty w Kościelisku mają saunę lub basen?",
						answer:
							"Tak. Wiele obiektów oferuje saunę, jacuzzi lub kryty basen. O dostępności udogodnień w konkretnym apartamencie informują filtry na tej stronie.",
					},
					{
						question: "Czy Kościelisko to dobre miejsce na pobyt z dziećmi?",
						answer:
							"Zdecydowanie tak — blisko natury, placów zabaw i spokojnych tras spacerowych sprawia, że to jedna z najbezpieczniejszych baz rodzinnych pod Tatrami.",
					},
					{
						question: "Czy można dojechać do Kościeliska bez samochodu?",
						answer:
							"Tak — busy z Zakopanego docierają do Kościeliska regularnie, a od apartamentów przy Butorowym i Szymoszkowej blisko jest do lokalnych wyciągów i szlaków.",
					},
				],
			},
		},
	},
	en: {
		default: {
			title: "MSC Apartments | Apartments in Zakopane & Kościelisko",
			description:
				"Comfortable mountain apartments in Zakopane and Kościelisko in one place. Over 50 properties with sauna, pool and Tatra views. Book direct and pay less.",
			keywords: ["mountain apartments", "Zakopane apartments", "Kościelisko apartments", "mountain hotel apartments Zakopane", "mountain accommodation"],
			heading: "Mountain apartments in Zakopane and Kościelisko",
			subtitle: "Find comfortable mountain apartments in Zakopane and Kościelisko — mountain apartments and mountain hotel apartments in one place.",
			content: null,
		},
		zakopane: {
			title: "Zakopane Apartments | Comfortable Mountain Stays | MSC Apartments",
			description:
				"Comfortable apartments in Zakopane near Krupówki and Tatra hiking trails. Sauna, jacuzzi, parking and Giewont views. Book direct and pay less.",
			keywords: ["Zakopane apartments", "mountain apartments Zakopane", "apart hotel Zakopane", "Zakopane accommodation", "mountain accommodation"],
			heading: "Zakopane apartments",
			subtitle: "Looking for mountain apartments in Zakopane? Discover comfortable stays near the town center and the Tatras.",
			content: {
				intro: [
					"Looking for a Zakopane apartment that combines proximity to Krupówki with quiet and Tatra views? MSC Apartments offers over 50 self-catering apartments across the city — from 100 metres from the Krupówki promenade, through Jagiellońska Street and the main railway station area, to calmer neighbourhoods near Kuźnice, the Strążyska Valley and Krzeptówki. Because we run every property ourselves, booking Zakopane accommodation directly gives you local support and fair prices without booking-portal mark-ups.",
					"Whether you are planning winter holidays on Kasprowy Wierch slopes, a weekend hike to Morskie Oko or New Year in the heart of the highland resort — our Zakopane apartments help you find the perfect base. Below you will find concrete details about locations, amenities and answers to the most common questions.",
				],
				sections: [
					{
						heading: "Why choose Zakopane apartments from MSC Apartments?",
						paragraphs: [
							"Zakopane is the capital of the Polish Tatras — a town where highland tradition meets modern tourism. Choosing our Zakopane accommodation means clean, well-equipped and personally managed properties, prepared for guests on a regular basis. Many apartments feature a sauna, jacuzzi or swimming pool, free Wi-Fi, a kitchenette and parking. Several properties offer panoramic views of Giewont — the most recognisable summit of the Polish Tatras.",
						],
					},
					{
						heading: "What amenities do our apartments offer?",
						paragraphs: [
							"We prepare our mountain apartments to feel like home, not just a place to sleep. Guests enjoy saunas and jacuzzis (in selected properties), indoor pools, BBQ grills and gardens, playgrounds and fitness rooms — especially appreciated by families with children. Kitchens are fully equipped with a fridge, cooker hob, dishwasher, coffee machine and utensils, while bathrooms include towels and a hairdryer. For hikers and skiers we provide ski and bike storage and parking, in some properties a private garage.",
						],
					},
					{
						heading: "Which parts of Zakopane are our apartments located in?",
						paragraphs: [
							"The biggest advantage of our offer is location variety. Several apartments sit literally 100 metres from Krupówki — a perfect base for evening strolls. Properties on Jagiellońska Street offer quick access to the railway station, Termy Zakopiańskie thermal pools and the Wielka Krokiew ski jump. Apartments on Chałubińskiego Street combine Giewont views with proximity to Kuźnice, where the Kasprowy Wierch cable car departs. Quieter locations on Bogdańskiego Street lead towards the Strążyska Valley and trails deeper into the Tatra National Park.",
						],
					},
					{
						heading: "Apartments close to attractions — trails, cable car, thermal pools",
						paragraphs: [
							"From Kuźnice you can take the cable car to Kasprowy Wierch, from Strążyska Valley reach Giewont in about 2–3 hours, and to Morskie Oko it is best to set off early in the morning. After a day in the mountains you will find Termy Zakopiańskie, the Wielka Krokiew ski jump or colourful Krupówki. We will match our Zakopane apartments to your plans so every attraction is within easy reach.",
						],
					},
					{
						heading: "Why book Zakopane accommodation directly with us?",
						paragraphs: [
							"Booking directly through our website skips portal commissions — so you often pay less than on large platforms for the same dates. You also get direct contact with the property manager, flexible check-in and check-out arrangements and quick help during your stay. Availability and prices can be checked online in minutes — no phone calls or forms needed.",
						],
					},
				],
				faqHeading: "Frequently asked questions",
				faq: [
					{
						question: "How many people can stay in an apartment in Zakopane?",
						answer:
							"Our Zakopane apartments sleep between 2 and 8 guests. The offer includes cosy studios for couples, apartments with one or two bedrooms and comfortable properties with a mezzanine for larger families.",
					},
					{
						question: "Do the Zakopane apartments have parking?",
						answer:
							"Yes. Most properties offer free on-site parking and some include a private garage. Parking details are listed in each apartment description.",
					},
					{
						question: "Can I bring my dog to the apartment?",
						answer:
							"Selected properties are pet-friendly (for an extra fee). Use the pet-friendly filter to show only apartments that welcome four-legged guests.",
					},
					{
						question: "How far are the apartments from Krupówki?",
						answer:
							"From literally 100 metres away (the Pod Tatrami apartment) to quieter locations near Kuźnice, the Strążyska Valley and Krzeptówki — pick the base that fits your holiday plan.",
					},
					{
						question: "How do I book a night in Zakopane online?",
						answer:
							"Set your dates and number of guests in the search bar at the top of this page, browse available apartments and confirm your booking. Everything happens online, without portal commissions.",
					},
					{
						question: "Do the apartments have mountain views?",
						answer:
							"Yes. Many properties offer panoramic views of the Tatras, including Giewont. Simply choose the mountain-view filter to see only such apartments.",
					},
				],
			},
		},
		koscielisko: {
			title: "Kościelisko Apartments | Mountain Stays in the Tatras | MSC Apartments",
			description:
				"Apartments in Kościelisko in the Tatra mountains — close to the Butorowy and Szymoszkowa ski lifts and hiking trails. Sauna, jacuzzi, playground. Book direct.",
			keywords: ["Kościelisko apartments", "mountain apartments Kościelisko", "Kościelisko accommodation", "mountain accommodation", "Tatras apartments"],
			heading: "Kościelisko apartments",
			subtitle: "Discover comfortable mountain apartments in Kościelisko — ideal for hiking and winter stays.",
			content: {
				intro: [
					"Kościelisko is one of the most scenic Tatra villages — a calmer alternative to the crowded centre of Zakopane, yet only a few kilometres from Krupówki. MSC Apartments offers comfortable Kościelisko apartments on Butorowy Street and in the Szymoszkowa district — with Giewont views, saunas, pools and playgrounds.",
					"Koscielisko accommodation is a great choice for skiers (right next to the Butorowy and Szymoszkowa lifts), families with children and everyone looking for mountain quiet close to nature. The Kościeliska Valley and trails into the Tatra National Park are right on your doorstep.",
				],
				sections: [
					{
						heading: "Apartments in Kościelisko — away from the crowds, close to the mountains",
						paragraphs: [
							"Koscielisko combines the best of the mountains: scenic Tatra views, highland atmosphere and the peace that is hard to find in the resort centre itself. Our Kościelisko apartments are mostly cosy buildings with a garden or terrace, offering saunas, jacuzzis and, in some properties, swimming pools. This is a place where you can truly rest after a day of exploring.",
						],
					},
					{
						heading: "Stays close to skiing and trails — Butorowy, Szymoszkowa, Kościeliska Valley",
						paragraphs: [
							"The Butorowy and Szymoszkowa ski centres are among the most popular ski areas beneath Giewont — the first slopes are right next to our apartments. In summer, the same hillsides turn into scenic walking and cycling routes. You can set out for the Kościeliska Valley straight from the village, with trailheads of the Tatra National Park no more than a short drive away.",
						],
					},
					{
						heading: "Koscielisko apartments for the whole family",
						paragraphs: [
							"families with children appreciate playgrounds and fitness rooms available at many properties, as well as spacious apartments with two bedrooms and a kitchenette. Some Kościelisko apartments welcome pets. You can cook your own dinners and enjoy an evening BBQ in the garden.",
						],
					},
					{
						heading: "Why book mountain accommodation directly with us?",
						paragraphs: [
							"Direct booking means a lower price (no portal commissions), direct contact with the property manager and flexible check-in hours. You can check availability in real time with our search bar, and confirmation arrives in your email instantly.",
						],
					},
				],
				faqHeading: "Frequently asked questions",
				faq: [
					{
						question: "How far are the Kościelisko apartments from central Zakopane?",
						answer:
							"Only a few kilometres — about a 10-minute drive. Krupówki and Termy Zakopiańskie are easy to reach, while in the evenings you enjoy peace away from the promenade.",
					},
					{
						question: "Do the Kościelisko apartments have a sauna or a pool?",
						answer:
							"Yes. Many properties offer a sauna, jacuzzi or indoor pool. You can check amenities of a specific apartment using the filters on this page.",
					},
					{
						question: "Is Kościelisko a good place for a stay with children?",
						answer:
							"Definitely — being close to nature, playgrounds and quiet walking routes makes it one of the safest family bases under the Tatras.",
					},
					{
						question: "Can I reach Kościelisko without a car?",
						answer:
							"Yes — local minibuses from Zakopane run regularly, and apartments on Butorowy and Szymoszkowa are close to the local lifts and trails.",
					},
				],
			},
		},
	},
	it: {
		default: {
			title: "Appartamenti in montagna a Zakopane e Kościelisko | MSC Apartments",
			description:
				"Appartamenti confortevoli in montagna a Zakopane e Kościelisko in un unico posto. Oltre 50 strutture con sauna, piscina e vista sui Tatra. Prenota diretto e paga meno.",
			keywords: ["appartamenti in montagna", "appartamenti Zakopane", "appartamenti Kościelisko", "appartamenti hotel montagna Zakopane", "alloggio in montagna"],
			heading: "Appartamenti in montagna a Zakopane e Kościelisko",
			subtitle: "Trova appartamenti confortevoli in montagna a Zakopane e Kościelisko — appartamenti e aparthotel in montagna in un unico posto.",
			content: null,
		},
		zakopane: {
			title: "Appartamenti Zakopane | Soggiorni confortevoli in montagna | MSC Apartments",
			description:
				"Appartamenti confortevoli a Zakopane vicino a Krupówki e ai sentieri dei Tatra. Sauna, jacuzzi, parcheggio e vista sul Giewont. Prenota diretto e paga meno.",
			keywords: ["appartamenti Zakopane", "appartamenti in montagna Zakopane", "apart hotel Zakopane", "alloggio Zakopane", "alloggio in montagna"],
			heading: "Appartamenti a Zakopane",
			subtitle: "Cerchi appartamenti in montagna a Zakopane? Scopri soggiorni confortevoli vicino al centro e ai Tatra.",
			content: {
				intro: [
					"Cerchi un appartamento a Zakopane che unisca la vicinanza a Krupówki alla tranquillità e alla vista sui Tatra? MSC Apartments offre oltre 50 appartamenti self-catering in tutta la città — dai 100 metri dal corso Krupówki, alla zona di via Jagiellońska e della stazione ferroviaria, fino ai quartieri più tranquilli vicino a Kuźnice, alla Valle Strążyska e a Krzeptówki. Poiché gestiamo personalmente ogni struttura, prenotando l'alloggio a Zakopane direttamente da noi ottieni supporto locale e prezzi equi, senza i ricarichi dei portali di prenotazione.",
					"Che tu stia pianificando le vacanze invernali sulle piste del Kasprowy Wierch, un'escursione nel weekend al Morskie Oko o il capodanno nel cuore della località di montagna — i nostri appartamenti a Zakopane ti aiutano a trovare la base perfetta. Qui sotto trovi informazioni concrete su posizioni, servizi e risposte alle domande più comuni.",
				],
				sections: [
					{
						heading: "Perché scegliere gli appartamenti a Zakopane di MSC Apartments?",
						paragraphs: [
							"Zakopane è la capitale dei Tatra polacchi — una città dove la tradizione di montagna incontra il turismo moderno. Scegliere il nostro alloggio a Zakopane significa strutture pulite, ben attrezzate e gestite personalmente, preparate regolarmente per gli ospiti. Molti appartamenti dispongono di sauna, jacuzzi o piscina, Wi-Fi gratuito, angolo cottura e parcheggio. Diverse strutture offrono viste panoramiche sul Giewont — la vetta più riconoscibile dei Tatra polacchi.",
						],
					},
					{
						heading: "Quali servizi offrono i nostri appartamenti?",
						paragraphs: [
							"Prepariamo i nostri appartamenti in montagna per farli sentire come casa, non solo un posto dove dormire. Gli ospiti apprezzano saune e jacuzzi (in strutture selezionate), piscine coperta, barbecue e giardini, parchi giochi e sale fitness — molto graditi dalle famiglie con bambini. Le cucine sono completamente attrezzate con frigorifero, piano cottura, lavastoviglie, macchina da caffè e utensili, mentre i bagni includono asciugamani e asciugacapelli. Per escursionisti e sciatori mettiamo a disposizione depositi per sci e bici e parcheggio, in alcune strutture un garage privato.",
						],
					},
					{
						heading: "In quali zone di Zakopane si trovano i nostri appartamenti?",
						paragraphs: [
							"Il più grande vantaggio della nostra offerta è la varietà delle posizioni. Diversi appartamenti si trovano a letteralmente 100 metri da Krupówki — una base perfetta per le passeggiate serali. Le strutture di via Jagiellońska offrono un rapido accesso alla stazione ferroviaria, alle terme Termy Zakopiańskie e al trampolino Wielka Krokiew. Gli appartamenti di via Chałubińskiego uniscono la vista sul Giewont alla vicinanza a Kuźnice, da dove parte la funivia per il Kasprowy Wierch. Le posizioni più tranquille di via Bogdańskiego conducono verso la Valle Strążyska e i sentieri più profondi del Parco Nazionale dei Tatra.",
						],
					},
					{
						heading: "Appartamenti vicino alle attrazioni — sentieri, funivia, terme",
						paragraphs: [
							"Da Kuźnice puoi prendere la funivia per il Kasprowy Wierch, dalla Valle Strążyska raggiungere il Giewont in circa 2–3 ore e per il Morskie Oko è meglio partire presto al mattino. Dopo una giornata in montagna troverai le Termy Zakopiańskie, il trampolino Wielka Krokiew o la colorata Krupówki. Abbineremo i nostri appartamenti a Zakopane ai tuoi programmi, così ogni attrazione sarà facilmente raggiungibile.",
						],
					},
					{
						heading: "Perché prenotare l'alloggio a Zakopane direttamente con noi?",
						paragraphs: [
							"Prenotare direttamente sul nostro sito evita le commissioni dei portali — così spesso paghi meno che sulle grandi piattaforme per le stesse date. Hai anche un contatto diretto con il gestore della struttura, orari di check-in e check-out flessibili e assistenza rapida durante il soggiorno. Disponibilità e prezzi si controllano online in pochi minuti — senza telefonate o moduli.",
						],
					},
				],
				faqHeading: "Domande frequenti",
				faq: [
					{
						question: "Quante persone possono soggiornare in un appartamento a Zakopane?",
						answer:
							"I nostri appartamenti a Zakopane ospitano da 2 a 8 persone. L'offerta comprende accoglienti monolocali per coppie, appartamenti con una o due camere e confortevoli strutture con soppalco per famiglie numerose.",
					},
					{
						question: "Gli appartamenti a Zakopane hanno il parcheggio?",
						answer:
							"Sì. La maggior parte delle strutture offre parcheggio gratuito in loco e alcune includono un garage privato. I dettagli sul parcheggio sono indicati nella descrizione di ogni appartamento.",
					},
					{
						question: "Posso portare il cane in appartamento?",
						answer:
							"Strutture selezionate accettano animali domestici (a pagamento). Usa il filtro animali per mostrare solo gli appartamenti che accolgono gli ospiti a quattro zampe.",
					},
					{
						question: "Quanto distano gli appartamenti da Krupówki?",
						answer:
							"Da letteralmente 100 metri (l'appartamento Pod Tatrami) a posizioni più tranquille vicino a Kuźnice, alla Valle Strążyska e a Krzeptówki — scegli la base che si adatta al tuo programma di vacanza.",
					},
					{
						question: "Come prenoto online una notte a Zakopane?",
						answer:
							"Imposta le date e il numero di ospiti nella barra di ricerca in alto in questa pagina, sfoglia gli appartamenti disponibili e conferma la prenotazione. Tutto avviene online, senza commissioni dei portali.",
					},
					{
						question: "Gli appartamenti hanno vista sulle montagne?",
						answer:
							"Sì. Molte strutture offrono viste panoramiche sui Tatra, incluso il Giewont. Basta scegliere il filtro vista montagna per vedere solo questi appartamenti.",
					},
				],
			},
		},
		koscielisko: {
			title: "Appartamenti Kościelisko | Soggiorni in montagna sui Tatra | MSC Apartments",
			description:
				"Appartamenti a Kościelisko sui Tatra — vicino agli impianti di Butorowy e Szymoszkowa e ai sentieri. Sauna, jacuzzi, parco giochi. Prenota diretto.",
			keywords: ["appartamenti Kościelisko", "appartamenti in montagna Kościelisko", "alloggio Kościelisko", "alloggio in montagna", "appartamenti Tatra"],
			heading: "Appartamenti a Kościelisko",
			subtitle: "Scopri appartamenti confortevoli in montagna a Kościelisko — ideali per escursioni e soggiorni invernali.",
			content: {
				intro: [
					"Kościelisko è uno dei villaggi più panoramici dei Tatra — un'alternativa più tranquilla al centro affollato di Zakopane, ma a soli pochi chilometri da Krupówki. MSC Apartments offre confortevoli appartamenti a Kościelisko in via Butorowy e nel quartiere Szymoszkowa — con vista sul Giewont, saune, piscine e parchi giochi.",
					"L'alloggio a Kościelisko è un'ottima scelta per gli sciatori (proprio accanto agli impianti di Butorowy e Szymoszkowa), per le famiglie con bambini e per chi cerca la quiete della montagna a contatto con la natura. La Valle Kościeliska e i sentieri del Parco Nazionale dei Tatra sono a portata di mano.",
				],
				sections: [
					{
						heading: "Appartamenti a Kościelisko — lontano dalla folla, vicino alle montagne",
						paragraphs: [
							"Kościelisko unisce il meglio della montagna: viste panoramiche sui Tatra, atmosfera di montagna e la pace che è difficile trovare nel centro della località. I nostri appartamenti a Kościelisko sono per lo più accoglienti edifici con giardino o terrazza, che offrono saune, jacuzzi e, in alcune strutture, piscine. È un luogo dove riposare davvero dopo una giornata di esplorazione.",
						],
					},
					{
						heading: "Soggiorni vicino a sci e sentieri — Butorowy, Szymoszkowa, Valle Kościeliska",
						paragraphs: [
							"I centri sciistici di Butorowy e Szymoszkowa sono tra le zone sciistiche più popolari sotto il Giewont — le prime piste sono proprio accanto ai nostri appartamenti. In estate gli stessi pendii diventano percorsi panoramici per passeggiate e biciclette. Puoi partire per la Valle Kościeliska direttamente dal villaggio, con gli ingressi ai sentieri del Parco Nazionale dei Tatra a pochi minuti d'auto.",
						],
					},
					{
						heading: "Appartamenti a Kościelisko per tutta la famiglia",
						paragraphs: [
							"Le famiglie con bambini apprezzano i parchi giochi e le sale fitness disponibili in molte strutture, così come gli appartamenti spaziosi con due camere e angolo cottura. Alcuni appartamenti a Kościelisko accettano animali domestici. Puoi cucinare le tue cene e goderti un barbecue serale in giardino.",
						],
					},
					{
						heading: "Perché prenotare l'alloggio in montagna direttamente con noi?",
						paragraphs: [
							"La prenotazione diretta significa un prezzo più basso (nessuna commissione dei portali), contatto diretto con il gestore della struttura e orari di check-in flessibili. Puoi controllare la disponibilità in tempo reale con la nostra barra di ricerca e la conferma arriva immediatamente via email.",
						],
					},
				],
				faqHeading: "Domande frequenti",
				faq: [
					{
						question: "Quanto distano gli appartamenti a Kościelisko dal centro di Zakopane?",
						answer:
							"Solo pochi chilometri — circa 10 minuti d'auto. Krupówki e le Termy Zakopiańskie sono facilmente raggiungibili, mentre la sera godi della quiete lontano dal corso.",
					},
					{
						question: "Gli appartamenti a Kościelisko hanno sauna o piscina?",
						answer:
							"Sì. Molte strutture offrono sauna, jacuzzi o piscina coperta. Puoi verificare i servizi di un appartamento specifico usando i filtri di questa pagina.",
					},
					{
						question: "Kościelisko è un buon posto per un soggiorno con i bambini?",
						answer:
							"Assolutamente sì — la vicinanza alla natura, i parchi giochi e i percorsi tranquilli lo rendono una delle basi per famiglie più sicure sotto i Tatra.",
					},
					{
						question: "Posso raggiungere Kościelisko senza auto?",
						answer:
							"Sì — da Zakopane partono regolarmente minibus locali, e gli appartamenti di Butorowy e Szymoszkowa sono vicini agli impianti e ai sentieri locali.",
					},
				],
			},
		},
	},
	de: {
		default: {
			title: "Bergapartments in Zakopane & Kościelisko | MSC Apartments",
			description:
				"Komfortable Bergapartments in Zakopane und Kościelisko an einem Ort. Über 50 Objekte mit Sauna, Pool und Tatra-Blick. Direkt buchen und sparen.",
			keywords: ["Bergapartments", "Zakopane Apartments", "Kościelisko Apartments", "Berghotel-Apartments Zakopane", "Bergunterkunft"],
			heading: "Bergapartments in Zakopane und Kościelisko",
			subtitle: "Finden Sie komfortable Bergapartments in Zakopane und Kościelisko — Bergapartments und Berghotel-Apartments an einem Ort.",
			content: null,
		},
		zakopane: {
			title: "Zakopane Apartments | Komfortable Bergunterkünfte | MSC Apartments",
			description:
				"Komfortable Apartments in Zakopane nahe Krupówki und Tatra-Wanderwegen. Sauna, Whirlpool, Parkplatz und Giewont-Blick. Direkt buchen und sparen.",
			keywords: ["Zakopane Apartments", "Bergapartments Zakopane", "Apart Hotel Zakopane", "Unterkunft Zakopane", "Bergunterkunft"],
			heading: "Bergapartments Zakopane",
			subtitle: "Suchen Sie Bergapartments in Zakopane? Finden Sie komfortable Unterkünfte nahe der Tatra-Berge.",
			content: {
				intro: [
					"Auf der Suche nach einem Apartment in Zakopane, das Nähe zur Krupówki-Promenade mit Ruhe und Tatra-Blick verbindet? MSC Apartments bietet über 50 Ferienapartments in der ganzen Stadt — von 100 Metern zur Krupówki über die Jagiellońska-Straße und den Bahnhof bis zu ruhigeren Lagen an Kuźnice, dem Strążyska-Tal und Krzeptówki. Da wir jedes Objekt selbst betreiben, erhalten Sie bei der direkten Buchung lokale Betreuung und faire Preise ohne Portale.",
					"Ob Winterurlaub an den Hängen des Kasprowy Wierch, Wanderwochenende zum Morskie Oko oder Silvester im Herzen des Kurorts — unsere Unterkünfte in Zakopane helfen Ihnen, die perfekte Basis zu finden. Unten finden Sie konkrete Informationen zu Lagen, Ausstattung und Antworten auf häufige Fragen.",
				],
				sections: [
					{
						heading: "Warum Apartments in Zakopane von MSC Apartments wählen?",
						paragraphs: [
							"Zakopane ist die Hauptstadt der polnischen Tatra — eine Stadt, in der goralische Tradition auf modernen Tourismus trifft. Mit unseren Unterkünften in Zakopane setzen Sie auf geprüfte, saubere und voll ausgestattete Objekte. In vielen Apartments warten Sauna, Whirlpool oder Pool, WLAN, Küchenzeile und Parkplatz. Einige Objekte bieten einen Panoramablick auf den Giewont — den bekanntesten Gipfel der polnischen Tatra.",
						],
					},
					{
						heading: "Welche Ausstattung bieten unsere Apartments?",
						paragraphs: [
							"Unsere Bergapartments fühlen sich wie ein Zuhause an, nicht nur als Schlafgelegenheit. Zu Ihrer Verfügung: Sauna und Whirlpool (in ausgewählten Objekten), überdachter Pool, Grill und Garten, Spielplatz sowie Fitnessraum — besonders beliebt bei Familien. Die Küche ist komplett ausgestattet (Kühlschrank, Herd, Spülmaschine, Kaffeemaschine), im Bad finden Sie Handtücher und Föhn. Für Wanderer und Skifahrer gibt es Abstellplätze für Ski und Fahrräder sowie Parkplätze, teils mit privater Garage.",
						],
					},
					{
						heading: "In welchen Stadtteilen befinden sich unsere Apartments?",
						paragraphs: [
							"Der größte Vorteil unserer Angebote ist die Lagevielfalt. Einige Apartments liegen buchstäblich 100 Meter von der Krupówki entfernt — ideal für abendliche Spaziergänge. Objekte an der Jagiellońska-Straße bieten kurze Wege zum Bahnhof, zu den Termy Zakopiańskie und zur Großschanze Wielka Krokiew. Die Apartments an der Chałubińskiego-Straße verbinden den Giewont-Blick mit der Nähe zu Kuźnice, von wo die Seilbahn auf den Kasprowy Wierch fährt. Ruhigere Lagen an der Bogdańskiego-Straße führen in Richtung Strążyska-Tal und Tatra-Nationalpark.",
						],
					},
					{
						heading: "Apartments nahe aller Attraktionen — Wanderwege, Seilbahn, Thermen",
						paragraphs: [
							"Von Kuźnice gelangen Sie mit der Seilbahn zum Kasprowy Wierch, vom Strążyska-Tal erreichen Sie den Giewont in etwa 2–3 Stunden. Nach einem Bergtag warten die Termy Zakopiańskie oder die bunte Krupówki. Wir wählen das passende Apartment in Zakopane für Ihre Pläne — jede Attraktion ist in Reichweite.",
						],
					},
					{
						heading: "Warum direkt bei uns buchen?",
						paragraphs: [
							"Direkt über unsere Website zu buchen spart Provisionen — oft zahlen Sie für dieselben Termine weniger als auf großen Portalen. Sie erhalten zudem direkten Kontakt zum Betreuer, flexible Check-in-Zeiten und schnelle Hilfe während des Aufenthalts. Verfügbarkeit und Preise prüfen Sie online in wenigen Minuten.",
						],
					},
				],
				faqHeading: "Häufig gestellte Fragen",
				faq: [
					{
						question: "Wie viele Personen passen in ein Apartment in Zakopane?",
						answer:
							"Unsere Apartments in Zakopane bieten Platz für 2 bis 8 Gäste — von gemütlichen Studios für Paare über Ein- und Zweizimmer-Apartments bis zu Objekten mit Galerie für große Familien.",
					},
					{
						question: "Haben die Apartments in Zakopane einen Parkplatz?",
						answer:
							"Ja. Die meisten Objekte bieten einen kostenlosen Parkplatz am Haus, einige sogar eine private Garage. Details finden Sie in jeder Apartmentbeschreibung.",
					},
					{
						question: "Kann ich meinen Hund mitbringen?",
						answer:
							"Ausgewählte Objekte sind haustierfreundlich (gegen Gebühr). Nutzen Sie den Filter „Tiere erlaubt“, um nur solche Unterkünfte anzuzeigen.",
					},
					{
						question: "Wie weit sind die Apartments von der Krupówki entfernt?",
						answer:
							"Von buchstäblich 100 Metern (Apartment Pod Tatrami) bis zu ruhigeren Lagen an Kuźnice, dem Strążyska-Tal und Krzeptówki — Sie wählen die Basis passend zu Ihrem Urlaub.",
					},
					{
						question: "Wie buche ich online eine Unterkunft in Zakopane?",
						answer:
							"Stellen Sie Datum und Gästezahl in der Suche oben auf dieser Seite ein, wählen Sie ein verfügbares Apartment und bestätigen Sie die Buchung. Alles online, ohne Portaprovisionen.",
					},
					{
						question: "Haben die Apartments einen Bergblick?",
						answer:
							"Ja. Viele Objekte bieten einen Panoramablick auf die Tatra, einschließlich Giewont. Wählen Sie einfach den Filter „Bergblick“.",
					},
				],
			},
		},
		koscielisko: {
			title: "Kościelisko Apartments | Bergunterkünfte in den Tatren | MSC Apartments",
			description:
				"Apartments in Kościelisko in den Tatren — nahe der Skilifte Butorowy und Szymoszkowa und den Wanderwegen. Sauna, Whirlpool, Spielplatz. Direkt buchen.",
			keywords: ["Kościelisko Apartments", "Bergapartments Kościelisko", "Kościelisko Unterkunft", "Bergunterkunft", "Tatras Apartments"],
			heading: "Bergapartments Kościelisko",
			subtitle: "Entdecken Sie komfortable Bergapartments in Kościelisko — ideal für Wanderer und Wintersportler.",
			content: {
				intro: [
					"Kościelisko ist eines der schönsten Tatra-Dörfer — eine ruhigere Alternative zum belebten Zentrum von Zakopane, nur wenige Kilometer von der Krupówki entfernt. MSC Apartments bietet komfortable Apartments in Kościelisko an der Butorowy-Straße und im Ortsteil Szymoszkowa — mit Giewont-Blick, Saunen, Pools und Spielplätzen.",
					"Unterkünfte in Kościelisko sind ideal für Skifahrer (direkt neben den Liften Butorowy und Szymoszkowa), Familien mit Kindern und alle, die Ruhe in der Natur suchen. Das Kościeliska-Tal und Wege in den Tatra-Nationalpark liegen direkt vor der Haustür.",
				],
				sections: [
					{
						heading: "Apartments in Kościelisko — fern vom Trubel, nah an den Bergen",
						paragraphs: [
							"Kościelisko vereint das Beste der Berge: malerische Tatra-Blicke, goralische Atmosphäre und die Ruhe, die man im Zentrum des Kurorts kaum findet. Unsere Apartments in Kościelisko sind meist gemütliche Häuser mit Garten oder Terrasse, ausgestattet mit Sauna, Whirlpool und teils Pool. Ein Ort, an dem Sie nach einem Erkundungstag wirklich entspannen.",
						],
					},
					{
						heading: "Unterkünfte nahe Ski und Wegen — Butorowy, Szymoszkowa, Kościeliska-Tal",
						paragraphs: [
							"Die Skigebiete Butorowy und Szymoszkowa zählen zu den beliebtesten unter dem Giewont — die ersten Pisten liegen direkt bei unseren Apartments. Im Sommer werden die Hänge zu Aussichts- und Radwegen. Ins Kościeliska-Tal starten Sie direkt vom Dorf, die Zugänge zum Nationalpark sind nur wenige Minuten entfernt.",
						],
					},
					{
						heading: "Kościelisko-Apartments für die ganze Familie",
						paragraphs: [
							"Familien schätzen Spielplätze und Fitnessräume an vielen Objekten sowie geräumige Apartments mit zwei Schlafzimmern und Küchenzeile. Einige Unterkünfte in Kościelisko nehmen auch Haustiere auf. So können Sie selbst kochen und den Abend beim Grillen im Garten genießen.",
						],
					},
					{
						heading: "Warum direkt bei uns buchen?",
						paragraphs: [
							"Direkte Buchung bedeutet niedrigeren Preis (ohne Portaprovisionen), direkten Kontakt zum Betreuer und flexible Check-in-Zeiten. Verfügbarkeit prüfen Sie in Echtzeit über die Suche, die Bestätigung kommt sofort per E-Mail.",
						],
					},
				],
				faqHeading: "Häufig gestellte Fragen",
				faq: [
					{
						question: "Wie weit sind die Apartments in Kościelisko vom Zentrum Zakopanes entfernt?",
						answer:
							"Nur wenige Kilometer — die Fahrt dauert etwa 10 Minuten. Krupówki und Termy Zakopiańskie sind gut erreichbar, abends genießen Sie Ruhe abseits der Promenade.",
					},
					{
						question: "Haben die Apartments in Kościelisko eine Sauna oder einen Pool?",
						answer:
							"Ja. Viele Objekte bieten Sauna, Whirlpool oder überdachten Pool. Die Ausstattung jedes Apartments finden Sie über die Filter auf dieser Seite.",
					},
					{
						question: "Ist Kościelisko ein guter Ort für einen Aufenthalt mit Kindern?",
						answer:
							"Absolut — nähe zur Natur, Spielplätzen und ruhigen Spazierwegen macht es zu einer der sichersten Familienbasen unter der Tatra.",
					},
					{
						question: "Kann man Kościelisko ohne Auto erreichen?",
						answer:
							"Ja — Minibusse aus Zakopane fahren regelmäßig, und die Apartments an Butorowy und Szymoszkowa liegen nah an Liften und Wegen.",
					},
				],
			},
		},
	},
	es: {
		default: {
			title: "Apartamentos de montaña en Zakopane y Kościelisko | MSC Apartments",
			description:
				"Confortables apartamentos en la montaña en Zakopane y Kościelisko en un solo lugar. Más de 50 propiedades con sauna, piscina y vistas a los Tatras. Reserva directa.",
			keywords: [
				"apartamentos en la montaña",
				"apartamentos Zakopane",
				"apartamentos Kościelisko",
				"apartamentos hoteleros Zakopane",
				"alojamiento en la montaña",
			],
			heading: "Apartamentos en Zakopane y Kościelisko",
			subtitle: "Encuentra cómodos apartamentos en la montaña — Zakopane y Kościelisko. Apartamentos en la montaña y apartamentos hoteleros Zakopane en un solo lugar.",
			content: null,
		},
		zakopane: {
			title: "Apartamentos Zakopane | Alojamientos en la Montaña | MSC Apartments",
			description:
				"Confortables apartamentos en Zakopane cerca de Krupówki y las rutas de los Tatras. Sauna, jacuzzi, parking y vistas al Giewont. Reserva directa y paga menos.",
			keywords: [
				"apartamentos Zakopane",
				"apartamentos en la montaña Zakopane",
				"apart hotel Zakopane",
				"alojamiento Zakopane",
				"alojamiento en la montaña",
			],
			heading: "Apartamentos Zakopane",
			subtitle: "¿Buscas apartamentos en la montaña en Zakopane? Descubre alojamientos cómodos cerca del centro y de los Tatras.",
			content: {
				intro: [
					"¿Buscas un apartamento en Zakopane que combine la cercanía de Krupówki con la tranquilidad y las vistas a los Tatras? MSC Apartments ofrece más de 50 apartamentos repartidos por toda la ciudad: desde 100 metros del paseo de Krupówki, pasando por la calle Jagiellońska y la estación de tren, hasta zonas más tranquilas junto a Kuźnice, el valle de Strążyska y Krzeptówki. Como gestionamos cada propiedad directamente, reservar alojamiento en Zakopane con nosotros significa apoyo local y precios justos sin comisiones de portales.",
					"Ya sea para vacaciones de esquí en Kasprowy Wierch, una escapada de senderismo a Morskie Oko o la nochevieja en el corazón del pueblo montañés, nuestros apartamentos en Zakopane te ayudan a encontrar la base perfecta. Abajo encontrarás información concreta sobre ubicaciones, servicios y respuestas a las preguntas más frecuentes.",
				],
				sections: [
					{
						heading: "¿Por qué elegir apartamentos en Zakopane de MSC Apartments?",
						paragraphs: [
							"Zakopane es la capital de los Tatras polacos: una ciudad donde la tradición montañesa se encuentra con el turismo moderno. Al elegir nuestro alojamiento en Zakopane apuestas por propiedades cuidadas, limpias y totalmente equipadas. Muchos apartamentos tienen sauna, jacuzzi o piscina, Wi-Fi, cocina americana y aparcamiento. Varias propiedades ofrecen vistas panorámicas al Giewont, el pico más emblemático de los Tatras polacos.",
						],
					},
					{
						heading: "¿Qué servicios ofrecen nuestros apartamentos?",
						paragraphs: [
							"Preparamos nuestros apartamentos de montaña para que se sientan como en casa. A tu disposición: sauna y jacuzzi (en algunas propiedades), piscina cubierta, barbacoa y jardín, zona de juegos y gimnasio — muy valorados por las familias. La cocina está totalmente equipada (frigorífico, vitrocerámica, lavavajillas, cafetera) y el baño incluye toallas y secador. Para senderistas y esquiadores hay espacio para esquís y bicicletas y aparcamiento, en algunas propiedades garaje privado.",
						],
					},
					{
						heading: "¿En qué zonas de Zakopane están nuestros apartamentos?",
						paragraphs: [
							"La mayor ventaja de nuestra oferta es la variedad de ubicaciones. Varios apartamentos están literalmente a 100 metros de Krupówki — la base ideal para paseos nocturnos. Las propiedades de la calle Jagiellońska ofrecen acceso rápido a la estación de tren, las Termas de Zakopane y el trampolín Wielka Krokiew. Los apartamentos de la calle Chałubińskiego combinan vistas al Giewont con la cercanía de Kuźnice, donde sale el teleférico a Kasprowy Wierch. Las zonas más tranquilas de la calle Bogdańskiego conducen hacia el valle de Strążyska y las rutas del Parque Nacional de los Tatras.",
						],
					},
					{
						heading: "Apartamentos cerca de las atracciones — rutas, teleférico, termas",
						paragraphs: [
							"Desde Kuźnice llegas en teleférico a Kasprowy Wierch, desde el valle de Strążyska puedes subir al Giewont en 2–3 horas y a Morskie Oko conviene ir temprano. Tras un día de montaña te esperan las Termas de Zakopane, el trampolín de Wielka Krokiew o las coloridas Krupówki. Adaptamos nuestros apartamentos en Zakopane a tus planes para que cada atracción esté a mano.",
						],
					},
					{
						heading: "¿Por qué reservar alojamiento en Zakopane directamente con nosotros?",
						paragraphs: [
							"Al reservar directamente en nuestra web te ahorras las comisiones de los portales — por eso muchas veces pagarás menos que en las grandes plataformas. También tienes contacto directo con el responsable de la propiedad, horarios de llegada flexibles y ayuda rápida durante tu estancia. Consulta disponibilidad y precios online en minutos, sin llamadas ni formularios.",
						],
					},
				],
				faqHeading: "Preguntas frecuentes",
				faq: [
					{
						question: "¿Cuántas personas pueden alojarse en un apartamento en Zakopane?",
						answer:
							"Nuestros apartamentos en Zakopane admiten de 2 a 8 huéspedes: desde estudios acogedores para parejas hasta apartamentos con uno o dos dormitorios y propiedades con altillo para familias numerosas.",
					},
					{
						question: "¿Los apartamentos en Zakopane tienen aparcamiento?",
						answer:
							"Sí. La mayoría de las propiedades cuenta con aparcamiento gratuito en el edificio y algunas incluyen garaje privado. Los detalles aparecen en la descripción de cada apartamento.",
					},
					{
						question: "¿Puedo llevar a mi perro al apartamento?",
						answer:
							"Algunas propiedades admiten mascotas (con suplemento). Usa el filtro „admite mascotas”, para ver solo las que dan la bienvenida a los animales.",
					},
					{
						question: "¿A qué distancia están los apartamentos de Krupówki?",
						answer:
							"Desde literalmente 100 metros (el apartamento Pod Tatrami) hasta zonas más tranquilas junto a Kuźnice, el valle de Strążyska y Krzeptówki. Elige la base ideal para tu viaje.",
					},
					{
						question: "¿Cómo reservo una noche en Zakopane online?",
						answer:
							"Configura las fechas y el número de huéspedes en el buscador de la parte superior, revisa los apartamentos disponibles y confirma la reserva. Todo online, sin comisiones de portales.",
					},
					{
						question: "¿Los apartamentos tienen vistas a la montaña?",
						answer:
							"Sí. Muchas propiedades ofrecen vistas panorámicas a los Tatras, incluido el Giewont. Basta con elegir el filtro „vistas a la montaña”.",
					},
				],
			},
		},
		koscielisko: {
			title: "Apartamentos Kościelisko | Alojamientos en las Montañas | MSC Apartments",
			description:
				"Apartamentos en Kościelisko en las montañas de los Tatras — cerca de los remontes Butorowy y Szymoszkowa y de las rutas. Sauna, jacuzzi, zona de juegos. Reserva directa.",
			keywords: [
				"apartamentos Kościelisko",
				"apartamentos en la montaña Kościelisko",
				"alojamiento Kościelisko",
				"alojamiento en la montaña",
				"apartamentos Tatras",
			],
			heading: "Apartamentos en Kościelisko",
			subtitle: "Encuentra cómodos apartamentos en Kościelisko — cerca de la naturaleza, senderos y pistas de esquí.",
			content: {
				intro: [
					"Kościelisko es uno de los pueblos más bonitos de los Tatras: una alternativa más tranquila al concurrido centro de Zakopane, a solo unos kilómetros de Krupówki. MSC Apartments ofrece cómodos apartamentos en Kościelisko en la calle Butorowy y en la zona de Szymoszkowa — con vistas al Giewont, saunas, piscinas y zonas de juegos.",
					"El alojamiento en Kościelisko es ideal para esquiadores (junto a los remontes de Butorowy y Szymoszkowa), familias con niños y para quienes buscan el silencio de la montaña. El valle de Kościeliska y las rutas del Parque Nacional de los Tatras están a la puerta.",
				],
				sections: [
					{
						heading: "Apartamentos en Kościelisko — lejos del bullicio, cerca de la montaña",
						paragraphs: [
							"Kościelisko combina lo mejor de la montaña: vistas a los Tatras, ambiente de pastor y la paz difícil de encontrar en el centro del resort. Nuestros apartamentos en Kościelisko son en su mayoría edificios acogedores con jardín o terraza, equipados con sauna, jacuzzi y, en algunos casos, piscina. Un lugar donde descansar de verdad tras un día de excursión.",
						],
					},
					{
						heading: "Alojamiento cerca de esquí y rutas — Butorowy, Szymoszkowa, valle de Kościeliska",
						paragraphs: [
							"Las estaciones de Butorowy y Szymoszkowa están entre las más populares bajo el Giewont — las primeras pistas están junto a nuestros apartamentos. En verano, las laderas se convierten en rutas panorámicas de senderismo y ciclismo. Hacia el valle de Kościeliska sales directamente del pueblo y los accesos al Parque Nacional están a pocos minutos.",
						],
					},
					{
						heading: "Apartamentos en Kościelisko para toda la familia",
						paragraphs: [
							"Las familias valoran las zonas de juegos y los gimnasios de muchas propiedades, así como los espaciosos apartamentos con dos dormitorios y cocina. Algunos apartamentos en Kościelisko admiten mascotas. Podéis cocinar vuestras cenas y disfrutar de una barbacoa por la noche en el jardín.",
						],
					},
					{
						heading: "¿Por qué reservar directamente con nosotros?",
						paragraphs: [
							"Reservar directamente significa mejor precio (sin comisiones de portales), contacto directo con el responsable de la propiedad y horarios de llegada flexibles. Consulta la disponibilidad en tiempo real con el buscador y la confirmación llega al instante a tu correo.",
						],
					},
				],
				faqHeading: "Preguntas frecuentes",
				faq: [
					{
						question: "¿A qué distancia están los apartamentos de Kościelisko del centro de Zakopane?",
						answer:
							"Solo unos pocos kilómetros — unos 10 minutos en coche. Krupówki y las Termas de Zakopane están bien comunicadas, y por las noches disfrutas de tranquilidad lejos del paseo.",
					},
					{
						question: "¿Los apartamentos en Kościelisko tienen sauna o piscina?",
						answer:
							"Sí. Muchas propiedades ofrecen sauna, jacuzzi o piscina cubierta. Puedes comprobar los servicios de cada apartamento con los filtros de esta página.",
					},
					{
						question: "¿Es Kościelisko un buen lugar para ir con niños?",
						answer:
							"Totalmente — cerca de la naturaleza, zonas de juegos y rutas tranquilas la convierten en una de las bases familiares más seguras bajo los Tatras.",
					},
					{
						question: "¿Se puede llegar a Kościelisko sin coche?",
						answer:
							"Sí — los minibuses desde Zakopane salen con regularidad y los apartamentos de Butorowy y Szymoszkowa quedan cerca de los remontes y las rutas.",
					},
				],
			},
		},
	},
}

export function getApartamentyPageText(lang: Locale, location?: ApartmentLocation): ApartmentPageText {
	const localeText = apartmentPageTexts[lang] || apartmentPageTexts.pl
	if (location === "zakopane") return localeText.zakopane
	if (location === "koscielisko") return localeText.koscielisko
	return localeText.default
}

const locationLabels: Record<string, string> = {
	en: "Zakopane, Poland",
	it: "Zakopane, Polonia",
	de: "Zakopane, Polen",
	es: "Zakopane, Polonia",
}

export function getLocationLabel(lang: Locale, location?: ApartmentLocation): string {
	if (location === "zakopane") return "Zakopane"
	if (location === "koscielisko") return "Kościelisko"
	return locationLabels[lang] || "Zakopane, Polska"
}

export function getApartamentyJsonLd(
	lang: Locale,
	location: ApartmentLocation,
	baseUrl: string,
	currentUrl: string,
): Record<string, unknown> {
	const text = getApartamentyPageText(lang, location)
	const homeUrl = `${baseUrl}/${lang}`
	const graph: Record<string, unknown>[] = [
		{
			"@type": "LodgingBusiness",
			"@id": `${currentUrl}/#lodging`,
			name: text.heading,
			url: currentUrl,
			image: `${baseUrl}/images/tlo.jpg`,
			description: text.description,
			priceRange: (lang as string) === "de" ? "€€" : "$$",
			telephone: "+48 515 857 609",
			email: "apartamentymsc@gmail.com",
			address: {
				"@type": "PostalAddress",
				addressLocality: getLocationLabel(lang, location),
				addressCountry: "PL",
			},
			amenityFeature: [
				{ "@type": "LocationFeatureSpecification", name: "Parking", value: true },
				{ "@type": "LocationFeatureSpecification", name: "Sauna", value: true },
				{ "@type": "LocationFeatureSpecification", name: "Swimming pool", value: true },
				{ "@type": "LocationFeatureSpecification", name: "Jacuzzi", value: true },
				{ "@type": "LocationFeatureSpecification", name: "Wi-Fi", value: true },
				{ "@type": "LocationFeatureSpecification", name: "Mountain view", value: true },
			],
		},
		{
			"@type": "BreadcrumbList",
			itemListElement: [
				{ "@type": "ListItem", position: 1, name: "Home", item: homeUrl },
				{ "@type": "ListItem", position: 2, name: text.heading, item: currentUrl },
			],
		},
	]

	if (text.content?.faq?.length) {
		graph.push({
			"@type": "FAQPage",
			mainEntity: text.content.faq.map((item) => ({
				"@type": "Question",
				name: item.question,
				acceptedAnswer: { "@type": "Answer", text: item.answer },
			})),
		})
	}

	return {
		"@context": "https://schema.org",
		"@graph": graph,
	}
}