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
]

const isAllowedAttr = (attr: string, value: string) => {
	return allowedAttrs.includes(attr)
		|| attr.startsWith('data-')
}

const reactProps: Record<string, string> = {
	class: 'className',
}

const styleStrToObj = (style: string) =>
	Object.fromEntries(
		style
			.split(';')
			.map(
				(x) =>
					x
						.trim()
						.split(':')
						.map((y, i) =>
							i
								? y.trim()
								: kebabToCamel(
										y.trim(),
									),
						) as [
						string,
						string | undefined,
					],
			)
			.filter(Boolean),
	)

type StyleObj = ReturnType<typeof styleStrToObj>

export const mapDomToReact = (parseCustomNode: DomNodeToReactParser) => {
	const mapDomToReact_ = (node: Node) => {
		if (isTextNode(node)) {
			return <Fragment>{node.data}</Fragment>
		} else if (isHtmlElementNode(node)) {
			const customNode = parseCustomNode(node)

			if (customNode) return customNode

			const El = node.nodeName.toLowerCase()

			try {
				const props: Record<string, string | StyleObj> = {}

				for (const { name, value } of node.attributes) {
					if (isAllowedAttr(name, value)) {
						props[reactProps[name] ?? name] = value
					} else if (name === 'style') {
						props.style = styleStrToObj(value)
					} else {
						console.warn('Attribute blocked: ', name, value)
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
