import { useState } from 'react'

type Options = {
	pageSize: number
	startPage: number
}

const defaultOptions: Options = {
	pageSize: 50,
	startPage: 1,
}

export const usePagination = (
	items: { length: number },
	options?: Partial<Options>,
) => {
	const { pageSize, startPage } = {
		...defaultOptions,
		...options,
	}

	const [page, setPage] = useState(startPage)

	const { length } = items

	const pageStart = (page - 1) * pageSize
	const pageEnd = pageStart + pageSize
	const maxPageNo = Math.ceil(length / pageSize)

	const incrementPage = () => setPage((page) => Math.min(page + 1, maxPageNo))
	const decrementPage = () => setPage((page) => Math.max(page - 1, 1))

	return {
		page,
		setPage,
		pageSize,
		pageStart,
		pageEnd,
		maxPageNo,
		incrementPage,
		decrementPage,
	}
}

export type UsePaginationReturn = ReturnType<typeof usePagination>
