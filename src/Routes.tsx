import { createContext, useState } from 'react'
import { Switch, Route, useHistory } from 'react-router-dom'
import { Search } from './pages/Search'
import { ShareTarget } from './pages/ShareTarget'
import { Qps, initQps } from './utils/setupQps'

export const QpsContext = createContext<Qps>(initQps())

export const Routes = () => {
	const history = useHistory()

	const [qps] = useState<Qps>(() => initQps(history))

	return (
		<QpsContext.Provider value={qps}>
			<Switch>
				<Route exact path='/'>
					<Search />
				</Route>
				<Route exact path='/share-target'>
					<ShareTarget />
				</Route>
			</Switch>
		</QpsContext.Provider>
	)
}
