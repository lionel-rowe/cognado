import { useEffect, useState } from 'react'
import { UseFormSetValue } from 'react-hook-form'
import {
	getLangName,
	LangCode,
	langCodes,
	LangName,
	langNames,
	langNamesToCodes,
} from '../utils/langNames'
import { useHtmlId } from '../hooks/useHtmlId'

export function LangSelect({
	id,
	langCode,
	setLangCode,
}: {
	id: string
	langCode: LangCode
	setLangCode: UseFormSetValue<any> // TODO
}) {
	const [enteredText, setEnteredText] = useState(() => getLangName(langCode))

	useEffect(() => {
		if (langCodes.includes(langCode)) {
			setEnteredText(getLangName(langCode))
		}
	}, [langCode])

	const listId = useHtmlId(`${id}-list`)

	return (
		<>
			<input
				id={id}
				type='text'
				list={listId}
				value={enteredText}
				placeholder={getLangName(langCode)}
				onChange={(e) => {
					const value = e.currentTarget.value

					setEnteredText(value)

					const langCode = langNamesToCodes[value as LangName]

					if (langCodes.includes(langCode)) {
						setLangCode(id, langCode)
					}
				}}
				onFocus={() => setEnteredText('')}
				onBlur={() => setEnteredText(getLangName(langCode))}
			/>

			<datalist id={listId}>
				{langNames.map((x) => (
					<option key={x} value={x}>
						{x}
					</option>
				))}
			</datalist>
		</>
	)
}
