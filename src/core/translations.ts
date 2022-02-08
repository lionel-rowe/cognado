import { regex } from 'fancy-regex'

type HasGroups<T extends string> = RegExpMatchArray & {
	groups: Record<T, string>
}

// {{xyz}} syntax, used for templates in MediaWiki
// regexes with `u` flags set must escape all literal {braces}
const wrap = (...args: [x: TemplateStringsArray, ...rest: any[]]) =>
	regex`\{\{${regex(...args)}\}\}`

// for example:
// {{trans-top|meaning description here}}
// ...
// {{trans-bottom}}
const allTranslationsRegex = regex('gu')`
	${wrap`
		trans-top(?:-also)? \|
		(?:
			id=[^|}]+ \|
		)?
		(?<meaning>
			[^|}]+
		)
		(?:
			\| [^}]+
		)?
	`}
	(?<translations>[\s\S]+?)
	${wrap`trans-bottom`}
`

// for example:
// * Korean: {{tt+|ko|사람}}, {{tt+|ko|인(人)}} {{qualifier|suffix}}, {{tt+|ko|분}} {{qualifier|honorific}}
const translationLineRegex = regex('u')`
	^
		\s*\*:?\s+(?<langName>[^:]+):\s+(?<trData>.+)
	$
`

// for example:
// {{tt+|ko|분}} {{qualifier|honorific}}
// where `word` is 분
const individualTranslationRegex = regex('u')`
	^
		${wrap`t{1,2}\+?\|\w+\|(?<word>[^|}]+)(?:[^}]+)?`}
		(?:\s+${wrap`(?:[^}]+)`})*
	$
`

const cleanIndividualTranslation = (tr: string) => tr.replace(/[[\]]/g, '')

const toTranslationsObj = (translations: string) => {
	const kvs = (
		translations
			.split(/\r\n|[\r\n]/)
			.map((line) => line.match(translationLineRegex))
			.filter(Boolean) as any as HasGroups<'langName' | 'trData'>[]
	)
		.map(({ groups: { langName, trData } }) => {
			const words = trData
				.split(/\s*,\s*/)
				.map((x) => x.match(individualTranslationRegex)?.groups?.word)
				.filter(Boolean)
				.map((x) => cleanIndividualTranslation(x!))

			return words.length && [langName, words]
		})
		.filter(Boolean) as [string, string[]][]

	return Object.fromEntries(kvs)
}

export const parseTranslations = (text: string) =>
	[
		...(text.matchAll(allTranslationsRegex) as any as HasGroups<
			'meaning' | 'translations'
		>[]),
	].map(({ groups: { meaning, translations } }) => ({
		meaning,
		translations: toTranslationsObj(translations),
	}))

export type Translations = ReturnType<typeof parseTranslations>
