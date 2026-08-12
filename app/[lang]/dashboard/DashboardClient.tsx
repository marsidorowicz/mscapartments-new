"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Dictionary } from "@/app/types/dictionary"
import { Locale } from "@/app/i18n-config"
import ModernNav from "../homepage/components/ModernNav"
import Link from "next/link"
import { format, differenceInCalendarDays } from "date-fns"

type DashboardEvent = {
	id: number
	startDate: string
	endDate: string
	price: number | null
	deposit: string
	propertyName: string
}

const labels: Record<string, Record<string, string>> = {
	pl: {
		myReservations: "Moje rezerwacje",
		startDate: "Data przyjazdu",
		endDate: "Data wyjazdu",
		propertyName: "Apartament",
		price: "Cena",
		deposit: "Zaliczka",
		noReservations: "Brak rezerwacji",
		loading: "Ładowanie...",
		signInRequired: "Zaloguj się, aby zobaczyć rezerwacje",
		totalReservations: "Łącznie rezerwacji",
		totalNights: "Pokojonocy",
		totalSpent: "Łączna kwota",
		upcoming: "Nadchodzące",
		current: "Trwające",
		past: "Zakończone",
	},
	en: {
		myReservations: "My reservations",
		startDate: "Check-in",
		endDate: "Check-out",
		propertyName: "Property",
		price: "Price",
		deposit: "Deposit",
		noReservations: "No reservations",
		loading: "Loading...",
		signInRequired: "Sign in to view your reservations",
		totalReservations: "Total reservations",
		totalNights: "Room nights",
		totalSpent: "Total spent",
		upcoming: "Upcoming",
		current: "Current",
		past: "Past",
	},
	de: {
		myReservations: "Meine Buchungen",
		startDate: "Anreise",
		endDate: "Abreise",
		propertyName: "Unterkunft",
		price: "Preis",
		deposit: "Anzahlung",
		noReservations: "Keine Buchungen",
		loading: "Wird geladen...",
		signInRequired: "Melden Sie sich an, um Ihre Buchungen zu sehen",
		totalReservations: "Buchungen gesamt",
		totalNights: "Übernachtungen",
		totalSpent: "Gesamtausgaben",
		upcoming: "Bevorstehend",
		current: "Laufend",
		past: "Vergangen",
	},
	es: {
		myReservations: "Mis reservas",
		startDate: "Entrada",
		endDate: "Salida",
		propertyName: "Apartamento",
		price: "Precio",
		deposit: "Depósito",
		noReservations: "Sin reservas",
		loading: "Cargando...",
		signInRequired: "Inicie sesión para ver sus reservas",
		totalReservations: "Reservas totales",
		totalNights: "Noches",
		totalSpent: "Gasto total",
		upcoming: "Próximas",
		current: "Actuales",
		past: "Pasadas",
	},
}

type Props = {
	dictionary: Dictionary
	lang: Locale
}

