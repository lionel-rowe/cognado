import { BrowserRouter as Router } from 'react-router-dom'
import { Routes } from './Routes'

export const App = () => {
	return (
		<Router basename={process.env.PUBLIC_URL}>
			<main className='container' translate='no'>
				<Routes />
			</main>
		</Router>
	)
}
