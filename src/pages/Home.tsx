import { Redirect } from 'react-router-dom'
import { Path } from '../Routes'

export const Home = () => {
	// just redirect for now

	return <Redirect to={Path.Cognates} />
}
