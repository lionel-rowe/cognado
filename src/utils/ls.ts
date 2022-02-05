import type { FormValues } from '../utils/setupQps'
import type { CognateRaw } from '../core/cognates'
import type { Translations } from '../core/translations'
import type { Variant } from '../components/ColorSchemeSwitcher'

const namespace = process.env.PUBLIC_URL.slice(1)
const ns = (s: string) => (namespace ? `${namespace}::${s}` : s)

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
	translations: Translations
	suggestTryFlipped: boolean
	colorSchemeOverride: Variant
}>

export const ls = new Proxy(pseudoTarget, {
	get(_t, p: string) {
		const raw = localStorage.getItem(ns(p))

		try {
			return raw ? JSON.parse(raw) : undefined
		} catch {
			return undefined
		}
	},
	set(_t, p: string, v) {
		try {
			localStorage.setItem(ns(p), JSON.stringify(v))

			return true
		} catch {
			return false
		}
	},
	deleteProperty(_t, p: string) {
		localStorage.removeItem(ns(p))

		return true
	},
})

if ((ls.cognates?.[0]?.ancestor as any)?.langName) {
	// incompatible data format

	for (const key of Object.keys(pseudoTarget)) {
		delete ls[key as keyof typeof pseudoTarget]
	}
}
