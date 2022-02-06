import { forwardRef, HTMLProps } from 'react'
import { NavLink } from 'react-router-dom'
import { Tooltip } from './Tooltip'

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

type HtmlProps = Pick<HTMLProps<HTMLAnchorElement>, any>

export const TabLink = forwardRef<HTMLAnchorElement, Props & HtmlProps>(
	(props, ref) => {
		const { to, exact, disabled, disabledMessage, ...htmlProps } = props

		return props.disabled ? (
			<Tooltip title={props.disabledMessage}>
				{/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
				<a ref={ref} className='disabled-tab' {...htmlProps}>
					{props.children}
				</a>
			</Tooltip>
		) : (
			<NavLink
				ref={ref}
				activeClassName='active'
				to={props.to}
				exact={props.exact}
				{...htmlProps}
			>
				{props.children}
			</NavLink>
		)
	},
)
