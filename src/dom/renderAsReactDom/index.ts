import { mapDomToReact } from './mapDomToReact'
import { parseStringToDom } from './parseStringToDom'

export type DomNodeToReactParser = (node: Node) => JSX.Element | null

export const renderAsReactDom =
	(parser: DomNodeToReactParser) => (text: string) =>
		parseStringToDom(text).map(mapDomToReact(parser))
