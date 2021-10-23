import { useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { qps } from '../utils/setupQps'

// console.log(
// 	`http://172.18.246.138:3001/cognate-finder/share-target?shareText=%22culinary%22%0A+https%3A%2F%2Fwww.google.com%2Fsearch%3Fq%3Dpuebla%26oq%3Dpuebla%26aqs%3Dchrome..69i57j46i433i512j69i60l3.1838j0j7%26sourceid%3Dchrome-mobile%26ie%3DUTF-8%23%3A~%3Atext%3Dknown%2520for%2520its-%2Cculinary%2C-history%252C%2520colonial%2520architecture`
// )

export const ShareTarget = () => {
	const history = useHistory()

	useEffect(() => {
		const shareText = qps.get('shareText')

		const content = shareText?.match(/^"([\s\S]+)"\n\s*https?:\/\/.+$/)?.[1]

		qps.delete('shareText', false)
		qps.set('word', content ?? shareText ?? '', false)

		history.replace({
			pathname: '/',
			search: window.location.search,
		})
	}, [history])

	return null
}
