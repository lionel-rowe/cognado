export const isLink = (target: EventTarget): target is HTMLAnchorElement =>
	(target as HTMLElement)?.matches?.('a[href]')

export const isSameOrigin = (url: string) =>
	new URL(url).origin === window.location.origin
