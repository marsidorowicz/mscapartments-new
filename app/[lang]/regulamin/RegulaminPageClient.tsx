/** @format */

"use client"

import { Dictionary } from "../../types/dictionary"
import { Locale } from "../../i18n-config"
import ModernNav from "../homepage/components/ModernNav"
import Footer from "../homepage/components/Footer"

type RegulaminPageClientProps = {
	dictionary: Dictionary
	lang: Locale
}

export default function RegulaminPageClient({ dictionary, lang }: RegulaminPageClientProps) {
	return (
		<div className="min-h-screen bg-white">
			{/* Navigation */}
			<ModernNav dictionary={dictionary} lang={lang} />

			{/* Main Content */}
			<main className="pt-20 pb-16">
				<div className="container mx-auto px-4 max-w-4xl">
					<h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">{"Regulamin"}</h1>

					<div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
						<section className="mb-8">
							<h2 className="text-2xl font-semibold text-gray-800 mb-4">{"1. Wprowadzenie"}</h2>
							<p>
								{
									"Niniejszy Regulamin określa warunki, na których można dokonać rezerwacji i wynajmu apartamentów, a dokonanie rezerwacji jest jednoznaczne z zaakceptowaniem postanowień Regulaminu. Mountain Apartments zastrzega sobie Prawo odmowy przyjęcia rezerwacji."
								}
							</p>
						</section>

						<section className="mb-8">
							<h2 className="text-2xl font-semibold text-gray-800 mb-4">{"2. Rezerwacja zadatkowa"}</h2>
							<p>
								{
									"Rezerwacji zadatkowej obiektu dokonuje się poprzez wypełnienie i przesłanie formularza rezerwacyjnego zamieszczonego na stronie internetowej www.mountainapartments.pl. Rezerwacja zadatkowa wymaga wpłaty zadatku 30% wartości rezerwacji. Zadatek, zależnie od wybranej podczas rezerwacji formy płatności, może być wpłacony przy użyciu karty kredytowej, przelewu on-line lub na podane w e-mail."
								}
							</p>

							<h3 className="text-xl font-medium text-gray-800 mb-2 mt-4">{"a) Karta kredytowa"}</h3>
							<p>
								{
									"W przypadku płatności kartą kredytową, zadatek należy wpłacić przy użyciu systemu płatności dotpay. Brak dokonania przelewu kartą kredytową spowoduje anulowanie rezerwacji. Wpłacony zadatek nie podlega zwrotowi. Po otrzymaniu zadatku zostanie przesłany klientowi e-mail z potwierdzeniem jego otrzymania a wraz z nim elektroniczny voucher ze wszystkimi danymi koniecznymi do realizacji pobytu. W dniu rozpoczęcia pobytu klient jest zobowiązany zapłacić pozostałą kwotę za rezerwację Rezydentowi."
								}
							</p>

							<h3 className="text-xl font-medium text-gray-800 mb-2 mt-4">{"b) Przelew on-line"}</h3>
							<p>
								{
									"W przypadku wpłaty zadatku przelewem on-line, zadatek należy wpłacić przy użyciu systemu płatności dotpay. Brak dokonania przelewu spowoduje anulowanie rezerwacji."
								}
							</p>

							<h3 className="text-xl font-medium text-gray-800 mb-2 mt-4">{"c) Przelew Bankowy"}</h3>
							<p>
								{
									"W przypadku wpłaty na konto bankowe, w automatycznie wysyłanym e-mailu zatwierdzającym rezerwację zadatkową zostaną zawarte dane konta bankowego, na które należy wpłacić zadatek w ciągu 72 godzin od momentu złożenia rezerwacji. Po wpłaceniu zadatku należy potwierdzenie przelewu przesłać na adres e-mail: "
								}
								<a href="mailto:biuro@mountainapartments.pl" className="text-blue-600 hover:text-blue-800 underline">
									biuro@mountainapartments.pl
								</a>
								{
									". Wpłacony zadatek nie podlega zwrotowi. Po otrzymaniu zadatku zostanie przesłany klientowi e-mail z potwierdzeniem jego otrzymania, a wraz z nim elektroniczny voucher ze wszystkimi danymi koniecznymi do realizacji pobytu. W dniu rozpoczęcia pobytu klient jest zobowiązany zapłacić pozostałą kwotę za rezerwację osobie odpowiedzialnej za przekazanie kluczy."
								}
							</p>

							<h3 className="text-xl font-medium text-gray-800 mb-2 mt-4">{"d) Tokenizacja karty kredytowej/debetowej"}</h3>
							<p>
								{
									"Mountain Apartments zastrzega sobie prawo do tokenizacji karty kredytowej lub debetowej podanej podczas dokonywania rezerwacji. Tokenizacja pozwala na bezpieczne przechowywanie danych karty w systemie płatności bez możliwości ich odczytania. W przypadku przedłużenia pobytu lub konieczności obciążenia karty z tytułu kaucji zwrotnej na poczet ewentualnych szkód, Mountain Apartments może skorzystać z tokenizowanych danych karty do automatycznego obciążenia karty kwotą odpowiadającą dodatkowym kosztom. Klient zostanie poinformowany o każdym obciążeniu karty z wyprzedzeniem, z wyjątkiem przypadków, gdy obciążenie wynika z preautoryzacji kaucji na poczet szkód stwierdzonych podczas odbioru apartamentu."
								}
							</p>
						</section>

						<section className="mb-8">
							<h2 className="text-2xl font-semibold text-gray-800 mb-4">{"3. Zakres umowy najmu"}</h2>
							<p>
								{
									"Umowa zawarta pomiędzy Mountain Apartments a klientem obejmuje tylko i wyłącznie wynajem obiektu. Dojazd, wyżywienie oraz organizacja czasu pobytu leżą w gestii klienta. Szczegóły ceny są podane w zestawieniu cenowym przed zatwierdzeniem rezerwacji. W cenę wynajmu wliczone są już opłaty za media oraz opłata serwisowa w kwocie 220 PLN. Mountain Apartments nie będzie pobierał żadnych innych opłat dodatkowych ponad te, które zostały wskazane na stronie internetowej danego obiektu, z wyjątkiem opłaty miejscowej w kwocie 2 lub 3 PLN za każdy dzień pobytu."
								}
							</p>
						</section>

						<section className="mb-8">
							<h2 className="text-2xl font-semibold text-gray-800 mb-4">{"4. Kaucja na czas pobytu"}</h2>
							<p>
								{
									"Mountain Apartments zastrzega sobie prawo do pobrania zwrotnej kaucji w kwocie 300 PLN . Kaucja pobierana jest na poczet szkód stwierdzonych przez Rezydentkę podczas odbioru apartamentu po pobycie ."
								}
							</p>
						</section>

						<section className="mb-8">
							<h2 className="text-2xl font-semibold text-gray-800 mb-4">{"5. Przyjazd, przekazanie kluczy, wyjazd."}</h2>
							<p>
								{
									"Przyjazd powinien nastąpić w godzinach ustalonych z Rezydentem odpowiedzialny za przekazanie kluczy . Klient zobowiązany jest do poinformowania tej osoby najpóźniej dzień przed przyjazdem o planowanej godzinie odbioru kluczy. Standardowo można wprowadzić się od godz. 16.00 w dniu przyjazdu i należy wyprowadzić się do godz. 11.00 w dniu wyjazdu, chyba że inaczej uzgodniono z Rezydentem. W przypadku braku możliwości dotarcia na umówioną wcześniej godzinę klient zobowiązany jest do natychmiastowego powiadomienia telefonicznie Rezydenta. Przyjazd i wyjazd w godzinach nocnych 22 - 6 rano dodatkowo płatny 100 PLN"
								}
							</p>
						</section>

						<section className="mb-8">
							<h2 className="text-2xl font-semibold text-gray-800 mb-4">{"6. Obowiązki klienta"}</h2>
							<p>
								{
									"Liczba osób mających zamieszkać w obiekcie jest ograniczona do podanej na voucherze. Klient zobowiązany jest do poinformowania telefonicznego lub mailowego Mountain Apartments o jakiejkolwiek zmianie tej liczby. Jeśli liczba ta przekroczy liczbę osób podaną na voucherze, osoba odpowiedzialna za klucze może odmówić wydania kluczy do obiektu. Klient zobowiązany jest do dbania o zachowanie zasad dobrego sąsiedztwa i utrzymywania obiektu w stanie zastanym."
								}
							</p>
							<p className="mt-4">
								{
									"Do obowiązków klienta należy również pozostawienie umytych naczyń i sprzętów kuchennych przed wyjazdem. Wcześniejszy, nieuzgodniony wyjazd Klienta bez przekazania apartamentu przy udziale przedstawiciela naszej firmy, może spowodować roszczenia ze strony tej firmy."
								}
							</p>
							<p className="mt-4">
								{
									"Klient zobowiązany jest do natychmiastowego poinformowania osoby odpowiedzialnej za przekazanie kluczy o ewentualnych uszkodzeniach i brakach zastanych w obiekcie oraz do zgłoszenia szkód wyrządzonych przez siebie podczas pobytu. Równowartość tych szkód i ich usunięcia pokrywa"
								}
							</p>
						</section>

						<section className="mb-8">
							<h2 className="text-2xl font-semibold text-gray-800 mb-4">{"7. Zmiany w rezerwacji"}</h2>

							<h3 className="text-xl font-medium text-gray-800 mb-2 mt-4">{"a) Zmiana terminu pobytu"}</h3>
							<p>
								{
									"Po dokonaniu wpłaty zadatku jego zwrot nie przysługuje. Istnieje natomiast możliwość zmiany terminu rezerwacji po wpłacie zadatku pod warunkiem, że zmiana taka zostanie dokonana na minimum 14 dni przed pierwotnym terminem rezerwacji i dany apartament jest wolny w nowym terminie. Zmiany można dokonać jedynie z zachowaniem pierwotnej kwoty. W przypadku wybrania nowego terminu przypadającego w droższym sezonie wymagana jest dopłata różnicy w cenie. Zmiany terminu rezerwacji należy anulować pierwotną rezerwację poprzez wysłanie maila na adres recepcja@mountainapartments.pl z podaniem nowego terminu z zachowaniem pobytu w tym samym apartamencie."
								}
							</p>

							<h3 className="text-xl font-medium text-gray-800 mb-2 mt-4">{"b) Przedłużenie pobytu"}</h3>
							<p>
								{
									"Termin pobytu w danym obiekcie można przedłużyć w przypadku gdy apartament jest wolny. W przypadku przedłużenia pobytu, klient zobowiązany jest zgłosić fakt ten Rezydentowi."
								}
							</p>

							<h3 className="text-xl font-medium text-gray-800 mb-2 mt-4">{"c) Zmiana liczby osób"}</h3>
							<p>
								{
									"Liczba osób podana na voucherze może zostać zmieniona. W przypadku zmiany liczby osób, klient zobowiązany jest do poinformowania firmy Mountain Apartments telefonicznie lub mailowo i dopłaty różnicy w cenie."
								}
							</p>

							<h3 className="text-xl font-medium text-gray-800 mb-2 mt-4">{"d)"}</h3>
							<p>
								{
									"Mountain Apartments zastrzega sobie prawo do zmiany zarezerwowanego apartamentu na inny o podobnym standardzie z zachowaniem pierwotnej kwoty rezerwacji. W przypadku kiedy, apartament będzie tańszy w zarezerwowanym terminie Moutain Apartments zwróci różnicę w cenie wynajmu, wynikającą z cennika zamieszczonego na stronie www.mountainapartments.pl"
								}
							</p>
						</section>

						<section className="mb-8">
							<h2 className="text-2xl font-semibold text-gray-800 mb-4">{"8. Przeniesienie praw i obowiązków klienta na inną osobę"}</h2>
							<p>
								{
									"W każdej chwili klient może przenieść na inną osobę wszystkie przysługujące mu z tytułu rezerwacji uprawnienia, jeżeli jednocześnie osoba ta przejmuje wszystkie wynikające z tej rezerwacji obowiązki. W takiej sytuacji należy niezwłocznie powiadomić Mountain Apartments a o zmianie rezerwującego podając dane personalne osoby, która przejmie prawa i obowiązki wynikające z umowy."
								}
							</p>
						</section>

						<section className="mb-8">
							<h2 className="text-2xl font-semibold text-gray-800 mb-4">{"9. Bezpłatny pobyt dziecka"}</h2>
							<p>
								{
									'Dziecko do lat 3 śpiące z dorosłymi lub we własnym łóżeczku nie ponosi żadnych opłat za pobyt. Kwota za łóżeczko to 50 zł /pobyt.Podczas dokonywania rezerwacji należy w formularzu wybrać liczbę osób nie uwzględniając takiego dziecka, a jedynie w polu "Uwagi" należy podać jego wiek. Pozostałe dzieci płacą normalną cenę.'
								}
							</p>
						</section>

						<section className="mb-8">
							<h2 className="text-2xl font-semibold text-gray-800 mb-4">{"10. Wystąpienie siły wyższej"}</h2>
							<p>
								{
									"W przypadku wystąpienia niemożliwych do przewidzenia okoliczności, których skutków nie można natychmiast zlikwidować zwyczajnymi środkami, Mountain Apartments rezerwuje sobie prawo zaproponowania klientowi obiektu zastępczego podobnego do obiektu pierwotnie zarezerwowanego. Mountain Apartments ma prawo, w przypadku wystąpienia zjawisk mających charakter siły wyższej anulować umowę. Dotyczy to również przypadków, w których bezpieczeństwo osobiste klienta lub jego majątku, z powodów niezależnych od Mountain Apartments, nie będzie mogło być zagwarantowane. Kwoty wpłacone przez klienta podlegają natychmiastowemu zwrotowi, z potrąceniem kwot należnych za usługi już wyświadczone."
								}
							</p>
						</section>

						<section className="mb-8">
							<h2 className="text-2xl font-semibold text-gray-800 mb-4">{"11. Ochrona danych osobowych"}</h2>
							<p>
								{
									"Dokonując rezerwacji na stronie internetowej mountainapartments.pl, Rezerwujący wyraża zgodę na umieszczenie jego danych osobowych w bazie danych serwisu mountainapartments.pl oraz firm dotpay odpowiedzialnej za sam proces płatności on-line. Dane będą przetwarzane wyłącznie w celu realizacji rezerwacji, ułatwienia dokonywania kolejnych rezerwacji oraz w celach marketingowych zgodnie z przepisami ustawy z dnia 29.08.1997 r. o ochronie danych osobowych. Rezerwującemu przysługuje prawo wglądu do swoich danych osobowych i ich aktualizacji."
								}
							</p>
						</section>

						<section className="mb-8">
							<h2 className="text-2xl font-semibold text-gray-800 mb-4">{"12. Prawo do zmiany rezerwacji z powodu błędów"}</h2>
							<p>
								{
									"Mountain Apartments zastrzega sobie prawo do zmiany rezerwacji, ich anulacji w przypadku wykrycia nieprawidłowych cen i błędów w wyniku ale nie tylko, nieprawidłowego działania kodów rabatowych, systemu rezerwacji lub systemu płatności. Klient ma prawo do otrzymania zwrotu wpłaconej zaliczki lub jej wykorzystania na przyszłe rezerwacje."
								}
							</p>
						</section>

						<section className="mb-8">
							<h2 className="text-2xl font-semibold text-gray-800 mb-4">{"13. Postanowienia końcowe"}</h2>
							<p>
								{
									"Prawem właściwym dla sporów pomiędzy właścicielem a klientem jest prawo polskie. Spory rozstrzygane będą przez Sąd właściwy dla siedziby Mountain Apartments."
								}
							</p>
						</section>
					</div>
				</div>
			</main>

			{/* Footer */}
			<Footer lang={lang} />
		</div>
	)
}
