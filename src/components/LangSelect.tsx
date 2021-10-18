import { useState } from 'react'
import { UseFormSetValue } from 'react-hook-form'
import {
    getLangName,
    langCodes,
    LangName,
    langNames,
    langNamesToCodes,
} from '../utils/langNames'
import { useHtmlId } from '../hooks/useHtmlId'

export function LangSelect({
    id,
    defaultValue,
    setValue,
}: {
    id: string
    defaultValue: string
    setValue: UseFormSetValue<any> // TODO
}) {
    const [langCode, setLangCode] = useState(defaultValue)

    const listId = useHtmlId(`${id}-list`)

    return (
        <>
            <input
                id={id}
                type='text'
                list={listId}
                defaultValue={defaultValue}
                onChange={(e) => {
                    const value = e.currentTarget.value

                    const langCode = langNamesToCodes[value as LangName]

                    if (langCodes.includes(langCode)) {
                        setLangCode(langCode)
                        setValue(id, langCode)
                    }
                }}
                onFocus={(e) => (e.currentTarget.value = '')}
                onBlur={(e) => (e.currentTarget.value = getLangName(langCode))}
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
