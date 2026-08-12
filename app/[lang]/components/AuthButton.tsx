"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useSession, signOut } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Dictionary } from "@/app/types/dictionary"

const dashboardLabel: Record<string, string> = {
	pl: "Panel",
	en: "Dashboard",
	de: "Dashboard",
	es: "Panel",
}

type AuthButtonProps = {
	dictionary: Dictionary
	className?: string
}

export default function AuthButton({ dictionary, className = "" }: AuthButtonProps) {
	const { data: session } = useSession()
	const params = useParams() as { lang?: string }
	const lang = params.lang || "pl"
	const dict = dictionary.login
	const [menuOpen, setMenuOpen] = useState(false)
	const [menuPos, setMenuPos] = useState({ top: 0, right: 0 })
	const btnRef = useRef<HTMLButtonElement>(null)
	const menuRef = useRef<HTMLDivElement>(null)

	const close = useCallback(() => setMenuOpen(false), [])

	useEffect(() => {
		if (!menuOpen) return
		const handle = (e: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(e.target as Node) &&
				btnRef.current && !btnRef.current.contains(e.target as Node)) {
				close()
			}
		}
		document.addEventListener("click", handle)
		return () => document.removeEventListener("click", handle)
	}, [menuOpen, close])

	const handleToggle = () => {
		if (!menuOpen && btnRef.current) {
			const rect = btnRef.current.getBoundingClientRect()
			setMenuPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right })
		}
		setMenuOpen((v) => !v)
	}

	if (!dict) return null

	if (session) {
		return (
			<>
				<button ref={btnRef} onClick={handleToggle} className="flex items-center gap-2 p-1 cursor-pointer">
					{session.user?.image ? (
						<Image
							src={session.user.image}
							alt=""
							width={28}
							height={28}
							className="rounded-full border border-gray-300"
							unoptimized
						/>
					) : (
						<div className="w-7 h-7 rounded-full border border-gray-300 bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
							{session.user?.name?.charAt(0) || "?"}
						</div>
					)}
				</button>

				{menuOpen && (
					<div
						ref={menuRef}
						className="fixed bg-white border border-gray-200 rounded-lg shadow-lg z-[99999] py-1"
						style={{ top: menuPos.top, right: menuPos.right, minWidth: 160 }}>
						<Link
							href={`/${lang}/dashboard`}
							onClick={close}
							className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
							{dashboardLabel[lang] || "Dashboard"}
						</Link>
						<hr className="border-gray-100" />
						<button
							onClick={() => { close(); signOut() }}
							className="block w-full text-left px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 transition-colors">
							{dict.signOut || "Sign Out"}
						</button>
					</div>
				)}
			</>
		)
	}

	return (
		<Link
			href={`/${lang}/login`}
			className={`text-gray-700 hover:text-[#7a4a35] font-medium transition-colors duration-200 whitespace-nowrap flex-shrink-0 ${className}`}>
			{dict.signIn || "Sign In"}
		</Link>
	)
}
