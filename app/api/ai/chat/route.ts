/** @format */

import { NextRequest, NextResponse } from "next/server"
import { streamText, tool, zodSchema, convertToModelMessages } from "ai"
import { createOpenAICompatible } from "@ai-sdk/openai-compatible"
import { z } from "zod"
import { searchAvailableOffers } from "@/utilities/functions/ai/availabilitySearch"
import { getPropertyDetails } from "@/utilities/functions/ai/propertyDetails"

export const dynamic = "force-dynamic"
export const maxDuration = 60

const MODEL = process.env.OPENCODE_AI_MODEL || "deepseek-v4-flash"
const API_KEY = process.env.OPENCODE_API_KEY || ""

const opencode = createOpenAICompatible({
	name: "opencode-go",
	baseURL: "https://opencode.ai/zen/go/v1",
	apiKey: API_KEY,
	headers: {
		"x-opencode-session": "mscapartments-ai-assistant",
	},
})

// Simple in-memory rate limit for the public endpoint (per IP)
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 15
const requestLog = new Map<string, { count: number; windowStart: number }>()

function rateLimited(ip: string): boolean {
	const now = Date.now()
	const entry = requestLog.get(ip)
	if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
		requestLog.set(ip, { count: 1, windowStart: now })
		return false
	}
	entry.count += 1
	if (entry.count > RATE_LIMIT_MAX) {
		return true
	}
	return false
}

export async function POST(req: NextRequest) {
	try {
		if (!API_KEY) {
			return NextResponse.json(
				{ error: "AI assistant is not configured yet. Please try again later." },
				{ status: 503 }
			)
		}

		const ip =
			req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
			req.headers.get("x-real-ip") ||
			"unknown"
		if (rateLimited(ip)) {
			return NextResponse.json(
				{ error: "Too many requests. Please wait a moment and try again." },
				{ status: 429 }
			)
		}

		const { messages } = await req.json()

		const searchTool = tool({
			description:
				"Searches the database for apartments available for a given date range and number of guests. Returns availablePropertyIds, priceSums (total stay price per property) and detailed offers sorted by total price. Use ISO date strings (YYYY-MM-DD) for fromdate and todate.",
			inputSchema: zodSchema(
				z.object({
					fromdate: z.string().describe("Arrival date in YYYY-MM-DD format"),
					todate: z.string().describe("Departure date in YYYY-MM-DD format"),
					guests: z.number().int().positive().describe("Number of persons"),
				})
			),
			execute: async ({ fromdate, todate, guests }) => {
				return searchAvailableOffers({ fromdate, todate, guests })
			},
		})
		const detailsTool = tool({
			description:
				"Fetches specific details about a single apartment by its numeric id: description, number of beds, amenities/filters, photos count, check-in/out times, parking and size. Use when a visitor asks about a specific apartment.",
			inputSchema: zodSchema(
				z.object({
					propertyId: z.number().int().positive().describe("Numeric property id"),
				})
			),
			execute: async ({ propertyId }) => {
				return getPropertyDetails({ propertyId })
			},
		})
		const nextStepsTool = tool({
			description:
				"Provides 2-4 short clickable follow-up prompts the visitor might want to send next, in the SAME language as the conversation. ALWAYS call this tool at the end of every assistant reply, right after the text answer.",
			inputSchema: zodSchema(
				z.object({
					suggestions: z
						.array(z.string())
						.min(1)
						.max(4)
						.describe("Short follow-up prompts the visitor can click, e.g. property details, other dates, best price"),
				})
			),
			execute: async ({ suggestions }) => {
				return { suggestions }
			},
		})
		const tools = {
			searchAvailableOffers: searchTool,
			getPropertyDetails: detailsTool,
			suggestNextSteps: nextStepsTool,
		}

		const modelMessages = await convertToModelMessages(messages, { tools })

		const result = streamText({
			model: opencode.chatModel(MODEL),
			system: `You are the AI booking assistant for MSC Apartments (Zakopane / Kościelisko, Poland). You help visitors find available apartments and answer questions about them. You ALWAYS reply in the SAME language the visitor writes in (Polish, English, German or Spanish).

Today's date is ${new Date().toISOString().slice(0, 10)}.

When the visitor asks for an apartment for a stay (e.g. "pokój dla 4 osób na 15-20.12.2026", "room for 2 people tomorrow"), you MUST:
1. Extract arrival date, departure date and number of guests. If the date is ambiguous (e.g. "tomorrow") compute it relative to today. "one night from today" means arrival = today, departure = today + 1.
2. Call the searchAvailableOffers tool with those parameters.
3. Present the matching apartments clearly in the visitor's language: apartment name, location, occupancy (min-max persons), dates, number of nights and TOTAL price for the whole stay in PLN. Sort by total price from lowest to highest. If the visitor asked for the cheapest option, highlight the lowest-priced apartment.
4. If nothing matches, say no apartment is available for those dates and suggest trying other dates.

Tone (IMPORTANT):
- ALWAYS be positive, warm and encouraging. Never sound apologetic, never say the result is "unfortunate", "poor", "limited" or that the visitor gets "only" one option as if it were bad.
- When there is exactly one available apartment, present it with enthusiasm and confidence (e.g. "Mamy dla Ciebie idealny apartament na te daty!", not "Niestety, dostępny jest tylko jeden apartament"). Frame a single option as a great, ready-to-book pick.
- When several apartments are available, highlight the range of choices and the best value. Never imply the selection is scarce.
- Only when truly nothing matches may you gently suggest other dates, still in a helpful, positive tone.

Rules about calling the tool:
- Call searchAvailableOffers IMMEDIATELY when you have dates + guest count. Do not ask for confirmation first. A short reply like "2" after your question means 2 guests - call the tool right after.
- If only the guest count is missing, ask ONE short question. Treat the next visitor message as the answer and then call the tool.
- Remember the conversation history: if the visitor already gave the guest count, keep it when they only change dates.
- Use getPropertyDetails when the visitor asks about a specific apartment's amenities, beds, parking, photos or description.
- ALWAYS end every reply by calling the suggestNextSteps tool with 2-4 short clickable follow-up prompts relevant to what was just answered, in the SAME language as the conversation (e.g. "Pokaż szczegóły tego apartamentu", "Czy są inne daty?", "Najtańsza opcja", "Czy jest parking?"). Write the text answer first, then call suggestNextSteps as the last step.

Display format:
- Professional and concise. NO emojis, NO icons, NO markdown bold (no asterisks). Plain text with a clean structure.
- For each apartment show: name, location, occupancy, stay dates (arrival - departure, nights), total price in PLN. The total price is the final all-inclusive price for the stay.
- If the visitor did not ask about dates (e.g. just "do you have parking?" or "hello"), answer conversationally from what you know, or use getPropertyDetails only if they ask about a specific apartment. Do NOT call searchAvailableOffers without dates.

Never invent apartments or prices that the tools did not return.`,
			messages: modelMessages,
			tools,
			stopWhen: ({ steps }) => {
				const last = steps[steps.length - 1]
				// Stop as soon as a step produced a text answer without requesting more tools,
				// so the model does not re-emit the same reply after a tool result.
				return last.text.length > 0 && last.toolCalls.length === 0
			},
		})

		return result.toUIMessageStreamResponse()
	} catch (error) {
		console.error("AI chat error:", error)
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "Internal server error" },
			{ status: 500 }
		)
	}
}