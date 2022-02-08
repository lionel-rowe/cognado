type Options<Args extends any[], Res> = {
	keyGetter: (...args: Args) => string
	cache: Map<string, Res>
	maxSize: number
}

export const withCache = <Args extends any[], Res>(
	options: Args extends [string]
		? Partial<Options<Args, Res>> | null
		: Partial<Options<Args, Res>> & Pick<Options<Args, Res>, 'keyGetter'>,
	fn: (...args: Args) => Promise<Res>,
): ((...args: Args) => Promise<Res>) => {
	const defaults: Options<[string], any> = {
		keyGetter: (word: string) => word,
		cache: new Map(),
		maxSize: 100,
	}

	const { cache, maxSize, keyGetter } = { ...defaults, ...options }

	return async (...args: Args) => {
		const key = keyGetter(...args)

		if (cache.has(key)) return cache.get(key)!

		const result = await fn(...args)

		cache.set(key, result)

		if (cache.size > maxSize) {
			cache.delete(cache.keys().next().value)
		}

		return result
	}
}
