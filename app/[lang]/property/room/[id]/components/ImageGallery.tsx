/** @format */

"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Property } from "@/types"
import { Dictionary } from "../../../../../types/dictionary"

type ImageGalleryProps = {
	property: Property
	className?: string
	dictionary: Dictionary
}

export default function ImageGallery({ property, className, dictionary }: ImageGalleryProps) {
	const [currentImageIndex, setCurrentImageIndex] = useState(0)
	const [isImageModalOpen, setIsImageModalOpen] = useState(false)
	const [imageErrors, setImageErrors] = useState<Set<number>>(new Set())
	const [isSmallScreen, setIsSmallScreen] = useState(false) // ← must exist
	const [imageOrientations, setImageOrientations] = useState<Record<number, boolean>>({})
	// Drag/swipe state
	const [dragOffset, setDragOffset] = useState(0)
	const [isDragging, setIsDragging] = useState(false)
	const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null)
	const [justDragged, setJustDragged] = useState(false)

	// Reset currentImageIndex when images change
	useEffect(() => {
		if (property.images && property.images.length > 0) {
			setCurrentImageIndex(0)
		}
	}, [property.images])

	// Detect orientation per image
	useEffect(() => {
		if (!property.images?.length) return

		property.images.forEach((_, index) => {
			const img = new window.Image()
			img.src = getImageSrc(index)
			img.onload = () => {
				setImageOrientations((prev) => ({ ...prev, [index]: img.naturalHeight > img.naturalWidth }))
			}
		})
	}, [property.images])

	// Detect small screen
	useEffect(() => {
		const checkScreenSize = () => {
			setIsSmallScreen(window.innerWidth < 640) // sm breakpoint
		}
		checkScreenSize()
		window.addEventListener("resize", checkScreenSize)
		return () => window.removeEventListener("resize", checkScreenSize)
	}, [])

	// Helper function to get image source
	const getImageSrc = (index: number): string => {
		if (!property.images || property.images.length === 0) {
			return "/images/apartment-default-small.jpg"
		}
		if (imageErrors.has(index)) {
			return "/images/apartment-default-small.jpg"
		}
		const image = property.images[index]
		let imagePath: string

		if (typeof image === "string") {
			imagePath = image
		} else {
			imagePath = image.path
		}

		// Normalize the path
		const normalizedPath = imagePath.replace(/\\/g, "/").replace(/^(?!\/)/, "/")

		return normalizedPath
	}

	const handleImageError = (index: number) => {
		setImageErrors((prev) => new Set(prev).add(index))
	}

	const handlePreviousImage = () => {
		if (!property.images) return
		setCurrentImageIndex((prev) => {
			if (typeof prev !== "number") return 0
			return prev === 0 ? property.images!.length - 1 : prev - 1
		})
	}

	const handleNextImage = () => {
		if (!property.images) return
		setCurrentImageIndex((prev) => {
			if (typeof prev !== "number") return 0
			return prev === property.images!.length - 1 ? 0 : prev + 1
		})
	}

	const maxVerticalTolerance = 100 // Maximum allowed vertical movement during horizontal swipe

	const onTouchStart = (e: React.TouchEvent) => {
		setIsDragging(false)
		setStartPos({
			x: e.targetTouches[0].clientX,
			y: e.targetTouches[0].clientY,
		})
		setDragOffset(0)
	}

	const onTouchMove = (e: React.TouchEvent) => {
		if (!startPos) return
		const currentX = e.targetTouches[0].clientX
		const currentY = e.targetTouches[0].clientY
		const deltaX = startPos.x - currentX
		const deltaY = Math.abs(startPos.y - currentY)
		if (deltaY > maxVerticalTolerance) return
		if (Math.abs(deltaX) > 10) {
			setIsDragging(true)
		}
		setDragOffset((deltaX / window.innerWidth) * 100)
	}

	const onTouchEnd = () => {
		if (!isDragging) return
		const threshold = 20 // vw
		if (dragOffset > threshold) {
			handleNextImage()
		} else if (dragOffset < -threshold) {
			handlePreviousImage()
		}
		setDragOffset(0)
		setIsDragging(false)
		setStartPos(null)
	}

	const onMouseDown = (e: React.MouseEvent) => {
		setIsDragging(false)
		setStartPos({ x: e.clientX, y: e.clientY })
		setDragOffset(0)
		setJustDragged(false)
		e.preventDefault()
	}

	const onMouseMove = (e: React.MouseEvent) => {
		if (!startPos) return
		const deltaX = startPos.x - e.clientX
		const deltaY = Math.abs(startPos.y - e.clientY)
		if (deltaY > maxVerticalTolerance) return
		if (Math.abs(deltaX) > 10) {
			setIsDragging(true)
		}
		setDragOffset((deltaX / window.innerWidth) * 100)
	}

	const onMouseUp = () => {
		if (!isDragging) {
			setJustDragged(false)
			return
		}
		const threshold = 20
		if (dragOffset > threshold) {
			handleNextImage()
		} else if (dragOffset < -threshold) {
			handlePreviousImage()
		}
		setDragOffset(0)
		setIsDragging(false)
		setStartPos(null)
		setJustDragged(true)
	}

	const hasImages = property.images && property.images.length > 0
	const imageWidth = isSmallScreen ? 100 : 50

	return (
		<>
			<div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/40">
				{/* Main Image */}
				<div className={`relative bg-gray-200 ${className ?? "h-[420px] md:h-[460px]"}`}>
					<div className="absolute inset-0 overflow-hidden">
						<div
							className={`flex h-full flex-nowrap ${isDragging ? "" : "transition-transform duration-300 ease-out"}`}
							style={{
								width: `${property.images!.length * imageWidth}vw`,
								transform: `translateX(-${currentImageIndex * imageWidth + dragOffset}vw)`,
							}}
							onTouchStart={onTouchStart}
							onTouchMove={onTouchMove}
							onTouchEnd={onTouchEnd}
							onMouseDown={onMouseDown}
							onMouseMove={onMouseMove}
							onMouseUp={onMouseUp}>
							{property.images!.map((_, index) => (
								<div key={index} className="relative flex-shrink-0 h-full overflow-hidden" style={{ minWidth: `${imageWidth}vw` }}>
									<div className="relative h-full w-full">
										<Image
											src={getImageSrc(index)}
											alt={`${property.name} image ${index + 1}`}
											fill
											className={imageOrientations[index] ? "object-contain bg-black cursor-pointer" : "object-cover cursor-pointer"}
											onClick={() => {
												if (justDragged) {
													setJustDragged(false)
													return
												}
												setIsImageModalOpen(true)
											}}
											onError={() => handleImageError(index)}
											sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 800px"
											quality={80}
											placeholder="blur"
											blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z"
										/>
									</div>
								</div>
							))}
						</div>
					</div>
					{/* Property Type Badge */}
					<div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
						<div className="bg-[#cc9678] text-white px-3 py-2 rounded-lg text-sm font-semibold shadow-lg">
							{dictionary.apartments?.propertyTypes?.[property.type.toUpperCase()] || property.type}
						</div>
						{/* Size Badge */}
						{/* {property.size && <div className="bg-gray-800 text-white px-3 py-2 rounded-lg text-sm font-semibold shadow-lg">{property.size} m²</div>} */}
					</div>
					{/* Last Minute Offer Badge */}
					{property.lastMinuteOfferActive && (
						<div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-bold shadow-lg z-20">
							Last minute -{property.lastMinuteDiscountPercentage}%
						</div>
					)}
					{/* Image Navigation */}
					{hasImages && property.images!.length > 1 && (
						<>
							<button
								onClick={handlePreviousImage}
								className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all">
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
								</svg>
							</button>
							<button
								onClick={handleNextImage}
								className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all z-10">
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
								</svg>
							</button>
						</>
					)}
					{/* Image Counter */}
					{hasImages && property.images!.length > 1 && (
						<div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
							{currentImageIndex + 1} / {property.images!.length}
						</div>
					)}
				</div>
				{/* Thumbnail Gallery */}
				{/* {hasImages && property.images!.length > 1 && (
					<div className="p-4">
						<div className="flex gap-2 overflow-x-auto px-4">
							{property.images!.map((_, index) => (
								<button
									key={index}
									onClick={() => setCurrentImageIndex(index)}
									className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
										currentImageIndex === index ? "border-[#cc9678]" : "border-gray-200 hover:border-gray-300"
									}`}>
									<Image
										src={getImageSrc(index)}
										alt={`${property.name} - Image ${index + 1}`}
										fill
										className="object-cover"
										onError={() => handleImageError(index)}
										quality={70}
										placeholder="blur"
										blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z"
									/>
								</button>
							))}
						</div>
					</div>
				)} */}
			</div>
			{/* Image Modal */}
			{isImageModalOpen && hasImages && (
				<div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50" onClick={() => setIsImageModalOpen(false)}>
					<div className="relative w-full h-full flex items-center justify-center p-4">
						<Image
							src={getImageSrc(currentImageIndex)}
							alt={property.name}
							fill
							className="object-contain"
							onClick={(e) => e.stopPropagation()}
							onError={() => handleImageError(currentImageIndex)}
							sizes="100vw"
							quality={85}
							placeholder="blur"
							blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z"
						/>
						<button
							onClick={() => setIsImageModalOpen(false)}
							className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-2 z-10">
							<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
						{property.images!.length > 1 && (
							<>
								<button
									onClick={(e) => {
										e.stopPropagation()
										handlePreviousImage()
									}}
									className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-3 z-10">
									<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
									</svg>
								</button>
								<button
									onClick={(e) => {
										e.stopPropagation()
										handleNextImage()
									}}
									className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-3 z-10">
									<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
									</svg>
								</button>
								{/* Image Counter */}
								<div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm z-10">
									{currentImageIndex + 1} / {property.images!.length}
								</div>
							</>
						)}
					</div>
				</div>
			)}
		</>
	)
}
