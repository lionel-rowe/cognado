/* can't use `chota.min.css` due to CRA transpiling bug */
import './vendor/chota.100.css'
/* import `styles.css` after `chota.css`to override definedvars */
import './styles.css'
/* import `overrides.css` last to give precedence over component styles */
import './overrides.css'
import { render } from 'react-dom'
import { App } from './App'
import { exposeGlobals } from './debug'
import buildInfo from './buildInfo.json'

import { injectCssConstants } from './utils/cssConstants'
import * as serviceWorkerRegistration from './serviceWorkerRegistration'
import { initViewportHeightAdjuster } from './utils/viewportHeightAdjuster'
import { addGlobalListeners } from './utils/addGlobalListeners'

exposeGlobals()
injectCssConstants()
initViewportHeightAdjuster()
addGlobalListeners()

render(<App />, document.getElementById('root'))

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register()

console.info(`Build ${buildInfo.hash}\n${buildInfo.ts}`)
