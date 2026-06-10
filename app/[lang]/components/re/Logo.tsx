/** @format */

import React from "react"
import Image from "next/image"

function Logo() {
	return (
		<div
			className="hidden fixed z-30 left-1 w-[200px] h-[200px] md:block"
			style={{ top: "-90px", left: "-40px" }}
		>
			<Image
				src={"/images/logo-nowe.png"}
				alt="Background"
				fill
				className="object-cover"
				priority={true}
				sizes="200px"
			/>
		</div>
	)
}

export default Logo
