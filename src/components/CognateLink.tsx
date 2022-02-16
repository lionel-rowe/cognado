import clsx from 'clsx'
import {
	FC,
	HTMLProps,
	MouseEventHandler,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react'
import { usePopper } from 'react-popper'
import { Link, useHistory } from 'react-router-dom'
import { fetchWiktionaryDefinitionHtml } from '../core/getWikiContent'
import { isLink, isSameOrigin } from '../utils/browser'
import { isTouchDevice } from '../utils/device'
import {
	makeCognateFinderUrl,
	makeWiktionarySearchUrl,
	makeWiktionaryUrl,
	toRelativeUrl,
} from '../utils/formatters'
import { getExtendedLangName, LangCode } from '../utils/langNames'
import { Spinner } from './Spinner'
import { WiktionaryHtml } from './WiktionaryHtml'
import { WiktionaryTitleLink } from './WiktionaryTitleLink'

type ReactEventName = `on${Capitalize<string>}` &
	keyof React.DOMAttributes<HTMLAnchorElement>

type Props = {
	word: string
	srcLang: LangCode
	trgLang?: LangCode
}

const reactInteractionEventNames: ReactEventName[] = isTouchDevice
	? ['onContextMenu' /* corresponds to long-press in mobile browsers */]
	: ['onMouseOver']

const htmlInteractionEventNames: (keyof HTMLElementEventMap)[] = ['mouseover']

export const CognateLink: FC<Props & HTMLProps<HTMLAnchorElement>> = ({
	word,
	srcLang,
	trgLang,
	children,
	className,
	...htmlProps
}) => {
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

	const history = useHistory()

	const cognateFinderUrl = makeCognateFinderUrl({
		word,
		srcLang,
		trgLang,
	})

	const wiktionaryUrl = useMemo(
		() =>
			popoverHtml === ''
				? makeWiktionarySearchUrl({ word })
				: makeWiktionaryUrl({ word, langCode: srcLang }),
		[word, srcLang, popoverHtml],
	)

	const [open, setOpen] = useState<boolean>(false)
	const [loading, setLoading] = useState<boolean>(false)

	const extendedLangName = getExtendedLangName(srcLang)

	const title = `${word} (${extendedLangName})`

	const showPopover = useCallback(
		async (e) => {
			e.preventDefault()

			setOpen(true)

			if (!popoverHtml) {
				setLoading(true)

				const html = await fetchWiktionaryDefinitionHtml(word, srcLang)

				setLoading(false)

				setPopoverHtml(html ?? '')
			}
		},
		[srcLang, popoverHtml, word],
	)

	useEffect(() => {
		forceUpdate?.()
	}, [popoverHtml, forceUpdate])

	const hidePopover = useCallback(() => {
		setOpen(false)
	}, [])

	const onEvents = useMemo(() => {
		return Object.fromEntries(
			reactInteractionEventNames.map((k) => [k, showPopover]),
		) as Record<ReactEventName, typeof showPopover>
	}, [showPopover])

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
			htmlInteractionEventNames.map((k) => [
				k,
				hidePopoverIfNotCurrentTarget,
			]),
		) as Record<ReactEventName, typeof hidePopoverIfNotCurrentTarget>
	}, [hidePopoverIfNotCurrentTarget])

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

	return (
		<span ref={ref} className='popover-parent'>
			<span ref={setReferenceElement}>
				<Link
					className={clsx([className, 'cognate-link'])}
					{...(htmlProps as any)}
					{...onEvents}
					onClick={hidePopover}
					to={toRelativeUrl(cognateFinderUrl)}
				>
					{children ?? title}
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
						<div onClick={onClick}>
							<WiktionaryTitleLink
								{...{
									word,
									langCode: popoverHtml ? srcLang : undefined,
									wiktionaryUrl,
								}}
							/>

							<WiktionaryHtml
								{...{ word, langCode: srcLang }}
								dangerousHtml={popoverHtml}
							/>
						</div>
					)}
				</div>
			)}
		</span>
	)
}
