import { FC, MouseEventHandler, useCallback } from 'react'
import { useHistory } from 'react-router-dom'
import { toRelativeUrl } from '../utils/formatters'

type Props = {
	hidePopover: () => void
	__html: string
}

const isLink = (target: EventTarget): target is HTMLAnchorElement =>
	(target as HTMLElement)?.matches?.('a[href]')

const isSameOrigin = (url: string) =>
	new URL(url).origin === window.location.origin

export const WiktionaryHtml: FC<Props> = ({ __html, hidePopover }) => {
	const history = useHistory()

	const onClick: MouseEventHandler<HTMLDivElement> = useCallback(
		(e) => {
			if (isLink(e.target) && isSameOrigin(e.target.href)) {
				e.preventDefault()

				hidePopover()

				history?.push(toRelativeUrl(e.target.href))
			}
		},
		[history, hidePopover],
	)

	return <div onClick={onClick} dangerouslySetInnerHTML={{ __html }} />
}
