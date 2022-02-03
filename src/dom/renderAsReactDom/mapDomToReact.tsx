import { Fragment } from 'react'
import { DomNodeToReactParser } from '.'
import { kebabToCamel } from '../../utils/formatters'

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
	'data-mw-deduplicate',
]

const reactProps: Record<string, string> = {
	class: 'className',
}

export const mapDomToReact = (parseCustomNode: DomNodeToReactParser) => {
	const mapDomToReact_ = (node: Node) => {
		if (isTextNode(node)) {
			return <Fragment>{node.data}</Fragment>
		} else if (isHtmlElementNode(node)) {
			const customNode = parseCustomNode(node)

			if (customNode) return customNode

			const El = node.nodeName.toLowerCase()

			try {
				const props: Record<string, string> = {}

				for (const { name, value } of node.attributes) {
					if (allowedAttrs.includes(name)) {
						props[reactProps[name] ?? name] = value
					} else if (name === 'style') {
						const style = Object.fromEntries(
							value
								.split(';')
								.map((x) =>
									x
										.trim()
										.split(':')
										.map((y, i) =>
											i
												? y.trim()
												: kebabToCamel(y.trim()),
										),
								)
								.filter(Boolean),
						)

						props.style = style as string
					} else {
						console.info('Attribute blocked: ', name, value)
					}
				}

				return node.textContent ? (
					<El {...(props as any)}>
						{[...node.childNodes].map((n, i) => (
							<Fragment key={i}>{mapDomToReact_(n)}</Fragment>
						))}
					</El>
				) : (
					<El {...props} />
				)
			} catch (e) {
				console.error(e)

				return node.innerHTML ? (
					<El
						{...({
							dangerouslySetInnerHTML: { __html: node.innerHTML },
						} as any)}
					/>
				) : (
					<El />
				)
			}
		} else {
			return <></>
		}
	}

	return mapDomToReact_
}
