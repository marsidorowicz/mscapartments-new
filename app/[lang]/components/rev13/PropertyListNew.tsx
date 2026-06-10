/** @format */
"use client"
import React from "react"
import ModernApartmentTile from "../../apartamenty/components/ModernApartmentTile"
import { Dictionary } from "../../../types/dictionary"
import { Locale } from "../../../i18n-config"
import { Property } from "@/types"

export interface ReservationForProperty extends Property {
	selected: boolean
	filters: string[]
	totalPrice: number
	imageUrl: string
	guestsAssigned: number
	localTaxSum: number
	parkingQuantity: number
	minStay: number
	maxStay: number
	currency?: string
	petsQuantity: number
	petFee: number
	petsAllowed: boolean
	petsMax: number
	petsPrice: number
	breakfastQuantity: number
	breakfastFee: number
	breakfastAllowed: boolean
	babyCribQuantity: number
	babyCribFee: number
	babyCribAllowed: boolean
	babyBedLinen: boolean
	babyBedLinenQuantity: number
	price: number
	available: boolean
}

interface PropertyListProps {
	properties: ReservationForProperty[] | null
	guests: number
	numberOfNights: number
	locale?: "en" | "pl" | "it" | "de" | "es"
	selectedFilters?: string[]
	matchingFiltersLabel?: string
	otherPropertiesLabel?: string
	filterTranslations?: Record<string, string>
	dictionary?: Dictionary
	lang: Locale
}

const PropertyList: React.FC<PropertyListProps> = ({ properties, dictionary, lang }) => {
	if (!properties || properties.length === 0) {
		return <div className="p-4 text-center text-gray-500">No properties found</div>
	}

	// For now, just display all properties
	// You can add filtering logic here later if needed
	const propertiesToDisplay = properties

	const renderProperty = (property: ReservationForProperty) => {
		// The property already extends Property, so it should work directly with ModernApartmentTile
		return (
			<div key={property.id} className="transition-all duration-700 ease-out translate-y-0 opacity-100 scale-100">
				<ModernApartmentTile property={property} dictionary={dictionary || ({} as Dictionary)} lang={lang} />
			</div>
		)
	}

	return (
		<div className="p-1 overflow-auto">
			{propertiesToDisplay.length > 0 && (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 px-0 sm:px-7 lg:px-9 w-full">
					{propertiesToDisplay.map(renderProperty)}
				</div>
			)}
		</div>
	)
}

export default PropertyList
