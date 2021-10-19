import { Component } from 'react'

type Props = {}
type State = {
	hasError: boolean
}

export class RootErrorBoundary extends Component<{}, State> {
	constructor(props: Props) {
		super(props)

		this.state = { hasError: false }
	}

	static getDerivedStateFromError(e: any) {
		console.error(e)

		return { hasError: true }
	}

	componentDidCatch(e: any, errorInfo: any) {
		console.error(e, errorInfo)
	}

	render() {
		if (this.state.hasError) {
			return (
				<>
					<h1>Something went wrong.</h1>
					<p>
						<a
							href={process.env.PUBLIC_URL}
							onClick={() => localStorage.clear()}
						>
							Back to home page
						</a>
					</p>
				</>
			)
		}

		return this.props.children
	}
}
