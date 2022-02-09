import { FC } from 'react'
import { renderAsReactDom } from '../dom/renderAsReactDom'
import { CognateLink } from '../components/CognateLink'
import { DomNodeToReactParser } from '../dom/renderAsReactDom'
import { isSameOrigin } from '../utils/browser'
import { getExtendedLangName, LangCode } from '../utils/langNames'

type Props = {
	word: string
	langCode: LangCode
	dangerousHtml: string | null
}

export const customParse: DomNodeToReactParser = (node: Node) => {
	if (node instanceof HTMLAnchorElement && isSameOrigin(node.href)) {
		const { searchParams } = new URL(node.href)

		const word = searchParams.get('word') ?? ''
		const srcLang = (searchParams.get('srcLang') as LangCode) ?? 'eng'
		const trgLang = (searchParams.get('trgLang') as LangCode) ?? undefined

		return (
			<CognateLink {...{ word, srcLang, trgLang }}>
				{node.textContent ?? ''}
			</CognateLink>
		)
	}

	return null
}

export const nullParse: DomNodeToReactParser = () => null

export const createWiktionaryHtmlRenderer = (
	parser: DomNodeToReactParser,
): FC<Props> => {
	const render = renderAsReactDom(parser)

	return ({ dangerousHtml, langCode, word }) =>
		dangerousHtml ? (
			<div>{render(dangerousHtml)}</div>
		) : (
			<p>
				<span className='grayed-out'>
					No {getExtendedLangName(langCode)} definitions found for{' '}
					<em>{word}</em>
				</span>
			</p>
		)
}

export const WiktionaryHtml = createWiktionaryHtmlRenderer(nullParse)

export const WiktionaryHtmlRootLevel = createWiktionaryHtmlRenderer(customParse)
