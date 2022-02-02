import { urls } from '../config'
import { forceCapitalize, underscorify } from '../utils/formatters'

type WiktionaryApiSuccess = {
	parse: {
		wikitext?: {
			'*'?: string
		}
	}
}

const errorCodes = ['missingtitle'] as const

type WiktionaryApiError = {
	error: {
		'*'?: string
		code?: typeof errorCodes[number]
		info?: string
	}
}

type WikitextApiResponse = WiktionaryApiSuccess | WiktionaryApiError

const isApiError = (x: WikitextApiResponse): x is WiktionaryApiError => {
	return (x as any).error
}

type SuccessResult = {
	word: string
	kind: 'success'
	data: string
}

type ErrorResult = {
	word: string
	kind: 'error'
	error: Error
	prefetchedVariants: SuccessResult[]
}

type Result = SuccessResult | ErrorResult

const cache = new Map<string, Result>()

const fetchFromApi = async (word: string): Promise<WikitextApiResponse> => {
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
	const data: WikitextApiResponse = await res.json()

	return data
}

const createSuccessResult = (
	word: string,
	data: WiktionaryApiSuccess,
): SuccessResult => {
	const text = data.parse.wikitext?.['*'] ?? ''

	return { word, kind: 'success' as const, data: text }
}

export const fetchWiktionaryPageResult = async (
	word: string,
): Promise<Result> => {
	if (cache.has(word)) return cache.get(word)!

	const data = await fetchFromApi(word)

	if (isApiError(data)) {
		const msg = data.error.info ?? ''

		const prefetchedVariants: SuccessResult[] = []

		const variants = [
			word.toLowerCase(),
			forceCapitalize(word),
			word.toUpperCase(),
		].filter((x) => x !== word)

		for (const variant of variants) {
			if (data.error.code === 'missingtitle' && word !== variant) {
				const variantData = await fetchFromApi(variant)

				if (!isApiError(variantData)) {
					const r = createSuccessResult(variant, variantData)

					cache.set(variant, r)

					prefetchedVariants.push(r)

					// break early if 1 variant found
					// — others will typically be shown under "See also"
					// on the first variant's page
					break
				}
			}
		}

		const result = {
			word,
			kind: 'error' as const,
			error: new Error(msg),
			prefetchedVariants,
		}

		cache.set(word, result)

		return result
	} else {
		const result = createSuccessResult(word, data)

		cache.set(word, result)

		return result
	}
}
