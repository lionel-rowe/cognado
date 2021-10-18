import { flow } from 'fp-ts/lib/function'

type Getter<T, R extends unknown = unknown> = (x: T) => R

export enum Order {
	Asc = 1,
	Desc = -1,
}
const toRanker = <T>(rankFn: Getter<T>) => flow(rankFn, Number)

export function rank<T>(
	rankFn?: Getter<T> | Getter<T>[],
	order?: Order,
): (a: T, b: T) => number {
	const rankFns = !rankFn
		? [(x: T) => x]
		: Array.isArray(rankFn)
		? rankFn
		: [rankFn]

	order ??= Order.Asc

	const rankers = rankFns.map(toRanker)

	return (a: T, b: T) => {
		for (const ranker of rankers) {
			const result = ranker(a) - ranker(b)

			if (result) {
				return order! * result
			}
		}

		return 0
	}
}
