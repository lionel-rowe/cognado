import { getLangName, LangCode } from '../utils/langNames'

export const containsSectionForLanguage = (langCode: LangCode, text: string) =>
	text
		.split(/\r\n|[\r\n]/)
		.map((x) => x.trim())
		.includes(`==${getLangName(langCode)}==`)
