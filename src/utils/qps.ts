export type JsonPrimitive = null | string | number | boolean

export type JsonSerializable =
	| JsonPrimitive
	| JsonSerializable[]
	| Partial<{
			[key: string]: JsonSerializable
	  }>

type JsonSerializableTypeof = 'object' | 'string' | 'number' | 'boolean'

const isNumeric = (str: string) => str !== '' && !Number.isNaN(Number(str))

const isQuoteWrapped = (str: string) => /^"+[\s\S]*"+$/.test(str)

const stripQuotes = (str: string) => str.replace(/^"+|"+$/g, '')

const isNonStringLike = (str: string) =>
	str && (/^(?:true|false|null)$|^[{[]/.test(str) || isNumeric(str))

const serializers = {
	string: (str: string) =>
		isNonStringLike(stripQuotes(str)) ? `"${str}"` : str,
	number: JSON.stringify,
	boolean: JSON.stringify,
	object: JSON.stringify,
}

const serialize = (val: JsonSerializable) => {
	return serializers[typeof val as JsonSerializableTypeof](val as any)
}

const parse = (str: string | null) => {
	if (str == null) return undefined

	if (isQuoteWrapped(str)) {
		const inner = stripQuotes(str)

		return isNonStringLike(inner) ? str.slice(1, -1) : str
	}

	return isNonStringLike(str) ? JSON.parse(str) : str
}

const updateUrl = (url: URL, k: string, v: JsonSerializable | undefined) => {
	if (typeof v === 'undefined') {
		url.searchParams.delete(k)
	} else {
		url.searchParams.set(k, serialize(v))
	}
}

export const qps = {
	get(k: string) {
		const url = new URL(window.location.href)

		const v = url.searchParams.get(k)

		return parse(v)
	},
	set(k: string, v: JsonSerializable | undefined, pushState?: boolean) {
		const method = pushState ? 'pushState' : 'replaceState'

		const url = new URL(window.location.href)

		updateUrl(url, k, v)

		window.history[method]({}, document.title, url.href)
	},
	setMany(
		updates: {
			[k: string]: JsonSerializable | undefined
		},
		pushState?: boolean,
	) {
		const method = pushState ? 'pushState' : 'replaceState'

		const url = new URL(window.location.href)

		for (const [k, v] of Object.entries(updates)) {
			updateUrl(url, k, v)
		}

		window.history[method]({}, document.title, url.href)
	},
	getMany(ks: string[]) {
		const url = new URL(window.location.href)

		return Object.fromEntries(
			ks.map((k) => [k, parse(url.searchParams.get(k))]),
		)
	},
}
