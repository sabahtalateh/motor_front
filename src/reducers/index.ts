import { combineReducers } from 'redux'
import { textReducer } from './text'
import { myStackReducer } from './myStack'
import { authReducer } from './auth'
import { newStackItemReducer } from './newStackItem'

export const rootReducer = combineReducers({
    text: textReducer,
    myStack: myStackReducer,
    auth: authReducer,
    newStackItem: newStackItemReducer,
})

export type AppState = ReturnType<typeof rootReducer>
