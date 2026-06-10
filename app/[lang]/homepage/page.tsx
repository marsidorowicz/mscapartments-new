/** @format */

import { permanentRedirect } from "next/navigation"

export default async function HomepageRedirect({ params }: { params: Promise<{ lang: string }> }) {
	const { lang } = await params
	permanentRedirect(`/${lang}`)
}
