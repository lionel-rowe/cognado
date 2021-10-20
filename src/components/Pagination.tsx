import { Fragment } from 'react'

export const Pagination = ({
	maxPageNo,
	page,
	setPage,
}: {
	maxPageNo: number
	page: number
	setPage: (n: number, pushState?: boolean) => void
}) => {
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
