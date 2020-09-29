import { action } from 'typesafe-actions'
import { AuthActions, MyStackActions, TextLoadingActions } from '../actions'

import { Dispatch } from 'react'
import GraphQLService from '../../services/GraphQLService'
import { Text } from '../../reducers/text'

const textLoaded = (text: Text) => action(TextLoadingActions.LOADED, text)
const textRequested = () => action(TextLoadingActions.REQUESTED)
const textLoadingError = () => action(TextLoadingActions.ERROR)

export const fetchText = (dispatch: Dispatch<any>, graphQLService: GraphQLService) => (id: string) => {
    dispatch(textRequested())
    graphQLService
        .text(id)
        .then(resp => {
            if (!resp.ok) {
                dispatch(textLoadingError())
            } else {
                resp.json().then((json: any) => {
                    console.log(json.data.marks)
                    dispatch(textLoaded(json.data.text))
                })
            }
        })
        .catch(err => dispatch(textLoadingError()))
}

const myStackRequested = () => action(MyStackActions.REQUESTED)
const myStackLoaded = (stack: string[]) => action(MyStackActions.LOADED, stack)
const myStackLoadingError = () => action(MyStackActions.ERROR)

export const fetchMyStack = (dispatch: Dispatch<any>, graphQLService: GraphQLService) => (access: string) => {
    console.log('jjjj')

    dispatch(myStackRequested())
    graphQLService.myStack(access)
        .then(resp => {
            if (!resp.ok) {
                dispatch(myStackLoadingError())
            } else {
                resp.json().then((json: any) => {
                    dispatch(myStackLoaded(json.data.myStack))
                })
            }
        })
        .catch(err => dispatch(myStackLoadingError()))
}

