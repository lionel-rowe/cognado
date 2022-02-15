import { BrowserRouter as Router } from 'react-router-dom'
import { Footer } from './components/Footer'
import { Routes } from './Routes'
import { GitHubCorner } from './components/GitHubCorner'
import { urls } from './config'
import { RootErrorBoundary } from './components/RootErrorBoundary'
import { Tooltip } from './components/Tooltip'
import { Title } from './components/Title'

export const App = () => {
	return (
		<RootErrorBoundary>
			<Title />
			<Router basename={process.env.PUBLIC_URL}>
				<div className='full-page'>
					<Tooltip
						title='View project on GitHub'
						enterTouchDelay={300}
					>
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
