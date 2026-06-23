/** @format */

export default function MscapartmentsSchema() {
	const schema = {
		"@context": "https://schema.org",
		"@graph": [
			{
				"@type": "Organization",
				"@id": "https://mscapartments.pl/#brand",
				name: "Cyberwealth.pro sp. z o.o.",
				legalName: "Cyberwealth.pro sp. z o.o.",
				url: "https://mscapartments.pl",
				taxID: "6793091927",
				identifier: "KRS 0001176671",
				telephone: "+48 515 857 609",
				email: "contact@cyberwealth.pro",
				address: {
					"@type": "PostalAddress",
					streetAddress: "ul. Micińskiego 13",
					addressLocality: "Kraków",
					addressCountry: "PL",
				},
			},
			{
				"@type": "LodgingBusiness",
				"@id": "https://mscapartments.pl/#lodging",
				name: "MSC Apartments",
				url: "https://mscapartments.pl",
				telephone: "+48 515 857 609",
				email: "contact@cyberwealth.pro",
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
					"@id": "https://mscapartments.pl",
				},
			},
		],
	}

	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
}
