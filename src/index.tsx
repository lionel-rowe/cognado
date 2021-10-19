import './styles.css'
import { render } from 'react-dom'
import { App } from './App'
import { exposeGlobals } from './debug'

const rootElement = document.getElementById('root')
render(<App />, rootElement)

exposeGlobals()
