import { FC } from 'react'
import { Link } from 'react-router-dom'
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
	definition: string
	lastSubmitted: FormValues
	suggestTryFlipped: boolean
}

export const DefinitionTab: FC<Props> = ({
	definition,
	lastSubmitted,
	suggestTryFlipped,
}) => {
	const { word, srcLang, trgLang } = lastSubmitted

	const langName = getLangName(srcLang)

	const title = `${word} (${langName})`
	const wiktionaryUrl = makeWiktionaryUrl({ word, langCode: srcLang })

	return (
		<div className='y-margins'>
			<div className='y-margins'>
				<h2>Definition</h2>

				{suggestTryFlipped ? null : (
					<WiktionaryTitleLink
						{...{ title: definition ? title : word, wiktionaryUrl }}
					/>
				)}

				<WiktionaryHtmlRootLevel
					{...{ word, langCode: srcLang }}
					dangerousHtml={definition}
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
