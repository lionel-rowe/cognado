import {
	FC,
	HTMLProps,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react'
import { usePopper } from 'react-popper'
import { Link } from 'react-router-dom'
import { WordData } from '../core/cognates'
import { fetchWiktionaryDefinitionHtml } from '../core/getWikiContent'
import { isTouchDevice } from '../utils/device'
import {
	makeCognateFinderUrl,
	makeWiktionarySearchUrl,
	makeWiktionaryUrl,
	toRelativeUrl,
} from '../utils/formatters'
import { getLangName } from '../utils/langNames'
import { Spinner } from './Spinner'
import { WiktionaryHtml } from './WiktionaryHtml'

type ReactEventName = `on${Capitalize<string>}` &
	keyof React.DOMAttributes<HTMLAnchorElement>

export const CognateLink: FC<
	Partial<WordData> &
		Pick<WordData, 'word' | 'langCode'> &
		HTMLProps<HTMLAnchorElement>
> = ({ word, langCode, langName: _, ...htmlProps }) => {
	const [referenceElement, setReferenceElement] =
		useState<HTMLElement | null>(null)
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
							'bottom-start',
							'bottom-end',
							'right-start',
							'right-end',
							'left-start',
							'left-end',
							'bottom',
						],
					},
				},
			],
		},
	)

	const [popoverHtml, setPopoverHtml] = useState<string | null>(null)

	const cognateFinderUrl = makeCognateFinderUrl({
		word,
		srcLang: langCode,
	})

	const wiktionaryUrl = useMemo(
		() =>
			popoverHtml === ''
				? makeWiktionarySearchUrl({ word })
				: makeWiktionaryUrl({ word, langCode }),
		[word, langCode, popoverHtml],
	)

	const [open, setOpen] = useState<boolean>(false)
	const [loading, setLoading] = useState<boolean>(false)

	const langName = getLangName(langCode)

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
			isTouchDevice() ? ['onMouseOver', 'onTouchStart'] : ['onMouseOver'],
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
				<Link
					{...(htmlProps as any)}
					{...onEvents}
					onClick={hidePopover}
					to={toRelativeUrl(cognateFinderUrl)}
				>
					{title}
				</Link>
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

							<WiktionaryHtml
								hidePopover={hidePopover}
								__html={
									popoverHtml === ''
										? '<span class="grayed-out">No definitions found</span>'
										: popoverHtml ?? ''
								}
							/>
						</>
					)}
				</div>
			)}
		</span>
	)
}
