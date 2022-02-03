import { FC } from 'react'
import { NavLink, Route, Switch, useLocation } from 'react-router-dom'
import { CognateHydrated } from '../core/cognates'
import { Path } from '../Routes'
import { LangCode } from '../utils/langNames'
import { FormValues } from '../utils/setupQps'
import { CognatesTab } from './CognatesTab'
import { DefinitionTab } from './DefinitionTab'
import { TranslationsTab } from './TranslationsTab'

type Props = {
	lastSubmitted: FormValues
	translations: {
		meaning: string
		trgLang: LangCode
		translations: string[]
	}[]
	cognates: CognateHydrated[]
	word: string
	query: string
	error: Error | null
	suggestTryFlipped: boolean
}

export const Tabs: FC<Props> = ({
	lastSubmitted,
	translations,
	cognates,
	word,
	query,
	error,
	suggestTryFlipped,
}) => {
	const { search } = useLocation()

	return (
		<div className='y-margins'>
			<nav className='tabs'>
				<NavLink
					exact
					activeClassName='active'
					to={Path.Cognates + search}
				>
					Cognates
				</NavLink>
				<NavLink
					exact
					activeClassName='active'
					to={Path.Definition + search}
				>
					Definition
				</NavLink>
				{translations.length ? (
					<NavLink
						exact
						activeClassName='active'
						to={Path.Translations + search}
					>
						Translations
					</NavLink>
				) : null}
			</nav>
			<article>
				<Switch>
					<Route exact path={Path.Cognates}>
						<CognatesTab
							{...{
								cognates,
								lastSubmitted,
								word,
								query,
								error,
								suggestTryFlipped,
							}}
						/>
					</Route>
					<Route exact path={Path.Definition}>
						<DefinitionTab {...{ lastSubmitted }} />
					</Route>
					<Route exact path={Path.Translations}>
						{translations.length ? (
							<TranslationsTab {...{ translations }} />
						) : null}
					</Route>
				</Switch>
			</article>
		</div>
	)
}
