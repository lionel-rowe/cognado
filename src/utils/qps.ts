const updateUrl = <T>(
	url: URL,
	k: string,
	v: T,
	serialize: (str: T) => string | null,
) => {
	const val = serialize(v)

	if (val == null) {
		url.searchParams.delete(k)
	} else {
		url.searchParams.set(k, val)
	}
}

type QueryOpts<
	T extends unknown = any,
	D extends unknown = any,
	S extends string | null = string,
> = {
	parse: (val: string) => T
	serialize: (val: T) => S
	defaultValue: D
}

type QpsInit<T extends Record<keyof T, QueryOpts>> = {
	[K in keyof T]: T[K]
}

export type RawQpTypes<T extends Record<string, QueryOpts>> = {
	[k in keyof T]: ReturnType<T[k]['parse']> | T[k]['defaultValue']
}

const historyFn = (method: 'pushState' | 'replaceState') =>
	(({ search }: URL) => {
		const url = new URL(window.location.href)

		url.search = search

		window.history[method]({}, document.title, url.href)
	}) as ({ search }: Pick<URL, 'search'>) => void

export type History = {
	push: ({ search }: Pick<URL, 'search'>) => void
	replace: ({ search }: Pick<URL, 'search'>) => void
}

export const createQps = <T extends Record<keyof T, QueryOpts<any, any, any>>>(
	init: QpsInit<T>,
	history: History = {
		push: historyFn('pushState'),
		replace: historyFn('replaceState'),
	},
) => {
	return {
		get<K extends keyof T & string>(
			k: K,
		): ReturnType<T[K]['parse']> | T[K]['defaultValue'] {
			const url = new URL(window.location.href)

			const v = url.searchParams.get(k)

			return v == null ? init[k].defaultValue : init[k].parse(v)
		},
		set<K extends keyof T & string, V extends ReturnType<T[K]['parse']>>(
			k: K,
			v: V,
			pushState?: boolean,
		) {
			const url = new URL(window.location.href)

			updateUrl(url, k, v, init[k].serialize)

			const { search } = url

			// no-op if same location
			if (search === window.location.search) return

			history[pushState ? 'push' : 'replace']({ search })
		},
		delete<K extends keyof T & string>(k: K, pushState?: boolean): void {
			const url = new URL(window.location.href)

			url.searchParams.delete(k)

			const { search } = url

			history[pushState ? 'push' : 'replace']({ search })
		},
		setMany(
			updates: Partial<{
				[k in keyof T]: ReturnType<T[k]['parse']>
			}>,
			pushState?: boolean,
		) {
			const url = new URL(window.location.href)

			for (const [k, v] of Object.entries(updates)) {
				// if unrecognized query param, just convert to string
				const serialize = init[k as keyof T]?.serialize ?? String

				updateUrl(url, k, v, serialize)
			}

			const { search } = url

			history[pushState ? 'push' : 'replace']({ search })
		},
		getMany<K extends keyof T & string>(
			ks: K[],
		): {
			[k in K]: ReturnType<T[k]['parse']> | T[k]['defaultValue']
		} {
			const url = new URL(window.location.href)

			return Object.fromEntries(
				ks.map((k) => {
					const val = url.searchParams.get(k)

					return [
						k,
						val == null ? init[k].defaultValue : init[k].parse(val),
					]
				}),
			) as {
				[k in K]: ReturnType<T[k]['parse']> | T[k]['defaultValue']
			}
		},
		getAll(): RawQpTypes<T> {
			const url = new URL(window.location.href)

			return Object.fromEntries(
				Object.keys(init).map((k) => {
					const val = url.searchParams.get(k)
					const key = k as keyof typeof init

					return [
						k,
						val == null
							? init[key].defaultValue
							: init[key].parse(val),
					]
				}),
			) as RawQpTypes<T>
		},
	}
}

type QpTypeOptions = {
	omitIfDefault: boolean
}

const defaultQpTypeOptions: QpTypeOptions = {
	omitIfDefault: false,
}

type SerializeVal<T extends QpTypeOptions> = T extends {
	omitIfDefault: true
}
	? string | null
	: string

const applyOptions = <A extends any, B extends any, O extends QpTypeOptions>(
	queryOpts: QueryOpts<A, B, string>,
	opts?: O,
) => {
	const { parse, serialize, defaultValue } = queryOpts

	const { omitIfDefault } = {
		...defaultQpTypeOptions,
		...opts,
	}

	const serialize_ = omitIfDefault
		? (val: A) => (val === defaultValue ? null : serialize(val))
		: serialize

	return {
		parse,
		serialize: serialize_,
		defaultValue,
	} as QueryOpts<A, B, SerializeVal<O>>
}

export const qpType = {
	number: <D extends number | null, O extends QpTypeOptions>(
		defaultValue: D,
		opts?: O,
	) => {
		return applyOptions(
			{
				parse: Number,
				serialize: String,
				defaultValue,
			},
			opts,
		)
	},

	boolean: <D extends boolean | null, O extends QpTypeOptions>(
		defaultValue: D,
		opts?: O,
	) => {
		return applyOptions(
			{
				parse: (x: string) => x === 'true',
				serialize: String,
				defaultValue,
			},
			opts,
		)
	},

	string: <
		T extends string = string,
		D extends T | null = T,
		O extends QpTypeOptions = QpTypeOptions,
	>(
		defaultValue: D,
		opts?: O,
	) => {
		return applyOptions(
			{
				parse: (x: string) => x as T,
				serialize: (x: T) => x,
				defaultValue,
			},
			opts,
		)
	},

	json: <
		T extends any = any,
		D extends any = T,
		O extends QpTypeOptions = QpTypeOptions,
	>(
		defaultValue: D,
		opts?: O,
	) => {
		return applyOptions(
			{
				parse: JSON.parse,
				serialize: JSON.stringify,
				defaultValue,
			},
			opts,
		)
	},
}
export const getQpDefaults = <T extends Record<string, QueryOpts>>(
	x: T,
): RawQpTypes<T> => {
	return Object.fromEntries(
		Object.entries(x).map(([k, v]) => [k, v.defaultValue]),
	) as RawQpTypes<T>
}
