import { MyStackActions } from '../actions/actions'

interface MyStackState {
    myStack: string[]
    loading: boolean
    error: boolean
}

const myStackInitialState: MyStackState = {
    myStack: [],
    loading: true,
    error: false,
}

export const myStackReducer = (state: MyStackState = myStackInitialState, action: any) => {
    console.log(action)

    switch (action.type) {
        case MyStackActions.REQUESTED:
            return {
                ...state,
                loading: true,
                error: false,
            }

        case MyStackActions.LOADED:
            return {
                myStack: action.payload,
                loading: false,
                error: false,
            }

        case MyStackActions.ERROR:
            return {
                ...state,
                loading: false,
                error: true,
            }
    }

    return {
        ...state,
    }
}
