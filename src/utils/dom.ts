export const suppressPopovers = (e: KeyboardEvent) => {
	if (e.key === 'Escape') {
		document.body.classList.add('suppress-popovers')
	}
}

export const unsuppressPopovers = () => {
	document.body.classList.remove('suppress-popovers')
}
