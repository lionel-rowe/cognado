type ValidityKey = Exclude<keyof ValidityState, 'valid' | 'customError'>

export type CustomValidityMessages = Partial<
	Record<ValidityKey, (value: string) => string>
>

export type FormEl = HTMLInputElement | HTMLSelectElement

const setValidity = (messages: CustomValidityMessages) => (el: FormEl) => {
	const { value, validity } = el

	if (validity.valid) {
		el.setCustomValidity('')

		return ''
	}

	const fn = Object.entries(messages).find(
		([key]) => validity[key as ValidityKey],
	)?.[1]

	const customValidity = fn?.(value) ?? ''

	el.setCustomValidity(customValidity)

	return customValidity
}

export const attachCustomValidityMessages =
	(messages: CustomValidityMessages) => (el: FormEl | null) => {
		if (el) {
			const setValidity_ = setValidity(messages)

			setValidity_(el)

			const observer = new MutationObserver(() => setValidity_(el))

			observer.observe(el, {
				attributes: true,
				attributeFilter: ['value'],
			})

			return function cleanup() {
				observer.disconnect()
			}
		}
	}
