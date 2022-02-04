import { useState, useEffect, FC } from 'react'
import { ls } from '../utils/ls'

export type Variant = 'dark' | 'light'

const changeVariant = (variant: Variant) => {
	document.documentElement.setAttribute('class', variant)
}

const shouldUseDarkVariant = () => {
	return ls.colorSchemeOverride
		? ls.colorSchemeOverride === 'dark'
		: window.matchMedia?.('(prefers-color-scheme: dark)').matches
}

const initialVariant: Variant = shouldUseDarkVariant() ? 'dark' : 'light'

changeVariant(initialVariant)

export const ColorSchemeSwitcher: FC = () => {
	const [variant, setVariant] = useState<Variant>(initialVariant)

	useEffect(() => {
		ls.colorSchemeOverride = variant

		changeVariant(variant)
	}, [variant])

	return (
		<span className='color-scheme-switcher-container'>
			<button
				onClick={() =>
					setVariant((v) => (v === 'dark' ? 'light' : 'dark'))
				}
				className='color-scheme-switcher'
				aria-label='Switch color scheme'
			>
				{variant === 'dark' ? '🌛' : '🌞'}
			</button>
		</span>
	)
}
