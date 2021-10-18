import { rank } from '../utils/rank'
import { wikify, unwikify } from '../utils/formatters'
import { baseLang, getLangName, LangCode } from '../utils/langNames'
import { pipe } from 'fp-ts/function'
import { uniq } from '../utils/uniq'
import { escapeForSparqlUrl } from './escapeSparqlUrlSegment'
import { urls } from '../config'
import { sparqlClient } from './sparql'

const toLangPathSegments = (lang: LangCode) =>
    lang === baseLang ? baseLang : [baseLang, lang].join('/')

const toUri = (word: string, lang: LangCode) =>
    [
        urls.etyTreeNamespace,
        toLangPathSegments(lang),
        `__ee_1_${escapeForSparqlUrl(word)}`,
    ].join('/')

export type WordData = {
    url: string
    word: string
    langName: string
    langCode: LangCode
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

const getEtyTreePathname = (etyTreeUrl: string) => {
    try {
        return new URL(etyTreeUrl, urls.etyTreeNamespace).pathname
    } catch {
        return etyTreeUrl
    }
}

const toWordData = (etyTreePathname: string): WordData => {
    const { pathname } = new URL(etyTreePathname, urls.etyTreeNamespace)
    const [_word, code] = pathname.split('/').reverse()

    const langName = getLangName(code)
    const word = unwikify(_word.replace(/^__ee_(?:\d_)?/, ''))

    return {
        url: makeWiktionaryUrl({ word, langCode: code as LangCode }),
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
    allowPrefixesAndSuffixes: boolean
}

export const buildSparqlQuery = ({
    word,
    srcLang,
    trgLang,
    allowPrefixesAndSuffixes,
}: SparqlParams) => {
    const trgLangMatcher = `/${toLangPathSegments(trgLang)}/__`
    const uri = toUri(word, srcLang)

    const sparql = `SELECT DISTINCT * {
	BIND (<${uri}> as ?source)

	{
        ?ancestor1a dbetym:etymologicallyRelatedTo? ?ancestor0 .
        ?ancestor2a dbetym:etymologicallyRelatedTo? ?ancestor1a .
        ?source dbetym:etymologicallyRelatedTo? ?ancestor2a .

        ?ancestor1b dbetym:etymologicallyRelatedTo? ?ancestor0 .
        ?ancestor2b dbetym:etymologicallyRelatedTo? ?ancestor1b .
		?target dbetym:etymologicallyRelatedTo? ?ancestor2b .
	}

	FILTER (
		?source != ?target
	)

    FILTER (
        regex(?target, "${trgLangMatcher}", '')${
        allowPrefixesAndSuffixes
            ? ''
            : `
        && !regex(?ancestor0, "_-|-$", '')
        && !regex(?ancestor1a, "_-|-$", '')
        && !regex(?ancestor2a, "_-|-$", '')
        && !regex(?ancestor1b, "_-|-$", '')
        && !regex(?ancestor2b, "_-|-$", '')
        && !regex(?target, "_-|-$", '')`
    }
    ) .
}
GROUP BY ?target
LIMIT 500`

    return { sparql, trgLangMatcher, uri }
}

export const fetchCognates = async (
    word: string,
    srcLang: LangCode,
    trgLang: LangCode,
    allowPrefixesAndSuffixes: boolean,
): Promise<CognateResult | CognateError> => {
    const { sparql, uri } = buildSparqlQuery({
        word,
        srcLang,
        trgLang,
        allowPrefixesAndSuffixes,
    })

    const res = await sparqlClient.fetch(sparql)

    if (res.error) {
        console.error(res.error)

        return { query: sparql, ...res }
    } else {
        const bindings = res.results.bindings as Record<
            | 'target'
            | 'ancestor0'
            | 'ancestor1a'
            | 'ancestor1b'
            | 'ancestor2a'
            | 'ancestor2b',
            { type: 'uri'; value: string }
        >[]

        const etymologies = bindings.map(
            ({
                target,
                ancestor0,
                ancestor1a,
                ancestor1b,
                ancestor2a,
                ancestor2b,
            }) => {
                return {
                    ancestor: getEtyTreePathname(ancestor0.value),
                    src: pipe(
                        [
                            ancestor0,
                            ancestor1a,
                            ancestor2a,
                            { value: uri },
                        ].map((x) => getEtyTreePathname(x.value)),
                        uniq(),
                    )
                        .slice(1) // rm ancestor0
                        .filter(Boolean),
                    trg: pipe(
                        [ancestor0, ancestor1b, ancestor2b, target].map((x) =>
                            getEtyTreePathname(x.value),
                        ),
                        uniq(),
                    )
                        .slice(1) // rm ancestor0
                        .filter(Boolean),
                }
            },
        )

        const cognates = pipe(
            etymologies,

            (x) =>
                x.sort(
                    rank([
                        ({ trg }) => trg.length,
                        ({ src }) => src.length,
                        ({ trg }) => trg[trg.length - 1].length,
                    ]),
                ),

            uniq(({ trg }) => trg[trg.length - 1]),
        )

        return { query: sparql, cognates }
    }
}

export const hydrate = (raw: CognateRaw[]) =>
    pipe(
        raw.map(({ src, trg, ancestor }) => ({
            ancestor: toWordData(ancestor),
            src: src.map(toWordData),
            trg: trg.map(toWordData),
        })),
        uniq(({ trg }) => trg[trg.length - 1].url),
    )
