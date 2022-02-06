import { FC, useEffect, useState } from 'react'
import { Route, Switch, useLocation } from 'react-router-dom'
import { CognateHydrated } from '../core/cognates'
import { Path } from '../Routes'
import { LangCode } from '../utils/langNames'
import { FormValues } from '../utils/setupQps'
import { CognatesTab } from './CognatesTab'
import { DefinitionTab } from './DefinitionTab'
import { TabLink } from './TabLink'
import { TranslationsTab } from './TranslationsTab'
import { Tooltip } from './Tooltip'
import { LangPair, ls } from '../utils/ls'

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
	suggestedLangPairs: LangPair[]
	definition: string | null
}

export const Tabs: FC<Props> = ({
	lastSubmitted,
	translations,
	cognates,
	word,
	query,
	error,
	suggestedLangPairs,
	definition,
}) => {
	const { search } = useLocation()

	const [open, setOpen] = useState(false)

	const dismissTooltip = () => {
		ls.cognatesTooltipDismissed = true
		setOpen(false)
	}

	useEffect(() => {
		if (!ls.cognatesTooltipDismissed) {
			setOpen(Boolean(cognates.length))
		}
	}, [cognates])

	return (
		<div className='y-margins tabs-outer'>
			<nav className='tabs'>
				<TabLink exact to={Path.Definition + search}>
					Definition
				</TabLink>

				<Tooltip
					open={open}
					arrow
					title={open ? 'Cognates found! Click here to view' : ''}
					className='tooltip--emphasized'
					onClick={dismissTooltip}
				>
					<TabLink
						exact
						to={Path.Cognates + search}
						disabled={!cognates.length}
						disabledMessage='No cognates found'
					>
						Cognates
					</TabLink>
				</Tooltip>
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
							{...{
								definition,
								lastSubmitted,
								suggestedLangPairs,
							}}
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
