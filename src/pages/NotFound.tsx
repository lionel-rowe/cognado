import { Link } from 'react-router-dom'
import { Path } from '../Routes'

export const NotFound = () => {
	return (
		<>
			<h1>Page not found</h1>

			<p>
				<Link to={Path.Home}>Home</Link>
			</p>
		</>
	)
}
