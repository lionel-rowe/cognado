export function pick<T, K extends string & keyof T>(ks: K[], o: T): Pick<T, K> {
	return Object.fromEntries(
		Object.entries(o).filter(([k]) => ks.includes(k as K)),
	) as Pick<T, K>
}
