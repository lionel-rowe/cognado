import { pipe } from 'fp-ts/lib/function'
import { FC } from 'react'
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
			<ol>
				{translations.map(({ meaning, translations, trgLang }) => {
					return (
						<li key={meaning}>
							<div className='y-margins'>
								{meaning}
								<ul>
									{translations.map((word) => (
										<li key={word}>
											<TranslationLink
												{...{ word, trgLang }}
											/>
										</li>
									))}
								</ul>
							</div>
						</li>
					)
				})}
			</ol>
		</div>
	)
}
