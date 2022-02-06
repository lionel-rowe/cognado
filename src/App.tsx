import { BrowserRouter as Router } from 'react-router-dom'
import { Footer } from './components/Footer'
import { Routes } from './Routes'
import { GitHubCorner } from './components/GitHubCorner'
import { urls } from './config'
import { RootErrorBoundary } from './components/RootErrorBoundary'
import { Tooltip } from './components/Tooltip'

export const App = () => {
	return (
		<RootErrorBoundary>
			<Router basename={process.env.PUBLIC_URL}>
				<div className='full-page'>
					<Tooltip title='See project on GitHub'>
						<GitHubCorner
							target='_blank'
							rel='noreferrer noopener'
							href={urls.github}
						/>
					</Tooltip>
					<main className='container'>
						<Routes />
					</main>
					<Footer className='container' />
				</div>
			</Router>
		</RootErrorBoundary>
	)
}
