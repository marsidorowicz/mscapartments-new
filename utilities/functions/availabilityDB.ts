/** @format */

// New DB-only availability functions
export async function searchAvailableDB({ data }: { data: { fromdate: string; todate: string; guests: number; id: string } }) {
	const options = {
		method: "POST",
		headers: {
			accept: "application/json",
			"content-type": "application/json",
		},
		body: JSON.stringify(data),
	}
	try {
		const response = await fetch(`/api/availability/re-db`, options)
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`)
		}
		const data = await response.json()
		return data
	} catch (error) {
		console.log("Error searching available (DB-first):", error)
		return null
	}
}

export async function searchAvailableOnePropertyDB({ data }: { data: { fromdate: string; todate: string; guests: number; id: string; propertyName: string } }) {
	const options = {
		method: "POST",
		headers: {
			accept: "application/json",
			"content-type": "application/json",
		},
		body: JSON.stringify(data),
	}
	try {
		const response = await fetch(`/api/availability/reOne-db`, options)
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`)
		}
		const data = await response.json()
		return data
	} catch (error) {
		console.log("Error searching available for one property (DB-first):", error)
		return null
	}
}
