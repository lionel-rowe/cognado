import { FC } from 'react'
import { Route, Switch, useLocation } from 'react-router-dom'
import { CognateHydrated } from '../core/cognates'
import { Path } from '../Routes'
import { LangCode } from '../utils/langNames'
import { FormValues } from '../utils/setupQps'
import { CognatesTab } from './CognatesTab'
import { DefinitionTab } from './DefinitionTab'
import { TabLink } from './TabLink'
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
				<TabLink exact to={Path.Definition + search}>
					Definition
				</TabLink>
				<TabLink
					exact
					to={Path.Cognates + search}
					disabled={!cognates.length}
					disabledMessage='No cognates found'
				>
					Cognates
				</TabLink>
				<TabLink
					exact
					to={Path.Translations + search}
					disabled={!translations.length}
					disabledMessage='No translations found'
				>
					Translations
				</TabLink>
			</nav>
			<article translate='no'>
				<Switch>
					<Route exact path={Path.Definition}>
						<DefinitionTab
							{...{ lastSubmitted, suggestTryFlipped }}
						/>
					</Route>
					<Route exact path={Path.Cognates}>
						{cognates.length ? (
							<CognatesTab
								{...{
									cognates,
									lastSubmitted,
									word,
									query,
									error,
								}}
							/>
						) : null}
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
