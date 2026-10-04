/** @format */

import prisma from "@/prisma/prisma"

export interface AIPropertyDetails {
	id: number
	name: string
	location: string
	placeName?: string | null
	city?: string | null
	country?: string | null
	size?: number | null
	minOccupancy: number
	maxOccupancy: number
	numSingleBeds: number
	numDoubleBeds: number
	totalBeds: number
	amenities: string[]
	description?: string | null
	checkInTime?: string | null
	checkOutTime?: string | null
	parking?: string
	images: { id: number; path: string }[]
}

const AMENITY_LABELS: Record<string, string> = {
	SAUNA: "sauna",
	SWIMMING_POOL: "swimming pool",
	BALCONY: "balcony",
	WIFI: "Wi-Fi",
	AIR_CONDITIONING: "air conditioning",
	PET_FRIENDLY: "pet friendly",
	KITCHEN: "kitchen",
	WASHING_MACHINE: "washing machine",
	PARKING: "parking",
	TV: "TV",
	DISHWASHER: "dishwasher",
	HEATING: "heating",
	ELEVATOR: "elevator",
	SEA_VIEW: "sea view",
	MOUNTAIN_VIEW: "mountain view",
	GARDEN: "garden",
	BBQ: "BBQ/garden grill",
	TERRACE: "terrace",
	WHEELCHAIR_ACCESSIBLE: "wheelchair accessible",
	JACUZZI: "jacuzzi",
	BATHROOM_WITH_BATHTUB: "bathroom with bathtub",
	COFFEE_TEA_SET: "coffee/tea making set",
	LOUNGE_AREA: "lounge area",
	VACUUM_CLEANER: "vacuum cleaner",
	IRON_IRONING_BOARD: "iron and ironing board",
	ELECTRIC_KETTLE: "electric kettle",
	REFRIGERATOR: "refrigerator",
	MICROWAVE: "microwave",
	KITCHEN_UTENSILS: "kitchen utensils",
	TOWELS: "towels",
	HAIR_DRYER: "hair dryer",
	WARDROBE: "wardrobe",
	COFFEE_MACHINE: "coffee machine",
	TOILET: "toilet",
	UPSTAIRS_BEDROOM: "upstairs bedroom",
	KITCHENETTE: "kitchenette",
	COOKTOP: "cooktop",
	OVEN: "oven",
	BATHROOM_WITH_SHOWER: "bathroom with shower",
	SAFE: "safe",
	PRIVATE_GARAGE: "private garage",
	PLAYGROUND: "playground",
	PLAYROOM: "playroom",
	MEZZANINE: "mezzanine",
	BUNK_BED: "bunk bed",
	FITNESS_ROOM: "fitness room",
	TOASTER: "toaster",
	ELECTRIC_FIREPLACE: "electric fireplace",
	CABLE_CHANNELS: "cable channels",
	FREEZER: "freezer",
	FIREPLACE: "fireplace",
	DESK: "desk",
	PLAYSTATION: "PlayStation",
	GROUND_FLOOR: "ground floor",
}

export async function getPropertyDetails(input: {
	propertyId: number
	scope?: { brandId?: number }
}): Promise<{
	success: boolean
	property?: AIPropertyDetails
	message?: string
}> {
	const { propertyId, scope } = input

	if (!propertyId || isNaN(propertyId)) {
		return { success: false, message: "A valid numeric propertyId is required." }
	}

	try {
		const property = await prisma.property.findFirst({
			where: {
				id: propertyId,
				...(scope?.brandId ? { brandId: scope.brandId } : {}),
			},
			include: {
				images: { orderBy: { order: "asc" } },
				place: true,
				city: { include: { country: true } },
			},
		})

		if (!property) {
			return { success: false, message: `Property with id ${propertyId} was not found.` }
		}

		const amenities = (property.filters || [])
			.map(filter => AMENITY_LABELS[filter] || filter.toLowerCase().replace(/_/g, " "))
			.filter(Boolean)

		const totalBeds = property.numSingleBeds + property.numDoubleBeds

		// Short plain-text excerpt so the tool output stays small
		const descriptionText = property.htmlDetails
			? property.htmlDetails
					.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
					.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
					.replace(/<[^>]+>/g, " ")
					.replace(/\s+/g, " ")
					.trim()
			: null
		const description = descriptionText ? descriptionText.slice(0, 800) : null

		const parking =
			property.parkingFee > 0
				? `${property.parkingFee} PLN per parking spot (${property.parkingQuantity} spot(s))`
				: property.parkingQuantity > 0
					? `free parking (${property.parkingQuantity} spot(s))`
					: "no parking info"

		return {
			success: true,
			property: {
				id: property.id,
				name: property.name,
				location: property.location,
				placeName: property.place?.name,
				city: property.city?.name,
				country: property.city?.country?.name,
				size: property.size,
				minOccupancy: property.minOccupancy,
				maxOccupancy: property.maxOccupancy,
				numSingleBeds: property.numSingleBeds,
				numDoubleBeds: property.numDoubleBeds,
				totalBeds,
				amenities,
				description,
				checkInTime: property.checkinInstructionTime,
				checkOutTime: property.checkoutInstructionTime,
				parking,
				images: property.images.map(image => ({
					id: image.id,
					path: image.path,
				})),
			},
		}
	} catch (error) {
		console.error("getPropertyDetails error:", error)
		return { success: false, message: "Failed to fetch property details." }
	}
}