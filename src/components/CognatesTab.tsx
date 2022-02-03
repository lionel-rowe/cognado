import { FC, useCallback, useContext } from 'react'
import { CognateHydrated } from '../core/cognates'
import { usePagination } from '../hooks/usePagination'
import { QpsContext } from '../Routes'
import { getLangName } from '../utils/langNames'
import { FormValues } from '../utils/setupQps'
import { CognatesList } from './CognatesList'
import { Pagination } from './Pagination'

type Props = {
	cognates: CognateHydrated[]
	lastSubmitted: FormValues
	word: string
	query: string
	error: Error | null
}

export const CognatesTab: FC<Props> = ({
	word,
	cognates,
	lastSubmitted,
	query,
	error,
}) => {
	const qps = useContext(QpsContext)

	const pagination = usePagination(cognates, {
		pageSize: 50,
		startPage: qps.get('page'),
	})

	const { setPage, page, pageStart, pageEnd, maxPageNo } = pagination

	const hydrated = cognates

	const updatePage = useCallback(
		(n: number, pushState?: boolean) => {
			setPage(n)

			qps.set('page', n, pushState)
		},
		[setPage, qps],
	)

	const { srcLang, trgLang } = lastSubmitted

	return (
		<div className='y-margins'>
			<h2>Cognates</h2>
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
						<>
							<p>
								No {getLangName(trgLang)} cognates found for{' '}
								{getLangName(srcLang)} <em>{word}</em>{' '}
							</p>
						</>
					) : (
						'Enter a word to search for'
					)
				) : (
					'Click “Search” to find cognates'
				)}

				{cognates.length && word && query ? (
					<div className='y-margins'>
						<details>
							<summary>Show raw query</summary>

							<pre>{query}</pre>
						</details>
					</div>
				) : null}
			</div>
		</div>
	)
}
