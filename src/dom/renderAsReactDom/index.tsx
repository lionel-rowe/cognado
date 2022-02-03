import { Fragment } from 'react'
import { mapDomToReact } from './mapDomToReact'
import { parseStringToDom } from './parseStringToDom'

export type DomNodeToReactParser = (node: Node) => JSX.Element | null

export const renderAsReactDom = (parser: DomNodeToReactParser) => {
	const mapper = mapDomToReact(parser)

	return (text: string) =>
		parseStringToDom(text).map((x, i) => (
			<Fragment key={i}>{mapper(x)}</Fragment>
		))
}
