/** @format */

"use client"

import { Dictionary } from "../../types/dictionary"
import { Locale } from "../../i18n-config"
import ModernNav from "../homepage/components/ModernNav"
import Footer from "../homepage/components/Footer"
import React from "react"

type RegulaminPageClientProps = {
	dictionary: Dictionary
	lang: Locale
}

export default function RegulaminPageClient({ dictionary, lang }: RegulaminPageClientProps) {
	return (
		<div className="min-h-screen bg-white">
			{/* Navigation */}
			<React.Suspense fallback={null}>
				<ModernNav dictionary={dictionary} lang={lang as Locale} />
			</React.Suspense>

			{/* Main Content */}
			<main className="pt-20 pb-16">
				<div className="container mx-auto px-4 max-w-4xl">
					<h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">{"Regulamin"}</h1>

					<div className="text-black whitespace-pre-wrap">
						{`
REGULAMIN KORZYSTANIA Z APARTAMENTÓW MSCAPARTMENTS
I. WSTĘP
1. Regulamin określa warunki rezerwacji i najmu Apartamentów zamieszczonych na stronie www.mscapartments.pl, apartamenty-zakopane-msc.pl, apartamentyzakopane oraz w portalach rezerwacyjnych. Dokonanie rezerwacji stanowi jednocześnie zawarcie Umowy Najmu Apartamentu pomiędzy Właścicielem konkretnie wybranego apartamentu/ów a Gościem, na warunkach określonych w regulaminie. Mscapartments to znak firmy Sidorowicz Mariusz Firma Handlowo Usługowa MSC z siedzibą w Zakopanem, ul. Chłabówka 29, 34-500, NIP: 6272559931.

II. REZERWACJE I PŁATNOŚCI
1. W momencie dokonania rezerwacji przez Gościa Mscapartments pobiera depozyt 500 zł, który zostaje zwrócony w przypadku opłacenia pobytu w całości po zakończeniu pobytu i zwrocie wynajętego mieszkania/ań w stanie niepogorszonym bez zniszczeń.

2. Klient dokonuje wyboru metody gwarancji swojej rezerwacji na konkretnej stronie i akceptuje regulamin. Dostępne metody wpłaty depozytu to PRZELEW, KARTA PŁATNICZA, BLIK, PRZELEW BLIK, VOUCHER.

PRZYJMUJEMY PŁATNOŚCI W KRYPTOWALUTACH TAKICH JAK BITCOIN, ETHEREUM, USDT ORAZ INNYCH. W CELU OTRZYMANIA INSTRUKCJI NALEŻY OTRZYMAĆ WCZEŚNIEJ ZGODĘ NA PŁATNOŚĆ KRYPTOWALUTĄ PRZED DOKONANIEM REZERWACJI.

UWAGA!!!
Prosimy pamiętać, że każda płatność kryptowalutami za usługi tworzy obowiązek podatkowy, jeśli wcześniej nie opłacono podatku od kryptowaluty, w momencie opłacenia usługi należy to zrobić.
Firma przyjmująca płatność również płaci podatek od przyjęcia płatności w kryptowalucie. Transakcja na firmowy portfel kryptowalut jest zapisana w blockchainie gdzie przedstawia adres płacącego oraz adres opłacanego. Koszt transakcji opłaca zlecający przelew kryptowalutowy, dokładną ilość wymaganej wpłaty podaje MSCAPARTMENTS.

3. W przypadku rezerwacji zaczynającej się tego samego dnia co data rezerwacji, niezbędne jest opłacenie pobytu oraz depozytu przed wydaniem kluczy do mieszkania. Nie przyjmujemy potwierdzeń przelewów od klientów wszystkich Klientów. Dostępne dla wszystkich metody potwierdzenia rezerwacji to PRZELEW NATYCHMIASTOWY, ZWYKŁY (jeśli pieniądze zostaną zaksięgowane przed wydaniem kluczy do apartamentu), PRZELEW NATYCHMIASTOWY BLIK, PŁATNOŚĆ KARTĄ, VOUCHER, PRZELEW BLIK NA TELEFON ORAZ PŁATNOŚCI KRYPTOWALUTAMI JEŚLI KRYPTOWALUTY ZOSTANĄ ZAKSIĘGOWANE W BLOCKCHAINIE PRZED WYDANIEM KLUCZY.

4. Opłata za przygotowanie mieszkania to w zależności od apartamentu 40 – 170 zł.

5. Odbiór kluczy w zależności od wybranego apartamentu odbywa się przez wydanie kodu do sejfu, wydanie kodu do klamki elektronicznej lub przez fizyczne wydanie klucza na miejscu. Metoda różni się a szczegóły wysyłane są po opłaceniu pobytu i depozytu.

6. Jeśli Klient po rezerwacji chce dokonać w niej zmian, musi skontaktować się drogą elektroniczną na adres apartamentymsc@gmail.com lub rezerwacje@mscapartments.pl.

7. Skrócenie pobytu może skutkować utratą wpłaconej kwoty za niewykorzystane dni.

8. Dzieci do lat 3 śpiące z rodzicami na łóżkach znajdujących się w apartamencie mają pobyt bezpłatny.

III. USŁUGA WYNAJMU APARTAMENTU
1. Cena wynajmu uwzględnia wszystkie podatki i opłaty dodatkowe, oprócz sprzątania, i kosztów pralni (40 – 170 zł)

2. Miejsce postojowe może być zagwarantowane, koszt określa formularz rezerwacji przed jej dokonaniem, zazwyczaj jest ono bezpłatne.

3. Doba hotelowa trwa od godziny 15:00 w dniu przyjazdu, do 11:00 w dniu wyjazdu. W przypadku wykupienia usługi przedłużenia pobytu lub wcześniejszego zakwaterowania udostępnia się Gościom zmianę powyższych godzin zgodnie z ustaleniami indywidualnymi.

4. Jeśli klient stwarza zagrożenie lub jest pod wpływem substancji odurzających, napojów alkoholowych, MSCAPARTMENTS zastrzega sobie prawo do nie wydania kluczy oraz zatrzymania środków za pobyt i/lub za depozyt.

IV) ODPOWIEDZIALNOŚĆ GOŚCIA
1. W mieszkaniu nie można organizować imprez, spotkań towarzyskich, w szczególności wieczorów panieńskich/ kawalerskich. Gość odpowiada za wyposażenie mieszkania oraz za zachowanie współ-gości, z którymi wynajmuje mieszkanie.

2. Podczas rezerwacji zgłasza się ilość osób, które jednocześnie mogą przebywać w mieszkaniu. W przypadku przekroczenia tej liczby grozi kara pozbawienia depozytu.

3. Cisza nocna obowiązuje od 22.00 do 7.00

4. W mieszkaniu obowiązują podobne zasady co w blokach mieszkalnych, zobowiązujące do poszanowania prywatności innych lokatorów, zasady współżycia społecznego, które gwarantują spokojne współistnienie.

5. Kaucja ma na celu zabezpieczenie roszczeń MSCAPARTMENTS w przypadku ewentualnych zniszczeń. Mieszkanie jest sprawdzane przez Gościa w dniu zameldowania oraz przez serwis sprzątający po wymeldowaniu, kaucja jest zwracana do 7 dni. W przypadku zastrzeżeń podczas oględzin w dniu zameldowania Gość koniecznie musi je od razu zgłosić, ma na to pierwsze 10h od przekazania możliwości wejścia.

6. Na terenie obiektu nie można palić papierosów, w tym elektronicznych, ani korzystać z używek, w szczególności zabronionych prawem. W przypadku nie zastosowania się do zakazu GOŚĆ ZOSTANIE OBCIĄŻONY KOSZTEM 1000 zł.

7. W przypadku powstania szkody, lub wypadku GOŚĆ koniecznie musi niezwłocznie powiadomić MSCAPARTMENTS.

8. W mieszkaniach nie można zmieniać wystroju i rozmieszczenia mebli.

9. Zagubienie kluczy powoduje obciążenie kwotą do 500 zł.

V) AWARIE
1. Zobowiązujemy się do usuwania na bieżąco wszystkich usterek, chyba że ich charakter to uniemożliwi. Wszelkie awarie niezależne od MSCAPARTMENTS nie są podstawą do anulacji pobytu.

VI) SIŁA WYŻSZA
1. W sytuacji wystąpienia niemożliwych do przewidzenia okoliczności, których skutków nie można natychmiast zlikwidować zwyczajowymi środkami MSCAPARTMENTS zastrzega sobie prawo do zaproponowania Gościowi pobytu w innym obiekcie będącym w dyspozycji MSCAPARTMENTS. W przypadku wystąpienia zjawisk mających charakter siły wyższej MSCAPARTMENTS ma prawo odstąpić od Umowy. Dotyczy to również przypadków, w których bezpieczeństwo osobiste Gościa lub jego majątku, nie będzie mogło być zagwarantowane z powodów niezależnych od MSCAPARTMENTS. Kwoty wpłacone przez Klienta podlegają natychmiastowemu zwrotowi, z potrąceniem kwot należnych za usługi już wyświadczone.

VII) REKLAMACJE
1. W razie zaistnienia nieprawidłowości Gość ma prawo do złożenia reklamacji w terminie 14 dni od ich wystąpienia i przesłanie uwag na email: apartamentymsc@gmail.com

2. Rozpatrzenie reklamacji następuje w terminie 30 dni od jej otrzymania. Odpowiedź zostanie wysłana drogą elektroniczną

3. MSCAPARTMENTS nie ponosi odpowiedzialności za niedogodności i utrudnienia powstałe podczas pobytu i związane z pracami budowlanymi lub remontowymi, które mogą być prowadzone na terenie nieruchomości, w której znajduje się apartament oraz przerwaniem, z przyczyn niezależnych od MSCAPARTMENTS dostaw mediów – prądu, wody, Internetu.

VIII) POSTANOWIENIA KOŃCOWE
1. Dokonując rezerwacji w MSCAPARTMENTS telefonicznie, mailowo, za pośrednictwem stron, gdziekolwiek znajduje się nasza oferta Gość wyraża zgodę na przetwarzanie Jego danych osobowych poprzez umieszczenie ich w bazie danych Firmy. Dane będą przetwarzane wyłącznie w celu realizacji rezerwacji, ułatwienia dokonania kolejnych rezerwacji oraz celach marketingowych zgodnie z przepisami ustawy z dnia 29.08.1997 r. o Ochronie danych osobowych.

2. Rozstrzyganie sporów. Prawem właściwym dla sporów pomiędzy Sidorowicz Mariusz FHU MSC a Gościem jest prawo polskie. Spory rozstrzygane będą przez sąd właściwy dla siedziby MSCAPARTMENTS

`}
					</div>
				</div>
			</main>

			{/* Footer */}
			<Footer lang={lang} />
		</div>
	)
}
