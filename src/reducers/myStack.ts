import { Text } from './text'
import { MyStackActions } from '../actions/actions'

interface MyStackState {
    stack: string[]
    loading: boolean
    error: boolean
}

const myStackInitialState: MyStackState = {
    stack: [],
    loading: true,
    error: false,
}

export const myStackReducer = (state: MyStackState = myStackInitialState, action: any) => {
    console.log(action)

    switch (action.type) {
        case MyStackActions.LOADED:
            return {
                ...state,
                stack: action.payload,
            }
    }

    return {
        ...state,
    }
    // switch (action.type) {
    // }
}
