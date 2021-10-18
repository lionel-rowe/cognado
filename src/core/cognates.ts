import { rank } from '../utils/rank'
import { wikify, unwikify } from '../utils/formatters'
import { baseLang, getLangName, LangCode } from '../utils/langNames'
import { pipe } from 'fp-ts/function'
import { uniq } from '../utils/uniq'
import { escapeForSparqlUrl } from './escapeForSparqlUrl'
import { urls } from '../config'

const createSparqlClient = (endpoint: string) => {
    return {
        fetch: async (sparql: string) => {
            const url = new URL(endpoint)

            url.searchParams.set('query', sparql)

            const headers = [['Accept', 'application/sparql-results+json']]

            const res = await fetch(url.href, { headers })

            if (!res.ok) return { status: res.status, error: await res.text() }

            return await res.json()
        },
    }
}

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

const toWordData = (etyTreeUrl: string): WordData => {
    const { pathname } = new URL(etyTreeUrl)
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

const sparqlClient = createSparqlClient(urls.etyTreeSparql)

// for debug/quick testing
;(window as any).sparqlClient = sparqlClient

export type Cognate = {
    ancestor: WordData
    src: WordData[]
    trg: WordData[]
}

type CognateResult = {
    query: string
    cognates: Cognate[]
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
	{
        ?ancestor1a dbetym:etymologicallyRelatedTo? ?ancestor0 .
        ?ancestor2a dbetym:etymologicallyRelatedTo? ?ancestor1a .
        <${uri}> dbetym:etymologicallyRelatedTo? ?ancestor2a .

        ?ancestor1b dbetym:etymologicallyRelatedTo? ?ancestor0 .
        ?ancestor2b dbetym:etymologicallyRelatedTo? ?ancestor1b .
		?target dbetym:etymologicallyRelatedTo? ?ancestor2b .
	}

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
                    ancestor: ancestor0.value,
                    src: pipe(
                        [ancestor0, ancestor1a, ancestor2a, { value: uri }].map(
                            (x) => x?.value,
                        ),
                        uniq(),
                    )
                        .slice(1) // rm ancestor0
                        .filter(Boolean),
                    trg: pipe(
                        [ancestor0, ancestor1b, ancestor2b, target].map(
                            (x) => x?.value,
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
                x
                    .map(({ src, trg, ancestor }) => ({
                        ancestor: toWordData(ancestor),
                        src: src.map(toWordData),
                        trg: trg.map(toWordData),
                    }))
                    .sort(
                        rank([
                            ({ trg }) => trg.length,
                            ({ src }) => src.length,
                            ({ trg }) => trg[trg.length - 1].url.length,
                        ]),
                    ),

            uniq(({ trg }) => trg[trg.length - 1].url),
        )

        return { query: sparql, cognates }
    }
}
