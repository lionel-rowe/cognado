import { LangCode } from './langNames'
import { pick } from './pick'
import { qpType, createQps, History } from './qps'

export const qpInit = {
	word: qpType.string(''),
	srcLang: qpType.string<LangCode>('spa'),
	trgLang: qpType.string<LangCode>('eng'),
	allowAffixes: qpType.boolean(false, { omitIfDefault: true }),

	page: qpType.number(1, { omitIfDefault: true }),

	shareText: qpType.string(null, { omitIfDefault: true }),
}

// https://stackoverflow.com/a/62620115/
export const initQps = (history?: History) => {
	return createQps(qpInit, history)
}

export type Qps = ReturnType<typeof initQps>

export const getFormValues = (qps: Qps) => {
	return pick(['word', 'srcLang', 'trgLang', 'allowAffixes'], qps.getAll())
}

export type FormValues = ReturnType<typeof getFormValues>
