import { EditStackActions } from '../actions/actions'
import { StackItem } from '../components/Stack/MyStackList'

interface NewStackItemState {
    updateRequested: boolean

    updateSuccess: boolean
    updatedItem: StackItem

    updateFailed: boolean
}

const myStackInitialState: NewStackItemState = {
    updateRequested: false,

    updateSuccess: false,
    updatedItem: null,

    updateFailed: false
}

export const newStackItemReducer = (state: NewStackItemState = myStackInitialState, action: any) => {
    switch (action.type) {
        case EditStackActions.UPDATE_REQUESTED:
            return {
                updateRequested: true,
                updateSuccess: false,
                updatedItem: null,
                updateFailed: false
            }
        case EditStackActions.UPDATE_SUCCESS:
            return {
                updateRequested: false,
                updateSuccess: true,
                updatedItem: action.payload,
                updateFailed: false
            }
    }

    return {
        ...state,
    }
}
