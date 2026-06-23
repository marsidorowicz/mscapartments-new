/** @format */

import * as React from "react"
import { getDictionary } from "../../dictionaries"
import ModernNav from "../homepage/components/ModernNav"
import type { Metadata } from "next"
import Footer from "../homepage/components/Footer"
import { Locale } from "@/app/i18n-config"

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
	const { lang } = await params
	const dictionary = await getDictionary(lang)

	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mscapartments.pl"
	const currentUrl = `${baseUrl}/${lang}/privacy`

	return {
		title: `${dictionary.navigation.privacy} - ${dictionary.title}`,
		description: "Polityka prywatności MSC Apartments - dowiedz się, jak chronimy Twoje dane osobowe i jak przetwarzamy informacje.",
		keywords: [dictionary.navigation.privacy, "MSC Apartments", "polityka prywatności", "RODO", "dane osobowe", "prywatność"].join(", "),
		authors: [
			{
				name: "MSC Apartments",
				url: "https://mscapartments.pl",
			},
		],
		creator: "MSC Apartments",
		publisher: "MSC Apartments",
		metadataBase: new URL(baseUrl),
		alternates: {
			canonical: currentUrl,
			languages: {
				en: `${baseUrl}/en/privacy`,
				pl: `${baseUrl}/pl/privacy`,
				de: `${baseUrl}/de/privacy`,
				es: `${baseUrl}/es/privacy`,
			},
		},
		openGraph: {
			title: `${dictionary.navigation.privacy} - ${dictionary.title}`,
			description: "Polityka prywatności MSC Apartments - dowiedz się, jak chronimy Twoje dane osobowe i jak przetwarzamy informacje.",
			url: currentUrl,
			siteName: "MSC Apartments",
			images: [
				{
					url: `${baseUrl}/images/privacy-policy.jpg`,
					width: 1200,
					height: 630,
					alt: "Privacy Policy - MSC Apartments",
				},
			],
			locale: lang,
			type: "website",
		},
		twitter: {
			card: "summary_large_image",
			title: `${dictionary.navigation.privacy} - ${dictionary.title}`,
			description: "Polityka prywatności MSC Apartments - dowiedz się, jak chronimy Twoje dane osobowe i jak przetwarzamy informacje.",
			images: [`${baseUrl}/images/privacy-policy.jpg`],
		},
		robots: {
			index: true,
			follow: true,
			googleBot: {
				index: true,
				follow: true,
				"max-video-preview": -1,
				"max-image-preview": "large",
				"max-snippet": -1,
			},
		},
	}
}

