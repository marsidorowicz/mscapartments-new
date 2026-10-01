/** @format */

"use client"

import React, { useEffect, useRef, useState } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, type UIMessage, type TextUIPart } from "ai"
import SearchIcon from "@mui/icons-material/Search"
import CloseIcon from "@mui/icons-material/Close"
import SendIcon from "@mui/icons-material/Send"
import { Dictionary } from "../../../types/dictionary"

export type AiSearchAction = {
	propertyIds?: number[]
	priceSums?: Record<number, number>
	startDate?: string
	endDate?: string
	guests?: number
	sortBy?: "price_asc" | "default"
}

type AISearchWidgetProps = {
	dictionary: Dictionary
	lang: string
	onApplyAiSearch?: (action: AiSearchAction) => void
}

const thinkingLabels: Record<string, string> = {
	pl: "Szukam dostępnych apartamentów...",
	en: "Searching for available apartments...",
	it: "Cerco appartamenti disponibili...",
	de: "Suche nach verfügbaren Apartments...",
	es: "Buscando apartamentos disponibles...",
}

// Tool part shape received by useChat for an executed tool (type is `tool-${toolName}`).
type ToolUIPartLoose = {
	state: string
	output?: {
		suggestions?: string[]
		availablePropertyIds?: number[]
		priceSums?: Record<number, number>
		startDate?: string
		endDate?: string
		guests?: number
	}
}

