/** @format */

export default function MountainApartmentsSchema() {
	const schema = {
		"@context": "https://schema.org",
		"@graph": [
			{
				"@type": "Organization",
				"@id": "https://mountainapartments.pl/#brand",
				name: "JARMEX spółka z ograniczoną odpowiedzialnością sp. k.",
				legalName: "JARMEX spółka z ograniczoną odpowiedzialnością sp. k.",
				url: "https://mountainapartments.pl",
				taxID: "6793091927",
				identifier: "KRS 0000459495",
				telephone: "+48 511 000 660",
				email: "biuro@mountainapartments.pl",
				address: {
					"@type": "PostalAddress",
					streetAddress: "ul. Micińskiego 13",
					addressLocality: "Kraków",
					addressCountry: "PL",
				},
			},
			{
				"@type": "LodgingBusiness",
				"@id": "https://mountainapartments.pl/#lodging",
				name: "Mountain Apartments",
				url: "https://mountainapartments.pl",
				telephone: "+48 511 000 660",
				email: "biuro@mountainapartments.pl",
				description: "Apartamenty w Zakopanem i okolicach dla 2–7 osób z dostępem do basenu, sauny i jacuzzi. Komfortowe noclegi z WiFi i parkingiem.",
				areaServed: {
					"@type": "Place",
					name: "Zakopane, Kościelisko, Tatry",
				},
				occupancy: {
					"@type": "QuantitativeValue",
					minValue: 2,
					maxValue: 7,
					unitText: "persons",
				},
				amenityFeature: [
					{
						"@type": "LocationFeatureSpecification",
						name: "WiFi",
						value: true,
					},
					{
						"@type": "LocationFeatureSpecification",
						name: "Parking",
						value: true,
					},
					{
						"@type": "LocationFeatureSpecification",
						name: "Swimming Pool",
						value: true,
					},
					{
						"@type": "LocationFeatureSpecification",
						name: "Sauna",
						value: true,
					},
					{
						"@type": "LocationFeatureSpecification",
						name: "Jacuzzi",
						value: true,
					},
				],
				aggregateRating: {
					"@type": "AggregateRating",
					ratingValue: "4.8",
					reviewCount: "120",
				},
				brand: {
					"@id": "https://mountainapartments.pl/#brand",
				},
			},
		],
	}

	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
}
