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
import { usePagination } from '../hooks/usePagination'
import { getLangName } from '../utils/langNames'
import { ls } from '../utils/ls'
import { urls } from '../config'
import { Spinner } from '../components/Spinner'
import { Pagination } from '../components/Pagination'
import { CognatesList } from '../components/CognatesList'
import { GitHubCorner } from '../components/GitHubCorner'
import { RootErrorBoundary } from '../components/RootErrorBoundary'
import { FormValues, getFormValues } from '../utils/setupQps'
import { CognateSearchForm } from '../components/CognateSearchForm'
import { QpsContext } from '../Routes'
import { useLocation } from 'react-router'
import { CognateLink } from '../components/CognateLink'
import { parseSeeAlsos } from '../core/seeAlsos'
import { parseTranslations } from '../core/translations'
import { fetchWiktionaryPage } from '../core/fetchWiktionaryPage'
import { Translations } from '../components/Translations'

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

export const Search: FC = () => {
	const location = useLocation()
	const qps = useContext(QpsContext)

	const [seeAlsos, setSeeAlsos] = useState(ls.seeAlsos ?? [])
	const [translations, setTranslations] = useState(ls.translations ?? [])

	// effect - run before first render
	useMemo(() => {
		const lsVals = ls.values

		const hasSearch = window.location.search.length > 1

		if (!hasSearch && lsVals) {
			qps.setMany(lsVals)
		}
	}, [qps])

	const defaultValues: FormValues = useMemo(() => getFormValues(qps), [qps])

	const form = useForm<FormValues>({
		defaultValues,
	})

	const { watch, reset } = form

	const allowPrefixesAndSuffixes = watch('allowPrefixesAndSuffixes')
	const word = watch('word')

	const [query, setQuery] = useState(
		() =>
			ls.query ??
			buildSparqlQuery({
				...getFormValues(qps),
				allowPrefixesAndSuffixes,
			}).sparql,
	)

	const [error, setError] = useState<Error | null>(null)
	const [loading, setLoading] = useState<boolean>(false)

	const [cognates, setCognates] = useState<CognateRaw[]>(ls.cognates ?? [])
	const [lastSubmitted, setLastSubmitted] = useState<FormValues | null>(
		ls.values ?? null,
	)

	useEffect(() => {
		if (!matches(lastSubmitted, getFormValues(qps))) {
			const values = getFormValues(qps)

			const { word, srcLang, trgLang, allowPrefixesAndSuffixes } = values

			if (!word) {
				setCognates([])
				setLastSubmitted(null)
			} else {
				setLastSubmitted(values)
			}

			setLoading(true)

			Promise.all([
				fetchCognates(
					word.trim(),
					srcLang,
					trgLang,
					allowPrefixesAndSuffixes,
				),
				fetchWiktionaryPage(word.trim()),
			]).then(([result, wiktionaryPage]) => {
				const translations = parseTranslations(wiktionaryPage)
				const seeAlsos = parseSeeAlsos(wiktionaryPage)

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

					setQuery(query)

					ls.values = values
					ls.cognates = cognates
					ls.query = query
					ls.seeAlsos = seeAlsos
					ls.translations = translations

					reset(values)
				}
			})
		}
	}, [location, lastSubmitted, qps, reset])

	const { page, setPage, pageStart, pageEnd, maxPageNo } = usePagination(
		cognates,
		{ pageSize: 50, startPage: qps.get('page') },
	)

	const updatePage = useCallback(
		(n: number, pushState?: boolean) => {
			setPage(n)

			qps.set('page', n, pushState)
		},
		[setPage, qps],
	)

	const updateValues = useCallback(
		async (values: FormValues) => {
			qps.setMany(values, true)
		},
		[qps],
	)

	const onSubmit = useCallback(
		async (values: FormValues) => {
			updateValues(values)
			updatePage(1, false)
		},
		[updateValues, updatePage],
	)

	useEffect(() => {
		const { values } = ls

		const hasQueryParams = window.location.search.length > 1

		const formValues = getFormValues(qps)

		if (!values && !hasQueryParams) {
			const initialSearchValues = {
				...formValues,
				word: 'dedo',
			}

			reset(initialSearchValues)

			onSubmit(initialSearchValues)

			return
		} else if (values) {
			const isLatest = Object.entries(formValues).every(([k, v]) => {
				return values[k as keyof typeof values] === v
			})

			if (!isLatest) {
				onSubmit(formValues)
			}
		}

		// only run once on mount
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const hydrated = useMemo(() => hydrate(cognates), [cognates])

	const relevantTranslations = useMemo(
		() =>
		lastSubmitted?.trgLang ?
			translations
				.map(({ meaning, translations }) => ({
					meaning,
					translations:
						translations[
							getLangName(lastSubmitted.trgLang ?? '') ?? ''
						],
					trgLang: lastSubmitted.trgLang,
				}))
				.filter((x) => x.translations) : [],
		[translations, lastSubmitted?.trgLang],
	)

				console.log({translations,relevantTranslations})

	return (
		<>
			<RootErrorBoundary>
				<GitHubCorner
					target='_blank'
					title='See project on GitHub'
					rel='noreferrer noopener'
					href={urls.github}
				/>

				<main className='container'>
					<h1>Cognate finder</h1>

					<CognateSearchForm {...{ form, onSubmit, seeAlsos }} />

					{loading || !lastSubmitted ? (
						<Spinner />
					) : (
						<>
							<div className='y-margins'>
								<CognateLink
									word={lastSubmitted.word}
									langCode={lastSubmitted.srcLang}
								/>
							</div>

							<div className='y-margins'>
								<Translations
									translations={relevantTranslations}
								/>
							</div>

							{cognates.length ? (
								<>
									<div>
										Total {cognates.length} results | Page{' '}
										{
											<Pagination
												{...{
													page,
													maxPageNo,
													setPage: updatePage,
												}}
											/>
										}
									</div>
								</>
							) : null}

							<br />

							<div>
								{error ? (
									<div>
										<strong>Error:</strong> {error.message}
									</div>
								) : cognates.length ? (
									<>
										<CognatesList
											{...{
												cognates: hydrated,
												pageStart,
												pageEnd,
											}}
										/>
										<br />
										Page{' '}
										{
											<Pagination
												{...{
													page,
													maxPageNo,
													setPage: updatePage,
												}}
											/>
										}
									</>
								) : word === lastSubmitted?.word ? (
									word ? (
										`No ${getLangName(
											lastSubmitted.trgLang,
										)} cognates found for ${getLangName(
											lastSubmitted.srcLang,
										)} "${word}"`
									) : (
										'Enter a word to search for'
									)
								) : (
									'Click "Search" to find cognates'
								)}

								<br />
								{cognates.length && word && query ? (
									<>
										<br />
										<details>
											<summary>Show raw query</summary>

											<pre>{query}</pre>
										</details>
									</>
								) : null}
								<br />
								<br />
							</div>
						</>
					)}
				</main>
			</RootErrorBoundary>
		</>
	)
}
