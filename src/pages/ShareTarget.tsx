import { FC, useContext, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { Path, QpsContext } from '../Routes'

export const ShareTarget: FC = () => {
	const history = useHistory()

	const qps = useContext(QpsContext)

	useEffect(() => {
		const shareText = qps.get('shareText')

		const content = shareText?.match(/^"([\s\S]+)"\n\s*https?:\/\/.+$/)?.[1]

		qps.delete('shareText', false)
		qps.set('word', content ?? shareText ?? '', false)

		history.replace({
			pathname: Path.Cognates,
			search: window.location.search,
		})
	}, [history, qps])

	return null
}
