import { FC } from 'react'
import { LangCode } from '../utils/langNames'
import { CognateLink } from './CognateLink'

type Props = {
	translations: {
		meaning: string
		trgLang: LangCode
		translations: string[]
	}[]
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
											<CognateLink
												{...{ word, srcLang: trgLang }}
											>
												{word}
											</CognateLink>
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
