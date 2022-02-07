type ValidityKey = Exclude<keyof ValidityState, 'valid' | 'customError'>

export type CustomValidityMessages = Partial<
	Record<ValidityKey, (value: string) => string>
>

export type FormEl = HTMLInputElement | HTMLSelectElement

const setValidity = (messages: CustomValidityMessages) => (el: FormEl) => {
	const { value, validity } = el

	if (validity.valid) {
		el.setCustomValidity('')

		return
	}

	const fn = Object.entries(messages).find(
		([key]) => validity[key as ValidityKey],
	)?.[1]

	el.setCustomValidity(fn?.(value) ?? '')
}

export const attachCustomValidityMessages =
	(messages: CustomValidityMessages) => (el: FormEl | null) => {
		if (el) {
			const setValidity_ = setValidity(messages)

			setValidity_(el)

			const listener = (e: Event) =>
				setValidity_(e.currentTarget as FormEl)

			el.addEventListener('input', listener)

			return function cleanup() {
				el.removeEventListener('input', listener)
			}
		}
	}
