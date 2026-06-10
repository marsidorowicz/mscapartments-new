/** @format */

import React from "react"
import Image from "next/image"

function Logo() {
	return (
		<div className="relative z-30 w-[100px] h-[80px] sm:w-[120px] sm:h-[100px] md:w-[140px] md:h-[90px] lg:w-[160px] lg:h-[100px] xl:w-[180px] xl:h-[110px] 2xl:w-[200px] 2xl:h-[120px]">
			<Image src={"/images/logo-nowe.png"} alt="Mountain Apartments Logo" fill className="object-contain" priority={true} />
		</div>
	)
}

export default Logo
