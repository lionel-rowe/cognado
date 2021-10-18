import { FormValues } from '../App'
import { Cognate } from '../core/cognates'

export const ls = new Proxy(
    {} as Partial<{
        values: FormValues
        cognates: Cognate[]
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
