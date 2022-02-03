import { createContext, useState } from 'react'
import { Switch, Route, useHistory } from 'react-router-dom'
import { Home } from './pages/Home'
import { NotFound } from './pages/NotFound'
import { SearchResults } from './pages/SearchResults'
import { ShareTarget } from './pages/ShareTarget'
import { pseudoHistory } from './utils/qps'
import { Qps, initQps } from './utils/setupQps'

export const QpsContext = createContext<Qps>(
	initQps(pseudoHistory(new URL(window.location.href))),
)

export enum Path {
	Home = '/',
	ShareTarget = '/share-target',
	Cognates = '/cognates',
	Definition = '/definition',
	Translations = '/translations',
}

export const Routes = () => {
	const history = useHistory()

	const [qps] = useState<Qps>(() => initQps(history))

	return (
		<QpsContext.Provider value={qps}>
			<Switch>
				<Route exact path={Path.Home}>
					<Home />
				</Route>
				<Route exact path={Path.ShareTarget}>
					<ShareTarget />
				</Route>
				<Route
					path={[Path.Definition, Path.Cognates, Path.Translations]}
				>
					<SearchResults />
				</Route>
				<Route path='*'>
					<NotFound />
				</Route>
			</Switch>
		</QpsContext.Provider>
	)
}
