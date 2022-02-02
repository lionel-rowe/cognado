import { FC, useEffect, useState } from 'react'
import { fetchWiktionaryDefinitionHtml } from '../core/getWikiContent'
import { makeWiktionaryUrl } from '../utils/formatters'
import { getLangName } from '../utils/langNames'
import { FormValues } from '../utils/setupQps'
import { WiktionaryHtml } from './WiktionaryHtml'

type Props = {
	lastSubmitted: FormValues
}

export const DefinitionTab: FC<Props> = ({ lastSubmitted }) => {
	const { word, srcLang } = lastSubmitted

	const [html, setHtml] = useState<string | null>(null)

	const langName = getLangName(srcLang)

	const title = `${word} (${langName})`
	const wiktionaryUrl = makeWiktionaryUrl({ word, langCode: srcLang })

	useEffect(() => {
		fetchWiktionaryDefinitionHtml(word, srcLang).then(setHtml)
	}, [srcLang, word])

	return (
		<div className='y-margins'>
			<div className='y-margins'>
				<h2>Definition</h2>
				<WiktionaryHtml
					dangerousHtml={html}
					{...{ title, wiktionaryUrl }}
				/>
			</div>
		</div>
	)
}
