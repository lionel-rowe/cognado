import { Fragment } from 'react'
import { DomNodeToReactParser } from '.'

const isTextNode = (node: Node): node is Text =>
	node.nodeType === Node.TEXT_NODE

const isHtmlElementNode = (node: Node): node is HTMLElement =>
	node.nodeType === Node.ELEMENT_NODE

// todo: use more sophisticated allow-list logic
const allowedAttrs = [
	'href',
	'title',
	'target',
	'rel',
	'lang',
	'class',
	'about',
	'id',
	'typeof',
	'data-mw',
]

export const mapDomToReact = (parseCustomNode: DomNodeToReactParser) => {
	const mapDomToReact_ = (node: Node, idx: number) => {
		if (isTextNode(node)) {
			return <Fragment key={idx}>{node.data}</Fragment>
		} else if (isHtmlElementNode(node)) {
			const customNode = parseCustomNode(node)

			if (customNode) return customNode

			const El = node.nodeName.toLowerCase()

			try {
				const props: Record<string, string> = {}

				for (const { name, value } of node.attributes) {
					if (allowedAttrs.includes(name)) {
						props[name] = value
					} else {
						console.info('Attribute blocked: ', name, value)
					}
				}

				return node.textContent ? (
					<El key={idx} {...(props as any)}>
						{[...node.childNodes].map((n, i) =>
							mapDomToReact_(n, i),
						)}
					</El>
				) : (
					<El key={idx} {...props} />
				)
			} catch (e) {
				console.error(e)

				return node.innerHTML ? (
					<El
						key={idx}
						{...{
							dangerouslySetInnerHTML: { __html: node.innerHTML },
						}}
					/>
				) : (
					<El key={idx} />
				)
			}
		} else {
			return <></>
		}
	}

	return mapDomToReact_
}
