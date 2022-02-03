import { FC } from 'react'

type Props = {
	dangerousHtml: string | null
	wiktionaryUrl: string
	title: string
}

export const WiktionaryHtml: FC<Props> = ({
	dangerousHtml,
	wiktionaryUrl,
	title,
}) => {
	const __html =
		dangerousHtml === ''
			? '<p><span class="grayed-out">No definitions found</span></p>'
			: dangerousHtml ?? ''

	return (
		<div>
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
			<div dangerouslySetInnerHTML={{ __html }} />
		</div>
	)
}
