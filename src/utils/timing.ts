export const sleep = (ms: number) =>
	new Promise<void>((res) => setTimeout(res, ms))

export const timeOutAfter = (ms: number, message?: string) =>
	new Promise<never>((_, rej) =>
		setTimeout(() => rej(new Error(message)), ms),
	)

export const nextAnimationFrame = () =>
	new Promise<number>((res) => requestAnimationFrame(res))
