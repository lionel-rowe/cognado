import { useState } from 'react'

let inc = 0

export const generateHtmlId = (prefix = 'id') => `${prefix}-${++inc}`

export const useHtmlId = (prefix = 'id') => {
    const [htmlId /* , setHtmlId */] = useState(generateHtmlId(prefix))

    return htmlId
}
