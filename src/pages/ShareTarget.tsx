import { useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { qps } from '../utils/setupQps'

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
