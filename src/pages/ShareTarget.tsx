import { FC, useContext, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { Title } from '../components/Title'
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
			pathname: Path.Definition,
			search: window.location.search,
		})
	}, [history, qps])

	return <Title title='Redirecting...' />
}
