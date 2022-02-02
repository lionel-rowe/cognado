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
import { ls } from '../utils/ls'
import { urls } from '../config'
import { Spinner } from '../components/Spinner'
import { GitHubCorner } from '../components/GitHubCorner'
import { RootErrorBoundary } from '../components/RootErrorBoundary'
import { FormValues, getFormValues, qpInit } from '../utils/setupQps'
import { CognateSearchForm } from '../components/CognateSearchForm'
import { Path, QpsContext } from '../Routes'
import { useHistory, useLocation } from 'react-router'
import { parseSeeAlsos } from '../core/seeAlsos'
import { parseTranslations } from '../core/translations'
import { fetchWiktionaryPage } from '../core/fetchWiktionaryPage'
import { createQps, pseudoHistory } from '../utils/qps'
import { Tabs } from '../components/Tabs'
import { containsSectionForLanguage } from '../core/containsSectionForLanguage'

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

export const SearchResults: FC = () => {
	const location = useLocation()
	const history = useHistory()

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

	const [suggestTryFlipped, setSuggestTryFlipped] = useState(false)

	useEffect(() => {
		if (!matches(lastSubmitted, getFormValues(qps))) {
			const values = getFormValues(qps)

			const { word, srcLang, trgLang, allowPrefixesAndSuffixes } = values

			if (!word) {
				setCognates([])

				return
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
				const suggestTryFlipped = containsSectionForLanguage(
					trgLang,
					wiktionaryPage,
				)

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
					setSuggestTryFlipped(suggestTryFlipped)

					setQuery(query)

					ls.values = values
					ls.cognates = cognates
					ls.query = query
					ls.seeAlsos = seeAlsos
					ls.translations = translations
					ls.suggestTryFlipped = suggestTryFlipped

					reset(values)
				}
			})
		}
	}, [location, lastSubmitted, qps, reset])

	const onSubmit = useCallback(
		async (values: FormValues) => {
			const u = new URL(window.location.href)

			const pseudoQps = createQps(qpInit, pseudoHistory(u))

			pseudoQps.setMany({ ...values, page: 1 })

			history.push({ pathname: Path.Cognates, search: u.search })

			setLastSubmitted(values.word ? values : null)
		},
		[history],
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

	return (
		<>
			<RootErrorBoundary>
				<GitHubCorner
					target='_blank'
					title='See project on GitHub'
					rel='noreferrer noopener'
					href={urls.github}
				/>

				<div>
					<h1>Cognate finder</h1>

					<CognateSearchForm {...{ form, onSubmit, seeAlsos }} />

					{loading ? (
						<Spinner />
					) : !lastSubmitted ? (
						<div className='y-margins'>
							Enter a word to search for
						</div>
					) : (
						<>
							<Tabs
								{...{
									word,
									lastSubmitted,
									translations: relevantTranslations,
									cognates: hydrated,
									query,
									error,
									suggestTryFlipped,
								}}
							/>
						</>
					)}
				</div>
			</RootErrorBoundary>
		</>
	)
}
