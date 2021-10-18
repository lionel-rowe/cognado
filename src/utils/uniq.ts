import { pipe } from 'fp-ts/lib/function'

const addIfNotExists = <T>(val: T) => (set: Set<T>) => {
    const alreadyExisted = set.has(val)

    if (!alreadyExisted) set.add(val)

    return !alreadyExisted
}

export const uniq = <T>(...getters: (keyof T | ((x: T) => any))[]) => (
    arr: T[],
) => {
    if (!getters.length) getters.push((x) => x)

    const getterFns = getters.map((g) =>
        typeof g === 'string' ? (x: T) => x[g] : g,
    ) as ((x: T) => any)[]

    const caches = getterFns.map(() => new Set<T>())

    return arr.filter((x) =>
        getterFns.reduce(
            (val, getter, idx) =>
                pipe(caches[idx], addIfNotExists(getter(x))) || val,
            false as boolean,
        ),
    )
}
