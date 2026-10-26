/** @format */

"use client"

import React from "react"
import type { Dictionary } from "@/app/types/dictionary"
import Link from "next/link"

interface OffersPageClientProps {
	dictionary: Dictionary
	lang: string
}

const OffersPageClient: React.FC<OffersPageClientProps> = ({ dictionary, lang }) => {
	return (
		<div className={`flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-1000 ease-out}`}>
			<Link
				href={`/${lang}/apartamenty`}
				className="!bg-[#1D2430] hover:scale-105 !text-white !shadow-lg !rounded-md text-lg font-semibold py-3 px-8 transition-colors duration-200 !border-2 border-black !outline-none opacity-100 hover:opacity-100 ">
				{dictionary.home.hero.bookNow || "SPRAWDŹ DOSTĘPNOŚĆ"}
			</Link>
			{/* <Link href={`/${lang}/offers`} className="!bg-[#cc9678] !hover:bg-[#7a4a35] !text-white !shadow-lg !rounded-md text-lg font-semibold py-3 px-8 transition-colors duration-200 !border-0 !outline-none">
								{dictionary.home.hero.specialOffers || dictionary.navigation.offers || "Special Offers"}
							</Link> */}
		</div>
	)
}

export default OffersPageClient
