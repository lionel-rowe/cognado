import { Link } from 'react-router-dom'
import { Paths } from '../Routes'

export const NotFound = () => {
	return (
		<>
			<h1>Page not found</h1>

			<p>
				<Link to={Paths.Home}>Home</Link>
			</p>
		</>
	)
}
