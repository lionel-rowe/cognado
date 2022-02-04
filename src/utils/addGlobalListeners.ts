export const addGlobalListeners = () => {
	// always scroll to top when internal link clicked to avoid jank
	document.body.addEventListener('click', (e) => {
		if (
			e.target instanceof HTMLAnchorElement &&
			e.target.href &&
			!e.target.target
		) {
			window.scrollTo(0, 0)
		}
	})
}
