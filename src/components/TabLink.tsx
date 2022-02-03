import { FC } from 'react'
import { NavLink } from 'react-router-dom'

type Props = {
	to: string
	exact: boolean
} & (
	| {
			disabled: boolean
			disabledMessage: string
	  }
	| {
			disabled?: undefined
			disabledMessage?: undefined
	  }
)

export const TabLink: FC<Props> = (props) => {
	const { children, to, exact } = props

	return props.disabled ? (
		// eslint-disable-next-line jsx-a11y/anchor-is-valid
		<a className='disabled-tab' title={props.disabledMessage}>
			{children}
		</a>
	) : (
		<NavLink activeClassName='active' {...{ to, exact }}>
			{children}
		</NavLink>
	)
}
