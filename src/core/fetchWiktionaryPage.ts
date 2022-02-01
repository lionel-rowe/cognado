import { urls } from '../config'
import { underscorify } from '../utils/formatters'

export const fetchWiktionaryPage = async (word: string): Promise<string> => {
	const url = new URL(urls.wiktionaryActionApi)

	for (const [k, v] of [
		['action', 'parse'],
		['format', 'json'],
		['prop', 'wikitext'],
		['page', underscorify(word)],
	]) {
		url.searchParams.set(k, v)
	}

	const res = await fetch(url.href)

	const data = await res.json()

	return data.parse?.wikitext?.['*'] ?? ''
}
