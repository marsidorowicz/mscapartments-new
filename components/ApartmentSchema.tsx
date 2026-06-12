/** @format */

interface Property {
	id: string
	name: string
	type?: string
	location?: string
	htmlDetails?: string
	images?: string[]
	coordinates?: {
		lat: number
		lng: number
	}
	bedrooms?: number
	maxOccupancy?: number
	area?: number
	wifi?: boolean
	parking?: boolean
	pool?: boolean
	sauna?: boolean
	jacuzzi?: boolean
	balcony?: boolean
	terrace?: boolean
	rating?: number
	reviewCount?: number
	priceRange?: string
	petsAllowed?: boolean
	smokingAllowed?: boolean
}

interface ApartmentSchemaProps {
	property: Property
	lang: string
}

export default function ApartmentSchema({ property, lang }: ApartmentSchemaProps) {
	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mscapartments.pl"

	// Build the apartment schema
	const schema = {
		"@context": "https://schema.org",
		"@type": "Apartment",
		"@id": `${baseUrl}/${lang}/property/${property.id}#apartment`,
		name: property.name,
		description: property.htmlDetails
			? property.htmlDetails.replace(/<[^>]*>/g, "").substring(0, 500)
			: `Beautiful ${property.type} in ${property.location} for ${property.maxOccupancy} guests`,
		url: `${baseUrl}/${lang}/property/${property.id}`,
		image:
			property.images && property.images.length > 0
				? property.images.map((img: string) => `${baseUrl}${img}`)
				: [`${baseUrl}/images/apartment-default-small.jpg`],
		address: {
			"@type": "PostalAddress",
			addressLocality: property.location || "Zakopane",
			addressCountry: "PL",
		},
		geo: property.coordinates
			? {
					"@type": "GeoCoordinates",
					latitude: property.coordinates.lat,
					longitude: property.coordinates.lng,
				}
			: undefined,
		numberOfRooms: property.bedrooms || 1,
		occupancy: {
			"@type": "QuantitativeValue",
			minValue: 1,
			maxValue: property.maxOccupancy || 4,
			unitText: "persons",
		},
		floorSize: property.area
			? {
					"@type": "QuantitativeValue",
					value: property.area,
					unitText: "m²",
				}
			: undefined,
		amenityFeature: [
			...(property.wifi
				? [
						{
							"@type": "LocationFeatureSpecification",
							name: "WiFi",
							value: true,
						},
					]
				: []),
			...(property.parking
				? [
						{
							"@type": "LocationFeatureSpecification",
							name: "Parking",
							value: true,
						},
					]
				: []),
			...(property.pool
				? [
						{
							"@type": "LocationFeatureSpecification",
							name: "Swimming Pool",
							value: true,
						},
					]
				: []),
			...(property.sauna
				? [
						{
							"@type": "LocationFeatureSpecification",
							name: "Sauna",
							value: true,
						},
					]
				: []),
			...(property.jacuzzi
				? [
						{
							"@type": "LocationFeatureSpecification",
							name: "Jacuzzi",
							value: true,
						},
					]
				: []),
			...(property.balcony
				? [
						{
							"@type": "LocationFeatureSpecification",
							name: "Balcony",
							value: true,
						},
					]
				: []),
			...(property.terrace
				? [
						{
							"@type": "LocationFeatureSpecification",
							name: "Terrace",
							value: true,
						},
					]
				: []),
		].filter(Boolean),
		provider: {
			"@type": "Organization",
			"@id": "https://mscapartments.pl/#brand",
			name: "MSC Apartments",
			url: "https://mscapartments.pl",
			telephone: "+48 515 857 609",
			email: "apartamentymsc@gmail.com",
		},
		aggregateRating: property.rating
			? {
					"@type": "AggregateRating",
					ratingValue: property.rating,
					reviewCount: property.reviewCount || 1,
				}
			: undefined,
		priceRange: property.priceRange || "$$",
		petsAllowed: property.petsAllowed || false,
		smokingAllowed: property.smokingAllowed || false,
	}

	// Remove undefined properties
	Object.keys(schema).forEach((key) => {
		if (schema[key as keyof typeof schema] === undefined) {
			delete schema[key as keyof typeof schema]
		}
	})

	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
}
