import * as React from 'react'
import * as ReactDOM from 'react-dom'

import { App } from './components/App'
import { HashRouter as Router } from 'react-router-dom'
import { store } from './store'
import { Provider } from 'react-redux'

ReactDOM.render(
    <Provider store={ store }>
        <Router>
            <App/>
        </Router>
    </Provider>,
    document.getElementById('root')
)
