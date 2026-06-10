/** @format */

import React from "react"
import Image from "next/image"

function Logo2() {
	return (
		<div className="">
			<Image
				src={"/images/logo-nowe.png"}
				alt="Mountain Apartments Logo"
				fill
				className="object-contain"
				priority={true}
				sizes="(max-width: 640px) 80px, (max-width: 768px) 96px, (max-width: 1024px) 128px, (max-width: 1280px) 144px, 160px"
			/>
		</div>
	)
}

export default Logo2
