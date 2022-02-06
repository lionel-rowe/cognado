import { FC } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Path } from '../Routes'

const LinkOrText: FC<{ isHome: boolean }> = ({ isHome, children }) => {
	return isHome ? (
		<>{children}</>
	) : (
		<Link className='search-header__link' to={Path.Home}>
			{children}
		</Link>
	)
}

export const SearchHeader: FC<{}> = () => {
	const location = useLocation()
	const isHome = location.pathname === Path.Home

	return (
		<header className='search-header'>
			<LinkOrText {...{ isHome }}>
				<h1 className='search-header__main-heading'>
					<img
						src='logo.svg'
						alt=''
						className='search-header__logo'
					/>
					<span className='search-header__main-heading-text'>
						Cognado
					</span>
				</h1>
			</LinkOrText>
			<div className='search-header__subheading'>
				<em>Cognate search</em>
			</div>
		</header>
	)
}
