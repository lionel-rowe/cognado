import { FC, Fragment } from 'react'

export const Pagination: FC<{
	maxPageNo: number
	page: number
	setPage: (n: number, pushState?: boolean) => void
}> = ({ maxPageNo, page, setPage }) => {
	return (
		<>
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

									setPage(i + 1, true)
								}}
							>
								{i + 1}
							</a>
						)}
						{'\xa0'}
					</Fragment>
				)
			})}
		</>
	)
}
