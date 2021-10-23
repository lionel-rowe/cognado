import './styles.css'
import { render } from 'react-dom'
import { App } from './App'
import { exposeGlobals } from './debug'
import * as serviceWorkerRegistration from './serviceWorkerRegistration'

render(<App />, document.getElementById('root'))

exposeGlobals()

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register()
