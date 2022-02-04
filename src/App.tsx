import { BrowserRouter as Router } from 'react-router-dom'
import { Footer } from './components/Footer'
import { Routes } from './Routes'

export const App = () => {
	return (
		<Router basename={process.env.PUBLIC_URL}>
			<div className='full-page'>
				<main className='container'>
					<Routes />
				</main>
				<Footer className='container' />
			</div>
		</Router>
	)
}
