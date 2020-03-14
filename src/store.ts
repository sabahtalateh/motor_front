import { createStore } from 'redux'

import { rootReducer } from './reducers'

// @ts-ignore
export const store = createStore(
    rootReducer,
    (<any>window).__REDUX_DEVTOOLS_EXTENSION__ && (<any>window).__REDUX_DEVTOOLS_EXTENSION__()
)