const content: Record<"pl" | "en" | "de" | "es", React.JSX.Element> = {
	pl: (
		<>
			<h2 className="text-2xl font-semibold mt-6 mb-4 text-gray-800">Ustawienia prywatności</h2>
			<h3 className="font-bold mt-6 mb-3 text-gray-800">§1. POSTANOWIENIA OGÓLNE</h3>
			<p className="mb-4 text-gray-700 leading-relaxed">
				Niniejsza Polityka Prywatności obowiązuje osoby korzystające ze Strony Internetowej znajdującej się pod adresem URL:
				http://mountainapartments.wa.profitroom.com i obowiązuje od 01.01.2025 . Administratorem danych użytkowników jest: JARMEX SPÓŁKA Z OGRANICZONĄ
				ODPOWIEDZIALNOŚCIĄ SPÓŁKA KOMANDYTOWA UL. MICIŃSKIEGO 13, 30-426 KRAKÓW NIP: 6793091927 KRS: 0000459495 (dalej jako &bdquo;My&rdquo;).
			</p>
			<h3 className="font-bold mt-6 mb-3 text-gray-800">§2. DANE OSOBOWE</h3>
			<p className="mb-4 text-gray-700 leading-relaxed">
				W związku z wdrożeniem wymogów rozporządzenia (UE) 2016/679 Parlamentu Europejskiego i Rady z dnia 27 kwietnia 2016r. w sprawie ochrony osób
				fizycznych w zakresie przetwarzania danych osobowych i swobodnego przepływu takich danych i uchylając dyrektywę 95/46 / WE (ogólne
				rozporządzenie w sprawie ochrony danych - zwane dalej &bdquo;RODO&rdquo;), informujemy, że:
			</p>
			<ul className="list-disc ml-6 mb-4 text-gray-700 leading-relaxed space-y-2">
				<li>
					Przetwarzamy dane w następujących celach: wykonanie umowy lub podjęcie działań na wniosek osoby, której dane dotyczą, przed zawarciem umowy
					(podstawa prawna: art. 6 ust. 1 lit. b RODO), obsługa zapytań (art. 6 ust. 1 lit. f RODO), rozpatrywanie skarg i reklamacji (art. 6 ust. 1
					lit. b RODO), przechowywanie dokumentacji i wypełnianie obowiązków prawnych spoczywających na Administratorze (art. 6 ust. 1 lit. c RODO),
					wysyłanie newslettera (art. 6 ust. 1 lit. a RODO), monitorowanie i poprawa jakości świadczonych usług – zapytanie o wypełnienie ankiety lub
					udzielenie odpowiedzi na kilka pytań dotyczącej jakości świadczonych usług (art. 6 ust. 1 lit. f RODO), wyświetlanie w sieciach
					społecznościowych spersonalizowanych informacji handlowych (aty. 6 ust. 1 lit. a RODO)
				</li>
				<li>
					Podanie danych jest dobrowolne, aczkolwiek niezbędne do skorzystania z usług. W przypadku wyrażania zgody to jest ona dobrowolna i wyrażona
					poprzez kliknięcie checkboxa zawierającego warunki udzielonej zgody.
				</li>
				<li>
					Jeżeli osoba wyraziła zgodę na przetwarzanie danych (podstawa prawna: art. 6 ust. 1 pkt. a RODO) to dane przetwarzane są do czasu cofnięcia
					zgody, ale po tym okresie mają prawo być archiwizowane informacje na temat tego kto i kiedy oraz jakiej zgody udzielił (na potrzeby
					ustalenia, dochodzenia lub obrony roszczeń prawnych). W pozostałych przypadkach dane są przetwarzane przez okres uzasadniony realizacją celu
					(np. realizacja umowy, udzielenie odpowiedzi na pytania, przepisy podatkowe itp.) Okres przetwarzania uzależniony jest od możliwości
					ustalenia, dochodzenia lub obrony roszczeń lub gdy retencja danych jest wymagana z uwagi na przepisy podatkowe.
				</li>
				<li>
					Zgodę można cofnąć w każdym czasie. Prosimy o kliknięcie w link, lub wysłanie e-maila na adres:{" "}
					<a href="mailto:apartamentymsc@gmail.com" className="text-blue-600 hover:text-blue-800 underline">
						apartamentymsc@gmail.com
					</a>
					.
				</li>
				<li>
					Każda osoba, której dane dotyczą ma prawo dostępu do danych osobowych, poprawiania, usuwania lub ograniczania ich przetwarzania, prawo do
					sprzeciwu, prawo do przekazywania danych, prawo do złożenia skargi do organu nadzorczego.
				</li>
				<li>Dane transakcyjne, w tym dane osobowe przekazywane są bezpośrednio przez użytkownika do dostawcy usług płatniczych.</li>
				<li>
					Osoby odwiedzające Stronę Internetową mogą wypełnić formularz i zapisać się na newsletter oraz podać adres e-mail lub/i numer telefonu
					będący podstawą automatycznego kontaktu.
				</li>
				<li>
					Osoby odwiedzające Stronę Internetową mogą wyrazić zgodę na prowadzenie przez Nas kampanii reklamowych w sieciach społecznościowych
					targetowanych na bazie adresu e-mail.
				</li>
			</ul>
			<h3 className="font-bold mt-4 mb-2">§3. ODBIORCY DANYCH</h3>
			<p className="mb-2">
				Korzystamy z usług firm programistycznych i utrzymujących systemy teleinformatyczne, z którymi mamy zawarte stosowne umowy. Umowy te obejmują
				zasady przetwarzania danych i poufność. Dane te nie są udostępniane i żadna z tych firm nie ma prawa przetwarzać danych w inny sposób niż
				określony w umowie. Twoje dane o ile firma ma do nich dostęp mogą być przetwarzane wyłącznie na potrzeby prawidłowego świadczenia usług.
			</p>
			<h3 className="font-bold mt-4 mb-2">§4. COOKIES</h3>
			<p className="mb-2">
				Cookies są przekazywane do przeglądarek internetowych i następnie są przechowywane w pamięci urządzeń i odczytywane przez serwer przy
				każdorazowym połączeniu ze Stroną Internetową. Zaznaczamy, że zapis cookies nie umożliwia Nam dostępu do Twojego prywatnego urządzenia ani
				odczytywania innych danych niż zapisane w cookies. Korzystamy z tzw. cookies technicznych, które umożliwiają prawidłowe wykorzystywanie
				transmisji komunikatu oraz zapamiętywanie Twoich ustawień i do tworzenia prostych statystyk Serwisu. Korzystamy z cookies i technologii do
				zbierania danych, które pomagają nam analizować ruch na Stronie Internetowej. Dzięki temu możemy optymalizować jej działanie, udoskonalać
				rozwiązania, które cieszą się największym zainteresowaniem oraz wyświetlać dedykowane wiadomości i oferty. Możesz wyrazić zgodę, nie wyrazić
				zgody, cofnąć ją lub zarządzać ustawieniami klikając tutaj. Korzystamy z następujących cookies:
			</p>
		</>
	),
	en: (
		<>
			<h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
			<h2 className="text-xl font-semibold mt-6 mb-2">Privacy Settings</h2>
			<h3 className="font-bold mt-4 mb-2">§1. GENERAL PROVISIONS</h3>
			<p className="mb-2">
				This Privacy Policy applies to users of the website at http://mountainapartments.wa.profitroom.com and is effective from 01.01.2025. The data
				controller is: JARMEX SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ SPÓŁKA KOMANDYTOWA, UL. MICIŃSKIEGO 13, 30-426 KRAKÓW, NIP: 6793091927, KRS:
				0000459495 (hereinafter referred to as &quot;We&quot;).
			</p>
			<h3 className="font-bold mt-4 mb-2">§2. PERSONAL DATA</h3>
			<p className="mb-2">
				In connection with the implementation of Regulation (EU) 2016/679 of the European Parliament and of the Council of 27 April 2016 on the
				protection of natural persons with regard to the processing of personal data and on the free movement of such data, and repealing Directive
				95/46/EC (General Data Protection Regulation - &quot;GDPR&quot;), we inform you that:
			</p>
			<ul className="list-disc ml-6 mb-2">
				<li>
					We process data for the following purposes: performance of a contract or taking action at the request of the data subject prior to entering
					into a contract (legal basis: Art. 6(1)(b) GDPR), handling inquiries (Art. 6(1)(f) GDPR), handling complaints (Art. 6(1)(b) GDPR), storing
					documentation and fulfilling legal obligations incumbent on the Controller (Art. 6(1)(c) GDPR), sending newsletters (Art. 6(1)(a) GDPR),
					monitoring and improving service quality – requesting completion of a survey or response to questions about service quality (Art. 6(1)(f)
					GDPR), displaying personalized commercial information on social networks (Art. 6(1)(a) GDPR).
				</li>
				<li>
					Providing data is voluntary but necessary to use the services. If consent is required, it is voluntary and given by checking a box
					containing the terms of the consent.
				</li>
				<li>
					If a person has given consent to data processing (legal basis: Art. 6(1)(a) GDPR), the data is processed until consent is withdrawn, but
					after that period, information about who, when, and what consent was given may be archived (for the purpose of establishing, pursuing, or
					defending legal claims). In other cases, data is processed for a period justified by the purpose (e.g., contract performance, responding to
					inquiries, tax regulations, etc.). The processing period depends on the possibility of establishing, pursuing, or defending claims or when
					data retention is required by tax regulations.
				</li>
				<li>
					Consent may be withdrawn at any time. Please click the link or send an email to:{" "}
					<a href="mailto:apartamentymsc@gmail.com" className="text-blue-600 hover:text-blue-800 underline">
						apartamentymsc@gmail.com
					</a>
					.
				</li>
				<li>
					Every data subject has the right to access, rectify, delete, or restrict the processing of their personal data, the right to object, the
					right to data portability, and the right to lodge a complaint with a supervisory authority.
				</li>
				<li>Transactional data, including personal data, is provided directly by the user to the payment service provider.</li>
				<li>
					Website visitors may fill out a form to subscribe to the newsletter and provide an email address and/or phone number as a basis for
					automatic contact.
				</li>
				<li>Website visitors may consent to us conducting advertising campaigns on social networks targeted based on their email address.</li>
			</ul>
			<h3 className="font-bold mt-4 mb-2">§3. DATA RECIPIENTS</h3>
			<p className="mb-2">
				We use the services of software companies and IT system maintainers with whom we have concluded appropriate agreements. These agreements cover
				data processing rules and confidentiality. This data is not shared, and none of these companies has the right to process data in any way other
				than specified in the agreement. Your data, if accessible to a company, may be processed only for the proper provision of services.
			</p>
			<h3 className="font-bold mt-4 mb-2">§4. COOKIES</h3>
			<p className="mb-2">
				Cookies are sent to web browsers and then stored in device memory and read by the server each time you connect to the Website. Please note that
				saving cookies does not allow us to access your private device or read any data other than that stored in cookies. We use so-called technical
				cookies, which enable the proper use of message transmission and remembering your settings, as well as creating simple service statistics. We
				use cookies and technologies to collect data that help us analyze traffic on the Website. This allows us to optimize its operation, improve
				solutions that are most popular, and display dedicated messages and offers. You can give, refuse, withdraw, or manage your consent by clicking
				here. We use the following cookies:
			</p>
		</>
	),
	de: (
		<>
			<h1 className="text-3xl font-bold mb-4">Datenschutzrichtlinie</h1>
			<h2 className="text-xl font-semibold mt-6 mb-2">Datenschutzeinstellungen</h2>
			<h3 className="font-bold mt-4 mb-2">§1. ALLGEMEINE BESTIMMUNGEN</h3>
			<p className="mb-2">
				Diese Datenschutzrichtlinie gilt für Nutzer der Website unter http://mountainapartments.wa.profitroom.com und ist ab dem 01.01.2025 gültig.
				Verantwortlicher für die Datenverarbeitung ist: JARMEX SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ SPÓŁKA KOMANDYTOWA, UL. MICIŃSKIEGO 13, 30-426
				KRAKÓW, NIP: 6793091927, KRS: 0000459495 (nachfolgend „Wir&quot; genannt).
			</p>
			<h3 className="font-bold mt-4 mb-2">§2. PERSONENBEZOGENE DATEN</h3>
			<p className="mb-2">
				Im Zusammenhang mit der Umsetzung der Verordnung (EU) 2016/679 des Europäischen Parlaments und des Rates vom 27. April 2016 zum Schutz
				natürlicher Personen bei der Verarbeitung personenbezogener Daten und zum freien Datenverkehr sowie zur Aufhebung der Richtlinie 95/46/EG
				(Datenschutz-Grundverordnung – „DSGVO&quot;) informieren wir Sie, dass:
			</p>
			<ul className="list-disc ml-6 mb-2">
				<li>
					Wir verarbeiten Daten zu folgenden Zwecken: Vertragserfüllung oder Durchführung von Maßnahmen auf Anfrage der betroffenen Person vor
					Vertragsabschluss (Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO), Bearbeitung von Anfragen (Art. 6 Abs. 1 lit. f DSGVO), Bearbeitung von
					Beschwerden (Art. 6 Abs. 1 lit. b DSGVO), Aufbewahrung von Unterlagen und Erfüllung gesetzlicher Pflichten des Verantwortlichen (Art. 6 Abs.
					1 lit. c DSGVO), Versand von Newslettern (Art. 6 Abs. 1 lit. a DSGVO), Überwachung und Verbesserung der Servicequalität – Befragung zur
					Servicequalität (Art. 6 Abs. 1 lit. f DSGVO), Anzeige personalisierter kommerzieller Informationen in sozialen Netzwerken (Art. 6 Abs. 1
					lit. a DSGVO).
				</li>
				<li>
					Die Angabe von Daten ist freiwillig, aber für die Nutzung der Dienste erforderlich. Ist eine Einwilligung erforderlich, erfolgt diese
					freiwillig durch Ankreuzen eines Kästchens mit den Bedingungen der Einwilligung.
				</li>
				<li>
					Wenn eine Person der Datenverarbeitung zugestimmt hat (Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO), werden die Daten bis zum Widerruf der
					Einwilligung verarbeitet, danach können jedoch Informationen darüber, wer, wann und welche Einwilligung erteilt hat, archiviert werden (zum
					Zweck der Geltendmachung, Ausübung oder Verteidigung von Rechtsansprüchen). In anderen Fällen werden die Daten für einen durch den Zweck
					gerechtfertigten Zeitraum verarbeitet (z. B. Vertragserfüllung, Beantwortung von Anfragen, steuerliche Vorschriften usw.). Die
					Verarbeitungsdauer hängt von der Möglichkeit der Geltendmachung, Ausübung oder Verteidigung von Ansprüchen oder von gesetzlichen
					Aufbewahrungspflichten ab.
				</li>
				<li>
					Die Einwilligung kann jederzeit widerrufen werden. Bitte klicken Sie auf den Link oder senden Sie eine E-Mail an:{" "}
					<a href="mailto:apartamentymsc@gmail.com" className="text-blue-600 hover:text-blue-800 underline">
						apartamentymsc@gmail.com
					</a>
					.
				</li>
				<li>
					Jede betroffene Person hat das Recht auf Auskunft, Berichtigung, Löschung oder Einschränkung der Verarbeitung ihrer personenbezogenen Daten,
					das Recht auf Widerspruch, das Recht auf Datenübertragbarkeit und das Recht, eine Beschwerde bei einer Aufsichtsbehörde einzureichen.
				</li>
				<li>Transaktionsdaten, einschließlich personenbezogener Daten, werden vom Nutzer direkt an den Zahlungsdienstleister übermittelt.</li>
				<li>
					Besucher der Website können ein Formular ausfüllen, um den Newsletter zu abonnieren, und eine E-Mail-Adresse und/oder Telefonnummer angeben,
					um automatisch kontaktiert zu werden.
				</li>
				<li>Besucher der Website können der Durchführung von Werbekampagnen in sozialen Netzwerken auf Basis ihrer E-Mail-Adresse zustimmen.</li>
			</ul>
			<h3 className="font-bold mt-4 mb-2">§3. DATENEMPFÄNGER</h3>
			<p className="mb-2">
				Wir nutzen die Dienste von Softwareunternehmen und IT-Systembetreibern, mit denen wir entsprechende Verträge abgeschlossen haben. Diese Verträge
				regeln die Datenverarbeitung und die Vertraulichkeit. Diese Daten werden nicht weitergegeben, und keines dieser Unternehmen ist berechtigt, die
				Daten anders als im Vertrag festgelegt zu verarbeiten. Ihre Daten dürfen, sofern ein Unternehmen darauf zugreifen kann, nur zur ordnungsgemäßen
				Erbringung der Dienstleistungen verarbeitet werden.
			</p>
			<h3 className="font-bold mt-4 mb-2">§4. COOKIES</h3>
			<p className="mb-2">
				Cookies werden an Webbrowser gesendet und anschließend im Gerätespeicher gespeichert und bei jeder Verbindung mit der Website vom Server
				ausgelesen. Bitte beachten Sie, dass das Speichern von Cookies uns keinen Zugriff auf Ihr privates Gerät oder das Auslesen anderer Daten als der
				in Cookies gespeicherten Daten ermöglicht. Wir verwenden sogenannte technische Cookies, die die ordnungsgemäße Nutzung der
				Nachrichtenübertragung und das Speichern Ihrer Einstellungen sowie die Erstellung einfacher Servicestatistiken ermöglichen. Wir verwenden
				Cookies und Technologien zur Datenerhebung, die uns helfen, den Datenverkehr auf der Website zu analysieren. Dadurch können wir deren Betrieb
				optimieren, die beliebtesten Lösungen verbessern und gezielte Nachrichten und Angebote anzeigen. Sie können Ihre Einwilligung erteilen,
				verweigern, widerrufen oder Ihre Einstellungen hier verwalten. Wir verwenden folgende Cookies:
			</p>
		</>
	),
	es: (
		<>
			<h1 className="text-3xl font-bold mb-4">Política de Privacidad</h1>
			<h2 className="text-xl font-semibold mt-6 mb-2">Configuración de Privacidad</h2>
			<h3 className="font-bold mt-4 mb-2">§1. DISPOSICIONES GENERALES</h3>
			<p className="mb-2">
				Esta Política de Privacidad se aplica a los usuarios del sitio web en http://mountainapartments.wa.profitroom.com y es válida desde el
				01.01.2025. El responsable del tratamiento de los datos es: JARMEX SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ SPÓŁKA KOMANDYTOWA, UL. MICIŃSKIEGO
				13, 30-426 KRAKÓW, NIP: 6793091927, KRS: 0000459495 (en adelante, &quot;Nosotros&quot;).
			</p>
			<h3 className="font-bold mt-4 mb-2">§2. DATOS PERSONALES</h3>
			<p className="mb-2">
				En relación con la implementación del Reglamento (UE) 2016/679 del Parlamento Europeo y del Consejo de 27 de abril de 2016 sobre la protección
				de las personas físicas en lo que respecta al tratamiento de datos personales y a la libre circulación de estos datos, y por el que se deroga la
				Directiva 95/46/CE (Reglamento General de Protección de Datos - &quot;RGPD&quot;), le informamos que:
			</p>
			<ul className="list-disc ml-6 mb-2">
				<li>
					Procesamos datos para los siguientes fines: ejecución de un contrato o adopción de medidas a petición del interesado antes de la celebración
					de un contrato (base legal: art. 6.1.b RGPD), gestión de consultas (art. 6.1.f RGPD), gestión de reclamaciones (art. 6.1.b RGPD),
					almacenamiento de documentación y cumplimiento de obligaciones legales del Responsable (art. 6.1.c RGPD), envío de boletines informativos
					(art. 6.1.a RGPD), supervisión y mejora de la calidad del servicio – solicitud de cumplimentación de encuestas o respuesta a preguntas sobre
					la calidad del servicio (art. 6.1.f RGPD), visualización de información comercial personalizada en redes sociales (art. 6.1.a RGPD).
				</li>
				<li>
					La facilitación de datos es voluntaria, pero necesaria para utilizar los servicios. Si se requiere consentimiento, este es voluntario y se
					otorga marcando una casilla que contiene las condiciones del consentimiento.
				</li>
				<li>
					Si una persona ha dado su consentimiento para el tratamiento de datos (base legal: art. 6.1.a RGPD), los datos se procesan hasta que se
					retire el consentimiento, pero después de ese período, la información sobre quién, cuándo y qué consentimiento se otorgó puede archivarse
					(con el fin de establecer, ejercer o defender reclamaciones legales). En otros casos, los datos se procesan durante un período justificado
					por el propósito (por ejemplo, ejecución del contrato, respuesta a consultas, normativa fiscal, etc.). El período de tratamiento depende de
					la posibilidad de establecer, ejercer o defender reclamaciones o cuando la retención de datos sea requerida por la normativa fiscal.
				</li>
				<li>
					El consentimiento puede retirarse en cualquier momento. Por favor, haga clic en el enlace o envíe un correo electrónico a:{" "}
					<a href="mailto:apartamentymsc@gmail.com" className="text-blue-600 hover:text-blue-800 underline">
						apartamentymsc@gmail.com
					</a>
					.
				</li>
				<li>
					Toda persona interesada tiene derecho a acceder, rectificar, suprimir o limitar el tratamiento de sus datos personales, derecho a oponerse,
					derecho a la portabilidad de los datos y derecho a presentar una reclamación ante una autoridad de control.
				</li>
				<li>
					Los datos transaccionales, incluidos los datos personales, son proporcionados directamente por el usuario al proveedor de servicios de pago.
				</li>
				<li>
					Los visitantes del sitio web pueden completar un formulario para suscribirse al boletín e indicar una dirección de correo electrónico y/o
					número de teléfono como base para el contacto automático.
				</li>
				<li>
					Los visitantes del sitio web pueden consentir que realicemos campañas publicitarias en redes sociales dirigidas en función de su dirección
					de correo electrónico.
				</li>
			</ul>
			<h3 className="font-bold mt-4 mb-2">§3. DESTINATARIOS DE LOS DATOS</h3>
			<p className="mb-2">
				Utilizamos los servicios de empresas de software y mantenedores de sistemas informáticos con los que hemos celebrado los acuerdos
				correspondientes. Estos acuerdos cubren las normas de tratamiento de datos y confidencialidad. Estos datos no se comparten y ninguna de estas
				empresas tiene derecho a tratar los datos de forma distinta a la especificada en el acuerdo. Sus datos, si una empresa tiene acceso a ellos,
				solo pueden ser tratados para la correcta prestación de los servicios.
			</p>
			<h3 className="font-bold mt-4 mb-2">§4. COOKIES</h3>
			<p className="mb-2">
				Las cookies se envían a los navegadores web y luego se almacenan en la memoria del dispositivo y son leídas por el servidor cada vez que se
				conecta al sitio web. Tenga en cuenta que guardar cookies no nos permite acceder a su dispositivo privado ni leer otros datos que no sean los
				almacenados en las cookies. Utilizamos las llamadas cookies técnicas, que permiten el uso adecuado de la transmisión de mensajes y recordar su
				configuración, así como crear estadísticas simples del servicio. Utilizamos cookies y tecnologías para recopilar datos que nos ayudan a analizar
				el tráfico en el sitio web. Esto nos permite optimizar su funcionamiento, mejorar las soluciones más populares y mostrar mensajes y ofertas
				dedicados. Puede dar, rechazar, retirar o gestionar su consentimiento haciendo clic aquí. Utilizamos las siguientes cookies:
			</p>
		</>
	),
}

