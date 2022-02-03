export const parseStringToDom = (str: string) => {
	const dom = new DOMParser().parseFromString(str, 'text/html')

	return [...dom.body.childNodes]
}
