/** @format */

import Image from "next/image"
import React from "react"

// Define the Section component for better organization
type SectionProps = {
	id: string
	className?: string
	children: React.ReactNode
	bgImage?: string
}

export const Section: React.FC<SectionProps> = ({ id, children, className = "", bgImage }) => (
	<section id={id} className={`h-screen w-full flex items-center justify-center relative snap-start ${className}`}>
		{bgImage && (
			<div className="absolute inset-0 z-0">
				<Image src={bgImage} alt="Background" fill className="object-cover" priority={id === "hero"} />
			</div>
		)}
		<div className="z-10 relative container">{children}</div>
	</section>
)

// ScrollIndicator component
export const ScrollIndicator: React.FC = () => (
	<div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
		<svg
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="text-white">
			<path d="M12 5v14M5 12l7 7 7-7" />
		</svg>
	</div>
)
