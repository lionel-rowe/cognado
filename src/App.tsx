import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import { Search } from './pages/Search'
import { ShareTarget } from './pages/ShareTarget'

export const App = () => {
	return (
		<Router basename={process.env.PUBLIC_URL}>
			<Switch>
				<Route exact path='/'>
					<Search />
				</Route>
				<Route exact path='/share-target'>
					<ShareTarget />
				</Route>
			</Switch>
		</Router>
	)
}
