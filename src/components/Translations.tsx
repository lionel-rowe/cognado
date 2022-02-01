import { pipe } from 'fp-ts/lib/function'
import { FC, Fragment } from 'react'
import { Link } from 'react-router-dom'
import { makeCognateFinderUrl, toRelativeUrl } from '../utils/formatters'
import { LangCode } from '../utils/langNames'

type Props = {
	translations: {
		meaning: string
		trgLang: LangCode
		translations: string[]
	}[]
}

const TranslationLink: FC<{ word: string; trgLang: LangCode }> = ({
	word,
	trgLang,
}) => {
	const to = pipe(
		makeCognateFinderUrl({
			word,
			srcLang: trgLang,
		}),
		toRelativeUrl,
	)

	return <Link to={to}>{word}</Link>
}

export const Translations: FC<Props> = ({ translations }) => {
	return (
		<div>
			<ul>
				{translations.map(({ meaning, translations, trgLang }) => {
					return (
						<li>
							{meaning}:{' '}
							{translations.map((word, idx, arr) =>
								idx === arr.length - 1 ? (
									<Fragment key={word}>
										<TranslationLink {...{word, trgLang}} />
									</Fragment>
								) : (
									<Fragment key={word}>
										<TranslationLink {...{word, trgLang}} />
										{', '}
									</Fragment>
								),
							)}
						</li>
					)
				})}
			</ul>
		</div>
	)
}
