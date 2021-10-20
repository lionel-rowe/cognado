import { CognateHydrated } from '../core/cognates'
import { CognateLink } from './CognateLink'

export const CognatesList = ({
	cognates,
	pageStart,
	pageEnd,
}: {
	cognates: CognateHydrated[]
	pageStart: number
	pageEnd: number
}) => {
	return (
		<ul>
			{cognates
				.slice(pageStart, pageEnd)
				.map(({ ancestor, trg, src }, i) => {
					return (
						<li
							className='top-level-li'
							key={`${i}-${trg[trg.length - 1]?.url}`}
						>
							<CognateLink {...ancestor} />
							<ul>
								<li>
									{src.flatMap((x, i) => [
										' → ',
										<CognateLink key={i} {...x} />,
									])}
								</li>
								<li>
									{trg.flatMap((x, i, a) => [
										' → ',
										i === a.length - 1 ? (
											<CognateLink
												key={i}
												className='bold'
												{...x}
											/>
										) : (
											<CognateLink key={i} {...x} />
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
