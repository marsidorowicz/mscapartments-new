/** @format */

import type { NextAuthConfig } from "next-auth"
import type { JWT } from "next-auth/jwt"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/prisma/prisma"

export default {
	adapter: PrismaAdapter(prisma),
	providers: [
		GitHub({
			clientId: process.env.GITHUB_ID ?? "",
			clientSecret: process.env.GITHUB_SECRET ?? "",
			allowDangerousEmailAccountLinking: true,
		}),
		Google({
			clientId: process.env.GOOGLE_CLIENT_ID ?? "",
			clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
			allowDangerousEmailAccountLinking: true,
		}),
		// ...add more providers here
	],
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id
				token.userId = user?.id
			}
			return token
		},
		async session({ session, token }) {
			// Add user ID to session object
			if (session.user) {
				session.user.id = (token.id as string) ?? (token.sub as string) ?? null
			}
			return session
		},
	},
	events: {
		async signIn({ user, account }) {
			try {
				// Log user login into UserActivity table
				await prisma.userActivity.create({
					data: {
						userId: (user.id as string) || "", // Assumes `user.id` matches your User model's primary key
						activity: "User logged in",
						metadata: {
							provider: account?.provider, // Log provider info if available
						},
					},
				})
			} catch (error) {
				console.error("Error logging user activity:", error)
			}
		},
		async signOut(signOutParams) {
			const token = (signOutParams as { token?: JWT | null }).token
			const userId = (token?.userId as string) || (token?.sub as string) || ""

			try {
				// Log user login into UserActivity table
				await prisma.userActivity.create({
					data: {
						userId,
						activity: "User logged out",
						metadata: {},
					},
				})
			} catch (error) {
				console.error("Error signing out user activity:", error)
			}
		},
	},
	debug: false,
	session: {
		strategy: "jwt",
		maxAge: 60 * 60, // 1 godzina
	},
	secret: process.env.AUTH_SECRET,
	trustHost: true,
} satisfies NextAuthConfig
