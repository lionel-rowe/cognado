import { createContext, useState } from 'react'
import { Switch, Route, useHistory } from 'react-router-dom'
import { Home } from './pages/Home'
import { NotFound } from './pages/NotFound'
import { SearchResults } from './pages/SearchResults'
import { ShareTarget } from './pages/ShareTarget'
import { Qps, initQps } from './utils/setupQps'

export const QpsContext = createContext<Qps>(initQps())

export enum Paths {
	Home = '/',
	ShareTarget = '/share-target',
	Cognates = '/cognates',
	Definition = '/definition',
}

export const Routes = () => {
	const history = useHistory()

	const [qps] = useState<Qps>(() => initQps(history))

	return (
		<QpsContext.Provider value={qps}>
			<Switch>
				<Route exact path={Paths.Home}>
					<Home />
				</Route>
				<Route exact path={Paths.ShareTarget}>
					<ShareTarget />
				</Route>
				<Route path={[Paths.Cognates, Paths.Definition]}>
					<SearchResults />
				</Route>
				<Route path='*'>
					<NotFound />
				</Route>
			</Switch>
		</QpsContext.Provider>
	)
}
