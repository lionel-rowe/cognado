import { FC } from 'react'
import { getExtendedLangName, LangCode } from '../utils/langNames'

type Props = {
	wiktionaryUrl: string
	word: string
	langCode?: LangCode
}

export const WiktionaryTitleLink: FC<Props> = ({
	wiktionaryUrl,
	word,
	langCode,
}) => {
	return (
		<div>
			<strong>
				<a
					target='blank'
					rel='noreferrer noopener'
					href={wiktionaryUrl}
				>
					View full entry for{' '}
					{[
						`“${word}”`,
						langCode && `(${getExtendedLangName(langCode)})`,
					]
						.filter(Boolean)
						.join(' ')}{' '}
					on Wiktionary
				</a>
			</strong>
		</div>
	)
}
