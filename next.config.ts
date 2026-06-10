/** @format */

import type { NextConfig } from "next"

const nextConfig: NextConfig = {
	// Remove any old i18n configuration if it exists
	// App Router handles i18n through the file system structure
	// No need for explicit i18n configuration in next.config.ts
	experimental: {
		scrollRestoration: false,
	},
	images: {
		qualities: [50, 70, 75, 80],
		remotePatterns: [
			{ protocol: "https", hostname: "lh3.googleusercontent.com", port: "" },
			{ protocol: "https", hostname: "www.facebook.com", port: "" },
                        { protocol: "https", hostname: "flagcdn.com", port: "" },
                        { protocol: "https", hostname: "flagcdn.com", port: "" },
		],
	},
}

export default nextConfig
