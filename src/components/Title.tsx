import { Helmet } from 'react-helmet'

const APP_TITLE = 'Cognado'
const APP_TITLE_DELIMITER = ' - '

export const Title: React.FC<{}> = ({ children }) => {
	return (
		<Helmet>
			<title>
				{[children, APP_TITLE].flatMap((x, i, a) =>
					!x
						? []
						: i === a.length - 1
						? [x]
						: [x, APP_TITLE_DELIMITER],
				)}
			</title>
		</Helmet>
	)
}
