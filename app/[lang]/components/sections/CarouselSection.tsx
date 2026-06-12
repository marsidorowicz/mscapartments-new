/** @format */

import { Section } from "../Section"
import ApartmentCarousel from "../ApartmentCarousel"
import { ApartmentsDictionary, Dictionary } from "../../../types/dictionary"

type AboutProps = {
	dictionary: {
		apartments: ApartmentsDictionary
		filters: Dictionary["filters"]
	}
}

export default function CarouselSection({ dictionary }: AboutProps) {
	// Add null safety check
	if (!dictionary || !dictionary.apartments) {
		return (
			<Section id="about" className="bg-[#e4d9c7] text-gray-800">
				<div className="max-w-[90%] mx-auto">
					<div className="text-center">Loading apartments...</div>
				</div>
			</Section>
		)
	}

	return (
		<Section
			id="about"
			className="bg-[#f5f0eb] text-gray-800 flex-col justify-center"
			// bgImage="/images/tlo2.jpeg"
		>
			<div className="z-10 relative w-full max-w-none px-2 sm:px-4">
				{/* <h2 className="text-4xl font-bold mb-8 text-center">
					{home.title}
				</h2> */}
				{/* <p className="text-lg mb-8 text-center max-w-4xl mx-auto">
					{home.description}
				</p> */}
				{/* Apartment Carousel */}
				<div className="w-full mb-4 sm:mb-6 md:mb-8 relative overflow-hidden rounded-lg bg-gradient-to-r from-[#cc9678] via-[#b8856a] to-[#a3745c] p-4 sm:p-6 md:p-8 shadow-lg">
					<ApartmentCarousel title="Discover Our MSC Apartments" dictionary={dictionary} />
				</div>
			</div>

			{/* Filter Button */}
		</Section>
	)
}
