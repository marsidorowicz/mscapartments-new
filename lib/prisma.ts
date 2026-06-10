/** @format */

// This file is used to instantiate the Prisma client with global caching
// https://www.prisma.io/docs/guides/performance-and-optimization/connection-management

import { PrismaClient } from "@prisma/client"

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
	globalForPrisma.prisma ||
	new PrismaClient({
		log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
	})

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

export default prisma
