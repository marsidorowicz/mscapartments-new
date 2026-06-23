/** @format */
"use client"

import { Property } from "@/types"
import { Dictionary } from "../../../../../types/dictionary"
import { Locale } from "../../../../../i18n-config"
// import BookNowButton from "@/app/[lang]/components/BookNowButton"
import DateRangeCalendar from "@/app/[lang]/components/rev13/DateRangeCalendar"
import PropertyMap from "./PropertyMap"
import ModernNav from "../../../../homepage/components/ModernNav"
import ImageGallery from "./ImageGallery"
import PeopleIcon from "@mui/icons-material/People"
import BedIcon from "@mui/icons-material/Bed"
import { useState } from "react"
import BookingHeader from "../../../../components/BookingHeader"
import { NotificationComponent } from "@/app/[lang]/components/rev13/Notification"
import { useSelector } from "react-redux"
import { RootState } from "@/state/store"
import { useLocalStorageNew } from "@/utilities/hooks/useLocalStorage"
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import { useRouter } from "next/navigation"

type BasketItem = {
	id: string | number
	name: string
	location?: string
	totalPrice: number
	currency?: string
	dateRange?: string | null
}

type PropertyDetailsProps = {
	property: Property
	dictionary: Dictionary
	lang: Locale
}

const translations = {
	pl: {
		totalPrice: "Cena całkowita",
		from: "od",
		night: "noc",
		additionalFees: "Dodatkowe opłaty",
		bookNow: "Zarezerwuj",
		closeMenu: "Zamknij",
		reservationButton: "Rezerwuj",
	},
	en: {
		totalPrice: "Total Price",
		from: "from",
		night: "night",
		additionalFees: "Additional Fees",
		bookNow: "Book Now",
		closeMenu: "Close",
		reservationButton: "Book",
	},
	de: {
		totalPrice: "Gesamtpreis",
		from: "ab",
		night: "Nacht",
		additionalFees: "Zusätzliche Gebühren",
		bookNow: "Jetzt buchen",
		closeMenu: "Schließen",
		reservationButton: "Buchen",
	},
	es: {
		totalPrice: "Precio total",
		from: "desde",
		night: "noche",
		additionalFees: "Tarifas adicionales",
		bookNow: "Reservar",
		closeMenu: "Cerrar",
		reservationButton: "Reservar",
	},
}

