import { action } from 'typesafe-actions'
import { MyStackActions } from '../actions'
import { Dispatch } from 'react'
import GraphQLService from '../../services/GraphQLService'
import { Token } from '../../reducers/auth'
import { StackItem } from '../../components/Stack/MyStackList'

const myStackRequested = () => action(MyStackActions.REQUESTED)
const myStackLoaded = (stack: StackItem[]) => action(MyStackActions.LOADED, stack)
const myStackLoadingError = () => action(MyStackActions.ERROR)

export const fetchMyStack = (dispatch: Dispatch<any>, graphQLService: GraphQLService) => (token: Token) => {
    dispatch(myStackRequested())

    graphQLService.myStack(token, dispatch).then(r => {
        dispatch(myStackLoaded(r.myStack))
    })
}




