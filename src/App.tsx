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
import { getLangName, LangCode } from './utils/langNames'
import { ls } from './utils/ls'
import { urls } from './config'
import { Spinner } from './components/Spinner'
import { LangSelect } from './components/LangSelect'
import { Pagination } from './components/Pagination'
import { CognatesList } from './components/CognatesList'
import { GitHubCorner } from './components/GitHubCorner'

const defaultValues = {
	word: 'dedo',
	srcLang: 'spa' as LangCode,
	trgLang: 'eng' as LangCode,
	allowPrefixesAndSuffixes: false,
} as const

export type FormValues = typeof defaultValues

const suppressPopovers = (e: KeyboardEvent) => {
	if (e.key === 'Escape') {
		document.body.classList.add('suppress-popovers')
	}
}

const unsuppressPopovers = () => {
	document.body.classList.remove('suppress-popovers')
}

export const App: FC = () => {
	const { register, handleSubmit, watch, setValue } = useForm<FormValues>({
		defaultValues: ls.values ?? defaultValues,
	})

	const allowPrefixesAndSuffixes = watch('allowPrefixesAndSuffixes')
	const word = watch('word')

	const srcLang = watch('srcLang')
	const trgLang = watch('trgLang')

	const [query, setQuery] = useState(
		() =>
			ls.query ??
			buildSparqlQuery({ ...defaultValues, allowPrefixesAndSuffixes })
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
	} = usePagination(cognates, { pageSize: 50 })

	const onSubmit = useCallback(async (values: FormValues) => {
		const { word, srcLang, trgLang, allowPrefixesAndSuffixes } = values

		setLoading(true)

		const result = await fetchCognates(
			word,
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
		}
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
			<GitHubCorner
				target='_blank'
				title='See project on GitHub'
				rel='noreferrer noopener'
				href={urls.github}
			/>

			<main>
				<h1>Cognate finder</h1>
				<form onSubmit={handleSubmit(onSubmit)}>
					<label htmlFor='word'>
						Word{' '}
						<input
							id='word'
							autoCapitalize='none'
							defaultValue='test'
							{...register('word')}
						/>
					</label>
					<br />
					<label htmlFor='srcLang'>
						Source language{' '}
						<LangSelect
							id='srcLang'
							defaultValue={getLangName(srcLang)}
							setValue={setValue}
						/>
					</label>
					<br />
					<label htmlFor='trgLang'>
						Source language{' '}
						<LangSelect
							id='trgLang'
							defaultValue={getLangName(trgLang)}
							setValue={setValue}
						/>
					</label>
					<br />
					<label htmlFor='allowPrefixesAndSuffixes'>
						Allow prefixes and suffixes{' '}
						<input
							type='checkbox'
							id='allowPrefixesAndSuffixes'
							{...register('allowPrefixesAndSuffixes')}
						/>
					</label>
					<br />
					<br />
					<button type='submit'>Search</button>{' '}
					<small>
						Etymology search powered by{' '}
						<a
							target='_blank'
							rel='noreferrer noopener'
							href={urls.etytreeWeb}
						>
							etytree
						</a>
					</small>
				</form>
				{query ? (
					<>
						<br />
						<details>
							<summary>Show raw query</summary>

							<pre>{query}</pre>
						</details>
					</>
				) : null}
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
											{...{ page, maxPageNo, setPage }}
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
								<CognatesList
									{...{
										cognates: hydrated,
										pageStart,
										pageEnd,
									}}
								/>
							) : word === lastSubmitted?.word ? (
								`No ${getLangName(
									lastSubmitted.trgLang,
								)} cognates found for ${getLangName(
									lastSubmitted.srcLang,
								)} "${word}"`
							) : (
								'Click "Search" to find cognates'
							)}
							<br />
							Page{' '}
							{<Pagination {...{ page, maxPageNo, setPage }} />}
							<br />
							<br />
							<br />
						</div>
					</>
				)}
			</main>
		</>
	)
}
