/** @format */

"use client"

import { Place } from "@/types"
import { Dictionary } from "../../../../types/dictionary"

type PlaceMapProps = {
	place: Place
	dictionary: Dictionary
}

export default function PlaceMap({ place, dictionary }: PlaceMapProps) {
	const mapCode = (place as Place & { extended?: { mapCode?: string } })?.extended?.mapCode

	if (!mapCode) {
		return null
	}

	return (
		<div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/40">
			<h2 className="text-2xl font-bold text-gray-900 mb-4">{dictionary.apartments?.location || "Location"}</h2>
			<p className="text-gray-700 mb-4">{dictionary.apartments?.viewOnMap || "View the property location on the map below."}</p>
			<div className="w-full h-96 rounded-lg overflow-hidden">
				<div
					className="w-full h-full"
					dangerouslySetInnerHTML={{
						__html: mapCode.replace("<iframe", '<iframe style="width: 100%; height: 100%; border: 0;"'),
					}}
				/>
			</div>
		</div>
	)
}
