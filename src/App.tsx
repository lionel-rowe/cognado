import { FC, useEffect, useState, useMemo, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import {
	buildSparqlQuery,
	CognateRaw,
	fetchCognates,
	hydrate,
	isCognateError,
} from './core/cognates'
import { usePagination } from './hooks/usePagination'
import { getLangName } from './utils/langNames'
import { ls } from './utils/ls'
import { urls } from './config'
import { Spinner } from './components/Spinner'
import { Pagination } from './components/Pagination'
import { CognatesList } from './components/CognatesList'
import { GitHubCorner } from './components/GitHubCorner'
import { RootErrorBoundary } from './components/RootErrorBoundary'
import { FormValues, formValues, pageNum, qps } from './utils/setupQps'
import { suppressPopovers, unsuppressPopovers } from './utils/dom'
import { CognateSearchForm } from './components/CognateSearchForm'

export const App: FC = () => {
	const form = useForm<FormValues>({
		defaultValues: formValues,
	})

	const { watch, reset } = form

	const allowPrefixesAndSuffixes = watch('allowPrefixesAndSuffixes')
	const word = watch('word')

	const [query, setQuery] = useState(
		() =>
			ls.query ??
			buildSparqlQuery({ ...formValues, allowPrefixesAndSuffixes })
				.sparql,
	)

	const [error, setError] = useState<Error | null>(null)
	const [loading, setLoading] = useState<boolean>(false)

	const [cognates, setCognates] = useState<CognateRaw[]>(ls.cognates ?? [])
	const [lastSubmitted, setLastSubmitted] = useState<FormValues | null>(
		ls.values ?? null,
	)

	const {
		page,
		setPage,
		pageStart,
		pageEnd,
		maxPageNo,
	} = usePagination(cognates, { pageSize: 50, startPage: pageNum })

	const updatePage = useCallback(
		(n: number, pushState?: boolean) => {
			setPage(n)

			qps.set('page', n, pushState)
		},
		[setPage],
	)

	const updateValues = useCallback(async (values: FormValues) => {
		const { word, srcLang, trgLang, allowPrefixesAndSuffixes } = values

		if (!word) {
			setCognates([])
			setLastSubmitted(null)
		}

		setLoading(true)

		const result = await fetchCognates(
			word.trim(),
			srcLang,
			trgLang,
			allowPrefixesAndSuffixes,
		)

		setLoading(false)

		if (isCognateError(result)) {
			setError(new Error(result.error))
		} else {
			const { cognates, query } = result

			setError(null)
			setLastSubmitted(values)
			setCognates(cognates)

			setQuery(query)

			ls.values = values
			ls.cognates = cognates
			ls.query = query

			qps.setMany(values, true)
		}
	}, [])

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

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	useEffect(() => {
		document.addEventListener('keydown', suppressPopovers)
		document.addEventListener('mouseover', unsuppressPopovers)

		return function cleanup() {
			document.removeEventListener('keydown', suppressPopovers)
			document.removeEventListener('mouseover', unsuppressPopovers)
		}
	}, [])

	const hydrated = useMemo(() => hydrate(cognates), [cognates])

	return (
		<>
			<RootErrorBoundary>
				<GitHubCorner
					target='_blank'
					title='See project on GitHub'
					rel='noreferrer noopener'
					href={urls.github}
				/>

				<main>
					<h1>Cognate finder</h1>

					<CognateSearchForm {...{ form, onSubmit }} />

					{loading ? (
						<Spinner />
					) : (
						<>
							{cognates.length ? (
								<>
									<br />
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
