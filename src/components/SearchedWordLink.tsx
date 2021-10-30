import { getLangName, LangCode } from '../utils/langNames'

type Props = {
	word: string
	href: string | null
	lang: LangCode
}

export const SearchedWordLink = ({ href, word, lang }: Props) => {
	return (
		<p>
			{href && lang ? (
				<>
					<a href={href} target='_blank' rel='noreferrer noopener'>
						<em>
							<strong>{word}</strong>
						</em>{' '}
						({getLangName(lang)}) — Wiktionary
					</a>
				</>
			) : (
				<>
					<em>
						<strong>{word}</strong>
					</em>{' '}
					({getLangName(lang)}) not found on Wiktionary
				</>
			)}
		</p>
	)
}
