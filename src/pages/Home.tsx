import { Redirect } from 'react-router-dom'
import { Paths } from '../Routes'

export const Home = () => {
	// just redirect for now

	return <Redirect to={Paths.Cognates} />
}
