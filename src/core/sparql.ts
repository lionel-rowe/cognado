import { urls } from '../config'
import { withCache } from '../utils/withCache'

export type Branch = 'a' | 'b'

export const ancestor = 'ancestor'
export type Ancestor = typeof ancestor

export type SuccessResult = {
	kind: 'success'
	results: {
		bindings: Record<
			'target' | `${Ancestor}0` | `${Ancestor}${number}${Branch}`,
			{ type: 'uri'; value: string }
		>[]
	}
}

export type ErrorResult = {
	kind: 'error'
	status: number
	error: string
}

type Result = ErrorResult | SuccessResult

export const createSparqlClient = (endpoint: string) => {
	return {
		fetch: withCache(null, async (query: string): Promise<Result> => {
			const url = new URL(endpoint)

			url.searchParams.set('query', query)

			const headers = [['Accept', 'application/sparql-results+json']]

			const res = await fetch(url.href, { headers })

			const result: Result = res.ok
				? { kind: 'success', results: (await res.json()).results }
				: {
						kind: 'error',
						status: res.status,
						error: await res.text(),
				  }

			return result
		}),
	}
}

export const sparqlClient = createSparqlClient(urls.etytreeSparql)
