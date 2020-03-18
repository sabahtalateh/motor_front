import { action } from 'typesafe-actions'
import { TextLoadingActions } from './actions'

import { Dispatch } from 'react'
import GraphQLService from '../services/GraphQLService'
import { Text } from '../reducers'

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
                    // console.log(json.data)
                    console.log(json.data.marks)
                    dispatch(textLoaded(json.data.text))
                })
            }
        })
        .catch(err => dispatch(textLoadingError()))
}
