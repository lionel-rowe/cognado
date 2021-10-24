import { sparqlClient } from './core/sparql'
import { getLangName } from './utils/langNames'
import { ls } from './utils/ls'

export const exposeGlobals = () => {
	Object.entries({
		getLangName,
		sparqlClient,
		ls,
	}).forEach(([key, val]) => {
		;(window as any)[key] = val
	})
}
