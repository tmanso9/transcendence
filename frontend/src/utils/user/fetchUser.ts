export const fetchUser = ( async (username: string) => {
	try {
		const result = await fetch(`/mock-data/${username}.json`)
		if (!result.ok) throw new Error('Could not fetch ' + username)
		const data = await result.json()
		return data
	} catch (error) {
		console.error(error)
		return {}
	}
})