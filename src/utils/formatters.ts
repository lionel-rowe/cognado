import { flow } from 'fp-ts/lib/function'

export const underscorify = (x: string) => x.replace(/ /g, '_')

export const wikify = flow(underscorify, encodeURIComponent)
export const unwikify = flow(decodeURIComponent, (x) => x.replace(/_/g, ' '))
