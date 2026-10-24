/** @format */

"use client"

import {
	BookingEngine,
	computeAvailabilityFromEntries,
	type AvailableProperty,
	type BookingApi,
	type BookingLocale,
	type BookingProperty,
} from "@marsidorowicz/simplevent-sdk"
import { buildPropertyUrl } from "@/utilities/functions/propertyUrl"

// Reservation owner used by the legacy basket flow.
const DEFAULT_USER_ID = "clok0rd6f0000kkdgyf1pd0t3"

const asJson = async (response: Response) => response.json().catch(() => ({}))

/**
 * Adapters mapping the shared SDK BookingEngine onto mscapartments' existing
 * internal API routes. Once these become the public `/api/public/*` routes the
 * engine can use its defaults, but for now this keeps the app fully working.
 */
const mscApi: Partial<BookingApi> = {
	async getProperties({ ids }) {
		const results = await Promise.all(
			ids.map(async id => {
				try {
					const res = await fetch(`/api/properties/mountain/${id}`)
					if (!res.ok) return null
					const data = await asJson(res)
					return (data.property ?? null) as BookingProperty | null
				} catch {
					return null
				}
			}),
		)
		return results.filter((property): property is BookingProperty => Boolean(property))
	},

	async getAvailability({ propertyId, startDate, endDate, commission }) {
		const params = new URLSearchParams({
			id: String(propertyId),
			startDate,
			endDate,
		})
		const res = await fetch(`/api/nobeds-cache/entries?${params.toString()}`)
		if (!res.ok) {
			const data = await asJson(res)
			return { available: false, totalPrice: 0, error: data?.error || "Failed to load availability" }
		}
		const data = await asJson(res)
		const entries = Array.isArray(data.entries) ? data.entries : []
		return computeAvailabilityFromEntries(entries, new Date(startDate), new Date(endDate), { commission })
	},

	async getAvailableProperties({ startDate, endDate }) {
		const propsRes = await fetch("/api/properties")
		if (!propsRes.ok) return []
		const propsData = await asJson(propsRes)
		const properties: BookingProperty[] = Array.isArray(propsData.properties) ? propsData.properties : []
		if (properties.length === 0) return []

		const availRes = await fetch("/api/properties/availability-with-prices", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ startDate, endDate, propertyIds: properties.map(p => p.id) }),
		})
		if (!availRes.ok) return []
		const availData = await asJson(availRes)
		const availableIds: number[] = Array.isArray(availData.availablePropertyIds) ? availData.availablePropertyIds : []
		const priceSums: Record<string, number> = availData.priceSums && typeof availData.priceSums === "object" ? availData.priceSums : {}
		const available = new Set(availableIds)

		return properties
			.filter(p => available.has(p.id))
			.map<AvailableProperty>(p => ({ property: p, price: Number(priceSums[p.id] ?? priceSums[String(p.id)] ?? 0) }))
	},

	// Rate plans live in simplevent; mscapartments exposes only the standard rate.
	async getRatePlans() {
		return []
	},

	async createReservations({ events, userId, source, offerId }) {
		return Promise.all(
			events.map(async (event, index) => {
				try {
					const res = await fetch("/api/event/db", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ event, id: userId, source, offerId: index === 0 ? offerId : undefined }),
					})
					const data = await asJson(res)
					if (!res.ok || data?.error) {
						return { success: false, error: data?.error || "Failed to create reservation" }
					}
					return { success: data?.success !== false, eventSaved: data?.eventSaved }
				} catch (error) {
					return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
				}
			}),
		)
	},

	async validateDiscount({ code, propertyIds, checkInDate, checkOutDate }) {
		try {
			const res = await fetch("/api/discount-codes/validate", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					code,
					propertyId: propertyIds[0],
					eventStartDate: checkInDate?.slice(0, 10),
					eventEndDate: checkOutDate?.slice(0, 10),
				}),
			})
			const data = await asJson(res)
			const discount = data?.discount
			if (res.ok && discount) {
				return {
					valid: true as const,
					discountType: discount.discountType,
					discountValue: discount.discountValue,
					campaignId: discount.campaignId,
					codeId: code,
				}
			}
			return { valid: false as const, error: data?.error || "Invalid discount code" }
		} catch {
			return { valid: false as const, error: "Invalid discount code" }
		}
	},

	async applyDiscount({ codeId, eventId, userId, originalPrice, discountAmount, finalPrice, guestEmail, guestName }) {
		await fetch("/api/discount-codes/validate", {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ code: codeId, eventId, userId, originalPrice, discountAmount, finalPrice, guestEmail, guestName }),
		}).catch(() => undefined)
	},

	async getOffer({ offerId }) {
		try {
			const res = await fetch(`/api/public/offer/${encodeURIComponent(offerId)}`)
			if (!res.ok) return null
			return await asJson(res)
		} catch {
			return null
		}
	},
}

/**
 * /rezerwacja now renders the unified SDK BookingEngine (extracted from the
 * mountain/msc basket page). Date-range selection, the available-apartments
 * picker, basket, offer/discount and checkout all live in the SDK; this file
 * only supplies mscapartments' data adapters and branding.
 */
export default function BasketPageClient({ lang = "pl" }: { lang?: string }) {
	return (
		<BookingEngine
			lang={lang as BookingLocale}
			brand={["MSC", "MOUNTAIN"]}
			applyCommission
			commissionBrands={["MOUNTAIN"]}
			source="msc"
			userId={DEFAULT_USER_ID}
			storageKey="rootBasket"
			api={mscApi}
			propertyUrl={(item, property) => buildPropertyUrl(item.id, property?.name ?? item.name, lang, property?.slugs)}
		/>
	)
}
