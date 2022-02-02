import { FC } from 'react'
import { LangCode } from '../utils/langNames'
import { Translations } from './Translations'

type Props = {
	translations: {
		meaning: string
		trgLang: LangCode
		translations: string[]
	}[]
}

export const TranslationsTab: FC<Props> = ({ translations }) => {
	return (
		<div className='y-margins'>
			<div className='y-margins'>
				<h2>Translations</h2>
				<Translations translations={translations} />
			</div>
		</div>
	)
}
