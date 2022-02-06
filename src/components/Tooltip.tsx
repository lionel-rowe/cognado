import { FC, HTMLProps, ReactElement } from 'react'
import { Tooltip as MuiTooltip } from '@mui/material'
import clsx from 'clsx'
import Fade from '@mui/material/Fade'

export type ReactEventName = `on${Capitalize<string>}` &
	keyof React.DOMAttributes<HTMLAnchorElement>

type Props = {
	children: ReactElement<any, any>
	open?: boolean
	arrow?: boolean
	enterTouchDelay?: number
} & Pick<HTMLProps<HTMLElement>, 'title' | 'className' | 'id' | ReactEventName>

export const Tooltip: FC<Props> = ({
	children,
	title,
	className,
	open,
	arrow,
	enterTouchDelay,
	...htmlProps
}) => {
	return (
		<MuiTooltip
			componentsProps={{
				tooltip: {
					className: clsx([
						'tooltip',
						arrow && 'tooltip--has-arrow',
						className,
					]),
				},
				arrow: { className: 'tooltip__arrow' },
			}}
			// must use `Fade` or no transition, otherwise
			// doesn't play nicely with CSS hack to fix blurring
			TransitionComponent={Fade}
			title={title ?? ''}
			enterTouchDelay={enterTouchDelay ?? 0}
			{...{ arrow, open }}
			{...htmlProps}
		>
			{children}
		</MuiTooltip>
	)
}
