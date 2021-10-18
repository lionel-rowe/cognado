import { FormValues } from '../App'
import { CognateRaw } from '../core/cognates'

export const ls = new Proxy(
    {
		get values() { return undefined },
		get cognates() { return undefined },
		get query() { return undefined },
	} as Partial<{
        values: FormValues
        cognates: CognateRaw[]
        query: string
    }>,
    {
        get(_t, p) {
            const raw = localStorage.getItem(p as string)

            try {
                return raw ? JSON.parse(raw) : raw
            } catch {
                return raw
            }
        },
        set(_t, p, v) {
            try {
                localStorage.setItem(p as string, JSON.stringify(v))

                return true
            } catch {
                return false
            }
        },
    },
)

if ((ls.cognates?.[0]?.ancestor as any)?.langName) {
    // incompatible data format
    ls.cognates = []
}

;(window as any).ls = ls
