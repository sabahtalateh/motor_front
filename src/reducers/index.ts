import { combineReducers } from 'redux'
import { textReducer } from './text'
import { myStackReducer } from './myStack'
import { authReducer } from './authReducer'

export const rootReducer = combineReducers({
    text: textReducer,
    myStack: myStackReducer,
    auth: authReducer,
})

export type AppState = ReturnType<typeof rootReducer>
