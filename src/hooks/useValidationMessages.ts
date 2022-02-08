import { useRef, useEffect, useState } from 'react'
import {
	CustomValidityMessages,
	attachCustomValidityMessages,
	FormEl,
} from '../dom/attachCustomValidityMessages'

export const useValidationMessages = (
	messages: CustomValidityMessages,
	dynamic: boolean = false,
) => {
	const validationRef = useRef<FormEl>(null)

	const [m] = useState(messages)

	const _messages = dynamic ? messages : m

	const cleanup = useRef<() => void>(null)

	useEffect(() => {
		if (validationRef.current) {
			cleanup.current?.()

			const c = attachCustomValidityMessages(_messages)(
				validationRef.current,
			)

			Object.assign(cleanup, { current: c })
		}
	}, [validationRef, _messages])

	return validationRef
}
