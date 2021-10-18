import { FC, useEffect, useState, Fragment, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import {
	buildSparqlQuery,
	CognateRaw,
	fetchCognates,
	hydrate,
	isCognateError,
} from './core/cognates'
import { Link } from './components/Link'
import { usePagination } from './hooks/usePagination'
import { getLangName, LangCode } from './utils/langNames'
import { ls } from './utils/ls'
import { urls } from './config'
import { Spinner } from './components/Spinner'
import { LangSelect } from './components/LangSelect'

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
	const {
		register,
		handleSubmit,
		// formState: { errors },
		watch,
		setValue,
	} = useForm<FormValues>({ defaultValues: ls.values ?? defaultValues })

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

	const onSubmit = async (values: FormValues) => {
		const { word, srcLang, trgLang } = values

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
	}

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
		<main>
			<h1>Cognate finder</h1>

			<form onSubmit={handleSubmit(onSubmit)}>
				<label htmlFor='word'>
					Word{' '}
					<input
						id='word'
						// type='search'
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
					Etymology tree search by{' '}
					<a
						target='_blank'
						rel='noreferrer noopener'
						href={urls.etyTreeWeb}
					>
						EtyTree
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
								{Array.from({ length: maxPageNo }, (_, i) => {
									return (
										<Fragment key={i}>
											{page === i + 1 ? (
												i + 1
											) : (
												<a
													href={`#page-${i + 1}`}
													onClick={(e) => {
														e.preventDefault()

														setPage(i + 1)
													}}
												>
													{i + 1}
												</a>
											)}
											{'\xa0'}
										</Fragment>
									)
								})}
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
							<ul>
								{hydrated
									.slice(pageStart, pageEnd)
									.map(({ ancestor, trg, src }) => {
										return (
											<li
												className='top-level-li'
												key={trg[trg.length - 1].url}
											>
												<Link {...ancestor} />

												<ul>
													<li>
														{src.flatMap((x, i) => [
															' → ',
															<Link
																key={i}
																{...x}
															/>,
														])}
													</li>
													<li>
														{trg.flatMap(
															(x, i, a) => [
																' → ',
																i ===
																a.length - 1 ? (
																	<Link
																		key={i}
																		className='bold'
																		{...x}
																	/>
																) : (
																	<Link
																		key={i}
																		{...x}
																	/>
																),
															],
														)}
													</li>
												</ul>
											</li>
										)
									})}
							</ul>
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
						<br />
						<br />
					</div>
				</>
			)}
		</main>
	)
}
