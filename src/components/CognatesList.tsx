import { FC } from 'react'
import { CognateHydrated } from '../core/cognates'
import { CognateLink } from './CognateLink'

export const CognatesList: FC<{
	cognates: CognateHydrated[]
	pageStart: number
	pageEnd: number
}> = ({ cognates, pageStart, pageEnd }) => {
	return (
		<ul>
			{cognates
				.slice(pageStart, pageEnd)
				.map(({ ancestor, trg, src }, i) => {
					return (
						<li
							className='top-level-li'
							key={[
								i,
								trg[trg.length - 1]?.langCode ?? 'null',
								trg[trg.length - 1]?.word ?? 'null',
							].join('-')}
						>
							<CognateLink
								className='cognate-link--lowlighted'
								srcLang={ancestor.langCode}
								word={ancestor.word}
							/>
							<ul>
								<li>
									{src.flatMap((x, i) => [
										<span key={i - 0.5} className='arrow'>
											{' '}
											→{' '}
										</span>,
										<CognateLink
											key={i}
											srcLang={x.langCode}
											word={x.word}
											className='cognate-link--lowlighted'
										/>,
									])}
								</li>
								<li>
									{trg.flatMap((x, i, a) => [
										<span key={i - 0.5} className='arrow'>
											{' '}
											→{' '}
										</span>,
										i === a.length - 1 ? (
											<CognateLink
												key={i}
												srcLang={x.langCode}
												word={x.word}
												className='cognate-link--highlighted'
											/>
										) : (
											<CognateLink
												key={i}
												srcLang={x.langCode}
												word={x.word}
												className='cognate-link--lowlighted'
											/>
										),
									])}
								</li>
							</ul>
						</li>
					)
				})}
		</ul>
	)
}
