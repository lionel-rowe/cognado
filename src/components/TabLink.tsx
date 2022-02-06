import clsx from 'clsx'
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

type HtmlProps = Omit<HTMLProps<HTMLAnchorElement>, 'ref'>

export const TabLink = forwardRef<HTMLAnchorElement, Props & HtmlProps>(
	(props, ref) => {
		const { to, exact, disabled, disabledMessage, ...htmlProps } = props

		return props.disabled ? (
			<Tooltip title={props.disabledMessage}>
				{/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
				<a
					ref={ref}
					{...htmlProps}
					className={clsx(['disabled-tab', htmlProps.className])}
				>
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