export default function PropertyDetails({ property, dictionary, lang }: PropertyDetailsProps) {
	const [isExpanded, setIsExpanded] = useState(false)
	const state = useSelector((state: RootState) => state.root)
	const router = useRouter()

	const totalPrice = state?.filters?.totalPrice ?? null
	const startDate = state?.filters?.startDate ?? null
	const endDate = state?.filters?.endDate ?? null
	const dateRangeParam = startDate && endDate ? `${startDate}_${endDate}` : null
	const translation = translations[lang as keyof typeof translations] || translations.pl

	const [basketItems, setBasketItems] = useLocalStorageNew<BasketItem[]>("rootBasket", [])
	const isInBasket = basketItems.some((item) => item.id?.toString() === property.id?.toString())

	// Calculate pricing
	const minPrice = (property as Property & { extended?: { minPrice?: number } }).extended?.minPrice ?? 0
	const basePrice =
		property.lastMinuteOfferActive && minPrice > 0 && property.lastMinuteDiscountPercentage && property.lastMinuteDiscountPercentage > 0
			? minPrice / (1 - property.lastMinuteDiscountPercentage / 100)
			: minPrice
	const finalPrice = Math.max(minPrice, basePrice * (1 - (property.lastMinuteDiscountPercentage || 0) / 100))
	const hasPrice = minPrice > 0

	const handleAddToBasket = (e?: React.MouseEvent) => {
		if (e) {
			e.stopPropagation()
			e.preventDefault()
		}

		if (isInBasket) {
			if (typeof window !== "undefined") {
				window.dispatchEvent(new Event("open-basket"))
			}
			return
		}

		if (!dateRangeParam) {
			// Alert user to select date range?
			alert(dictionary.apartments?.dateRangeRequired || "Please select date range first")
			return
		}

		const item: BasketItem = {
			id: property.id,
			name: property.name,
			location: property.location,
			totalPrice: totalPrice && totalPrice > 0 ? totalPrice : finalPrice,
			dateRange: dateRangeParam,
			currency: "PLN",
		}

		setBasketItems((prev) => {
			const exists = prev.some((i) => i.id?.toString() === item.id?.toString())
			if (exists) return prev
			return [...prev, item]
		})

		if (typeof window !== "undefined") {
			window.dispatchEvent(new Event("open-basket"))
		}
	}
	return (
		<div className="min-h-screen relative pb-32 md:pb-10">
			{/* Beautiful Background */}
			<div className="absolute inset-0">
				<div className="absolute inset-0 bg-white"></div>
				<div className="absolute inset-0 bg-white/20 backdrop-blur-[1px]"></div>
			</div>
			{/* Content */}
			<div className="relative z-10">
				{/* Modern Navigation */}
				{!isExpanded && <ModernNav dictionary={dictionary} lang={lang} />}
				{/* Full-width image slider */}
				<div className="w-full overflow-hidden ">
					<ImageGallery property={property} className="h-[46vh] w-full" dictionary={dictionary} />
				</div>
				{/* Main Content */}
				<div className="max-w-7xl mx-auto px-1 sm:px-2 lg:px-5 py-2 mt-3">
					{" "}
					{/* Header */}
					<div className="flex flex-col md:flex-row md:justify-between w-full">
						<div className="mb-1 text-left md:w-1/2 xl:w-2/3">
							{/* Place Name - Updated to #cc9678 colors */}
							<h1
								className="px-2 py-2 text-2xl md:text-5xl text-gray-800 mb-3 drop-shadow-sm"
								style={{ fontFamily: "Resort-SansLight, sans-serif" }}>
								<span>{property?.place?.name.toUpperCase()}</span>
								{", "}
								<span>{property?.name.toUpperCase()}</span>
							</h1>
						</div>
						{/* Side book button on md+ */}

						<div
							className={` bottom-0 left-0 right-0 bg-white p-1 hidden md:block z-30 ${isExpanded ? "top-0 h-screen md:fixed md:w-screen hidden md:block overflow-y-auto" : ""}`}>
							{" "}
							<BookingHeader
								color="#1D2430"
								totalPrice={totalPrice}
								minPrice={minPrice}
								hasTotalPrice={Boolean(totalPrice)}
								cleaningFee={property.cleaningFee || 0}
								parkingFee={property.parkingFee || 0}
								isExpanded={isExpanded}
								onToggleExpanded={() => setIsExpanded((prev) => !prev)}
								showDatePicker={!isExpanded}
								showPriceFrom={true}
								showBookButton={false}
								onAddToBasket={handleAddToBasket}
								isInBasket={isInBasket}
								disableAddToBasket={!dateRangeParam}
								showReservationPageButton={isInBasket}
							/>
						</div>
					</div>
					<div className="text-gray-500 flex flex-col md:flex-row md:items-center md:gap-4 text-sm">
						<div className="flex text-xl md:flex-row md:items-center md:gap-4">
							{/* Occupancy Badge */}
							<div className="flex justify-center px-2 py-2 space-x-1">
								<PeopleIcon className="w-5 h-5 text-gray-600" />
								<span className=" text-xl ">{property.maxOccupancy}</span>
							</div>

							{/* Beds Badge */}
							<div className="flex justify-center px-2 py-2 space-x-1">
								<BedIcon className="w-5 h-5 text-gray-600" />
								<span className=" text-xl">{property.numSingleBeds + property.numDoubleBeds}</span>
							</div>

							{/* Size Badge */}
							{property.size && (
								<div className="flex flex-row px-2 py-2 space-x-1">
									<div className="flex items center align-bottom">
										<svg className="flex w-5 h-5 font-bold text-black align-middle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
											/>
										</svg>
									</div>
									<span className="flex text-xl ">{property.size + "m²"}</span>
								</div>
							)}
						</div>
						<div className="px-2 py-2 text-xl md:text-2xl whitespace-normal break-words text-gray-500 ">{property?.location}</div>
					</div>
					<hr className="border-t border-gray-300 my-4" />
					{/*Amenities*/}
					{property.filters && property.filters.length > 0 && (
						<div className="mb-6 pl-1">
							<h2 className="text-lg  text-gray-900 mb-3">{dictionary.apartments?.onSiteTitle?.toUpperCase() || "What you'll find on site"}</h2>
							<div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2">
								{property.filters.map((filter) => (
									<span key={filter} className="px-3 py-1 bg-[#feede3] text-black rounded-full text-sm">
										{dictionary.filters?.filters?.[filter] || filter.replace(/_/g, " ").toLowerCase()}
									</span>
								))}
							</div>
						</div>
					)}{" "}
					{/* Property Description (HTML Details) */}
					{property.htmlDetails && (
						<div className="mt-8 bg-white/95 backdrop-blur-sm r border border-white/40 pl-1">
							<h2 className="text-lg  text-gray-900 mb-3">{dictionary.apartments?.moreAboutPlaceTitle || "More about the place "}</h2>
							<div
								className="prose prose-lg max-w-none text-gray-700 p-1 md:p-4"
								dangerouslySetInnerHTML={{
									__html: property.htmlDetails,
								}}
							/>
						</div>
					)}
					<div className="space-y-8">
						<div>
							{/* Availability Calendar */}
							<div className="mt-8 pl-1">
								<h2 className="text-lg  text-gray-900 mb-3">{dictionary.calendar.title?.toUpperCase() || "Property Calendar"}</h2>

								<DateRangeCalendar propertyId={property.id?.toString() || null} locale={lang} monthsToShow={3} />
							</div>
							{/* Property Map */}
							<div className="mt-8 pl-1">
								<h2 className="text-lg  text-gray-900 mb-3">{dictionary.apartments?.location?.toUpperCase() || "Property Calendar"}</h2>

								<PropertyMap property={property} dictionary={dictionary} />
							</div>
						</div>{" "}
						{/* Property Info Sidebar */}
						<div>
							<div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/40">
								{/* Pricing */}
								<div className="mb-6 pb-3 ">
									{hasPrice ? (
										property.lastMinuteOfferActive ? (
											<div className="flex flex-col gap-2">
												<div className="flex items-center gap-3">
													<span className="text-sm text-gray-600">{dictionary?.apartments?.from || "from"}</span>
													<span className="text-3xl font-bold text-green-600">PLN {finalPrice.toFixed(0)}</span>
													<span className="text-lg text-gray-500 line-through">PLN {basePrice.toFixed(0)}</span>
												</div>{" "}
												<span className="text-sm text-green-600 font-medium">
													{dictionary.apartments?.lastMinuteOfferText || "Last minute offer"} -{" "}
													{property.lastMinuteDiscountPercentage}
													{dictionary.apartments?.percentOff || "% off!"}
												</span>
											</div>
										) : (
											<div className="flex items-center gap-3">
												<span className="text-sm text-gray-600">{dictionary?.apartments?.from || "from"}</span>
												<span className="text-3xl font-bold text-gray-800">PLN {basePrice.toFixed(0)}</span>
											</div>
										)
									) : (
										<span className="text-3xl font-bold text-gray-500">{dictionary.apartments?.priceOnRequest || "Price on request"}</span>
									)}
									{hasPrice && <span className="text-gray-500 ml-2">/ {dictionary.apartments?.night || "night"}</span>}
								</div>{" "}
								{/* Additional Fees */}
								{(property.cleaningFee > 0 || property.parkingQuantity > 0 || property.localTax > 0) && (
									<div className="border-t border-gray-200 pt-6">
										<h3 className="text-lg font-semibold text-gray-900 mb-4">
											{dictionary.apartments?.additionalFees || "Additional Fees"}
										</h3>
										<div className="space-y-3">
											{property.cleaningFee > 0 && (
												<div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
													<span className="text-gray-700 font-medium">{dictionary.apartments?.serviceFee || "Service fee"}</span>
													<span className="font-bold text-gray-900">{property.cleaningFee} PLN</span>
												</div>
											)}{" "}
											{property.parkingQuantity > 0 && (
												<div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
													<span className="text-gray-700 font-medium">
														{property.filters.includes("PRIVATE_GARAGE")
															? dictionary.apartments?.garageFee || "Garage"
															: dictionary.apartments?.parkingFee || "Parking"}
													</span>
													<span className={`font-bold ${property.parkingFee === 0 ? "text-green-600" : "text-gray-900"}`}>
														{property.parkingFee === 0
															? dictionary.apartments?.free || "Free"
															: `${property.parkingFee} PLN/${dictionary.apartments?.night || "night"}`}
													</span>
												</div>
											)}
											{property.localTax > 0 && (
												<div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
													<span className="text-gray-700 font-medium">{dictionary.apartments?.localTax || "Local tax"}</span>
													<span className="font-bold text-gray-900">{property.localTax} PLN</span>
												</div>
											)}
										</div>
									</div>
								)}
							</div>
						</div>
					</div>{" "}
					{/* Mobile Bottom Bar */}
					<div
						className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 p-1 z-30 ${isExpanded ? "top-0 h-screen md:hidden overflow-y-auto" : ""}`}>
						<div className="flex p-1 ">
							<div className="text-left w-2/3 md:flex md:flex-row md:space-x-2">
								<div className="text-md font-semibold text-gray-800 ">
									{totalPrice ? dictionary.apartments?.totalPrice || "Total Price" : dictionary.apartments?.from || "from"}{" "}
									<span className="text-2xl font-bold text-green-600">PLN {totalPrice ? totalPrice.toFixed(0) : minPrice}</span>{" "}
									{totalPrice ? "" : dictionary.apartments?.night || "night"}
								</div>
								<div className="text-sm text-gray-600 mt-1">
									{"+ " + (dictionary.apartments?.additionalFees || "Additional Fees")}:{" "}
									{/* {(property.cleaningFee || 0) + (property.parkingFee || 0)} PLN{" "} */}
								</div>
							</div>
							<div className="flex text-right items-center justify-end w-1/3 gap-2">
								<button
									onClick={handleAddToBasket}
									disabled={!dateRangeParam}
									className={`inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white text-gray-700 transition-colors duration-200 px-3 py-[6px] shadow-sm hover:bg-gray-100 ${!dateRangeParam ? "opacity-50 cursor-not-allowed" : ""}`}>
									{isInBasket ? (
										<>
											<CheckCircleIcon className="h-5 w-5 text-green-600" />
											{/* <ShoppingBasketIcon className="h-5 w-5 text-gray-700" /> */}
										</>
									) : (
										<AddShoppingCartIcon className="h-5 w-5" />
									)}
								</button>
								{isInBasket && (
									<button
										className="bg-[#cc9678] w-full text-white font-semibold py-2 px-4 rounded md:w-auto hover:bg-[#b88569] transition-colors"
										onClick={() => router.push(`/${lang}/rezerwacja`)}>
										{translation.reservationButton}
									</button>
								)}
							</div>
						</div>

						{/* {isExpanded && (
							<div className="mt-4 md:hidden">
								{" "}
								<ReservationEngine
									id={"clok0rd6f0000kkdgyf1pd0t3"}
									propertyId={property.id}
									// propertyName={propertyName}
									// booking={booking}
									filterDictionary={dictionary.filters}
									dictionary={dictionary}
									onThemeChange={() => ({})}
								/>
							</div>
						)} */}
					</div>
				</div>
			</div>{" "}
			{/* Close Content */}
			<NotificationComponent />
		</div>
	)
}
