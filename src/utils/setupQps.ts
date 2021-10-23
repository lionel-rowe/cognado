import { LangCode } from './langNames'
import { pick } from './pick'
import { qpType, createQps } from './qps'

const qpInit = {
	word: qpType.string(''),
	srcLang: qpType.string<LangCode>('spa'),
	trgLang: qpType.string<LangCode>('eng'),
	allowPrefixesAndSuffixes: qpType.boolean(false, { omitIfDefault: true }),

	page: qpType.number(1, { omitIfDefault: true }),

	shareText: qpType.string(null, { omitIfDefault: true }),
}

export const qps = createQps(qpInit)

export type Qps = typeof qps

export const getFormValues = (qps: Qps) => {
	return pick(
		['word', 'srcLang', 'trgLang', 'allowPrefixesAndSuffixes'],
		qps.getAll(),
	)
}

export type FormValues = ReturnType<typeof getFormValues>
