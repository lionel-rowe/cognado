import { FC } from 'react'

type Props = {
	wiktionaryUrl: string
	title: string
}

export const WiktionaryTitleLink: FC<Props> = ({ wiktionaryUrl, title }) => {
	return (
		<div>
			<strong>
				<a
					target='blank'
					rel='noreferrer noopener'
					href={wiktionaryUrl}
				>
					{title} — Wiktionary
				</a>
			</strong>
		</div>
	)
}
