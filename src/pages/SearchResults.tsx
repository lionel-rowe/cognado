import {
	FC,
	useEffect,
	useState,
	useMemo,
	useCallback,
	useContext,
} from 'react'
import { useForm } from 'react-hook-form'
import {
	buildSparqlQuery,
	CognateRaw,
	fetchCognates,
	hydrate,
	isCognateError,
} from '../core/cognates'
import { getLangName } from '../utils/langNames'
import { LangPair, ls } from '../utils/ls'
import { Spinner } from '../components/Spinner'
import { FormValues, getFormValues, qpInit } from '../utils/setupQps'
import { CognateSearchForm } from '../components/SearchForm'
import { Path, QpsContext } from '../Routes'
import { useHistory, useLocation } from 'react-router'
import { parseSeeAlsos } from '../core/seeAlsos'
import { parseTranslations } from '../core/translations'
import { fetchWiktionaryPageResult } from '../core/fetchWiktionaryPage'
import { createQps, pseudoHistory } from '../utils/qps'
import { Tabs } from '../components/Tabs'
import { getLangCodesFromSections } from '../core/parseMobileSections'
import clsx from 'clsx'
import { SearchHeader } from '../components/SearchHeader'
import { ExampleLinks } from '../components/ExampleLinks'
import { fetchWiktionaryDefinitionHtml } from '../core/getWikiContent'
import { Title } from '../components/Title'

type Props = {}

type Location_ = Window['location']
type Location = ReturnType<typeof useLocation>

const checkIsHome = (location: Location | Location_) =>
	location.pathname === Path.Home

const matches = (x: FormValues | null, y: FormValues | null) => {
	const truthies = [x, y].filter(Boolean)

	switch (truthies.length) {
		case 0:
			return true
		case 1:
			return false
		default:
			return Object.entries(x!).every(
				([k, v]) => y![k as keyof FormValues] === v,
			)
	}
}

