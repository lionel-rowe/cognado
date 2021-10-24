import {
	HTMLProps,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react'
import { usePopper } from 'react-popper'
import { WordData } from '../core/cognates'
import { fetchWiktionaryDefinitionHtml } from '../core/getWikiContent'
import { isTouchDevice } from '../utils/device'
import { Spinner } from './Spinner'

type ReactEventName = `on${Capitalize<string>}` &
	keyof React.DOMAttributes<HTMLAnchorElement>

export const CognateLink = ({
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

	const ref = useRef<HTMLSpanElement>(null)

	const { styles, attributes, forceUpdate } = usePopper(
		referenceElement,
		popperElement,
		{
			placement: 'auto',
			strategy: 'absolute',
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
						flipVariations: true,
						padding: 8,
						allowedAutoPlacements: [
							'auto',
							'auto-start',
							'auto-end',
							'top-start',
							'top-end',
							'bottom-start',
							'bottom-end',
							'right-start',
							'right-end',
							'left-start',
							'left-end',
							'top',
							'bottom',
							// 'right', // causes vertical scroll on small screens
							// 'left', // causes vertical scroll on small screens
						],
					},
				},
			],
		},
	)

	const [popoverHtml, setPopoverHtml] = useState<string | null>(null)

	const [open, setOpen] = useState<boolean>(false)
	const [loading, setLoading] = useState<boolean>(false)

	const title = `${word} (${langName})`

	const showPopover = useCallback(async () => {
		setOpen(true)

		if (!popoverHtml) {
			setLoading(true)

			const html = await fetchWiktionaryDefinitionHtml(word, langCode)

			setLoading(false)

			setPopoverHtml(html ?? '')
		}
	}, [langCode, popoverHtml, word])

	useEffect(() => {
		forceUpdate?.()
	}, [popoverHtml, forceUpdate])

	const hidePopover = useCallback(() => {
		setOpen(false)
	}, [])

	const reactHoverEventNames: ReactEventName[] = useMemo(
		() =>
			isTouchDevice()
				? ['onMouseOver', 'onTouchStart', 'onClick']
				: ['onMouseOver'],
		[],
	)

	const htmlHoverEventNames = useMemo(
		() =>
			reactHoverEventNames.map((name) =>
				name.slice(2).toLowerCase(),
			) as (keyof HTMLElementEventMap)[],
		[reactHoverEventNames],
	)

	const onEvents = useMemo(() => {
		return Object.fromEntries(
			reactHoverEventNames.map((k) => [k, showPopover]),
		) as Record<ReactEventName, typeof showPopover>
	}, [showPopover, reactHoverEventNames])

	const hidePopoverIfNotCurrentTarget = useCallback(
		(e: Event) => {
			if (!ref.current?.contains(e.target as HTMLElement)) {
				hidePopover()
			}
		},
		[hidePopover],
	)

	const offEvents = useMemo(() => {
		return Object.fromEntries(
			htmlHoverEventNames.map((k) => [k, hidePopoverIfNotCurrentTarget]),
		) as Record<ReactEventName, typeof hidePopoverIfNotCurrentTarget>
	}, [hidePopoverIfNotCurrentTarget, htmlHoverEventNames])

	const suppressOnEsc = useCallback(
		(e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				hidePopover()
			}
		},
		[hidePopover],
	)

	useEffect(() => {
		if (!open) return

		Object.entries(offEvents).forEach(([k, v]) => {
			document.body.addEventListener(k, v)
		})

		window.addEventListener('keydown', suppressOnEsc)

		return function cleanup() {
			Object.entries(offEvents).forEach(([k, v]) => {
				document.body.removeEventListener(k, v)
			})

			window.removeEventListener('keydown', suppressOnEsc)
		}
	}, [offEvents, open, suppressOnEsc])

	return (
		<span ref={ref} className='popover-parent'>
			<span ref={setReferenceElement}>
				<a
					{...htmlProps}
					target='_blank'
					rel='noreferrer noopener'
					href={url}
					{...onEvents}
				>
					{title}
				</a>
			</span>

			{open && (
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
			)}
		</span>
	)
}
