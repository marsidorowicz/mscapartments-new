/** @format */

import { Section } from "../Section"

type FeaturesProps = {
	home: {
		features: {
			title: string
			items: readonly {
				title: string
				description: string
			}[]
		}
	}
}

export default function FeaturesSection({ home }: FeaturesProps) {
	return (
		<Section
			id="features"
			className="bg-gray-100 text-gray-800 text-[8px] sm:text-sm md:text-base lg:text-lg xl:text-xl"
		>
			<div className="max-w-6xl mx-auto">
				<h2 className="text-4xl font-bold mb-12 text-center">
					{home.features.title}
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					{home.features.items.map((feature, index) => (
						<div
							key={index}
							className="bg-white p-6 rounded-lg shadow-md"
						>
							<h3 className="text-xl font-bold mb-3">
								{feature.title}
							</h3>
							<p>{feature.description}</p>
						</div>
					))}
				</div>
			</div>
		</Section>
	)
}