export default function DashboardClient({ dictionary, lang }: Props) {
	const { data: session } = useSession()
	const [events, setEvents] = useState<DashboardEvent[]>([])
	const [loading, setLoading] = useState(true)
	const t = labels[lang] || labels.en

	useEffect(() => {
		if (!session?.user?.email) {
			setLoading(false)
			return
		}

		fetch(`/api/event/by-email?email=${encodeURIComponent(session.user.email)}`)
			.then((r) => r.json())
			.then((data) => {
				setEvents(data.events || [])
				setLoading(false)
			})
			.catch(() => setLoading(false))
	}, [session])

	const today = new Date()
	today.setHours(0, 0, 0, 0)

	const upcoming = events.filter((e) => new Date(e.startDate) > today)
	const current = events.filter((e) => new Date(e.startDate) <= today && new Date(e.endDate) >= today)
	const past = events.filter((e) => new Date(e.endDate) < today)

	const totalNights = events.reduce((sum, e) => {
		const days = differenceInCalendarDays(new Date(e.endDate), new Date(e.startDate))
		return sum + Math.max(days, 0)
	}, 0)

	const totalSpent = events.reduce((sum, e) => sum + (e.price ?? 0), 0)

	return (
		<div className="min-h-screen bg-gray-50">
			<ModernNav dictionary={dictionary} lang={lang} />
			<div className="max-w-5xl mx-auto px-4 py-10">
				<h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>

				<div className="flex gap-1 mb-6 border-b border-gray-200">
					<button className="px-5 py-3 text-sm font-semibold border-gray-900 text-gray-900 bg-white border-b-2 rounded-t-lg">
						{t.myReservations}
					</button>
				</div>

				{!session ? (
					<div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
						<p className="text-gray-500 text-lg">{t.signInRequired}</p>
						<Link
							href={`/${lang}/login`}
							className="mt-4 inline-block bg-gray-900 text-white font-semibold py-2 px-6 rounded-xl hover:bg-gray-800 transition-colors">
							{dictionary.login?.signIn || "Sign In"}
						</Link>
					</div>
				) : loading ? (
					<div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
						<p className="text-gray-500">{t.loading}</p>
					</div>
				) : (
					<>
						{events.length > 0 && (
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
								<div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
									<p className="text-sm text-gray-500 mb-1">{t.totalReservations}</p>
									<p className="text-3xl font-bold text-gray-900">{events.length}</p>
								</div>
								<div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
									<p className="text-sm text-gray-500 mb-1">{t.totalNights}</p>
									<p className="text-3xl font-bold text-gray-900">{totalNights}</p>
								</div>
								<div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
									<p className="text-sm text-gray-500 mb-1">{t.totalSpent}</p>
									<p className="text-3xl font-bold text-gray-900">{totalSpent.toFixed(2)} PLN</p>
								</div>
							</div>
						)}

						{events.length === 0 ? (
							<div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
								<p className="text-gray-500 text-lg">{t.noReservations}</p>
							</div>
						) : (
							<div className="space-y-8">
								{[{ key: "upcoming", items: upcoming }, { key: "current", items: current }, { key: "past", items: past }].map(
									(section) =>
										section.items.length > 0 && (
											<div key={section.key}>
												<h3 className="text-lg font-semibold text-gray-900 mb-3">{t[section.key]}</h3>
												<div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
													<div className="overflow-x-auto">
														<table className="w-full text-sm">
															<thead>
																<tr className="bg-gray-50 border-b border-gray-200">
																	<th className="text-left px-4 py-3 font-semibold text-gray-700">{t.startDate}</th>
																	<th className="text-left px-4 py-3 font-semibold text-gray-700">{t.endDate}</th>
																	<th className="text-left px-4 py-3 font-semibold text-gray-700">{t.propertyName}</th>
																	<th className="text-right px-4 py-3 font-semibold text-gray-700">{t.price}</th>
																	<th className="text-right px-4 py-3 font-semibold text-gray-700">{t.deposit}</th>
																</tr>
															</thead>
															<tbody>
																{section.items.map((ev: DashboardEvent) => (
																	<tr key={ev.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
																		<td className="px-4 py-3 text-gray-900">{format(new Date(ev.startDate), "dd.MM.yyyy")}</td>
																		<td className="px-4 py-3 text-gray-900">{format(new Date(ev.endDate), "dd.MM.yyyy")}</td>
																		<td className="px-4 py-3 text-gray-900">{ev.propertyName}</td>
																		<td className="px-4 py-3 text-right text-gray-900">{ev.price != null ? `${ev.price.toFixed(2)} PLN` : "—"}</td>
																		<td className="px-4 py-3 text-right text-gray-900">{ev.deposit ? `${ev.deposit} PLN` : "—"}</td>
																	</tr>
																))}
															</tbody>
														</table>
													</div>
												</div>
											</div>
										),
								)}
							</div>
						)}
					</>
				)}
			</div>
		</div>
	)
}
