import { pipe } from 'fp-ts/lib/function'
import { FC, Fragment, useState } from 'react'
import { Link } from 'react-router-dom'
import { makeCognateFinderUrl, toRelativeUrl } from '../utils/formatters'
import { getLangName, LangCode } from '../utils/langNames'
import { uniq } from '../utils/uniq'

type Example = {
	word: string
	srcLang: LangCode
	trgLang: LangCode
}

const toExample =
	(srcLang: LangCode, trgLang: LangCode) =>
	(word: string): Example => ({ word, srcLang, trgLang })

const examples: Example[] = [
	['dedo', 'cuello', 'fuerte', 'hablar', 'puente', 'palabra'].map(
		toExample('spa', 'eng'),
	),
	['demonstrate', 'hibernate', 'hospital'].map(toExample('eng', 'spa')),
	['moins', 'vie'].map(toExample('fra', 'eng')),
	['Brot', 'Nacht'].map(toExample('deu', 'eng')),
].flat()

const getRandomExamples = (n: number) =>
	pipe(
		examples,
		(xs) => xs.sort(() => Math.random() - 0.5),
		uniq((x) => x.srcLang),
		(xs) => xs.slice(0, n),
	)

export const ExampleLinks: FC<{}> = () => {
	const [examples] = useState(() => getRandomExamples(3))

	return (
		<div className='example-links grayed-out'>
			Or try an example:{' '}
			{examples.map(({ word, srcLang, trgLang }, idx, arr) => (
				<Fragment key={idx}>
					<Link
						to={pipe(
							makeCognateFinderUrl({
								word,
								srcLang,
								trgLang,
							}),
							toRelativeUrl,
						)}
					>
						<em>{word}</em> ({getLangName(srcLang)})
					</Link>
					{idx === arr.length - 1 ? null : ', '}
				</Fragment>
			))}
		</div>
	)
}