export default async function PrivacyPage(props: { params: Promise<{ lang: Locale }> }) {
	const { params } = props
	const { lang } = await params
	const langKey: Locale = ["pl", "en", "de", "es"].includes(lang) ? (lang as Locale) : "pl"
	const dictionary = await getDictionary(langKey)
	return (
		<div className="min-h-screen bg-gradient-to-br from-[#e4d9c7] via-white to-[#f5f0eb]">
			{/* Modern Navigation */}
			<React.Suspense fallback={null}>
				<ModernNav dictionary={dictionary} lang={langKey} />
			</React.Suspense>
			{/* Main Content */}
			<main className="pt-24 pb-16">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
					{/* Hero Section with Title */}
					<div className="text-center mb-16">
						<div className="relative">
							<h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-[#cc9678] via-[#b8856a] to-[#a3745c] bg-clip-text text-transparent mb-8 leading-tight">
								{langKey === "pl"
									? "Polityka prywatności"
									: langKey === "en"
										? "Privacy Policy"
										: langKey === "de"
											? "Datenschutzrichtlinie"
											: "Política de Privacidad"}
							</h1>
						</div>
					</div>

					{/* Main Content Sections */}
					<div className="space-y-12">
						{/* Privacy Policy Content */}
						<section className="bg-white rounded-2xl shadow-lg p-8 md:p-12 border border-gray-100">
							<div className="text-gray-800">{content[langKey]}</div>
						</section>
					</div>
				</div>
			</main>
			{/* Footer */}
			<Footer lang={lang} />
		</div>
	)
}
