import { buildSparqlQuery } from './core/cognates'
import { sparqlClient } from './core/sparql'
import { getLangName } from './utils/langNames'
import { ls } from './utils/ls'

export const exposeGlobals = () => {
	if (process.env.NODE_ENV === 'development') {
		Object.entries({
			getLangName,
			sparqlClient,
			ls,
			buildSparqlQuery,
		}).forEach(([key, val]) => {
			;(window as any)[key] = val
		})
	}
}
