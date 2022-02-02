import { flow } from 'fp-ts/lib/function'
import { urls } from '../config'
import { Path } from '../Routes'
import { getLangName, LangCode } from './langNames'

export const underscorify = (x: string) => x.replace(/ /g, '_')

export const wikify = flow(underscorify, encodeURIComponent)
export const unwikify = flow(decodeURIComponent, (x) => x.replace(/_/g, ' '))

export const getDefaultTrgLang = (srcLang: LangCode): LangCode => {
	const currentUrl = new URL(window.location.href)

	return (
		(currentUrl.searchParams.get(
			currentUrl.searchParams.get('trgLang') === srcLang
				? 'srcLang'
				: 'trgLang',
		) as LangCode) ?? 'eng'
	)
}

export const makeCognateFinderUrl = ({
	word,
	srcLang,
	path = Path.Cognates,
}: {
	word: string
	srcLang: LangCode
	path?: Path
}) => {
	const url = new URL(
		[process.env.PUBLIC_URL, path].join(''),
		window.location.origin,
	)

	const trgLang = getDefaultTrgLang(srcLang)

	for (const [k, v] of Object.entries({
		word,
		srcLang,
		trgLang,
	})) {
		url.searchParams.set(k, v)
	}

	return url.href
}

export const makeWiktionaryUrl = ({
	word,
	langCode,
}: {
	word: string
	langCode: LangCode
}) => {
	const url = new URL(urls.wiktionaryWeb)
	url.pathname = `/wiki/${wikify(word)}`
	url.hash = wikify(getLangName(langCode))

	return url.href
}

export const makeWiktionarySearchUrl = ({ word }: { word: string }) => {
	const url = new URL('/w/index.php', urls.wiktionaryWeb)

	url.searchParams.set('search', word)

	return url.href
}

export const toRelativeUrl = (absoluteUrl: string) =>
	absoluteUrl.replace(
		`${window.location.origin}${process.env.PUBLIC_URL}`,
		'',
	)
