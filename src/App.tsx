import { BrowserRouter as Router } from 'react-router-dom'
import { Footer } from './components/Footer'
import { Routes } from './Routes'
import { GitHubCorner } from './components/GitHubCorner'
import { urls } from './config'

export const App = () => {
	return (
		<Router basename={process.env.PUBLIC_URL}>
			<div className='full-page'>
				<GitHubCorner
					target='_blank'
					title='See project on GitHub'
					rel='noreferrer noopener'
					href={urls.github}
				/>
				<main className='container'>
					<Routes />
				</main>
				<Footer className='container' />
			</div>
		</Router>
	)
}
