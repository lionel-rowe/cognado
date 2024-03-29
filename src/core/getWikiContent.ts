import { getLangName, LangCode, langNamesToCodes } from '../utils/langNames'
import { makeCognateFinderUrl, unwikify, wikify } from '../utils/formatters'
import { urls } from '../config'
import { ls } from '../utils/ls'
import { withCache } from '../utils/withCache'

type Section = {
	toclevel: number
	text: string
	line: string
}

const partsOfSpeech = [
	// https://en.wiktionary.org/wiki/Wiktionary:Entry_layout#Part_of_speech
	// General
	'adjective',
	'adverb',
	'ambiposition',
	'article',
	'circumposition',
	'classifier',
	'conjunction',
	'contraction',
	'counter',
	'determiner',
	'ideophone',
	'interjection',
	'noun',
	'numeral',
	'participle',
	'particle',
	'postposition',
	'preposition',
	'pronoun',
	'proper noun',
	'verb',
	// Morphemes
	'circumfix',
	'combining form',
	'infix',
	'interfix',
	'prefix',
	'root',
	'suffix',
	// Symbols and characters
	'diacritical mark',
	'letter',
	'ligature',
	'number',
	'punctuation mark',
	'syllable',
	'symbol',
	// Phrases
	'phrase',
	'proverb',
	'prepositional phrase',
	// Han characters and language-specific varieties
	'han character',
	'hanzi',
	'kanji',
	'hanja',
	// Other
	'romanization',
	'logogram',
]

// TODO: re-consider logic to allow other sections (?)

// const blacklistedSections = [
// 	'translations',
// 	'anagrams',
// 	'inflection',
// 	'coordinate terms',
// 	'derived terms',
// 	'related terms',
// 	'descendants',
// 	'see also',
// 	'references',
// 	'synonyms',
// 	'antonyms',
// 	'declension',
// ]

export const fetchWordSections = withCache(null, async (word: string) => {
	const res = await fetch(
		`${urls.wiktionaryRestApi}/rest_v1/page/mobile-sections/${wikify(
			word,
		)}`,
	)

	const data = (await res.json()) as {
		remaining?: {
			sections: Section[]
		}
	}

	const sections = data.remaining?.sections ?? []

	return sections
})

const createElement = <K extends keyof HTMLElementTagNameMap>(
	tag: K,
	props?: Partial<HTMLElementTagNameMap[K]>,
	document?: Document,
): HTMLElementTagNameMap[K] =>
	Object.assign((document ?? window.document).createElement(tag), props)

const getDefinitionDomForLanguage = (
	word: string,
	sections: Section[],
	language: string,
) => {
	const word_ = word

	const start = sections.findIndex(
		(s) => s.toclevel === 1 && s.line === language,
	)
	const _end = sections.slice(start + 1).findIndex((s) => s.toclevel === 1)
	const end = _end === -1 ? sections.length : _end + start + 1

	const relevantSections = sections
		.slice(
			start + 1,
			end,
			// ).filter((x) => !blacklistedSections.includes(x.line.trim().toLowerCase()))
		)
		.filter((x) => partsOfSpeech.includes(x.line.trim().toLowerCase()))

	const text = relevantSections
		.map((x) => {
			const hTag = 'h3'
			// const hTag = `h${x.toclevel + 1}` // +1 as already under a h2

			const headingHtml = createElement(hTag as 'h1', {
				textContent: x.line,
			}).outerHTML

			return [headingHtml, x.text].join('\n')
		})
		.join('')

	const doc = new DOMParser().parseFromString(text, 'text/html')

	doc.head.appendChild(
		createElement('base', { href: urls.wiktionaryWeb }, doc),
	)

	for (const el of doc.body.querySelectorAll('.maintenance-line')) {
		el.remove()
	}

	for (const link of doc.body.querySelectorAll<HTMLAnchorElement>(
		'a[href]',
	)) {
		const rawHref = link.getAttribute('href')!

		const originalUrl = new URL(rawHref, urls.wiktionaryWeb)

		if (originalUrl.origin !== new URL(urls.wiktionaryWeb).origin) {
			// is non-Wiktionary URL

			link.target = '_blank'
			link.rel = 'noreferrer noopener'
		} else {
			// is Wiktionary URL

			const rawWord = originalUrl.pathname.replace('/wiki/', '')
			const parsedWord = unwikify(rawWord ?? '')

			const srcLangName = originalUrl.hash.slice(1)

			const srcLangCode: LangCode = srcLangName
				? langNamesToCodes[srcLangName as keyof typeof langNamesToCodes]
				: 'eng'

			const isHashOnlyLink = rawHref.startsWith('#')

			if (
				!isHashOnlyLink &&
				(!srcLangCode || !rawWord || /[:/]/.test(rawWord))
			) {
				// is special Wiktionary URL/unrecognized language

				// not a no-op; forces href to use base URL from `head > base` of `parsed` when `innerHTML` is read
				link.href = link.href!

				link.target = '_blank'
				link.rel = 'noreferrer noopener'
			} else {
				const word = isHashOnlyLink ? word_ : parsedWord

				link.href = makeCognateFinderUrl({ word, srcLang: srcLangCode })
			}
		}
	}

	return doc.body
}

const cache = new Map<string, string>()
const keyGetter = (word: string, langCode: LangCode) =>
	JSON.stringify([word, langCode])

if (ls.lastSubmitted && ls.definition) {
	const { word, srcLang } = ls.lastSubmitted

	cache.set(keyGetter(word, srcLang), ls.definition)
}

export const fetchWiktionaryDefinitionHtml = withCache(
	{
		cache,
		keyGetter,
	},
	async (word: string, langCode: LangCode) => {
		let result: string

		try {
			const sections = await fetchWordSections(word)

			result =
				getDefinitionDomForLanguage(
					word,
					sections,
					getLangName(langCode),
				).innerHTML ?? ''
		} catch (e) {
			console.error(e)
			result = ''
		}

		return result
	},
)
