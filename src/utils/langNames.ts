import { langNames } from '../core/iso-639-3'

export type LangNames = typeof langNames

export { langNames }

export type LangCode = keyof LangNames

export const baseLang: LangCode = 'eng'

export const getLangName = (code: string): string => {
    return langNames[code as LangCode] ?? code
}
