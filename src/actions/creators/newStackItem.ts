import { Dispatch } from 'react'
import GraphQLService from '../../services/GraphQLService'
import { Token } from '../../reducers/auth'
import { action } from 'typesafe-actions'
import { MyStackActions, EditStackActions } from '../actions'
import { StackItem } from '../../components/Stack/MyStackList'

const updateMyStackRequested = () => action(EditStackActions.UPDATE_REQUESTED)
const addToMyStackSuccess = (stackItem: StackItem) => action(EditStackActions.UPDATE_SUCCESS, stackItem)
// const myStackLoadingError = () => action(MyStackActions.ERROR)



export const saveToMyStack = (dispatch: Dispatch<any>, graphQLService: GraphQLService) => (token: Token, stackItem: StackItem) => {
    dispatch(updateMyStackRequested())

    // graphQLService.myStackAdd(token, stackItem, dispatch).then(d => {
    //     dispatch(addToMyStackSuccess(d.myStackAdd))

        // console.log(d)

        // addToMyStackSuccess({
        //     id:
        // })
        // console.log(d)
    // })

}

export const editStackItem = (dispatch: Dispatch<any>, graphQLService: GraphQLService) => (token: Token, stackItem: StackItem) => {
    dispatch(updateMyStackRequested())


    console.log(stackItem)
}
