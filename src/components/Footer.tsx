import { FC, HtmlHTMLAttributes } from 'react'
import { urls } from '../config'
import buildInfo from '../buildInfo.json'
import { ColorSchemeSwitcher } from './ColorSchemeSwitcher'
import { Tooltip } from './Tooltip'

export const Footer: FC<HtmlHTMLAttributes<HTMLElement>> = ({
	...htmlProps
}) => {
	// just redirect for now

	return (
		<footer {...htmlProps}>
			<hr />
			<div className='footer-text'>
				<small>
					Data from{' '}
					<a
						target='_blank'
						rel='noreferrer noopener'
						href={urls.wiktionaryWeb}
					>
						Wiktionary
					</a>{' '}
					(
					<a
						target='_blank'
						rel='noreferrer noopener'
						href='https://creativecommons.org/licenses/by-sa/3.0/'
					>
						CC BY-SA 3.0
					</a>
					) · Etymology search powered by{' '}
					<a
						target='_blank'
						rel='noreferrer noopener'
						href={urls.etytreeWeb}
					>
						etytree
					</a>{' '}
					(
					<a
						target='_blank'
						rel='noreferrer noopener'
						href='https://opensource.org/licenses/MIT'
					>
						MIT
					</a>
					) · Version{' '}
					<Tooltip title={buildInfo.ts}>
						<code className='build-info'>{buildInfo.hash}</code>
					</Tooltip>
					<ColorSchemeSwitcher />
				</small>
			</div>
		</footer>
	)
}
