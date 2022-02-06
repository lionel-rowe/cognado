import { pipe } from 'fp-ts/lib/function'
import { FC, Fragment } from 'react'
import { Link } from 'react-router-dom'
import {
	makeCognateFinderUrl,
	makeWiktionaryUrl,
	toRelativeUrl,
} from '../utils/formatters'
import { getLangName } from '../utils/langNames'
import { LangPair } from '../utils/ls'
import { FormValues } from '../utils/setupQps'
import { WiktionaryHtmlRootLevel } from './WiktionaryHtml'
import { WiktionaryTitleLink } from './WiktionaryTitleLink'

type Props = {
	definition: string | null
	lastSubmitted: FormValues
	suggestedLangPairs: LangPair[]
}

const isFlipped = (x: LangPair) => (y: LangPair) =>
	x.srcLang === y.trgLang && x.trgLang === y.srcLang

export const DefinitionTab: FC<Props> = ({
	definition,
	lastSubmitted,
	suggestedLangPairs,
}) => {
	const { word, srcLang, trgLang } = lastSubmitted

	const langName = getLangName(srcLang)

	const title = `${word} (${langName})`
	const wiktionaryUrl = makeWiktionaryUrl({ word, langCode: srcLang })

	const suggestTryFlipped = suggestedLangPairs.find(isFlipped(lastSubmitted))
	const otherSuggestions = suggestedLangPairs.filter(
		(x) => x !== suggestTryFlipped,
	)

	return (
		<div className='y-margins'>
			<div className='y-margins'>
				<h2>Definition</h2>

				{!definition && suggestTryFlipped ? null : (
					<WiktionaryTitleLink
						{...{ title: definition ? title : word, wiktionaryUrl }}
					/>
				)}

				<WiktionaryHtmlRootLevel
					{...{ word, langCode: srcLang }}
					dangerousHtml={definition}
				/>

				{definition ? null : suggestTryFlipped ? (
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
				) : otherSuggestions.length ? (
					<p>
						Search in{' '}
						{otherSuggestions.map(
							({ srcLang, trgLang }, idx, arr) => (
								<Fragment key={idx}>
									<Link
										to={pipe(
											makeCognateFinderUrl({
												word,
												srcLang,
												trgLang,
											}),
											toRelativeUrl,
										)}
									>
										{getLangName(srcLang)}
									</Link>
									{idx === arr.length - 1 ? null : ', '}
								</Fragment>
							),
						)}
					</p>
				) : null}
			</div>
		</div>
	)
}
