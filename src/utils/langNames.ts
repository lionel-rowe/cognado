import { langCodesToNames } from '../core/iso-639-3'

export type LangCodesToNames = typeof langCodesToNames

export { langCodesToNames }

export type LangCode = keyof LangCodesToNames
export const langCodes = Object.keys(langCodesToNames) as LangCode[]

export type LangName = LangCodesToNames[LangCode]
export const langNames = Object.values(langCodesToNames) as LangName[]

export const langNamesToCodes = Object.fromEntries(
    Object.entries(langCodesToNames).map((x) => x.reverse()),
) as {
    [key in LangCodesToNames[keyof LangCodesToNames]]: LangCode
}

export const baseLang: LangCode = 'eng'

export const getLangName = (code: string): string => {
    return langCodesToNames[code as LangCode] ?? code
}
