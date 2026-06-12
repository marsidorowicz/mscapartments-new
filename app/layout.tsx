/** @format */

import "./globals.css"
import { ReactNode } from "react"
import type { Metadata } from "next"
import { GoogleAnalytics } from "@next/third-parties/google"
import { GoogleTagManager } from "@next/third-parties/google"
import Image from "next/image"
import ReduxProvider from "./components/ReduxProvider"
import MountainApartmentsSchema from "../components/MountainApartmentsSchema"

// Metadata is handled by locale-specific layouts and pages
export const metadata: Metadata = {
	title: "MSC Apartments",
	description: "Znajdź komfortowy apartament w górach dla swojej Rodziny",
	metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://mscapartments.pl"),
}

type LayoutProps = {
	children: ReactNode
	params: Promise<{ locale?: string }>
}

export default async function RootLayout({ params, children }: LayoutProps) {
	const { locale } = (await params) || {}

	return (
		<html suppressHydrationWarning lang={locale || "pl"}>
			<head>
				{/* Meta Pixel Code - Only in production */}
				{process.env.NODE_ENV === "production" && (
					<>
						<script
							dangerouslySetInnerHTML={{
								__html: `
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '1342933747285030');
fbq('track', 'PageView');
						`,
							}}
						/>
						<noscript>
							<Image
								height={1}
								width={1}
								style={{ display: "none" }}
								src="https://www.facebook.com/tr?id=1342933747285030&ev=PageView&noscript=1"
								alt=""
							/>
						</noscript>
					</>
				)}
				{/* End Meta Pixel Code */}

				<meta charSet="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes" />
				<MountainApartmentsSchema />
			</head>
			<body>
				<ReduxProvider>{children}</ReduxProvider>
				{/* Google Analytics & Tag Manager - Only in production */}
				{process.env.NODE_ENV === "production" && (
					<>
						<GoogleTagManager gtmId="GTM-NQ374DTQ" />
						<GoogleAnalytics gaId="G-ZRXZN6KFKX" />
					</>
				)}
			</body>
		</html>
	)
}
