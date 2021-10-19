import { CognateHydrated } from '../core/cognates'
import { Link } from './Link'

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
							<Link {...ancestor} />
							<ul>
								<li>
									{src.flatMap((x, i) => [
										' → ',
										<Link key={i} {...x} />,
									])}
								</li>
								<li>
									{trg.flatMap((x, i, a) => [
										' → ',
										i === a.length - 1 ? (
											<Link
												key={i}
												className='bold'
												{...x}
											/>
										) : (
											<Link key={i} {...x} />
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
