import { useState, useEffect } from 'react'

type Options = {
    pageSize: number
}

const defaultOptions: Options = {
    pageSize: 50,
}

export const usePagination = (items: { length: number }, options?: Options) => {
    const { pageSize } = {
        ...defaultOptions,
        ...options,
    }

    const [page, setPage] = useState(1)

    const { length } = items

    useEffect(() => {
        setPage(1)
    }, [items])

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
