import { useCallback } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { urls } from '../config'
import { FormValues } from '../utils/setupQps'
import { LangSelect } from './LangSelect'

export const CognateSearchForm = ({
	onSubmit,
	form,
}: {
	onSubmit: (values: FormValues) => Promise<void>
	form: UseFormReturn<FormValues>
}) => {
	const { register, handleSubmit, watch, setValue } = form

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

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<label htmlFor='word'>
				Word{' '}
				<input
					id='word'
					type='search'
					autoCapitalize='none'
					value={word}
					{...register('word')}
				/>
			</label>
			<br />
			<label htmlFor='srcLang'>
				Source{' '}
				<LangSelect
					id='srcLang'
					langCode={srcLang}
					setLangCode={setValue}
				/>
			</label>{' '}
			<button type='button' onClick={swap} aria-label='Swap'>
				<span aria-hidden='true'>⇄</span>
			</button>{' '}
			<label htmlFor='trgLang'>
				target{' '}
				<LangSelect
					id='trgLang'
					langCode={trgLang}
					setLangCode={setValue}
				/>
			</label>
			<br />
			<label htmlFor='allowPrefixesAndSuffixes'>
				Allow prefixes and suffixes{' '}
				<input
					type='checkbox'
					id='allowPrefixesAndSuffixes'
					{...register('allowPrefixesAndSuffixes')}
				/>
			</label>
			<br />
			<br />
			<button type='submit'>Search</button>{' '}
			<small>
				Etymology search powered by{' '}
				<a
					target='_blank'
					rel='noreferrer noopener'
					href={urls.etytreeWeb}
				>
					etytree
				</a>
			</small>
		</form>
	)
}
