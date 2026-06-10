/** @format */
"use client"

import React from "react"
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Checkbox,
	FormControlLabel,
	IconButton,
} from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import { PropertyFilterType } from "@/types"

interface PropertyFilterDialogProps {
	open: boolean
	onClose: () => void
	selectedFilters: string[]
	onChange: (filters: string[]) => void
	translations: {
		filters: string
		apply: string
		reset: string
		close: string
		[key: string]: string
	}
	theme: "light" | "dark"
}

const PropertyFilterDialog: React.FC<PropertyFilterDialogProps> = ({
	open,
	onClose,
	selectedFilters,
	onChange,
	translations,
	theme,
}) => {
	const [localFilters, setLocalFilters] =
		React.useState<string[]>(selectedFilters)

	// Create a ref for the dialog content
	const contentRef = React.useRef<HTMLDivElement>(null)

	// Reset local filters when the dialog opens with new selectedFilters
	React.useEffect(() => {
		setLocalFilters([...selectedFilters])
	}, [selectedFilters, open])

	// Enable mouse wheel scrolling in the dialog content
	React.useEffect(() => {
		const handleWheel = (e: WheelEvent) => {
			if (
				contentRef.current &&
				contentRef.current.contains(e.target as Node)
			) {
				e.stopPropagation()
			}
		}

		if (open) {
			document.addEventListener("wheel", handleWheel, { passive: false })
		}

		return () => {
			document.removeEventListener("wheel", handleWheel)
		}
	}, [open])

	const handleFilterChange = (filter: string) => {
		setLocalFilters((prev) => {
			if (prev.includes(filter)) {
				return prev.filter((f) => f !== filter)
			} else {
				return [...prev, filter]
			}
		})
	}

	const handleApply = () => {
		onChange(localFilters)
		onClose()
	}

	const handleReset = () => {
		setLocalFilters([])
	}
	// Convert enum to array of filter options
	const filterTypes = Object.values(PropertyFilterType)
	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="sm"
			fullWidth
			scroll="paper"
			disableScrollLock={true}
			PaperProps={{
				style: {
					backgroundColor: theme === "light" ? "#ffffff" : "#374151",
					color: theme === "light" ? "#1f2937" : "#f3f4f6",
					maxHeight: "90vh",
					height: "auto",
				},
			}}
		>
			<DialogTitle>
				{translations.filters}
				<IconButton
					aria-label={translations.close}
					onClick={onClose}
					sx={{
						position: "absolute",
						right: 8,
						top: 8,
					}}
				>
					<CloseIcon />{" "}
				</IconButton>
			</DialogTitle>{" "}
			<DialogContent
				ref={contentRef}
				dividers
				sx={{
					padding: "20px",
					maxHeight: "60vh",
					overflowY: "auto",
					overflowX: "hidden",
					"&::-webkit-scrollbar": {
						width: "8px",
					},
					"&::-webkit-scrollbar-track": {
						backgroundColor:
							theme === "light" ? "#f1f5f9" : "#374151",
						borderRadius: "4px",
					},
					"&::-webkit-scrollbar-thumb": {
						backgroundColor:
							theme === "light" ? "#cbd5e1" : "#6b7280",
						borderRadius: "4px",
						"&:hover": {
							backgroundColor:
								theme === "light" ? "#94a3b8" : "#9ca3af",
						},
					},
				}}
				onWheel={(e) => {
					e.stopPropagation()
				}}
			>
				<div
					style={{
						display: "grid",
						gridTemplateColumns:
							"repeat(auto-fit, minmax(250px, 1fr))",
						gap: "8px",
						width: "100%",
					}}
				>
					{filterTypes.map((filter) => (
						<FormControlLabel
							key={filter}
							control={
								<Checkbox
									checked={localFilters.includes(filter)}
									onChange={() => handleFilterChange(filter)}
									sx={{
										color:
											theme === "light"
												? "#4b5563"
												: "#9ca3af",
										"&.Mui-checked": {
											color: "#3b82f6",
										},
									}}
								/>
							}
							label={
								translations[
									`filter-${filter.toLowerCase()}`
								] || filter
							}
							sx={{
								color:
									theme === "light" ? "#1f2937" : "#f3f4f6",
							}}
						/>
					))}
				</div>
			</DialogContent>{" "}
			<DialogActions>
				<Button onClick={handleReset} color="inherit">
					{translations.reset}
				</Button>
				<Button
					onClick={handleApply}
					color="primary"
					variant="contained"
				>
					{translations.apply}
				</Button>
			</DialogActions>
		</Dialog>
	)
}

export default PropertyFilterDialog
