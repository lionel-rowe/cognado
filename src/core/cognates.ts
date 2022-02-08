import { rank } from '../utils/rank'
import { unwikify } from '../utils/formatters'
import { baseLang, getLangName, LangCode } from '../utils/langNames'
import { pipe } from 'fp-ts/function'
import { uniq } from '../utils/uniq'
import { escapeForSparqlUrl } from './escapeSparqlUrlSegment'
import { urls } from '../config'
import { ancestor, Branch, sparqlClient } from './sparql'
import { regex } from 'fancy-regex'

const toLangPathSegments = (lang: LangCode) =>
	lang === baseLang ? baseLang : [baseLang, lang].join('/')

const toEtyTreeUri = (word: string, lang: LangCode) =>
	[
		urls.etytreeNamespace,
		toLangPathSegments(lang),
		`__ee_1_${escapeForSparqlUrl(word)}`,
	].join('/')

export type WordData = {
	word: string
	langName: string
	langCode: LangCode
}

const getEtyTreePathname = (etytreeUrl: string) => {
	try {
		return new URL(etytreeUrl, urls.etytreeNamespace).pathname
	} catch {
		return etytreeUrl
	}
}

const toWordData = (etytreePathname: string): WordData => {
	const { pathname } = new URL(etytreePathname, urls.etytreeNamespace)
	const [_word, code] = pathname.split('/').reverse()

	const langName = getLangName(code)
	const word = unwikify(_word.replace(/^__ee_(?:\d_+)?/, ''))

	return {
		word,
		langName,
		langCode: code as LangCode,
	}
}

export type CognateRaw = {
	ancestor: string
	src: string[]
	trg: string[]
}

export type CognateHydrated = {
	ancestor: WordData
	src: WordData[]
	trg: WordData[]
}

type CognateResult = {
	query: string
	cognates: CognateRaw[]
}

type CognateError = {
	query: string
	error: string
	code?: number
}

export const isCognateError = (
	x: CognateResult | CognateError,
): x is CognateError => {
	return !!(x as any).error
}

type SparqlParams = {
	word: string
	srcLang: LangCode
	trgLang: LangCode
	allowAffixes: boolean
	depth?: number
}

export const buildSparqlQuery = ({
	word,
	srcLang,
	trgLang,
	allowAffixes,
	depth = 3,
}: SparqlParams) => {
	const trgLangMatcher = `/${toLangPathSegments(trgLang)}/__`
	const uri = toEtyTreeUri(word, srcLang)

	const source = '?source'
	const target = '?target'
	const makeAncestor = (level: number, branchId?: Branch) =>
		`?${ancestor}${level}${branchId ?? ''}`
	const etymologicallyRelatedTo = 'dbetym:etymologicallyRelatedTo?'

	const makeWalker = (varName: string, branchId: Branch, depth: number) =>
		[...new Array(depth)]
			.map(
				(_, i, arr) =>
					`\t\t${
						i === arr.length - 1
							? varName
							: makeAncestor(i + 1, branchId)
					} ${etymologicallyRelatedTo} ${
						i === 0 ? makeAncestor(0) : makeAncestor(i, branchId)
					} .`,
			)
			.join('\n')

	const walkers = [
		makeWalker(source, 'a', depth),
		makeWalker(target, 'b', depth),
	].join('\n\n')

	const toAffixExcluderLine = (varName: string) =>
		`\t\t&& !regex(${varName}, "_-|-$", '')`

	const affixExcluders = allowAffixes
		? ''
		: '\n' +
		  [...new Array(depth)]
				.flatMap((_, i) =>
					i === 0
						? [
								toAffixExcluderLine('?target'),
								toAffixExcluderLine(makeAncestor(0)),
						  ]
						: [
								toAffixExcluderLine(makeAncestor(i, 'a')),
								toAffixExcluderLine(makeAncestor(i, 'b')),
						  ],
				)
				.join('\n')

	const sparql = `SELECT DISTINCT * {
	BIND (<${uri}> as ${source})

	{
${walkers}
	}

	FILTER (
		${source} != ${target}
		&& regex(${target}, "${trgLangMatcher}", '')${affixExcluders}
	) .
}
GROUP BY ${target}
LIMIT 500`

	return { sparql, trgLangMatcher, uri }
}

export const fetchCognates = async (
	word: string,
	srcLang: LangCode,
	trgLang: LangCode,
	allowAffixes: boolean,
): Promise<CognateResult | CognateError> => {
	const { sparql, uri } = buildSparqlQuery({
		word,
		srcLang,
		trgLang,
		allowAffixes,
	})

	const res = await sparqlClient.fetch(sparql)

	if (res.kind === 'error') {
		console.error(res.error)

		return { query: sparql, ...res }
	} else {
		const bindings = res.results.bindings

		const etymologies = bindings.map((binding) => {
			const { target, ancestor0 } = binding

			const toAncestorRegex = (branchId: Branch) =>
				regex`^${ancestor}\d${branchId}$`

			const toAncestorVals = (branchId: Branch) => {
				const re = toAncestorRegex(branchId)

				return Object.entries(binding)
					.filter(([k]) => re.test(k))
					.map(([, v]) => v)
			}

			const aAncestorVals = toAncestorVals('a')

			const bAncestorVals = toAncestorVals('b')

			return {
				ancestor: getEtyTreePathname(ancestor0.value),
				src: pipe(
					[ancestor0, ...aAncestorVals, { value: uri }].map((x) =>
						getEtyTreePathname(x.value),
					),
					uniq(),
				)
					.slice(1) // rm ancestor0
					.filter(Boolean),
				trg: pipe(
					[ancestor0, ...bAncestorVals, target].map((x) =>
						getEtyTreePathname(x.value),
					),
					uniq(),
				)
					.slice(1) // rm ancestor0
					.filter(Boolean),
			}
		})

		const cognates = pipe(
			etymologies,

			(x) =>
				x.sort(
					rank([
						({ trg }) => trg.length,
						({ src }) => src.length,
						({ trg }) => trg[trg.length - 1]?.length,
					]),
				),

			uniq(({ trg }) => trg[trg.length - 1]),
		)

		return { query: sparql, cognates }
	}
}

export const hydrate = (raw: CognateRaw[]): CognateHydrated[] =>
	pipe(
		raw.map(({ src, trg, ancestor }) => ({
			ancestor: toWordData(ancestor),
			src: src.map(toWordData),
			trg: trg.map(toWordData),
		})),
		uniq(
			({ trg }) => trg[trg.length - 1]?.langCode,
			({ trg }) => trg[trg.length - 1]?.word,
		),
	)
