import { getLangName, LangCode } from '../utils/langNames'
import { wikify } from '../utils/formatters'
import { urls } from '../config'

type Section = {
	toclevel: number
	text: string
	line: string
}

export const fetchWordSections = async (word: string) => {
	const res = await fetch(
		`${urls.wiktionaryApi}/rest_v1/page/mobile-sections/${wikify(word)}`,
	)

	const data = await res.json()

	return data.remaining.sections as Section[]
}

const getDefinitionDomForLanguage = (sections: Section[], language: string) => {
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
			].includes(x.line.toLowerCase()),
		) ?? { text: '' }

	const parsed = new DOMParser().parseFromString(text, 'text/html')

	const base = document.createElement('base')
	base.href = urls.wiktionaryWeb

	parsed.querySelector('head')?.appendChild(base)

	for (const link of (parsed
		.querySelector('body')!
		.querySelectorAll('a') as any) as HTMLLinkElement[]) {
		link.href = link.href! // forces absolute with `base` element in head

		link.target = '_blank'
		link.rel = 'noreferrer noopener'
	}

	return parsed.querySelector('body')!
}

const cache = new Map<string, string>()

export const fetchWiktionaryDefinitionHtml = async (
	word: string,
	langCode: LangCode,
) => {
	const key = JSON.stringify({ word, langCode })

	if (cache.has(key)) return cache.get(key)

	let result: string

	try {
		const sections = await fetchWordSections(word)

		result =
			getDefinitionDomForLanguage(
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
