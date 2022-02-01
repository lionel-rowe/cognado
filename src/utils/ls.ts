import { FormValues } from '../utils/setupQps'
import { CognateRaw } from '../core/cognates'

const pseudoTarget = {
	get values() {
		return undefined
	},
	get cognates() {
		return undefined
	},
	get query() {
		return undefined
	},
} as Partial<{
	values: FormValues
	cognates: CognateRaw[]
	query: string
	wiktionaryUrl: string | null
	seeAlsos: string[]
}>

export const ls = new Proxy(pseudoTarget, {
	get(_t, p: string) {
		const raw = localStorage.getItem(p)

		try {
			return raw ? JSON.parse(raw) : undefined
		} catch {
			return undefined
		}
	},
	set(_t, p: string, v) {
		try {
			localStorage.setItem(p, JSON.stringify(v))

			return true
		} catch {
			return false
		}
	},
	deleteProperty(_t, p: string) {
		localStorage.removeItem(p)

		return true
	},
})

if ((ls.cognates?.[0]?.ancestor as any)?.langName) {
	// incompatible data format

	for (const key of Object.keys(pseudoTarget)) {
		delete ls[key as keyof typeof pseudoTarget]
	}
}
