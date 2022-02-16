import { Link } from 'react-router-dom'
import { Title } from '../components/Title'
import { Path } from '../Routes'

export const NotFound = () => {
	return (
		<>
			<Title title='Page Not Found' />
			<h1>Page Not Found</h1>

			<p>
				<Link to={Path.Home}>Home</Link>
			</p>
		</>
	)
}
