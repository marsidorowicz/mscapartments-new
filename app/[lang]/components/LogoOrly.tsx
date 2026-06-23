/** @format */

import React from "react"
import Image from "next/image"

function LogoOrly() {
	return (
		<div className="relative z-30 w-[120px] h-[96px] sm:w-[144px] sm:h-[120px] md:w-[168px] md:h-[108px] lg:w-[192px] lg:h-[120px] xl:w-[216px] xl:h-[132px] 2xl:w-[240px] 2xl:h-[144px]">
			<Image src={"/images/logo-orly.png"} alt="MSC Apartments Logo Orly Laureta 2025" fill className="object-contain" priority={true} />
		</div>
	)
}

export default LogoOrly
