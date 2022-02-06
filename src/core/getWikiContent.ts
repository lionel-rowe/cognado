import { getLangName, LangCode, langNamesToCodes } from '../utils/langNames'
import { makeCognateFinderUrl, unwikify, wikify } from '../utils/formatters'
import { urls } from '../config'
import { ls } from '../utils/ls'

type Section = {
	toclevel: number
	text: string
	line: string
}

export const fetchWordSections = async (word: string) => {
	const res = await fetch(
		`${urls.wiktionaryRestApi}/rest_v1/page/mobile-sections/${wikify(
			word,
		)}`,
	)

	const data = await res.json()

	return data.remaining?.sections ?? ([] as Section[])
}

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

	const { text } = sections
		.slice(start, end)
		.find((x) =>
			[
				'noun',
				'verb',
				'adjective',
				'adverb',
				'pronoun',
				'preposition',
				'conjunction',
				'interjection',
				'numeral',
				'article',
				'determiner',
			].includes(x.line.trim().toLowerCase()),
		) ?? { text: '' }

	const doc = new DOMParser().parseFromString(text, 'text/html')

	const base = doc.createElement('base')
	base.href = urls.wiktionaryWeb

	doc.head.appendChild(base)

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

	return doc.querySelector('body')!
}

const cache = new Map<string, string>()

if (ls.lastSubmitted && ls.definition) {
	const { word, srcLang } = ls.lastSubmitted

	cache.set(JSON.stringify([word, srcLang]), ls.definition)
}

export const fetchWiktionaryDefinitionHtml = async (
	word: string,
	langCode: LangCode,
) => {
	const key = JSON.stringify([word, langCode])

	if (cache.has(key)) return cache.get(key)!

	let result: string

	try {
		const sections = await fetchWordSections(word)

		result =
			getDefinitionDomForLanguage(
				word,
				sections,
				getLangName(langCode),
			).querySelector('ol')?.outerHTML ?? ''
	} catch (e) {
		console.error(e)
		result = ''
	}

	cache.set(key, result)

	return result
}
