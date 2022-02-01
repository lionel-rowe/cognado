import { urls } from '../config'
import { underscorify } from '../utils/formatters'

export const fetchSeeAlsos = async (word: string) => {
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

	const seeAlsos: string[] =
		data.parse.wikitext['*']
			.match(/{{(also(?:\|[^|}]+)+)}}/)?.[1]
			?.split('|')
			?.slice(1) ?? []

	return (
		seeAlsos
			// remove special pages
			.filter((x) => !/[:/]/.test(x))
			// ignore anything that couldn't be parsed
			.filter(Boolean)
	)
}
