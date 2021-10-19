import { Fragment } from 'react'

export const Pagination = ({
	maxPageNo,
	page,
	setPage,
}: {
	maxPageNo: number
	page: number
	setPage: React.Dispatch<React.SetStateAction<number>>
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
		</>
	)
}
