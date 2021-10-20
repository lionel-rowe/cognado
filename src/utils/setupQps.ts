import { LangCode } from './langNames'
import { qpType, createQps } from './qps'

const qpInit = {
	word: qpType.string(''),
	srcLang: qpType.string<LangCode>('spa'),
	trgLang: qpType.string<LangCode>('eng'),
	allowPrefixesAndSuffixes: qpType.boolean(false, { omitIfDefault: true }),

	page: qpType.number(1, { omitIfDefault: true }),
}

export const qps = createQps(qpInit)

export const { page: pageNum, ...formValues } = qps.getAll()

export type FormValues = typeof formValues
