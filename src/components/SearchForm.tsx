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
import { useValidationMessages } from '../hooks/useValidationMessages'
import { isMobile } from '../utils/device'
import { makeCognateFinderUrl, toRelativeUrl } from '../utils/formatters'
import { FormValues } from '../utils/setupQps'
import { nextAnimationFrame } from '../utils/timing'
import { LangSelect } from './LangSelect'
import { Tooltip } from './Tooltip'

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
	const formRef = useRef<HTMLFormElement>(null)

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
			e.preventDefault()

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
			const onAutocompleteSelectKeys = isMobile
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

			fetch(url.href, {
				signal: controller.signal,
			})
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

	const { ref: wordFormRef, ...registerWord } = register('word')

	const wordValidationRef = useValidationMessages(
		{
			valueMissing: () => 'Enter a word to search for',
		},
		false,
	)

	return (
		<form
			className='search-form y-gap-between'
			ref={formRef}
			onSubmit={submit}
		>
			<div className='long-field'>
				<label htmlFor='word'>
					Word{' '}
					<input
						required
						onKeyDown={onKeyDown}
						onInput={(e) => setInput(e.currentTarget.value)}
						ref={(el) => {
							wordFormRef(el)

							Object.assign(wordValidationRef, { current: el })
						}}
						id='word'
						type='search'
						autoCapitalize='none'
						value={word}
						{...registerWord}
						list='main-search'
						placeholder='Search for definitions, cognates, and translations'
						autoFocus
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
					<div className='see-alsos'>
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
					</div>
				) : null}
			</div>
			<div className='short-field'>
				<label htmlFor='srcLang'>
					Source{' '}
					<LangSelect
						id='srcLang'
						langCode={srcLang}
						setLangCode={setValue}
					/>
				</label>{' '}
			</div>
			<div className='short-field'>
				<Tooltip title='Swap languages' enterTouchDelay={300}>
					<button className='swap' type='button' onClick={swap}>
						<span aria-hidden='true'>⇄</span>
					</button>
				</Tooltip>{' '}
			</div>
			<div className='short-field'>
				<label htmlFor='trgLang'>
					Target{' '}
					<LangSelect
						id='trgLang'
						langCode={trgLang}
						setLangCode={setValue}
					/>
				</label>
			</div>
			{/*
				TODO: possibly re-add? might be confusing for users,
				probably hide behind "advanced options"
			*/}
			{/* <div>
				<label htmlFor='allowAffixes'>
					Allow prefixes and suffixes{' '}
					<input
						type='checkbox'
						id='allowAffixes'
						{...register('allowAffixes')}
					/>
				</label>
			</div> */}
			<div className='long-field'>
				<button type='submit'>Search</button>{' '}
			</div>
		</form>
	)
}
