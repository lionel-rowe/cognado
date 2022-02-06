import { FC, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchWiktionaryDefinitionHtml } from '../core/getWikiContent'
import {
	makeCognateFinderUrl,
	makeWiktionaryUrl,
	toRelativeUrl,
} from '../utils/formatters'
import { getLangName } from '../utils/langNames'
import { FormValues } from '../utils/setupQps'
import { WiktionaryHtmlRootLevel } from './WiktionaryHtml'
import { WiktionaryTitleLink } from './WiktionaryTitleLink'

type Props = {
	lastSubmitted: FormValues
	suggestTryFlipped: boolean
}

export const DefinitionTab: FC<Props> = ({
	lastSubmitted,
	suggestTryFlipped,
}) => {
	const { word, srcLang, trgLang } = lastSubmitted

	const [html, setHtml] = useState<string | null>(null)

	const langName = getLangName(srcLang)

	const title = `${word} (${langName})`
	const wiktionaryUrl = makeWiktionaryUrl({ word, langCode: srcLang })

	useEffect(() => {
		let unmounted = false

		fetchWiktionaryDefinitionHtml(word, srcLang).then((x) => {
			if (!unmounted) {
				setHtml(x)
			}
		})

		return () => {
			unmounted = true
		}
	}, [srcLang, word])

	return (
		<div className='y-margins'>
			<div className='y-margins'>
				<h2>Definition</h2>

				{suggestTryFlipped ? null : (
					<WiktionaryTitleLink
						{...{ title: html ? title : word, wiktionaryUrl }}
					/>
				)}

				<WiktionaryHtmlRootLevel
					{...{ word, langCode: srcLang }}
					dangerousHtml={html}
				/>

				{suggestTryFlipped ? (
					<p>
						Did you mean to search{' '}
						<strong>
							<Link
								to={toRelativeUrl(
									makeCognateFinderUrl({
										word,
										srcLang: trgLang,
									}),
								)}
							>
								{getLangName(trgLang)} → {getLangName(srcLang)}
							</Link>
						</strong>
						?
					</p>
				) : null}
			</div>
		</div>
	)
}
