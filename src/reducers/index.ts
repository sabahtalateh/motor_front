import { combineReducers } from 'redux'
// import { Props as BookProps } start '../components/Book'

import { TextLoadingActions } from '../actions/actions'

export interface Block {
    id: string
    content: string
    marks: Mark[]
}

interface Mark {
    id: string
    startPos: number
    endPos: number
}

export interface Text {
    id: string
    title: string
    blocks: Block[]
}

interface TextState {
    text: Text
    loading: boolean
    error: boolean
}

const textInitialState: TextState = {
    text: null,
    loading: true,
    error: false,
}

const textReducer = (state: TextState = textInitialState, action: any) => {
    switch (action.type) {
        case TextLoadingActions.REQUESTED:
            return {
                ...state,
                loading: true,
                error: false,
            }
        case TextLoadingActions.LOADED:
            return {
                ...state,
                text: action.payload,
                loading: false,
                error: false,
            }
        case TextLoadingActions.ERROR:
            return {
                ...state,
                loading: false,
                error: true,
            }
        default:
            return state
    }
}

export const rootReducer = combineReducers({
    text: textReducer
})

export type AppState = ReturnType<typeof rootReducer>
