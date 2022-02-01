export const isTouchDevice = () =>
	window.matchMedia('(pointer: coarse)').matches

// https://developer.mozilla.org/en-US/docs/Web/HTTP/Browser_detection_using_the_user_agent#mobile_tablet_or_desktop
export const isMobile = () => navigator.userAgent.includes('Mobi')