export default function AISearchWidget({ dictionary, lang, onApplyAiSearch }: AISearchWidgetProps) {
	const assistantName = dictionary?.apartamenty?.aiAssistantName || "MSC Assistant"
	const { messages, sendMessage, status, error } = useChat({
		transport: new DefaultChatTransport({ api: "/api/ai/chat" }),
		throttle: 120,
	})

	const [query, setQuery] = useState("")
	const [open, setOpen] = useState(false)
	const chatScrollRef = useRef<HTMLDivElement>(null)
	const appliedSearchRef = useRef<string>("")

	const isLoading = status === "submitted" || status === "streaming"
	const thinkingLabel = thinkingLabels[lang] || thinkingLabels.pl

	// Extract only text parts, deduping consecutive identical blocks (the tool loop can
	// repeat the same reply in a follow-up step).
	const getMessageText = (message: UIMessage): string => {
		const parts = (message.parts as UIMessage["parts"]).filter((part): part is TextUIPart => part.type === "text")
		const chunks: string[] = []
		let last = ""
		for (const part of parts) {
			const text = part.text || ""
			if (text.trim() && text.trim() === last.trim()) continue
			chunks.push(text)
			last = text
		}
		return chunks.join("\n")
	}

	// Extract clickable follow-up suggestions from an assistant message
	const getSuggestions = (message: UIMessage): string[] => {
		const part = message.parts.find(p => {
			const t = p as Partial<ToolUIPartLoose>
			return t.state === "output-available" && Array.isArray(t.output?.suggestions)
		})
		const suggestions = part ? (part as ToolUIPartLoose).output?.suggestions : undefined
		return Array.isArray(suggestions) ? suggestions.filter((s): s is string => typeof s === "string" && s.trim().length > 0) : []
	}

	const sendSuggestion = (text: string) => {
		if (isLoading || !text.trim()) return
		appliedSearchRef.current = ""
		setQuery("")
		sendMessage({ text: text.trim() })
	}

	// Pull the last searchAvailableOffers tool output from assistant messages and drive the page.
	useEffect(() => {
		const toolPart = messages
			.filter(m => m.role === "assistant")
			.flatMap(m => m.parts)
			.find((part): part is UIMessage["parts"][number] & ToolUIPartLoose => {
				const t = part as Partial<ToolUIPartLoose>
				return t.state === "output-available" && Array.isArray(t.output?.availablePropertyIds)
			})
		const out = toolPart?.output
		if (!out || !Array.isArray(out.availablePropertyIds)) return

		const key = `${out.startDate}_${out.endDate}_${out.guests}_${out.availablePropertyIds?.length}`
		if (appliedSearchRef.current === key) return
		appliedSearchRef.current = key
		onApplyAiSearch?.({
			propertyIds: out.availablePropertyIds,
			priceSums: out.priceSums,
			startDate: out.startDate,
			endDate: out.endDate,
			guests: out.guests,
			sortBy: "price_asc",
		})
	}, [messages, onApplyAiSearch])

	// Auto-scroll only the chat container - keep the page scroll position still.
	// Scroll to bottom only for the user's own message; leave the position alone
	// while the assistant streams so a long reply is readable from the start.
	useEffect(() => {
		if (!open) return
		const el = chatScrollRef.current
		if (!el) return
		const lastMsg = messages[messages.length - 1]
		if (lastMsg?.role === "user") {
			el.scrollTop = el.scrollHeight
		}
	}, [open, messages, isLoading])

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		const text = query.trim()
		if (!text || isLoading) return
		appliedSearchRef.current = ""
		setOpen(true)
		setQuery("")
		sendMessage({ text })
	}

	// Show thinking while loading until assistant text arrives for the latest exchange.
	const lastMessage = messages[messages.length - 1]
	const lastIsUserWaiting =
		lastMessage?.role === "user" ||
		(lastMessage?.role === "assistant" && getMessageText(lastMessage).trim().length === 0)
	const showThinking = isLoading && lastIsUserWaiting

	const formatDate = (date: Date): string =>
		`${String(date.getDate()).padStart(2, "0")}.${String(date.getMonth() + 1).padStart(2, "0")}.${date.getFullYear()}`

	// Always show a future date range in the placeholder (next week from today), so it never points to a past date.
	const exampleStart = new Date()
	exampleStart.setDate(exampleStart.getDate() + 7)
	const exampleEnd = new Date(exampleStart)
	exampleEnd.setDate(exampleEnd.getDate() + 5)
	const exampleDateRange = `${formatDate(exampleStart)}-${formatDate(exampleEnd)}`

	const placeholder = (
		dictionary?.apartamenty?.aiSearchPlaceholder ||
		dictionary?.apartamenty?.searchByNamePlaceholder ||
		"Szukaj apartamentów..."
	).replace("{{date}}", exampleDateRange)

	return (
		<div className="w-full flex items-center justify-center bg-white border-b px-4 pt-12 pb-2">
			<div className="w-full max-w-6xl">
				{/* Google-style search input - shown only when the chat is closed */}
				{!open && (
					<form
						onSubmit={handleSubmit}
						className="flex items-center gap-0 w-full mx-auto max-w-3xl rounded-full border-2 border-[#1D2430] bg-white shadow-sm focus-within:border-[#1D2430] overflow-hidden"
					>
						<input
							type="text"
							value={query}
							onChange={e => setQuery(e.target.value)}
							placeholder={placeholder}
							disabled={isLoading}
							className="flex-1 min-w-0 px-5 py-3.5 text-base text-[#1D2430] outline-none bg-transparent"
							aria-label={placeholder}
						/>
						{query && !isLoading && (
							<button
								type="button"
								onClick={() => setQuery("")}
								className="px-2 text-slate-400 hover:text-slate-600"
								aria-label="Clear"
							>
								<CloseIcon fontSize="small" />
							</button>
						)}
						<button
							type="submit"
							disabled={!query.trim() || isLoading}
							className="flex items-center justify-center w-14 h-14 bg-black text-white hover:bg-[#1D2430] disabled:cursor-not-allowed"
							aria-label="Search"
						>
							<SearchIcon />
						</button>
					</form>
				)}

				{/* Chat window - bounded height, scrollable, so tiles stay below */}
				{open && (
					<div className="mx-auto w-full max-w-3xl mt-3">
						<div className="flex items-center justify-between px-4 py-2 bg-[#1D2430] text-white rounded-t-xl">
							<span className="text-sm font-semibold">{assistantName}</span>
							<button
								type="button"
								onClick={() => setOpen(false)}
								className="text-white/80 hover:text-white"
								aria-label="Close assistant"
							>
								<CloseIcon fontSize="small" />
							</button>
						</div>
						<div ref={chatScrollRef} className="bg-white border border-t-0 border-[#1D2430] rounded-b-xl max-h-80 overflow-y-auto p-3 flex flex-col gap-0.5">
						{messages.length === 0 && !isLoading && (
							<p className="text-base text-slate-500 text-center py-4">
								{thinkingLabels[lang]?.replace("...", "") || "Ask about availability"}
							</p>
						)}

						{messages.map(message => {
							const isUser = message.role === "user"
							const text = getMessageText(message)
							const suggestions = !isUser ? getSuggestions(message) : []
							if (!isUser && !text && suggestions.length === 0) return null
							return (
								<div key={message.id} className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
									{text && (
										<div
											className={`max-w-[85%] px-4 py-2.5 text-base leading-relaxed rounded-2xl whitespace-pre-wrap break-words ${
												isUser
													? "bg-[#1D2430] text-white rounded-br-sm"
													: "bg-white text-[#1D2430] border border-slate-200 rounded-bl-sm"
											}`}
										>
											{text}
										</div>
									)}
									{suggestions.length > 0 && (
										<div className="flex flex-wrap gap-2 mt-2">
											{suggestions.map(s => (
												<button
													key={s}
													type="button"
													disabled={isLoading}
													onClick={() => sendSuggestion(s)}
													className="px-4 py-2 text-sm font-medium text-[#1D2430] bg-white border border-[#1D2430] rounded-full hover:bg-[#1D2430] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
												>
													{s}
												</button>
											))}
										</div>
									)}
								</div>
							)
						})}

						{showThinking && (
							<div className="flex justify-start">
								<div className="flex items-center gap-2 px-4 py-2.5 text-base text-slate-500 bg-white border border-slate-200 rounded-2xl rounded-bl-sm">
									<span className="inline-block w-3 h-3 border-2 border-[#1D2430] border-t-transparent rounded-full animate-spin" />
									{thinkingLabel}
								</div>
							</div>
						)}

						{error && (
							<div className="px-3 py-2 text-base text-red-700 bg-red-50 rounded-xl">
								Error: {error.message || "Something went wrong"}
							</div>
						)}

						{/* Follow-up input inside chat */}
						<form
							onSubmit={e => {
								e.preventDefault()
								const text = query.trim()
								if (!text || isLoading) return
								appliedSearchRef.current = ""
								setQuery("")
								sendMessage({ text })
							}}
							className="flex items-center gap-2 mt-2"
						>
							<input
								type="text"
								value={query}
								onChange={e => setQuery(e.target.value)}
								placeholder={placeholder}
								disabled={isLoading}
								className="flex-1 min-w-0 px-4 py-2.5 text-base text-[#1D2430] outline-none border border-[#1D2430] rounded-full"
							/>
								<button
									type="submit"
									disabled={!query.trim() || isLoading}
									className="flex items-center justify-center w-10 h-10 rounded-full bg-[#1D2430] text-white hover:bg-[#2a3340] disabled:opacity-40"
									aria-label="Send"
								>
									<SendIcon fontSize="small" />
								</button>
							</form>
						</div>
					</div>
				)}

				{/* Note that the tiles below are the matching results */}
				{open && (
					<p className="text-center text-sm text-slate-500 mt-2 mb-2">
						{dictionary?.apartamenty?.aiSearchResultsNote || dictionary?.apartamenty?.aiSearchPlaceholder?.replace("{{date}}", exampleDateRange) || ""}
					</p>
				)}
			</div>
		</div>
	)
}