/** @format */

// import type { Account, DefaultSession, Profile, Session as AuthSession, User as AuthUser } from "@auth/core/types"

// Extend the User type to include role and modules
export interface User {
	id?: string
	name?: string | null
	email?: string | null
	image?: string | null
	role?: string
	modules?: string[]
}

// Extend the Session type to use our custom User
export interface Session {
	user?: User
}

export type Account = unknown
export type DefaultSession = unknown
export type Profile = unknown
