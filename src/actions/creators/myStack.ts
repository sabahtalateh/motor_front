import { action } from 'typesafe-actions'
import { MyStackActions } from '../actions'
import { Dispatch } from 'react'
import GraphQLService from '../../services/GraphQLService'
import { Token } from '../../reducers/auth'

const myStackRequested = () => action(MyStackActions.REQUESTED)
const myStackLoaded = (stack: string[]) => action(MyStackActions.LOADED, stack)
const myStackLoadingError = () => action(MyStackActions.ERROR)

export const fetchMyStack = (dispatch: Dispatch<any>, graphQLService: GraphQLService) => (token: Token) => {
    dispatch(myStackRequested())

    graphQLService.myStack(token, dispatch).then(r => {
        console.log('STCK', r)
    })

    // graphQLService.myStack(access)
    //     .then(resp => {
    //         if (!resp.ok) {
    //             dispatch(myStackLoadingError())
    //         } else {
    //             resp.json().then((json: any) => {
    //                 dispatch(myStackLoaded(json.data.myStack))
    //             })
    //         }
    //     })
    //     .catch(err => dispatch(myStackLoadingError()))
}
