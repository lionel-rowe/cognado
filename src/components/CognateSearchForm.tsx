import {
	EventHandler,
	FC,
	Fragment,
	KeyboardEventHandler,
	useCallback,
	useRef,
	useState,
	SyntheticEvent,
} from 'react'
import { UseFormReturn } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { urls } from '../config'
import { isMobile } from '../utils/device'
import { makeCognateFinderUrl, toRelativeUrl } from '../utils/formatters'
import { FormValues } from '../utils/setupQps'
import { nextAnimationFrame } from '../utils/timing'
import { LangSelect } from './LangSelect'

type WiktionaryOpenSearchSuggestions = [
	input: string,
	suggestions: string[],
	desciptions: string[],
	urls: string[],
]

export const CognateSearchForm: FC<{
	onSubmit: (values: FormValues) => Promise<void>
	form: UseFormReturn<FormValues>
	seeAlsos: string[]
}> = ({ onSubmit, form, seeAlsos }) => {
	const { register, handleSubmit, watch, setValue } = form

	const [autocompleteOptions, setAutocompleteOptions] = useState<string[]>([])
	const [input, setInput] = useState('')

	const word = watch('word')

	const srcLang = watch('srcLang')
	const trgLang = watch('trgLang')

	const swap = useCallback(
		(e: React.MouseEvent<HTMLElement>) => {
			e.preventDefault()

			const trgLang = watch('trgLang')
			const srcLang = watch('srcLang')

			setValue('srcLang', trgLang)
			setValue('trgLang', srcLang)
		},
		[setValue, watch],
	)

	const lastSubmittedAt = useRef(-1)

	const submit = useCallback<EventHandler<SyntheticEvent>>(
		(e) => {
			// rate limited to once per second
			// - avoid double-submit on `Enter` keydown
			const now = Date.now()

			if (now - lastSubmittedAt.current > 1e3) {
				handleSubmit(onSubmit)(e)
				lastSubmittedAt.current = now
			}
		},
		[handleSubmit, onSubmit],
	)

	const onKeyDown = useCallback<KeyboardEventHandler<HTMLInputElement>>(
		(e) => {
			if (!input) return

			// is 'Unidentified' if event triggered by selecting an
			// existing autocomplete option in desktop Chrome;
			// however, mobile Chrome always returns 'Unidentified' (?!?!?)
			const onAutocompleteSelectKeys = isMobile()
				? ['Enter']
				: ['Unidentified', 'Enter']

			if (onAutocompleteSelectKeys.includes(e.key)) {
				// wait for `e.currentTarget.value` to update first
				nextAnimationFrame().then(() => submit(e))

				return
			}

			const controller = new AbortController()

			const url = new URL(urls.wiktionaryActionApi)

			url.searchParams.set('action', 'opensearch')
			url.searchParams.set('search', input)

			fetch(url.href, controller)
				.then(async (res) => {
					const [, suggestions] =
						(await res.json()) as WiktionaryOpenSearchSuggestions

					setAutocompleteOptions(suggestions)
				})
				.catch((e) => {
					if (e instanceof DOMException && e.name === 'AbortError') {
						// request aborted — ignore
					} else {
						throw e
					}
				})

			return () => {
				controller.abort()
			}
		},
		[input, submit],
	)

	return (
		<form onSubmit={submit}>
			<div>
				<label htmlFor='word'>
					Word{' '}
					<input
						onKeyDown={onKeyDown}
						onInput={(e) => setInput(e.currentTarget.value)}
						id='word'
						type='search'
						autoCapitalize='none'
						value={word}
						{...register('word')}
						list='main-search'
					/>
					<datalist id='main-search'>
						{autocompleteOptions.map((option) => (
							<option key={option} value={option}>
								{option}
							</option>
						))}
					</datalist>
				</label>{' '}
				{seeAlsos.length ? (
					<>
						See also:{' '}
						{seeAlsos.map((word, idx, arr) => (
							<Fragment key={idx}>
								<Link
									to={toRelativeUrl(
										makeCognateFinderUrl({ word, srcLang }),
									)}
								>
									{word}
								</Link>
								{idx !== arr.length - 1 ? ', ' : ''}
							</Fragment>
						))}
					</>
				) : null}
			</div>
			<div>
				<label htmlFor='srcLang'>
					Source{' '}
					<LangSelect
						id='srcLang'
						langCode={srcLang}
						setLangCode={setValue}
					/>
				</label>{' '}
				<button
					className='swap'
					type='button'
					onClick={swap}
					aria-label='Swap'
				>
					<span aria-hidden='true'>⇄</span>
				</button>{' '}
				<label htmlFor='trgLang'>
					Target{' '}
					<LangSelect
						id='trgLang'
						langCode={trgLang}
						setLangCode={setValue}
					/>
				</label>
			</div>
			<div className='y-margins'>
				<label htmlFor='allowPrefixesAndSuffixes'>
					Allow prefixes and suffixes{' '}
					<input
						type='checkbox'
						id='allowPrefixesAndSuffixes'
						{...register('allowPrefixesAndSuffixes')}
					/>
				</label>
			</div>
			<div className='y-margins'>
				<button type='submit'>Search</button>{' '}
			</div>
		</form>
	)
}
