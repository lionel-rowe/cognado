import { sparqlClient } from './core/sparql'
import { getLangName } from './utils/langNames'
import { ls } from './utils/ls'
import { qps } from './utils/setupQps'

export const exposeGlobals = () => {
	Object.entries({
		getLangName,
		sparqlClient,
		ls,
		qps,
	}).forEach(([key, val]) => {
		;(window as any)[key] = val
	})
}
