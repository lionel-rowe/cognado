import { Link } from 'react-router-dom'
import { Path } from '../Routes'

export const NotFound = () => {
	return (
		<>
			<h1>Page Not Found</h1>

			<p>
				<Link to={Path.Home}>Home</Link>
			</p>
		</>
	)
}
