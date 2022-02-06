import { LangCode, langNamesToCodes } from '../utils/langNames'

export const getLangCodesFromSections = (text: string) =>
	text
		.split(/\r\n|[\r\n]/)
		.map((x) => x.trim().match(/^==(.+)==$/)?.[1])
		.map((x) => x && langNamesToCodes[x as keyof typeof langNamesToCodes])
		.filter(Boolean) as LangCode[]