export const SearchResults: FC<Props> = () => {
	const location = useLocation()
	const history = useHistory()

	const qps = useContext(QpsContext)

	const [seeAlsos, setSeeAlsos] = useState(ls.seeAlsos ?? [])
	const [translations, setTranslations] = useState(ls.translations ?? [])

	const defaultValues: FormValues = useMemo(() => getFormValues(qps), [qps])

	const form = useForm<FormValues>({
		defaultValues,
	})

	const { watch, reset } = form

	const allowAffixes = watch('allowAffixes')
	const word = watch('word')

	const [query, setQuery] = useState(
		() =>
			ls.query ??
			buildSparqlQuery({
				...getFormValues(qps),
				allowAffixes,
			}).sparql,
	)

	const [error, setError] = useState<Error | null>(null)
	const [loading, setLoading] = useState<boolean>(false)

	const [cognates, setCognates] = useState<CognateRaw[]>(ls.cognates ?? [])

	const [lastSubmitted, setLastSubmitted] = useState<FormValues | null>(
		ls.lastSubmitted ?? null,
	)

	useEffect(() => {
		if (!qps.get('word')) {
			setLastSubmitted(null)
		}
	}, [qps])

	useEffect(() => {
		if (!lastSubmitted) {
			setSeeAlsos([])
		}
	}, [lastSubmitted])

	const [definition, setDefinition] = useState(ls.definition ?? '')

	const [suggestedLangPairs, setSuggestedLangPairs] = useState<LangPair[]>(
		ls.suggestedLangPairs ?? [],
	)

	useEffect(() => {
		let canceled = false

		if (canceled) {
			return
		}

		const values = getFormValues(qps)

		if (matches(lastSubmitted, values)) {
			return
		}

		const { word, srcLang, trgLang, allowAffixes } = values

		if (!word) {
			return
		}

		setLoading(true)

		Promise.all([
			fetchCognates(word.trim(), srcLang, trgLang, allowAffixes),
			fetchWiktionaryPageResult(word.trim()),
			fetchWiktionaryDefinitionHtml(word, srcLang),
		])
			.then(([result, wiktionaryResult, definition]) => {
				const { wiktionaryText, seeAlsos } =
					wiktionaryResult.kind === 'error'
						? {
								wiktionaryText: '',
								seeAlsos:
									wiktionaryResult.prefetchedVariants.flatMap(
										(x) => [
											x.word,
											...parseSeeAlsos(x.data),
										],
									),
						  }
						: {
								wiktionaryText: wiktionaryResult.data,
								seeAlsos: parseSeeAlsos(wiktionaryResult.data),
						  }

				const translations = parseTranslations(wiktionaryText)

				const langCodesFromSections =
					getLangCodesFromSections(wiktionaryText)

				const suggestTryFlipped =
					!langCodesFromSections.includes(srcLang) &&
					langCodesFromSections.includes(trgLang)

				const suggestedLangPairs: LangPair[] = suggestTryFlipped
					? [{ srcLang: trgLang, trgLang: srcLang }]
					: langCodesFromSections.map((srcLang) => ({
							srcLang,
							trgLang,
					  }))

				setLoading(false)

				if (isCognateError(result)) {
					setError(new Error(result.error))
				} else {
					const { cognates, query } = result

					setError(null)
					setLastSubmitted(values)
					setCognates(cognates)
					setSeeAlsos(seeAlsos)
					setTranslations(translations)
					setSuggestedLangPairs(suggestedLangPairs)
					setDefinition(definition)

					setQuery(query)

					ls.lastSubmitted = values
					ls.cognates = cognates
					ls.query = query
					ls.seeAlsos = seeAlsos
					ls.translations = translations
					ls.suggestedLangPairs = suggestedLangPairs
					ls.definition = definition

					reset(values)
				}
			})
			.catch((e) => {
				setError(e)
				setLoading(false)
			})

		return () => {
			canceled = true
		}
	}, [location, lastSubmitted, qps, reset])

	const onSubmit = useCallback(
		async (values: FormValues) => {
			const u = new URL(window.location.href)

			const pseudoQps = createQps(qpInit, pseudoHistory(u))

			pseudoQps.setMany({ ...values, page: 1 })

			history.push({ pathname: Path.Definition, search: u.search })

			setLastSubmitted(values.word ? values : null)
		},
		[history],
	)

	const hydrated = useMemo(() => hydrate(cognates), [cognates])

	const relevantTranslations = useMemo(
		() =>
			lastSubmitted?.trgLang
				? translations
						.map(({ meaning, translations }) => ({
							meaning,
							translations:
								translations[
									getLangName(lastSubmitted.trgLang ?? '') ??
										''
								],
							trgLang: lastSubmitted.trgLang,
						}))
						.filter((x) => x.translations)
				: [],
		[translations, lastSubmitted?.trgLang],
	)

	const isHome = checkIsHome(location)

	return (
		<>
			<Title>
				{isHome
					? 'Home'
					: loading || !lastSubmitted
					? 'Loading...'
					: `Results for “${lastSubmitted.word}” (${getLangName(
							lastSubmitted.srcLang,
					  )} → ${getLangName(lastSubmitted.trgLang)})`}
			</Title>
			<div
				className={clsx([
					'search-results__ancestor',
					isHome && 'search-results__ancestor--home-page',
				])}
			>
				<div
					className={clsx([
						'search-results__outer',
						isHome && 'search-results__outer--home-page',
					])}
				>
					<SearchHeader />

					<CognateSearchForm
						{...{
							form,
							onSubmit,
							seeAlsos: isHome ? [] : seeAlsos,
						}}
					/>

					{isHome ? (
						<ExampleLinks />
					) : loading ? (
						<Spinner />
					) : !lastSubmitted ? (
						<div className='y-margins grayed-out'>
							Enter a word to search for
						</div>
					) : (
						<Tabs
							{...{
								definition,
								word,
								lastSubmitted,
								translations: relevantTranslations,
								cognates: hydrated,
								query,
								error,
								suggestedLangPairs,
							}}
						/>
					)}
				</div>
			</div>
		</>
	)
}
