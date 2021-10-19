import { HTMLProps, SVGProps } from 'react'
import './GitHubCorner.css'

// modified from https://github.com/skratchdot/react-github-corner

export const GitHubCorner = ({
	octoBannerProps,
	octoArmProps,
	octoBodyProps,
	title,
	rtl,
	...linkProps
}: HTMLProps<HTMLAnchorElement> & {
	href: string
	rtl?: boolean
	svgProps?: SVGProps<SVGElement>
	octoBannerProps?: SVGProps<SVGPathElement>
	octoArmProps?: SVGProps<SVGPathElement>
	octoBodyProps?: SVGProps<SVGPathElement>
}) => {
	const rtlStyles = rtl
		? {
				right: undefined,
				left: 0,
				transform: 'scaleX(-1)',
		  }
		: {}

	return (
		<div>
			<svg
				width='80'
				height='80'
				viewBox='0 0 250 250'
				style={{
					position: 'absolute',
					top: 0,
					fill: 'rgb(255, 255, 255)',
					right: 0,
					...rtlStyles,
				}}
			>
				<a {...linkProps} className='github-corner'>
					<title>{title}</title>

					{/* click target */}
					<path d='M 0 0 L 250 250 V 0 Z' fill='#0000'></path>

					<path
						d='M0 0l115 115h15l12 27 108 108V0z'
						fill='#151513'
						style={{
							pointerEvents: 'none',
						}}
						{...octoBannerProps}
					></path>

					<path
						className='octo-arm'
						d='M128 109c-15-9-9-19-9-19 3-7 2-11 2-11-1-7 3-2 3-2 4 5 2 11 2 11-3 10 5 15 9 16'
						fill='#fff'
						style={{
							transformOrigin: '130px 106px',
							pointerEvents: 'none',
						}}
						{...octoArmProps}
					></path>
					<path
						d='M115 115s4 2 5 0l14-14c3-2 6-3 8-3-8-11-15-24 2-41 5-5 10-7 16-7 1-2 3-7 12-11 0 0 5 3 7 16 4 2 8 5 12 9s7 8 9 12c14 3 17 7 17 7-4 8-9 11-11 11 0 6-2 11-7 16-16 16-30 10-41 2 0 3-1 7-5 11l-12 11c-1 1 1 5 1 5z'
						fill='#fff'
						style={{
							pointerEvents: 'none',
						}}
						{...octoBodyProps}
					></path>
				</a>
			</svg>
		</div>
	)
}
