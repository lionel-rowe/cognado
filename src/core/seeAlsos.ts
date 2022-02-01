export const parseSeeAlsos = (text: string) =>
	(text.match(/{{(also(?:\|[^|}]+)+)}}/)?.[1] ?? '')
		.split('|')
		.slice(1)
		// remove special pages
		.filter((x) => !/[:/]/.test(x))
		// ignore anything that couldn't be parsed
		.filter(Boolean)
