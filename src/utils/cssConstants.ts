import { isSameOrigin } from './browser'

const cssConstants: Record<string, string | undefined> = {
	...process.env,
	ROOT_URL: window.location.origin + process.env.PUBLIC_URL,
}

const matcher = /%(\w+)%/g

export const injectCssConstants = () => {
	for (const rule of [...document.styleSheets]
		// local stylesheets only
		.filter((sheet) => !sheet.href || isSameOrigin(sheet.href))
		.flatMap((sheet) => [...sheet.cssRules])
		.filter((rule): rule is CSSStyleRule => rule instanceof CSSStyleRule)
		.filter((rule) => matcher.test(rule.selectorText))) {
		rule.selectorText = rule.selectorText.replace(
			matcher,
			(m, name) => cssConstants[name] ?? m,
		)
	}
}
