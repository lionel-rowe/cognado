import { HTMLProps, useState } from 'react'
import { usePopper } from 'react-popper'
import { WordData } from '../core/cognates'
import { fetchWiktionaryDefinitionHtml } from '../core/getWikiContent'
import { Spinner } from './Spinner'

export const Link = ({
	url,
	word,
	langName,
	langCode,
	...htmlProps
}: WordData & HTMLProps<HTMLAnchorElement>) => {
	const [
		referenceElement,
		setReferenceElement,
	] = useState<HTMLElement | null>(null)
	const [popperElement, setPopperElement] = useState<HTMLElement | null>(null)

	const { styles, attributes } = usePopper(referenceElement, popperElement, {
		placement: 'auto',
		strategy: 'fixed',
		modifiers: [
			{
				name: 'preventOverflow',
				options: {
					rootBoundary: 'viewport',
				},
			},
			{
				name: 'flip',
				options: {
					rootBoundary: 'viewport',

					mainAxis: true,
					altAxis: true,
					flipVariations: true,
					padding: 8,
				},
			},
		],
	})

	const [popoverHtml, setPopoverHtml] = useState<string | null>(null)

	const [loading, setLoading] = useState<boolean>(false)

	const title = `${word} (${langName})`

	return (
		<span className='popover-parent'>
			<span ref={setReferenceElement}>
				<a
					{...htmlProps}
					target='_blank'
					rel='noreferrer noopener'
					href={url}
					onMouseEnter={async () => {
						if (!popoverHtml) {
							setLoading(true)

							const html = await fetchWiktionaryDefinitionHtml(
								word,
								langCode,
							)

							setLoading(false)

							setPopoverHtml(html ?? '')
						}
					}}
				>
					{title}
				</a>
			</span>

			<div
				ref={setPopperElement}
				{...attributes.popper}
				style={styles.popper}
				className='popover'
			>
				{loading ? (
					<Spinner />
				) : (
					<>
						<div>
							<strong>{title}</strong>
						</div>
						<br />
						<div
							dangerouslySetInnerHTML={{
								__html:
									popoverHtml === ''
										? '<span class="grayed-out">No definitions found</span>'
										: popoverHtml ?? '',
							}}
						/>
					</>
				)}
			</div>
		</span>
	)
}
